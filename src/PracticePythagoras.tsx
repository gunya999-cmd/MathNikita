import { useEffect,useMemo,useRef,useState } from 'react';
import type { ExtendedPracticeTask } from './data/extendedPracticeTypes';
import { prepareRussianSpeechText,selectBestRussianVoice } from './voiceQuality';
import { getStudioAudioUrl,loadVoiceSettings,peekStudioAudioUrl,prefetchStudioAudioUrl,STUDIO_VOICE_LABEL } from './studioVoice';

type CheckState='idle'|'correct'|'wrong';
type MentorAction='status'|'different'|'example'|'hint'|'why';
type Props={lessonNumber:number;task:ExtendedPracticeTask;checkState:CheckState;attempts:number};
type MentorSpeakDetail={taskId?:string;state?:CheckState;attempts?:number};
type AudioRequestDetail={source?:string};

function safeToken(value:string){return value.toLowerCase().replace(/[^a-z0-9-]+/g,'-').replace(/^-+|-+$/g,'').slice(0,80)}
function responseGuide(task:ExtendedPracticeTask){
  if(task.type==='multi-input')return 'Разбей решение на маленькие шаги и заполняй поля по порядку. После каждого шага проверь единицы и смысл полученного числа.';
  if(task.type==='choice')return 'Не угадывай вариант. Проверь каждый ответ по условию и сначала отбрось те, которые явно ему противоречат.';
  return 'Сначала выпиши на бумаге, что известно и что нужно найти. Сделай вычисление отдельно и только потом перенеси итог в поле ответа.';
}
function exampleGuide(task:ExtendedPracticeTask){
  const base=responseGuide(task);
  return `Возьми похожий более простой случай и выполни на нём тот же ход, не решая исходное задание наугад. ${base} Затем вернись к своим данным. ${task.hint}`;
}
function messageFor(task:ExtendedPracticeTask,state:CheckState,attempts:number,action:MentorAction){
  if(state==='correct')return `Верно. Теперь можно разобрать решение: ${task.explanation}`;
  if(action==='hint')return `Подсказка. ${task.hint}`;
  if(action==='different')return `Скажу иначе. ${task.instruction??responseGuide(task)} ${task.hint}`;
  if(action==='example')return exampleGuide(task);
  if(action==='why')return `Здесь важно не угадать ответ, а доказать его шагами. ${responseGuide(task)} ${task.hint}`;
  if(state==='wrong')return attempts>1?`Пока не сходится. Не спеши менять ответ наугад. ${responseGuide(task)} ${task.hint}`:`Пока неверно. Начни с одного шага: ${task.hint}`;
  return 'Я рядом. Сначала попробуй решить самостоятельно. Если застрянешь, нажми «Подсказка», «Объясни иначе» или «Дай пример».';
}

export function PracticePythagoras({lessonNumber,task,checkState,attempts}:Props){
  const[action,setAction]=useState<MentorAction>('status');
  const[speaking,setSpeaking]=useState(false);
  const[voiceIssue,setVoiceIssue]=useState(false);
  const audioRef=useRef<HTMLAudioElement|null>(null);
  const tokenRef=useRef(0);
  const message=useMemo(()=>messageFor(task,checkState,attempts,action),[task,checkState,attempts,action]);

  function narrationId(voiceAction:MentorAction){return`mentor-practice-${lessonNumber}-${safeToken(task.id)}-${safeToken(voiceAction)}`}
  function stop(){tokenRef.current+=1;if(audioRef.current){audioRef.current.pause();audioRef.current.currentTime=0;audioRef.current.src='';audioRef.current=null}window.speechSynthesis?.cancel();setSpeaking(false)}
  function systemSpeak(text:string,token:number){
    if(!('speechSynthesis'in window)){setSpeaking(false);return}
    const settings=loadVoiceSettings();const voice=selectBestRussianVoice(window.speechSynthesis.getVoices(),settings.voiceURI);const utterance=new SpeechSynthesisUtterance(prepareRussianSpeechText(text));utterance.lang='ru-RU';utterance.voice=voice??null;utterance.rate=settings.rate;utterance.onend=()=>{if(token===tokenRef.current)setSpeaking(false)};utterance.onerror=()=>setSpeaking(false);setSpeaking(true);window.speechSynthesis.speak(utterance);
  }
  function playSource(source:string,token:number){
    if(typeof Audio==='undefined'){setSpeaking(false);setVoiceIssue(true);return}
    const settings=loadVoiceSettings();const audio=new Audio(source);audioRef.current=audio;audio.preload='auto';audio.playbackRate=settings.rate;audio.onended=()=>{if(token===tokenRef.current)setSpeaking(false);audioRef.current=null};const fail=()=>{if(token===tokenRef.current){audioRef.current=null;setSpeaking(false);setVoiceIssue(true)}};audio.onerror=fail;void audio.play().catch(fail);
  }
  function speak(text=message,voiceAction=action){
    if(speaking){stop();return}
    stop();setVoiceIssue(false);const token=++tokenRef.current;const settings=loadVoiceSettings();window.dispatchEvent(new CustomEvent('mathnikita-audio-request',{detail:{source:'practice-mentor'}}));
    if(settings.engine!=='studio'){systemSpeak(text,token);return}
    const id=narrationId(voiceAction);const ready=peekStudioAudioUrl(id,text);setSpeaking(true);if(ready){playSource(ready,token);return}
    void getStudioAudioUrl(id,text).then(source=>{if(token===tokenRef.current)playSource(source,token)}).catch(()=>{if(token===tokenRef.current){setSpeaking(false);setVoiceIssue(true)}});
  }
  function choose(next:MentorAction){setAction(next);const nextMessage=messageFor(task,checkState,attempts,next);speak(nextMessage,next)}

  useEffect(()=>{
    stop();setAction('status');setVoiceIssue(false);
    const firstWrong=messageFor(task,'wrong',1,'status');prefetchStudioAudioUrl(narrationId('status'),firstWrong);
  },[task.id]);
  useEffect(()=>{setAction('status')},[checkState,attempts]);
  useEffect(()=>{
    const handler=(event:Event)=>{const detail=(event as CustomEvent<MentorSpeakDetail>).detail;if(detail?.taskId!==task.id||detail.state!=='wrong')return;const nextAttempts=Math.max(1,Number(detail.attempts)||1);setAction('status');speak(messageFor(task,'wrong',nextAttempts,'status'),'status')};
    window.addEventListener('mathnikita-practice-mentor-speak',handler);return()=>window.removeEventListener('mathnikita-practice-mentor-speak',handler);
  },[task.id]);
  useEffect(()=>{
    const stopHandler=()=>stop();const requestHandler=(event:Event)=>{const source=(event as CustomEvent<AudioRequestDetail>).detail?.source;if(source!=='practice-mentor')stop()};
    window.addEventListener('mathnikita-stop-narration',stopHandler);window.addEventListener('mathnikita-audio-request',requestHandler);return()=>{window.removeEventListener('mathnikita-stop-narration',stopHandler);window.removeEventListener('mathnikita-audio-request',requestHandler)};
  },[]);
  useEffect(()=>()=>stop(),[]);

  return <aside className={`practice-pythagoras is-${checkState}`} aria-label="Пифагор — наставник обязательной практики">
    <div className="practice-pythagoras-head"><div className="practice-pythagoras-badge" aria-hidden="true">π</div><div><span>Пифагор · практика</span><b>{checkState==='wrong'?'Разберём без готового ответа':checkState==='correct'?'Разбор решения':'Я рядом, если понадобится помощь'}</b></div><button type="button" className={speaking?'is-speaking':''} onClick={()=>speak()} aria-label={speaking?'Остановить Пифагора':'Озвучить подсказку Пифагора'}>{speaking?'■':'▶'}</button></div>
    <p className="practice-pythagoras-message">{message}</p>
    {voiceIssue?<small className="practice-pythagoras-voice-error">AI-голос {STUDIO_VOICE_LABEL} временно недоступен. Текст подсказки остаётся на экране.</small>:<small>Подсказки озвучивает тот же AI-голос {STUDIO_VOICE_LABEL}.</small>}
    <div className="practice-pythagoras-actions">
      <button type="button" onClick={()=>choose('different')}>↻ Объясни иначе</button>
      <button type="button" onClick={()=>choose('example')}>▣ Дай пример</button>
      <button type="button" onClick={()=>choose('hint')}>✦ Подсказка</button>
      <button type="button" onClick={()=>choose('why')}>? Почему так?</button>
    </div>
  </aside>;
}
