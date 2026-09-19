import {useEffect,useMemo,useState} from 'react';
import './lessonPlayer.css';
import './theoryExperience.css';
import {lessonOneHundredSixtyFivePractice,lessonOneHundredSixtyFiveResponseCount,type LessonOneHundredSixtyFiveField,type LessonOneHundredSixtyFiveTask} from './data/lessonOneHundredSixtyFivePractice';
import {exactDecimalEquals} from './exactDecimal';

type Stage={id:string;eyebrow:string;title:string;body:string;note?:string;practice?:LessonOneHundredSixtyFiveTask;summary?:boolean};
type Saved={version:1;stageIndex:number;responses:Record<string,string>;checked:Record<string,boolean>;attempts:Record<string,number>};
type Jump={lessonNumber?:number;stageIndex?:number};
const KEY='mathnikita-lesson-165-progress-v1';
const matchField=(value:string,field:LessonOneHundredSixtyFiveField)=>field.answers.some(answer=>exactDecimalEquals(value,answer));

const concepts:Stage[]=[
  {id:'l165-area',eyebrow:'Урок 165 · итоговое повторение',title:'Площадь измеряет часть плоскости',body:'Для прямоугольника S=a·b, для квадрата S=a². В отличие от периметра, площадь измеряется квадратными единицами.',note:'Сначала убедись, что длины выражены в одинаковых единицах.'},
  {id:'l165-area-reverse',eyebrow:'Обратные задачи на площадь',title:'Неизвестную сторону находим делением площади',body:'Если известны площадь прямоугольника и одна сторона, вторую сторону получаем как S:a. Затем полезно проверить результат обратным умножением.',note:'Проверка должна точно вернуть исходную площадь.'},
  {id:'l165-square-units',eyebrow:'Единицы площади',title:'Коэффициент перевода длины возводится в квадрат',body:'Поскольку 1 м=100 см, то 1 м²=10000 см². Аналогично 1 дм²=100 см².',note:'При переводе площади нельзя использовать линейный коэффициент без возведения в квадрат.'},
  {id:'l165-volume',eyebrow:'Объём',title:'Объём прямоугольного параллелепипеда равен произведению трёх измерений',body:'V=a·b·c. Также V=S основания·h. Для куба V=a³.',note:'Объём измеряется кубическими единицами.'},
  {id:'l165-volume-reverse',eyebrow:'Обратные задачи на объём',title:'Неизвестное измерение получаем делением объёма на два известных',body:'Если известны V, a и b, сначала найди площадь основания ab, затем вычисли h=V:(ab).',note:'Проверка: произведение всех трёх измерений должно вернуть V.'},
  {id:'l165-scale',eyebrow:'Изменение размеров',title:'При масштабировании объёма перемножаются изменения всех трёх измерений',body:'Если каждое ребро куба увеличить в 3 раза, объём увеличится в 3³=27 раз. Если каждое измерение уменьшить в 2 раза, объём уменьшится в 8 раз.',note:'Для площади масштаб действует в квадрате, для объёма — в кубе.'}
];
const practiceStages:Stage[]=lessonOneHundredSixtyFivePractice.map((practice,i)=>({id:`l165-practice-${String(i+1).padStart(2,'0')}`,eyebrow:`Практика · ${i+1} из 20`,title:practice.title,body:practice.prompt,practice}));
const stages:Stage[]=[...concepts,...practiceStages,{id:'l165-summary',eyebrow:'Итог урока 165',title:'Площади и объёмы систематизированы',body:'Ты повторил площади прямоугольника и квадрата, квадратные и кубические единицы, прямоугольный параллелепипед, куб, объём и обратные задачи.',note:'20 задач · 50 ответов · §§21–23.',summary:true}];
export const lessonOneHundredSixtyFiveStageCount=stages.length;
export const lessonOneHundredSixtyFivePracticeTaskCount=lessonOneHundredSixtyFivePractice.length;
export const lessonOneHundredSixtyFivePracticeResponseCount=lessonOneHundredSixtyFiveResponseCount;

function load():Saved{try{const raw=localStorage.getItem(KEY);if(!raw)return{version:1,stageIndex:0,responses:{},checked:{},attempts:{}};const p=JSON.parse(raw) as Saved;return p?.version===1?p:{version:1,stageIndex:0,responses:{},checked:{},attempts:{}}}catch{return{version:1,stageIndex:0,responses:{},checked:{},attempts:{}}}}

export function AreaVolumeReviewPlayer(){
  const initial=useMemo(load,[]);
  const[stageIndex,setStageIndex]=useState(()=>Math.max(0,Math.min(initial.stageIndex,stages.length-1)));
  const[responses,setResponses]=useState(initial.responses);
  const[checked,setChecked]=useState(initial.checked);
  const[attempts,setAttempts]=useState(initial.attempts);
  const stage=stages[stageIndex];const task=stage.practice;const key=stage.id;
  const complete=task?task.fields.every(field=>matchField(responses[`${key}:${field.id}`]??'',field)):true;
  useEffect(()=>{localStorage.setItem(KEY,JSON.stringify({version:1,stageIndex,responses,checked,attempts} satisfies Saved))},[stageIndex,responses,checked,attempts]);
  useEffect(()=>{const handler=(event:Event)=>{const d=(event as CustomEvent<Jump>).detail;if(d?.lessonNumber!==165||typeof d.stageIndex!=='number')return;setStageIndex(Math.max(0,Math.min(Math.trunc(d.stageIndex),stages.length-1)))};window.addEventListener('mathnikita-go-to-stage',handler);return()=>window.removeEventListener('mathnikita-go-to-stage',handler)},[]);
  const check=()=>{if(task){setChecked(p=>({...p,[key]:true}));setAttempts(p=>({...p,[key]:(p[key]??0)+1}))}};
  const move=(delta:number)=>setStageIndex(i=>Math.max(0,Math.min(i+delta,stages.length-1)));
  return <section className="lesson-player theory-experience" aria-label="Урок 165: площади и объёмы"><article className={`interactive-stage ${stage.summary?'stage-summary':''}`} data-stage-id={stage.id} data-stage-index={stageIndex}><div className="stage-copy"><span className="stage-eyebrow">{stage.eyebrow}</span><h2>{stage.title}</h2><p>{stage.body}</p>{stage.note?<p className="theory-note">{stage.note}</p>:null}</div>{task?<div className="activity-area"><h3>{task.prompt}</h3><div className="answer-grid">{task.fields.map(field=>{const responseKey=`${key}:${field.id}`;return <label className="inline-answer" key={field.id}><span>{field.label}</span><input value={responses[responseKey]??''} placeholder={field.placeholder??'Введите ответ'} inputMode="decimal" onChange={event=>{setResponses(p=>({...p,[responseKey]:event.target.value}));setChecked(p=>({...p,[key]:false}))}}/></label>})}</div><button className="check-button" type="button" onClick={check}>Проверить</button>{checked[key]?complete?<div className="instant-feedback good" data-explanation={task.explanation}><b>Верно.</b><span>{task.explanation}</span></div>:<div className="instant-feedback bad" data-explanation={task.explanation}><b>Пока есть ошибка.</b><span>{attempts[key]>1?task.hint:'Определи, нужна площадь или объём, выпиши формулу и проверь единицы измерения.'}</span></div>:null}</div>:null}{stage.summary?<div className="summary-card"><b>Урок 165 завершён</b><span>20 задач · 50 ответов · площади и объёмы</span></div>:null}</article><nav className="lesson-controls" aria-label="Навигация по этапам урока 165"><button type="button" onClick={()=>move(-1)} disabled={stageIndex===0}>← Назад</button><span>Этап {stageIndex+1} из {stages.length}</span><button type="button" onClick={()=>move(1)} disabled={stageIndex===stages.length-1}>Дальше →</button></nav></section>;
}
