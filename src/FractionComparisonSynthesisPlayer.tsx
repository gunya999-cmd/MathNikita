import {useEffect,useMemo,useState} from 'react';
import './lessonPlayer.css';
import './theoryExperience.css';
import {lessonNinetyEightPractice,lessonNinetyEightResponseCount,type Lesson98Practice} from './data/lessonNinetyEightPractice';

type Stage={id:string;eyebrow:string;title:string;body:string;note?:string;practice?:Lesson98Practice;summary?:boolean};
type Saved={version:1;stageIndex:number;responses:Record<string,string>;checked:Record<string,boolean>;attempts:Record<string,number>};
type StageJumpDetail={lessonNumber?:number;stageIndex?:number};
const KEY='mathnikita-lesson-98-progress-v1';
const normalize=(value:string)=>value.normalize('NFKC').trim().toLocaleLowerCase('ru-RU').replace(/\s+/g,'').replace(/,/g,'.');
const answerMatches=(value:string,answers:string[])=>answers.some(answer=>normalize(value)===normalize(answer));

const conceptStages:Stage[]=[
  {id:'l98-synthesis',eyebrow:'Урок 98 · § 26 · 3 из 3',title:'Финал параграфа: не вычисляй дробь, переводи условие',body:'В сложной задаче сначала выясни, что означает слово «правильная», «неправильная» или знак сравнения. После этого дробная запись превращается в обычное условие на числитель, знаменатель или натуральную переменную.',note:'Цель — получить простое целочисленное неравенство и только потом перечислять решения.'},
  {id:'l98-one-check',eyebrow:'Контроль через единицу',title:'Единица мгновенно решает часть сравнений',body:'Если числитель меньше знаменателя, дробь меньше единицы. Если равен знаменателю — равна единице. Если больше — больше единицы. Для пары по разные стороны единицы никакой общий знаменатель не нужен.',note:'Эта проверка особенно полезна в №724 (7–12).'},
  {id:'l98-linear-denominator',eyebrow:'Переменная в знаменателе',title:'Выражение в знаменателе сравниваем с числителем',body:'Если дробь должна быть неправильной, её знаменатель не должен превышать числитель. Поэтому для дроби с числителем сорок два и знаменателем десять плюс четыре умножить на бэ получаем обычное линейное неравенство.',note:'Решение №737 заканчивается границей бэ не больше восьми.'},
  {id:'l98-proper-boundary',eyebrow:'Строгое условие',title:'Правильная дробь даёт строгое неравенство',body:'У правильной дроби числитель строго меньше знаменателя. Равенство уже переводит её в неправильную. Поэтому при поиске границ важно различать «меньше» и «не больше».',note:'Проверяй граничное значение отдельно: оно часто решает, включать число или нет.'},
  {id:'l98-intersection',eyebrow:'Несколько условий',title:'Каждое условие создаёт свой диапазон',body:'Когда одна переменная входит в несколько дробей, выпиши условие от каждой дроби отдельно. Затем бери только те натуральные числа, которые удовлетворяют всем диапазонам одновременно.',note:'Это пересечение условий — ключ к №739.'},
  {id:'l98-completeness',eyebrow:'Полнота ответа',title:'Нужно доказать, что не потеряно ни одно натуральное число',body:'После нахождения нижней и верхней границ перечисли все натуральные числа между ними. Проверь крайние значения подстановкой: одно должно ещё удовлетворять условию, следующее за границей — уже нет.',note:'Так проверяется не только правильность, но и полнота набора решений.'},
  {id:'l98-strategy',eyebrow:'Выбор модели',title:'Три вопроса перед каждой задачей',body:'Что сравнивается: дробь с единицей, две дроби или несколько условий? Где находится переменная: в числителе или знаменателе? Граница строгая или включает равенство? Эти три вопроса задают весь план.',note:'Не переходи к перебору, пока не сформулировал границы.'},
  {id:'l98-ready',eyebrow:'Перед практикой',title:'Финальная проверка §26',body:'Сначала структура, затем неравенство, затем натуральные границы, затем проверка концов диапазона. Этот порядок работает и для одиночной дроби, и для системы из нескольких условий.',note:'Дальше — 20 обязательных задач и ровно 50 проверяемых ответов.'}
];
const practiceStages:Stage[]=lessonNinetyEightPractice.map((practice,index)=>({id:`l98-practice-${String(index+1).padStart(2,'0')}`,eyebrow:practice.source?`Учебник · ${practice.source}`:`Обязательная практика · ${index+1} из 20`,title:practice.source?`Точная задача ${practice.source}`:`Итоговая практика · ${index+1}`,body:practice.prompt,practice}));
const stages:Stage[]=[...conceptStages,...practiceStages,{id:'l98-summary',eyebrow:'Итог § 26',title:'Правильные и неправильные дроби освоены как система правил',body:'Ты сравниваешь дроби через единицу и общую структуру, переводишь свойства дробей в неравенства и находишь полные наборы натуральных решений для нескольких условий.',note:'§ 26 завершён. Следующий урок открывает § 27 — сложение и вычитание дробей с одинаковыми знаменателями.',summary:true}];
export const lessonNinetyEightStageCount=stages.length;
export const lessonNinetyEightPracticeTaskCount=lessonNinetyEightPractice.length;
export const lessonNinetyEightPracticeResponseCount=lessonNinetyEightResponseCount;
function loadSaved():Saved{try{const raw=localStorage.getItem(KEY);if(!raw)return{version:1,stageIndex:0,responses:{},checked:{},attempts:{}};const parsed=JSON.parse(raw) as Saved;return parsed?.version===1?parsed:{version:1,stageIndex:0,responses:{},checked:{},attempts:{}}}catch{return{version:1,stageIndex:0,responses:{},checked:{},attempts:{}}}}

export function FractionComparisonSynthesisPlayer(){
  const initial=useMemo(loadSaved,[]);
  const[stageIndex,setStageIndex]=useState(()=>Math.max(0,Math.min(initial.stageIndex,stages.length-1)));
  const[responses,setResponses]=useState<Record<string,string>>(initial.responses);
  const[checked,setChecked]=useState<Record<string,boolean>>(initial.checked);
  const[attempts,setAttempts]=useState<Record<string,number>>(initial.attempts);
  const stage=stages[stageIndex];const task=stage.practice;const taskKey=stage.id;
  const taskComplete=task?task.fields.every(item=>answerMatches(responses[`${taskKey}:${item.id}`]??'',item.answers)):true;
  useEffect(()=>{localStorage.setItem(KEY,JSON.stringify({version:1,stageIndex,responses,checked,attempts} satisfies Saved))},[stageIndex,responses,checked,attempts]);
  useEffect(()=>{const handle=(event:Event)=>{const detail=(event as CustomEvent<StageJumpDetail>).detail;if(detail?.lessonNumber!==98||typeof detail.stageIndex!=='number')return;setStageIndex(Math.max(0,Math.min(Math.trunc(detail.stageIndex),stages.length-1)))};window.addEventListener('mathnikita-go-to-stage',handle);return()=>window.removeEventListener('mathnikita-go-to-stage',handle)},[]);
  function checkTask(){if(!task)return;setChecked(prev=>({...prev,[taskKey]:true}));setAttempts(prev=>({...prev,[taskKey]:(prev[taskKey]??0)+1}))}
  function move(delta:number){setStageIndex(current=>Math.max(0,Math.min(current+delta,stages.length-1)))}
  return <section className="lesson-player theory-experience" aria-label="Урок 98: итог параграфа 26">
    <article className={`interactive-stage ${stage.summary?'stage-summary':''}`} data-stage-id={stage.id} data-stage-index={stageIndex}>
      <div className="stage-copy"><span className="stage-eyebrow">{stage.eyebrow}</span><h2>{stage.title}</h2><p>{stage.body}</p>{stage.note?<p className="theory-note">{stage.note}</p>:null}</div>
      {task?<div className="activity-area"><h3>{task.instruction}</h3><div className="answer-grid">{task.fields.map(item=>{const key=`${taskKey}:${item.id}`;return <label className="inline-answer" key={item.id}><span>{item.label}</span><input value={responses[key]??''} placeholder="Введите ответ" onChange={event=>{setResponses(prev=>({...prev,[key]:event.target.value}));setChecked(prev=>({...prev,[taskKey]:false}))}}/></label>})}</div><button className="check-button" type="button" onClick={checkTask}>Проверить</button>{checked[taskKey]?taskComplete?<div className="instant-feedback good" data-explanation={task.explanation}><b>Верно.</b><span>{task.explanation}</span></div>:<div className="instant-feedback bad" data-explanation={task.explanation}><b>Пока есть ошибка.</b><span>{attempts[taskKey]>1?task.hint:'Переведи каждое свойство дроби в условие на натуральную переменную и проверь границы.'}</span></div>:null}</div>:null}
      {stage.summary?<div className="summary-card"><b>§ 26 завершён</b><span>Урок 98 · 20 задач · 50 ответов</span></div>:null}
    </article>
    <nav className="lesson-controls" aria-label="Навигация по этапам урока 98"><button type="button" onClick={()=>move(-1)} disabled={stageIndex===0}>← Назад</button><span>Этап {stageIndex+1} из {stages.length}</span><button type="button" onClick={()=>move(1)} disabled={stageIndex===stages.length-1}>Дальше →</button></nav>
  </section>
}
