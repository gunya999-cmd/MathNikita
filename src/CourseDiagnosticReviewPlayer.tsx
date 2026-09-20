import {useEffect,useMemo,useState} from 'react';
import './lessonPlayer.css';
import './theoryExperience.css';
import {lessonOneHundredSeventyThreePractice,lessonOneHundredSeventyThreeResponseCount,type LessonOneHundredSeventyThreeDomain,type LessonOneHundredSeventyThreeField,type LessonOneHundredSeventyThreeTask} from './data/lessonOneHundredSeventyThreePractice';
import {exactDecimalEquals} from './exactDecimal';

type Stage={id:string;eyebrow:string;title:string;body:string;note?:string;practice?:LessonOneHundredSeventyThreeTask;summary?:boolean};
type Saved={version:1;stageIndex:number;responses:Record<string,string>;checked:Record<string,boolean>;attempts:Record<string,number>};
type Jump={lessonNumber?:number;stageIndex?:number};
const KEY='mathnikita-lesson-173-progress-v1';
const domains:LessonOneHundredSeventyThreeDomain[]=['Натуральные числа','Обыкновенные дроби','Десятичные дроби','Проценты и среднее','Геометрия','Комбинаторика','Текстовые задачи','Выражения и уравнения'];
const matchField=(value:string,field:LessonOneHundredSeventyThreeField)=>field.answers.some(answer=>exactDecimalEquals(value,answer));

const concepts:Stage[]=[
  {id:'l173-diagnostic',eyebrow:'Урок 173 · диагностика',title:'Сегодня ошибки полезнее случайных успехов',body:'Цель диагностики — не получить красивый балл, а обнаружить темы, где навык ещё нестабилен. Поэтому задания перемешаны и не сообщают алгоритм заранее.',note:'Решай самостоятельно и не возвращайся к прошлым урокам до первой проверки.'},
  {id:'l173-strategy',eyebrow:'Стратегия',title:'Сначала распознай тип задачи',body:'Перед вычислением назови про себя объект: дробь, процент, формула, геометрическая величина, движение, перебор или уравнение. Только после этого выбирай действие.',note:'Ошибка выбора модели важнее единичной арифметической описки.'},
  {id:'l173-estimate',eyebrow:'Самопроверка',title:'Оцени порядок величины до точного ответа',body:'Прикидка помогает заметить потерянную запятую, неверный процент, невозможный остаток или слишком большой геометрический результат.',note:'Точный ответ должен быть совместим со смыслом и приблизительной оценкой.'},
  {id:'l173-units',eyebrow:'Единицы',title:'Число без единицы может скрывать ошибку',body:'В задачах на путь, площадь, объём и проценты держи в уме единицы и базу сравнения. Одинаковая арифметика может означать разные величины.',note:'Особенно проверяй квадратные и кубические единицы.'},
  {id:'l173-errors',eyebrow:'Карта ошибок',title:'Одна ошибка не равна слабой теме',body:'Итоговая карта учитывает несколько ответов в каждой области. Смотри на повторяемость ошибок, а не на один неудачный пример.',note:'Для следующего урока приоритет — области с наименьшей долей верных ответов.'},
  {id:'l173-rules',eyebrow:'Режим диагностики',title:'Решай как на контрольной',body:'Не торопись, записывай промежуточные действия и делай проверку там, где она естественна. После первой попытки подсказка поможет разобрать ошибку.',note:'Практика содержит 20 задач и 50 проверяемых ответов по восьми областям курса.'}
];
const practiceStages:Stage[]=lessonOneHundredSeventyThreePractice.map((practice,i)=>({id:`l173-practice-${String(i+1).padStart(2,'0')}`,eyebrow:`Диагностика · ${i+1} из 20`,title:practice.title,body:practice.prompt,practice}));
const stages:Stage[]=[...concepts,...practiceStages,{id:'l173-summary',eyebrow:'Итог урока 173',title:'Диагностическая карта курса',body:'Сравни области между собой. Слабые результаты — это список тем для адресной подготовки на уроке 174.',note:'20 задач · 50 ответов · 8 областей курса.',summary:true}];
export const lessonOneHundredSeventyThreeStageCount=stages.length;
export const lessonOneHundredSeventyThreePracticeTaskCount=lessonOneHundredSeventyThreePractice.length;
export const lessonOneHundredSeventyThreePracticeResponseCount=lessonOneHundredSeventyThreeResponseCount;

function load():Saved{try{const raw=localStorage.getItem(KEY);if(!raw)return{version:1,stageIndex:0,responses:{},checked:{},attempts:{}};const p=JSON.parse(raw) as Saved;return p?.version===1?p:{version:1,stageIndex:0,responses:{},checked:{},attempts:{}}}catch{return{version:1,stageIndex:0,responses:{},checked:{},attempts:{}}}}

export function CourseDiagnosticReviewPlayer(){
  const initial=useMemo(load,[]);
  const[stageIndex,setStageIndex]=useState(()=>Math.max(0,Math.min(initial.stageIndex,stages.length-1)));
  const[responses,setResponses]=useState(initial.responses);
  const[checked,setChecked]=useState(initial.checked);
  const[attempts,setAttempts]=useState(initial.attempts);
  const stage=stages[stageIndex];const task=stage.practice;const key=stage.id;
  const complete=task?task.fields.every(field=>matchField(responses[`${key}:${field.id}`]??'',field)):true;
  const diagnostic=domains.map(domain=>{const tasks=lessonOneHundredSeventyThreePractice.filter(item=>item.domain===domain);let total=0;let correct=0;for(const item of tasks){const index=lessonOneHundredSeventyThreePractice.indexOf(item);const stageKey=`l173-practice-${String(index+1).padStart(2,'0')}`;for(const field of item.fields){total+=1;if(matchField(responses[`${stageKey}:${field.id}`]??'',field))correct+=1}}return{domain,total,correct};});
  useEffect(()=>{localStorage.setItem(KEY,JSON.stringify({version:1,stageIndex,responses,checked,attempts} satisfies Saved))},[stageIndex,responses,checked,attempts]);
  useEffect(()=>{const handler=(event:Event)=>{const d=(event as CustomEvent<Jump>).detail;if(d?.lessonNumber!==173||typeof d.stageIndex!=='number')return;setStageIndex(Math.max(0,Math.min(Math.trunc(d.stageIndex),stages.length-1)))};window.addEventListener('mathnikita-go-to-stage',handler);return()=>window.removeEventListener('mathnikita-go-to-stage',handler)},[]);
  const check=()=>{if(task){setChecked(p=>({...p,[key]:true}));setAttempts(p=>({...p,[key]:(p[key]??0)+1}))}};
  const move=(delta:number)=>setStageIndex(i=>Math.max(0,Math.min(i+delta,stages.length-1)));
  return <section className="lesson-player theory-experience" aria-label="Урок 173: итоговая диагностика курса"><article className={`interactive-stage ${stage.summary?'stage-summary':''}`} data-stage-id={stage.id} data-stage-index={stageIndex}><div className="stage-copy"><span className="stage-eyebrow">{stage.eyebrow}</span><h2>{stage.title}</h2><p>{stage.body}</p>{stage.note?<p className="theory-note">{stage.note}</p>:null}</div>{task?<div className="activity-area"><div className="theory-note">Область: {task.domain}</div><h3>{task.prompt}</h3><div className="answer-grid">{task.fields.map(field=>{const responseKey=`${key}:${field.id}`;return <label className="inline-answer" key={field.id}><span>{field.label}</span><input value={responses[responseKey]??''} placeholder={field.placeholder??'Введите ответ'} inputMode="decimal" onChange={event=>{setResponses(p=>({...p,[responseKey]:event.target.value}));setChecked(p=>({...p,[key]:false}))}}/></label>})}</div><button className="check-button" type="button" onClick={check}>Проверить</button>{checked[key]?complete?<div className="instant-feedback good" data-explanation={task.explanation}><b>Верно.</b><span>{task.explanation}</span></div>:<div className="instant-feedback bad" data-explanation={task.explanation}><b>Есть ошибка.</b><span>{attempts[key]>1?task.hint:'Сначала перепроверь модель, порядок действий и единицы без подсказки.'}</span></div>:null}</div>:null}{stage.summary?<div className="summary-card"><b>Диагностическая карта</b><span>Верные ответы по областям:</span>{diagnostic.map(item=><span key={item.domain} data-domain={item.domain}>{item.domain}: {item.correct} из {item.total}</span>)}</div>:null}</article><nav className="lesson-controls" aria-label="Навигация по этапам урока 173"><button type="button" onClick={()=>move(-1)} disabled={stageIndex===0}>← Назад</button><span>Этап {stageIndex+1} из {stages.length}</span><button type="button" onClick={()=>move(1)} disabled={stageIndex===stages.length-1}>Дальше →</button></nav></section>;
}
