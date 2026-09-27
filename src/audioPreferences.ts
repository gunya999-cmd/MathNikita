export type AudioPreferenceKind='lesson'|'cat';

export const AUDIO_PREFERENCE_EVENT='mathnikita-audio-preference';

const STORAGE_KEYS:Record<AudioPreferenceKind,string>={
  lesson:'mathnikita-lesson-voice-enabled-v1',
  cat:'mathnikita-cat-voice-enabled-v1',
};

export function loadAudioEnabled(kind:AudioPreferenceKind){
  if(typeof window==='undefined')return false;
  try{return window.localStorage.getItem(STORAGE_KEYS[kind])==='1'}catch{return false}
}

export function saveAudioEnabled(kind:AudioPreferenceKind,enabled:boolean){
  if(typeof window==='undefined')return;
  try{window.localStorage.setItem(STORAGE_KEYS[kind],enabled?'1':'0')}catch{/* storage can be unavailable */}
  window.dispatchEvent(new CustomEvent(AUDIO_PREFERENCE_EVENT,{detail:{kind,enabled}}));
}
