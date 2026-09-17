import {useEffect,useMemo,useState} from 'react';
import './lessonPlayer.css';
import './theoryExperience.css';
import {lessonOneHundredFiftyNinePractice,lessonOneHundredFiftyNineResponseCount,type LessonOneHundredFiftyNineField,type LessonOneHundredFiftyNineTask} from './data/lessonOneHundredFiftyNinePractice';
import {exactRationalEquals} from './exactRational';

type Stage={id:string;eyebrow:string;title:string;body:string;note?:string;practice?:LessonOneHundredFiftyNineTask;summary?:boolean};
type Saved={version:1;stageIndex:number;responses:Record<string,string>;checked:Record<string,boolean>;attempts:Record<string,number>};
type Jump={lessonNumber?:number;stageIndex?:number};
const KEY='mathnikita-lesson-159-progress-v1';
const matchField=(value:string,field:LessonOneHundredFiftyNineField)=>field.answers.some(answer=>exactRationalEquals(value,answer));

const concepts:Stage[]=[
  {id:'l159-map',eyebrow:'Урок 159 · итоговое повторение',title:'Дробь — это число, а не два отдельных числа',body:'Знаменатель показывает, на сколько равных частей разделили целое, а числитель — сколько таких частей взяли.',note:'Например, 3/5 — три части из пяти равных.'},
  {id:'l159-equivalent',eyebrow:'Равные дроби',title:'Величина не меняется при одинаковом масштабировании',body:'Если числитель и знаменатель умножить или разделить на одно и то же ненулевое число, получится равная дробь.',note:'3/5 = 6/10 = 12/20.'},
  {id:'l159-compare',eyebrow:'Сравнение',title:'Одинаковые знаменатели — сравни числители',body:'При одинаковом знаменателе больше та дробь, у которой больше числитель. Правильная дробь меньше 1, неправильная может быть равна или больше 1.',note:'9/11 > 7/11.'},
  {id:'l159-mixed',eyebrow:'Смешанные числа',title:'Неправильная дробь и смешанное число — две записи одного числа',body:'Чтобы выделить целую часть, раздели числитель на знаменатель. Для обратного перехода умножь целую часть на знаменатель и прибавь числитель.',note:'23/6 = 3 5/6, а 4 3/7 = 31/7.'},
  {id:'l159-actions',eyebrow:'Действия',title:'При одинаковых знаменателях работаем с числителями',body:'При сложении и вычитании дробей с одинаковыми знаменателями знаменатель сохраняется, а числители складываются или вычитаются. Результат нужно сократить, если возможно.',note:'17/20−9/20=8/20=2/5.'},
  {id:'l159-problems',eyebrow:'Задачи',title:'Дробь от числа и целое по его дроби — обратные модели',body:'Чтобы найти a/b от числа, раздели число на b и умножь на a. Чтобы восстановить целое по известной дроби, сначала найди одну долю.',note:'Если 5/7 числа равны 45, то 1/7=9, а целое 63.'}
];
const practiceStages:Stage[]=lessonOneHundredFiftyNinePractice.map((practice,i)=>({id:`l159-practice-${String(i+1).padStart(2,'0')}`,eyebrow:`Практика · ${i+1} из 20`,title:practice.title,body:practice.prompt,practice}));
const stages:Stage[]=[...concepts,...practiceStages,{id:'l159-summary',eyebrow:'Итог урока 159',title:'Обыкновенные дроби систематизированы',body:'Ты повторил смысл дроби, равные дроби, сравнение, смешанные числа, сложение и вычитание, дробь от числа и восстановление целого.',note:'Следующий урок продолжит итоговое повторение курса.',summary:true}];
export const lessonOneHundredFiftyNineStageCount=stages.length;
export const lessonOneHundredFiftyNinePracticeTaskCount=lessonOneHundredFiftyNinePractice.length;
export const lessonOneHundredFiftyNinePracticeResponseCount=lessonOneHundredFiftyNineResponseCount;

function load():Saved{try{const raw=localStorage.getItem(KEY);if(!raw)return{version:1,stageIndex:0,responses:{},checked:{},attempts:{}};const p=JSON.parse(raw) as Saved;return p?.version===1?p:{version:1,stageIndex:0,responses:{},checked:{},attempts:{}}}catch{return{version:1,stageIndex:0,responses:{},checked:{},attempts:{}}}}

export function CommonFractionsReviewPlayer(){
  const initial=useMemo(load,[]);
  const[stageIndex,setStageIndex]=useState(()=>Math.max(0,Math.min(initial.stageIndex,stages.length-1)));
  const[responses,setResponses]=useState(initial.responses);
  const[checked,setChecked]=useState(initial.checked);
  const[attempts,setAttempts]=useState(initial.attempts);
  const stage=stages[stageIndex];const task=stage.practice;const key=stage.id;
  const complete=task?task.fields.every(field=>matchField(responses[`${key}:${field.id}`]??'',field)):true;
  useEffect(()=>{localStorage.setItem(KEY,JSON.stringify({version:1,stageIndex,responses,checked,attempts} satisfies Saved))},[stageIndex,responses,checked,attempts]);
  useEffect(()=>{const handler=(event:Event)=>{const d=(event as CustomEvent<Jump>).detail;if(d?.lessonNumber!==159||typeof d.stageIndex!=='number')return;setStageIndex(Math.max(0,Math.min(Math.trunc(d.stageIndex),stages.length-1)))};window.addEventListener('mathnikita-go-to-stage',handler);return()=>window.removeEventListener('mathnikita-go-to-stage',handler)},[]);
  const check=()=>{if(task){setChecked(p=>({...p,[key]:true}));setAttempts(p=>({...p,[key]:(p[key]??0)+1}))}};
  const move=(delta:number)=>setStageIndex(i=>Math.max(0,Math.min(i+delta,stages.length-1)));
  return <section className="lesson-player theory-experience" aria-label="Урок 159: обыкновенные дроби"><article className={`interactive-stage ${stage.summary?'stage-summary':''}`} data-stage-id={stage.id} data-stage-index={stageIndex}><div className="stage-copy"><span className="stage-eyebrow">{stage.eyebrow}</span><h2>{stage.title}</h2><p>{stage.body}</p>{stage.note?<p className="theory-note">{stage.note}</p>:null}</div>{task?<div className="activity-area"><h3>{task.prompt}</h3><div className="answer-grid">{task.fields.map(field=>{const responseKey=`${key}:${field.id}`;return <label className="inline-answer" key={field.id}><span>{field.label}</span><input value={responses[responseKey]??''} placeholder={field.placeholder??'Введите ответ'} onChange={event=>{setResponses(p=>({...p,[responseKey]:event.target.value}));setChecked(p=>({...p,[key]:false}))}}/></label>})}</div><button className="check-button" type="button" onClick={check}>Проверить</button>{checked[key]?complete?<div className="instant-feedback good" data-explanation={task.explanation}><b>Верно.</b><span>{task.explanation}</span></div>:<div className="instant-feedback bad" data-explanation={task.explanation}><b>Пока есть ошибка.</b><span>{attempts[key]>1?task.hint:'Проверь смысл дроби, знаменатель и сократи результат, если это возможно.'}</span></div>:null}</div>:null}{stage.summary?<div className="summary-card"><b>Урок 159 завершён</b><span>20 задач · 50 ответов · обыкновенные дроби</span></div>:null}</article><nav className="lesson-controls" aria-label="Навигация по этапам урока 159"><button type="button" onClick={()=>move(-1)} disabled={stageIndex===0}>← Назад</button><span>Этап {stageIndex+1} из {stages.length}</span><button type="button" onClick={()=>move(1)} disabled={stageIndex===stages.length-1}>Дальше →</button></nav></section>;
}
