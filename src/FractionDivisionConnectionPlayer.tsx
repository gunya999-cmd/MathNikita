import {useEffect,useMemo,useState} from 'react';
import './lessonPlayer.css';
import './theoryExperience.css';
import {lessonOneHundredOnePractice,lessonOneHundredOneResponseCount,type Lesson101Practice} from './data/lessonOneHundredOnePractice';

type Stage={id:string;eyebrow:string;title:string;body:string;note?:string;practice?:Lesson101Practice;summary?:boolean};
type Saved={version:1;stageIndex:number;responses:Record<string,string>;checked:Record<string,boolean>;attempts:Record<string,number>};
type StageJumpDetail={lessonNumber?:number;stageIndex?:number};
const KEY='mathnikita-lesson-101-progress-v1';
const normalize=(value:string)=>value.normalize('NFKC').trim().toLocaleLowerCase('ru-RU').replace(/\s+/g,'').replace(/,/g,'.');
const answerMatches=(value:string,answers:string[])=>answers.some(answer=>normalize(value)===normalize(answer));

const conceptStages:Stage[]=[
  {id:'l101-fraction-bar',eyebrow:'Урок 101 · § 28 · 1 из 1',title:'Дробная черта — это деление',body:'Запись «семь десятых» означает не только часть целого. Она одновременно задаёт действие: семь разделить на десять. Числитель играет роль делимого, знаменатель — делителя.',note:'Поэтому любую дробь можно прочитать как частное двух натуральных чисел.'},
  {id:'l101-quotient-to-fraction',eyebrow:'Частное → дробь',title:'Порядок чисел сохраняется',body:'Если нужно записать частное в виде дроби, первое число ставим в числитель, второе — в знаменатель. Никаких дополнительных действий для такой записи не требуется.',note:'Например, деление пяти на семь записывается дробью пять седьмых.'},
  {id:'l101-fraction-to-quotient',eyebrow:'Дробь → частное',title:'Числитель делим на знаменатель',body:'Обратный переход устроен так же просто: числитель становится делимым, знаменатель — делителем. Это один и тот же математический объект в двух формах записи.',note:'Такая связь понадобится дальше при работе со смешанными числами.'},
  {id:'l101-natural-as-fraction',eyebrow:'Натуральное число как дробь',title:'Заданный знаменатель определяет числитель',body:'Чтобы представить натуральное число дробью с нужным знаменателем, умножь это число на знаменатель. Полученное произведение станет числителем.',note:'Проверка проста: раздели новый числитель на знаменатель и должен получиться исходный натуральный результат.'},
  {id:'l101-equations',eyebrow:'Уравнения с дробной чертой',title:'Сначала прочитай дробь как деление',body:'Если неизвестное стоит в числителе, это неизвестное делимое. Если оно в знаменателе, это неизвестный делитель. После такого чтения работают обычные правила уравнений на деление.',note:'Всегда проверь найденное значение подстановкой в исходную дробную запись.'},
  {id:'l101-meaning',eyebrow:'Смысл результата',title:'Дробь позволяет записать деление, которое не выполняется нацело',body:'Если семь предметов делят поровну между десятью людьми, натурального частного нет, но точный результат существует: семь десятых. Дробь сохраняет результат деления без округления.',note:'Это особенно важно в задачах на равное распределение величин.'},
  {id:'l101-check',eyebrow:'Самопроверка',title:'Проверяй направление перехода',body:'При переходе от деления к дроби делимое не должно оказаться в знаменателе. При записи натурального числа дробью контролируй, что числитель действительно делится на выбранный знаменатель с нужным частным.',note:'Одна обратная операция обычно обнаруживает ошибку быстрее повторного решения.'},
  {id:'l101-ready',eyebrow:'Перед практикой',title:'Маршрут § 28',body:'Сначала выполни точные № 759, № 761, № 763 и № 765. Затем закрепи переходы между дробью и делением, запись натуральных чисел дробями, уравнения и задачи на равное распределение.',note:'20 обязательных задач · ровно 50 проверяемых ответов.'}
];
const practiceStages:Stage[]=lessonOneHundredOnePractice.map((practice,index)=>({id:`l101-practice-${String(index+1).padStart(2,'0')}`,eyebrow:practice.source?`Учебник · ${practice.source}`:`Обязательная практика · ${index+1} из 20`,title:practice.source?`Точная задача ${practice.source}`:`Практика § 28 · ${index+1}`,body:practice.prompt,practice}));
const stages:Stage[]=[...conceptStages,...practiceStages,{id:'l101-summary',eyebrow:'Итог урока 101',title:'§ 28 полностью закрыт',body:'Ты понимаешь дробную черту как деление, переводишь частное в дробь и обратно, записываешь натуральное число дробью с заданным знаменателем и решаешь уравнения через правила неизвестного делимого и делителя.',note:'Дальше урок 102 начинает § 29: смешанные числа.',summary:true}];
export const lessonOneHundredOneStageCount=stages.length;
export const lessonOneHundredOnePracticeTaskCount=lessonOneHundredOnePractice.length;
export const lessonOneHundredOnePracticeResponseCount=lessonOneHundredOneResponseCount;
function loadSaved():Saved{try{const raw=localStorage.getItem(KEY);if(!raw)return{version:1,stageIndex:0,responses:{},checked:{},attempts:{}};const parsed=JSON.parse(raw) as Saved;return parsed?.version===1?parsed:{version:1,stageIndex:0,responses:{},checked:{},attempts:{}}}catch{return{version:1,stageIndex:0,responses:{},checked:{},attempts:{}}}}

export function FractionDivisionConnectionPlayer(){
  const initial=useMemo(loadSaved,[]);
  const[stageIndex,setStageIndex]=useState(()=>Math.max(0,Math.min(initial.stageIndex,stages.length-1)));
  const[responses,setResponses]=useState<Record<string,string>>(initial.responses);
  const[checked,setChecked]=useState<Record<string,boolean>>(initial.checked);
  const[attempts,setAttempts]=useState<Record<string,number>>(initial.attempts);
  const stage=stages[stageIndex];const task=stage.practice;const taskKey=stage.id;
  const taskComplete=task?task.fields.every(item=>answerMatches(responses[`${taskKey}:${item.id}`]??'',item.answers)):true;
  useEffect(()=>{localStorage.setItem(KEY,JSON.stringify({version:1,stageIndex,responses,checked,attempts} satisfies Saved))},[stageIndex,responses,checked,attempts]);
  useEffect(()=>{const handle=(event:Event)=>{const detail=(event as CustomEvent<StageJumpDetail>).detail;if(detail?.lessonNumber!==101||typeof detail.stageIndex!=='number')return;setStageIndex(Math.max(0,Math.min(Math.trunc(detail.stageIndex),stages.length-1)))};window.addEventListener('mathnikita-go-to-stage',handle);return()=>window.removeEventListener('mathnikita-go-to-stage',handle)},[]);
  function checkTask(){if(!task)return;setChecked(prev=>({...prev,[taskKey]:true}));setAttempts(prev=>({...prev,[taskKey]:(prev[taskKey]??0)+1}))}
  function move(delta:number){setStageIndex(current=>Math.max(0,Math.min(current+delta,stages.length-1)))}
  return <section className="lesson-player theory-experience" aria-label="Урок 101: дроби и деление натуральных чисел">
    <article className={`interactive-stage ${stage.summary?'stage-summary':''}`} data-stage-id={stage.id} data-stage-index={stageIndex}>
      <div className="stage-copy"><span className="stage-eyebrow">{stage.eyebrow}</span><h2>{stage.title}</h2><p>{stage.body}</p>{stage.note?<p className="theory-note">{stage.note}</p>:null}</div>
      {task?<div className="activity-area"><h3>{task.instruction}</h3><div className="answer-grid">{task.fields.map(item=>{const key=`${taskKey}:${item.id}`;return <label className="inline-answer" key={item.id}><span>{item.label}</span><input value={responses[key]??''} placeholder="Введите ответ" onChange={event=>{setResponses(prev=>({...prev,[key]:event.target.value}));setChecked(prev=>({...prev,[taskKey]:false}))}}/></label>})}</div><button className="check-button" type="button" onClick={checkTask}>Проверить</button>{checked[taskKey]?taskComplete?<div className="instant-feedback good" data-explanation={task.explanation}><b>Верно.</b><span>{task.explanation}</span></div>:<div className="instant-feedback bad" data-explanation={task.explanation}><b>Пока есть ошибка.</b><span>{attempts[taskKey]>1?task.hint:'Сначала определи, что здесь является делимым, делителем, числителем и знаменателем.'}</span></div>:null}</div>:null}
      {stage.summary?<div className="summary-card"><b>Урок 101 завершён</b><span>20 задач · 50 ответов · § 28 закрыт</span></div>:null}
    </article>
    <nav className="lesson-controls" aria-label="Навигация по этапам урока 101"><button type="button" onClick={()=>move(-1)} disabled={stageIndex===0}>← Назад</button><span>Этап {stageIndex+1} из {stages.length}</span><button type="button" onClick={()=>move(1)} disabled={stageIndex===stages.length-1}>Дальше →</button></nav>
  </section>
}
