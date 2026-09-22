import {useMemo,useState} from 'react';
import {skillLabels,taskBank} from './data/course';
import {recordAttempt,saveLearnerState,type LearnerState} from './learningEngine';
import {clearReviewQueue,loadReviewQueue,saveReviewQueue} from './studentReview';
import './reviewTrainer.css';

type Props={state:LearnerState;onStateChange:(state:LearnerState)=>void;onExit:()=>void};
type Feedback='idle'|'wrong'|'correct';

function normalize(value:string){return value.trim().toLowerCase().replace(',','.').replace(/\s+/g,'')}

export function ReviewTrainer({state,onStateChange,onExit}:Props){
  const[queue,setQueue]=useState<string[]>(()=>loadReviewQueue(state));
  const[answer,setAnswer]=useState('');
  const[feedback,setFeedback]=useState<Feedback>('idle');
  const[attempts,setAttempts]=useState(0);
  const[usedHint,setUsedHint]=useState(false);
  const task=useMemo(()=>queue.length?taskBank.get(queue[0])??null:null,[queue]);

  const reset=()=>{setAnswer('');setFeedback('idle');setAttempts(0);setUsedHint(false)};
  const finishCurrent=()=>{
    const next=queue.slice(1);
    setQueue(next);
    saveReviewQueue(next);
    reset();
  };
  const check=()=>{
    if(!task||!answer.trim()||feedback==='correct')return;
    const correct=normalize(answer)===normalize(task.answer);
    const nextState=recordAttempt(state,task,{correct,firstTry:attempts===0,usedHint});
    saveLearnerState(nextState);
    onStateChange(nextState);
    setAttempts(value=>value+1);
    if(correct){
      setFeedback('correct');
      saveReviewQueue(queue.slice(1));
    }else{
      setFeedback('wrong');
      setUsedHint(true);
    }
  };

  if(!task){
    clearReviewQueue();
    return <main className="review-page">
      <section className="review-complete">
        <small>Работа над ошибками</small>
        <h1>Активных ошибок нет</h1>
        <p>Все выбранные ошибки исправлены. Правильные ответы уже учтены в карте навыков.</p>
        <button type="button" onClick={onExit}>Вернуться в кабинет</button>
      </section>
    </main>;
  }

  const position=Math.max(1,loadReviewQueue(state).length-queue.length+1);
  const total=Math.max(position,position+queue.length-1);
  return <main className="review-page">
    <section className="review-shell">
      <header className="review-head">
        <button type="button" onClick={onExit}>← Кабинет</button>
        <div><small>Мини-тренинг</small><b>Исправляем ошибки</b></div>
        <span>{position} / {total}</span>
      </header>
      <div className="review-progress"><i style={{width:`${Math.round(position/total*100)}%`}}/></div>
      <section className="review-card">
        <div className="review-meta"><span>{skillLabels[task.skill]}</span><b>{task.title}</b></div>
        <h1>{task.prompt}</h1>
        <div className="review-answer">
          <input value={answer} onChange={event=>setAnswer(event.target.value)} onKeyDown={event=>event.key==='Enter'&&check()} placeholder="Введи ответ" autoFocus/>
          <button type="button" onClick={check} disabled={!answer.trim()||feedback==='correct'}>Проверить</button>
        </div>
        {feedback==='wrong'&&<div className="review-feedback is-wrong"><b>Пока неверно</b><span>{task.hint}</span></div>}
        {feedback==='correct'&&<div className="review-feedback is-correct"><b>Ошибка исправлена</b><span>{task.explanation}</span><button type="button" onClick={finishCurrent}>{queue.length>1?'Следующая ошибка →':'Завершить тренировку'}</button></div>}
      </section>
      <aside className="review-note"><b>Как это работает</b><span>После правильного ответа эта ошибка исчезает из активного списка кабинета. Если похожая ошибка появится снова, она вернётся в очередь.</span></aside>
    </section>
  </main>;
}
