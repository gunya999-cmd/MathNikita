import {useEffect,useMemo,useState} from 'react';
import './lessonPlayer.css';
import './theoryExperience.css';
import {lessonOneHundredFiftyEightPractice,lessonOneHundredFiftyEightResponseCount,type LessonOneHundredFiftyEightField,type LessonOneHundredFiftyEightTask} from './data/lessonOneHundredFiftyEightPractice';

type Stage={id:string;eyebrow:string;title:string;body:string;note?:string;practice?:LessonOneHundredFiftyEightTask;summary?:boolean};
type Saved={version:1;stageIndex:number;responses:Record<string,string>;checked:Record<string,boolean>;attempts:Record<string,number>};
type Jump={lessonNumber?:number;stageIndex?:number};
const KEY='mathnikita-lesson-158-progress-v1';
const norm=(v:string)=>v.normalize('NFKC').trim().toLocaleLowerCase('ru-RU').replace(/\s+/g,'').replace(/,/g,'.');
const canonicalDecimal=(v:string)=>{let s=norm(v);if(!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(s))return null;let sign='';if(s.startsWith('+')||s.startsWith('-')){sign=s.startsWith('-')?'-':'';s=s.slice(1)}let[whole,frac='']=s.split('.');whole=(whole||'0').replace(/^0+(?=\d)/,'');frac=frac.replace(/0+$/,'');if(whole==='0'&&!frac)sign='';return `${sign}${whole}${frac?`.${frac}`:''}`};
const matchField=(value:string,field:LessonOneHundredFiftyEightField)=>{const v=norm(value);if(!v)return false;const cv=canonicalDecimal(v);return field.answers.some(answer=>{const a=norm(answer);if(v===a)return true;const ca=canonicalDecimal(a);return cv!==null&&ca!==null&&cv===ca})};

const concepts:Stage[]=[
  {id:'l158-map',eyebrow:'Урок 158 · итоговое повторение',title:'Умножение и деление — один связанный блок',body:'Умножение проверяется делением, а деление — умножением. В сложном выражении сначала определяется структура, а уже потом выполняются вычисления.',note:'Главная цель — точность, а не скорость любой ценой.'},
  {id:'l158-multiply',eyebrow:'Умножение',title:'Разложение числа упрощает вычисление',body:'Многозначный множитель можно разложить на разрядные слагаемые и применить распределительное свойство. Это даёт понятные промежуточные результаты и удобную проверку.',note:'438·207 = 438·200 + 438·7.'},
  {id:'l158-divide',eyebrow:'Деление',title:'Оцени частное до вычисления',body:'Перед письменным делением полезно оценить порядок величины частного. После вычисления проверь: делитель·частное должен вернуть делимое.',note:'39840:83 близко к 40000:80, значит ответ должен быть около 500.'},
  {id:'l158-remainder',eyebrow:'Деление с остатком',title:'Остаток всегда меньше делителя',body:'Для деления с остатком действует формула: делимое = делитель·частное + остаток, где 0 ≤ остаток < делителя.',note:'Если остаток не меньше делителя, деление выполнено неверно.'},
  {id:'l158-equations',eyebrow:'Уравнения',title:'Связь компонентов определяет действие',body:'Неизвестный множитель находят делением произведения. Неизвестное делимое — умножением частного на делитель. Неизвестный делитель — делением делимого на частное.',note:'Всегда подставляй найденное число обратно.'},
  {id:'l158-problems',eyebrow:'Задачи',title:'Производительность связывает три величины',body:'Объём работы = производительность·время. Если сравниваются два одновременно работающих объекта, разность объёмов связана с разностью их производительностей.',note:'Сначала подпиши единицы измерения, потом вычисляй.'}
];
const practiceStages:Stage[]=lessonOneHundredFiftyEightPractice.map((practice,i)=>({id:`l158-practice-${String(i+1).padStart(2,'0')}`,eyebrow:`Практика · ${i+1} из 20`,title:practice.title,body:practice.prompt,practice}));
const stages:Stage[]=[...concepts,...practiceStages,{id:'l158-summary',eyebrow:'Итог урока 158',title:'Умножение и деление систематизированы',body:'Ты повторил письменное умножение и деление, порядок действий, деление с остатком, уравнения, распределительное свойство и задачи на производительность.',note:'Следующий блок итогового повторения — обыкновенные дроби.',summary:true}];
export const lessonOneHundredFiftyEightStageCount=stages.length;
export const lessonOneHundredFiftyEightPracticeTaskCount=lessonOneHundredFiftyEightPractice.length;
export const lessonOneHundredFiftyEightPracticeResponseCount=lessonOneHundredFiftyEightResponseCount;

function load():Saved{try{const raw=localStorage.getItem(KEY);if(!raw)return{version:1,stageIndex:0,responses:{},checked:{},attempts:{}};const p=JSON.parse(raw) as Saved;return p?.version===1?p:{version:1,stageIndex:0,responses:{},checked:{},attempts:{}}}catch{return{version:1,stageIndex:0,responses:{},checked:{},attempts:{}}}}

export function NaturalMultiplicationDivisionReviewPlayer(){
  const initial=useMemo(load,[]);
  const[stageIndex,setStageIndex]=useState(()=>Math.max(0,Math.min(initial.stageIndex,stages.length-1)));
  const[responses,setResponses]=useState(initial.responses);
  const[checked,setChecked]=useState(initial.checked);
  const[attempts,setAttempts]=useState(initial.attempts);
  const stage=stages[stageIndex];const task=stage.practice;const key=stage.id;
  const complete=task?task.fields.every(field=>matchField(responses[`${key}:${field.id}`]??'',field)):true;
  useEffect(()=>{localStorage.setItem(KEY,JSON.stringify({version:1,stageIndex,responses,checked,attempts} satisfies Saved))},[stageIndex,responses,checked,attempts]);
  useEffect(()=>{const handler=(event:Event)=>{const d=(event as CustomEvent<Jump>).detail;if(d?.lessonNumber!==158||typeof d.stageIndex!=='number')return;setStageIndex(Math.max(0,Math.min(Math.trunc(d.stageIndex),stages.length-1)))};window.addEventListener('mathnikita-go-to-stage',handler);return()=>window.removeEventListener('mathnikita-go-to-stage',handler)},[]);
  const check=()=>{if(task){setChecked(p=>({...p,[key]:true}));setAttempts(p=>({...p,[key]:(p[key]??0)+1}))}};
  const move=(delta:number)=>setStageIndex(i=>Math.max(0,Math.min(i+delta,stages.length-1)));
  return <section className="lesson-player theory-experience" aria-label="Урок 158: умножение и деление натуральных чисел"><article className={`interactive-stage ${stage.summary?'stage-summary':''}`} data-stage-id={stage.id} data-stage-index={stageIndex}><div className="stage-copy"><span className="stage-eyebrow">{stage.eyebrow}</span><h2>{stage.title}</h2><p>{stage.body}</p>{stage.note?<p className="theory-note">{stage.note}</p>:null}</div>{task?<div className="activity-area"><h3>{task.prompt}</h3><div className="answer-grid">{task.fields.map(field=>{const responseKey=`${key}:${field.id}`;return <label className="inline-answer" key={field.id}><span>{field.label}</span><input value={responses[responseKey]??''} placeholder={field.placeholder??'Введите ответ'} onChange={event=>{setResponses(p=>({...p,[responseKey]:event.target.value}));setChecked(p=>({...p,[key]:false}))}}/></label>})}</div><button className="check-button" type="button" onClick={check}>Проверить</button>{checked[key]?complete?<div className="instant-feedback good" data-explanation={task.explanation}><b>Верно.</b><span>{task.explanation}</span></div>:<div className="instant-feedback bad" data-explanation={task.explanation}><b>Пока есть ошибка.</b><span>{attempts[key]>1?task.hint:'Проверь порядок действий и выполни обратное действие.'}</span></div>:null}</div>:null}{stage.summary?<div className="summary-card"><b>Урок 158 завершён</b><span>20 задач · 50 ответов · умножение и деление</span></div>:null}</article><nav className="lesson-controls" aria-label="Навигация по этапам урока 158"><button type="button" onClick={()=>move(-1)} disabled={stageIndex===0}>← Назад</button><span>Этап {stageIndex+1} из {stages.length}</span><button type="button" onClick={()=>move(1)} disabled={stageIndex===stages.length-1}>Дальше →</button></nav></section>;
}
