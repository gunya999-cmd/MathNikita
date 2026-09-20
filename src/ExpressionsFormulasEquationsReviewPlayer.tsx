import {useEffect,useMemo,useState} from 'react';
import './lessonPlayer.css';
import './theoryExperience.css';
import {lessonOneHundredSeventyTwoPractice,lessonOneHundredSeventyTwoResponseCount,type LessonOneHundredSeventyTwoField,type LessonOneHundredSeventyTwoTask} from './data/lessonOneHundredSeventyTwoPractice';
import {exactDecimalEquals} from './exactDecimal';

type Stage={id:string;eyebrow:string;title:string;body:string;note?:string;practice?:LessonOneHundredSeventyTwoTask;summary?:boolean};
type Saved={version:1;stageIndex:number;responses:Record<string,string>;checked:Record<string,boolean>;attempts:Record<string,number>};
type Jump={lessonNumber?:number;stageIndex?:number};
const KEY='mathnikita-lesson-172-progress-v1';
const matchField=(value:string,field:LessonOneHundredSeventyTwoField)=>field.answers.some(answer=>exactDecimalEquals(value,answer));

const concepts:Stage[]=[
  {id:'l172-order',eyebrow:'Урок 172 · выражения',title:'Порядок действий — часть смысла записи',body:'В выражении без скобок сначала выполняют умножение и деление, затем сложение и вычитание. Скобки могут полностью изменить результат.',note:'Перед вычислением полезно мысленно расставить номера действий.'},
  {id:'l172-letters',eyebrow:'Буквенные выражения',title:'Буква хранит число, а запись — правило действий',body:'При подстановке замени каждую букву её значением и сохрани исходную структуру выражения. Особенно внимательно работай со скобками и десятичными числами.',note:'Сначала подстановка, потом порядок действий.'},
  {id:'l172-formulas',eyebrow:'Формулы',title:'Формула связывает величины в обе стороны',body:'P=2(a+b), S=ab, V=abc, s=vt, C=pn — это не только способы найти левую величину. Если неизвестна одна из правых величин, используй обратное действие.',note:'Например, из s=vt следует v=s:t и t=s:v.'},
  {id:'l172-equations',eyebrow:'Уравнения',title:'Отменяй действия в обратном порядке',body:'Чтобы освободить неизвестное, смотри, какие действия выполнялись с ним последовательно, и отменяй их начиная с последнего.',note:'Для 3x+18=93 сначала убирают +18, затем умножение на 3.'},
  {id:'l172-check',eyebrow:'Проверка корня',title:'Корень считается найденным только после подстановки',body:'Подставь найденное значение в исходное уравнение, а не в промежуточную строку. Левая часть должна точно дать правую.',note:'Проверка ловит ошибки знака, деления и потерянных скобок.'},
  {id:'l172-model',eyebrow:'Связь тем',title:'Выражение, формула и уравнение — одна система',body:'Текстовая задача превращается в формулу или уравнение, формула — в выражение после подстановки, а вычисление возвращает ответ в смысл задачи.',note:'Финальная цель — видеть переход: условие → запись → вычисление → проверка.'}
];
const practiceStages:Stage[]=lessonOneHundredSeventyTwoPractice.map((practice,i)=>({id:`l172-practice-${String(i+1).padStart(2,'0')}`,eyebrow:`Практика · ${i+1} из 20`,title:practice.title,body:practice.prompt,practice}));
const stages:Stage[]=[...concepts,...practiceStages,{id:'l172-summary',eyebrow:'Итог урока 172',title:'Выражения, формулы и уравнения систематизированы',body:'Ты повторил порядок действий, подстановку значений, прямое и обратное использование формул и решение уравнений с проверкой.',note:'20 задач · 50 ответов · алгебраический язык курса 5 класса.',summary:true}];
export const lessonOneHundredSeventyTwoStageCount=stages.length;
export const lessonOneHundredSeventyTwoPracticeTaskCount=lessonOneHundredSeventyTwoPractice.length;
export const lessonOneHundredSeventyTwoPracticeResponseCount=lessonOneHundredSeventyTwoResponseCount;

function load():Saved{try{const raw=localStorage.getItem(KEY);if(!raw)return{version:1,stageIndex:0,responses:{},checked:{},attempts:{}};const p=JSON.parse(raw) as Saved;return p?.version===1?p:{version:1,stageIndex:0,responses:{},checked:{},attempts:{}}}catch{return{version:1,stageIndex:0,responses:{},checked:{},attempts:{}}}}

export function ExpressionsFormulasEquationsReviewPlayer(){
  const initial=useMemo(load,[]);
  const[stageIndex,setStageIndex]=useState(()=>Math.max(0,Math.min(initial.stageIndex,stages.length-1)));
  const[responses,setResponses]=useState(initial.responses);
  const[checked,setChecked]=useState(initial.checked);
  const[attempts,setAttempts]=useState(initial.attempts);
  const stage=stages[stageIndex];const task=stage.practice;const key=stage.id;
  const complete=task?task.fields.every(field=>matchField(responses[`${key}:${field.id}`]??'',field)):true;
  useEffect(()=>{localStorage.setItem(KEY,JSON.stringify({version:1,stageIndex,responses,checked,attempts} satisfies Saved))},[stageIndex,responses,checked,attempts]);
  useEffect(()=>{const handler=(event:Event)=>{const d=(event as CustomEvent<Jump>).detail;if(d?.lessonNumber!==172||typeof d.stageIndex!=='number')return;setStageIndex(Math.max(0,Math.min(Math.trunc(d.stageIndex),stages.length-1)))};window.addEventListener('mathnikita-go-to-stage',handler);return()=>window.removeEventListener('mathnikita-go-to-stage',handler)},[]);
  const check=()=>{if(task){setChecked(p=>({...p,[key]:true}));setAttempts(p=>({...p,[key]:(p[key]??0)+1}))}};
  const move=(delta:number)=>setStageIndex(i=>Math.max(0,Math.min(i+delta,stages.length-1)));
  return <section className="lesson-player theory-experience" aria-label="Урок 172: выражения, формулы и уравнения"><article className={`interactive-stage ${stage.summary?'stage-summary':''}`} data-stage-id={stage.id} data-stage-index={stageIndex}><div className="stage-copy"><span className="stage-eyebrow">{stage.eyebrow}</span><h2>{stage.title}</h2><p>{stage.body}</p>{stage.note?<p className="theory-note">{stage.note}</p>:null}</div>{task?<div className="activity-area"><h3>{task.prompt}</h3><div className="answer-grid">{task.fields.map(field=>{const responseKey=`${key}:${field.id}`;return <label className="inline-answer" key={field.id}><span>{field.label}</span><input value={responses[responseKey]??''} placeholder={field.placeholder??'Введите ответ'} inputMode="decimal" onChange={event=>{setResponses(p=>({...p,[responseKey]:event.target.value}));setChecked(p=>({...p,[key]:false}))}}/></label>})}</div><button className="check-button" type="button" onClick={check}>Проверить</button>{checked[key]?complete?<div className="instant-feedback good" data-explanation={task.explanation}><b>Верно.</b><span>{task.explanation}</span></div>:<div className="instant-feedback bad" data-explanation={task.explanation}><b>Пока есть ошибка.</b><span>{attempts[key]>1?task.hint:'Проверь порядок действий, подстановку, выбранную формулу или обратное действие в уравнении.'}</span></div>:null}</div>:null}{stage.summary?<div className="summary-card"><b>Урок 172 завершён</b><span>20 задач · 50 ответов · выражения, формулы и уравнения</span></div>:null}</article><nav className="lesson-controls" aria-label="Навигация по этапам урока 172"><button type="button" onClick={()=>move(-1)} disabled={stageIndex===0}>← Назад</button><span>Этап {stageIndex+1} из {stages.length}</span><button type="button" onClick={()=>move(1)} disabled={stageIndex===stages.length-1}>Дальше →</button></nav></section>;
}
