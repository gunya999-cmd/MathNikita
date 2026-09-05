import {useEffect,useMemo,useState} from 'react';
import './lessonPlayer.css';
import './theoryExperience.css';
import {lessonNinetyNinePractice,lessonNinetyNineResponseCount,type Lesson99Practice} from './data/lessonNinetyNinePractice';

type Stage={id:string;eyebrow:string;title:string;body:string;note?:string;practice?:Lesson99Practice;summary?:boolean};
type Saved={version:1;stageIndex:number;responses:Record<string,string>;checked:Record<string,boolean>;attempts:Record<string,number>};
type StageJumpDetail={lessonNumber?:number;stageIndex?:number};
const KEY='mathnikita-lesson-99-progress-v1';
const normalize=(value:string)=>value.normalize('NFKC').trim().toLocaleLowerCase('ru-RU').replace(/\s+/g,'').replace(/,/g,'.');
const answerMatches=(value:string,answers:string[])=>answers.some(answer=>normalize(value)===normalize(answer));

const conceptStages:Stage[]=[
  {id:'l99-parts',eyebrow:'Урок 99 · § 27 · 1 из 2',title:'Одинаковый знаменатель — одинаковый размер части',body:'Знаменатель показывает, на сколько равных частей разделено целое. Если знаменатели одинаковые, складываются или вычитаются части одного размера. Поэтому меняется количество частей, то есть числитель, а знаменатель остаётся прежним.',note:'Пять девятнадцатых плюс шесть девятнадцатых — это одиннадцать девятнадцатых.'},
  {id:'l99-add',eyebrow:'Правило сложения',title:'Складываем числители, знаменатель сохраняем',body:'Чтобы сложить дроби с одинаковыми знаменателями, сложи их числители и запиши результат над тем же знаменателем.',note:'Нельзя складывать знаменатели: размер доли не изменился.'},
  {id:'l99-subtract',eyebrow:'Правило вычитания',title:'Вычитаем числители, знаменатель сохраняем',body:'При вычитании дробей с одинаковыми знаменателями из числителя уменьшаемого вычитают числитель вычитаемого. Знаменатель остаётся тем же.',note:'Семь тринадцатых минус четыре тринадцатых дают три тринадцатых.'},
  {id:'l99-chain',eyebrow:'Несколько действий',title:'Один знаменатель ведём через всю цепочку',body:'Если во всём выражении знаменатель одинаковый, действия можно выполнять последовательно только с числителями. Знаменатель переписывается один раз в результат.',note:'Всегда сохраняй порядок действий и проверяй, что знаменатель действительно один и тот же.'},
  {id:'l99-equations',eyebrow:'Дробные уравнения',title:'Правила неизвестных компонентов работают без изменений',body:'Неизвестное слагаемое находят вычитанием, а неизвестное вычитаемое — разностью уменьшаемого и результата. После этого выполняют обычное действие с дробями одного знаменателя.',note:'Так решается точное задание № 746.'},
  {id:'l99-word-model',eyebrow:'Текстовая задача',title:'Сначала проверь: части относятся к одному целому',body:'Если две дроби описывают части одного и того же груза, книги или маршрута и имеют одинаковый знаменатель, общую часть находят сложением числителей.',note:'В № 748 обе дроби относятся ко всему перевозимому грузу.'},
  {id:'l99-error',eyebrow:'Главная ошибка',title:'Знаменатели не складываем и не вычитаем',body:'Запись две девятых плюс три девятых равно пять восемнадцатых неверна. Девятые доли остаются девятыми: меняется их количество, но не размер.',note:'Перед ответом спроси себя: на сколько частей теперь разделено то же целое? Ответ остаётся прежним.'},
  {id:'l99-ready',eyebrow:'Перед практикой',title:'Алгоритм из трёх шагов',body:'Проверь одинаковость знаменателей. Выполни действие с числителями. Перепиши исходный знаменатель и проверь смысл результата относительно единицы.',note:'Дальше — 20 обязательных задач и ровно 50 проверяемых ответов.'}
];
const practiceStages:Stage[]=lessonNinetyNinePractice.map((practice,index)=>({id:`l99-practice-${String(index+1).padStart(2,'0')}`,eyebrow:practice.source?`Учебник · ${practice.source}`:`Обязательная практика · ${index+1} из 20`,title:practice.source?`Точная задача ${practice.source}`:`Практика действий с дробями · ${index+1}`,body:practice.prompt,practice}));
const stages:Stage[]=[...conceptStages,...practiceStages,{id:'l99-summary',eyebrow:'Итог урока 99',title:'Правила сложения и вычитания дробей освоены',body:'Ты сохраняешь общий знаменатель, выполняешь действия с числителями, решаешь простые дробные уравнения и переводишь части одного целого в сумму или разность.',note:'Урок 100 закрепит § 27 на более сложных уравнениях и текстовых задачах.',summary:true}];
export const lessonNinetyNineStageCount=stages.length;
export const lessonNinetyNinePracticeTaskCount=lessonNinetyNinePractice.length;
export const lessonNinetyNinePracticeResponseCount=lessonNinetyNineResponseCount;
function loadSaved():Saved{try{const raw=localStorage.getItem(KEY);if(!raw)return{version:1,stageIndex:0,responses:{},checked:{},attempts:{}};const parsed=JSON.parse(raw) as Saved;return parsed?.version===1?parsed:{version:1,stageIndex:0,responses:{},checked:{},attempts:{}}}catch{return{version:1,stageIndex:0,responses:{},checked:{},attempts:{}}}}

export function SameDenominatorFractionOperationsPlayer(){
  const initial=useMemo(loadSaved,[]);
  const[stageIndex,setStageIndex]=useState(()=>Math.max(0,Math.min(initial.stageIndex,stages.length-1)));
  const[responses,setResponses]=useState<Record<string,string>>(initial.responses);
  const[checked,setChecked]=useState<Record<string,boolean>>(initial.checked);
  const[attempts,setAttempts]=useState<Record<string,number>>(initial.attempts);
  const stage=stages[stageIndex];const task=stage.practice;const taskKey=stage.id;
  const taskComplete=task?task.fields.every(item=>answerMatches(responses[`${taskKey}:${item.id}`]??'',item.answers)):true;
  useEffect(()=>{localStorage.setItem(KEY,JSON.stringify({version:1,stageIndex,responses,checked,attempts} satisfies Saved))},[stageIndex,responses,checked,attempts]);
  useEffect(()=>{const handle=(event:Event)=>{const detail=(event as CustomEvent<StageJumpDetail>).detail;if(detail?.lessonNumber!==99||typeof detail.stageIndex!=='number')return;setStageIndex(Math.max(0,Math.min(Math.trunc(detail.stageIndex),stages.length-1)))};window.addEventListener('mathnikita-go-to-stage',handle);return()=>window.removeEventListener('mathnikita-go-to-stage',handle)},[]);
  function checkTask(){if(!task)return;setChecked(prev=>({...prev,[taskKey]:true}));setAttempts(prev=>({...prev,[taskKey]:(prev[taskKey]??0)+1}))}
  function move(delta:number){setStageIndex(current=>Math.max(0,Math.min(current+delta,stages.length-1)))}
  return <section className="lesson-player theory-experience" aria-label="Урок 99: сложение и вычитание дробей с одинаковыми знаменателями">
    <article className={`interactive-stage ${stage.summary?'stage-summary':''}`} data-stage-id={stage.id} data-stage-index={stageIndex}>
      <div className="stage-copy"><span className="stage-eyebrow">{stage.eyebrow}</span><h2>{stage.title}</h2><p>{stage.body}</p>{stage.note?<p className="theory-note">{stage.note}</p>:null}</div>
      {task?<div className="activity-area"><h3>{task.instruction}</h3><div className="answer-grid">{task.fields.map(item=>{const key=`${taskKey}:${item.id}`;return <label className="inline-answer" key={item.id}><span>{item.label}</span><input value={responses[key]??''} placeholder="Введите ответ" onChange={event=>{setResponses(prev=>({...prev,[key]:event.target.value}));setChecked(prev=>({...prev,[taskKey]:false}))}}/></label>})}</div><button className="check-button" type="button" onClick={checkTask}>Проверить</button>{checked[taskKey]?taskComplete?<div className="instant-feedback good" data-explanation={task.explanation}><b>Верно.</b><span>{task.explanation}</span></div>:<div className="instant-feedback bad" data-explanation={task.explanation}><b>Пока есть ошибка.</b><span>{attempts[taskKey]>1?task.hint:'Проверь одинаковость знаменателей. Выполняй действие только с числителями, знаменатель сохраняй.'}</span></div>:null}</div>:null}
      {stage.summary?<div className="summary-card"><b>Урок 99 завершён</b><span>20 задач · 50 ответов · § 27 продолжается</span></div>:null}
    </article>
    <nav className="lesson-controls" aria-label="Навигация по этапам урока 99"><button type="button" onClick={()=>move(-1)} disabled={stageIndex===0}>← Назад</button><span>Этап {stageIndex+1} из {stages.length}</span><button type="button" onClick={()=>move(1)} disabled={stageIndex===stages.length-1}>Дальше →</button></nav>
  </section>
}
