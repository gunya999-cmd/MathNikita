import {useEffect,useMemo,useState} from 'react';
import {loadLessonTiming} from './lessonTiming';
import './lessonPlayer.css';
import './controlWork.css';

type ControlField={id:string;number:string;label:string;answer:string;accepted?:string[];placeholder?:string;explanation:string};
export type ControlWorkFourStage={id:string;title:string;eyebrow:string;kind:'intro'|'task'|'submit'|'summary';body:string;fieldIds?:string[]};
type Saved={version:1;stageIndex:number;responses:Record<string,string>;submitted:boolean;completedAt?:string;submittedResponses?:Record<string,string>;correctionFieldIds?:string[];correctionCompletedAt?:string};
type StageJumpDetail={lessonNumber?:number;stageIndex?:number};

const KEY='mathnikita-lesson-73-control-v1';
const COMPLETION_KEY='mathnikita:lesson-complete:73';

const fields:ControlField[]=[
  {id:'l73-1a',number:'1.1',label:'36 · 2418',answer:'87048',accepted:['87 048'],placeholder:'Ответ',explanation:'36 · 2418 = 87 048.'},
  {id:'l73-1b',number:'1.2',label:'175 · 204',answer:'35700',accepted:['35 700'],placeholder:'Ответ',explanation:'175 · 204 = 35 700.'},
  {id:'l73-1c',number:'1.3',label:'1456 : 28',answer:'52',placeholder:'Ответ',explanation:'1456 : 28 = 52, потому что 52 · 28 = 1456.'},
  {id:'l73-1d',number:'1.4',label:'177 000 : 120',answer:'1475',accepted:['1 475'],placeholder:'Ответ',explanation:'177 000 : 120 = 1 475.'},
  {id:'l73-2',number:'2',label:'(326 · 48 − 9 587) : 29',answer:'209',placeholder:'Ответ',explanation:'326 · 48 = 15 648; 15 648 − 9 587 = 6 061; 6 061 : 29 = 209.'},
  {id:'l73-3a',number:'3.1',label:'x · 14 = 364',answer:'26',placeholder:'x =',explanation:'x = 364 : 14 = 26.'},
  {id:'l73-3b',number:'3.2',label:'324 : x = 9',answer:'36',placeholder:'x =',explanation:'x = 324 : 9 = 36.'},
  {id:'l73-3c',number:'3.3',label:'19x − 12x = 126',answer:'18',placeholder:'x =',explanation:'7x = 126, поэтому x = 18.'},
  {id:'l73-4a',number:'4.1',label:'25 · 79 · 4',answer:'7900',accepted:['7 900'],placeholder:'Ответ',explanation:'Удобно переставить множители: 25 · 4 · 79 = 100 · 79 = 7 900.'},
  {id:'l73-4b',number:'4.2',label:'43 · 89 + 89 · 57',answer:'8900',accepted:['8 900'],placeholder:'Ответ',explanation:'Вынесем 89: 89 · (43 + 57) = 89 · 100 = 8 900.'},
  {id:'l73-5',number:'5',label:'Стоимость 1 кг печенья, рублей',answer:'40',accepted:['40 р','40 руб','40 рублей'],placeholder:'Ответ',explanation:'7 кг конфет стоят 7 · 120 = 840 р. На печенье осталось 1 200 − 840 = 360 р. Тогда 360 : 9 = 40 р/кг.'},
  {id:'l73-6',number:'6',label:'Расстояние между поездами через 6 ч, км',answer:'48',accepted:['48 км'],placeholder:'Ответ',explanation:'Скорости отличаются на 64 − 56 = 8 км/ч. За 6 ч расстояние станет 8 · 6 = 48 км.'},
  {id:'l73-7',number:'7',label:'Сколькими нулями оканчивается произведение всех натуральных чисел от 19 до 35 включительно?',answer:'5',accepted:['5 нулей','5 нулями'],placeholder:'Ответ',explanation:'Число конечных нулей определяется парами 2·5. Пятёрок дают: 20 — одну, 25 — две, 30 — одну, 35 — одну. Всего 5; двоек достаточно.'},
];

const fieldById=new Map(fields.map(field=>[field.id,field]));

export const lessonSeventyThreeStages:ControlWorkFourStage[]=[
  {id:'l73-rules',kind:'intro',eyebrow:'Контрольная работа № 4 · вариант 1',title:'Самостоятельная работа без подсказок',body:'7 заданий · 13 оцениваемых ответов · ориентир 45 минут. Правильные ответы и разбор появятся только после сдачи всей работы.'},
  {id:'l73-task1',kind:'task',eyebrow:'Задание 1 из 7',title:'Вычислите',body:'Выполни четыре вычисления: 36 · 2418; 175 · 204; 1456 : 28; 177 000 : 120.',fieldIds:['l73-1a','l73-1b','l73-1c','l73-1d']},
  {id:'l73-task2',kind:'task',eyebrow:'Задание 2 из 7',title:'Найдите значение выражения',body:'Вычисли (326 · 48 − 9 587) : 29, соблюдая порядок действий.',fieldIds:['l73-2']},
  {id:'l73-task3',kind:'task',eyebrow:'Задание 3 из 7',title:'Решите уравнения',body:'Реши три уравнения: x · 14 = 364; 324 : x = 9; 19x − 12x = 126.',fieldIds:['l73-3a','l73-3b','l73-3c']},
  {id:'l73-task4',kind:'task',eyebrow:'Задание 4 из 7',title:'Наиболее удобный способ',body:'Найди значения выражений наиболее удобным способом: 25 · 79 · 4 и 43 · 89 + 89 · 57.',fieldIds:['l73-4a','l73-4b']},
  {id:'l73-task5',kind:'task',eyebrow:'Задание 5 из 7',title:'Конфеты и печенье',body:'Купили 7 кг конфет и 9 кг печенья, заплатив за всю покупку 1 200 р. Сколько стоит 1 кг печенья, если 1 кг конфет стоит 120 р.?',fieldIds:['l73-5']},
  {id:'l73-task6',kind:'task',eyebrow:'Задание 6 из 7',title:'Два поезда',body:'С одной станции одновременно в одном направлении отправились два поезда. Один двигался со скоростью 56 км/ч, второй — 64 км/ч. Какое расстояние будет между ними через 6 ч после начала движения?',fieldIds:['l73-6']},
  {id:'l73-task7',kind:'task',eyebrow:'Задание 7 из 7',title:'Задача на конечные нули',body:'Сколькими нулями оканчивается произведение всех натуральных чисел от 19 до 35 включительно?',fieldIds:['l73-7']},
  {id:'l73-submit',kind:'submit',eyebrow:'Перед сдачей',title:'Финальная самопроверка',body:'Проверь все 13 ответов, порядок действий, уравнения, единицы измерения и ход решения задач. До сдачи можно вернуться к любому заданию.'},
  {id:'l73-summary',kind:'summary',eyebrow:'Результат',title:'Контрольная работа № 4',body:'Первичный результат сохраняется неизменным. Если есть ошибки, откроется коррекция только по неверным ответам.'},
];

function normalize(value:string){return value.trim().toLowerCase().replace(/\s+/g,'').replace(/[−–—]/g,'-').replace(/руб(?:лей)?\.?|р\.?|км/g,'')}
function correct(field:ControlField,response:string){return[field.answer,...(field.accepted??[])].some(answer=>normalize(response)===normalize(answer))}
function loadSaved():Saved{
  try{const raw=localStorage.getItem(KEY);if(!raw)return{version:1,stageIndex:0,responses:{},submitted:false};const parsed=JSON.parse(raw) as Saved;if(parsed?.version===1)return{version:1,stageIndex:Math.max(0,Math.min(parsed.stageIndex,lessonSeventyThreeStages.length-1)),responses:parsed.responses??{},submitted:Boolean(parsed.submitted),completedAt:parsed.completedAt,submittedResponses:parsed.submittedResponses,correctionFieldIds:parsed.correctionFieldIds??[],correctionCompletedAt:parsed.correctionCompletedAt}}catch{}
  return{version:1,stageIndex:0,responses:{},submitted:false};
}

export function ControlWorkFourPlayer(){
  const initial=useMemo(loadSaved,[]);
  const[stageIndex,setStageIndex]=useState(initial.stageIndex);
  const[responses,setResponses]=useState<Record<string,string>>(initial.responses);
  const[submitted,setSubmitted]=useState(initial.submitted);
  const[completedAt,setCompletedAt]=useState<string|undefined>(initial.completedAt);
  const[submittedResponses,setSubmittedResponses]=useState<Record<string,string>|undefined>(initial.submittedResponses);
  const[correctionFieldIds,setCorrectionFieldIds]=useState<string[]>(initial.correctionFieldIds??[]);
  const[correctionCompletedAt,setCorrectionCompletedAt]=useState<string|undefined>(initial.correctionCompletedAt);
  const stage=lessonSeventyThreeStages[stageIndex];
  const answeredCount=fields.filter(field=>Boolean(responses[field.id]?.trim())).length;
  const baselineResponses=submittedResponses??(submitted?responses:{});
  const score=fields.filter(field=>correct(field,baselineResponses[field.id]??'')).length;
  const grade=score>=12?'5':score>=10?'4':score>=7?'3':'нужно повторить';
  const wrongFieldIds=submitted?fields.filter(field=>!correct(field,baselineResponses[field.id]??'')).map(field=>field.id):[];
  const correctionMode=submitted&&correctionFieldIds.length>0&&!correctionCompletedAt;
  const correctionCorrectCount=correctionFieldIds.filter(id=>{const field=fieldById.get(id);return Boolean(field&&correct(field,responses[id]??''))}).length;
  const correctionStageIndexes=lessonSeventyThreeStages.map((item,index)=>({item,index})).filter(({item})=>item.kind==='task'&&item.fieldIds?.some(id=>correctionFieldIds.includes(id))).map(({index})=>index);
  const correctionPosition=correctionStageIndexes.indexOf(stageIndex);
  const stageFields=(stage.fieldIds??[]).map(id=>fieldById.get(id)).filter(Boolean) as ControlField[];
  const stageComplete=correctionMode?stageFields.filter(field=>correctionFieldIds.includes(field.id)).every(field=>correct(field,responses[field.id]??'')):stageFields.every(field=>Boolean(responses[field.id]?.trim()));

  useEffect(()=>{localStorage.setItem(KEY,JSON.stringify({version:1,stageIndex,responses,submitted,completedAt,submittedResponses,correctionFieldIds,correctionCompletedAt} satisfies Saved))},[stageIndex,responses,submitted,completedAt,submittedResponses,correctionFieldIds,correctionCompletedAt]);
  useEffect(()=>{const go=(event:Event)=>{const detail=(event as CustomEvent<StageJumpDetail>).detail;if(detail?.lessonNumber!==73||typeof detail.stageIndex!=='number')return;moveTo(detail.stageIndex)};window.addEventListener('mathnikita-go-to-stage',go);return()=>window.removeEventListener('mathnikita-go-to-stage',go)},[]);

  function stopNarration(){window.dispatchEvent(new CustomEvent('mathnikita-stop-narration'));if('speechSynthesis'in window)window.speechSynthesis.cancel()}
  function moveTo(index:number){stopNarration();setStageIndex(Math.max(0,Math.min(index,lessonSeventyThreeStages.length-1)));window.scrollTo({top:0,behavior:'smooth'})}
  function canEdit(id:string){return!submitted||(correctionMode&&correctionFieldIds.includes(id))}
  function setResponse(id:string,value:string){if(canEdit(id))setResponses(previous=>({...previous,[id]:value}))}
  function submit(){
    if(answeredCount!==fields.length||submitted)return;
    const now=new Date().toISOString();const snapshot={...responses};const activeSeconds=Math.round(loadLessonTiming(73).activeSeconds);
    setSubmittedResponses(snapshot);setSubmitted(true);setCompletedAt(now);setCorrectionFieldIds([]);setCorrectionCompletedAt(undefined);moveTo(lessonSeventyThreeStages.length-1);
    localStorage.setItem(COMPLETION_KEY,JSON.stringify({completedAt:now,activeSeconds}));
    window.dispatchEvent(new CustomEvent('mathnikita-lesson-completed',{detail:{lessonNumber:73,completedAt:now,activeSeconds}}));
  }
  function startCorrection(){if(!wrongFieldIds.length)return;const indexes=lessonSeventyThreeStages.map((item,index)=>({item,index})).filter(({item})=>item.kind==='task'&&item.fieldIds?.some(id=>wrongFieldIds.includes(id))).map(({index})=>index);setCorrectionFieldIds(wrongFieldIds);setCorrectionCompletedAt(undefined);moveTo(indexes[0]??lessonSeventyThreeStages.length-1)}
  function finishCorrection(){if(!correctionFieldIds.length||correctionCorrectCount!==correctionFieldIds.length)return;setCorrectionCompletedAt(new Date().toISOString());moveTo(lessonSeventyThreeStages.length-1)}
  function reset(){stopNarration();localStorage.removeItem(KEY);localStorage.removeItem(COMPLETION_KEY);setResponses({});setSubmittedResponses(undefined);setSubmitted(false);setCompletedAt(undefined);setCorrectionFieldIds([]);setCorrectionCompletedAt(undefined);setStageIndex(0)}

  return <main className="control-work-page control-four-page" data-control-work="4" data-source-reference="Мерзляк · методическое пособие · контрольная работа № 4 · вариант 1" data-control-field-count={fields.length}>
    <section className="lesson-player-shell">
      <div className="control-work-status"><div><span>Контрольная работа № 4</span><b>{submitted?`Первичный балл ${score}/${fields.length}`:`Заполнено ${answeredCount}/${fields.length}`}</b></div><div className="control-progress"><i style={{width:`${((stageIndex+1)/lessonSeventyThreeStages.length)*100}%`}}/></div></div>
      <article className={`interactive-stage control-stage ${stage.kind==='summary'?'stage-summary':''}`} data-stage-id={stage.id}>
        <div className="stage-copy"><span className="stage-eyebrow">{stage.eyebrow}</span><h2>{stage.title}</h2><p>{stage.body}</p></div>
        {stage.kind==='intro'?<><div className="control-source-badge"><b>Точный источник</b><span>А. Г. Мерзляк и др., методическое пособие: контрольная работа № 4 «Умножение и деление натуральных чисел. Свойства умножения», вариант 1.</span></div><div className="control-rules"><b>Во время работы</b><ul><li>решай самостоятельно и в любом удобном порядке;</li><li>подсказки, наставник и мгновенная проверка отключены;</li><li>ответы и разбор появятся только после сдачи;</li><li>первичный результат после сдачи не переписывается.</li></ul></div></>:null}
        {stage.kind==='task'?<div className="control-fields">{stageFields.map(field=>{const editable=canEdit(field.id);const correctionTarget=correctionMode&&correctionFieldIds.includes(field.id);return <section className={`control-field ${correctionTarget?'is-correction-target':''}`} data-control-field={field.id} key={field.id}><label><b>{field.number}. {field.label}</b><input value={responses[field.id]??''} onChange={event=>setResponse(field.id,event.target.value)} placeholder={field.placeholder} disabled={!editable}/></label>{submitted&&!correctionMode?<div className={correct(field,baselineResponses[field.id]??'')?'control-answer correct':'control-answer wrong'}><b>{correct(field,baselineResponses[field.id]??'')?'Верно':'Ошибка'}</b>{!correct(field,baselineResponses[field.id]??'')?<><span>Правильный ответ: {field.answer}</span><em>{field.explanation}</em></>:null}</div>:null}{correctionMode&&correctionTarget&&correct(field,responses[field.id]??'')?<div className="control-answer correct"><b>Исправлено ✓</b></div>:null}</section>})}</div>:null}
        {stage.kind==='submit'?<div className="control-submit-card"><strong>{answeredCount}/{fields.length}</strong><p>{answeredCount===fields.length?'Все 13 ответов заполнены. Можно сдавать работу.':'Не все ответы заполнены. Вернись к пропущенным заданиям.'}</p><button type="button" onClick={submit} disabled={answeredCount!==fields.length||submitted}>Сдать контрольную работу</button></div>:null}
        {stage.kind==='summary'?submitted?<div className="summary-card control-summary stage-summary" data-stage-id="l73-summary-result"><div className="control-score"><span>Первичный результат</span><strong>{score}/{fields.length}</strong><b>Оценка: {grade}</b><small>Сдана{completedAt?` · ${new Date(completedAt).toLocaleDateString('ru-RU')}`:''}</small></div>{wrongFieldIds.length?<div className={`control-correction-card ${correctionCompletedAt?'is-complete':''}`}><b>{correctionCompletedAt?'Коррекция завершена ✓':`Нужно закрепить: ${wrongFieldIds.length}`}</b><p>{correctionCompletedAt?'Все ошибки первой попытки исправлены. Первичный балл сохранён.':'Откроются только ответы, где была ошибка. Первичный результат останется неизменным.'}</p>{!correctionCompletedAt?<button type="button" onClick={startCorrection}>Исправить только ошибки</button>:null}</div>:<div className="control-correction-card is-complete"><b>{fields.length} из {fields.length} — все задания выполнены верно ✓</b><p>Коррекция не требуется.</p></div>}<div className="control-review-list">{fields.map(field=>{const original=baselineResponses[field.id]??'';const ok=correct(field,original);const corrected=!ok&&Boolean(correctionCompletedAt)&&correct(field,responses[field.id]??'');return <section key={field.id} className={ok||corrected?'correct':'wrong'}><header><span>{field.number}</span><b>{ok?'Верно':corrected?'Исправлено':'Нужно исправить'}</b></header><p>{field.label}</p><small>Ответ при сдаче: {original||'—'}</small>{corrected?<strong>После коррекции: {responses[field.id]}</strong>:null}{!ok?<><strong>Правильный ответ: {field.answer}</strong><em>{field.explanation}</em></>:null}</section>})}</div><button className="control-reset" type="button" onClick={reset}>Пройти контрольную заново</button></div>:<div className="control-submit-card"><strong>Результат закрыт</strong><p>Сначала заполни задания и сдай работу.</p></div>:null}
      </article>
      {correctionMode&&stage.kind==='task'?<nav className="lesson-controls control-correction-controls" aria-label="Навигация коррекции"><button type="button" onClick={()=>moveTo(correctionStageIndexes[Math.max(0,correctionPosition-1)]??stageIndex)} disabled={correctionPosition<=0}>← Предыдущая ошибка</button><span>Коррекция {correctionPosition+1} / {correctionStageIndexes.length}</span>{correctionPosition<correctionStageIndexes.length-1?<button className="primary" type="button" onClick={()=>moveTo(correctionStageIndexes[correctionPosition+1])} disabled={!stageComplete}>Следующая ошибка →</button>:<button className="primary" type="button" onClick={finishCorrection} disabled={correctionCorrectCount!==correctionFieldIds.length}>Завершить коррекцию ✓</button>}</nav>:<nav className="lesson-controls" aria-label="Навигация контрольной работы"><button type="button" onClick={()=>moveTo(stageIndex-1)} disabled={stageIndex===0}>← Назад</button><span>Этап {stageIndex+1} из {lessonSeventyThreeStages.length}</span>{stageIndex<lessonSeventyThreeStages.length-1?<button className="primary" type="button" onClick={()=>moveTo(stageIndex+1)} disabled={stage.kind==='task'&&!stageComplete}>Далее →</button>:<button className="primary" type="button" onClick={()=>moveTo(8)}>К сдаче</button>}</nav>}
    </section>
  </main>;
}
