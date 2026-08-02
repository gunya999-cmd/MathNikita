import { useEffect,useMemo,useRef,useState } from 'react';
import { extendedPracticeByLesson } from './data/extendedPracticeData';
import { extendedPracticeSetResponseCount,type ExtendedPracticeTask } from './data/extendedPracticeTypes';
import { extendedPracticeStorageKey,isExtendedPracticeAnswerCorrect,loadExtendedPracticeProgress,saveExtendedPracticeProgress } from './extendedPracticeEngine';
import { PracticePythagoras } from './PracticePythagoras';
import { prepareRussianSpeechText,selectBestRussianVoice } from './voiceQuality';
import { getStudioAudioUrl,loadVoiceSettings,peekStudioAudioUrl,prefetchStudioAudioUrl,STUDIO_VOICE_LABEL } from './studioVoice';
import './extendedPracticeLab.css';

type Props={lessonNumber:number;onComplete?:()=>void;onRestart?:()=>void};
type CheckState='idle'|'correct'|'wrong';
type PracticeDraft={taskId:string;response:string;multiResponse:Record<string,string>};
type AudioRequestDetail={source?:string};

function draftStorageKey(lessonNumber:number){return `${extendedPracticeStorageKey(lessonNumber)}:draft`}
function loadDraft(lessonNumber:number,taskId:string):PracticeDraft|null{
  try{const parsed=JSON.parse(localStorage.getItem(draftStorageKey(lessonNumber))??'null') as PracticeDraft|null;return parsed?.taskId===taskId?parsed:null}catch{return null}
}
function saveDraft(lessonNumber:number,draft:PracticeDraft){localStorage.setItem(draftStorageKey(lessonNumber),JSON.stringify(draft))}
function clearDraft(lessonNumber:number){localStorage.removeItem(draftStorageKey(lessonNumber))}
function safeToken(value:string){return value.toLowerCase().replace(/[^a-z0-9-]+/g,'-').replace(/^-+|-+$/g,'').slice(0,96)}
function practiceNarrationId(lessonNumber:number,task:ExtendedPracticeTask){return`lesson-${String(lessonNumber).padStart(2,'0')}-practice-${safeToken(task.id)}`}
function practiceNarrationText(task:ExtendedPracticeTask,index:number,total:number){
  const parts=[`Задание ${index+1} из ${total}.`,task.prompt,task.instruction??''];
  if(task.type==='choice')parts.push(`Варианты ответа: ${task.options.join('; ')}.`);
  if(task.type==='multi-input')parts.push(`Нужно заполнить: ${task.fields.map(field=>field.label).join('; ')}.`);
  return parts.filter(Boolean).join(' ');
}

export function ExtendedPracticeLab({lessonNumber,onComplete,onRestart}:Props){
  const practice=extendedPracticeByLesson[lessonNumber];
  const[completed,setCompleted]=useState(()=>loadExtendedPracticeProgress(lessonNumber,practice?.tasks.length??0));
  const[response,setResponse]=useState('');
  const[multiResponse,setMultiResponse]=useState<Record<string,string>>({});
  const[checkState,setCheckState]=useState<CheckState>('idle');
  const[attempts,setAttempts]=useState(0);
  const[practiceSpeaking,setPracticeSpeaking]=useState(false);
  const[practiceVoiceIssue,setPracticeVoiceIssue]=useState(false);
  const responseCount=useMemo(()=>practice?extendedPracticeSetResponseCount(practice):0,[practice]);
  const audioRef=useRef<HTMLAudioElement|null>(null);
  const speechTokenRef=useRef(0);
  const lastSpokenTaskRef=useRef('');
  const finished=Boolean(practice&&completed>=practice.tasks.length);
  const currentTask=practice&&!finished?practice.tasks[completed]:null;

  function stopPracticeVoice(){speechTokenRef.current+=1;if(audioRef.current){audioRef.current.pause();audioRef.current.currentTime=0;audioRef.current.src='';audioRef.current=null}window.speechSynthesis?.cancel();setPracticeSpeaking(false)}
  function playSystemNarration(text:string,token:number){
    if(!('speechSynthesis'in window)){setPracticeSpeaking(false);setPracticeVoiceIssue(true);return}
    const settings=loadVoiceSettings();const selected=selectBestRussianVoice(window.speechSynthesis.getVoices(),settings.voiceURI);const utterance=new SpeechSynthesisUtterance(prepareRussianSpeechText(text));utterance.lang='ru-RU';utterance.voice=selected??null;utterance.rate=settings.rate;utterance.onend=()=>{if(token===speechTokenRef.current)setPracticeSpeaking(false)};utterance.onerror=()=>{if(token===speechTokenRef.current){setPracticeSpeaking(false);setPracticeVoiceIssue(true)}};setPracticeSpeaking(true);window.speechSynthesis.speak(utterance);
  }
  function playAudioSource(source:string,token:number){
    if(typeof Audio==='undefined'){setPracticeSpeaking(false);setPracticeVoiceIssue(true);return}
    const settings=loadVoiceSettings();const audio=new Audio(source);audioRef.current=audio;audio.preload='auto';audio.playbackRate=settings.rate;audio.onended=()=>{if(token===speechTokenRef.current)setPracticeSpeaking(false);audioRef.current=null};const fail=()=>{if(token===speechTokenRef.current){audioRef.current=null;setPracticeSpeaking(false);setPracticeVoiceIssue(true)}};audio.onerror=fail;void audio.play().catch(fail);
  }
  function playTaskNarration(task:ExtendedPracticeTask,index:number){
    stopPracticeVoice();setPracticeVoiceIssue(false);lastSpokenTaskRef.current=task.id;const token=++speechTokenRef.current;const settings=loadVoiceSettings();const text=practiceNarrationText(task,index,practice?.tasks.length??1);window.dispatchEvent(new CustomEvent('mathnikita-audio-request',{detail:{source:'practice-narrator'}}));
    if(settings.engine!=='studio'){playSystemNarration(text,token);return}
    const id=practiceNarrationId(lessonNumber,task);const ready=peekStudioAudioUrl(id,text);setPracticeSpeaking(true);if(ready){playAudioSource(ready,token);return}
    void getStudioAudioUrl(id,text).then(source=>{if(token===speechTokenRef.current)playAudioSource(source,token)}).catch(()=>{if(token===speechTokenRef.current){setPracticeSpeaking(false);setPracticeVoiceIssue(true)}});
  }

  useEffect(()=>{
    const nextCompleted=loadExtendedPracticeProgress(lessonNumber,practice?.tasks.length??0);setCompleted(nextCompleted);
    const nextTask=practice&&nextCompleted<practice.tasks.length?practice.tasks[nextCompleted]:null;const draft=nextTask?loadDraft(lessonNumber,nextTask.id):null;
    setResponse(draft?.response??'');setMultiResponse(draft?.multiResponse??{});setCheckState('idle');setAttempts(0);lastSpokenTaskRef.current='';stopPracticeVoice();
  },[lessonNumber,practice?.tasks.length]);

  useEffect(()=>{
    const reset=(event:Event)=>{const detail=(event as CustomEvent<{lessonNumber?:number}>).detail;if(detail?.lessonNumber!==lessonNumber)return;setCompleted(0);setResponse('');setMultiResponse({});setCheckState('idle');setAttempts(0);lastSpokenTaskRef.current='';stopPracticeVoice();onRestart?.()};
    window.addEventListener('mathnikita-lesson-reset',reset);return()=>window.removeEventListener('mathnikita-lesson-reset',reset);
  },[lessonNumber,onRestart]);
  useEffect(()=>{
    const stopHandler=()=>stopPracticeVoice();const requestHandler=(event:Event)=>{const source=(event as CustomEvent<AudioRequestDetail>).detail?.source;if(source!=='practice-narrator')stopPracticeVoice()};
    window.addEventListener('mathnikita-stop-narration',stopHandler);window.addEventListener('mathnikita-audio-request',requestHandler);return()=>{window.removeEventListener('mathnikita-stop-narration',stopHandler);window.removeEventListener('mathnikita-audio-request',requestHandler)};
  },[]);

  useEffect(()=>{if(finished)onComplete?.()},[finished,onComplete]);
  useEffect(()=>{
    if(!practice||!currentTask)return;
    const currentText=practiceNarrationText(currentTask,completed,practice.tasks.length);prefetchStudioAudioUrl(practiceNarrationId(lessonNumber,currentTask),currentText);
    const nextTask=practice.tasks[completed+1];if(nextTask)prefetchStudioAudioUrl(practiceNarrationId(lessonNumber,nextTask),practiceNarrationText(nextTask,completed+1,practice.tasks.length));
    if(lastSpokenTaskRef.current===currentTask.id)return;
    const timer=window.setTimeout(()=>playTaskNarration(currentTask,completed),120);return()=>window.clearTimeout(timer);
  },[lessonNumber,currentTask?.id]);
  useEffect(()=>()=>stopPracticeVoice(),[]);

  if(!practice)return null;

  function resetCurrentResponse(){setResponse('');setMultiResponse({});setCheckState('idle');setAttempts(0)}
  function hasCompleteResponse(){
    if(finished)return false;const task=practice.tasks[completed];if(task.type==='multi-input')return task.fields.every(field=>(multiResponse[field.id]??'').trim());return Boolean(response.trim());
  }
  function checkAnswer(){
    if(!hasCompleteResponse()||finished)return;const task=practice.tasks[completed];const correct=isExtendedPracticeAnswerCorrect(task,task.type==='multi-input'?multiResponse:response);setCheckState(correct?'correct':'wrong');
    if(!correct){const nextAttempts=attempts+1;setAttempts(nextAttempts);window.dispatchEvent(new CustomEvent('mathnikita-practice-mentor-speak',{detail:{taskId:task.id,state:'wrong',attempts:nextAttempts}}))}
  }
  function continuePractice(){
    if(checkState!=='correct')return;const next=completed+1;clearDraft(lessonNumber);saveExtendedPracticeProgress(lessonNumber,next);
    const nextTask=practice.tasks[next];if(nextTask)playTaskNarration(nextTask,next);else stopPracticeVoice();setCompleted(next);resetCurrentResponse();
  }
  function restartPractice(){clearDraft(lessonNumber);saveExtendedPracticeProgress(lessonNumber,0);setCompleted(0);lastSpokenTaskRef.current='';resetCurrentResponse();stopPracticeVoice();onRestart?.()}

  if(finished)return <section className="extended-practice is-finished" aria-labelledby={`extended-practice-title-${lessonNumber}`}><div className="extended-practice-finish-mark" aria-hidden="true">✓</div><div><span>Обязательная практика завершена</span><h2 id={`extended-practice-title-${lessonNumber}`}>{practice.title}</h2><p>Решены все {practice.tasks.length} заданий и заполнены {responseCount} проверяемых ответов. Теперь можно завершить урок собственным объяснением.</p></div><button type="button" className="extended-practice-restart" onClick={restartPractice}>Пройти ещё раз</button></section>;

  const task=practice.tasks[completed];const percent=Math.round(completed/practice.tasks.length*100);const canCheck=hasCompleteResponse();
  return <section className="extended-practice" aria-labelledby={`extended-practice-title-${lessonNumber}`} data-practice-task={task.id} data-practice-response-count={responseCount}>
    <header className="extended-practice-header"><div><span>Обязательная практика · {practice.tasks.length} заданий · {responseCount} проверяемых ответов</span><h2 id={`extended-practice-title-${lessonNumber}`}>{practice.title}</h2><p>{practice.subtitle}</p></div><strong>{completed+1} / {practice.tasks.length}</strong></header>
    <div className="extended-practice-progress" aria-label={`Выполнено ${completed} из ${practice.tasks.length}`}><i style={{width:`${percent}%`}}/></div>
    <article className="extended-practice-card"><div className="extended-practice-task-number">Задание {completed+1}</div><h3>{task.prompt}</h3><p className="extended-practice-instruction">{task.instruction}</p>
      <div className="extended-practice-voice"><button type="button" className={practiceSpeaking?'is-speaking':''} onClick={()=>practiceSpeaking?stopPracticeVoice():playTaskNarration(task,completed)}>{practiceSpeaking?'■ Остановить':'▶ Озвучить задание'}</button><small>{practiceVoiceIssue?`AI-голос ${STUDIO_VOICE_LABEL} временно недоступен — можно читать задание на экране.`:`Автоозвучка практики · ${STUDIO_VOICE_LABEL}`}</small></div>
      {task.type==='choice'?<div className="extended-practice-options">{task.options.map(option=><button key={option} type="button" className={response===option?'is-selected':''} aria-pressed={response===option} onClick={()=>{setResponse(option);setCheckState('idle');saveDraft(lessonNumber,{taskId:task.id,response:option,multiResponse:{}})}} disabled={checkState==='correct'}>{option}</button>)}</div>:task.type==='multi-input'?<div className="extended-practice-multi">{task.fields.map(field=><label className="extended-practice-input" key={field.id}><span>{field.label}</span><input value={multiResponse[field.id]??''} onChange={event=>{const next={...multiResponse,[field.id]:event.target.value};setMultiResponse(next);setCheckState('idle');saveDraft(lessonNumber,{taskId:task.id,response:'',multiResponse:next})}} onKeyDown={event=>{if(event.key==='Enter'&&canCheck)checkAnswer()}} placeholder={field.placeholder??'Введи ответ'} disabled={checkState==='correct'}/></label>)}</div>:<label className="extended-practice-input"><span>Ответ</span><input value={response} onChange={event=>{const next=event.target.value;setResponse(next);setCheckState('idle');saveDraft(lessonNumber,{taskId:task.id,response:next,multiResponse:{}})}} onKeyDown={event=>{if(event.key==='Enter')checkAnswer()}} placeholder="Введи ответ" disabled={checkState==='correct'}/></label>}
      {checkState==='wrong'?<div className="extended-practice-feedback is-wrong" role="alert"><b>Пока неверно.</b><span>{attempts>=1?task.hint:'Проверь решение целиком и попробуй ещё раз.'}</span></div>:null}
      {checkState==='correct'?<div className="extended-practice-feedback is-correct" role="status"><b>Верно!</b><span>{task.explanation}</span></div>:null}
      <PracticePythagoras lessonNumber={lessonNumber} task={task} checkState={checkState} attempts={attempts}/>
      <div className="extended-practice-actions">{checkState==='correct'?<button type="button" className="extended-practice-next" onClick={continuePractice}>{completed+1===practice.tasks.length?'Завершить практику':'Следующее задание →'}</button>:<button type="button" className="extended-practice-check" onClick={checkAnswer} disabled={!canCheck}>Проверить</button>}</div>
    </article>
  </section>;
}
