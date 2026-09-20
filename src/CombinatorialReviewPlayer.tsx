import {useEffect,useMemo,useState} from 'react';
import './lessonPlayer.css';
import './theoryExperience.css';
import {lessonOneHundredSixtySevenPractice,lessonOneHundredSixtySevenResponseCount,type LessonOneHundredSixtySevenField,type LessonOneHundredSixtySevenTask} from './data/lessonOneHundredSixtySevenPractice';
import {exactDecimalEquals} from './exactDecimal';

type Stage={id:string;eyebrow:string;title:string;body:string;note?:string;practice?:LessonOneHundredSixtySevenTask;summary?:boolean};
type Saved={version:1;stageIndex:number;responses:Record<string,string>;checked:Record<string,boolean>;attempts:Record<string,number>};
type Jump={lessonNumber?:number;stageIndex?:number};
const KEY='mathnikita-lesson-167-progress-v1';
const matchField=(value:string,field:LessonOneHundredSixtySevenField)=>field.answers.some(answer=>exactDecimalEquals(value,answer));

const concepts:Stage[]=[
  {id:'l167-enumerate',eyebrow:'Урок 167 · итоговое повторение',title:'Перебор должен быть систематическим',body:'Комбинаторная задача просит перечислить или посчитать все допустимые варианты. Перебор ведут по понятному признаку: фиксируют первый выбор и последовательно перебирают остальные.',note:'Главные ошибки — пропуск варианта и двойной счёт одного и того же случая.'},
  {id:'l167-product',eyebrow:'Правило произведения',title:'Последовательные выборы перемножаются',body:'Если первый шаг можно сделать m способами, а после каждого из них второй — n способами, всего m·n последовательностей.',note:'Для трёх и более шагов перемножаются количества вариантов на каждом шаге.'},
  {id:'l167-sum',eyebrow:'Правило суммы',title:'Непересекающиеся случаи складываются',body:'Если допустимый вариант относится ровно к одной из нескольких групп, количество вариантов равно сумме размеров этих групп.',note:'Сумму нельзя применять, если одни и те же варианты попадают сразу в несколько групп.'},
  {id:'l167-order',eyebrow:'Порядок',title:'Сначала реши, важен ли порядок',body:'Код 25 отличается от 52, поэтому порядок цифр важен. Но пара учеников {Аня, Борис} не меняется от перестановки имён, если роли одинаковы.',note:'Если порядок не важен, упорядоченный перебор может считать один вариант несколько раз.'},
  {id:'l167-restrictions',eyebrow:'Ограничения',title:'Условия удобнее учитывать как можно раньше',body:'Для чётного числа сначала выбирают последнюю цифру; для трёхзначного числа сразу исключают ноль на первой позиции; обязательный элемент фиксируют заранее.',note:'Иногда быстрее посчитать все варианты и вычесть запрещённые.'},
  {id:'l167-check',eyebrow:'Проверка',title:'Таблица или дерево помогают доказать полноту',body:'Дерево вариантов показывает каждый последовательный выбор отдельной ветвью, а таблица удобно организует пары. Структура решения должна объяснять, почему посчитаны все случаи.',note:'Ответ без понятного способа перебора труднее проверить.'}
];
const practiceStages:Stage[]=lessonOneHundredSixtySevenPractice.map((practice,i)=>({id:`l167-practice-${String(i+1).padStart(2,'0')}`,eyebrow:`Практика · ${i+1} из 20`,title:practice.title,body:practice.prompt,practice}));
const stages:Stage[]=[...concepts,...practiceStages,{id:'l167-summary',eyebrow:'Итог урока 167',title:'Комбинаторные задачи систематизированы',body:'Ты повторил полный перебор, дерево вариантов, правила произведения и суммы, порядок, ограничения, повторения и проверку полноты.',note:'20 задач · 50 ответов · §24.',summary:true}];
export const lessonOneHundredSixtySevenStageCount=stages.length;
export const lessonOneHundredSixtySevenPracticeTaskCount=lessonOneHundredSixtySevenPractice.length;
export const lessonOneHundredSixtySevenPracticeResponseCount=lessonOneHundredSixtySevenResponseCount;

function load():Saved{try{const raw=localStorage.getItem(KEY);if(!raw)return{version:1,stageIndex:0,responses:{},checked:{},attempts:{}};const p=JSON.parse(raw) as Saved;return p?.version===1?p:{version:1,stageIndex:0,responses:{},checked:{},attempts:{}}}catch{return{version:1,stageIndex:0,responses:{},checked:{},attempts:{}}}}

export function CombinatorialReviewPlayer(){
  const initial=useMemo(load,[]);
  const[stageIndex,setStageIndex]=useState(()=>Math.max(0,Math.min(initial.stageIndex,stages.length-1)));
  const[responses,setResponses]=useState(initial.responses);
  const[checked,setChecked]=useState(initial.checked);
  const[attempts,setAttempts]=useState(initial.attempts);
  const stage=stages[stageIndex];const task=stage.practice;const key=stage.id;
  const complete=task?task.fields.every(field=>matchField(responses[`${key}:${field.id}`]??'',field)):true;
  useEffect(()=>{localStorage.setItem(KEY,JSON.stringify({version:1,stageIndex,responses,checked,attempts} satisfies Saved))},[stageIndex,responses,checked,attempts]);
  useEffect(()=>{const handler=(event:Event)=>{const d=(event as CustomEvent<Jump>).detail;if(d?.lessonNumber!==167||typeof d.stageIndex!=='number')return;setStageIndex(Math.max(0,Math.min(Math.trunc(d.stageIndex),stages.length-1)))};window.addEventListener('mathnikita-go-to-stage',handler);return()=>window.removeEventListener('mathnikita-go-to-stage',handler)},[]);
  const check=()=>{if(task){setChecked(p=>({...p,[key]:true}));setAttempts(p=>({...p,[key]:(p[key]??0)+1}))}};
  const move=(delta:number)=>setStageIndex(i=>Math.max(0,Math.min(i+delta,stages.length-1)));
  return <section className="lesson-player theory-experience" aria-label="Урок 167: комбинаторные задачи"><article className={`interactive-stage ${stage.summary?'stage-summary':''}`} data-stage-id={stage.id} data-stage-index={stageIndex}><div className="stage-copy"><span className="stage-eyebrow">{stage.eyebrow}</span><h2>{stage.title}</h2><p>{stage.body}</p>{stage.note?<p className="theory-note">{stage.note}</p>:null}</div>{task?<div className="activity-area"><h3>{task.prompt}</h3><div className="answer-grid">{task.fields.map(field=>{const responseKey=`${key}:${field.id}`;return <label className="inline-answer" key={field.id}><span>{field.label}</span><input value={responses[responseKey]??''} placeholder={field.placeholder??'Введите ответ'} inputMode="decimal" onChange={event=>{setResponses(p=>({...p,[responseKey]:event.target.value}));setChecked(p=>({...p,[key]:false}))}}/></label>})}</div><button className="check-button" type="button" onClick={check}>Проверить</button>{checked[key]?complete?<div className="instant-feedback good" data-explanation={task.explanation}><b>Верно.</b><span>{task.explanation}</span></div>:<div className="instant-feedback bad" data-explanation={task.explanation}><b>Пока есть ошибка.</b><span>{attempts[key]>1?task.hint:'Построй дерево или таблицу вариантов и проверь, не пропущен ли случай и не посчитан ли он дважды.'}</span></div>:null}</div>:null}{stage.summary?<div className="summary-card"><b>Урок 167 завершён</b><span>20 задач · 50 ответов · комбинаторные задачи</span></div>:null}</article><nav className="lesson-controls" aria-label="Навигация по этапам урока 167"><button type="button" onClick={()=>move(-1)} disabled={stageIndex===0}>← Назад</button><span>Этап {stageIndex+1} из {stages.length}</span><button type="button" onClick={()=>move(1)} disabled={stageIndex===stages.length-1}>Дальше →</button></nav></section>;
}
