import { useEffect,useMemo,useState } from 'react';
import { loadLessonTiming } from './lessonTiming';
import './lessonPlayer.css';
import './controlWork.css';

type FieldType='input'|'choice';
type ControlField={id:string;label:string;type:FieldType;answer:string;accepted?:string[];options?:string[];placeholder?:string;explanation:string};
export type ControlWorkTwoStage={id:string;title:string;eyebrow:string;kind:'intro'|'task'|'submit'|'summary';body:string;fieldIds?:string[]};
type Saved={version:1;stageIndex:number;responses:Record<string,string>;submitted:boolean;completedAt?:string;submittedResponses?:Record<string,string>;correctionFieldIds?:string[];correctionCompletedAt?:string};
type StageJumpDetail={lessonNumber?:number;stageIndex?:number};

const KEY='mathnikita-lesson-33-control-v1';
const COMPLETION_KEY='mathnikita:lesson-complete:33';

const fields:ControlField[]=[
  {id:'l33-1a',type:'input',label:'4 807 + 2 995',answer:'7802',accepted:['7 802'],placeholder:'Ответ',explanation:'4 807 + 2 995 = 7 802.'},
  {id:'l33-1b',type:'input',label:'38 475 + 6 928',answer:'45403',accepted:['45 403'],placeholder:'Ответ',explanation:'38 475 + 6 928 = 45 403.'},
  {id:'l33-2a',type:'input',label:'9 000 − 3 768',answer:'5232',accepted:['5 232'],placeholder:'Ответ',explanation:'9 000 − 3 768 = 5 232. Проверка: 5 232 + 3 768 = 9 000.'},
  {id:'l33-2b',type:'input',label:'50 000 − 27 946',answer:'22054',accepted:['22 054'],placeholder:'Ответ',explanation:'50 000 − 27 946 = 22 054.'},
  {id:'l33-3a',type:'input',label:'125 + 375 + 64 + 36',answer:'600',placeholder:'Ответ',explanation:'Удобные пары: 125 + 375 = 500 и 64 + 36 = 100. Итого 600.'},
  {id:'l33-3b',type:'input',label:'900 − (250 + 150)',answer:'500',placeholder:'Ответ',explanation:'250 + 150 = 400; 900 − 400 = 500.'},
  {id:'l33-4a',type:'choice',label:'Какой результат лучше всего подходит для прикидки 3 987 + 2 016?',answer:'6000',options:['4 000','5 000','6 000','60 000'],explanation:'3 987 ≈ 4 000, 2 016 ≈ 2 000, поэтому сумма ≈ 6 000.'},
  {id:'l33-4b',type:'choice',label:'Какой результат лучше всего подходит для прикидки 8 012 − 3 987?',answer:'4000',options:['400','4 000','8 000','12 000'],explanation:'8 012 ≈ 8 000, 3 987 ≈ 4 000, поэтому разность ≈ 4 000.'},
  {id:'l33-5a',type:'input',label:'120 − (35 + 25)',answer:'60',placeholder:'Ответ',explanation:'Сначала скобки: 35 + 25 = 60. Затем 120 − 60 = 60.'},
  {id:'l33-5b',type:'input',label:'1 000 − (600 − 100)',answer:'500',placeholder:'Ответ',explanation:'Сначала 600 − 100 = 500, затем 1 000 − 500 = 500.'},
  {id:'l33-6a',type:'input',label:'a + 47 при a = 153',answer:'200',placeholder:'Ответ',explanation:'153 + 47 = 200.'},
  {id:'l33-6b',type:'input',label:'3a + 8 при a = 12',answer:'44',placeholder:'Ответ',explanation:'3 · 12 + 8 = 36 + 8 = 44.'},
  {id:'l33-7a',type:'input',label:'Было 850 рублей, потратили 275 рублей. Сколько осталось?',answer:'575',placeholder:'Ответ',explanation:'850 − 275 = 575 рублей.'},
  {id:'l33-7b',type:'input',label:'На сколько число 920 больше числа 685?',answer:'235',placeholder:'Ответ',explanation:'920 − 685 = 235.'},
  {id:'l33-8a',type:'input',label:'P = 4a. Найди периметр квадрата при a = 12 см.',answer:'48',placeholder:'Ответ',explanation:'P = 4 · 12 = 48 см.'},
  {id:'l33-8b',type:'input',label:'P = 2(a + b). Найди периметр при a = 9 см, b = 6 см.',answer:'30',placeholder:'Ответ',explanation:'P = 2 · (9 + 6) = 30 см.'},
  {id:'l33-9a',type:'input',label:'s = 300 км, t = 5 ч. Найди скорость v.',answer:'60',placeholder:'Ответ',explanation:'v = s : t = 300 : 5 = 60 км/ч.'},
  {id:'l33-9b',type:'input',label:'Периметр квадрата P = 36 см. Найди сторону a.',answer:'9',placeholder:'Ответ',explanation:'a = P : 4 = 36 : 4 = 9 см.'},
  {id:'l33-10a',type:'input',label:'Найди сумму 1 + 2 + 3 + … + 100 удобным способом.',answer:'5050',accepted:['5 050'],placeholder:'Ответ',explanation:'50 пар дают 101: 50 · 101 = 5 050.'},
  {id:'l33-10b',type:'choice',label:'Одна тетрадь стоит 7 рублей, доставка стоит 20 рублей один раз. Какая формула задаёт стоимость c для n тетрадей?',answer:'c = 7n + 20',options:['c = 7n + 20','c = 7 + n + 20','c = 20n + 7','c = 7n − 20'],explanation:'Стоимость тетрадей — 7n, доставка добавляется один раз: c = 7n + 20.'},
];

const fieldById=new Map(fields.map(field=>[field.id,field]));

export const lessonThirtyThreeStages:ControlWorkTwoStage[]=[
  {id:'l33-rules',kind:'intro',eyebrow:'Контрольная работа № 2',title:'Правила самостоятельной работы',body:'10 заданий · 20 оцениваемых подпунктов · ориентир 45 минут. Решай самостоятельно. Правильные ответы, балл и разбор появятся только после сдачи всей работы.'},
  {id:'l33-task1',kind:'task',eyebrow:'Задание 1 из 10',title:'Письменное сложение',body:'Выполни вычисления. Следи за переносами между разрядами.',fieldIds:['l33-1a','l33-1b']},
  {id:'l33-task2',kind:'task',eyebrow:'Задание 2 из 10',title:'Письменное вычитание',body:'Особенно внимательно работай с нулями и переходом через разряд.',fieldIds:['l33-2a','l33-2b']},
  {id:'l33-task3',kind:'task',eyebrow:'Задание 3 из 10',title:'Свойства действий',body:'Используй удобный порядок вычислений и скобки.',fieldIds:['l33-3a','l33-3b']},
  {id:'l33-task4',kind:'task',eyebrow:'Задание 4 из 10',title:'Прикидка результата',body:'Не вычисляй точно: оцени порядок ответа округлением.',fieldIds:['l33-4a','l33-4b']},
  {id:'l33-task5',kind:'task',eyebrow:'Задание 5 из 10',title:'Числовые выражения',body:'Соблюдай порядок действий и сначала выполняй действия в скобках.',fieldIds:['l33-5a','l33-5b']},
  {id:'l33-task6',kind:'task',eyebrow:'Задание 6 из 10',title:'Буквенные выражения',body:'Подставь значение вместо каждой буквы и вычисли.',fieldIds:['l33-6a','l33-6b']},
  {id:'l33-task7',kind:'task',eyebrow:'Задание 7 из 10',title:'Текстовые задачи',body:'Выбирай действие по смыслу всей ситуации, а не по одному слову.',fieldIds:['l33-7a','l33-7b']},
  {id:'l33-task8',kind:'task',eyebrow:'Задание 8 из 10',title:'Формулы периметра',body:'Используй формулу квадрата и прямоугольника.',fieldIds:['l33-8a','l33-8b']},
  {id:'l33-task9',kind:'task',eyebrow:'Задание 9 из 10',title:'Обратные задачи по формулам',body:'Результат формулы уже известен. Восстанови неизвестную величину.',fieldIds:['l33-9a','l33-9b']},
  {id:'l33-task10',kind:'task',eyebrow:'Задание 10 из 10',title:'Задача со звёздочкой и математическая модель',body:'Заверши работу задачей на удобный способ вычисления и выбором формулы.',fieldIds:['l33-10a','l33-10b']},
  {id:'l33-submit',kind:'submit',eyebrow:'Перед сдачей',title:'Финальная самопроверка',body:'Проверь, что заполнены все 20 подпунктов. Вернись к заданиям, если хочешь перепроверить вычисления, скобки, единицы и смысл ответа.'},
  {id:'l33-summary',kind:'summary',eyebrow:'Результат',title:'Контрольная работа № 2',body:'Первичный результат сохраняется неизменным. Если были ошибки, можно пройти короткую коррекцию только по неверным подпунктам.'},
];

function normalize(value:string){return value.trim().toLowerCase().replace(/\s+/g,'').replace(/[−–—]/g,'-').replace(/×|·/g,'*')}
function correct(field:ControlField,response:string){return[field.answer,...(field.accepted??[])].some(answer=>normalize(response)===normalize(answer))}
function loadSaved():Saved{
  try{const raw=localStorage.getItem(KEY);if(!raw)return{version:1,stageIndex:0,responses:{},submitted:false};const parsed=JSON.parse(raw) as Saved;if(parsed?.version===1)return{version:1,stageIndex:Math.max(0,Math.min(parsed.stageIndex,lessonThirtyThreeStages.length-1)),responses:parsed.responses??{},submitted:Boolean(parsed.submitted),completedAt:parsed.completedAt,submittedResponses:parsed.submittedResponses,correctionFieldIds:parsed.correctionFieldIds??[],correctionCompletedAt:parsed.correctionCompletedAt}}catch{}
  return{version:1,stageIndex:0,responses:{},submitted:false};
}

export function ControlWorkTwoPlayer(){
  const initial=useMemo(loadSaved,[]);
  const[stageIndex,setStageIndex]=useState(initial.stageIndex);
  const[responses,setResponses]=useState<Record<string,string>>(initial.responses);
  const[submitted,setSubmitted]=useState(initial.submitted);
  const[completedAt,setCompletedAt]=useState<string|undefined>(initial.completedAt);
  const[submittedResponses,setSubmittedResponses]=useState<Record<string,string>|undefined>(initial.submittedResponses);
  const[correctionFieldIds,setCorrectionFieldIds]=useState<string[]>(initial.correctionFieldIds??[]);
  const[correctionCompletedAt,setCorrectionCompletedAt]=useState<string|undefined>(initial.correctionCompletedAt);
  const stage=lessonThirtyThreeStages[stageIndex];
  const answeredCount=fields.filter(field=>Boolean(responses[field.id]?.trim())).length;
  const baselineResponses=submittedResponses??(submitted?responses:{});
  const score=fields.filter(field=>correct(field,baselineResponses[field.id]??'')).length;
  const grade=score>=18?'5':score>=15?'4':score>=11?'3':'нужно повторить';
  const wrongFieldIds=submitted?fields.filter(field=>!correct(field,baselineResponses[field.id]??'')).map(field=>field.id):[];
  const correctionMode=submitted&&correctionFieldIds.length>0&&!correctionCompletedAt;
  const correctionCorrectCount=correctionFieldIds.filter(id=>{const field=fieldById.get(id);return Boolean(field&&correct(field,responses[id]??''))}).length;
  const correctionStageIndexes=lessonThirtyThreeStages.map((item,index)=>({item,index})).filter(({item})=>item.kind==='task'&&item.fieldIds?.some(id=>correctionFieldIds.includes(id))).map(({index})=>index);
  const correctionPosition=correctionStageIndexes.indexOf(stageIndex);
  const stageFields=(stage.fieldIds??[]).map(id=>fieldById.get(id)).filter(Boolean) as ControlField[];
  const stageComplete=correctionMode?stageFields.filter(field=>correctionFieldIds.includes(field.id)).every(field=>correct(field,responses[field.id]??'')):stageFields.every(field=>Boolean(responses[field.id]?.trim()));

  useEffect(()=>{localStorage.setItem(KEY,JSON.stringify({version:1,stageIndex,responses,submitted,completedAt,submittedResponses,correctionFieldIds,correctionCompletedAt} satisfies Saved))},[stageIndex,responses,submitted,completedAt,submittedResponses,correctionFieldIds,correctionCompletedAt]);
  useEffect(()=>{const go=(event:Event)=>{const detail=(event as CustomEvent<StageJumpDetail>).detail;if(detail?.lessonNumber!==33||typeof detail.stageIndex!=='number')return;moveTo(detail.stageIndex)};window.addEventListener('mathnikita-go-to-stage',go);return()=>window.removeEventListener('mathnikita-go-to-stage',go)},[]);

  function stopNarration(){window.dispatchEvent(new CustomEvent('mathnikita-stop-narration'));if('speechSynthesis'in window)window.speechSynthesis.cancel()}
  function moveTo(index:number){stopNarration();setStageIndex(Math.max(0,Math.min(index,lessonThirtyThreeStages.length-1)));window.scrollTo({top:0,behavior:'smooth'})}
  function canEdit(id:string){return!submitted||(correctionMode&&correctionFieldIds.includes(id))}
  function setResponse(id:string,value:string){if(canEdit(id))setResponses(previous=>({...previous,[id]:value}))}
  function submit(){
    if(answeredCount!==fields.length||submitted)return;
    const now=new Date().toISOString();const snapshot={...responses};const activeSeconds=Math.round(loadLessonTiming(33).activeSeconds);
    setSubmittedResponses(snapshot);setSubmitted(true);setCompletedAt(now);setCorrectionFieldIds([]);setCorrectionCompletedAt(undefined);moveTo(lessonThirtyThreeStages.length-1);
    localStorage.setItem(COMPLETION_KEY,JSON.stringify({completedAt:now,activeSeconds}));
    window.dispatchEvent(new CustomEvent('mathnikita-lesson-completed',{detail:{lessonNumber:33,completedAt:now,activeSeconds}}));
  }
  function startCorrection(){if(!wrongFieldIds.length)return;const indexes=lessonThirtyThreeStages.map((item,index)=>({item,index})).filter(({item})=>item.kind==='task'&&item.fieldIds?.some(id=>wrongFieldIds.includes(id))).map(({index})=>index);setCorrectionFieldIds(wrongFieldIds);setCorrectionCompletedAt(undefined);moveTo(indexes[0]??lessonThirtyThreeStages.length-1)}
  function finishCorrection(){if(!correctionFieldIds.length||correctionCorrectCount!==correctionFieldIds.length)return;setCorrectionCompletedAt(new Date().toISOString());moveTo(lessonThirtyThreeStages.length-1)}
  function reset(){stopNarration();localStorage.removeItem(KEY);localStorage.removeItem(COMPLETION_KEY);setResponses({});setSubmittedResponses(undefined);setSubmitted(false);setCompletedAt(undefined);setCorrectionFieldIds([]);setCorrectionCompletedAt(undefined);setStageIndex(0)}

  return <main className="control-work-page">
    <section className="lesson-player-shell">
      <article className={`interactive-stage control-stage ${stage.kind==='summary'?'stage-summary':''}`} data-stage-id={stage.id}>
        <div className="stage-copy"><span className="stage-eyebrow">{stage.eyebrow}</span><h2>{stage.title}</h2><p>{stage.body}</p></div>

        {stage.kind==='intro'?<div className="control-rules"><b>Что проверяем</b><ul><li>точность письменных вычислений</li><li>свойства действий и прикидку</li><li>числовые и буквенные выражения</li><li>понимание текстовых задач</li><li>прямые и обратные задачи по формулам</li></ul><p>Во время решения подсказки и правильные ответы не показываются.</p></div>:null}

        {stage.kind==='task'?<div className="control-fields">{stageFields.map((field,index)=>{const editable=canEdit(field.id);const isCorrectionTarget=correctionMode&&correctionFieldIds.includes(field.id);return <section className={`control-field ${isCorrectionTarget?'is-correction-target':''}`} key={field.id}><label><b>{index+1}. {field.label}</b>{field.type==='input'?<input value={responses[field.id]??''} onChange={event=>setResponse(field.id,event.target.value)} placeholder={field.placeholder} disabled={!editable}/>:<div className="control-choice-grid">{field.options?.map(option=><button key={option} type="button" className={responses[field.id]===option?'selected':''} onClick={()=>setResponse(field.id,option)} disabled={!editable}>{option}</button>)}</div>}</label>{submitted&&!correctionMode?<div className={correct(field,baselineResponses[field.id]??'')?'control-answer correct':'control-answer wrong'}><b>{correct(field,baselineResponses[field.id]??'')?'Верно':'Ошибка'}</b>{!correct(field,baselineResponses[field.id]??'')?<><span>Правильный ответ: {field.answer}</span><em>{field.explanation}</em></>:null}</div>:null}{correctionMode&&isCorrectionTarget&&correct(field,responses[field.id]??'')?<div className="control-answer correct"><b>Исправлено ✓</b></div>:null}</section>})}</div>:null}

        {stage.kind==='submit'?<div className="control-submit-card"><strong>{answeredCount}/{fields.length}</strong><p>{answeredCount===fields.length?'Все 20 подпунктов заполнены. Можно сдавать работу.':'Не все подпункты заполнены. Вернись к пропущенным заданиям.'}</p><button type="button" onClick={submit} disabled={answeredCount!==fields.length||submitted}>Сдать контрольную работу</button></div>:null}

        {stage.kind==='summary'?submitted?<div className="summary-card control-summary stage-summary" data-stage-id="l33-summary-result"><div className="control-score"><span>Первичный результат</span><strong>{score}/{fields.length}</strong><b>Оценка: {grade}</b><small>Сдана{completedAt?` · ${new Date(completedAt).toLocaleDateString('ru-RU')}`:''}</small></div>{wrongFieldIds.length?<div className={`control-correction-card ${correctionCompletedAt?'is-complete':''}`}><b>{correctionCompletedAt?'Коррекция завершена ✓':`Нужно закрепить: ${wrongFieldIds.length}`}</b><p>{correctionCompletedAt?'Все ошибки первой попытки исправлены. Первичный балл сохранён и не переписан.':'Откроются только подпункты, где была ошибка. Первичный результат останется неизменным.'}</p>{!correctionCompletedAt?<button type="button" onClick={startCorrection}>Исправить только ошибки</button>:null}</div>:<div className="control-correction-card is-complete"><b>20 из 20 — все навыки подтверждены ✓</b><p>Коррекция не требуется.</p></div>}<div className="control-review-list">{fields.map((field,index)=>{const original=baselineResponses[field.id]??'';const ok=correct(field,original);const corrected=!ok&&Boolean(correctionCompletedAt)&&correct(field,responses[field.id]??'');return <section key={field.id} className={ok||corrected?'correct':'wrong'}><header><span>{index+1}</span><b>{ok?'Верно':corrected?'Исправлено':'Нужно исправить'}</b></header><p>{field.label}</p><small>Ответ при сдаче: {original||'—'}</small>{corrected?<strong>После коррекции: {responses[field.id]}</strong>:null}{!ok?<><strong>Правильный ответ: {field.answer}</strong><em>{field.explanation}</em></>:null}</section>})}</div><button className="control-reset" type="button" onClick={reset}>Пройти контрольную заново</button></div>:<div className="control-submit-card"><strong>Результат закрыт</strong><p>Сначала заполни задания и сдай работу.</p></div>:null}
      </article>

      {correctionMode&&stage.kind==='task'?<nav className="lesson-controls control-correction-controls" aria-label="Навигация коррекции"><button type="button" onClick={()=>moveTo(correctionStageIndexes[Math.max(0,correctionPosition-1)]??stageIndex)} disabled={correctionPosition<=0}>← Предыдущая ошибка</button><span>Коррекция {correctionPosition+1} / {correctionStageIndexes.length}</span>{correctionPosition<correctionStageIndexes.length-1?<button className="primary" type="button" onClick={()=>moveTo(correctionStageIndexes[correctionPosition+1])} disabled={!stageComplete}>Следующая ошибка →</button>:<button className="primary" type="button" onClick={finishCorrection} disabled={correctionCorrectCount!==correctionFieldIds.length}>Завершить коррекцию ✓</button>}</nav>:<nav className="lesson-controls" aria-label="Навигация контрольной работы"><button type="button" onClick={()=>moveTo(stageIndex-1)} disabled={stageIndex===0}>← Назад</button><span>Этап {stageIndex+1} из {lessonThirtyThreeStages.length}</span>{stageIndex<lessonThirtyThreeStages.length-1?<button className="primary" type="button" onClick={()=>moveTo(stageIndex+1)} disabled={stage.kind==='task'&&!stageComplete}>Далее →</button>:<button className="primary" type="button" onClick={()=>moveTo(11)}>К сдаче</button>}</nav>}
    </section>
  </main>;
}
