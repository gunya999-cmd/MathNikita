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
type AudioGroup='lesson'|'mentor';
const prefetchQueue:PrefetchItem[]=[];
const queuedPrefetchKeys=new Set<string>();
const PREFETCH_QUEUE_LIMIT=24;
const STUDIO_NETWORK_LIMIT=2;
const studioSlotWaiters:Array<()=>void>=[];
const activeStudioControllers=new Map<string,{controller:AbortController;id:string}>();
let prefetchRunning=false;
let activeStudioRequests=0;

function abortError(){const error=new Error('Studio narration aborted');error.name='AbortError';return error}
function narrationKeyPrefix(id:string){return`${STUDIO_VOICE_VERSION}:${id}:`}
function summaryPracticePrefix(id:string){const match=id.match(/^lesson-(\d+)-stage-.*summary$/);return match?`${STUDIO_VOICE_VERSION}:lesson-${match[1]}-practice-`:''}
function summaryPracticeIdPrefix(id:string){const match=id.match(/^lesson-(\d+)-stage-.*summary$/);return match?`lesson-${match[1]}-practice-`:''}
function audioGroupForId(id:string):AudioGroup{return id.startsWith('mentor-')?'mentor':'lesson'}
function sourceGroup(source?:string):AudioGroup|undefined{return source==='mentor'||source==='practice-mentor'?'mentor':source==='narrator'||source==='practice-narrator'?'lesson':undefined}
function cancelStaleStudioGeneration(keepNarrationId='',group?:AudioGroup){
  const keepPrefix=keepNarrationId?narrationKeyPrefix(keepNarrationId):'';
  const keepPracticePrefix=keepNarrationId?summaryPracticePrefix(keepNarrationId):'';
  const keepPracticeIdPrefix=keepNarrationId?summaryPracticeIdPrefix(keepNarrationId):'';
  for(const[key,active]of activeStudioControllers){
    if(group&&audioGroupForId(active.id)!==group)continue;
    if((keepPrefix&&key.startsWith(keepPrefix))||(keepPracticePrefix&&key.startsWith(keepPracticePrefix)))continue;
    active.controller.abort();audioUrlCache.delete(key);activeStudioControllers.delete(key);
  }
  for(let index=prefetchQueue.length-1;index>=0;index-=1){
    const item=prefetchQueue[index];if(group&&audioGroupForId(item.id)!==group)continue;
    if(item.id===keepNarrationId||(keepPracticeIdPrefix&&item.id.startsWith(keepPracticeIdPrefix)))continue;
    prefetchQueue.splice(index,1);queuedPrefetchKeys.delete(item.key);
  }
}

if(typeof window!=='undefined'){
  window.addEventListener('mathnikita-audio-request',event=>{
    const detail=(event as CustomEvent<{source?:string;narrationId?:string}>).detail;
    const group=sourceGroup(detail?.source);if(!group)return;
    cancelStaleStudioGeneration(detail?.narrationId??'',group);
  });
  // Playback stops also run after child effects have warmed the current text.
  // They must not cancel shared generation: the next foreground request joins
  // that exact id + prepared-text Promise. A new audio request prunes stale work.
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
function normalizedCache(id:string,text:string){const prepared=studioNarrationText(text);return{prepared,key:`${STUDIO_VOICE_VERSION}:${id}:${prepared}`}}
export function peekStudioAudioUrl(id:string,text:string){return readyAudioUrlCache.get(normalizedCache(id,text).key)}
function isSpeculativeDynamicId(id:string){return id.startsWith('mentor-')}
function isCurrentLessonNarrationId(id:string){return /^lesson-\d+-(?:stage|practice)-/.test(id)}

function drainPrefetchQueue(){
  if(prefetchRunning)return;const next=prefetchQueue.shift();if(!next)return;queuedPrefetchKeys.delete(next.key);
  if(readyAudioUrlCache.has(next.key)||audioUrlCache.has(next.key)){drainPrefetchQueue();return}
  prefetchRunning=true;void getStudioAudioUrl(next.id,next.text).catch(()=>undefined).finally(()=>{prefetchRunning=false;window.setTimeout(drainPrefetchQueue,120)});
}
export function prefetchStudioAudioUrl(id:string,text:string){
  if(!id||!text||isSpeculativeDynamicId(id))return;
  const {key}=normalizedCache(id,text);if(readyAudioUrlCache.has(key)||audioUrlCache.has(key)||queuedPrefetchKeys.has(key))return;
  if(isCurrentLessonNarrationId(id)){void getStudioAudioUrl(id,text).catch(()=>undefined);return}
  if(prefetchQueue.length>=PREFETCH_QUEUE_LIMIT){const dropped=prefetchQueue.shift();if(dropped)queuedPrefetchKeys.delete(dropped.key)}
  queuedPrefetchKeys.add(key);prefetchQueue.push({key,id,text});drainPrefetchQueue();
}

// Mentor audio may only be warmed for text that is already visible to the learner.
// Keeping this separate from generic prefetch prevents future hints/answers from
// being generated speculatively by callers.
export function prefetchVisibleMentorAudioUrl(id:string,text:string){
  if(!id.startsWith('mentor-')||!text.trim())return;
  const {key}=normalizedCache(id,text);if(readyAudioUrlCache.has(key)||audioUrlCache.has(key))return;
  void getStudioAudioUrl(id,text,true).catch(()=>undefined);
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
  const {prepared,key}=normalizedCache(id,text);const isMentor=id.startsWith('mentor-');
  const ready=readyAudioUrlCache.get(key);if(ready)return ready;const cached=audioUrlCache.get(key);if(cached)return cached;
  if(isMentor&&!mentorForegroundOverride)throw new Error('Background mentor warmup deferred');
  const controller=new AbortController();activeStudioControllers.set(key,{controller,id});
  const request=requestStudioAudio(id,prepared,controller.signal)
    .then(blob=>{if(controller.signal.aborted)throw abortError();const url=URL.createObjectURL(blob);readyAudioUrlCache.set(key,url);return url})
    .catch(error=>{if(audioUrlCache.get(key)===request){audioUrlCache.delete(key);readyAudioUrlCache.delete(key)}throw error})
    .finally(()=>{if(activeStudioControllers.get(key)?.controller===controller)activeStudioControllers.delete(key)});
  audioUrlCache.set(key,request);return request;
}
