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
const activeStudioControllers=new Map<string,AbortController>();
let prefetchRunning=false;
let activeStudioRequests=0;
let mentorForegroundTickets=0;
let mentorTicketTimer:number|null=null;

function abortError(){const error=new Error('Studio narration aborted');error.name='AbortError';return error}
function clearMentorForegroundTicket(){mentorForegroundTickets=0;if(mentorTicketTimer!==null){window.clearTimeout(mentorTicketTimer);mentorTicketTimer=null}}
function cancelStaleStudioGeneration(){
  for(const[key,controller]of activeStudioControllers){controller.abort();audioUrlCache.delete(key)}
  activeStudioControllers.clear();prefetchQueue.length=0;queuedPrefetchKeys.clear();
}

if(typeof window!=='undefined'){
  window.addEventListener('mathnikita-audio-request',event=>{
    cancelStaleStudioGeneration();
    const source=(event as CustomEvent<{source?:string}>).detail?.source;
    if(source!=='mentor'&&source!=='practice-mentor')return;
    mentorForegroundTickets=1;
    if(mentorTicketTimer!==null)window.clearTimeout(mentorTicketTimer);
    mentorTicketTimer=window.setTimeout(()=>{mentorForegroundTickets=0;mentorTicketTimer=null},1_000);
  });
  window.addEventListener('mathnikita-stop-narration',cancelStaleStudioGeneration);
}

function clampRate(value:number){return Math.min(Math.max(value,.88),1.04)}
function persistVoiceSettings(settings:StoredVoiceSettings){try{localStorage.setItem(VOICE_SETTINGS_KEY,JSON.stringify({...settings,rate:clampRate(settings.rate)}))}catch{/* storage can be unavailable */}}
export function loadVoiceSettings():StoredVoiceSettings{
  try{const current=JSON.parse(localStorage.getItem(VOICE_SETTINGS_KEY)??'null') as Partial<StoredVoiceSettings>|null;if(current&&(current.engine==='studio'||current.engine==='system'))return{engine:current.engine,voiceURI:current.voiceURI,rate:clampRate(Number(current.rate)||DEFAULT_VOICE_RATE)}}catch{}
  let migrated:StoredVoiceSettings={engine:'studio',rate:DEFAULT_VOICE_RATE};
  try{const legacy=JSON.parse(localStorage.getItem(LEGACY_VOICE_SETTINGS_KEY)??'null') as {voiceURI?:string;rate?:number}|null;migrated={engine:'studio',voiceURI:legacy?.voiceURI,rate:clampRate(Number(legacy?.rate)||DEFAULT_VOICE_RATE)}}catch{}
  persistVoiceSettings(migrated);return migrated;
}
export function saveVoiceSettings(settings:StoredVoiceSettings){persistVoiceSettings(settings)}
export function studioNarrationText(value:string){return prepareRussianSpeechText(value)}
function cacheKey(id:string,text:string){return `${STUDIO_VOICE_VERSION}:${id}:${studioNarrationText(text)}`}
export function peekStudioAudioUrl(id:string,text:string){
  const ready=readyAudioUrlCache.get(cacheKey(id,text));
  // A cached mentor clip consumes the foreground intent just like a network
  // request would. Otherwise the unused one-shot ticket could accidentally
  // authorize an obsolete background warmup after the requested clip starts.
  if(ready&&id.startsWith('mentor-')&&mentorForegroundTickets>0)clearMentorForegroundTicket();
  return ready;
}
function isSpeculativeDynamicId(id:string){return /^lesson-\d+-(?:stage|practice)-/.test(id)||id.startsWith('mentor-')}

function drainPrefetchQueue(){
  if(prefetchRunning)return;const next=prefetchQueue.shift();if(!next)return;queuedPrefetchKeys.delete(next.key);
  if(readyAudioUrlCache.has(next.key)||audioUrlCache.has(next.key)){drainPrefetchQueue();return}
  prefetchRunning=true;void getStudioAudioUrl(next.id,next.text).catch(()=>undefined).finally(()=>{prefetchRunning=false;window.setTimeout(drainPrefetchQueue,120)});
}
export function prefetchStudioAudioUrl(id:string,text:string){
  // During a lesson every dynamic line is generated only when it actually
  // becomes learner-visible. Ready clips are still cached for instant replay.
  if(!id||!text||isSpeculativeDynamicId(id))return;
  const key=cacheKey(id,text);if(readyAudioUrlCache.has(key)||audioUrlCache.has(key)||queuedPrefetchKeys.has(key))return;
  if(prefetchQueue.length>=PREFETCH_QUEUE_LIMIT){const dropped=prefetchQueue.shift();if(dropped)queuedPrefetchKeys.delete(dropped.key)}
  queuedPrefetchKeys.add(key);prefetchQueue.push({key,id,text});drainPrefetchQueue();
}

function waitWithSignal(ms:number,signal:AbortSignal){
  if(signal.aborted)return Promise.reject(abortError());
  return new Promise<void>((resolve,reject)=>{const cleanup=()=>signal.removeEventListener('abort',onAbort);const timer=window.setTimeout(()=>{cleanup();resolve()},ms);const onAbort=()=>{window.clearTimeout(timer);cleanup();reject(abortError())};signal.addEventListener('abort',onAbort,{once:true})});
}
function retryDelayMs(response:Response,attempt:number){const retryAfter=Number(response.headers.get('retry-after'));if(Number.isFinite(retryAfter)&&retryAfter>0)return Math.min(Math.max(retryAfter*1000,1000),12_000);if(response.status===429)return 1600*(attempt+1);return 600*(attempt+1)}
async function acquireStudioNetworkSlot(signal:AbortSignal){
  if(signal.aborted)throw abortError();if(activeStudioRequests<STUDIO_NETWORK_LIMIT){activeStudioRequests+=1;return}
  await new Promise<void>((resolve,reject)=>{let settled=false;const cleanup=()=>signal.removeEventListener('abort',onAbort);const waiter=()=>{if(settled)return;settled=true;cleanup();if(signal.aborted){releaseStudioNetworkSlot();reject(abortError());return}resolve()};const onAbort=()=>{if(settled)return;settled=true;const index=studioSlotWaiters.indexOf(waiter);if(index>=0)studioSlotWaiters.splice(index,1);cleanup();reject(abortError())};signal.addEventListener('abort',onAbort,{once:true});studioSlotWaiters.push(waiter)});
}
function releaseStudioNetworkSlot(){const next=studioSlotWaiters.shift();if(next){next();return}activeStudioRequests=Math.max(0,activeStudioRequests-1)}
async function withStudioNetworkSlot<T>(work:()=>Promise<T>,signal:AbortSignal){await acquireStudioNetworkSlot(signal);try{return await work()}finally{releaseStudioNetworkSlot()}}
async function requestStudioAudio(id:string,prepared:string,signal:AbortSignal,attempt=0):Promise<Blob>{
  if(signal.aborted)throw abortError();
  const response=await withStudioNetworkSlot(()=>fetch('/api/narration',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({id,text:prepared,version:STUDIO_VOICE_VERSION}),signal}),signal);
  if(!response.ok){if(attempt<2&&RETRYABLE_STATUS.has(response.status)){await waitWithSignal(retryDelayMs(response,attempt),signal);return requestStudioAudio(id,prepared,signal,attempt+1)}throw new Error(`Studio narration unavailable: ${response.status}`)}
  const type=response.headers.get('content-type')??'';if(!type.includes('audio/'))throw new Error('Studio narration returned non-audio response');return response.blob();
}

export async function getStudioAudioUrl(id:string,text:string,mentorForegroundOverride=false):Promise<string>{
  const prepared=studioNarrationText(text);const key=cacheKey(id,prepared);const ready=readyAudioUrlCache.get(key);if(ready){if(id.startsWith('mentor-')&&mentorForegroundTickets>0)clearMentorForegroundTicket();return ready}const cached=audioUrlCache.get(key);if(cached)return cached;
  if(id.startsWith('mentor-')){
    const foreground=mentorForegroundOverride||mentorForegroundTickets>0;
    if(foreground&&mentorForegroundTickets>0)clearMentorForegroundTicket();
    if(!foreground)throw new Error('Background mentor warmup deferred');
  }
  const controller=new AbortController();activeStudioControllers.set(key,controller);
  const request=requestStudioAudio(id,prepared,controller.signal)
    .then(blob=>{const url=URL.createObjectURL(blob);readyAudioUrlCache.set(key,url);return url})
    .catch(error=>{audioUrlCache.delete(key);readyAudioUrlCache.delete(key);throw error})
    .finally(()=>{if(activeStudioControllers.get(key)===controller)activeStudioControllers.delete(key)});
  audioUrlCache.set(key,request);return request;
}
