import {useEffect,useMemo,useState} from 'react';
import './lessonPlayer.css';
import './theoryExperience.css';
import {lessonNinetySixPractice,lessonNinetySixResponseCount,type Lesson96Practice} from './data/lessonNinetySixPractice';

type Stage={id:string;eyebrow:string;title:string;body:string;note?:string;practice?:Lesson96Practice;summary?:boolean};
type Saved={version:1;stageIndex:number;responses:Record<string,string>;checked:Record<string,boolean>;attempts:Record<string,number>};
type StageJumpDetail={lessonNumber?:number;stageIndex?:number};

const KEY='mathnikita-lesson-96-progress-v1';
const normalize=(value:string)=>value.normalize('NFKC').trim().toLocaleLowerCase('ru-RU').replace(/\s+/g,'').replace(/,/g,'.');
const answerMatches=(value:string,answers:string[])=>answers.some(answer=>normalize(value)===normalize(answer));

const conceptStages:Stage[]=[
  {id:'l96-whole',eyebrow:'Урок 96 · § 26 · 1 из 3',title:'Единица — граница между двумя типами дробей',body:'Если целое разделено на одинаковые доли, знаменатель показывает, сколько долей образуют единицу. Поэтому сравнить числитель со знаменателем — значит сразу понять, набрали ли мы меньше одного целого, ровно одно целое или больше.',note:'Сначала сравни числитель и знаменатель — вычислять значение дроби не нужно.'},
  {id:'l96-proper',eyebrow:'Определение',title:'Правильная дробь меньше единицы',body:'Если числитель меньше знаменателя, взято меньше долей, чем нужно для целого. Такая дробь называется правильной и всегда меньше единицы.',note:'Пример: 5/8 — правильная, потому что 5<8.'},
  {id:'l96-improper',eyebrow:'Определение',title:'Неправильная дробь не меньше единицы',body:'Если числитель равен знаменателю или больше него, дробь называется неправильной. При равенстве числителя и знаменателя дробь равна единице; при большем числителе — больше единицы.',note:'8/8=1, а 11/8>1 — обе дроби неправильные.'},
  {id:'l96-same-denominator',eyebrow:'Сравнение',title:'Одинаковый знаменатель — сравни количество долей',body:'Когда знаменатели одинаковые, размер одной доли одинаков. Больше та дробь, у которой больше числитель, потому что в ней взято больше одинаковых долей.',note:'3/17<12/17, потому что 3<12.'},
  {id:'l96-same-numerator',eyebrow:'Сравнение',title:'Одинаковый числитель — сравни размер доли',body:'Когда числители одинаковые, число взятых долей одно и то же. Чем меньше знаменатель, тем крупнее каждая доля и тем больше дробь.',note:'7/12>7/15: двенадцатые доли крупнее пятнадцатых.'},
  {id:'l96-one',eyebrow:'Быстрая стратегия',title:'Сравнение через единицу',body:'Если одна дробь правильная, а другая неправильная и больше единицы, их можно сравнить без общего знаменателя: первая меньше 1, вторая больше 1.',note:'3/4<1<4/3, значит 3/4<4/3.'},
  {id:'l96-boundary',eyebrow:'Переменная',title:'Граница проходит в числителе = знаменателю',body:'Для дроби x/n правильность означает x<n. Первое натуральное значение x, при котором дробь становится неправильной, равно n. Для дроби n/x неправильность означает x≤n.',note:'Эта логика позволит решать задания с неизвестным числителем или знаменателем.'},
  {id:'l96-ready',eyebrow:'Перед практикой',title:'Алгоритм сравнения',body:'Сначала проверь отношение к единице. Если знаменатели одинаковые — сравни числители. Если числители одинаковые — сравни знаменатели в обратном порядке. Только затем используй более сложную стратегию.',note:'Дальше — 20 обязательных задач и ровно 50 проверяемых ответов.'}
];
const practiceStages:Stage[]=lessonNinetySixPractice.map((practice,index)=>({id:`l96-practice-${String(index+1).padStart(2,'0')}`,eyebrow:practice.source?`Учебник · ${practice.source}`:`Обязательная практика · ${index+1} из 20`,title:practice.source?`Точная задача ${practice.source}`:`Сравнение ${index+1}`,body:practice.prompt,practice}));
const stages:Stage[]=[...conceptStages,...practiceStages,{id:'l96-summary',eyebrow:'Итог урока 96',title:'Граница единицы стала инструментом сравнения',body:'Ты различаешь правильные и неправильные дроби, видишь случай равенства единице, сравниваешь дроби с одинаковыми знаменателями и числителями и находишь границы для переменной.',note:'Следующий урок §26 продолжит сравнение и упорядочивание дробей на более сложных моделях.',summary:true}];

export const lessonNinetySixStageCount=stages.length;
export const lessonNinetySixPracticeTaskCount=lessonNinetySixPractice.length;
export const lessonNinetySixPracticeResponseCount=lessonNinetySixResponseCount;

function loadSaved():Saved{try{const raw=localStorage.getItem(KEY);if(!raw)return{version:1,stageIndex:0,responses:{},checked:{},attempts:{}};const parsed=JSON.parse(raw) as Saved;return parsed?.version===1?parsed:{version:1,stageIndex:0,responses:{},checked:{},attempts:{}}}catch{return{version:1,stageIndex:0,responses:{},checked:{},attempts:{}}}}

export function FractionComparisonFoundationsPlayer(){
  const initial=useMemo(loadSaved,[]);
  const[stageIndex,setStageIndex]=useState(()=>Math.max(0,Math.min(initial.stageIndex,stages.length-1)));
  const[responses,setResponses]=useState<Record<string,string>>(initial.responses);
  const[checked,setChecked]=useState<Record<string,boolean>>(initial.checked);
  const[attempts,setAttempts]=useState<Record<string,number>>(initial.attempts);
  const stage=stages[stageIndex];const task=stage.practice;const taskKey=stage.id;
  const taskComplete=task?task.fields.every(item=>answerMatches(responses[`${taskKey}:${item.id}`]??'',item.answers)):true;
  useEffect(()=>{localStorage.setItem(KEY,JSON.stringify({version:1,stageIndex,responses,checked,attempts} satisfies Saved))},[stageIndex,responses,checked,attempts]);
  useEffect(()=>{const handle=(event:Event)=>{const detail=(event as CustomEvent<StageJumpDetail>).detail;if(detail?.lessonNumber!==96||typeof detail.stageIndex!=='number')return;setStageIndex(Math.max(0,Math.min(Math.trunc(detail.stageIndex),stages.length-1)))};window.addEventListener('mathnikita-go-to-stage',handle);return()=>window.removeEventListener('mathnikita-go-to-stage',handle)},[]);
  function checkTask(){if(!task)return;setChecked(prev=>({...prev,[taskKey]:true}));setAttempts(prev=>({...prev,[taskKey]:(prev[taskKey]??0)+1}))}
  function move(delta:number){setStageIndex(current=>Math.max(0,Math.min(current+delta,stages.length-1)))}
  return <section className="lesson-player theory-experience" aria-label="Урок 96: правильные и неправильные дроби">
    <article className={`interactive-stage ${stage.summary?'stage-summary':''}`} data-stage-id={stage.id} data-stage-index={stageIndex}>
      <div className="stage-copy"><span className="stage-eyebrow">{stage.eyebrow}</span><h2>{stage.title}</h2><p>{stage.body}</p>{stage.note?<p className="theory-note">{stage.note}</p>:null}</div>
      {task?<div className="activity-area"><h3>{task.instruction}</h3><div className="answer-grid">{task.fields.map(item=>{const key=`${taskKey}:${item.id}`;return <label className="inline-answer" key={item.id}><span>{item.label}</span><input value={responses[key]??''} placeholder="Введите ответ" onChange={event=>{setResponses(prev=>({...prev,[key]:event.target.value}));setChecked(prev=>({...prev,[taskKey]:false}))}}/></label>})}</div><button className="check-button" type="button" onClick={checkTask}>Проверить</button>{checked[taskKey]?taskComplete?<div className="instant-feedback good" data-explanation={task.explanation}><b>Верно.</b><span>{task.explanation}</span></div>:<div className="instant-feedback bad" data-explanation={task.explanation}><b>Пока есть ошибка.</b><span>{attempts[taskKey]>1?task.hint:'Сначала проверь отношение дроби к единице и только затем правило сравнения.'}</span></div>:null}</div>:null}
      {stage.summary?<div className="summary-card"><b>Урок 96 завершён</b><span>§ 26 · 20 задач · 50 ответов</span></div>:null}
    </article>
    <nav className="lesson-controls" aria-label="Навигация по этапам урока 96"><button type="button" onClick={()=>move(-1)} disabled={stageIndex===0}>← Назад</button><span>Этап {stageIndex+1} из {stages.length}</span><button type="button" onClick={()=>move(1)} disabled={stageIndex===stages.length-1}>Дальше →</button></nav>
  </section>
}
