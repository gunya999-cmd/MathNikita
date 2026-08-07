import { useEffect,useMemo,useState } from 'react';
import { loadLessonTiming } from './lessonTiming';
import './lessonPlayer.css';
import './controlWork.css';

type FieldType='input'|'choice'|'ticks'|'set';
type ControlField={id:string;label:string;type:FieldType;answer:string;accepted?:string[];options?:string[];placeholder?:string;explanation:string};
export type ControlWorkStage={id:string;title:string;eyebrow:string;kind:'intro'|'task'|'submit'|'summary';body:string;fieldIds?:string[]};
type Saved={version:1;stageIndex:number;responses:Record<string,string>;submitted:boolean;completedAt?:string;submittedResponses?:Record<string,string>;correctionFieldIds?:string[];correctionCompletedAt?:string};

const KEY='mathnikita-lesson-20-control-v1';
const COMPLETION_KEY='mathnikita:lesson-complete:20';

const fields:ControlField[]=[
  {id:'l20-1a',type:'input',label:'1) сорок два миллиарда семь миллионов три тысячи девятнадцать',answer:'42007003019',accepted:['42 007 003 019'],placeholder:'Запиши цифрами',explanation:'42 | 007 | 003 | 019 = 42 007 003 019.'},
  {id:'l20-1b',type:'input',label:'2) шестьсот пять миллионов восемьдесят тысяч пять',answer:'605080005',accepted:['605 080 005'],placeholder:'Запиши цифрами',explanation:'605 | 080 | 005 = 605 080 005.'},
  {id:'l20-1c',type:'input',label:'3) девять миллиардов сорок две тысячи сто',answer:'9000042100',accepted:['9 000 042 100'],placeholder:'Запиши цифрами',explanation:'9 | 000 | 042 | 100 = 9 000 042 100.'},
  {id:'l20-2a',type:'choice',label:'8 561 □ 8 516',answer:'>',options:['>','<','='],explanation:'Тысячи и сотни совпадают; в десятках 6 > 1.'},
  {id:'l20-2b',type:'choice',label:'28 349 □ 28 403',answer:'<',options:['>','<','='],explanation:'Первые две цифры совпадают, затем 3 < 4.'},
  {id:'l20-3',type:'ticks',label:'Отметь на координатном луче точки с координатами 2, 5, 8 и 10.',answer:'2,5,8,10',explanation:'На луче должны быть выбраны ровно отметки 2, 5, 8 и 10.'},
  {id:'l20-4a',type:'set',label:'AB = 78 мм. Точка D лежит внутри AB, AD = 31 мм. Запиши все отрезки на рисунке через запятую.',answer:'AB,AD,DB',placeholder:'Например: XY, XZ, ZY',explanation:'Точка D делит AB на AD и DB; также остаётся весь отрезок AB.'},
  {id:'l20-4b',type:'input',label:'Найди длину DB в миллиметрах.',answer:'47',placeholder:'Только число',explanation:'DB = AB − AD = 78 − 31 = 47 мм.'},
  {id:'l20-5',type:'input',label:'Точка A принадлежит отрезку BM. BA = 27 см, а AM на 8 см меньше BA. Найди BM.',answer:'46',placeholder:'Только число',explanation:'AM = 27 − 8 = 19 см; BM = BA + AM = 27 + 19 = 46 см.'},
  {id:'l20-6a',type:'input',label:'Запиши все цифры вместо *: 4 73* > 4 736.',answer:'7,8,9',accepted:['7 8 9','7;8;9','789'],placeholder:'Все цифры по возрастанию',explanation:'Единицы должны быть больше 6, поэтому подходят 7, 8 и 9.'},
  {id:'l20-6b',type:'input',label:'Запиши все цифры вместо *: 2 5*4 < 2 563.',answer:'0,1,2,3,4,5',accepted:['0 1 2 3 4 5','0;1;2;3;4;5','012345'],placeholder:'Все цифры по возрастанию',explanation:'Цифра десятков должна быть меньше 6. При *=6 получаем 2 564 > 2 563.'},
  {id:'l20-7',type:'input',label:'OP = 56 см. На отрезке отмечены M и N: OM = 25 см, NP = 39 см. Отрезки OM и NP перекрываются. Найди MN.',answer:'8',placeholder:'Только число',explanation:'Перекрытие равно OM + NP − OP = 25 + 39 − 56 = 8 см.'},
  {id:'l20-8a',type:'choice',label:'9 км □ 8 960 м',answer:'>',options:['>','<','='],explanation:'9 км = 9 000 м, а 9 000 > 8 960.'},
  {id:'l20-8b',type:'choice',label:'72 см □ 719 мм',answer:'>',options:['>','<','='],explanation:'72 см = 720 мм, а 720 > 719.'},
];

const fieldById=new Map(fields.map(field=>[field.id,field]));

export const lessonTwentyStages:ControlWorkStage[]=[
  {id:'l20-rules',kind:'intro',eyebrow:'Контрольная работа № 1',title:'Правила работы',body:'8 заданий · 14 оцениваемых подпунктов · ориентир 45 минут. Решай самостоятельно. Правильность ответов и разбор появятся только после сдачи всей работы.'},
  {id:'l20-task1',kind:'task',eyebrow:'Задание 1 из 8',title:'Запись многозначных чисел',body:'Запиши каждое число цифрами. Особенно внимательно следи за нулевыми разрядами.',fieldIds:['l20-1a','l20-1b','l20-1c']},
  {id:'l20-task2',kind:'task',eyebrow:'Задание 2 из 8',title:'Сравнение натуральных чисел',body:'Поставь знак >, < или =.',fieldIds:['l20-2a','l20-2b']},
  {id:'l20-task3',kind:'task',eyebrow:'Задание 3 из 8',title:'Координатный луч',body:'Нажми на нужные отметки. Можно снять отметку повторным нажатием.',fieldIds:['l20-3']},
  {id:'l20-task4',kind:'task',eyebrow:'Задание 4 из 8',title:'Отрезок и его части',body:'Работай с рисунком A—D—B и длинами в миллиметрах.',fieldIds:['l20-4a','l20-4b']},
  {id:'l20-task5',kind:'task',eyebrow:'Задание 5 из 8',title:'Текстовая задача на отрезки',body:'Сначала найди AM, затем весь BM.',fieldIds:['l20-5']},
  {id:'l20-task6',kind:'task',eyebrow:'Задание 6 из 8',title:'Цифра в неравенстве',body:'В каждом подпункте запиши все возможные цифры, а не одну.',fieldIds:['l20-6a','l20-6b']},
  {id:'l20-task7',kind:'task',eyebrow:'Задание 7 из 8',title:'Перекрывающиеся отрезки',body:'Две части отрезка перекрываются. Найди длину общей части MN.',fieldIds:['l20-7']},
  {id:'l20-task8',kind:'task',eyebrow:'Задание 8 из 8',title:'Сравнение величин',body:'Перед сравнением вырази длины в одинаковых единицах.',fieldIds:['l20-8a','l20-8b']},
  {id:'l20-submit',kind:'submit',eyebrow:'Перед сдачей',title:'Проверь заполнение',body:'Вернись к заданиям, если хочешь что-то перепроверить. После сдачи ответы блокируются и откроется подробный разбор.'},
  {id:'l20-summary',kind:'summary',eyebrow:'Результат',title:'Контрольная работа № 1',body:'Результат показывает, какие темы главы 1 уже устойчивы, а какие стоит коротко повторить.'},
];

function normalize(value:string){return value.trim().toLowerCase().replace(/\s+/g,'').replace(/[−–—]/g,'-')}
function normalizeSet(value:string){return value.toUpperCase().split(/[\s,;]+/).map(item=>item.trim()).filter(Boolean).sort().join(',')}
function correct(field:ControlField,response:string){
  if(field.type==='set')return normalizeSet(response)===normalizeSet(field.answer);
  const candidates=[field.answer,...(field.accepted??[])];
  return candidates.some(answer=>normalize(response)===normalize(answer));
}
function loadSaved():Saved{
  try{
    const raw=localStorage.getItem(KEY);if(!raw)return{version:1,stageIndex:0,responses:{},submitted:false};
    const parsed=JSON.parse(raw) as Saved;
    if(parsed?.version===1)return{version:1,stageIndex:Math.max(0,Math.min(parsed.stageIndex,lessonTwentyStages.length-1)),responses:parsed.responses??{},submitted:Boolean(parsed.submitted),completedAt:parsed.completedAt,submittedResponses:parsed.submittedResponses,correctionFieldIds:parsed.correctionFieldIds??[],correctionCompletedAt:parsed.correctionCompletedAt};
  }catch{}
  return{version:1,stageIndex:0,responses:{},submitted:false};
}

export function ControlWorkOnePlayer(){
  const initial=useMemo(loadSaved,[]);
  const[stageIndex,setStageIndex]=useState(initial.stageIndex);
  const[responses,setResponses]=useState<Record<string,string>>(initial.responses);
  const[submitted,setSubmitted]=useState(initial.submitted);
  const[completedAt,setCompletedAt]=useState<string|undefined>(initial.completedAt);
  const[submittedResponses,setSubmittedResponses]=useState<Record<string,string>|undefined>(initial.submittedResponses);
  const[correctionFieldIds,setCorrectionFieldIds]=useState<string[]>(initial.correctionFieldIds??[]);
  const[correctionCompletedAt,setCorrectionCompletedAt]=useState<string|undefined>(initial.correctionCompletedAt);
  const stage=lessonTwentyStages[stageIndex];
  const answeredCount=fields.filter(field=>Boolean(responses[field.id]?.trim())).length;
  const baselineResponses=submittedResponses??(submitted?responses:{});
  const score=fields.filter(field=>correct(field,baselineResponses[field.id]??'')).length;
  const grade=score>=13?'5':score>=10?'4':score>=7?'3':'нужно повторить';
  const wrongFieldIds=submitted?fields.filter(field=>!correct(field,baselineResponses[field.id]??'')).map(field=>field.id):[];
  const correctionMode=submitted&&correctionFieldIds.length>0&&!correctionCompletedAt;
  const correctionCorrectCount=correctionFieldIds.filter(id=>{const field=fieldById.get(id);return Boolean(field&&correct(field,responses[id]??''))}).length;
  const correctionStageIndexes=lessonTwentyStages.map((item,index)=>({item,index})).filter(({item})=>item.kind==='task'&&item.fieldIds?.some(id=>correctionFieldIds.includes(id))).map(({index})=>index);
  const correctionPosition=correctionStageIndexes.indexOf(stageIndex);
  const stageFields=(stage.fieldIds??[]).map(id=>fieldById.get(id)).filter(Boolean) as ControlField[];
  const stageComplete=correctionMode
    ? stageFields.filter(field=>correctionFieldIds.includes(field.id)).every(field=>correct(field,responses[field.id]??''))
    : stageFields.every(field=>Boolean(responses[field.id]?.trim()));

  useEffect(()=>{localStorage.setItem(KEY,JSON.stringify({version:1,stageIndex,responses,submitted,completedAt,submittedResponses,correctionFieldIds,correctionCompletedAt} satisfies Saved))},[stageIndex,responses,submitted,completedAt,submittedResponses,correctionFieldIds,correctionCompletedAt]);
  useEffect(()=>{
    const go=(event:Event)=>{
      const detail=(event as CustomEvent<{lessonNumber:number;stageIndex:number}>).detail;
      if(detail?.lessonNumber!==20)return;
      setStageIndex(Math.max(0,Math.min(detail.stageIndex,lessonTwentyStages.length-1)));
    };
    window.addEventListener('mathnikita-go-to-stage',go);return()=>window.removeEventListener('mathnikita-go-to-stage',go);
  },[]);

  function canEdit(id:string){return!submitted||(correctionMode&&correctionFieldIds.includes(id))}
  function setResponse(id:string,value:string){if(canEdit(id))setResponses(previous=>({...previous,[id]:value}))}
  function toggleTick(id:string,tick:number){
    if(!canEdit(id))return;
    const current=(responses[id]??'').split(',').filter(Boolean).map(Number);
    const next=current.includes(tick)?current.filter(item=>item!==tick):[...current,tick];
    setResponse(id,next.sort((a,b)=>a-b).join(','));
  }
  function submit(){
    if(answeredCount!==fields.length)return;
    const now=new Date().toISOString();const snapshot={...responses};const activeSeconds=Math.round(loadLessonTiming(20).activeSeconds);
    setSubmittedResponses(snapshot);setSubmitted(true);setCompletedAt(now);setCorrectionFieldIds([]);setCorrectionCompletedAt(undefined);setStageIndex(lessonTwentyStages.length-1);
    localStorage.setItem(COMPLETION_KEY,JSON.stringify({completedAt:now,activeSeconds}));
    window.dispatchEvent(new CustomEvent('mathnikita-lesson-completed',{detail:{lessonNumber:20,completedAt:now,activeSeconds}}));
  }
  function startCorrection(){
    if(!wrongFieldIds.length)return;
    const indexes=lessonTwentyStages.map((item,index)=>({item,index})).filter(({item})=>item.kind==='task'&&item.fieldIds?.some(id=>wrongFieldIds.includes(id))).map(({index})=>index);
    setCorrectionFieldIds(wrongFieldIds);setCorrectionCompletedAt(undefined);setStageIndex(indexes[0]??lessonTwentyStages.length-1);
  }
  function finishCorrection(){
    if(!correctionFieldIds.length||correctionCorrectCount!==correctionFieldIds.length)return;
    setCorrectionCompletedAt(new Date().toISOString());setStageIndex(lessonTwentyStages.length-1);
  }
  function reset(){localStorage.removeItem(KEY);localStorage.removeItem(COMPLETION_KEY);setResponses({});setSubmittedResponses(undefined);setSubmitted(false);setCompletedAt(undefined);setCorrectionFieldIds([]);setCorrectionCompletedAt(undefined);setStageIndex(0)}

  return <main className="control-work-page">
    <section className="lesson-player-shell">
      <header className="control-work-status"><div><span>{correctionMode?'Коррекция контрольной № 1':'Контрольная работа № 1'}</span><b>{correctionMode?`Исправлено ${correctionCorrectCount} из ${correctionFieldIds.length}`:submitted?'Работа сдана':`Заполнено ${answeredCount} из ${fields.length}`}</b></div><div className="control-progress"><i style={{width:`${correctionMode?(correctionFieldIds.length?correctionCorrectCount/correctionFieldIds.length*100:100):answeredCount/fields.length*100}%`}}/></div></header>
      <nav className="control-page-jump" aria-label="Быстрый переход по контрольной">{lessonTwentyStages.map((item,index)=>{const correctionTarget=Boolean(item.kind==='task'&&item.fieldIds?.some(id=>correctionFieldIds.includes(id)));return <button type="button" key={item.id} className={`${index===stageIndex?'active':''} ${correctionMode&&correctionTarget?'correction-target':''}`} onClick={()=>setStageIndex(index)} disabled={correctionMode&&!correctionTarget}><span>{index+1}</span><b>{item.kind==='task'?`Задание ${index}`:item.kind==='intro'?'Правила':item.kind==='submit'?'Сдача':'Результат'}</b></button>})}</nav>
      <article className={`interactive-stage control-stage is-${stage.kind} ${correctionMode?'is-correction':''}`} data-stage-id={stage.id}>
        <div className="stage-copy"><span>{correctionMode?'Коррекция · только ошибки':stage.eyebrow}</span><h2>{stage.title}</h2><p>{correctionMode?'Исправь только ошибочные подпункты этого задания. Правильные ответы первой попытки сохранены и заблокированы.':stage.body}</p></div>

        {stage.kind==='intro'?<div className="control-rules-card"><b>Во время работы</b><ul><li>Подсказки и мгновенная проверка отключены.</li><li>Можно возвращаться к любому заданию до сдачи.</li><li>Черновик на бумаге разрешён и полезен для геометрии.</li><li>После сдачи увидишь 14-балльный результат и разбор ошибок.</li></ul></div>:null}

        {stage.kind==='task'?<div className="control-field-list">{stageFields.map(field=>{const correctionTarget=correctionMode&&correctionFieldIds.includes(field.id);const correctionOk=correctionTarget&&correct(field,responses[field.id]??'');return <section className={`control-field ${correctionTarget?'is-correction-target':''}`} key={field.id} data-control-field={field.id}><label>{field.label}</label>
          {field.type==='choice'?<div className="control-choice-grid">{field.options?.map(option=><button type="button" key={option} className={responses[field.id]===option?'selected':''} onClick={()=>setResponse(field.id,option)} disabled={!canEdit(field.id)}>{option}</button>)}</div>:
          field.type==='ticks'?<div className="control-ray" aria-label="Координатный луч"><div className="control-ray-line"/>{Array.from({length:11},(_,tick)=>{const selected=(responses[field.id]??'').split(',').includes(String(tick));return <button type="button" key={tick} data-control-tick={tick} className={selected?'selected':''} onClick={()=>toggleTick(field.id,tick)} disabled={!canEdit(field.id)}><i/><span>{tick}</span></button>})}</div>:
          <input className="control-input" value={responses[field.id]??''} onChange={event=>setResponse(field.id,event.target.value)} placeholder={field.placeholder} disabled={!canEdit(field.id)}/>}          
          {correctionTarget?<div className={`control-correction-feedback ${correctionOk?'is-correct':'is-pending'}`}>{correctionOk?'Исправлено ✓':'Сверь ход решения с разбором и исправь ответ.'}</div>:null}
        </section>})}</div>:null}

        {stage.id==='l20-task4'?<div className="control-segment-visual" aria-label="Отрезок A D B"><span>A</span><i/><span>D</span><i className="long"/><span>B</span></div>:null}
        {stage.id==='l20-task7'?<div className="control-overlap-visual"><span>O</span><i className="whole"/><b>N</b><i className="overlap"/><b>M</b><i className="whole"/><span>P</span></div>:null}

        {stage.kind==='submit'?<div className="control-submit-card"><strong>{answeredCount}/{fields.length}</strong><p>{answeredCount===fields.length?'Все подпункты заполнены. Можно сдавать работу.':'Не все подпункты заполнены. Вернись к пропущенным заданиям.'}</p><button type="button" onClick={submit} disabled={answeredCount!==fields.length||submitted}>Сдать контрольную работу</button></div>:null}

        {stage.kind==='summary'?submitted?<div className="summary-card control-summary"><div className="control-score"><span>Первичный результат</span><strong>{score}/{fields.length}</strong><b>Оценка: {grade}</b><small>Сдана{completedAt?` · ${new Date(completedAt).toLocaleDateString('ru-RU')}`:''}</small></div>{wrongFieldIds.length?<div className={`control-correction-card ${correctionCompletedAt?'is-complete':''}`}><b>{correctionCompletedAt?'Коррекция завершена ✓':`Нужно закрепить ${wrongFieldIds.length} ${wrongFieldIds.length===1?'подпункт':'подпункта'}`}</b><p>{correctionCompletedAt?'Все ошибки первой попытки исправлены. Первичный балл сохранён отдельно и не переписан.':'Не нужно проходить всю контрольную заново. Откроются только те подпункты, где была ошибка.'}</p>{!correctionCompletedAt?<button type="button" onClick={startCorrection}>Исправить только ошибки</button>:null}</div>:<div className="control-correction-card is-complete"><b>Все навыки подтверждены ✓</b><p>Коррекция не требуется.</p></div>}<div className="control-review-list">{fields.map((field,index)=>{const original=baselineResponses[field.id]??'';const ok=correct(field,original);const corrected=!ok&&Boolean(correctionCompletedAt)&&correct(field,responses[field.id]??'');return <section key={field.id} className={ok||corrected?'correct':'wrong'}><header><span>{index+1}</span><b>{ok?'Верно':corrected?'Исправлено':'Нужно исправить'}</b></header><p>{field.label}</p><small>Ответ при сдаче: {original||'—'}</small>{corrected?<strong>После коррекции: {responses[field.id]}</strong>:null}{!ok?<><strong>Правильный ответ: {field.answer}</strong><em>{field.explanation}</em></>:null}</section>})}</div><button className="control-reset" type="button" onClick={reset}>Пройти контрольную заново</button></div>:<div className="control-submit-card"><strong>Результат закрыт</strong><p>Сначала заполни задания 1–8 и сдай работу.</p></div>:null}
      </article>

      {correctionMode&&stage.kind==='task'?<nav className="lesson-controls control-correction-controls" aria-label="Навигация коррекции"><button type="button" onClick={()=>setStageIndex(correctionStageIndexes[Math.max(0,correctionPosition-1)]??stageIndex)} disabled={correctionPosition<=0}>← Предыдущая ошибка</button><span>Коррекция {correctionPosition+1} / {correctionStageIndexes.length}</span>{correctionPosition<correctionStageIndexes.length-1?<button className="primary" type="button" onClick={()=>setStageIndex(correctionStageIndexes[correctionPosition+1])} disabled={!stageComplete}>Следующая ошибка →</button>:<button className="primary" type="button" onClick={finishCorrection} disabled={correctionCorrectCount!==correctionFieldIds.length}>Завершить коррекцию ✓</button>}</nav>:<nav className="lesson-controls" aria-label="Навигация контрольной работы"><button type="button" onClick={()=>setStageIndex(value=>Math.max(0,value-1))} disabled={stageIndex===0}>← Назад</button><span>{stageIndex+1} / {lessonTwentyStages.length}</span>{stageIndex<lessonTwentyStages.length-1?<button className="primary" type="button" onClick={()=>setStageIndex(value=>Math.min(lessonTwentyStages.length-1,value+1))} disabled={stage.kind==='task'&&!stageComplete}>Далее →</button>:<button className="primary" type="button" onClick={()=>setStageIndex(9)}>К сдаче</button>}</nav>}
    </section>
  </main>;
}
