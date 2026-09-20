import {useEffect,useMemo,useState} from 'react';
import './lessonPlayer.css';
import './theoryExperience.css';
import {lessonOneHundredSixtyEightPractice,lessonOneHundredSixtyEightResponseCount,type LessonOneHundredSixtyEightField,type LessonOneHundredSixtyEightTask} from './data/lessonOneHundredSixtyEightPractice';
import {exactDecimalEquals} from './exactDecimal';

type Stage={id:string;eyebrow:string;title:string;body:string;note?:string;practice?:LessonOneHundredSixtyEightTask;summary?:boolean};
type Saved={version:1;stageIndex:number;responses:Record<string,string>;checked:Record<string,boolean>;attempts:Record<string,number>};
type Jump={lessonNumber?:number;stageIndex?:number};
const KEY='mathnikita-lesson-168-progress-v1';
const matchField=(value:string,field:LessonOneHundredSixtyEightField)=>field.answers.some(answer=>exactDecimalEquals(value,answer));

const concepts:Stage[]=[
  {id:'l168-cases',eyebrow:'Урок 168 · итоговое повторение',title:'Сложную задачу полезно делить на непересекающиеся случаи',body:'Если одно правило произведения не работает сразу, выдели случаи, которые не пересекаются, посчитай каждый отдельно и сложи результаты.',note:'Например, чётные числа удобно делить по последней цифре: 0, 2, 4 и т. д.'},
  {id:'l168-complement',eyebrow:'Дополнение',title:'«Хотя бы один» часто проще считать от обратного',body:'Количество вариантов с хотя бы одним нужным элементом равно всем вариантам минус варианты, где нужного элемента нет совсем.',note:'Для PIN с хотя бы одной цифрой 7: все PIN − PIN без семёрки.'},
  {id:'l168-order',eyebrow:'Порядок',title:'Роли и позиции делают порядок важным',body:'Капитан и заместитель — разные роли, поэтому AB и BA различаются. Команда из двух человек без ролей — одна и та же пара.',note:'Перед вычислением всегда спроси: изменится ли объект, если поменять выбранные элементы местами?'},
  {id:'l168-restrictions',eyebrow:'Ограничения',title:'Начинай с наиболее ограниченной позиции',body:'Для чётного числа сначала выбирай последнюю цифру; для многозначного числа с нулём отдельно контролируй первую позицию; для обязательного участника сначала зафиксируй его.',note:'Так дерево вариантов становится короче и риск пропуска уменьшается.'},
  {id:'l168-overcount',eyebrow:'Двойной счёт',title:'Если порядок не важен, одинаковые наборы могут считаться несколько раз',body:'Упорядоченный выбор трёх разных элементов считает одну и ту же тройку во всех 3! порядках. Чтобы получить число групп, нужно убрать эти повторы.',note:'Для пары делим на 2, для тройки без ролей — на 6.'},
  {id:'l168-check',eyebrow:'Проверка',title:'Ответ должен выдерживать независимую проверку',body:'Полезно проверить задачу другим способом: деревом вариантов, дополнением, разбиением на случаи или симметрией.',note:'Если два независимых способа дают одно число, вероятность скрытого пропуска или двойного счёта резко меньше.'}
];
const practiceStages:Stage[]=lessonOneHundredSixtyEightPractice.map((practice,i)=>({id:`l168-practice-${String(i+1).padStart(2,'0')}`,eyebrow:`Практика · ${i+1} из 20`,title:practice.title,body:practice.prompt,practice}));
const stages:Stage[]=[...concepts,...practiceStages,{id:'l168-summary',eyebrow:'Итог урока 168',title:'Продвинутая комбинаторика систематизирована',body:'Ты повторил ограничения, дополнение, разбиение на случаи, выбор без повторов, порядок и симметрию.',note:'20 задач · 50 ответов · второй урок §24.',summary:true}];
export const lessonOneHundredSixtyEightStageCount=stages.length;
export const lessonOneHundredSixtyEightPracticeTaskCount=lessonOneHundredSixtyEightPractice.length;
export const lessonOneHundredSixtyEightPracticeResponseCount=lessonOneHundredSixtyEightResponseCount;

function load():Saved{try{const raw=localStorage.getItem(KEY);if(!raw)return{version:1,stageIndex:0,responses:{},checked:{},attempts:{}};const p=JSON.parse(raw) as Saved;return p?.version===1?p:{version:1,stageIndex:0,responses:{},checked:{},attempts:{}}}catch{return{version:1,stageIndex:0,responses:{},checked:{},attempts:{}}}}

export function AdvancedCombinatorialReviewPlayer(){
  const initial=useMemo(load,[]);
  const[stageIndex,setStageIndex]=useState(()=>Math.max(0,Math.min(initial.stageIndex,stages.length-1)));
  const[responses,setResponses]=useState(initial.responses);
  const[checked,setChecked]=useState(initial.checked);
  const[attempts,setAttempts]=useState(initial.attempts);
  const stage=stages[stageIndex];const task=stage.practice;const key=stage.id;
  const complete=task?task.fields.every(field=>matchField(responses[`${key}:${field.id}`]??'',field)):true;
  useEffect(()=>{localStorage.setItem(KEY,JSON.stringify({version:1,stageIndex,responses,checked,attempts} satisfies Saved))},[stageIndex,responses,checked,attempts]);
  useEffect(()=>{const handler=(event:Event)=>{const d=(event as CustomEvent<Jump>).detail;if(d?.lessonNumber!==168||typeof d.stageIndex!=='number')return;setStageIndex(Math.max(0,Math.min(Math.trunc(d.stageIndex),stages.length-1)))};window.addEventListener('mathnikita-go-to-stage',handler);return()=>window.removeEventListener('mathnikita-go-to-stage',handler)},[]);
  const check=()=>{if(task){setChecked(p=>({...p,[key]:true}));setAttempts(p=>({...p,[key]:(p[key]??0)+1}))}};
  const move=(delta:number)=>setStageIndex(i=>Math.max(0,Math.min(i+delta,stages.length-1)));
  return <section className="lesson-player theory-experience" aria-label="Урок 168: продвинутые комбинаторные задачи"><article className={`interactive-stage ${stage.summary?'stage-summary':''}`} data-stage-id={stage.id} data-stage-index={stageIndex}><div className="stage-copy"><span className="stage-eyebrow">{stage.eyebrow}</span><h2>{stage.title}</h2><p>{stage.body}</p>{stage.note?<p className="theory-note">{stage.note}</p>:null}</div>{task?<div className="activity-area"><h3>{task.prompt}</h3><div className="answer-grid">{task.fields.map(field=>{const responseKey=`${key}:${field.id}`;return <label className="inline-answer" key={field.id}><span>{field.label}</span><input value={responses[responseKey]??''} placeholder={field.placeholder??'Введите ответ'} inputMode="decimal" onChange={event=>{setResponses(p=>({...p,[responseKey]:event.target.value}));setChecked(p=>({...p,[key]:false}))}}/></label>})}</div><button className="check-button" type="button" onClick={check}>Проверить</button>{checked[key]?complete?<div className="instant-feedback good" data-explanation={task.explanation}><b>Верно.</b><span>{task.explanation}</span></div>:<div className="instant-feedback bad" data-explanation={task.explanation}><b>Пока есть ошибка.</b><span>{attempts[key]>1?task.hint:'Проверь, нужен ли здесь полный перебор, дополнение, разбиение на случаи или устранение двойного счёта.'}</span></div>:null}</div>:null}{stage.summary?<div className="summary-card"><b>Урок 168 завершён</b><span>20 задач · 50 ответов · продвинутая комбинаторика</span></div>:null}</article><nav className="lesson-controls" aria-label="Навигация по этапам урока 168"><button type="button" onClick={()=>move(-1)} disabled={stageIndex===0}>← Назад</button><span>Этап {stageIndex+1} из {stages.length}</span><button type="button" onClick={()=>move(1)} disabled={stageIndex===stages.length-1}>Дальше →</button></nav></section>;
}
