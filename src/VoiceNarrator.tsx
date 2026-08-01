import { useEffect,useMemo,useRef,useState,type RefObject } from 'react';
import { isNaturalRussianVoice,isRussianVoice,rankRussianVoices,selectBestRussianVoice } from './voiceQuality';
import { DEFAULT_VOICE_RATE,getStudioAudioUrl,loadVoiceSettings,saveVoiceSettings,STUDIO_VOICE_LABEL,studioNarrationText,type VoiceEngine } from './studioVoice';
import './voiceNarrator.css';

type VoiceNarratorProps={rootRef:RefObject<HTMLElement|null>;mode:'opening'|'lesson'};
type AudioRequestDetail={source?:'narrator'|'mentor'|string};
type StudioStatus='checking'|'ready'|'unavailable';

function visiblePractice(root:HTMLElement){return root.querySelector<HTMLElement>('.lesson-reflection .extended-practice[data-practice-task]')}
function visibleFinalReflection(root:HTMLElement){const finalStep=root.querySelector<HTMLElement>('.lesson-reflection .reflection-final-step');return finalStep&&!finalStep.hidden&&finalStep.offsetParent!==null?finalStep:null}
function collectVisibleText(scope:HTMLElement,selectors:string[]){const parts=selectors.flatMap(selector=>Array.from(scope.querySelectorAll<HTMLElement>(selector)).filter(node=>node.offsetParent!==null).map(node=>node.textContent?.trim()??'').filter(Boolean));return Array.from(new Set(parts)).join('. ')}
function safeNarrationToken(value:string){return value.toLowerCase().replace(/[^a-z0-9-]+/g,'-').replace(/^-+|-+$/g,'').slice(0,96)}

function getNarrationText(root:HTMLElement|null,mode:VoiceNarratorProps['mode']){
  if(!root)return'';
  if(mode==='opening'){const scope=root.querySelector<HTMLElement>('.opening-screen:not([hidden])');return scope?collectVisibleText(scope,['.lesson-opening-copy h1','.lesson-opening-copy p','.lesson-opening-question b','.lesson-opening-plan li span']):''}
  const practice=visiblePractice(root);if(practice)return collectVisibleText(practice,['h3','.extended-practice-instruction','.extended-practice-input span','.extended-practice-options button','.extended-practice-feedback b','.extended-practice-feedback span']);
  const finalReflection=visibleFinalReflection(root);if(finalReflection)return collectVisibleText(finalReflection,['.reflection-heading h2','.reflection-heading p','blockquote','.reflection-answer > span']);
  const scope=root.querySelector<HTMLElement>('.lesson-runtime:not([hidden])');return scope?collectVisibleText(scope,['.interactive-stage .stage-copy h2','.interactive-stage .stage-copy p','.interactive-stage .theory-note span','.interactive-stage .activity-area h3','.lesson-block h2','.lesson-block .block-text','.lesson-block .lesson-items li']):'';
}

function getNarrationId(root:HTMLElement|null,mode:VoiceNarratorProps['mode']){
  if(!root)return'';const lessonLabel=root.querySelector<HTMLElement>('.lesson-mode-toolbar > div > span')?.textContent??'';const lessonMatch=lessonLabel.match(/Урок\s+(\d+)/i);if(!lessonMatch)return'';const lessonNumber=String(Number(lessonMatch[1])).padStart(2,'0');
  if(mode==='opening')return`lesson-${lessonNumber}-opening`;
  const practice=visiblePractice(root);const practiceId=safeNarrationToken(practice?.dataset.practiceTask??'');if(practiceId)return`lesson-${lessonNumber}-practice-${practiceId}`;
  if(visibleFinalReflection(root))return`lesson-${lessonNumber}-reflection`;
  const activeStage=root.querySelector<HTMLElement>('.lesson-runtime:not([hidden]) .interactive-stage[data-stage-id]');const stageId=safeNarrationToken(activeStage?.dataset.stageId??'');if(stageId)return`lesson-${lessonNumber}-stage-${stageId}`;
  const stageLabel=root.querySelector<HTMLElement>('.lesson-runtime:not([hidden]) .stage-counter')?.textContent??'';const stageMatch=stageLabel.match(/Этап\s+(\d+)/i);if(stageMatch)return`lesson-${lessonNumber}-stage-${String(Number(stageMatch[1])).padStart(2,'0')}`;
  return'';
}

function splitForSpeech(text:string){const sentences=text.match(/[^.!?…]+[.!?…]?/g)??[text];const chunks:string[]=[];let current='';for(const sentence of sentences){const next=`${current} ${sentence}`.trim();if(next.length>180&&current){chunks.push(current);current=sentence.trim()}else current=next}if(current)chunks.push(current);return chunks}

export function VoiceNarrator({rootRef,mode}:VoiceNarratorProps){
  const systemSupported=typeof window!=='undefined'&&'speechSynthesis'in window;const audioSupported=typeof window!=='undefined'&&typeof Audio!=='undefined';
  const[voices,setVoices]=useState<SpeechSynthesisVoice[]>([]);const[speaking,setSpeaking]=useState(false);const[settingsOpen,setSettingsOpen]=useState(false);const initialSettings=useMemo(loadVoiceSettings,[]);
  const[engine,setEngine]=useState<VoiceEngine>(initialSettings.engine);const[voiceURI,setVoiceURI]=useState(initialSettings.voiceURI??'');const[rate,setRate]=useState(initialSettings.rate??DEFAULT_VOICE_RATE);const[studioStatus,setStudioStatus]=useState<StudioStatus>('checking');
  const sessionRef=useRef(0);const audioRef=useRef<HTMLAudioElement|null>(null);

  function stop(){sessionRef.current+=1;if(audioRef.current){audioRef.current.pause();audioRef.current.currentTime=0;audioRef.current.src='';audioRef.current=null}if(systemSupported)window.speechSynthesis.cancel();setSpeaking(false)}

  useEffect(()=>{if(!systemSupported)return;const loadVoices=()=>{const next=rankRussianVoices(window.speechSynthesis.getVoices());setVoices(next);setVoiceURI(current=>selectBestRussianVoice(next,current)?.voiceURI??'')};loadVoices();window.speechSynthesis.addEventListener('voiceschanged',loadVoices);return()=>window.speechSynthesis.removeEventListener('voiceschanged',loadVoices)},[systemSupported]);
  useEffect(()=>{let active=true;fetch('/api/narration-status',{cache:'no-store'}).then(async response=>response.ok?response.json():Promise.reject()).then((data:{studioConfigured?:boolean})=>{if(active)setStudioStatus(data.studioConfigured?'ready':'unavailable')}).catch(()=>{if(active)setStudioStatus('unavailable')});return()=>{active=false}},[]);
  useEffect(()=>{saveVoiceSettings({engine,voiceURI,rate})},[engine,voiceURI,rate]);
  useEffect(()=>{const stopHandler=()=>stop();const requestHandler=(event:Event)=>{const source=(event as CustomEvent<AudioRequestDetail>).detail?.source;if(source!=='narrator')stop()};window.addEventListener('mathnikita-stop-narration',stopHandler);window.addEventListener('mathnikita-audio-request',requestHandler);return()=>{window.removeEventListener('mathnikita-stop-narration',stopHandler);window.removeEventListener('mathnikita-audio-request',requestHandler)}},[]);
  useEffect(()=>{stop();const root=rootRef.current;if(!root)return;let currentId=getNarrationId(root,mode);const observer=new MutationObserver(()=>{const nextId=getNarrationId(root,mode);if(nextId&&nextId!==currentId){currentId=nextId;stop()}});observer.observe(root,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['data-practice-task','data-stage-id','hidden']});return()=>{observer.disconnect();stop()}},[mode,rootRef]);

  function startSystemSpeech(text:string,session:number){if(!systemSupported||!text){setSpeaking(false);return}window.speechSynthesis.cancel();const chunks=splitForSpeech(studioNarrationText(text));const selectedVoice=selectBestRussianVoice(voices,voiceURI);setSpeaking(true);let index=0;const playNext=()=>{if(sessionRef.current!==session||index>=chunks.length){setSpeaking(false);return}const utterance=new SpeechSynthesisUtterance(chunks[index]);utterance.lang='ru-RU';utterance.voice=selectedVoice??null;utterance.rate=Math.min(Math.max(rate,.88),1.04);utterance.pitch=1;utterance.volume=1;utterance.onend=()=>{index+=1;window.setTimeout(playNext,130)};utterance.onerror=()=>setSpeaking(false);window.speechSynthesis.speak(utterance)};playNext()}

  async function startStudioSpeech(text:string,narrationId:string,session:number){
    if(!audioSupported||!narrationId){startSystemSpeech(text,session);return}
    setSpeaking(true);
    try{
      const source=await getStudioAudioUrl(narrationId,text);if(sessionRef.current!==session)return;
      const audio=new Audio(source);audio.preload='auto';audio.playbackRate=rate;audioRef.current=audio;
      const fallback=()=>{if(sessionRef.current!==session)return;audioRef.current=null;startSystemSpeech(text,session)};
      audio.onended=()=>{if(sessionRef.current===session)setSpeaking(false);audioRef.current=null};audio.onerror=fallback;await audio.play().catch(fallback);
    }catch{if(sessionRef.current===session)startSystemSpeech(text,session)}
  }

  function speak(){if(speaking){stop();return}const text=getNarrationText(rootRef.current,mode);if(!text)return;stop();const session=sessionRef.current+1;sessionRef.current=session;window.dispatchEvent(new CustomEvent('mathnikita-audio-request',{detail:{source:'narrator'}}));const narrationId=getNarrationId(rootRef.current,mode);if(engine==='studio'){void startStudioSpeech(text,narrationId,session);return}startSystemSpeech(text,session)}

  if(!audioSupported&&!systemSupported)return null;const voiceOptions=rankRussianVoices(voices);const selectedVoice=selectBestRussianVoice(voiceOptions,voiceURI);
  const systemVoiceMessage=!selectedVoice?'На устройстве не найден русский голос. Системная озвучка будет только аварийным резервом.':isNaturalRussianVoice(selectedVoice)?`Резервный системный голос: ${selectedVoice.name}.`:`Резервный базовый голос: ${selectedVoice.name}.`;
  const studioMessage=studioStatus==='ready'?`Единый AI-голос ${STUDIO_VOICE_LABEL} готов. На ноутбуке и iPad используется один и тот же голос.`:studioStatus==='checking'?'Проверяем единый AI-голос…':`Серверный AI-голос сейчас недоступен. При воспроизведении приложение автоматически использует системный русский голос.`;

  return <div className="voice-narrator">
    <button type="button" className={speaking?'is-speaking':''} onClick={speak} aria-pressed={speaking}><span aria-hidden="true">{speaking?'■':'▶'}</span>{speaking?'Остановить':engine==='studio'?'Слушать · AI':'Слушать'}</button>
    <span className="voice-ai-disclosure" title="Озвучка создаётся искусственным интеллектом">AI-голос</span>
    <button type="button" className="voice-settings-button" onClick={()=>setSettingsOpen(open=>!open)} aria-expanded={settingsOpen} aria-label="Настройки голоса">⚙</button>
    {settingsOpen?<div className="voice-settings-panel">
      <label><span>Режим озвучки</span><select value={engine} onChange={event=>setEngine(event.target.value as VoiceEngine)}><option value="studio">Единый AI-голос Marin · рекомендуется</option><option value="system">Системный голос устройства · резерв</option></select></label>
      {engine==='studio'?<div className="voice-fixed-profile"><b>{STUDIO_VOICE_LABEL}</b><span>спокойный русский преподаватель · один голос на всех устройствах</span></div>:null}
      {engine==='system'&&voiceOptions.length?<label><span>Русский голос устройства</span><select value={selectedVoice?.voiceURI??''} onChange={event=>setVoiceURI(event.target.value)}>{voiceOptions.map((voice,index)=><option key={voice.voiceURI} value={voice.voiceURI}>{voice.name}{index===0?' · рекомендуется':''}{voice.localService?' · на устройстве':''}</option>)}</select></label>:null}
      <label><span>Скорость: {rate.toFixed(2)}×</span><input type="range" min="0.88" max="1.04" step="0.02" value={rate} onChange={event=>setRate(Number(event.target.value))}/></label>
      <small className={engine==='studio'?studioStatus==='ready'?'voice-engine-ready':'voice-engine-pending':isRussianVoice(selectedVoice??{name:'',lang:'',voiceURI:'',localService:false})?'voice-engine-ready':'voice-engine-pending'}>{engine==='studio'?studioMessage:systemVoiceMessage}</small>
      <small className="voice-ai-note">Голос Marin — AI-сгенерированная озвучка, а не запись человека.</small>
    </div>:null}
  </div>;
}
