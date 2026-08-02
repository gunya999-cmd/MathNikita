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
export function prefetchStudioAudioUrl(id:string,text:string){if(!id||!text)return;void getStudioAudioUrl(id,text).catch(()=>undefined)}

function wait(ms:number){return new Promise(resolve=>window.setTimeout(resolve,ms))}
function retryDelayMs(response:Response,attempt:number){
  const retryAfter=Number(response.headers.get('retry-after'));
  if(Number.isFinite(retryAfter)&&retryAfter>0)return Math.min(Math.max(retryAfter*1000,1000),12_000);
  if(response.status===429)return 1600*(attempt+1);
  return 600*(attempt+1);
}
async function requestStudioAudio(id:string,prepared:string,attempt=0):Promise<Blob>{
  const response=await fetch('/api/narration',{
    method:'POST',
    headers:{'content-type':'application/json'},
    body:JSON.stringify({id,text:prepared,version:STUDIO_VOICE_VERSION}),
  });
  if(!response.ok){
    if(attempt<2&&RETRYABLE_STATUS.has(response.status)){
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
  const request=requestStudioAudio(id,prepared)
    .then(blob=>{const url=URL.createObjectURL(blob);readyAudioUrlCache.set(key,url);return url})
    .catch(error=>{audioUrlCache.delete(key);readyAudioUrlCache.delete(key);throw error});
  audioUrlCache.set(key,request);
  return request;
}
