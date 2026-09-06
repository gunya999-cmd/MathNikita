import {useEffect,useMemo,useState} from 'react';
import './lessonPlayer.css';
import './theoryExperience.css';
import {lessonOneHundredTwoPractice,lessonOneHundredTwoResponseCount,type Lesson102Practice} from './data/lessonOneHundredTwoPractice';

type Stage={id:string;eyebrow:string;title:string;body:string;note?:string;practice?:Lesson102Practice;summary?:boolean};
type Saved={version:1;stageIndex:number;responses:Record<string,string>;checked:Record<string,boolean>;attempts:Record<string,number>};
type StageJumpDetail={lessonNumber?:number;stageIndex?:number};
const KEY='mathnikita-lesson-102-progress-v1';
const normalize=(value:string)=>value.normalize('NFKC').trim().toLocaleLowerCase('ru-RU').replace(/\s+/g,'').replace(/,/g,'.');
const answerMatches=(value:string,answers:string[])=>answers.some(answer=>normalize(value)===normalize(answer));

const conceptStages:Stage[]=[
  {id:'l102-meaning',eyebrow:'Урок 102 · § 29 · 1 из 5',title:'Смешанное число — это целая часть плюс правильная дробь',body:'Если неправильная дробь больше единицы, её часто удобнее читать как несколько целых и оставшуюся часть. Такая запись называется смешанным числом.',note:'Дробная часть смешанного числа должна быть правильной: её числитель меньше знаменателя.'},
  {id:'l102-divide',eyebrow:'Неправильная дробь → смешанное число',title:'Раздели числитель на знаменатель с остатком',body:'Неполное частное становится целой частью. Остаток становится числителем дробной части. Знаменатель остаётся прежним.',note:'Это тот же алгоритм деления с остатком, только результат записан в новой форме.'},
  {id:'l102-remainder',eyebrow:'Контроль остатка',title:'Остаток обязан быть меньше знаменателя',body:'Если после выделения целой части остаток не меньше делителя, значит деление выполнено не до конца. Именно условие остаток меньше знаменателя гарантирует правильную дробную часть.',note:'Так можно быстро проверить корректность смешанной записи.'},
  {id:'l102-exact',eyebrow:'Особый случай',title:'Если остаток равен нулю, дробной части нет',body:'Некоторые неправильные дроби равны натуральным числам. Тогда числитель делится на знаменатель нацело, и смешанная запись заканчивается только целой частью.',note:'Например, тридцать шесть девятых — это просто четыре.'},
  {id:'l102-back',eyebrow:'Смешанное число → неправильная дробь',title:'Целую часть умножь на знаменатель и прибавь числитель',body:'Полученная сумма становится новым числителем, а знаменатель сохраняется. Это обратный переход к выделению целой части.',note:'Правило удобно проверять обратным делением нового числителя на знаменатель.'},
  {id:'l102-quotient',eyebrow:'Связь с уроком 101',title:'Частное можно сразу довести до смешанного числа',body:'Сначала запись деления превращается в дробь, затем неправильная дробь — в смешанное число. Так частное, которое не является натуральным, получает точную и наглядную форму.',note:'Это объединяет § 28 и начало § 29 в один алгоритм.'},
  {id:'l102-error',eyebrow:'Типичные ошибки',title:'Не меняй знаменатель и не оставляй неправильную дробную часть',body:'При переводе смешанного числа в неправильную дробь знаменатель остаётся тем же. При обратном переходе остаток должен быть меньше знаменателя. Эти две проверки ловят большинство ошибок.',note:'Если дробная часть снова неправильная, нужно выделить ещё одну целую единицу.'},
  {id:'l102-ready',eyebrow:'Перед практикой',title:'Маршрут первого урока § 29',body:'Сначала реши точные № 770, № 772 и № 774. Затем закрепи оба перехода, случаи деления без остатка, восстановление числа по частному и остатку и текстовые модели равного распределения.',note:'20 обязательных задач · ровно 50 проверяемых ответов.'}
];
const practiceStages:Stage[]=lessonOneHundredTwoPractice.map((practice,index)=>({id:`l102-practice-${String(index+1).padStart(2,'0')}`,eyebrow:practice.source?`Учебник · ${practice.source}`:`Обязательная практика · ${index+1} из 20`,title:practice.source?`Точная задача ${practice.source}`:`Практика § 29 · ${index+1}`,body:practice.prompt,practice}));
const stages:Stage[]=[...conceptStages,...practiceStages,{id:'l102-summary',eyebrow:'Итог урока 102',title:'Основа смешанных чисел освоена',body:'Ты выделяешь целую часть из неправильной дроби, переводишь смешанное число обратно в неправильную дробь, связываешь эти преобразования с делением с остатком и проверяешь результат обратным переходом.',note:'Урок 103 продолжит § 29 и перейдёт к сложению и вычитанию смешанных чисел.',summary:true}];
export const lessonOneHundredTwoStageCount=stages.length;
export const lessonOneHundredTwoPracticeTaskCount=lessonOneHundredTwoPractice.length;
export const lessonOneHundredTwoPracticeResponseCount=lessonOneHundredTwoResponseCount;
function loadSaved():Saved{try{const raw=localStorage.getItem(KEY);if(!raw)return{version:1,stageIndex:0,responses:{},checked:{},attempts:{}};const parsed=JSON.parse(raw) as Saved;return parsed?.version===1?parsed:{version:1,stageIndex:0,responses:{},checked:{},attempts:{}}}catch{return{version:1,stageIndex:0,responses:{},checked:{},attempts:{}}}}

export function MixedNumberFoundationsPlayer(){
  const initial=useMemo(loadSaved,[]);
  const[stageIndex,setStageIndex]=useState(()=>Math.max(0,Math.min(initial.stageIndex,stages.length-1)));
  const[responses,setResponses]=useState<Record<string,string>>(initial.responses);
  const[checked,setChecked]=useState<Record<string,boolean>>(initial.checked);
  const[attempts,setAttempts]=useState<Record<string,number>>(initial.attempts);
  const stage=stages[stageIndex];const task=stage.practice;const taskKey=stage.id;
  const taskComplete=task?task.fields.every(item=>answerMatches(responses[`${taskKey}:${item.id}`]??'',item.answers)):true;
  useEffect(()=>{localStorage.setItem(KEY,JSON.stringify({version:1,stageIndex,responses,checked,attempts} satisfies Saved))},[stageIndex,responses,checked,attempts]);
  useEffect(()=>{const handle=(event:Event)=>{const detail=(event as CustomEvent<StageJumpDetail>).detail;if(detail?.lessonNumber!==102||typeof detail.stageIndex!=='number')return;setStageIndex(Math.max(0,Math.min(Math.trunc(detail.stageIndex),stages.length-1)))};window.addEventListener('mathnikita-go-to-stage',handle);return()=>window.removeEventListener('mathnikita-go-to-stage',handle)},[]);
  function checkTask(){if(!task)return;setChecked(prev=>({...prev,[taskKey]:true}));setAttempts(prev=>({...prev,[taskKey]:(prev[taskKey]??0)+1}))}
  function move(delta:number){setStageIndex(current=>Math.max(0,Math.min(current+delta,stages.length-1)))}
  return <section className="lesson-player theory-experience" aria-label="Урок 102: смешанные числа">
    <article className={`interactive-stage ${stage.summary?'stage-summary':''}`} data-stage-id={stage.id} data-stage-index={stageIndex}>
      <div className="stage-copy"><span className="stage-eyebrow">{stage.eyebrow}</span><h2>{stage.title}</h2><p>{stage.body}</p>{stage.note?<p className="theory-note">{stage.note}</p>:null}</div>
      {task?<div className="activity-area"><h3>{task.instruction}</h3><div className="answer-grid">{task.fields.map(item=>{const key=`${taskKey}:${item.id}`;return <label className="inline-answer" key={item.id}><span>{item.label}</span><input value={responses[key]??''} placeholder="Введите ответ" onChange={event=>{setResponses(prev=>({...prev,[key]:event.target.value}));setChecked(prev=>({...prev,[taskKey]:false}))}}/></label>})}</div><button className="check-button" type="button" onClick={checkTask}>Проверить</button>{checked[taskKey]?taskComplete?<div className="instant-feedback good" data-explanation={task.explanation}><b>Верно.</b><span>{task.explanation}</span></div>:<div className="instant-feedback bad" data-explanation={task.explanation}><b>Пока есть ошибка.</b><span>{attempts[taskKey]>1?task.hint:'Проверь деление с остатком или обратный переход через умножение целой части на знаменатель.'}</span></div>:null}</div>:null}
      {stage.summary?<div className="summary-card"><b>Урок 102 завершён</b><span>20 задач · 50 ответов · § 29 начат</span></div>:null}
    </article>
    <nav className="lesson-controls" aria-label="Навигация по этапам урока 102"><button type="button" onClick={()=>move(-1)} disabled={stageIndex===0}>← Назад</button><span>Этап {stageIndex+1} из {stages.length}</span><button type="button" onClick={()=>move(1)} disabled={stageIndex===stages.length-1}>Дальше →</button></nav>
  </section>
}
