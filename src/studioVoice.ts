import { prepareRussianSpeechText } from './voiceQuality';

export type VoiceEngine='studio'|'system';
export type StoredVoiceSettings={engine:VoiceEngine;voiceURI?:string;rate:number};

export const VOICE_SETTINGS_KEY='mathnikita-voice-settings-v4';
export const LEGACY_VOICE_SETTINGS_KEY='mathnikita-voice-settings-v3';
export const STUDIO_VOICE_LABEL='Marin';
export const STUDIO_VOICE_VERSION='ru-teacher-marin-v1';
export const DEFAULT_VOICE_RATE=.94;

const audioUrlCache=new Map<string,Promise<string>>();

function clampRate(value:number){return Math.min(Math.max(value,.88),1.04)}

export function loadVoiceSettings():StoredVoiceSettings{
  try{
    const current=JSON.parse(localStorage.getItem(VOICE_SETTINGS_KEY)??'null') as Partial<StoredVoiceSettings>|null;
    if(current&&(current.engine==='studio'||current.engine==='system')){
      return{engine:current.engine,voiceURI:current.voiceURI,rate:clampRate(Number(current.rate)||DEFAULT_VOICE_RATE)};
    }
  }catch{/* ignore malformed current settings */}
  try{
    const legacy=JSON.parse(localStorage.getItem(LEGACY_VOICE_SETTINGS_KEY)??'null') as {voiceURI?:string;rate?:number}|null;
    return{engine:'studio',voiceURI:legacy?.voiceURI,rate:clampRate(Number(legacy?.rate)||DEFAULT_VOICE_RATE)};
  }catch{return{engine:'studio',rate:DEFAULT_VOICE_RATE}}
}

export function saveVoiceSettings(settings:StoredVoiceSettings){
  localStorage.setItem(VOICE_SETTINGS_KEY,JSON.stringify({...settings,rate:clampRate(settings.rate)}));
}

export function studioNarrationText(value:string){return prepareRussianSpeechText(value)}

function cacheKey(id:string,text:string){return `${STUDIO_VOICE_VERSION}:${id}:${text}`}

export async function getStudioAudioUrl(id:string,text:string):Promise<string>{
  const prepared=studioNarrationText(text);
  const key=cacheKey(id,prepared);
  const cached=audioUrlCache.get(key);
  if(cached)return cached;
  const request=fetch('/api/narration',{
    method:'POST',
    headers:{'content-type':'application/json'},
    body:JSON.stringify({id,text:prepared,version:STUDIO_VOICE_VERSION}),
  }).then(async response=>{
    if(!response.ok)throw new Error(`Studio narration unavailable: ${response.status}`);
    const type=response.headers.get('content-type')??'';
    if(!type.includes('audio/'))throw new Error('Studio narration returned non-audio response');
    return URL.createObjectURL(await response.blob());
  }).catch(error=>{audioUrlCache.delete(key);throw error});
  audioUrlCache.set(key,request);
  return request;
}
