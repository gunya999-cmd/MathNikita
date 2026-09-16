import {useEffect,useMemo,useState} from 'react';
import './lessonPlayer.css';
import './theoryExperience.css';
import {lessonOneHundredFiftyFivePractice,lessonOneHundredFiftyFiveResponseCount,type LessonOneHundredFiftyFiveField,type LessonOneHundredFiftyFiveTask} from './data/lessonOneHundredFiftyFivePractice';

type Stage={id:string;eyebrow:string;title:string;body:string;note?:string;practice?:LessonOneHundredFiftyFiveTask;summary?:boolean};
type Saved={version:1;stageIndex:number;responses:Record<string,string>;checked:Record<string,boolean>;attempts:Record<string,number>};
type Jump={lessonNumber?:number;stageIndex?:number};
const KEY='mathnikita-lesson-155-progress-v1';
const norm=(v:string)=>v.normalize('NFKC').trim().toLocaleLowerCase('ru-RU').replace(/\s+/g,'').replace(/,/g,'.');
const canonicalDecimal=(v:string)=>{let s=norm(v);if(!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(s))return null;let sign='';if(s.startsWith('+')||s.startsWith('-')){sign=s.startsWith('-')?'-':'';s=s.slice(1)}let[whole,frac='']=s.split('.');whole=(whole||'0').replace(/^0+(?=\d)/,'');frac=frac.replace(/0+$/,'');if(whole==='0'&&!frac)sign='';return `${sign}${whole}${frac?`.${frac}`:''}`};
const matchField=(value:string,field:LessonOneHundredFiftyFiveField)=>{const v=norm(value);if(!v)return false;const cv=canonicalDecimal(v);return field.answers.some(answer=>{const a=norm(answer);if(v===a)return true;const ca=canonicalDecimal(a);return cv!==null&&ca!==null&&cv===ca})};

const concepts:Stage[]=[
{id:'l155-mode',eyebrow:'Урок 155 · репетиция контрольной №9',title:'Решай как на контрольной',body:'Сначала прочитай условие целиком и только потом выбирай действие. Название параграфа в практических карточках не подсказывает алгоритм.',note:'Цель — не вспомнить номер правила, а распознать математическую модель.'},
{id:'l155-mean',eyebrow:'§ 36',title:'Среднее связывает сумму и количество',body:'Среднее = сумма : количество. Если среднее известно, восстанови сумму умножением на количество, а затем находи неизвестное значение.',note:'Проверка: сумма найденных значений, делённая на их количество, должна вернуть исходное среднее.'},
{id:'l155-direct',eyebrow:'§ 37',title:'Известны 100% → умножай',body:'Если целое известно, p% от него находят умножением на p/100. Для процентов больше 100% множитель будет больше единицы.',note:'135%=1,35; 7,5%=0,075; 62,5%=0,625.'},
{id:'l155-inverse',eyebrow:'§ 38',title:'Неизвестны 100% → дели',body:'Если известная величина составляет p% неизвестного целого, восстанови 100% делением известной части на p/100.',note:'После восстановления обязательно проверь прямым умножением.'},
{id:'l155-remainder',eyebrow:'Остаток и потеря',title:'Сначала найди соответствующий процент',body:'Если потеряно 18%, осталось 82%. Если две группы заняли 28% и 34%, третьей осталось 38%. Только после этого связывай процент с известным количеством.',note:'Не подменяй процент потери процентом остатка.'},
{id:'l155-base',eyebrow:'Смена базы',title:'Каждый процент имеет свою базу',body:'В цепочке «35% всего, затем 25% от остатка» второй процент считается уже от новой величины. Проценты нельзя просто складывать.',note:'Подписывай базу возле каждого процентного множителя.'},
{id:'l155-check',eyebrow:'Финальная проверка',title:'Три фильтра перед ответом',body:'Проверь единицы, порядок величин и обратное действие. При проценте меньше 100 восстановленное целое должно быть больше известной части; при проценте больше 100 — меньше.',note:'Дальше 20 карточек и ровно 50 проверяемых ответов.'}
];
const practiceStages:Stage[]=lessonOneHundredFiftyFivePractice.map((practice,i)=>({id:`l155-practice-${String(i+1).padStart(2,'0')}`,eyebrow:`Контрольная карточка · ${i+1} из 20`,title:practice.title,body:practice.prompt,practice}));
const stages:Stage[]=[...concepts,...practiceStages,{id:'l155-summary',eyebrow:'Итог урока 155',title:'Генеральная репетиция завершена',body:'Ты прошёл смешанный набор по §36–§38: среднее, прямые и обратные проценты, проценты больше 100%, остаток, смену базы и составные задачи.',note:'Следующий урок — контрольная работа №9. Новых правил перед ней нет.',summary:true}];
export const lessonOneHundredFiftyFiveStageCount=stages.length;
export const lessonOneHundredFiftyFivePracticeTaskCount=lessonOneHundredFiftyFivePractice.length;
export const lessonOneHundredFiftyFivePracticeResponseCount=lessonOneHundredFiftyFiveResponseCount;

function load():Saved{try{const raw=localStorage.getItem(KEY);if(!raw)return{version:1,stageIndex:0,responses:{},checked:{},attempts:{}};const p=JSON.parse(raw) as Saved;return p?.version===1?p:{version:1,stageIndex:0,responses:{},checked:{},attempts:{}}}catch{return{version:1,stageIndex:0,responses:{},checked:{},attempts:{}}}}

export function ControlNineRehearsalPlayer(){
 const initial=useMemo(load,[]);
 const[stageIndex,setStageIndex]=useState(()=>Math.max(0,Math.min(initial.stageIndex,stages.length-1)));
 const[responses,setResponses]=useState(initial.responses);
 const[checked,setChecked]=useState(initial.checked);
 const[attempts,setAttempts]=useState(initial.attempts);
 const stage=stages[stageIndex];const task=stage.practice;const key=stage.id;
 const complete=task?task.fields.every(field=>matchField(responses[`${key}:${field.id}`]??'',field)):true;
 useEffect(()=>{localStorage.setItem(KEY,JSON.stringify({version:1,stageIndex,responses,checked,attempts} satisfies Saved))},[stageIndex,responses,checked,attempts]);
 useEffect(()=>{const handler=(event:Event)=>{const d=(event as CustomEvent<Jump>).detail;if(d?.lessonNumber!==155||typeof d.stageIndex!=='number')return;setStageIndex(Math.max(0,Math.min(Math.trunc(d.stageIndex),stages.length-1)))};window.addEventListener('mathnikita-go-to-stage',handler);return()=>window.removeEventListener('mathnikita-go-to-stage',handler)},[]);
 const check=()=>{if(task){setChecked(p=>({...p,[key]:true}));setAttempts(p=>({...p,[key]:(p[key]??0)+1}))}};
 const move=(delta:number)=>setStageIndex(i=>Math.max(0,Math.min(i+delta,stages.length-1)));
 return <section className="lesson-player theory-experience" aria-label="Урок 155: генеральная репетиция контрольной работы номер 9"><article className={`interactive-stage ${stage.summary?'stage-summary':''}`} data-stage-id={stage.id} data-stage-index={stageIndex}><div className="stage-copy"><span className="stage-eyebrow">{stage.eyebrow}</span><h2>{stage.title}</h2><p>{stage.body}</p>{stage.note?<p className="theory-note">{stage.note}</p>:null}</div>{task?<div className="activity-area"><h3>{task.prompt}</h3><div className="answer-grid">{task.fields.map(field=>{const responseKey=`${key}:${field.id}`;return <label className="inline-answer" key={field.id}><span>{field.label}</span><input value={responses[responseKey]??''} placeholder={field.placeholder??'Введите ответ'} onChange={event=>{setResponses(p=>({...p,[responseKey]:event.target.value}));setChecked(p=>({...p,[key]:false}))}}/></label>})}</div><button className="check-button" type="button" onClick={check}>Проверить</button>{checked[key]?complete?<div className="instant-feedback good" data-explanation={task.explanation}><b>Верно.</b><span>{task.explanation}</span></div>:<div className="instant-feedback bad" data-explanation={task.explanation}><b>Пока есть ошибка.</b><span>{attempts[key]>1?task.hint:'Проверь, что именно принимается за 100%, и перепроверь арифметику.'}</span></div>:null}</div>:null}{stage.summary?<div className="summary-card"><b>Урок 155 завершён</b><span>20 карточек · 50 ответов · готовность к контрольной №9</span></div>:null}</article><nav className="lesson-controls" aria-label="Навигация по этапам урока 155"><button type="button" onClick={()=>move(-1)} disabled={stageIndex===0}>← Назад</button><span>Этап {stageIndex+1} из {stages.length}</span><button type="button" onClick={()=>move(1)} disabled={stageIndex===stages.length-1}>Дальше →</button></nav></section>
}
