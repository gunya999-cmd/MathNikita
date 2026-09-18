import {useEffect,useMemo,useState} from 'react';
import './lessonPlayer.css';
import './theoryExperience.css';
import {lessonOneHundredSixtyTwoPractice,lessonOneHundredSixtyTwoResponseCount,type LessonOneHundredSixtyTwoField,type LessonOneHundredSixtyTwoTask} from './data/lessonOneHundredSixtyTwoPractice';
import {exactDecimalEquals} from './exactDecimal';

type Stage={id:string;eyebrow:string;title:string;body:string;note?:string;practice?:LessonOneHundredSixtyTwoTask;summary?:boolean};
type Saved={version:1;stageIndex:number;responses:Record<string,string>;checked:Record<string,boolean>;attempts:Record<string,number>};
type Jump={lessonNumber?:number;stageIndex?:number};
const KEY='mathnikita-lesson-162-progress-v1';
const matchField=(value:string,field:LessonOneHundredSixtyTwoField)=>field.answers.some(answer=>exactDecimalEquals(value,answer));

const concepts:Stage[]=[
  {id:'l162-percent-as-decimal',eyebrow:'Урок 162 · итоговое повторение',title:'Процент — это сотая доля',body:'Чтобы перейти от процентов к вычислению, раздели процент на 100. Тогда 25%=0,25; 7,5%=0,075; 135%=1,35.',note:'Одна и та же идея работает и для процентов меньше 1%, и для процентов больше 100%.'},
  {id:'l162-find-part',eyebrow:'Процент от числа',title:'Чтобы найти p% от числа, умножь число на p/100',body:'Если нужно найти 12% от 450, вычисли 450·0,12=54. Это прямая процентная задача.',note:'Сначала явно выпиши коэффициент p/100.'},
  {id:'l162-find-whole',eyebrow:'Число по его проценту',title:'Чтобы восстановить 100%, раздели известную часть на p/100',body:'Если 18% числа равны 72, то всё число равно 72:0,18=400. После решения полезно проверить: 400·0,18=72.',note:'В обратной задаче ответ обычно больше известной части, если p<100%.'},
  {id:'l162-change',eyebrow:'Скидки и наценки',title:'После изменения найди, сколько процентов осталось или стало',body:'После скидки 15% остаётся 85% исходной цены. После увеличения на 12% новая величина составляет 112% исходной.',note:'Это позволяет считать одним действием: умножать на 0,85 или на 1,12.'},
  {id:'l162-base',eyebrow:'База 100%',title:'В составной задаче база может измениться',body:'Если сначала использовали 25% исходного количества, а затем 15% от остатка, второй процент относится уже к новой базе. Нельзя второй раз брать процент от исходного числа.',note:'Перед каждым процентным действием спроси: «Что сейчас равно 100%?»'},
  {id:'l162-check',eyebrow:'Проверка',title:'Прямая и обратная задачи должны согласовываться',body:'Если ты восстановил исходное число, умножь его на известный процент и убедись, что получилась данная часть. Для скидки проверь, что новая цена плюс скидка возвращают исходную.',note:'Такая проверка хорошо обнаруживает перепутанные 20% и 80%.'}
];
const practiceStages:Stage[]=lessonOneHundredSixtyTwoPractice.map((practice,i)=>({id:`l162-practice-${String(i+1).padStart(2,'0')}`,eyebrow:`Практика · ${i+1} из 20`,title:practice.title,body:practice.prompt,practice}));
const stages:Stage[]=[...concepts,...practiceStages,{id:'l162-summary',eyebrow:'Итог урока 162',title:'Прямые и обратные процентные задачи систематизированы',body:'Ты повторил перевод процентов в коэффициент, нахождение процента от числа, восстановление 100%, скидки, наценки, остаток и составные задачи с меняющейся базой.',note:'20 задач · 50 ответов · §§37–38.',summary:true}];
export const lessonOneHundredSixtyTwoStageCount=stages.length;
export const lessonOneHundredSixtyTwoPracticeTaskCount=lessonOneHundredSixtyTwoPractice.length;
export const lessonOneHundredSixtyTwoPracticeResponseCount=lessonOneHundredSixtyTwoResponseCount;

function load():Saved{try{const raw=localStorage.getItem(KEY);if(!raw)return{version:1,stageIndex:0,responses:{},checked:{},attempts:{}};const p=JSON.parse(raw) as Saved;return p?.version===1?p:{version:1,stageIndex:0,responses:{},checked:{},attempts:{}}}catch{return{version:1,stageIndex:0,responses:{},checked:{},attempts:{}}}}

export function PercentCourseReviewPlayer(){
  const initial=useMemo(load,[]);
  const[stageIndex,setStageIndex]=useState(()=>Math.max(0,Math.min(initial.stageIndex,stages.length-1)));
  const[responses,setResponses]=useState(initial.responses);
  const[checked,setChecked]=useState(initial.checked);
  const[attempts,setAttempts]=useState(initial.attempts);
  const stage=stages[stageIndex];const task=stage.practice;const key=stage.id;
  const complete=task?task.fields.every(field=>matchField(responses[`${key}:${field.id}`]??'',field)):true;
  useEffect(()=>{localStorage.setItem(KEY,JSON.stringify({version:1,stageIndex,responses,checked,attempts} satisfies Saved))},[stageIndex,responses,checked,attempts]);
  useEffect(()=>{const handler=(event:Event)=>{const d=(event as CustomEvent<Jump>).detail;if(d?.lessonNumber!==162||typeof d.stageIndex!=='number')return;setStageIndex(Math.max(0,Math.min(Math.trunc(d.stageIndex),stages.length-1)))};window.addEventListener('mathnikita-go-to-stage',handler);return()=>window.removeEventListener('mathnikita-go-to-stage',handler)},[]);
  const check=()=>{if(task){setChecked(p=>({...p,[key]:true}));setAttempts(p=>({...p,[key]:(p[key]??0)+1}))}};
  const move=(delta:number)=>setStageIndex(i=>Math.max(0,Math.min(i+delta,stages.length-1)));
  return <section className="lesson-player theory-experience" aria-label="Урок 162: проценты от числа и число по его процентам"><article className={`interactive-stage ${stage.summary?'stage-summary':''}`} data-stage-id={stage.id} data-stage-index={stageIndex}><div className="stage-copy"><span className="stage-eyebrow">{stage.eyebrow}</span><h2>{stage.title}</h2><p>{stage.body}</p>{stage.note?<p className="theory-note">{stage.note}</p>:null}</div>{task?<div className="activity-area"><h3>{task.prompt}</h3><div className="answer-grid">{task.fields.map(field=>{const responseKey=`${key}:${field.id}`;return <label className="inline-answer" key={field.id}><span>{field.label}</span><input value={responses[responseKey]??''} placeholder={field.placeholder??'Введите ответ'} inputMode="decimal" onChange={event=>{setResponses(p=>({...p,[responseKey]:event.target.value}));setChecked(p=>({...p,[key]:false}))}}/></label>})}</div><button className="check-button" type="button" onClick={check}>Проверить</button>{checked[key]?complete?<div className="instant-feedback good" data-explanation={task.explanation}><b>Верно.</b><span>{task.explanation}</span></div>:<div className="instant-feedback bad" data-explanation={task.explanation}><b>Пока есть ошибка.</b><span>{attempts[key]>1?task.hint:'Определи, что равно 100%, и реши: умножать на p/100 или делить на p/100.'}</span></div>:null}</div>:null}{stage.summary?<div className="summary-card"><b>Урок 162 завершён</b><span>20 задач · 50 ответов · проценты от числа и число по процентам</span></div>:null}</article><nav className="lesson-controls" aria-label="Навигация по этапам урока 162"><button type="button" onClick={()=>move(-1)} disabled={stageIndex===0}>← Назад</button><span>Этап {stageIndex+1} из {stages.length}</span><button type="button" onClick={()=>move(1)} disabled={stageIndex===stages.length-1}>Дальше →</button></nav></section>;
}
