import { prepareRussianSpeechText } from './voiceQuality';

export type VoiceEngine='studio'|'system';
export type StoredVoiceSettings={engine:VoiceEngine;voiceURI?:string;rate:number};

export const VOICE_SETTINGS_KEY='mathnikita-voice-settings-v4';
export const LEGACY_VOICE_SETTINGS_KEY='mathnikita-voice-settings-v3';
export const STUDIO_VOICE_LABEL='Sulafat';
export const STUDIO_VOICE_VERSION='ru-teacher-gemini-sulafat-v2';
export const DEFAULT_VOICE_RATE=.94;

const audioUrlCache=new Map<string,Promise<string>>();
const readyAudioUrlCache=new Map<string,string>();
const RETRYABLE_STATUS=new Set([408,425,429,500,502,503,504]);
type PrefetchItem={key:string;id:string;text:string};
const prefetchQueue:PrefetchItem[]=[];
const queuedPrefetchKeys=new Set<string>();
const PREFETCH_QUEUE_LIMIT=24;
const STUDIO_NETWORK_LIMIT=2;
const studioSlotWaiters:Array<()=>void>=[];
let prefetchRunning=false;
let activeStudioRequests=0;
let mentorForegroundIntent=false;

if(typeof window!=='undefined'){
  window.addEventListener('mathnikita-audio-request',event=>{
    const source=(event as CustomEvent<{source?:string}>).detail?.source;
    if(source!=='mentor'&&source!=='practice-mentor')return;
    mentorForegroundIntent=true;
    queueMicrotask(()=>{mentorForegroundIntent=false});
  });
}

function clampRate(value:number){return Math.min(Math.max(value,.88),1.04)}
function persistVoiceSettings(settings:StoredVoiceSettings){
  try{localStorage.setItem(VOICE_SETTINGS_KEY,JSON.stringify({...settings,rate:clampRate(settings.rate)}))}catch{/* storage can be unavailable in restricted browser contexts */}
}

export function loadVoiceSettings():StoredVoiceSettings{
  try{
    const current=JSON.parse(localStorage.getItem(VOICE_SETTINGS_KEY)??'null') as Partial<StoredVoiceSettings>|null;
    if(current&&(current.engine==='studio'||current.engine==='system')){
      return{engine:current.engine,voiceURI:current.voiceURI,rate:clampRate(Number(current.rate)||DEFAULT_VOICE_RATE)};
    }
  }catch{/* ignore malformed current settings */}
  let migrated:StoredVoiceSettings={engine:'studio',rate:DEFAULT_VOICE_RATE};
  try{
    const legacy=JSON.parse(localStorage.getItem(LEGACY_VOICE_SETTINGS_KEY)??'null') as {voiceURI?:string;rate?:number}|null;
    migrated={engine:'studio',voiceURI:legacy?.voiceURI,rate:clampRate(Number(legacy?.rate)||DEFAULT_VOICE_RATE)};
  }catch{/* keep studio defaults */}
  persistVoiceSettings(migrated);
  return migrated;
}

export function saveVoiceSettings(settings:StoredVoiceSettings){persistVoiceSettings(settings)}
export function studioNarrationText(value:string){return prepareRussianSpeechText(value)}
function cacheKey(id:string,text:string){return `${STUDIO_VOICE_VERSION}:${id}:${studioNarrationText(text)}`}
export function peekStudioAudioUrl(id:string,text:string){return readyAudioUrlCache.get(cacheKey(id,text))}

function drainPrefetchQueue(){
  if(prefetchRunning)return;
  const next=prefetchQueue.shift();
  if(!next)return;
  queuedPrefetchKeys.delete(next.key);
  if(readyAudioUrlCache.has(next.key)||audioUrlCache.has(next.key)){drainPrefetchQueue();return}
  prefetchRunning=true;
  void getStudioAudioUrl(next.id,next.text).catch(()=>undefined).finally(()=>{
    prefetchRunning=false;
    window.setTimeout(drainPrefetchQueue,120);
  });
}
export function prefetchStudioAudioUrl(id:string,text:string){
  if(!id||!text)return;
  const key=cacheKey(id,text);
  if(readyAudioUrlCache.has(key)||audioUrlCache.has(key)||queuedPrefetchKeys.has(key))return;
  if(prefetchQueue.length>=PREFETCH_QUEUE_LIMIT){const dropped=prefetchQueue.shift();if(dropped)queuedPrefetchKeys.delete(dropped.key)}
  queuedPrefetchKeys.add(key);prefetchQueue.push({key,id,text});drainPrefetchQueue();
}

function wait(ms:number){return new Promise(resolve=>window.setTimeout(resolve,ms))}
function retryDelayMs(response:Response,attempt:number){
  const retryAfter=Number(response.headers.get('retry-after'));
  if(Number.isFinite(retryAfter)&&retryAfter>0)return Math.min(Math.max(retryAfter*1000,1000),12_000);
  if(response.status===429)return 1600*(attempt+1);
  return 600*(attempt+1);
}
async function acquireStudioNetworkSlot(){
  if(activeStudioRequests<STUDIO_NETWORK_LIMIT){activeStudioRequests+=1;return}
  await new Promise<void>(resolve=>studioSlotWaiters.push(resolve));
  // The releasing request transfers its occupied slot directly to this waiter.
}
function releaseStudioNetworkSlot(){
  const next=studioSlotWaiters.shift();
  if(next){next();return}
  activeStudioRequests=Math.max(0,activeStudioRequests-1);
}
async function withStudioNetworkSlot<T>(work:()=>Promise<T>):Promise<T>{
  await acquireStudioNetworkSlot();
  try{return await work()}finally{releaseStudioNetworkSlot()}
}
async function requestStudioAudio(id:string,prepared:string,attempt=0):Promise<Blob>{
  const response=await withStudioNetworkSlot(()=>fetch('/api/narration',{
    method:'POST',
    headers:{'content-type':'application/json'},
    body:JSON.stringify({id,text:prepared,version:STUDIO_VOICE_VERSION}),
  }));
  if(!response.ok){
    if(attempt<2&&RETRYABLE_STATUS.has(response.status)){
      // The network slot is already released here, so Retry-After never blocks
      // another learner-triggered or auto-narration request from using a slot.
      await wait(retryDelayMs(response,attempt));
      return requestStudioAudio(id,prepared,attempt+1);
    }
    throw new Error(`Studio narration unavailable: ${response.status}`);
  }
  const type=response.headers.get('content-type')??'';
  if(!type.includes('audio/'))throw new Error('Studio narration returned non-audio response');
  return response.blob();
}

export async function getStudioAudioUrl(id:string,text:string):Promise<string>{
  const prepared=studioNarrationText(text);
  const key=cacheKey(id,prepared);
  const ready=readyAudioUrlCache.get(key);
  if(ready)return ready;
  const cached=audioUrlCache.get(key);
  if(cached)return cached;

  if(id.startsWith('mentor-')){
    const foreground=mentorForegroundIntent;
    if(foreground)mentorForegroundIntent=false;
    if(!foreground){
      // Speculative mentor speech used to generate every possible answer on
      // every scene. Keep only the two useful warmups and give the current
      // lesson/practice narration the first chance to reach the provider.
      if(!/(?:-hint|-welcome)$/.test(id))throw new Error('Background mentor warmup deferred');
      await wait(300);
      const warmed=readyAudioUrlCache.get(key);if(warmed)return warmed;
      const pending=audioUrlCache.get(key);if(pending)return pending;
    }
  }

  const request=requestStudioAudio(id,prepared)
    .then(blob=>{const url=URL.createObjectURL(blob);readyAudioUrlCache.set(key,url);return url})
    .catch(error=>{audioUrlCache.delete(key);readyAudioUrlCache.delete(key);throw error});
  audioUrlCache.set(key,request);
  return request;
}
