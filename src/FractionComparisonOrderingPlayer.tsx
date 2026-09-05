import {useEffect,useMemo,useState} from 'react';
import './lessonPlayer.css';
import './theoryExperience.css';
import {lessonNinetySevenPractice,lessonNinetySevenResponseCount,type Lesson97Practice} from './data/lessonNinetySevenPractice';

type Stage={id:string;eyebrow:string;title:string;body:string;note?:string;practice?:Lesson97Practice;summary?:boolean};
type Saved={version:1;stageIndex:number;responses:Record<string,string>;checked:Record<string,boolean>;attempts:Record<string,number>};
type StageJumpDetail={lessonNumber?:number;stageIndex?:number};
const KEY='mathnikita-lesson-97-progress-v1';
const normalize=(value:string)=>value.normalize('NFKC').trim().toLocaleLowerCase('ru-RU').replace(/\s+/g,'').replace(/,/g,'.');
const answerMatches=(value:string,answers:string[])=>answers.some(answer=>normalize(value)===normalize(answer));

const conceptStages:Stage[]=[
  {id:'l97-rule-choice',eyebrow:'Урок 97 · § 26 · 2 из 3',title:'Сначала определи, что в дробях одинаково',body:'Перед вычислениями посмотри на структуру пары. Одинаковые знаменатели означают одинаковый размер долей, одинаковые числители — одинаковое количество долей. Это сразу подсказывает правило сравнения.',note:'Лучшее решение здесь часто занимает одну мысль, а не вычисление.'},
  {id:'l97-same-denominator',eyebrow:'Правило 1',title:'Одинаковые знаменатели — порядок числителей сохраняется',body:'При одинаковом знаменателе каждая доля имеет один размер. Поэтому больше та дробь, в которой таких долей взято больше.',note:'Сравни только числители; знаменатель менять не нужно.'},
  {id:'l97-same-numerator',eyebrow:'Правило 2',title:'Одинаковые числители — порядок знаменателей разворачивается',body:'Если взято одинаковое количество долей, то крупнее дробь с более крупной долей. Чем меньше знаменатель, тем крупнее одна доля.',note:'При одинаковом числителе меньший знаменатель даёт большую дробь.'},
  {id:'l97-ordering',eyebrow:'Несколько дробей',title:'Упорядочивание — это повторённое сравнение',body:'Если знаменатели одинаковы, достаточно расположить числители в нужном порядке и вернуть каждому тот же знаменатель. Для одинаковых числителей упорядочиваем знаменатели в обратном порядке.',note:'Не сравнивай каждую пару заново, если можно увидеть общий ключ.'},
  {id:'l97-one',eyebrow:'Контроль через единицу',title:'Единица помогает проверить порядок',body:'Правильная дробь меньше единицы, неправильная — не меньше единицы. Этот ориентир быстро обнаруживает невозможный порядок и помогает проверить ответ.',note:'Если правильная дробь оказалась правее дроби больше единицы в порядке возрастания — порядок ошибочен.'},
  {id:'l97-variable-denominator',eyebrow:'Неизвестная · одинаковые знаменатели',title:'Дробное неравенство превращается в неравенство числителей',body:'Когда знаменатели одинаковы, условие для дробей можно перенести прямо на числители. Например, если семь семнадцатых больше неизвестного числа семнадцатых, то неизвестное натуральное число должно быть меньше семи.',note:'После этого остаётся перечислить только натуральные значения.'},
  {id:'l97-variable-numerator',eyebrow:'Неизвестная · одинаковые числители',title:'При одинаковом числителе не забудь обратный порядок',body:'Если числители одинаковы, большая дробь имеет меньший знаменатель. Поэтому условие «двенадцать делённое на икс больше двенадцати одиннадцатых» означает: икс меньше одиннадцати.',note:'Это главный источник ошибок: знак между знаменателями меняет направление логики.'},
  {id:'l97-ready',eyebrow:'Перед практикой',title:'Алгоритм из четырёх вопросов',body:'Одинаковы знаменатели? Одинаковы числители? Можно сравнить через единицу? Нужно перечислить натуральные значения? Ответь на эти вопросы по порядку — и выбери самое короткое правило.',note:'Дальше — 20 обязательных задач и ровно 50 проверяемых ответов.'}
];
const practiceStages:Stage[]=lessonNinetySevenPractice.map((practice,index)=>({id:`l97-practice-${String(index+1).padStart(2,'0')}`,eyebrow:practice.source?`Учебник · ${practice.source}`:`Обязательная практика · ${index+1} из 20`,title:practice.source?`Точная задача ${practice.source}`:`Сравнение и порядок · ${index+1}`,body:practice.prompt,practice}));
const stages:Stage[]=[...conceptStages,...practiceStages,{id:'l97-summary',eyebrow:'Итог урока 97',title:'Сравнение стало выбором правильного правила',body:'Ты сравниваешь дроби по общей структуре, упорядочиваешь несколько дробей и находишь натуральные значения неизвестной в дробных неравенствах.',note:'Следующий, третий урок §26 закрепит сложные границы и итоговые задачи параграфа.',summary:true}];
export const lessonNinetySevenStageCount=stages.length;
export const lessonNinetySevenPracticeTaskCount=lessonNinetySevenPractice.length;
export const lessonNinetySevenPracticeResponseCount=lessonNinetySevenResponseCount;
function loadSaved():Saved{try{const raw=localStorage.getItem(KEY);if(!raw)return{version:1,stageIndex:0,responses:{},checked:{},attempts:{}};const parsed=JSON.parse(raw) as Saved;return parsed?.version===1?parsed:{version:1,stageIndex:0,responses:{},checked:{},attempts:{}}}catch{return{version:1,stageIndex:0,responses:{},checked:{},attempts:{}}}}

export function FractionComparisonOrderingPlayer(){
  const initial=useMemo(loadSaved,[]);
  const[stageIndex,setStageIndex]=useState(()=>Math.max(0,Math.min(initial.stageIndex,stages.length-1)));
  const[responses,setResponses]=useState<Record<string,string>>(initial.responses);
  const[checked,setChecked]=useState<Record<string,boolean>>(initial.checked);
  const[attempts,setAttempts]=useState<Record<string,number>>(initial.attempts);
  const stage=stages[stageIndex];const task=stage.practice;const taskKey=stage.id;
  const taskComplete=task?task.fields.every(item=>answerMatches(responses[`${taskKey}:${item.id}`]??'',item.answers)):true;
  useEffect(()=>{localStorage.setItem(KEY,JSON.stringify({version:1,stageIndex,responses,checked,attempts} satisfies Saved))},[stageIndex,responses,checked,attempts]);
  useEffect(()=>{const handle=(event:Event)=>{const detail=(event as CustomEvent<StageJumpDetail>).detail;if(detail?.lessonNumber!==97||typeof detail.stageIndex!=='number')return;setStageIndex(Math.max(0,Math.min(Math.trunc(detail.stageIndex),stages.length-1)))};window.addEventListener('mathnikita-go-to-stage',handle);return()=>window.removeEventListener('mathnikita-go-to-stage',handle)},[]);
  function checkTask(){if(!task)return;setChecked(prev=>({...prev,[taskKey]:true}));setAttempts(prev=>({...prev,[taskKey]:(prev[taskKey]??0)+1}))}
  function move(delta:number){setStageIndex(current=>Math.max(0,Math.min(current+delta,stages.length-1)))}
  return <section className="lesson-player theory-experience" aria-label="Урок 97: сравнение и упорядочивание дробей">
    <article className={`interactive-stage ${stage.summary?'stage-summary':''}`} data-stage-id={stage.id} data-stage-index={stageIndex}>
      <div className="stage-copy"><span className="stage-eyebrow">{stage.eyebrow}</span><h2>{stage.title}</h2><p>{stage.body}</p>{stage.note?<p className="theory-note">{stage.note}</p>:null}</div>
      {task?<div className="activity-area"><h3>{task.instruction}</h3><div className="answer-grid">{task.fields.map(item=>{const key=`${taskKey}:${item.id}`;return <label className="inline-answer" key={item.id}><span>{item.label}</span><input value={responses[key]??''} placeholder="Введите ответ" onChange={event=>{setResponses(prev=>({...prev,[key]:event.target.value}));setChecked(prev=>({...prev,[taskKey]:false}))}}/></label>})}</div><button className="check-button" type="button" onClick={checkTask}>Проверить</button>{checked[taskKey]?taskComplete?<div className="instant-feedback good" data-explanation={task.explanation}><b>Верно.</b><span>{task.explanation}</span></div>:<div className="instant-feedback bad" data-explanation={task.explanation}><b>Пока есть ошибка.</b><span>{attempts[taskKey]>1?task.hint:'Сначала определи, что одинаково: знаменатели, числители или положение относительно единицы.'}</span></div>:null}</div>:null}
      {stage.summary?<div className="summary-card"><b>Урок 97 завершён</b><span>§ 26 · 20 задач · 50 ответов</span></div>:null}
    </article>
    <nav className="lesson-controls" aria-label="Навигация по этапам урока 97"><button type="button" onClick={()=>move(-1)} disabled={stageIndex===0}>← Назад</button><span>Этап {stageIndex+1} из {stages.length}</span><button type="button" onClick={()=>move(1)} disabled={stageIndex===stages.length-1}>Дальше →</button></nav>
  </section>
}
