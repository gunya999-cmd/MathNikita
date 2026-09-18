import {useEffect,useMemo,useState} from 'react';
import './lessonPlayer.css';
import './theoryExperience.css';
import {lessonOneHundredSixtyThreePractice,lessonOneHundredSixtyThreeResponseCount,type LessonOneHundredSixtyThreeField,type LessonOneHundredSixtyThreeTask} from './data/lessonOneHundredSixtyThreePractice';
import {exactDecimalEquals} from './exactDecimal';

type Stage={id:string;eyebrow:string;title:string;body:string;note?:string;practice?:LessonOneHundredSixtyThreeTask;summary?:boolean};
type Saved={version:1;stageIndex:number;responses:Record<string,string>;checked:Record<string,boolean>;attempts:Record<string,number>};
type Jump={lessonNumber?:number;stageIndex?:number};
const KEY='mathnikita-lesson-163-progress-v1';
const matchField=(value:string,field:LessonOneHundredSixtyThreeField)=>field.answers.some(answer=>exactDecimalEquals(value,answer));

const concepts:Stage[]=[
  {id:'l163-chain',eyebrow:'Урок 163 · индивидуальные задания',title:'Последовательные проценты — это цепочка коэффициентов',body:'Каждое изменение применяется к текущей величине. Поэтому две скидки 20% и 10% дают коэффициент 0,8·0,9=0,72: итоговая скидка 28%, а не 30%.',note:'Проценты складывают только когда они относятся к одной и той же базе.'},
  {id:'l163-up-down',eyebrow:'Рост и снижение',title:'Одинаковые проценты вверх и вниз обычно не компенсируются',body:'После роста на 12% база становится больше. Последующее уменьшение на 12% берётся уже от этой большей базы, поэтому итог будет ниже исходного.',note:'Проверяй произведение коэффициентов: 1,12·0,88=0,9856.'},
  {id:'l163-reverse',eyebrow:'Обратный ход',title:'Конечное значение делят на общий коэффициент',body:'Если было несколько процентных шагов, сначала найди произведение их коэффициентов. Затем конечную величину раздели на этот общий коэффициент.',note:'После −10% и −20% общий коэффициент равен 0,9·0,8=0,72.'},
  {id:'l163-part-of-part',eyebrow:'Процент от части',title:'У второго процента может быть новая база',body:'Если 40% объектов относятся к типу A, а 25% типа A имеют признак B, то B составляет 0,4·0,25=0,1=10% от всего.',note:'Перед каждым шагом проговори, что именно сейчас равно 100%.'},
  {id:'l163-over-100',eyebrow:'Проценты больше 100%',title:'125% — это коэффициент 1,25',body:'Процент больше 100% означает величину, превышающую исходную. Обратная задача решается делением известного результата на соответствующий коэффициент.',note:'Если 125% числа равны 500, число равно 500:1,25=400.'},
  {id:'l163-audit',eyebrow:'Контроль результата',title:'Проверяй всю цепочку, а не только последний шаг',body:'После восстановления исходного значения снова проведи все процентные изменения вперёд. Финал должен точно совпасть с условием.',note:'Это особенно важно в задачах со скидкой после наценки или несколькими уменьшениями.'}
];
const practiceStages:Stage[]=lessonOneHundredSixtyThreePractice.map((practice,i)=>({id:`l163-practice-${String(i+1).padStart(2,'0')}`,eyebrow:`Индивидуальная практика · ${i+1} из 20`,title:practice.title,body:practice.prompt,practice}));
const stages:Stage[]=[...concepts,...practiceStages,{id:'l163-summary',eyebrow:'Итог урока 163',title:'Составные процентные задачи освоены',body:'Ты отработал последовательные проценты, смену базы 100%, процент от части, обратное восстановление и проверку многошаговых вычислений.',note:'20 задач · 50 ответов · усложнённый практикум §§37–38.',summary:true}];
export const lessonOneHundredSixtyThreeStageCount=stages.length;
export const lessonOneHundredSixtyThreePracticeTaskCount=lessonOneHundredSixtyThreePractice.length;
export const lessonOneHundredSixtyThreePracticeResponseCount=lessonOneHundredSixtyThreeResponseCount;

function load():Saved{try{const raw=localStorage.getItem(KEY);if(!raw)return{version:1,stageIndex:0,responses:{},checked:{},attempts:{}};const p=JSON.parse(raw) as Saved;return p?.version===1?p:{version:1,stageIndex:0,responses:{},checked:{},attempts:{}}}catch{return{version:1,stageIndex:0,responses:{},checked:{},attempts:{}}}}

export function AdvancedPercentReviewPlayer(){
  const initial=useMemo(load,[]);
  const[stageIndex,setStageIndex]=useState(()=>Math.max(0,Math.min(initial.stageIndex,stages.length-1)));
  const[responses,setResponses]=useState(initial.responses);
  const[checked,setChecked]=useState(initial.checked);
  const[attempts,setAttempts]=useState(initial.attempts);
  const stage=stages[stageIndex];const task=stage.practice;const key=stage.id;
  const complete=task?task.fields.every(field=>matchField(responses[`${key}:${field.id}`]??'',field)):true;
  useEffect(()=>{localStorage.setItem(KEY,JSON.stringify({version:1,stageIndex,responses,checked,attempts} satisfies Saved))},[stageIndex,responses,checked,attempts]);
  useEffect(()=>{const handler=(event:Event)=>{const d=(event as CustomEvent<Jump>).detail;if(d?.lessonNumber!==163||typeof d.stageIndex!=='number')return;setStageIndex(Math.max(0,Math.min(Math.trunc(d.stageIndex),stages.length-1)))};window.addEventListener('mathnikita-go-to-stage',handler);return()=>window.removeEventListener('mathnikita-go-to-stage',handler)},[]);
  const check=()=>{if(task){setChecked(p=>({...p,[key]:true}));setAttempts(p=>({...p,[key]:(p[key]??0)+1}))}};
  const move=(delta:number)=>setStageIndex(i=>Math.max(0,Math.min(i+delta,stages.length-1)));
  return <section className="lesson-player theory-experience" aria-label="Урок 163: составные и обратные процентные задачи"><article className={`interactive-stage ${stage.summary?'stage-summary':''}`} data-stage-id={stage.id} data-stage-index={stageIndex}><div className="stage-copy"><span className="stage-eyebrow">{stage.eyebrow}</span><h2>{stage.title}</h2><p>{stage.body}</p>{stage.note?<p className="theory-note">{stage.note}</p>:null}</div>{task?<div className="activity-area"><h3>{task.prompt}</h3><div className="answer-grid">{task.fields.map(field=>{const responseKey=`${key}:${field.id}`;return <label className="inline-answer" key={field.id}><span>{field.label}</span><input value={responses[responseKey]??''} placeholder={field.placeholder??'Введите ответ'} inputMode="decimal" onChange={event=>{setResponses(p=>({...p,[responseKey]:event.target.value}));setChecked(p=>({...p,[key]:false}))}}/></label>})}</div><button className="check-button" type="button" onClick={check}>Проверить</button>{checked[key]?complete?<div className="instant-feedback good" data-explanation={task.explanation}><b>Верно.</b><span>{task.explanation}</span></div>:<div className="instant-feedback bad" data-explanation={task.explanation}><b>Пока есть ошибка.</b><span>{attempts[key]>1?task.hint:'Определи текущую базу 100% и выпиши коэффициент каждого процентного шага.'}</span></div>:null}</div>:null}{stage.summary?<div className="summary-card"><b>Урок 163 завершён</b><span>20 задач · 50 ответов · составные и обратные проценты</span></div>:null}</article><nav className="lesson-controls" aria-label="Навигация по этапам урока 163"><button type="button" onClick={()=>move(-1)} disabled={stageIndex===0}>← Назад</button><span>Этап {stageIndex+1} из {stages.length}</span><button type="button" onClick={()=>move(1)} disabled={stageIndex===stages.length-1}>Дальше →</button></nav></section>;
}
