import { useEffect,useMemo,useState } from 'react';
import { ExtendedPracticeLab } from './ExtendedPracticeLab';
import { lessonThirtyStages } from './NumericalLiteralExpressionsPlayer';

type Saved={version:1;stageIndex:number;responses:Record<string,string>;checked:Record<string,boolean>;results:Record<string,boolean>};
type StageJumpDetail={lessonNumber?:number;stageIndex?:number};
const KEY='mathnikita-lesson-30-progress-v1';

function normalize(value:string){return value.trim().toLowerCase().replace(/\s+/g,'').replace(/×/g,'·').replace(/\*/g,'·').replace(/,/g,'.')}
function loadSaved():Saved{
  try{const parsed=JSON.parse(localStorage.getItem(KEY)??'null') as Saved|null;if(parsed?.version===1&&Number.isInteger(parsed.stageIndex))return parsed}catch{/* damaged progress is ignored */}
  return{version:1,stageIndex:0,responses:{},checked:{},results:{}};
}

export function LessonThirtyPlayer(){
  const initial=useMemo(loadSaved,[]);
  const[stageIndex,setStageIndex]=useState(Math.min(initial.stageIndex,lessonThirtyStages.length-1));
  const[responses,setResponses]=useState<Record<string,string>>(initial.responses);
  const[checked,setChecked]=useState<Record<string,boolean>>(initial.checked);
  const[results,setResults]=useState<Record<string,boolean>>(initial.results);
  const[practiceComplete,setPracticeComplete]=useState(false);
  const stage=lessonThirtyStages[stageIndex];
  const activity=stage.activity;
  const response=activity?responses[activity.id]??'':'';
  const isChecked=activity?Boolean(checked[activity.id]):false;
  const isCorrect=activity?Boolean(results[activity.id]):false;
  const percent=Math.round(((stageIndex+1)/lessonThirtyStages.length)*100);

  useEffect(()=>{localStorage.setItem(KEY,JSON.stringify({version:1,stageIndex,responses,checked,results} satisfies Saved))},[stageIndex,responses,checked,results]);
  useEffect(()=>{
    const jump=(event:Event)=>{
      const detail=(event as CustomEvent<StageJumpDetail>).detail;
      if(detail?.lessonNumber!==30||!Number.isInteger(detail.stageIndex))return;
      const next=Math.max(0,Math.min(Number(detail.stageIndex),lessonThirtyStages.length-1));
      window.dispatchEvent(new CustomEvent('mathnikita-stop-narration'));
      if('speechSynthesis'in window)window.speechSynthesis.cancel();
      setStageIndex(next);
      window.scrollTo({top:0,behavior:'smooth'});
    };
    window.addEventListener('mathnikita-go-to-stage',jump);
    return()=>window.removeEventListener('mathnikita-go-to-stage',jump);
  },[]);

  function stopVoice(){window.dispatchEvent(new CustomEvent('mathnikita-stop-narration'));if('speechSynthesis'in window)window.speechSynthesis.cancel()}
  function moveTo(nextIndex:number){stopVoice();setStageIndex(Math.max(0,Math.min(nextIndex,lessonThirtyStages.length-1)));window.scrollTo({top:0,behavior:'smooth'})}
  function choose(value:string){if(!activity)return;setResponses(current=>({...current,[activity.id]:value}));setChecked(current=>({...current,[activity.id]:false}));setResults(current=>({...current,[activity.id]:false}))}
  function checkAnswer(){if(!activity||!response.trim())return;const correct=normalize(response)===normalize(activity.answer);setChecked(current=>({...current,[activity.id]:true}));setResults(current=>({...current,[activity.id]:correct}))}
  const canAdvance=!activity||isCorrect;

  return <main className="lesson-player">
    <div className="lesson-progress" aria-label={`Пройдено ${percent}% урока`}><i style={{width:`${percent}%`}}/></div>
    <section className={`interactive-stage ${stage.kind==='summary'?'stage-summary':''}`} data-stage-id={stage.id}>
      <div className="stage-counter"><span>Этап {stageIndex+1} из {lessonThirtyStages.length}</span><div><button type="button" onClick={()=>moveTo(stageIndex-1)} disabled={stageIndex===0} aria-label="Предыдущий этап">←</button><button type="button" onClick={()=>moveTo(stageIndex+1)} disabled={stageIndex===lessonThirtyStages.length-1||!canAdvance} aria-label="Следующий этап">→</button></div></div>
      <div className="stage-copy"><span>{stage.eyebrow}</span><h2>{stage.title}</h2><p>{stage.body}</p>{stage.note?<aside>{stage.note}</aside>:null}</div>

      {activity?<div className="activity-area">
        <h3>{activity.prompt}</h3>
        {activity.type==='choice'?<>
          <div className="choice-grid">{activity.options?.map(option=><button key={option} type="button" className={response===option?'selected':''} aria-pressed={response===option} onClick={()=>choose(option)} disabled={isCorrect}>{option}</button>)}</div>
          <button type="button" className="check-button" onClick={checkAnswer} disabled={!response.trim()||isCorrect}>Проверить</button>
        </>:<div className="inline-answer"><input value={response} onChange={event=>choose(event.target.value)} onKeyDown={event=>{if(event.key==='Enter')checkAnswer()}} placeholder={activity.placeholder??'Введи ответ'} disabled={isCorrect}/><button type="button" className="check-button" onClick={checkAnswer} disabled={!response.trim()||isCorrect}>Проверить</button></div>}
        {isChecked&&!isCorrect?<div className="instant-feedback bad" data-explanation={activity.explanation}><b>Пока не так.</b><span>{activity.hint}</span></div>:null}
        {isCorrect?<div className="instant-feedback good"><b>Верно!</b><span>{activity.explanation}</span></div>:null}
      </div>:null}

      {stage.kind==='summary'?<><div className="summary-card"><b>{practiceComplete?'Обязательная практика пройдена':'Следующий шаг — обязательная практика'}</b><span>{practiceComplete?'Все 20 заданий урока 30 выполнены. Можно перейти к рефлексии урока.':'Практика закрепит классификацию выражений, подстановку и работу с формулами.'}</span></div><ExtendedPracticeLab lessonNumber={30} onComplete={()=>setPracticeComplete(true)} onRestart={()=>setPracticeComplete(false)}/></>:null}

      {stage.kind!=='summary'?<div className="lesson-controls"><button type="button" onClick={()=>moveTo(stageIndex-1)} disabled={stageIndex===0}>← Назад</button><button type="button" onClick={()=>moveTo(stageIndex+1)} disabled={!canAdvance}>{activity&&!isCorrect?'Сначала реши задание':'Дальше →'}</button></div>:null}
    </section>
  </main>;
}
