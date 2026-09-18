import {useEffect,useMemo,useState} from 'react';
import './lessonPlayer.css';
import './theoryExperience.css';
import {lessonOneHundredSixtyFourPractice,lessonOneHundredSixtyFourResponseCount,type LessonOneHundredSixtyFourField,type LessonOneHundredSixtyFourTask} from './data/lessonOneHundredSixtyFourPractice';
import {exactDecimalEquals} from './exactDecimal';

type Stage={id:string;eyebrow:string;title:string;body:string;note?:string;practice?:LessonOneHundredSixtyFourTask;summary?:boolean};
type Saved={version:1;stageIndex:number;responses:Record<string,string>;checked:Record<string,boolean>;attempts:Record<string,number>};
type Jump={lessonNumber?:number;stageIndex?:number};
const KEY='mathnikita-lesson-164-progress-v1';
const matchField=(value:string,field:LessonOneHundredSixtyFourField)=>field.answers.some(answer=>exactDecimalEquals(value,answer));

const concepts:Stage[]=[
  {id:'l164-polygon',eyebrow:'Урок 164 · итоговое повторение',title:'Многоугольник — замкнутая ломаная',body:'Стороны многоугольника — отрезки его границы, а вершины — точки, где соседние стороны встречаются. У n-угольника n сторон и n вершин.',note:'Треугольник имеет 3 стороны, четырёхугольник — 4, пятиугольник — 5 и так далее.'},
  {id:'l164-perimeter',eyebrow:'Периметр',title:'Периметр — длина всей замкнутой границы',body:'Чтобы найти периметр произвольного многоугольника, сложи длины всех его сторон, каждую ровно один раз.',note:'Перед вычислением полезно пересчитать стороны и убедиться, что ни одна не пропущена.'},
  {id:'l164-equal',eyebrow:'Равные стороны',title:'Одинаковые длины удобно группировать',body:'Если несколько сторон равны, повторяющееся сложение можно заменить умножением. Для квадрата P=4a, для правильного пятиугольника P=5a.',note:'Для правильного n-угольника P=n·a.'},
  {id:'l164-missing',eyebrow:'Неизвестная сторона',title:'Неизвестную сторону находим вычитанием из периметра',body:'Если известен весь периметр и остальные стороны, сложи известные длины и вычти эту сумму из P.',note:'После этого обязательно сложи все стороны снова и проверь исходный периметр.'},
  {id:'l164-decimals',eyebrow:'Десятичные длины',title:'Единицы измерения должны совпадать',body:'Складывать можно длины, выраженные в одинаковых единицах. Десятичные числа складывай поразрядно, сохраняя точность условия.',note:'В ответных полях этого урока вводится только число без обозначения единицы.'},
  {id:'l164-boundary',eyebrow:'Составной контур',title:'В периметр входит только внешняя граница',body:'Для ломаного или необычного многоугольного контура нужно пройти по замкнутой границе и сложить длины всех её участков.',note:'Форма внутри контура не меняет правила: периметр — это длина обхода границы.'}
];
const practiceStages:Stage[]=lessonOneHundredSixtyFourPractice.map((practice,i)=>({id:`l164-practice-${String(i+1).padStart(2,'0')}`,eyebrow:`Практика · ${i+1} из 20`,title:practice.title,body:practice.prompt,practice}));
const stages:Stage[]=[...concepts,...practiceStages,{id:'l164-summary',eyebrow:'Итог урока 164',title:'Многоугольники и периметр систематизированы',body:'Ты повторил стороны и вершины многоугольников, вычисление периметра, правильные многоугольники, неизвестную сторону и составные замкнутые контуры.',note:'20 задач · 50 ответов · §10.',summary:true}];
export const lessonOneHundredSixtyFourStageCount=stages.length;
export const lessonOneHundredSixtyFourPracticeTaskCount=lessonOneHundredSixtyFourPractice.length;
export const lessonOneHundredSixtyFourPracticeResponseCount=lessonOneHundredSixtyFourResponseCount;

function load():Saved{try{const raw=localStorage.getItem(KEY);if(!raw)return{version:1,stageIndex:0,responses:{},checked:{},attempts:{}};const p=JSON.parse(raw) as Saved;return p?.version===1?p:{version:1,stageIndex:0,responses:{},checked:{},attempts:{}}}catch{return{version:1,stageIndex:0,responses:{},checked:{},attempts:{}}}}

export function PolygonPerimeterReviewPlayer(){
  const initial=useMemo(load,[]);
  const[stageIndex,setStageIndex]=useState(()=>Math.max(0,Math.min(initial.stageIndex,stages.length-1)));
  const[responses,setResponses]=useState(initial.responses);
  const[checked,setChecked]=useState(initial.checked);
  const[attempts,setAttempts]=useState(initial.attempts);
  const stage=stages[stageIndex];const task=stage.practice;const key=stage.id;
  const complete=task?task.fields.every(field=>matchField(responses[`${key}:${field.id}`]??'',field)):true;
  useEffect(()=>{localStorage.setItem(KEY,JSON.stringify({version:1,stageIndex,responses,checked,attempts} satisfies Saved))},[stageIndex,responses,checked,attempts]);
  useEffect(()=>{const handler=(event:Event)=>{const d=(event as CustomEvent<Jump>).detail;if(d?.lessonNumber!==164||typeof d.stageIndex!=='number')return;setStageIndex(Math.max(0,Math.min(Math.trunc(d.stageIndex),stages.length-1)))};window.addEventListener('mathnikita-go-to-stage',handler);return()=>window.removeEventListener('mathnikita-go-to-stage',handler)},[]);
  const check=()=>{if(task){setChecked(p=>({...p,[key]:true}));setAttempts(p=>({...p,[key]:(p[key]??0)+1}))}};
  const move=(delta:number)=>setStageIndex(i=>Math.max(0,Math.min(i+delta,stages.length-1)));
  return <section className="lesson-player theory-experience" aria-label="Урок 164: многоугольники и периметр"><article className={`interactive-stage ${stage.summary?'stage-summary':''}`} data-stage-id={stage.id} data-stage-index={stageIndex}><div className="stage-copy"><span className="stage-eyebrow">{stage.eyebrow}</span><h2>{stage.title}</h2><p>{stage.body}</p>{stage.note?<p className="theory-note">{stage.note}</p>:null}</div>{task?<div className="activity-area"><h3>{task.prompt}</h3><div className="answer-grid">{task.fields.map(field=>{const responseKey=`${key}:${field.id}`;return <label className="inline-answer" key={field.id}><span>{field.label}</span><input value={responses[responseKey]??''} placeholder={field.placeholder??'Введите ответ'} inputMode="decimal" onChange={event=>{setResponses(p=>({...p,[responseKey]:event.target.value}));setChecked(p=>({...p,[key]:false}))}}/></label>})}</div><button className="check-button" type="button" onClick={check}>Проверить</button>{checked[key]?complete?<div className="instant-feedback good" data-explanation={task.explanation}><b>Верно.</b><span>{task.explanation}</span></div>:<div className="instant-feedback bad" data-explanation={task.explanation}><b>Пока есть ошибка.</b><span>{attempts[key]>1?task.hint:'Пройди по всей границе и проверь, что учтена каждая сторона ровно один раз.'}</span></div>:null}</div>:null}{stage.summary?<div className="summary-card"><b>Урок 164 завершён</b><span>20 задач · 50 ответов · многоугольники и периметр</span></div>:null}</article><nav className="lesson-controls" aria-label="Навигация по этапам урока 164"><button type="button" onClick={()=>move(-1)} disabled={stageIndex===0}>← Назад</button><span>Этап {stageIndex+1} из {stages.length}</span><button type="button" onClick={()=>move(1)} disabled={stageIndex===stages.length-1}>Дальше →</button></nav></section>;
}
