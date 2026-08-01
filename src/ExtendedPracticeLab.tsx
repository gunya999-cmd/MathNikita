import { useEffect,useMemo,useState } from 'react';
import { extendedPracticeByLesson } from './data/extendedPracticeData';
import { extendedPracticeSetResponseCount } from './data/extendedPracticeTypes';
import { isExtendedPracticeAnswerCorrect,loadExtendedPracticeProgress,saveExtendedPracticeProgress } from './extendedPracticeEngine';
import './extendedPracticeLab.css';

type Props={lessonNumber:number;onComplete?:()=>void};
type CheckState='idle'|'correct'|'wrong';

export function ExtendedPracticeLab({lessonNumber,onComplete}:Props){
  const practice=extendedPracticeByLesson[lessonNumber];
  const[completed,setCompleted]=useState(()=>loadExtendedPracticeProgress(lessonNumber,practice?.tasks.length??0));
  const[response,setResponse]=useState('');
  const[multiResponse,setMultiResponse]=useState<Record<string,string>>({});
  const[checkState,setCheckState]=useState<CheckState>('idle');
  const[attempts,setAttempts]=useState(0);
  const responseCount=useMemo(()=>practice?extendedPracticeSetResponseCount(practice):0,[practice]);

  useEffect(()=>{
    setCompleted(loadExtendedPracticeProgress(lessonNumber,practice?.tasks.length??0));
    setResponse('');setMultiResponse({});setCheckState('idle');setAttempts(0);
  },[lessonNumber,practice?.tasks.length]);

  const finished=Boolean(practice&&completed>=practice.tasks.length);
  useEffect(()=>{if(finished)onComplete?.()},[finished,onComplete]);
  if(!practice)return null;

  function resetCurrentResponse(){
    setResponse('');setMultiResponse({});setCheckState('idle');setAttempts(0);
  }

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
    setCheckState(correct?'correct':'wrong');
    if(!correct)setAttempts(value=>value+1);
  }

  function continuePractice(){
    if(checkState!=='correct')return;
    const next=completed+1;
    saveExtendedPracticeProgress(lessonNumber,next);
    setCompleted(next);resetCurrentResponse();
  }

  function restartPractice(){
    saveExtendedPracticeProgress(lessonNumber,0);
    setCompleted(0);resetCurrentResponse();
  }

  if(finished)return <section className="extended-practice is-finished" aria-labelledby={`extended-practice-title-${lessonNumber}`}><div className="extended-practice-finish-mark" aria-hidden="true">✓</div><div><span>Обязательная практика завершена</span><h2 id={`extended-practice-title-${lessonNumber}`}>{practice.title}</h2><p>Решены все {practice.tasks.length} заданий и заполнены {responseCount} проверяемых ответов. Теперь можно завершить урок собственным объяснением.</p></div><button type="button" className="extended-practice-restart" onClick={restartPractice}>Пройти ещё раз</button></section>;

  const task=practice.tasks[completed];
  const percent=Math.round(completed/practice.tasks.length*100);
  const canCheck=hasCompleteResponse();
  return <section className="extended-practice" aria-labelledby={`extended-practice-title-${lessonNumber}`} data-practice-task={task.id} data-practice-response-count={responseCount}>
    <header className="extended-practice-header"><div><span>Обязательная практика · {practice.tasks.length} заданий · {responseCount} проверяемых ответов</span><h2 id={`extended-practice-title-${lessonNumber}`}>{practice.title}</h2><p>{practice.subtitle}</p></div><strong>{completed+1} / {practice.tasks.length}</strong></header>
    <div className="extended-practice-progress" aria-label={`Выполнено ${completed} из ${practice.tasks.length}`}><i style={{width:`${percent}%`}}/></div>
    <article className="extended-practice-card"><div className="extended-practice-task-number">Задание {completed+1}</div><h3>{task.prompt}</h3><p className="extended-practice-instruction">{task.instruction}</p>
      {task.type==='choice'?<div className="extended-practice-options">{task.options.map(option=><button key={option} type="button" className={response===option?'is-selected':''} aria-pressed={response===option} onClick={()=>{setResponse(option);setCheckState('idle')}} disabled={checkState==='correct'}>{option}</button>)}</div>:task.type==='multi-input'?<div className="extended-practice-multi">{task.fields.map(field=><label className="extended-practice-input" key={field.id}><span>{field.label}</span><input value={multiResponse[field.id]??''} onChange={event=>{setMultiResponse(previous=>({...previous,[field.id]:event.target.value}));setCheckState('idle')}} onKeyDown={event=>{if(event.key==='Enter'&&canCheck)checkAnswer()}} placeholder={field.placeholder??'Введи ответ'} disabled={checkState==='correct'}/></label>)}</div>:<label className="extended-practice-input"><span>Ответ</span><input value={response} onChange={event=>{setResponse(event.target.value);setCheckState('idle')}} onKeyDown={event=>{if(event.key==='Enter')checkAnswer()}} placeholder="Введи ответ" disabled={checkState==='correct'}/></label>}
      {checkState==='wrong'?<div className="extended-practice-feedback is-wrong" role="alert"><b>Пока неверно.</b><span>{attempts>=1?task.hint:'Проверь решение целиком и попробуй ещё раз.'}</span></div>:null}
      {checkState==='correct'?<div className="extended-practice-feedback is-correct" role="status"><b>Верно!</b><span>{task.explanation}</span></div>:null}
      <div className="extended-practice-actions">{checkState==='correct'?<button type="button" className="extended-practice-next" onClick={continuePractice}>{completed+1===practice.tasks.length?'Завершить практику':'Следующее задание →'}</button>:<button type="button" className="extended-practice-check" onClick={checkAnswer} disabled={!canCheck}>Проверить</button>}</div>
    </article>
  </section>;
}
