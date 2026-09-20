import {useEffect,useMemo,useState} from 'react';
import './lessonPlayer.css';
import './theoryExperience.css';
import {lessonOneHundredSeventyFourPractice,lessonOneHundredSeventyFourResponseCount,type LessonOneHundredSeventyFourDomain,type LessonOneHundredSeventyFourField,type LessonOneHundredSeventyFourTask} from './data/lessonOneHundredSeventyFourPractice';
import {exactDecimalEquals} from './exactDecimal';

type Stage={id:string;eyebrow:string;title:string;body:string;note?:string;practice?:LessonOneHundredSeventyFourTask;summary?:boolean};
type Saved={version:1;stageIndex:number;responses:Record<string,string>;checked:Record<string,boolean>;attempts:Record<string,number>};
type Jump={lessonNumber?:number;stageIndex?:number};
const KEY='mathnikita-lesson-174-progress-v1';
const domains:LessonOneHundredSeventyFourDomain[]=['Натуральные числа','Обыкновенные дроби','Десятичные дроби','Проценты и среднее','Выражения и уравнения','Геометрия','Комбинаторика','Текстовые задачи'];
const matchField=(value:string,field:LessonOneHundredSeventyFourField)=>field.answers.some(answer=>exactDecimalEquals(value,answer));

const concepts:Stage[]=[
  {id:'l174-mode',eyebrow:'Урок 174 · генеральная репетиция',title:'Режим максимально близок к контрольной',body:'Темы заданий не подписаны. Сначала самостоятельно определи способ решения, затем выполни вычисления и проверь результат.',note:'Не открывай прошлые уроки во время первой попытки.'},
  {id:'l174-time',eyebrow:'Время',title:'Работай в пределах 50 минут',body:'Не застревай на одном пункте. Если задача не идёт, оставь запись и двигайся дальше, затем вернись к ней после более быстрых заданий.',note:'Цель — проверить не только знания, но и устойчивость работы на длинном варианте.'},
  {id:'l174-draft',eyebrow:'Черновик',title:'Записывай промежуточные действия',body:'Даже если ответ вводится одним числом, на контрольной важны прозрачная цепочка вычислений, единицы и проверка обратным действием.',note:'Черновик снижает число случайных ошибок.'},
  {id:'l174-no-hints',eyebrow:'Без подсказок',title:'Ошибка не раскрывает алгоритм',body:'При неверном ответе система сообщит только о наличии ошибки. Разбор появится после правильного решения, чтобы репетиция не превращалась в тренировку с подсказками.',note:'Исправляй ответ самостоятельно.'},
  {id:'l174-check',eyebrow:'Финальная проверка',title:'Оставь время на контроль',body:'Проверь запятые, проценты, остатки, единицы площади и объёма, а уравнения — подстановкой. На длинной работе именно эти мелочи часто решают результат.',note:'Последние минуты полезнее потратить на проверку, чем на ускорение.'},
  {id:'l174-score',eyebrow:'Оценка готовности',title:'Финал покажет результат из 50',body:'После 20 задач появится общий балл, процент и разбивка по темам. Высокая готовность — 45–50 верных ответов; 38–44 означает, что стоит повторить слабые области перед уроком 175.',note:'Ниже 38 — сигнал сначала закрыть конкретные пробелы, а не просто повторять весь курс.'}
];
const practiceStages:Stage[]=lessonOneHundredSeventyFourPractice.map((practice,i)=>({id:`l174-practice-${String(i+1).padStart(2,'0')}`,eyebrow:`Вариант · ${i+1} из 20`,title:practice.title,body:practice.prompt,practice}));
const stages:Stage[]=[...concepts,...practiceStages,{id:'l174-summary',eyebrow:'Итог урока 174',title:'Готовность к итоговой контрольной №175',body:'Используй результат как последнюю проверку перед контрольной. Если одна тема заметно слабее остальных, повтори именно её, а не весь курс целиком.',note:'20 задач · 50 ответов · генеральная репетиция.',summary:true}];
export const lessonOneHundredSeventyFourStageCount=stages.length;
export const lessonOneHundredSeventyFourPracticeTaskCount=lessonOneHundredSeventyFourPractice.length;
export const lessonOneHundredSeventyFourPracticeResponseCount=lessonOneHundredSeventyFourResponseCount;

function load():Saved{try{const raw=localStorage.getItem(KEY);if(!raw)return{version:1,stageIndex:0,responses:{},checked:{},attempts:{}};const p=JSON.parse(raw) as Saved;return p?.version===1?p:{version:1,stageIndex:0,responses:{},checked:{},attempts:{}}}catch{return{version:1,stageIndex:0,responses:{},checked:{},attempts:{}}}}

export function FinalControlRehearsalPlayer(){
  const initial=useMemo(load,[]);
  const[stageIndex,setStageIndex]=useState(()=>Math.max(0,Math.min(initial.stageIndex,stages.length-1)));
  const[responses,setResponses]=useState(initial.responses);
  const[checked,setChecked]=useState(initial.checked);
  const[attempts,setAttempts]=useState(initial.attempts);
  const stage=stages[stageIndex];const task=stage.practice;const key=stage.id;
  const complete=task?task.fields.every(field=>matchField(responses[`${key}:${field.id}`]??'',field)):true;
  const scoreByDomain=domains.map(domain=>{const tasks=lessonOneHundredSeventyFourPractice.filter(item=>item.domain===domain);let total=0;let correct=0;for(const item of tasks){const index=lessonOneHundredSeventyFourPractice.indexOf(item);const stageKey=`l174-practice-${String(index+1).padStart(2,'0')}`;for(const field of item.fields){total+=1;if(matchField(responses[`${stageKey}:${field.id}`]??'',field))correct+=1}}return{domain,total,correct};});
  const totalCorrect=scoreByDomain.reduce((sum,item)=>sum+item.correct,0);
  const percent=Math.round(totalCorrect/lessonOneHundredSeventyFourResponseCount*100);
  const readiness=totalCorrect>=45?'Высокая готовность':totalCorrect>=38?'Нужен короткий адресный повтор':'Нужно закрыть пробелы перед контрольной';
  useEffect(()=>{localStorage.setItem(KEY,JSON.stringify({version:1,stageIndex,responses,checked,attempts} satisfies Saved))},[stageIndex,responses,checked,attempts]);
  useEffect(()=>{const handler=(event:Event)=>{const d=(event as CustomEvent<Jump>).detail;if(d?.lessonNumber!==174||typeof d.stageIndex!=='number')return;setStageIndex(Math.max(0,Math.min(Math.trunc(d.stageIndex),stages.length-1)))};window.addEventListener('mathnikita-go-to-stage',handler);return()=>window.removeEventListener('mathnikita-go-to-stage',handler)},[]);
  const check=()=>{if(task){setChecked(p=>({...p,[key]:true}));setAttempts(p=>({...p,[key]:(p[key]??0)+1}))}};
  const move=(delta:number)=>setStageIndex(i=>Math.max(0,Math.min(i+delta,stages.length-1)));
  return <section className="lesson-player theory-experience" aria-label="Урок 174: генеральная репетиция итоговой контрольной"><article className={`interactive-stage ${stage.summary?'stage-summary':''}`} data-stage-id={stage.id} data-stage-index={stageIndex}><div className="stage-copy"><span className="stage-eyebrow">{stage.eyebrow}</span><h2>{stage.title}</h2><p>{stage.body}</p>{stage.note?<p className="theory-note">{stage.note}</p>:null}</div>{task?<div className="activity-area"><h3>{task.prompt}</h3><div className="answer-grid">{task.fields.map(field=>{const responseKey=`${key}:${field.id}`;return <label className="inline-answer" key={field.id}><span>{field.label}</span><input value={responses[responseKey]??''} placeholder={field.placeholder??'Введите ответ'} inputMode="decimal" onChange={event=>{setResponses(p=>({...p,[responseKey]:event.target.value}));setChecked(p=>({...p,[key]:false}))}}/></label>})}</div><button className="check-button" type="button" onClick={check}>Проверить</button>{checked[key]?complete?<div className="instant-feedback good" data-explanation={task.explanation}><b>Верно.</b><span>{task.explanation}</span></div>:<div className="instant-feedback bad"><b>Есть ошибка.</b><span>Алгоритм не показывается в режиме репетиции. Перепроверь решение самостоятельно.</span></div>:null}</div>:null}{stage.summary?<div className="summary-card"><b>Результат: {totalCorrect} из 50 · {percent}%</b><span data-readiness>{readiness}</span>{scoreByDomain.map(item=><span key={item.domain} data-domain={item.domain}>{item.domain}: {item.correct} из {item.total}</span>)}</div>:null}</article><nav className="lesson-controls" aria-label="Навигация по этапам урока 174"><button type="button" onClick={()=>move(-1)} disabled={stageIndex===0}>← Назад</button><span>Этап {stageIndex+1} из {stages.length}</span><button type="button" onClick={()=>move(1)} disabled={stageIndex===stages.length-1}>Дальше →</button></nav></section>;
}
