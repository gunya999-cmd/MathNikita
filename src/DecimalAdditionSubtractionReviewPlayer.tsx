import {useEffect,useMemo,useState} from 'react';
import './lessonPlayer.css';
import './theoryExperience.css';
import {lessonOneHundredSixtyPractice,lessonOneHundredSixtyResponseCount,type LessonOneHundredSixtyField,type LessonOneHundredSixtyTask} from './data/lessonOneHundredSixtyPractice';
import {exactDecimalEquals} from './exactDecimal';

type Stage={id:string;eyebrow:string;title:string;body:string;note?:string;practice?:LessonOneHundredSixtyTask;summary?:boolean};
type Saved={version:1;stageIndex:number;responses:Record<string,string>;checked:Record<string,boolean>;attempts:Record<string,number>};
type Jump={lessonNumber?:number;stageIndex?:number};
const KEY='mathnikita-lesson-160-progress-v1';
const matchField=(value:string,field:LessonOneHundredSixtyField)=>field.answers.some(answer=>exactDecimalEquals(value,answer));

const concepts:Stage[]=[
  {id:'l160-map',eyebrow:'Урок 160 · итоговое повторение',title:'Разряды должны стоять друг под другом',body:'При сложении и вычитании десятичных дробей единицы складывают с единицами, десятые — с десятыми, сотые — с сотыми. Поэтому в записи столбиком запятая должна находиться под запятой.',note:'12,7 удобно записать как 12,70 перед сложением с 3,45.'},
  {id:'l160-zeros',eyebrow:'Нули справа',title:'Дописывание нулей справа не меняет число',body:'Записи 7,9, 7,90 и 7,900 обозначают одно и то же число. Дополнительные нули помогают выровнять дробные разряды.',note:'20 = 20,000, если нужно вычесть число с тысячными.'},
  {id:'l160-add',eyebrow:'Сложение',title:'Складывай по разрядам и сохраняй положение запятой',body:'После выравнивания разрядов десятичные дроби складываются так же, как натуральные числа. Запятая в ответе остаётся в той же разрядной колонке.',note:'48,305 + 7,900 = 56,205.'},
  {id:'l160-subtract',eyebrow:'Вычитание',title:'При необходимости занимай единицу из соседнего разряда',body:'Вычитание выполняется по тем же разрядам. Проверить результат можно обратным действием: к разности прибавить вычитаемое.',note:'73,80 − 26,45 = 47,35; 47,35 + 26,45 = 73,80.'},
  {id:'l160-equations',eyebrow:'Уравнения',title:'Связь компонентов действий остаётся прежней',body:'Неизвестное слагаемое находят вычитанием, неизвестное уменьшаемое — сложением, неизвестное вычитаемое — вычитанием разности из уменьшаемого.',note:'x + 18,75 = 40,2 ⇒ x = 21,45.'},
  {id:'l160-problems',eyebrow:'Задачи',title:'Деньги, длина, масса и объём требуют той же разрядной точности',body:'Перед вычислением выпиши величины с одинаковыми единицами измерения, выровняй десятичные разряды и после решения проверь смысл результата.',note:'Для денежных сумм особенно удобно сохранять два знака после запятой во время вычисления.'}
];
const practiceStages:Stage[]=lessonOneHundredSixtyPractice.map((practice,i)=>({id:`l160-practice-${String(i+1).padStart(2,'0')}`,eyebrow:`Практика · ${i+1} из 20`,title:practice.title,body:practice.prompt,practice}));
const stages:Stage[]=[...concepts,...practiceStages,{id:'l160-summary',eyebrow:'Итог урока 160',title:'Сложение и вычитание десятичных дробей систематизированы',body:'Ты повторил выравнивание разрядов, нули справа, сложение и вычитание, выражения со скобками, уравнения и прикладные задачи.',note:'Следующий урок итогового повторения — умножение и деление десятичных дробей.',summary:true}];
export const lessonOneHundredSixtyStageCount=stages.length;
export const lessonOneHundredSixtyPracticeTaskCount=lessonOneHundredSixtyPractice.length;
export const lessonOneHundredSixtyPracticeResponseCount=lessonOneHundredSixtyResponseCount;

function load():Saved{try{const raw=localStorage.getItem(KEY);if(!raw)return{version:1,stageIndex:0,responses:{},checked:{},attempts:{}};const p=JSON.parse(raw) as Saved;return p?.version===1?p:{version:1,stageIndex:0,responses:{},checked:{},attempts:{}}}catch{return{version:1,stageIndex:0,responses:{},checked:{},attempts:{}}}}

export function DecimalAdditionSubtractionReviewPlayer(){
  const initial=useMemo(load,[]);
  const[stageIndex,setStageIndex]=useState(()=>Math.max(0,Math.min(initial.stageIndex,stages.length-1)));
  const[responses,setResponses]=useState(initial.responses);
  const[checked,setChecked]=useState(initial.checked);
  const[attempts,setAttempts]=useState(initial.attempts);
  const stage=stages[stageIndex];const task=stage.practice;const key=stage.id;
  const complete=task?task.fields.every(field=>matchField(responses[`${key}:${field.id}`]??'',field)):true;
  useEffect(()=>{localStorage.setItem(KEY,JSON.stringify({version:1,stageIndex,responses,checked,attempts} satisfies Saved))},[stageIndex,responses,checked,attempts]);
  useEffect(()=>{const handler=(event:Event)=>{const d=(event as CustomEvent<Jump>).detail;if(d?.lessonNumber!==160||typeof d.stageIndex!=='number')return;setStageIndex(Math.max(0,Math.min(Math.trunc(d.stageIndex),stages.length-1)))};window.addEventListener('mathnikita-go-to-stage',handler);return()=>window.removeEventListener('mathnikita-go-to-stage',handler)},[]);
  const check=()=>{if(task){setChecked(p=>({...p,[key]:true}));setAttempts(p=>({...p,[key]:(p[key]??0)+1}))}};
  const move=(delta:number)=>setStageIndex(i=>Math.max(0,Math.min(i+delta,stages.length-1)));
  return <section className="lesson-player theory-experience" aria-label="Урок 160: сложение и вычитание десятичных дробей"><article className={`interactive-stage ${stage.summary?'stage-summary':''}`} data-stage-id={stage.id} data-stage-index={stageIndex}><div className="stage-copy"><span className="stage-eyebrow">{stage.eyebrow}</span><h2>{stage.title}</h2><p>{stage.body}</p>{stage.note?<p className="theory-note">{stage.note}</p>:null}</div>{task?<div className="activity-area"><h3>{task.prompt}</h3><div className="answer-grid">{task.fields.map(field=>{const responseKey=`${key}:${field.id}`;return <label className="inline-answer" key={field.id}><span>{field.label}</span><input value={responses[responseKey]??''} placeholder={field.placeholder??'Введите ответ'} inputMode="decimal" onChange={event=>{setResponses(p=>({...p,[responseKey]:event.target.value}));setChecked(p=>({...p,[key]:false}))}}/></label>})}</div><button className="check-button" type="button" onClick={check}>Проверить</button>{checked[key]?complete?<div className="instant-feedback good" data-explanation={task.explanation}><b>Верно.</b><span>{task.explanation}</span></div>:<div className="instant-feedback bad" data-explanation={task.explanation}><b>Пока есть ошибка.</b><span>{attempts[key]>1?task.hint:'Проверь разряды: запятая должна стоять под запятой.'}</span></div>:null}</div>:null}{stage.summary?<div className="summary-card"><b>Урок 160 завершён</b><span>20 задач · 50 ответов · сложение и вычитание десятичных дробей</span></div>:null}</article><nav className="lesson-controls" aria-label="Навигация по этапам урока 160"><button type="button" onClick={()=>move(-1)} disabled={stageIndex===0}>← Назад</button><span>Этап {stageIndex+1} из {stages.length}</span><button type="button" onClick={()=>move(1)} disabled={stageIndex===stages.length-1}>Дальше →</button></nav></section>;
}
