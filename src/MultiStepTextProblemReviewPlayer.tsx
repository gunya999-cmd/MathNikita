import {useEffect,useMemo,useState} from 'react';
import './lessonPlayer.css';
import './theoryExperience.css';
import {lessonOneHundredSeventyPractice,lessonOneHundredSeventyResponseCount,type LessonOneHundredSeventyField,type LessonOneHundredSeventyTask} from './data/lessonOneHundredSeventyPractice';
import {exactDecimalEquals} from './exactDecimal';

type Stage={id:string;eyebrow:string;title:string;body:string;note?:string;practice?:LessonOneHundredSeventyTask;summary?:boolean};
type Saved={version:1;stageIndex:number;responses:Record<string,string>;checked:Record<string,boolean>;attempts:Record<string,number>};
type Jump={lessonNumber?:number;stageIndex?:number};
const KEY='mathnikita-lesson-170-progress-v1';
const matchField=(value:string,field:LessonOneHundredSeventyField)=>field.answers.some(answer=>exactDecimalEquals(value,answer));

const concepts:Stage[]=[
  {id:'l170-chain',eyebrow:'Урок 170 · составные задачи',title:'Длинная задача — это цепочка коротких моделей',body:'Не пытайся сразу получить конечный ответ. Выпиши, что можно найти первым шагом, затем используй этот результат как новые данные.',note:'Промежуточное число должно иметь понятный смысл: путь, остаток, стоимость, время, площадь и т. п.'},
  {id:'l170-base',eyebrow:'База сравнения',title:'Доля и процент всегда относятся к конкретной величине',body:'Если после первого действия величина изменилась, следующий процент обычно считается уже от нового значения.',note:'25% от исходного запаса и 25% от остатка — разные количества.'},
  {id:'l170-motion',eyebrow:'Движение',title:'При задержанном старте сначала найди фору',body:'До старта второго участника первый уже проходит некоторое расстояние. Только после этого можно использовать скорость сближения или удаления.',note:'Сначала фора, затем относительная скорость, затем время встречи.'},
  {id:'l170-reverse',eyebrow:'Обратная модель',title:'Иногда известен результат, а нужно восстановить начало',body:'После скидки 15% остаётся 85% исходной цены. После расхода 3/8 остаётся 5/8 исходного количества.',note:'Не вычитай процент ещё раз: сначала пойми, какую долю исходной величины представляет известное число.'},
  {id:'l170-units',eyebrow:'Единицы',title:'Согласуй единицы до вычислений',body:'Кубические сантиметры и литры, часы и минуты, метры и километры нельзя смешивать внутри одной формулы без перевода.',note:'Полезно подписывать единицу возле каждого промежуточного результата.'},
  {id:'l170-check',eyebrow:'Проверка',title:'Проверяй не только арифметику, но и логику цепочки',body:'Итог должен отвечать вопросу, быть разумного масштаба и согласовываться с промежуточными величинами.',note:'Если цена повысилась на 20%, а потом снизилась на 10%, итог не обязан вернуться к исходной цене.'}
];
const practiceStages:Stage[]=lessonOneHundredSeventyPractice.map((practice,i)=>({id:`l170-practice-${String(i+1).padStart(2,'0')}`,eyebrow:`Практика · ${i+1} из 20`,title:practice.title,body:practice.prompt,practice}));
const stages:Stage[]=[...concepts,...practiceStages,{id:'l170-summary',eyebrow:'Итог урока 170',title:'Составные текстовые задачи разобраны',body:'Ты отработал цепочки вычислений, задержанный старт, последовательные проценты, обратные модели и проверку промежуточных результатов.',note:'20 задач · 50 ответов · второй урок блока текстовых задач.',summary:true}];
export const lessonOneHundredSeventyStageCount=stages.length;
export const lessonOneHundredSeventyPracticeTaskCount=lessonOneHundredSeventyPractice.length;
export const lessonOneHundredSeventyPracticeResponseCount=lessonOneHundredSeventyResponseCount;

function load():Saved{try{const raw=localStorage.getItem(KEY);if(!raw)return{version:1,stageIndex:0,responses:{},checked:{},attempts:{}};const p=JSON.parse(raw) as Saved;return p?.version===1?p:{version:1,stageIndex:0,responses:{},checked:{},attempts:{}}}catch{return{version:1,stageIndex:0,responses:{},checked:{},attempts:{}}}}

export function MultiStepTextProblemReviewPlayer(){
  const initial=useMemo(load,[]);
  const[stageIndex,setStageIndex]=useState(()=>Math.max(0,Math.min(initial.stageIndex,stages.length-1)));
  const[responses,setResponses]=useState(initial.responses);
  const[checked,setChecked]=useState(initial.checked);
  const[attempts,setAttempts]=useState(initial.attempts);
  const stage=stages[stageIndex];const task=stage.practice;const key=stage.id;
  const complete=task?task.fields.every(field=>matchField(responses[`${key}:${field.id}`]??'',field)):true;
  useEffect(()=>{localStorage.setItem(KEY,JSON.stringify({version:1,stageIndex,responses,checked,attempts} satisfies Saved))},[stageIndex,responses,checked,attempts]);
  useEffect(()=>{const handler=(event:Event)=>{const d=(event as CustomEvent<Jump>).detail;if(d?.lessonNumber!==170||typeof d.stageIndex!=='number')return;setStageIndex(Math.max(0,Math.min(Math.trunc(d.stageIndex),stages.length-1)))};window.addEventListener('mathnikita-go-to-stage',handler);return()=>window.removeEventListener('mathnikita-go-to-stage',handler)},[]);
  const check=()=>{if(task){setChecked(p=>({...p,[key]:true}));setAttempts(p=>({...p,[key]:(p[key]??0)+1}))}};
  const move=(delta:number)=>setStageIndex(i=>Math.max(0,Math.min(i+delta,stages.length-1)));
  return <section className="lesson-player theory-experience" aria-label="Урок 170: составные текстовые задачи"><article className={`interactive-stage ${stage.summary?'stage-summary':''}`} data-stage-id={stage.id} data-stage-index={stageIndex}><div className="stage-copy"><span className="stage-eyebrow">{stage.eyebrow}</span><h2>{stage.title}</h2><p>{stage.body}</p>{stage.note?<p className="theory-note">{stage.note}</p>:null}</div>{task?<div className="activity-area"><h3>{task.prompt}</h3><div className="answer-grid">{task.fields.map(field=>{const responseKey=`${key}:${field.id}`;return <label className="inline-answer" key={field.id}><span>{field.label}</span><input value={responses[responseKey]??''} placeholder={field.placeholder??'Введите ответ'} inputMode="decimal" onChange={event=>{setResponses(p=>({...p,[responseKey]:event.target.value}));setChecked(p=>({...p,[key]:false}))}}/></label>})}</div><button className="check-button" type="button" onClick={check}>Проверить</button>{checked[key]?complete?<div className="instant-feedback good" data-explanation={task.explanation}><b>Верно.</b><span>{task.explanation}</span></div>:<div className="instant-feedback bad" data-explanation={task.explanation}><b>Пока есть ошибка.</b><span>{attempts[key]>1?task.hint:'Проверь, к какой величине относится каждый следующий шаг и не потерян ли промежуточный результат.'}</span></div>:null}</div>:null}{stage.summary?<div className="summary-card"><b>Урок 170 завершён</b><span>20 задач · 50 ответов · составные текстовые модели</span></div>:null}</article><nav className="lesson-controls" aria-label="Навигация по этапам урока 170"><button type="button" onClick={()=>move(-1)} disabled={stageIndex===0}>← Назад</button><span>Этап {stageIndex+1} из {stages.length}</span><button type="button" onClick={()=>move(1)} disabled={stageIndex===stages.length-1}>Дальше →</button></nav></section>;
}
