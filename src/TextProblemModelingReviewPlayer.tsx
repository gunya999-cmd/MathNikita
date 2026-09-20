import {useEffect,useMemo,useState} from 'react';
import './lessonPlayer.css';
import './theoryExperience.css';
import {lessonOneHundredSixtyNinePractice,lessonOneHundredSixtyNineResponseCount,type LessonOneHundredSixtyNineField,type LessonOneHundredSixtyNineTask} from './data/lessonOneHundredSixtyNinePractice';
import {exactDecimalEquals} from './exactDecimal';

type Stage={id:string;eyebrow:string;title:string;body:string;note?:string;practice?:LessonOneHundredSixtyNineTask;summary?:boolean};
type Saved={version:1;stageIndex:number;responses:Record<string,string>;checked:Record<string,boolean>;attempts:Record<string,number>};
type Jump={lessonNumber?:number;stageIndex?:number};
const KEY='mathnikita-lesson-169-progress-v1';
const matchField=(value:string,field:LessonOneHundredSixtyNineField)=>field.answers.some(answer=>exactDecimalEquals(value,answer));

const concepts:Stage[]=[
  {id:'l169-model',eyebrow:'Урок 169 · итоговое повторение',title:'Текст задачи нужно превратить в модель',body:'Сначала выпиши величины и связи между ними, затем выбери выражение или уравнение. Вычисления начинаются только после того, как понятно, что именно означает каждое число.',note:'Полезная запись: дано → связь → вычисление → ответ.'},
  {id:'l169-units',eyebrow:'Единицы',title:'Единицы измерения должны быть согласованы',body:'Складывать и сравнивать можно только однородные величины. В задачах на движение время, скорость и путь должны быть записаны в совместимых единицах.',note:'Если единицы не согласованы, правильная арифметика всё равно даст неверный смысловой ответ.'},
  {id:'l169-motion',eyebrow:'Движение',title:'Для движения держи рядом S=v·t',body:'При движении навстречу скорости сближения складываются, при догонке в одном направлении — вычитаются. После нахождения времени проверь путь каждого участника.',note:'Контроль: сумма пройденных навстречу путей должна дать исходное расстояние.'},
  {id:'l169-parts',eyebrow:'Части и проценты',title:'Сначала определи, от какого целого берётся часть',body:'Для дробей и процентов важно не потерять базу: 15% от цены, 3/5 маршрута, 30% неизвестного числа — это разные модели.',note:'Фраза «30% числа равны 54» означает 0,3x=54.'},
  {id:'l169-equation',eyebrow:'Уравнение',title:'Неизвестное удобно обозначить одной буквой',body:'Если условие описывает сумму, разность или кратность неизвестных величин, составь простое уравнение и после решения подставь ответ обратно в условие.',note:'Проверка подстановкой — часть решения, а не отдельная формальность.'},
  {id:'l169-check',eyebrow:'Проверка',title:'Ответ должен быть разумным и отвечать вопросу',body:'Оцени порядок величины, проверь единицы и перечитай вопрос. Иногда вычислено промежуточное число, а задача спрашивает другое.',note:'Если автобус ехал 2,5 часа со скоростью 72 км/ч, путь обязан быть больше 72 км.'}
];
const practiceStages:Stage[]=lessonOneHundredSixtyNinePractice.map((practice,i)=>({id:`l169-practice-${String(i+1).padStart(2,'0')}`,eyebrow:`Практика · ${i+1} из 20`,title:practice.title,body:practice.prompt,practice}));
const stages:Stage[]=[...concepts,...practiceStages,{id:'l169-summary',eyebrow:'Итог урока 169',title:'Математическая модель текстовой задачи собрана',body:'Ты повторил движение, покупки, части, проценты, геометрию, среднее значение и простые уравнения в текстовом формате.',note:'20 задач · 50 ответов · первый урок блока текстовых задач.',summary:true}];
export const lessonOneHundredSixtyNineStageCount=stages.length;
export const lessonOneHundredSixtyNinePracticeTaskCount=lessonOneHundredSixtyNinePractice.length;
export const lessonOneHundredSixtyNinePracticeResponseCount=lessonOneHundredSixtyNineResponseCount;

function load():Saved{try{const raw=localStorage.getItem(KEY);if(!raw)return{version:1,stageIndex:0,responses:{},checked:{},attempts:{}};const p=JSON.parse(raw) as Saved;return p?.version===1?p:{version:1,stageIndex:0,responses:{},checked:{},attempts:{}}}catch{return{version:1,stageIndex:0,responses:{},checked:{},attempts:{}}}}

export function TextProblemModelingReviewPlayer(){
  const initial=useMemo(load,[]);
  const[stageIndex,setStageIndex]=useState(()=>Math.max(0,Math.min(initial.stageIndex,stages.length-1)));
  const[responses,setResponses]=useState(initial.responses);
  const[checked,setChecked]=useState(initial.checked);
  const[attempts,setAttempts]=useState(initial.attempts);
  const stage=stages[stageIndex];const task=stage.practice;const key=stage.id;
  const complete=task?task.fields.every(field=>matchField(responses[`${key}:${field.id}`]??'',field)):true;
  useEffect(()=>{localStorage.setItem(KEY,JSON.stringify({version:1,stageIndex,responses,checked,attempts} satisfies Saved))},[stageIndex,responses,checked,attempts]);
  useEffect(()=>{const handler=(event:Event)=>{const d=(event as CustomEvent<Jump>).detail;if(d?.lessonNumber!==169||typeof d.stageIndex!=='number')return;setStageIndex(Math.max(0,Math.min(Math.trunc(d.stageIndex),stages.length-1)))};window.addEventListener('mathnikita-go-to-stage',handler);return()=>window.removeEventListener('mathnikita-go-to-stage',handler)},[]);
  const check=()=>{if(task){setChecked(p=>({...p,[key]:true}));setAttempts(p=>({...p,[key]:(p[key]??0)+1}))}};
  const move=(delta:number)=>setStageIndex(i=>Math.max(0,Math.min(i+delta,stages.length-1)));
  return <section className="lesson-player theory-experience" aria-label="Урок 169: решение текстовых задач"><article className={`interactive-stage ${stage.summary?'stage-summary':''}`} data-stage-id={stage.id} data-stage-index={stageIndex}><div className="stage-copy"><span className="stage-eyebrow">{stage.eyebrow}</span><h2>{stage.title}</h2><p>{stage.body}</p>{stage.note?<p className="theory-note">{stage.note}</p>:null}</div>{task?<div className="activity-area"><h3>{task.prompt}</h3><div className="answer-grid">{task.fields.map(field=>{const responseKey=`${key}:${field.id}`;return <label className="inline-answer" key={field.id}><span>{field.label}</span><input value={responses[responseKey]??''} placeholder={field.placeholder??'Введите ответ'} inputMode="decimal" onChange={event=>{setResponses(p=>({...p,[responseKey]:event.target.value}));setChecked(p=>({...p,[key]:false}))}}/></label>})}</div><button className="check-button" type="button" onClick={check}>Проверить</button>{checked[key]?complete?<div className="instant-feedback good" data-explanation={task.explanation}><b>Верно.</b><span>{task.explanation}</span></div>:<div className="instant-feedback bad" data-explanation={task.explanation}><b>Пока есть ошибка.</b><span>{attempts[key]>1?task.hint:'Выдели величины, запиши связь между ними и проверь единицы измерения.'}</span></div>:null}</div>:null}{stage.summary?<div className="summary-card"><b>Урок 169 завершён</b><span>20 задач · 50 ответов · математическая модель текстовых задач</span></div>:null}</article><nav className="lesson-controls" aria-label="Навигация по этапам урока 169"><button type="button" onClick={()=>move(-1)} disabled={stageIndex===0}>← Назад</button><span>Этап {stageIndex+1} из {stages.length}</span><button type="button" onClick={()=>move(1)} disabled={stageIndex===stages.length-1}>Дальше →</button></nav></section>;
}
