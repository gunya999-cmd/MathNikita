import {useEffect,useMemo,useState} from 'react';
import './lessonPlayer.css';
import './theoryExperience.css';
import {lessonOneHundredFiftySevenPractice,lessonOneHundredFiftySevenResponseCount,type LessonOneHundredFiftySevenField,type LessonOneHundredFiftySevenTask} from './data/lessonOneHundredFiftySevenPractice';

type Stage={id:string;eyebrow:string;title:string;body:string;note?:string;practice?:LessonOneHundredFiftySevenTask;summary?:boolean};
type Saved={version:1;stageIndex:number;responses:Record<string,string>;checked:Record<string,boolean>;attempts:Record<string,number>};
type Jump={lessonNumber?:number;stageIndex?:number};
const KEY='mathnikita-lesson-157-progress-v1';
const norm=(v:string)=>v.normalize('NFKC').trim().toLocaleLowerCase('ru-RU').replace(/\s+/g,'').replace(/,/g,'.');
const canonicalDecimal=(v:string)=>{let s=norm(v);if(!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(s))return null;let sign='';if(s.startsWith('+')||s.startsWith('-')){sign=s.startsWith('-')?'-':'';s=s.slice(1)}let[whole,frac='']=s.split('.');whole=(whole||'0').replace(/^0+(?=\d)/,'');frac=frac.replace(/0+$/,'');if(whole==='0'&&!frac)sign='';return `${sign}${whole}${frac?`.${frac}`:''}`};
const matchField=(value:string,field:LessonOneHundredFiftySevenField)=>{const v=norm(value);if(!v)return false;const cv=canonicalDecimal(v);return field.answers.some(answer=>{const a=norm(answer);if(v===a)return true;const ca=canonicalDecimal(a);return cv!==null&&ca!==null&&cv===ca})};

const concepts:Stage[]=[
  {id:'l157-map',eyebrow:'Урок 157 · итоговое повторение',title:'Натуральные числа — фундамент курса',body:'После контрольной №9 возвращаемся к базовым вычислениям: сложению, вычитанию, умножению, делению, порядку действий, уравнениям и задачам.',note:'Цель не выучить новое, а восстановить точность и скорость.'},
  {id:'l157-add',eyebrow:'Сложение и вычитание',title:'Разряды должны стоять друг под другом',body:'При письменном сложении и вычитании единицы записываются под единицами, десятки под десятками и так далее. Вычитание удобно проверять сложением.',note:'После вычисления оцени порядок величины ответа: это ловит потерянные разряды.'},
  {id:'l157-multiply',eyebrow:'Умножение и деление',title:'Сначала структура, потом вычисления',body:'В сложном выражении сначала выполняются действия в скобках, затем умножение и деление, затем сложение и вычитание.',note:'Для деления с остатком всегда проверяй: остаток меньше делителя.'},
  {id:'l157-equations',eyebrow:'Уравнения',title:'Не угадывай — используй связь компонентов',body:'Неизвестное слагаемое находят вычитанием, неизвестное уменьшаемое — сложением, неизвестное вычитаемое — вычитанием из уменьшаемого.',note:'Подстановка найденного значения — обязательная проверка.'},
  {id:'l157-properties',eyebrow:'Свойства действий',title:'Ищи удобный путь',body:'Переместительное, сочетательное и распределительное свойства позволяют заменить длинные вычисления короткими равносильными.',note:'48·125+52·125 удобнее считать как (48+52)·125.'},
  {id:'l157-problems',eyebrow:'Текстовые задачи',title:'Сначала модель задачи',body:'Перед вычислением выпиши, что изменяется, какие величины известны и какое действие связывает их. В составной задаче шаги должны идти в логическом порядке.',note:'Ответ проверяется не только арифметически, но и по смыслу условия.'}
];
const practiceStages:Stage[]=lessonOneHundredFiftySevenPractice.map((practice,i)=>({id:`l157-practice-${String(i+1).padStart(2,'0')}`,eyebrow:`Практика · ${i+1} из 20`,title:practice.title,body:practice.prompt,practice}));
const stages:Stage[]=[...concepts,...practiceStages,{id:'l157-summary',eyebrow:'Итог урока 157',title:'База натуральных чисел восстановлена',body:'Ты повторил четыре арифметических действия, порядок действий, уравнения, свойства вычислений и составные задачи с натуральными числами.',note:'Следующий урок продолжит итоговое повторение курса.',summary:true}];
export const lessonOneHundredFiftySevenStageCount=stages.length;
export const lessonOneHundredFiftySevenPracticeTaskCount=lessonOneHundredFiftySevenPractice.length;
export const lessonOneHundredFiftySevenPracticeResponseCount=lessonOneHundredFiftySevenResponseCount;

function load():Saved{try{const raw=localStorage.getItem(KEY);if(!raw)return{version:1,stageIndex:0,responses:{},checked:{},attempts:{}};const p=JSON.parse(raw) as Saved;return p?.version===1?p:{version:1,stageIndex:0,responses:{},checked:{},attempts:{}}}catch{return{version:1,stageIndex:0,responses:{},checked:{},attempts:{}}}}

export function NaturalNumberCourseReviewPlayer(){
  const initial=useMemo(load,[]);
  const[stageIndex,setStageIndex]=useState(()=>Math.max(0,Math.min(initial.stageIndex,stages.length-1)));
  const[responses,setResponses]=useState(initial.responses);
  const[checked,setChecked]=useState(initial.checked);
  const[attempts,setAttempts]=useState(initial.attempts);
  const stage=stages[stageIndex];const task=stage.practice;const key=stage.id;
  const complete=task?task.fields.every(field=>matchField(responses[`${key}:${field.id}`]??'',field)):true;
  useEffect(()=>{localStorage.setItem(KEY,JSON.stringify({version:1,stageIndex,responses,checked,attempts} satisfies Saved))},[stageIndex,responses,checked,attempts]);
  useEffect(()=>{const handler=(event:Event)=>{const d=(event as CustomEvent<Jump>).detail;if(d?.lessonNumber!==157||typeof d.stageIndex!=='number')return;setStageIndex(Math.max(0,Math.min(Math.trunc(d.stageIndex),stages.length-1)))};window.addEventListener('mathnikita-go-to-stage',handler);return()=>window.removeEventListener('mathnikita-go-to-stage',handler)},[]);
  const check=()=>{if(task){setChecked(p=>({...p,[key]:true}));setAttempts(p=>({...p,[key]:(p[key]??0)+1}))}};
  const move=(delta:number)=>setStageIndex(i=>Math.max(0,Math.min(i+delta,stages.length-1)));
  return <section className="lesson-player theory-experience" aria-label="Урок 157: итоговое повторение натуральных чисел"><article className={`interactive-stage ${stage.summary?'stage-summary':''}`} data-stage-id={stage.id} data-stage-index={stageIndex}><div className="stage-copy"><span className="stage-eyebrow">{stage.eyebrow}</span><h2>{stage.title}</h2><p>{stage.body}</p>{stage.note?<p className="theory-note">{stage.note}</p>:null}</div>{task?<div className="activity-area"><h3>{task.prompt}</h3><div className="answer-grid">{task.fields.map(field=>{const responseKey=`${key}:${field.id}`;return <label className="inline-answer" key={field.id}><span>{field.label}</span><input value={responses[responseKey]??''} placeholder={field.placeholder??'Введите ответ'} onChange={event=>{setResponses(p=>({...p,[responseKey]:event.target.value}));setChecked(p=>({...p,[key]:false}))}}/></label>})}</div><button className="check-button" type="button" onClick={check}>Проверить</button>{checked[key]?complete?<div className="instant-feedback good" data-explanation={task.explanation}><b>Верно.</b><span>{task.explanation}</span></div>:<div className="instant-feedback bad" data-explanation={task.explanation}><b>Пока есть ошибка.</b><span>{attempts[key]>1?task.hint:'Проверь порядок действий, разряды и связь между величинами.'}</span></div>:null}</div>:null}{stage.summary?<div className="summary-card"><b>Урок 157 завершён</b><span>20 задач · 50 ответов · натуральные числа</span></div>:null}</article><nav className="lesson-controls" aria-label="Навигация по этапам урока 157"><button type="button" onClick={()=>move(-1)} disabled={stageIndex===0}>← Назад</button><span>Этап {stageIndex+1} из {stages.length}</span><button type="button" onClick={()=>move(1)} disabled={stageIndex===stages.length-1}>Дальше →</button></nav></section>;
}
