import {useEffect,useMemo,useState} from 'react';
import './lessonPlayer.css';
import './theoryExperience.css';
import {lessonOneHundredSixtySixPractice,lessonOneHundredSixtySixResponseCount,type LessonOneHundredSixtySixField,type LessonOneHundredSixtySixTask} from './data/lessonOneHundredSixtySixPractice';
import {exactDecimalEquals} from './exactDecimal';

type Stage={id:string;eyebrow:string;title:string;body:string;note?:string;practice?:LessonOneHundredSixtySixTask;summary?:boolean};
type Saved={version:1;stageIndex:number;responses:Record<string,string>;checked:Record<string,boolean>;attempts:Record<string,number>};
type Jump={lessonNumber?:number;stageIndex?:number};
const KEY='mathnikita-lesson-166-progress-v1';
const matchField=(value:string,field:LessonOneHundredSixtySixField)=>field.answers.some(answer=>exactDecimalEquals(value,answer));

const concepts:Stage[]=[
  {id:'l166-types',eyebrow:'Урок 166 · итоговое повторение',title:'Вид угла определяет его градусная мера',body:'Острый угол меньше 90°, прямой равен 90°, тупой больше 90°, но меньше 180°, развёрнутый равен 180°.',note:'Градусную меру обозначают знаком °, но в полях ответа вводится только число.'},
  {id:'l166-measure',eyebrow:'Измерение угла',title:'Транспортир читают от нулевой отметки нужного луча',body:'Центр транспортира совмещают с вершиной угла, нулевую линию — с одним лучом, а по шкале второго луча считывают градусную меру.',note:'Всегда проверяй, соответствует ли выбранная шкала ожидаемому виду угла.'},
  {id:'l166-parts',eyebrow:'Сложение углов',title:'Градусные меры соседних частей складываются',body:'Если луч проходит внутри угла, весь угол равен сумме двух получившихся углов. Неизвестную часть находят вычитанием.',note:'Например, если 47° и 68° — соседние части, весь угол равен 115°.'},
  {id:'l166-straight',eyebrow:'Прямой и развёрнутый угол',title:'Опорные значения — 90° и 180°',body:'Для частей прямого угла сумма равна 90°, для частей развёрнутого — 180°. Эти значения удобно использовать как контроль.',note:'Если сумма частей не совпала с 90° или 180°, вычисление нужно перепроверить.'},
  {id:'l166-bisector',eyebrow:'Биссектриса',title:'Биссектриса делит угол пополам',body:'Если луч является биссектрисой, обе части имеют одинаковую градусную меру, равную половине исходного угла.',note:'Для угла 118° каждая часть после биссектрисы равна 59°.'},
  {id:'l166-build',eyebrow:'Построение',title:'Построение проверяется обратным измерением',body:'После построения угла заданной величины его измеряют ещё раз. Разница между заданным и полученным значением показывает, насколько нужно скорректировать второй луч.',note:'Задача построения считается завершённой только после проверки градусной меры.'}
];
const practiceStages:Stage[]=lessonOneHundredSixtySixPractice.map((practice,i)=>({id:`l166-practice-${String(i+1).padStart(2,'0')}`,eyebrow:`Практика · ${i+1} из 20`,title:practice.title,body:practice.prompt,practice}));
const stages:Stage[]=[...concepts,...practiceStages,{id:'l166-summary',eyebrow:'Итог урока 166',title:'Измерение и построение углов систематизировано',body:'Ты повторил виды углов, градусную меру, сложение и вычитание углов, прямой и развёрнутый угол, биссектрису и проверку построения.',note:'20 задач · 50 ответов · §§11–12.',summary:true}];
export const lessonOneHundredSixtySixStageCount=stages.length;
export const lessonOneHundredSixtySixPracticeTaskCount=lessonOneHundredSixtySixPractice.length;
export const lessonOneHundredSixtySixPracticeResponseCount=lessonOneHundredSixtySixResponseCount;

function load():Saved{try{const raw=localStorage.getItem(KEY);if(!raw)return{version:1,stageIndex:0,responses:{},checked:{},attempts:{}};const p=JSON.parse(raw) as Saved;return p?.version===1?p:{version:1,stageIndex:0,responses:{},checked:{},attempts:{}}}catch{return{version:1,stageIndex:0,responses:{},checked:{},attempts:{}}}}

export function AngleMeasurementReviewPlayer(){
  const initial=useMemo(load,[]);
  const[stageIndex,setStageIndex]=useState(()=>Math.max(0,Math.min(initial.stageIndex,stages.length-1)));
  const[responses,setResponses]=useState(initial.responses);
  const[checked,setChecked]=useState(initial.checked);
  const[attempts,setAttempts]=useState(initial.attempts);
  const stage=stages[stageIndex];const task=stage.practice;const key=stage.id;
  const complete=task?task.fields.every(field=>matchField(responses[`${key}:${field.id}`]??'',field)):true;
  useEffect(()=>{localStorage.setItem(KEY,JSON.stringify({version:1,stageIndex,responses,checked,attempts} satisfies Saved))},[stageIndex,responses,checked,attempts]);
  useEffect(()=>{const handler=(event:Event)=>{const d=(event as CustomEvent<Jump>).detail;if(d?.lessonNumber!==166||typeof d.stageIndex!=='number')return;setStageIndex(Math.max(0,Math.min(Math.trunc(d.stageIndex),stages.length-1)))};window.addEventListener('mathnikita-go-to-stage',handler);return()=>window.removeEventListener('mathnikita-go-to-stage',handler)},[]);
  const check=()=>{if(task){setChecked(p=>({...p,[key]:true}));setAttempts(p=>({...p,[key]:(p[key]??0)+1}))}};
  const move=(delta:number)=>setStageIndex(i=>Math.max(0,Math.min(i+delta,stages.length-1)));
  return <section className="lesson-player theory-experience" aria-label="Урок 166: измерение и построение углов"><article className={`interactive-stage ${stage.summary?'stage-summary':''}`} data-stage-id={stage.id} data-stage-index={stageIndex}><div className="stage-copy"><span className="stage-eyebrow">{stage.eyebrow}</span><h2>{stage.title}</h2><p>{stage.body}</p>{stage.note?<p className="theory-note">{stage.note}</p>:null}</div>{task?<div className="activity-area"><h3>{task.prompt}</h3><div className="answer-grid">{task.fields.map(field=>{const responseKey=`${key}:${field.id}`;return <label className="inline-answer" key={field.id}><span>{field.label}</span><input value={responses[responseKey]??''} placeholder={field.placeholder??'Введите ответ'} inputMode="decimal" onChange={event=>{setResponses(p=>({...p,[responseKey]:event.target.value}));setChecked(p=>({...p,[key]:false}))}}/></label>})}</div><button className="check-button" type="button" onClick={check}>Проверить</button>{checked[key]?complete?<div className="instant-feedback good" data-explanation={task.explanation}><b>Верно.</b><span>{task.explanation}</span></div>:<div className="instant-feedback bad" data-explanation={task.explanation}><b>Пока есть ошибка.</b><span>{attempts[key]>1?task.hint:'Сравни градусную меру с 90° и 180°, а затем проверь сумму частей.'}</span></div>:null}</div>:null}{stage.summary?<div className="summary-card"><b>Урок 166 завершён</b><span>20 задач · 50 ответов · измерение и построение углов</span></div>:null}</article><nav className="lesson-controls" aria-label="Навигация по этапам урока 166"><button type="button" onClick={()=>move(-1)} disabled={stageIndex===0}>← Назад</button><span>Этап {stageIndex+1} из {stages.length}</span><button type="button" onClick={()=>move(1)} disabled={stageIndex===stages.length-1}>Дальше →</button></nav></section>;
}
