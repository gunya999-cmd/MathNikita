import { useEffect,useMemo,useState } from 'react';
import { extendedPracticeByLesson } from './data/extendedPracticeData';
import { extendedPracticeSetResponseCount } from './data/extendedPracticeTypes';
import { extendedPracticeStorageKey,isExtendedPracticeAnswerCorrect,loadExtendedPracticeProgress,saveExtendedPracticeProgress } from './extendedPracticeEngine';
import './extendedPracticeLab.css';

type Props={lessonNumber:number;onComplete?:()=>void;onRestart?:()=>void};
type CheckState='idle'|'correct'|'wrong';
type PracticeDraft={taskId:string;response:string;multiResponse:Record<string,string>};

function draftStorageKey(lessonNumber:number){return `${extendedPracticeStorageKey(lessonNumber)}:draft`}
function loadDraft(lessonNumber:number,taskId:string):PracticeDraft|null{
  try{
    const parsed=JSON.parse(localStorage.getItem(draftStorageKey(lessonNumber))??'null') as PracticeDraft|null;
    return parsed?.taskId===taskId?parsed:null;
  }catch{return null}
}
function saveDraft(lessonNumber:number,draft:PracticeDraft){localStorage.setItem(draftStorageKey(lessonNumber),JSON.stringify(draft))}
function clearDraft(lessonNumber:number){localStorage.removeItem(draftStorageKey(lessonNumber))}

export function ExtendedPracticeLab({lessonNumber,onComplete,onRestart}:Props){
  const practice=extendedPracticeByLesson[lessonNumber];
  const[completed,setCompleted]=useState(()=>loadExtendedPracticeProgress(lessonNumber,practice?.tasks.length??0));
  const[response,setResponse]=useState('');
  const[multiResponse,setMultiResponse]=useState<Record<string,string>>({});
  const[checkState,setCheckState]=useState<CheckState>('idle');
  const[attempts,setAttempts]=useState(0);
  const responseCount=useMemo(()=>practice?extendedPracticeSetResponseCount(practice):0,[practice]);

  useEffect(()=>{
    const nextCompleted=loadExtendedPracticeProgress(lessonNumber,practice?.tasks.length??0);
    setCompleted(nextCompleted);
    const nextTask=practice&&nextCompleted<practice.tasks.length?practice.tasks[nextCompleted]:null;
    const draft=nextTask?loadDraft(lessonNumber,nextTask.id):null;
    setResponse(draft?.response??'');setMultiResponse(draft?.multiResponse??{});setCheckState('idle');setAttempts(0);
  },[lessonNumber,practice?.tasks.length]);

  useEffect(()=>{
    const reset=(event:Event)=>{
      const detail=(event as CustomEvent<{lessonNumber?:number}>).detail;
      if(detail?.lessonNumber!==lessonNumber)return;
      setCompleted(0);setResponse('');setMultiResponse({});setCheckState('idle');setAttempts(0);onRestart?.();
    };
    window.addEventListener('mathnikita-lesson-reset',reset);
    return()=>window.removeEventListener('mathnikita-lesson-reset',reset);
  },[lessonNumber,onRestart]);

  const finished=Boolean(practice&&completed>=practice.tasks.length);
  useEffect(()=>{if(finished)onComplete?.()},[finished,onComplete]);
  if(!practice)return null;

  function resetCurrentResponse(){setResponse('');setMultiResponse({});setCheckState('idle');setAttempts(0)}
  function hasCompleteResponse(){
    if(finished)return false;
    const task=practice.tasks[completed];
    if(task.type==='multi-input')return task.fields.every(field=>(multiResponse[field.id]??'').trim());
    return Boolean(response.trim());
  }
  function checkAnswer(){
    if(!hasCompleteResponse()||finished)return;
    const task=practice.tasks[completed];
    const correct=isExtendedPracticeAnswerCorrect(task,task.type==='multi-input'?multiResponse:response);
    setCheckState(correct?'correct':'wrong');if(!correct)setAttempts(value=>value+1);
  }
  function continuePractice(){
    if(checkState!=='correct')return;
    const next=completed+1;clearDraft(lessonNumber);saveExtendedPracticeProgress(lessonNumber,next);setCompleted(next);resetCurrentResponse();
  }
  function restartPractice(){
    clearDraft(lessonNumber);saveExtendedPracticeProgress(lessonNumber,0);setCompleted(0);resetCurrentResponse();onRestart?.();
  }

  if(finished)return <section className="extended-practice is-finished" aria-labelledby={`extended-practice-title-${lessonNumber}`}><div className="extended-practice-finish-mark" aria-hidden="true">✓</div><div><span>Обязательная практика завершена</span><h2 id={`extended-practice-title-${lessonNumber}`}>{practice.title}</h2><p>Решены все {practice.tasks.length} заданий и заполнены {responseCount} проверяемых ответов. Теперь можно завершить урок собственным объяснением.</p></div><button type="button" className="extended-practice-restart" onClick={restartPractice}>Пройти ещё раз</button></section>;

  const task=practice.tasks[completed];const percent=Math.round(completed/practice.tasks.length*100);const canCheck=hasCompleteResponse();
  return <section className="extended-practice" aria-labelledby={`extended-practice-title-${lessonNumber}`} data-practice-task={task.id} data-practice-response-count={responseCount}>
    <header className="extended-practice-header"><div><span>Обязательная практика · {practice.tasks.length} заданий · {responseCount} проверяемых ответов</span><h2 id={`extended-practice-title-${lessonNumber}`}>{practice.title}</h2><p>{practice.subtitle}</p></div><strong>{completed+1} / {practice.tasks.length}</strong></header>
    <div className="extended-practice-progress" aria-label={`Выполнено ${completed} из ${practice.tasks.length}`}><i style={{width:`${percent}%`}}/></div>
    <article className="extended-practice-card"><div className="extended-practice-task-number">Задание {completed+1}</div><h3>{task.prompt}</h3><p className="extended-practice-instruction">{task.instruction}</p>
      {task.type==='choice'?<div className="extended-practice-options">{task.options.map(option=><button key={option} type="button" className={response===option?'is-selected':''} aria-pressed={response===option} onClick={()=>{setResponse(option);setCheckState('idle');saveDraft(lessonNumber,{taskId:task.id,response:option,multiResponse:{}})}} disabled={checkState==='correct'}>{option}</button>)}</div>:task.type==='multi-input'?<div className="extended-practice-multi">{task.fields.map(field=><label className="extended-practice-input" key={field.id}><span>{field.label}</span><input value={multiResponse[field.id]??''} onChange={event=>{const next={...multiResponse,[field.id]:event.target.value};setMultiResponse(next);setCheckState('idle');saveDraft(lessonNumber,{taskId:task.id,response:'',multiResponse:next})}} onKeyDown={event=>{if(event.key==='Enter'&&canCheck)checkAnswer()}} placeholder={field.placeholder??'Введи ответ'} disabled={checkState==='correct'}/></label>)}</div>:<label className="extended-practice-input"><span>Ответ</span><input value={response} onChange={event=>{const next=event.target.value;setResponse(next);setCheckState('idle');saveDraft(lessonNumber,{taskId:task.id,response:next,multiResponse:{}})}} onKeyDown={event=>{if(event.key==='Enter')checkAnswer()}} placeholder="Введи ответ" disabled={checkState==='correct'}/></label>}
      {checkState==='wrong'?<div className="extended-practice-feedback is-wrong" role="alert"><b>Пока неверно.</b><span>{attempts>=1?task.hint:'Проверь решение целиком и попробуй ещё раз.'}</span></div>:null}
      {checkState==='correct'?<div className="extended-practice-feedback is-correct" role="status"><b>Верно!</b><span>{task.explanation}</span></div>:null}
      <div className="extended-practice-actions">{checkState==='correct'?<button type="button" className="extended-practice-next" onClick={continuePractice}>{completed+1===practice.tasks.length?'Завершить практику':'Следующее задание →'}</button>:<button type="button" className="extended-practice-check" onClick={checkAnswer} disabled={!canCheck}>Проверить</button>}</div>
    </article>
  </section>;
}
