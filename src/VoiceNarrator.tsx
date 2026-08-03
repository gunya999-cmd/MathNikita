import { useEffect,useMemo,useRef,useState,type RefObject } from 'react';
import { extendedPracticeByLesson } from './data/extendedPracticeData';
import { practiceNarrationId,practiceNarrationText } from './practiceNarration';
import { setStageNarrationActive } from './stageNarrationSequence';
import { isNaturalRussianVoice,isRussianVoice,rankRussianVoices,selectBestRussianVoice } from './voiceQuality';
import { DEFAULT_VOICE_RATE,getStudioAudioUrl,loadVoiceSettings,peekStudioAudioUrl,prefetchStudioAudioUrl,saveVoiceSettings,STUDIO_VOICE_LABEL,studioNarrationText,type VoiceEngine } from './studioVoice';
import './voiceNarrator.css';

type VoiceNarratorProps={rootRef:RefObject<HTMLElement|null>;mode:'opening'|'lesson';lessonNumber:number;openingText:string};
type AudioRequestDetail={source?:'narrator'|'mentor'|string};
type StudioStatus='checking'|'ready'|'unavailable';
type Narration={id:string;text:string};

function visiblePractice(root:HTMLElement){return root.querySelector<HTMLElement>('.lesson-reflection .extended-practice[data-practice-task]')}
function visibleFinalReflection(root:HTMLElement){const finalStep=root.querySelector<HTMLElement>('.lesson-reflection .reflection-final-step');return finalStep&&!finalStep.hidden&&!finalStep.closest('[hidden]')?finalStep:null}
function collectVisibleText(scope:HTMLElement,selectors:string[]){const parts=selectors.flatMap(selector=>Array.from(scope.querySelectorAll<HTMLElement>(selector)).filter(node=>!node.closest('[hidden]')).map(node=>node.textContent?.trim()??'').filter(Boolean));return Array.from(new Set(parts)).join('. ')}
function safeNarrationToken(value:string){return value.toLowerCase().replace(/[^a-z0-9-]+/g,'-').replace(/^-+|-+$/g,'').slice(0,96)}
function canCreateAudioElement(){return typeof document!=='undefined'&&typeof document.createElement==='function'}
function createNarrationAudio(source:string):HTMLAudioElement|null{try{if(typeof Audio!=='undefined')return new Audio(source);if(!canCreateAudioElement())return null;const audio=document.createElement('audio');audio.src=source;return audio}catch{return null}}
function lessonToken(lessonNumber:number){return String(lessonNumber).padStart(2,'0')}
function isSummaryStage(stage:Narration|null){return Boolean(stage?.id.endsWith('-summary'))}

function resolvePracticeNarration(root:HTMLElement,lessonNumber:number):Narration|null{
  const scope=visiblePractice(root);if(!scope)return null;
  const taskId=scope.dataset.practiceTask??'';const set=extendedPracticeByLesson[lessonNumber];if(!set)return null;
  const index=set.tasks.findIndex(task=>task.id===taskId);if(index<0)return null;
  const task=set.tasks[index];return{id:practiceNarrationId(lessonNumber,task),text:practiceNarrationText(task,index,set.tasks.length)};
}

function resolveStageNarration(root:HTMLElement,lessonNumber:number):Narration|null{
  const scope=root.querySelector<HTMLElement>('.lesson-runtime:not([hidden]) .interactive-stage[data-stage-id]');
  if(!scope)return null;
  const stageId=safeNarrationToken(scope.dataset.stageId??'');if(!stageId)return null;
  const text=collectVisibleText(scope,[
    '.stage-copy h2',
    '.stage-copy p',
    '.theory-note span',
    '.activity-area h3',
    '.activity-area p',
    '.lesson-items li',
  ])||scope.textContent?.trim()||'';
  if(!text)return null;
  return{id:`lesson-${lessonToken(lessonNumber)}-stage-${stageId}`,text};
}

function getNarrationText(root:HTMLElement|null,mode:VoiceNarratorProps['mode'],openingText:string,lessonNumber:number){
  if(mode==='opening'){
    const explicit=openingText.trim();if(explicit)return explicit;if(!root)return'';
    const scope=root.querySelector<HTMLElement>('.opening-screen:not([hidden])')??root.querySelector<HTMLElement>('.lesson-opening');if(!scope)return'';
    return collectVisibleText(scope,['.lesson-opening-copy h1','.lesson-opening-copy p','.lesson-opening-question b','.lesson-opening-plan li span'])||scope.textContent?.trim()||'';
  }
  if(!root)return'';
  const stage=resolveStageNarration(root,lessonNumber);
  if(stage&&!isSummaryStage(stage))return stage.text;
  const sharedPractice=resolvePracticeNarration(root,lessonNumber);if(sharedPractice)return sharedPractice.text;
  const practice=visiblePractice(root);if(practice)return collectVisibleText(practice,['h3','.extended-practice-instruction','.extended-practice-input span','.extended-practice-options button']);
  const finalReflection=visibleFinalReflection(root);if(finalReflection)return collectVisibleText(finalReflection,['.reflection-heading h2','.reflection-heading p','blockquote','.reflection-answer > span']);
  if(stage)return stage.text;
  const scope=root.querySelector<HTMLElement>('.lesson-runtime:not([hidden])');return scope?collectVisibleText(scope,['.lesson-block h2','.lesson-block .block-text','.lesson-block .lesson-items li']):'';
}

function getNarrationId(root:HTMLElement|null,mode:VoiceNarratorProps['mode'],lessonNumber:number){
  let resolvedLesson=Number.isFinite(lessonNumber)&&lessonNumber>0?lessonNumber:0;
  if(!resolvedLesson&&root){const lessonLabel=root.querySelector<HTMLElement>('.lesson-mode-toolbar > div > span')?.textContent??'';const lessonMatch=lessonLabel.match(/Урок\s+(\d+)/i);const storedLesson=typeof localStorage!=='undefined'?Number(localStorage.getItem('mathnikita-selected-lesson')):0;resolvedLesson=lessonMatch?Number(lessonMatch[1]):storedLesson}
  if(!Number.isFinite(resolvedLesson)||resolvedLesson<1)return'';
  const lessonId=lessonToken(resolvedLesson);if(mode==='opening')return`lesson-${lessonId}-opening`;if(!root)return'';
  const stage=resolveStageNarration(root,resolvedLesson);
  if(stage&&!isSummaryStage(stage))return stage.id;
  const sharedPractice=resolvePracticeNarration(root,resolvedLesson);if(sharedPractice)return sharedPractice.id;
  const practice=visiblePractice(root);const practiceId=safeNarrationToken(practice?.dataset.practiceTask??'');if(practiceId)return`lesson-${lessonId}-practice-${practiceId}`;
  if(visibleFinalReflection(root))return`lesson-${lessonId}-reflection`;
  if(stage)return stage.id;
  const stageLabel=root.querySelector<HTMLElement>('.lesson-runtime:not([hidden]) .stage-counter')?.textContent??'';const stageMatch=stageLabel.match(/Этап\s+(\d+)/i);if(stageMatch)return`lesson-${lessonId}-stage-${String(Number(stageMatch[1])).padStart(2,'0')}`;return'';
}

function splitForSpeech(text:string){const sentences=text.match(/[^.!?…]+[.!?…]?/g)??[text];const chunks:string[]=[];let current='';for(const sentence of sentences){const next=`${current} ${sentence}`.trim();if(next.length>180&&current){chunks.push(current);current=sentence.trim()}else current=next}if(current)chunks.push(current);return chunks}

export function VoiceNarrator({rootRef,mode,lessonNumber,openingText}:VoiceNarratorProps){
  const systemSupported=typeof window!=='undefined'&&'speechSynthesis'in window;const audioSupported=canCreateAudioElement();
  const[voices,setVoices]=useState<SpeechSynthesisVoice[]>([]);const[speaking,setSpeaking]=useState(false);const[settingsOpen,setSettingsOpen]=useState(false);const[studioIssue,setStudioIssue]=useState('');const initialSettings=useMemo(loadVoiceSettings,[]);
  const[engine,setEngine]=useState<VoiceEngine>(initialSettings.engine);const[voiceURI,setVoiceURI]=useState(initialSettings.voiceURI??'');const[rate,setRate]=useState(initialSettings.rate??DEFAULT_VOICE_RATE);const[studioStatus,setStudioStatus]=useState<StudioStatus>('checking');
  const sessionRef=useRef(0);const audioRef=useRef<HTMLAudioElement|null>(null);const narratorRef=useRef<HTMLDivElement|null>(null);const lastAutoStageRef=useRef('');const autoStageSessionRef=useRef<number|null>(null);const autoStageIdRef=useRef('');

  function releaseAutoStage(session:number,narrationId:string,ended=false){
    if(autoStageSessionRef.current!==session)return;
    if(ended)window.dispatchEvent(new CustomEvent('mathnikita-audio-ended',{detail:{source:'narrator',lessonNumber,narrationId}}));
    autoStageSessionRef.current=null;autoStageIdRef.current='';setStageNarrationActive(false,narrationId);
  }
  function stop(){
    const autoSession=autoStageSessionRef.current;const autoId=autoStageIdRef.current;
    if(autoSession!==null){autoStageSessionRef.current=null;autoStageIdRef.current='';setStageNarrationActive(false,autoId)}
    sessionRef.current+=1;if(audioRef.current){audioRef.current.pause();audioRef.current.currentTime=0;audioRef.current.src='';audioRef.current=null}if(systemSupported)window.speechSynthesis.cancel();setSpeaking(false)
  }
  function failStudio(session:number,message='AI-голос временно недоступен. Нажми ещё раз.'){if(sessionRef.current!==session)return;releaseAutoStage(session,autoStageIdRef.current,false);audioRef.current=null;setSpeaking(false);setStudioIssue(message)}

  useEffect(()=>{if(!systemSupported)return;const loadVoices=()=>{const next=rankRussianVoices(window.speechSynthesis.getVoices());setVoices(next);setVoiceURI(current=>selectBestRussianVoice(next,current)?.voiceURI??'')};loadVoices();window.speechSynthesis.addEventListener('voiceschanged',loadVoices);return()=>window.speechSynthesis.removeEventListener('voiceschanged',loadVoices)},[systemSupported]);
  useEffect(()=>{let active=true;fetch('/api/narration-status',{cache:'no-store'}).then(async response=>response.ok?response.json():Promise.reject()).then((data:{studioConfigured?:boolean})=>{if(active)setStudioStatus(data.studioConfigured?'ready':'unavailable')}).catch(()=>{if(active)setStudioStatus('unavailable')});return()=>{active=false}},[]);
  useEffect(()=>{saveVoiceSettings({engine,voiceURI,rate});if(engine==='system')setStudioIssue('')},[engine,voiceURI,rate]);
  useEffect(()=>{if(!settingsOpen)return;const closeOnOutside=(event:PointerEvent)=>{const target=event.target;if(target instanceof Node&&!narratorRef.current?.contains(target))setSettingsOpen(false)};const closeOnEscape=(event:KeyboardEvent)=>{if(event.key==='Escape')setSettingsOpen(false)};document.addEventListener('pointerdown',closeOnOutside);window.addEventListener('keydown',closeOnEscape);return()=>{document.removeEventListener('pointerdown',closeOnOutside);window.removeEventListener('keydown',closeOnEscape)}},[settingsOpen]);
  useEffect(()=>{const stopHandler=()=>stop();const requestHandler=(event:Event)=>{const source=(event as CustomEvent<AudioRequestDetail>).detail?.source;if(source!=='narrator')stop()};window.addEventListener('mathnikita-stop-narration',stopHandler);window.addEventListener('mathnikita-audio-request',requestHandler);return()=>{window.removeEventListener('mathnikita-stop-narration',stopHandler);window.removeEventListener('mathnikita-audio-request',requestHandler)}},[]);
  useEffect(()=>{stop();return()=>stop()},[mode,rootRef,lessonNumber]);
  useEffect(()=>{
    if(engine!=='studio')return;
    if(mode==='opening'){const id=getNarrationId(null,mode,lessonNumber);const text=getNarrationText(null,mode,openingText,lessonNumber);if(id&&text)prefetchStudioAudioUrl(id,text);return}
    let retryTimer:number|null=null;let retries=0;
    const warm=()=>{const root=rootRef.current;const id=getNarrationId(root,mode,lessonNumber);const text=getNarrationText(root,mode,openingText,lessonNumber);if(id&&text){prefetchStudioAudioUrl(id,text);retries=0;return}if(retries<6){retries+=1;retryTimer=window.setTimeout(warm,60*retries)}};
    const scheduleWarm=()=>{if(retryTimer!==null)window.clearTimeout(retryTimer);retryTimer=window.setTimeout(warm,0)};warm();const root=rootRef.current;
    if(!root){retryTimer=window.setTimeout(warm,80);return()=>{if(retryTimer!==null)window.clearTimeout(retryTimer)}}
    const observer=new MutationObserver(scheduleWarm);observer.observe(root,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['data-practice-task','data-stage-id','hidden']});return()=>{observer.disconnect();if(retryTimer!==null)window.clearTimeout(retryTimer)};
  },[engine,mode,rootRef,lessonNumber,openingText]);

  useEffect(()=>{
    if(mode!=='lesson'||lessonNumber<6||lessonNumber>16){lastAutoStageRef.current='';return}
    const root=rootRef.current;if(!root)return;
    let timer:number|null=null;
    const schedule=()=>{
      const stage=resolveStageNarration(root,lessonNumber);if(!stage||stage.id===lastAutoStageRef.current)return;
      lastAutoStageRef.current=stage.id;
      if(timer!==null)window.clearTimeout(timer);
      timer=window.setTimeout(()=>{const latest=resolveStageNarration(root,lessonNumber);if(latest?.id===stage.id)playNarration(latest.text,latest.id,true)},70);
    };
    schedule();
    const observer=new MutationObserver(schedule);observer.observe(root,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['data-stage-id','hidden']});
    return()=>{observer.disconnect();if(timer!==null)window.clearTimeout(timer)};
  },[mode,lessonNumber,rootRef,engine,rate,voiceURI]);

  function startSystemSpeech(text:string,narrationId:string,session:number,autoStage:boolean){
    if(!systemSupported||!text){setSpeaking(false);if(autoStage)releaseAutoStage(session,narrationId,false);return}
    window.speechSynthesis.cancel();const chunks=splitForSpeech(studioNarrationText(text));const selectedVoice=selectBestRussianVoice(voices,voiceURI);setSpeaking(true);let index=0;
    const playNext=()=>{if(sessionRef.current!==session)return;if(index>=chunks.length){setSpeaking(false);if(autoStage)releaseAutoStage(session,narrationId,true);return}const utterance=new SpeechSynthesisUtterance(chunks[index]);utterance.lang='ru-RU';utterance.voice=selectedVoice??null;utterance.rate=Math.min(Math.max(rate,.88),1.04);utterance.pitch=1;utterance.volume=1;utterance.onend=()=>{index+=1;window.setTimeout(playNext,130)};utterance.onerror=()=>{setSpeaking(false);if(autoStage)releaseAutoStage(session,narrationId,false)};window.speechSynthesis.speak(utterance)};playNext()
  }

  function playStudioSource(source:string,session:number,narrationId:string,autoStage:boolean){
    const audio=createNarrationAudio(source);if(!audio){failStudio(session,'AI-аудио не поддерживается этим браузером.');return}
    audio.preload='auto';audio.playbackRate=rate;audioRef.current=audio;setSpeaking(true);
    const fail=()=>failStudio(session);audio.onended=()=>{if(sessionRef.current===session){setSpeaking(false);if(autoStage)releaseAutoStage(session,narrationId,true)}audioRef.current=null};audio.onerror=fail;
    void audio.play().then(()=>{if(sessionRef.current===session)window.dispatchEvent(new CustomEvent('mathnikita-audio-played',{detail:{source:'narrator',lessonNumber,narrationId}}))}).catch(fail);
  }

  async function startStudioSpeech(text:string,narrationId:string,session:number,autoStage:boolean){
    if(!narrationId){failStudio(session);return}setSpeaking(true);
    try{const source=await getStudioAudioUrl(narrationId,text);if(sessionRef.current===session)playStudioSource(source,session,narrationId,autoStage)}catch{failStudio(session)}
  }

  function playNarration(text:string,narrationId:string,autoStage=false){
    if(!text||!narrationId)return;
    stop();setStudioIssue('');const session=sessionRef.current+1;sessionRef.current=session;
    if(autoStage){autoStageSessionRef.current=session;autoStageIdRef.current=narrationId;setStageNarrationActive(true,narrationId)}
    window.dispatchEvent(new CustomEvent('mathnikita-audio-request',{detail:{source:'narrator'}}));
    if(engine==='studio'){const readySource=peekStudioAudioUrl(narrationId,text);if(readySource){playStudioSource(readySource,session,narrationId,autoStage);return}void startStudioSpeech(text,narrationId,session,autoStage);return}
    startSystemSpeech(text,narrationId,session,autoStage);
  }

  function speak(){
    if(speaking){stop();return}
    const text=getNarrationText(rootRef.current,mode,openingText,lessonNumber);const narrationId=getNarrationId(rootRef.current,mode,lessonNumber);playNarration(text,narrationId,false);
  }

  const voiceOptions=rankRussianVoices(voices);const selectedVoice=selectBestRussianVoice(voiceOptions,voiceURI);
  const systemVoiceMessage=!selectedVoice?'На устройстве не найден русский голос.':isNaturalRussianVoice(selectedVoice)?`Системный голос: ${selectedVoice.name}.`:`Базовый системный голос: ${selectedVoice.name}.`;
  const studioMessage=studioIssue|| (studioStatus==='ready'?`Единый AI-голос ${STUDIO_VOICE_LABEL} готов. Автоматической подмены системным голосом нет.`:studioStatus==='checking'?'Проверяем единый AI-голос…':'Серверный AI-голос сейчас недоступен. Системный голос не включится автоматически.');
  const playbackUnavailable=engine==='studio'?!audioSupported:!systemSupported;

  return <div className="voice-narrator" ref={narratorRef}>
    <button type="button" className={`${speaking?'is-speaking ':''}${studioIssue&&engine==='studio'?'has-error':''}`.trim()} onClick={speak} aria-pressed={speaking} disabled={playbackUnavailable}><span aria-hidden="true">{speaking?'■':'▶'}</span>{speaking?'Остановить':engine==='studio'?(studioIssue?'Повторить · AI':'Слушать · AI'):'Слушать'}</button>
    <span className="voice-ai-disclosure" title="Озвучка создаётся искусственным интеллектом">AI-голос</span>
    <button type="button" className="voice-settings-button" onClick={()=>setSettingsOpen(open=>!open)} aria-expanded={settingsOpen} aria-label={settingsOpen?'Закрыть настройки голоса':'Настройки голоса'}>⚙</button>
    {settingsOpen?<div className="voice-settings-panel" role="dialog" aria-label="Настройки голоса">
      <div className="voice-settings-heading"><b>Настройки голоса</b><button type="button" className="voice-settings-close" onClick={()=>setSettingsOpen(false)} aria-label="Закрыть настройки">×</button></div>
      <label><span>Режим озвучки</span><select value={engine} onChange={event=>setEngine(event.target.value as VoiceEngine)}><option value="studio">Единый AI-голос {STUDIO_VOICE_LABEL} · рекомендуется</option><option value="system">Системный голос устройства · вручную</option></select></label>
      {engine==='studio'?<div className="voice-fixed-profile"><b>{STUDIO_VOICE_LABEL}</b><span>тёплый русский преподаватель · один голос на всех устройствах</span></div>:null}
      {engine==='system'&&voiceOptions.length?<label><span>Русский голос устройства</span><select value={selectedVoice?.voiceURI??''} onChange={event=>setVoiceURI(event.target.value)}>{voiceOptions.map((voice,index)=><option key={voice.voiceURI} value={voice.voiceURI}>{voice.name}{index===0?' · рекомендуется':''}{voice.localService?' · на устройстве':''}</option>)}</select></label>:null}
      <label><span>Скорость: {rate.toFixed(2)}×</span><input type="range" min="0.88" max="1.04" step="0.02" value={rate} onChange={event=>setRate(Number(event.target.value))}/></label>
      <small className={engine==='studio'?studioStatus==='ready'&&!studioIssue?'voice-engine-ready':'voice-engine-pending':isRussianVoice(selectedVoice??{name:'',lang:'',voiceURI:'',localService:false})?'voice-engine-ready':'voice-engine-pending'}>{engine==='studio'?studioMessage:systemVoiceMessage}</small>
      <small className="voice-ai-note">Голос {STUDIO_VOICE_LABEL} — AI-сгенерированная озвучка, а не запись человека.</small>
    </div>:null}
  </div>;
}