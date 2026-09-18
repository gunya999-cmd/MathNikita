import {useEffect,useMemo,useState} from 'react';
import './lessonPlayer.css';
import './theoryExperience.css';
import {lessonOneHundredSixtyOnePractice,lessonOneHundredSixtyOneResponseCount,type LessonOneHundredSixtyOneField,type LessonOneHundredSixtyOneTask} from './data/lessonOneHundredSixtyOnePractice';
import {exactDecimalEquals} from './exactDecimal';

type Stage={id:string;eyebrow:string;title:string;body:string;note?:string;practice?:LessonOneHundredSixtyOneTask;summary?:boolean};
type Saved={version:1;stageIndex:number;responses:Record<string,string>;checked:Record<string,boolean>;attempts:Record<string,number>};
type Jump={lessonNumber?:number;stageIndex?:number};
const KEY='mathnikita-lesson-161-progress-v1';
const matchField=(value:string,field:LessonOneHundredSixtyOneField)=>field.answers.some(answer=>exactDecimalEquals(value,answer));

const concepts:Stage[]=[
  {id:'l161-multiply',eyebrow:'Урок 161 · итоговое повторение',title:'Умножай как натуральные числа, затем возвращай запятую',body:'При умножении десятичных дробей сначала временно не учитывай запятые. В произведении отдели справа столько цифр, сколько знаков после запятой было в обоих множителях вместе.',note:'0,48·0,35: 48·35=1680, всего 4 знака ⇒ 0,168.'},
  {id:'l161-scale',eyebrow:'Разрядный сдвиг',title:'10, 100 и 1000 меняют положение запятой предсказуемо',body:'При умножении на 10, 100, 1000 запятая переносится вправо на 1, 2, 3 знака. При делении на эти числа — влево.',note:'4,37·100=437, а 437:100=4,37.'},
  {id:'l161-divide-natural',eyebrow:'Деление',title:'При делении на натуральное число сохраняй разряды',body:'Десятичную дробь делят на натуральное число по обычному алгоритму. Запятая в частном появляется тогда, когда деление переходит от целой части к дробной.',note:'84,6:6=14,1.'},
  {id:'l161-divide-decimal',eyebrow:'Десятичный делитель',title:'Сделай делитель натуральным одним и тем же сдвигом',body:'Чтобы разделить на десятичную дробь, умножь и делимое, и делитель на одинаковую степень 10 так, чтобы делитель стал натуральным.',note:'7,56:0,21=756:21=36.'},
  {id:'l161-equations',eyebrow:'Уравнения',title:'Используй обратные действия',body:'Неизвестный множитель находят делением произведения на известный множитель. Неизвестное делимое находят умножением делителя на частное.',note:'0,75x=18 ⇒ x=24; x:1,2=3,5 ⇒ x=4,2.'},
  {id:'l161-problems',eyebrow:'Задачи',title:'Стоимость, движение и производительность — это модели умножения и деления',body:'Сначала определи, какая величина приходится на одну единицу, или умножь величину за единицу на количество единиц. После деления обязательно проверь результат обратным умножением.',note:'28,8 м³ за 2,4 ч ⇒ 12 м³/ч.'}
];
const practiceStages:Stage[]=lessonOneHundredSixtyOnePractice.map((practice,i)=>({id:`l161-practice-${String(i+1).padStart(2,'0')}`,eyebrow:`Практика · ${i+1} из 20`,title:practice.title,body:practice.prompt,practice}));
const stages:Stage[]=[...concepts,...practiceStages,{id:'l161-summary',eyebrow:'Итог урока 161',title:'Умножение и деление десятичных дробей систематизированы',body:'Ты повторил постановку запятой в произведении, разрядный сдвиг, деление на натуральные и десятичные числа, уравнения и прикладные задачи.',note:'Следующий урок продолжит итоговое повторение курса.',summary:true}];
export const lessonOneHundredSixtyOneStageCount=stages.length;
export const lessonOneHundredSixtyOnePracticeTaskCount=lessonOneHundredSixtyOnePractice.length;
export const lessonOneHundredSixtyOnePracticeResponseCount=lessonOneHundredSixtyOneResponseCount;

function load():Saved{try{const raw=localStorage.getItem(KEY);if(!raw)return{version:1,stageIndex:0,responses:{},checked:{},attempts:{}};const p=JSON.parse(raw) as Saved;return p?.version===1?p:{version:1,stageIndex:0,responses:{},checked:{},attempts:{}}}catch{return{version:1,stageIndex:0,responses:{},checked:{},attempts:{}}}}

export function DecimalMultiplicationDivisionReviewPlayer(){
  const initial=useMemo(load,[]);
  const[stageIndex,setStageIndex]=useState(()=>Math.max(0,Math.min(initial.stageIndex,stages.length-1)));
  const[responses,setResponses]=useState(initial.responses);
  const[checked,setChecked]=useState(initial.checked);
  const[attempts,setAttempts]=useState(initial.attempts);
  const stage=stages[stageIndex];const task=stage.practice;const key=stage.id;
  const complete=task?task.fields.every(field=>matchField(responses[`${key}:${field.id}`]??'',field)):true;
  useEffect(()=>{localStorage.setItem(KEY,JSON.stringify({version:1,stageIndex,responses,checked,attempts} satisfies Saved))},[stageIndex,responses,checked,attempts]);
  useEffect(()=>{const handler=(event:Event)=>{const d=(event as CustomEvent<Jump>).detail;if(d?.lessonNumber!==161||typeof d.stageIndex!=='number')return;setStageIndex(Math.max(0,Math.min(Math.trunc(d.stageIndex),stages.length-1)))};window.addEventListener('mathnikita-go-to-stage',handler);return()=>window.removeEventListener('mathnikita-go-to-stage',handler)},[]);
  const check=()=>{if(task){setChecked(p=>({...p,[key]:true}));setAttempts(p=>({...p,[key]:(p[key]??0)+1}))}};
  const move=(delta:number)=>setStageIndex(i=>Math.max(0,Math.min(i+delta,stages.length-1)));
  return <section className="lesson-player theory-experience" aria-label="Урок 161: умножение и деление десятичных дробей"><article className={`interactive-stage ${stage.summary?'stage-summary':''}`} data-stage-id={stage.id} data-stage-index={stageIndex}><div className="stage-copy"><span className="stage-eyebrow">{stage.eyebrow}</span><h2>{stage.title}</h2><p>{stage.body}</p>{stage.note?<p className="theory-note">{stage.note}</p>:null}</div>{task?<div className="activity-area"><h3>{task.prompt}</h3><div className="answer-grid">{task.fields.map(field=>{const responseKey=`${key}:${field.id}`;return <label className="inline-answer" key={field.id}><span>{field.label}</span><input value={responses[responseKey]??''} placeholder={field.placeholder??'Введите ответ'} inputMode="decimal" onChange={event=>{setResponses(p=>({...p,[responseKey]:event.target.value}));setChecked(p=>({...p,[key]:false}))}}/></label>})}</div><button className="check-button" type="button" onClick={check}>Проверить</button>{checked[key]?complete?<div className="instant-feedback good" data-explanation={task.explanation}><b>Верно.</b><span>{task.explanation}</span></div>:<div className="instant-feedback bad" data-explanation={task.explanation}><b>Пока есть ошибка.</b><span>{attempts[key]>1?task.hint:'Проверь положение запятой и обратное действие.'}</span></div>:null}</div>:null}{stage.summary?<div className="summary-card"><b>Урок 161 завершён</b><span>20 задач · 50 ответов · умножение и деление десятичных дробей</span></div>:null}</article><nav className="lesson-controls" aria-label="Навигация по этапам урока 161"><button type="button" onClick={()=>move(-1)} disabled={stageIndex===0}>← Назад</button><span>Этап {stageIndex+1} из {stages.length}</span><button type="button" onClick={()=>move(1)} disabled={stageIndex===stages.length-1}>Дальше →</button></nav></section>;
}
