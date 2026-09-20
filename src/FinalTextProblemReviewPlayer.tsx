import {useEffect,useMemo,useState} from 'react';
import './lessonPlayer.css';
import './theoryExperience.css';
import {lessonOneHundredSeventyOnePractice,lessonOneHundredSeventyOneResponseCount,type LessonOneHundredSeventyOneField,type LessonOneHundredSeventyOneTask} from './data/lessonOneHundredSeventyOnePractice';
import {exactDecimalEquals} from './exactDecimal';

type Stage={id:string;eyebrow:string;title:string;body:string;note?:string;practice?:LessonOneHundredSeventyOneTask;summary?:boolean};
type Saved={version:1;stageIndex:number;responses:Record<string,string>;checked:Record<string,boolean>;attempts:Record<string,number>};
type Jump={lessonNumber?:number;stageIndex?:number};
const KEY='mathnikita-lesson-171-progress-v1';
const matchField=(value:string,field:LessonOneHundredSeventyOneField)=>field.answers.some(answer=>exactDecimalEquals(value,answer));

const concepts:Stage[]=[
  {id:'l171-model',eyebrow:'Урок 171 · финальный тренажёр',title:'Сначала распознай модель, потом считай',body:'В итоговой задаче название темы не подсказывает формулу. Определи, какие величины связаны: путь, цена, процент, среднее, площадь, объём или производительность.',note:'Полезный вопрос: «Что означает каждое число и какое неизвестное связывает их вместе?»'},
  {id:'l171-plan',eyebrow:'План решения',title:'Запиши цепочку шагов до вычислений',body:'Если решение требует нескольких действий, заранее сформулируй промежуточные вопросы. Так меньше риск применить верную формулу к неверной величине.',note:'Пример: найти остаток → понять, какой процент он составляет → восстановить исходное значение.'},
  {id:'l171-reverse',eyebrow:'Обратный ход',title:'Известен конец — отменяй действия в обратном порядке',body:'При обратной задаче начинай с последнего изменения. Сначала верни фиксированный расход или скидку, затем восстанови процент, долю или исходную скорость.',note:'Проверка прямым ходом должна снова привести к данному в условии результату.'},
  {id:'l171-units',eyebrow:'Единицы и время',title:'Приводи единицы до подстановки в формулу',body:'Минуты переводи в часы, кубические сантиметры — в литры, а остановку отличай от времени движения.',note:'Единица измерения возле каждого промежуточного числа помогает заметить ошибку раньше ответа.'},
  {id:'l171-constraints',eyebrow:'Ограничения',title:'Не каждое число участвует в одной и той же формуле',body:'Стоимость доставки, ширина ворот или время остановки меняют итог, но не всегда входят в базовую формулу. Сначала определи роль данных.',note:'Смысл условия важнее механического использования всех чисел подряд.'},
  {id:'l171-check',eyebrow:'Финальная проверка',title:'Проверь ответ тремя способами',body:'Вернись к исходному условию обратным ходом, оцени порядок величины и проверь единицы. Для сложной задачи одного повторного вычисления недостаточно.',note:'Если результат нарушает смысл условия — например, остаток больше исходного запаса — ищи логическую ошибку, даже если арифметика выглядит аккуратно.'}
];
const practiceStages:Stage[]=lessonOneHundredSeventyOnePractice.map((practice,i)=>({id:`l171-practice-${String(i+1).padStart(2,'0')}`,eyebrow:`Практика · ${i+1} из 20`,title:practice.title,body:practice.prompt,practice}));
const stages:Stage[]=[...concepts,...practiceStages,{id:'l171-summary',eyebrow:'Итог урока 171',title:'Финальный блок текстовых задач завершён',body:'Ты потренировался самостоятельно выбирать модель, строить многошаговый план, решать обратные задачи и проверять результат по смыслу.',note:'20 задач · 50 ответов · финальный смешанный тренажёр.',summary:true}];
export const lessonOneHundredSeventyOneStageCount=stages.length;
export const lessonOneHundredSeventyOnePracticeTaskCount=lessonOneHundredSeventyOnePractice.length;
export const lessonOneHundredSeventyOnePracticeResponseCount=lessonOneHundredSeventyOneResponseCount;

function load():Saved{try{const raw=localStorage.getItem(KEY);if(!raw)return{version:1,stageIndex:0,responses:{},checked:{},attempts:{}};const p=JSON.parse(raw) as Saved;return p?.version===1?p:{version:1,stageIndex:0,responses:{},checked:{},attempts:{}}}catch{return{version:1,stageIndex:0,responses:{},checked:{},attempts:{}}}}

export function FinalTextProblemReviewPlayer(){
  const initial=useMemo(load,[]);
  const[stageIndex,setStageIndex]=useState(()=>Math.max(0,Math.min(initial.stageIndex,stages.length-1)));
  const[responses,setResponses]=useState(initial.responses);
  const[checked,setChecked]=useState(initial.checked);
  const[attempts,setAttempts]=useState(initial.attempts);
  const stage=stages[stageIndex];const task=stage.practice;const key=stage.id;
  const complete=task?task.fields.every(field=>matchField(responses[`${key}:${field.id}`]??'',field)):true;
  useEffect(()=>{localStorage.setItem(KEY,JSON.stringify({version:1,stageIndex,responses,checked,attempts} satisfies Saved))},[stageIndex,responses,checked,attempts]);
  useEffect(()=>{const handler=(event:Event)=>{const d=(event as CustomEvent<Jump>).detail;if(d?.lessonNumber!==171||typeof d.stageIndex!=='number')return;setStageIndex(Math.max(0,Math.min(Math.trunc(d.stageIndex),stages.length-1)))};window.addEventListener('mathnikita-go-to-stage',handler);return()=>window.removeEventListener('mathnikita-go-to-stage',handler)},[]);
  const check=()=>{if(task){setChecked(p=>({...p,[key]:true}));setAttempts(p=>({...p,[key]:(p[key]??0)+1}))}};
  const move=(delta:number)=>setStageIndex(i=>Math.max(0,Math.min(i+delta,stages.length-1)));
  return <section className="lesson-player theory-experience" aria-label="Урок 171: итоговый тренажёр текстовых задач"><article className={`interactive-stage ${stage.summary?'stage-summary':''}`} data-stage-id={stage.id} data-stage-index={stageIndex}><div className="stage-copy"><span className="stage-eyebrow">{stage.eyebrow}</span><h2>{stage.title}</h2><p>{stage.body}</p>{stage.note?<p className="theory-note">{stage.note}</p>:null}</div>{task?<div className="activity-area"><h3>{task.prompt}</h3><div className="answer-grid">{task.fields.map(field=>{const responseKey=`${key}:${field.id}`;return <label className="inline-answer" key={field.id}><span>{field.label}</span><input value={responses[responseKey]??''} placeholder={field.placeholder??'Введите ответ'} inputMode="decimal" onChange={event=>{setResponses(p=>({...p,[responseKey]:event.target.value}));setChecked(p=>({...p,[key]:false}))}}/></label>})}</div><button className="check-button" type="button" onClick={check}>Проверить</button>{checked[key]?complete?<div className="instant-feedback good" data-explanation={task.explanation}><b>Верно.</b><span>{task.explanation}</span></div>:<div className="instant-feedback bad" data-explanation={task.explanation}><b>Пока есть ошибка.</b><span>{attempts[key]>1?task.hint:'Проверь модель задачи, порядок шагов, базу для процента или доли и единицы измерения.'}</span></div>:null}</div>:null}{stage.summary?<div className="summary-card"><b>Урок 171 завершён</b><span>20 задач · 50 ответов · финальный смешанный тренажёр</span></div>:null}</article><nav className="lesson-controls" aria-label="Навигация по этапам урока 171"><button type="button" onClick={()=>move(-1)} disabled={stageIndex===0}>← Назад</button><span>Этап {stageIndex+1} из {stages.length}</span><button type="button" onClick={()=>move(1)} disabled={stageIndex===stages.length-1}>Дальше →</button></nav></section>;
}
