import {useEffect,useMemo,useState} from 'react';
import {loadLessonTiming} from './lessonTiming';
import './lessonPlayer.css';
import './controlWork.css';
import './controlWorkThree.css';

type FieldType='input'|'angle-names'|'angle-pair';
type ControlField={id:string;number:string;label:string;type:FieldType;answer:string;accepted?:string[];placeholder?:string;explanation:string};
export type ControlWorkThreeStage={id:string;title:string;eyebrow:string;kind:'intro'|'task'|'submit'|'summary';body:string;fieldIds?:string[]};
type Saved={version:1;stageIndex:number;responses:Record<string,string>;rayAngle:number;rayTouched:boolean;submitted:boolean;completedAt?:string;submittedResponses?:Record<string,string>;submittedRayAngle?:number;correctionFieldIds?:string[];correctionCompletedAt?:string};
type StageJumpDetail={lessonNumber?:number;stageIndex?:number};

const KEY='mathnikita-lesson-53-control-v1';
const COMPLETION_KEY='mathnikita:lesson-complete:53';
const DEFAULT_RAY_ANGLE=31;
const TOTAL_ANGLE=74;

const fields:ControlField[]=[
  {id:'l53-1a',number:'1а',type:'angle-names',label:'Запиши названия двух углов, на которые луч KC разделил угол MKA.',answer:'∠MKC, ∠CKA',placeholder:'Например: ∠MKC, ∠CKA',explanation:'Луч KC образует с лучами KM и KA углы ∠MKC и ∠CKA. Названия можно записать в обратном порядке.'},
  {id:'l53-1b',number:'1б',type:'angle-pair',label:'Измерь оба образовавшихся угла и запиши их градусные меры.',answer:'зависит от положения луча KC',explanation:'Сумма ∠MKC и ∠CKA должна быть равна исходным 74°.'},
  {id:'l53-2a',number:'2а',type:'input',label:'x + 37 = 81',answer:'44',placeholder:'x =',explanation:'x = 81 − 37 = 44. Проверка: 44 + 37 = 81.'},
  {id:'l53-2b',number:'2б',type:'input',label:'150 − x = 98',answer:'52',placeholder:'x =',explanation:'x = 150 − 98 = 52. Проверка: 150 − 52 = 98.'},
  {id:'l53-3',number:'3',type:'input',label:'Периметр треугольника, см',answer:'52',accepted:['52 см'],placeholder:'Ответ',explanation:'Вторая сторона: 24 : 4 = 6 см. Третья: 6 + 16 = 22 см. Периметр: 24 + 6 + 22 = 52 см.'},
  {id:'l53-4a',number:'4а',type:'input',label:'(34 + x) − 83 = 42',answer:'91',placeholder:'x =',explanation:'34 + x = 42 + 83 = 125, поэтому x = 125 − 34 = 91.'},
  {id:'l53-4b',number:'4б',type:'input',label:'45 − (x − 16) = 28',answer:'33',placeholder:'x =',explanation:'x − 16 = 45 − 28 = 17, поэтому x = 17 + 16 = 33.'},
  {id:'l53-5',number:'5',type:'input',label:'Градусная мера ∠DBE',answer:'102',accepted:['102°'],placeholder:'Ответ в градусах',explanation:'∠EBC = 180° − 154° = 26°. Тогда ∠DBE = 128° − 26° = 102°.'},
  {id:'l53-6',number:'6',type:'input',label:'Значение числа a',answer:'68',placeholder:'a =',explanation:'Подставляем x = 40: 52 − (a − 40) = 24. Тогда a − 40 = 28, откуда a = 68.'},
];

const fieldById=new Map(fields.map(field=>[field.id,field]));

export const lessonFiftyThreeStages:ControlWorkThreeStage[]=[
  {id:'l53-rules',kind:'intro',eyebrow:'Контрольная работа № 3 · вариант 1',title:'Правила самостоятельной работы',body:'6 заданий · 9 оцениваемых ответов · ориентир 45 минут. Правильные ответы и разбор появятся только после сдачи всей работы.'},
  {id:'l53-task1',kind:'task',eyebrow:'Задание 1 из 6',title:'Построение и измерение углов',body:'Построй угол MKA, градусная мера которого равна 74°. Проведи произвольный луч KC между сторонами угла. Запиши образовавшиеся углы и измерь их.' ,fieldIds:['l53-1a','l53-1b']},
  {id:'l53-task2',kind:'task',eyebrow:'Задание 2 из 6',title:'Два уравнения',body:'Реши уравнения: x + 37 = 81 и 150 − x = 98.',fieldIds:['l53-2a','l53-2b']},
  {id:'l53-task3',kind:'task',eyebrow:'Задание 3 из 6',title:'Периметр треугольника',body:'Одна сторона треугольника равна 24 см, вторая сторона в 4 раза короче первой, а третья — на 16 см длиннее второй. Вычисли периметр треугольника.',fieldIds:['l53-3']},
  {id:'l53-task4',kind:'task',eyebrow:'Задание 4 из 6',title:'Уравнения со скобками',body:'Реши уравнения: (34 + x) − 83 = 42 и 45 − (x − 16) = 28.',fieldIds:['l53-4a','l53-4b']},
  {id:'l53-task5',kind:'task',eyebrow:'Задание 5 из 6 · рисунок 21',title:'Углы на прямой ABC',body:'Из вершины развёрнутого угла ABC проведены лучи BD и BE. Известно, что ∠ABE = 154°, а ∠DBC = 128°. Вычисли градусную меру ∠DBE.',fieldIds:['l53-5']},
  {id:'l53-task6',kind:'task',eyebrow:'Задание 6 из 6',title:'Корень уравнения с параметром',body:'При каком значении числа a корнем уравнения 52 − (a − x) = 24 является число 40?',fieldIds:['l53-6']},
  {id:'l53-submit',kind:'submit',eyebrow:'Перед сдачей',title:'Финальная самопроверка',body:'Проверь построение, все девять ответов, знаки действий и градусные меры. До сдачи можно вернуться к любому заданию.'},
  {id:'l53-summary',kind:'summary',eyebrow:'Результат',title:'Контрольная работа № 3',body:'Первичный балл сохраняется неизменным. Если есть ошибки, откроется коррекция только по неверным ответам.'},
];

function normalize(value:string){return value.trim().toLowerCase().replace(/\s+/g,'').replace(/[−–—]/g,'-').replace(/°|см/g,'')}
function normalizePointLetters(value:string){return value.toUpperCase().replace(/[М]/g,'M').replace(/[К]/g,'K').replace(/[С]/g,'C').replace(/[А]/g,'A')}
function angleNames(value:string){return(normalizePointLetters(value).match(/[MKCA]{3}/g)??[]).sort()}
function anglePair(value:string){return value.split('|').map(part=>normalize(part))}
function answerFor(field:ControlField,rayAngle:number){return field.id==='l53-1b'?`${TOTAL_ANGLE-rayAngle}°, ${rayAngle}°`:field.answer}
function responseForDisplay(field:ControlField,value:string){return field.type==='angle-pair'?value.split('|').map(part=>part?`${part.replace(/°/g,'')}°`:'—').join(', '):(value||'—')}
function isAnswered(field:ControlField,response:string){if(field.type==='angle-pair'){const pair=anglePair(response);return pair.length===2&&pair.every(Boolean)}return Boolean(response.trim())}
function correct(field:ControlField,response:string,rayAngle:number){
  if(field.type==='angle-names'){const actual=angleNames(response);return actual.length===2&&actual.join('|')===['CKA','MKC'].sort().join('|')}
  if(field.type==='angle-pair'){const actual=anglePair(response);return actual.length===2&&actual[0]===String(TOTAL_ANGLE-rayAngle)&&actual[1]===String(rayAngle)}
  return[field.answer,...(field.accepted??[])].some(answer=>normalize(response)===normalize(answer));
}
function loadSaved():Saved{
  try{
    const raw=localStorage.getItem(KEY);
    if(!raw)return{version:1,stageIndex:0,responses:{},rayAngle:DEFAULT_RAY_ANGLE,rayTouched:false,submitted:false};
    const parsed=JSON.parse(raw) as Saved;
    if(parsed?.version===1)return{version:1,stageIndex:Math.max(0,Math.min(parsed.stageIndex,lessonFiftyThreeStages.length-1)),responses:parsed.responses??{},rayAngle:Math.max(10,Math.min(64,Number(parsed.rayAngle)||DEFAULT_RAY_ANGLE)),rayTouched:Boolean(parsed.rayTouched),submitted:Boolean(parsed.submitted),completedAt:parsed.completedAt,submittedResponses:parsed.submittedResponses,submittedRayAngle:parsed.submittedRayAngle,correctionFieldIds:parsed.correctionFieldIds??[],correctionCompletedAt:parsed.correctionCompletedAt};
  }catch{}
  return{version:1,stageIndex:0,responses:{},rayAngle:DEFAULT_RAY_ANGLE,rayTouched:false,submitted:false};
}

function polar(angle:number,radius:number){const radians=angle*Math.PI/180;return{x:92+Math.cos(radians)*radius,y:238-Math.sin(radians)*radius}}

function AngleConstruction({rayAngle,rayTouched,disabled,onChange}:{rayAngle:number;rayTouched:boolean;disabled:boolean;onChange:(value:number)=>void}){
  const a=polar(0,205);const m=polar(TOTAL_ANGLE,205);const c=polar(rayAngle,190);const arcStart=polar(0,134);const arcEnd=polar(TOTAL_ANGLE,134);
  const ticks=Array.from({length:75},(_,angle)=>{const major=angle%10===0;const middle=angle%5===0;const outer=polar(angle,132);const inner=polar(angle,major?116:middle?121:126);return <line key={angle} x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y} stroke={major?'#6b8295':'#b8c7d1'} strokeWidth={major?1.8:1}/>});
  return <section className="l53-angle-lab" data-source-control="3-1" data-total-angle={TOTAL_ANGLE} data-ray-angle={rayAngle} data-angle-mkc={TOTAL_ANGLE-rayAngle} data-angle-cka={rayAngle}>
    <header><b>Интерактивное построение ∠MKA = 74°</b><span>Передвинь луч KC в любое целое положение между сторонами. Затем считай обе меры по шкале транспортира.</span></header>
    <svg className="l53-angle-svg" viewBox="0 0 430 290" role="img" aria-labelledby="l53-angle-title l53-angle-desc">
      <title id="l53-angle-title">Угол MKA величиной 74 градуса с подвижным лучом KC</title><desc id="l53-angle-desc">Луч KA направлен вправо, луч KM вверх, между ними расположен подвижный луч KC и шкала транспортира.</desc>
      <path d={`M ${arcStart.x} ${arcStart.y} A 134 134 0 0 0 ${arcEnd.x} ${arcEnd.y}`} fill="none" stroke="#d8e4eb" strokeWidth="2"/>{ticks}
      {[0,10,20,30,40,50,60,70].map(angle=>{const p=polar(angle,103);return <text key={angle} x={p.x} y={p.y+4} textAnchor="middle" fontSize="10">{angle}</text>})}
      <line x1="92" y1="238" x2={a.x} y2={a.y} stroke="#233b50" strokeWidth="4" strokeLinecap="round"/>
      <line x1="92" y1="238" x2={m.x} y2={m.y} stroke="#233b50" strokeWidth="4" strokeLinecap="round"/>
      <line x1="92" y1="238" x2={c.x} y2={c.y} stroke="#d07a38" strokeWidth="4" strokeLinecap="round" data-ray-angle={rayAngle}/>
      <circle cx="92" cy="238" r="6" fill="#233b50"/><text x="72" y="260" fontSize="17">K</text>
      <text x={a.x+10} y={a.y+5} fontSize="17">A</text><text x={m.x-4} y={m.y-10} fontSize="17">M</text><text x={c.x+8} y={c.y-5} fontSize="17" fill="#b85f22">C</text>
      <path d={`M ${polar(0,47).x} ${polar(0,47).y} A 47 47 0 0 0 ${polar(TOTAL_ANGLE,47).x} ${polar(TOTAL_ANGLE,47).y}`} fill="none" stroke="#567891" strokeWidth="2"/>
      <text x="137" y="214" fontSize="13">74°</text>
    </svg>
    <label className={`l53-angle-slider ${disabled?'is-locked':''}`}><span>Положение произвольного луча KC</span><input type="range" min="10" max="64" step="1" value={rayAngle} onChange={event=>onChange(Number(event.target.value))} disabled={disabled} aria-label="Положение луча KC"/><small>{disabled?'Построение зафиксировано при сдаче.':'Двигай ползунок, пока луч не займёт выбранное тобой положение. Число на ползунке специально не показывается: измерь угол по шкале.'}</small></label>
    <span className={`control-construction-check ${rayTouched?'is-done':''}`}>{rayTouched?'✓ Луч KC проведён между сторонами':'Сначала проведи луч KC ползунком'}</span>
  </section>;
}

function TriangleConditionFigure(){return <figure className="l53-task-visual" data-triangle-condition="24|quarter|plus16"><svg className="l53-triangle-svg" viewBox="0 0 430 235" role="img" aria-labelledby="l53-triangle-title"><title id="l53-triangle-title">Треугольник со сторонами, заданными условием задачи</title><polygon points="55,190 335,190 303,120" fill="#eaf3f7" stroke="#29455b" strokeWidth="4" strokeLinejoin="round"/><text x="190" y="218" textAnchor="middle" fontSize="15">24 см</text><text x="315" y="153" fontSize="14">в 4 раза короче</text><text x="103" y="142" fontSize="14">на 16 см длиннее второй</text></svg><figcaption>Сначала найди вторую сторону, затем третью и только после этого сложи все три длины.</figcaption></figure>}

function FigureTwentyOne(){
  const b={x:220,y:220};const endpoint=(angle:number,length:number)=>({x:b.x+Math.cos(angle*Math.PI/180)*length,y:b.y-Math.sin(angle*Math.PI/180)*length});const d=endpoint(128,150);const e=endpoint(26,170);
  return <figure className="l53-task-visual" data-source-figure="21" data-angle-abe="154" data-angle-dbc="128" data-angle-dbe="102"><svg className="l53-figure-svg" viewBox="0 0 440 300" role="img" aria-labelledby="l53-fig21-title l53-fig21-desc"><title id="l53-fig21-title">Рисунок 21 к заданию 5</title><desc id="l53-fig21-desc">Точки A, B и C лежат на одной прямой. Из B выходят лучи BD вверх влево и BE вверх вправо.</desc><line x1="35" y1={b.y} x2="405" y2={b.y} stroke="#243b50" strokeWidth="4" strokeLinecap="round"/><line x1={b.x} y1={b.y} x2={d.x} y2={d.y} stroke="#355f7b" strokeWidth="4" strokeLinecap="round" data-ray-angle="128"/><line x1={b.x} y1={b.y} x2={e.x} y2={e.y} stroke="#c67435" strokeWidth="4" strokeLinecap="round" data-ray-angle="26"/><circle cx={b.x} cy={b.y} r="6" fill="#243b50"/><text x="24" y="244" fontSize="18">A</text><text x="213" y="247" fontSize="18">B</text><text x="409" y="244" fontSize="18">C</text><text x={d.x-15} y={d.y-10} fontSize="18">D</text><text x={e.x+7} y={e.y-4} fontSize="18">E</text><path d="M 170 220 A 50 50 0 0 1 264.9 198.1" fill="none" stroke="#788e9f" strokeWidth="2"/><text x="194" y="153" textAnchor="middle" fontSize="14">154°</text><path d="M 112.3 82.1 A 175 175 0 0 1 395 220" fill="none" stroke="#9fb0bc" strokeWidth="2" strokeDasharray="5 5"/><text x="315" y="105" textAnchor="middle" fontSize="14">128°</text></svg><figcaption>Рисунок 21 восстановлен по контрольной работе: A–B–C образуют развёрнутый угол; лучи BD и BE лежат в одной полуплоскости.</figcaption></figure>;
}

export function ControlWorkThreePlayer(){
  const initial=useMemo(loadSaved,[]);
  const[stageIndex,setStageIndex]=useState(initial.stageIndex);
  const[responses,setResponses]=useState<Record<string,string>>(initial.responses);
  const[rayAngle,setRayAngle]=useState(initial.rayAngle);
  const[rayTouched,setRayTouched]=useState(initial.rayTouched);
  const[submitted,setSubmitted]=useState(initial.submitted);
  const[completedAt,setCompletedAt]=useState<string|undefined>(initial.completedAt);
  const[submittedResponses,setSubmittedResponses]=useState<Record<string,string>|undefined>(initial.submittedResponses);
  const[submittedRayAngle,setSubmittedRayAngle]=useState<number|undefined>(initial.submittedRayAngle);
  const[correctionFieldIds,setCorrectionFieldIds]=useState<string[]>(initial.correctionFieldIds??[]);
  const[correctionCompletedAt,setCorrectionCompletedAt]=useState<string|undefined>(initial.correctionCompletedAt);
  const stage=lessonFiftyThreeStages[stageIndex];
  const baselineResponses=submittedResponses??(submitted?responses:{});
  const baselineRayAngle=submittedRayAngle??rayAngle;
  const answeredCount=fields.filter(field=>isAnswered(field,responses[field.id]??'')).length;
  const readyToSubmit=answeredCount===fields.length&&rayTouched;
  const score=fields.filter(field=>correct(field,baselineResponses[field.id]??'',baselineRayAngle)).length;
  const grade=score>=8?'5':score>=6?'4':score>=4?'3':'нужно повторить';
  const wrongFieldIds=submitted?fields.filter(field=>!correct(field,baselineResponses[field.id]??'',baselineRayAngle)).map(field=>field.id):[];
  const correctionMode=submitted&&correctionFieldIds.length>0&&!correctionCompletedAt;
  const correctionCorrectCount=correctionFieldIds.filter(id=>{const field=fieldById.get(id);return Boolean(field&&correct(field,responses[id]??'',baselineRayAngle))}).length;
  const correctionStageIndexes=lessonFiftyThreeStages.map((item,index)=>({item,index})).filter(({item})=>item.kind==='task'&&item.fieldIds?.some(id=>correctionFieldIds.includes(id))).map(({index})=>index);
  const correctionPosition=correctionStageIndexes.indexOf(stageIndex);
  const stageFields=(stage.fieldIds??[]).map(id=>fieldById.get(id)).filter(Boolean) as ControlField[];
  const stageComplete=correctionMode?stageFields.filter(field=>correctionFieldIds.includes(field.id)).every(field=>correct(field,responses[field.id]??'',baselineRayAngle)):stageFields.every(field=>isAnswered(field,responses[field.id]??''))&&(stage.id!=='l53-task1'||rayTouched);

  useEffect(()=>{localStorage.setItem(KEY,JSON.stringify({version:1,stageIndex,responses,rayAngle,rayTouched,submitted,completedAt,submittedResponses,submittedRayAngle,correctionFieldIds,correctionCompletedAt} satisfies Saved))},[stageIndex,responses,rayAngle,rayTouched,submitted,completedAt,submittedResponses,submittedRayAngle,correctionFieldIds,correctionCompletedAt]);
  useEffect(()=>{const go=(event:Event)=>{const detail=(event as CustomEvent<StageJumpDetail>).detail;if(detail?.lessonNumber!==53||typeof detail.stageIndex!=='number')return;moveTo(detail.stageIndex)};window.addEventListener('mathnikita-go-to-stage',go);return()=>window.removeEventListener('mathnikita-go-to-stage',go)},[]);

  function stopNarration(){window.dispatchEvent(new CustomEvent('mathnikita-stop-narration'));if('speechSynthesis'in window)window.speechSynthesis.cancel()}
  function moveTo(index:number){stopNarration();setStageIndex(Math.max(0,Math.min(index,lessonFiftyThreeStages.length-1)));window.scrollTo({top:0,behavior:'smooth'})}
  function canEdit(id:string){return!submitted||(correctionMode&&correctionFieldIds.includes(id))}
  function setResponse(id:string,value:string){if(canEdit(id))setResponses(previous=>({...previous,[id]:value}))}
  function setPairPart(id:string,index:number,value:string){const pair=(responses[id]??'|').split('|');while(pair.length<2)pair.push('');pair[index]=value.replace(/[^0-9]/g,'');setResponse(id,pair.slice(0,2).join('|'))}
  function updateRay(value:number){if(submitted)return;setRayAngle(value);setRayTouched(true);setResponses(previous=>({...previous,'l53-1b':'|'}))}
  function submit(){
    if(!readyToSubmit||submitted)return;
    const now=new Date().toISOString();const snapshot={...responses};const activeSeconds=Math.round(loadLessonTiming(53).activeSeconds);
    setSubmittedResponses(snapshot);setSubmittedRayAngle(rayAngle);setSubmitted(true);setCompletedAt(now);setCorrectionFieldIds([]);setCorrectionCompletedAt(undefined);moveTo(lessonFiftyThreeStages.length-1);
    localStorage.setItem(COMPLETION_KEY,JSON.stringify({completedAt:now,activeSeconds}));
    window.dispatchEvent(new CustomEvent('mathnikita-lesson-completed',{detail:{lessonNumber:53,completedAt:now,activeSeconds}}));
  }
  function startCorrection(){if(!wrongFieldIds.length)return;const indexes=lessonFiftyThreeStages.map((item,index)=>({item,index})).filter(({item})=>item.kind==='task'&&item.fieldIds?.some(id=>wrongFieldIds.includes(id))).map(({index})=>index);setCorrectionFieldIds(wrongFieldIds);setCorrectionCompletedAt(undefined);moveTo(indexes[0]??lessonFiftyThreeStages.length-1)}
  function finishCorrection(){if(!correctionFieldIds.length||correctionCorrectCount!==correctionFieldIds.length)return;setCorrectionCompletedAt(new Date().toISOString());moveTo(lessonFiftyThreeStages.length-1)}
  function reset(){stopNarration();localStorage.removeItem(KEY);localStorage.removeItem(COMPLETION_KEY);setResponses({});setRayAngle(DEFAULT_RAY_ANGLE);setRayTouched(false);setSubmittedResponses(undefined);setSubmittedRayAngle(undefined);setSubmitted(false);setCompletedAt(undefined);setCorrectionFieldIds([]);setCorrectionCompletedAt(undefined);setStageIndex(0)}

  return <main className="control-work-page control-three-page" data-control-work="3" data-source-reference="Мерзляк · методическое пособие · контрольная работа № 3 · вариант 1 · страница 274">
    <section className="lesson-player-shell">
      <div className="control-work-status"><div><span>Контрольная работа № 3</span><b>{submitted?`Первичный балл ${score}/${fields.length}`:`Заполнено ${answeredCount}/${fields.length}`}</b></div><div className="control-progress"><i style={{width:`${((stageIndex+1)/lessonFiftyThreeStages.length)*100}%`}}/></div></div>
      <nav className="control-page-jump control-three-page-jump" aria-label="Страницы контрольной работы">{lessonFiftyThreeStages.map((item,index)=><button key={item.id} type="button" className={`${index===stageIndex?'active':''} ${correctionMode&&correctionStageIndexes.includes(index)?'correction-target':''}`} onClick={()=>moveTo(index)} disabled={(item.kind==='summary'&&!submitted)||(correctionMode&&item.kind==='task'&&!correctionStageIndexes.includes(index))}><span>{index+1}</span><b>{item.kind==='intro'?'Правила':item.kind==='submit'?'Сдача':item.kind==='summary'?'Итог':`Задание ${index}`}</b></button>)}</nav>
      <article className={`interactive-stage control-stage ${stage.kind==='summary'?'stage-summary':''}`} data-stage-id={stage.id}>
        <div className="stage-copy"><span className="stage-eyebrow">{stage.eyebrow}</span><h2>{stage.title}</h2><p>{stage.body}</p></div>
        {stage.kind==='intro'?<><div className="control-source-badge"><b>Точный источник</b><span>А. Г. Мерзляк и др., методическое пособие, контрольная работа № 3 «Уравнение. Угол. Многоугольники», вариант 1, с. 274.</span></div><div className="control-rules-card"><b>Во время работы</b><ul><li>заполняй ответы самостоятельно и в любом удобном порядке;</li><li>для задания 1 сначала передвинь луч KC, затем измерь оба угла;</li><li>подсказки, наставник и мгновенная проверка отключены;</li><li>после сдачи первичный балл уже не изменяется.</li></ul><p>Если останутся ошибки, система откроет только их — без повторного прохождения всей контрольной.</p></div></>:null}
        {stage.id==='l53-task1'?<AngleConstruction rayAngle={rayAngle} rayTouched={rayTouched} disabled={submitted} onChange={updateRay}/>:null}
        {stage.id==='l53-task2'?<div className="l53-equations" aria-hidden="true"><span>x + 37 = 81</span><span>150 − x = 98</span></div>:null}
        {stage.id==='l53-task3'?<TriangleConditionFigure/>:null}
        {stage.id==='l53-task4'?<div className="l53-equations" aria-hidden="true"><span>(34 + x) − 83 = 42</span><span>45 − (x − 16) = 28</span></div>:null}
        {stage.id==='l53-task5'?<FigureTwentyOne/>:null}
        {stage.kind==='task'?<div className="control-field-list">{stageFields.map(field=>{const editable=canEdit(field.id);const isCorrectionTarget=correctionMode&&correctionFieldIds.includes(field.id);const baselineOk=correct(field,baselineResponses[field.id]??'',baselineRayAngle);const currentlyCorrect=correct(field,responses[field.id]??'',baselineRayAngle);return <section className={`control-field ${isCorrectionTarget?'is-correction-target':''}`} data-control-field={field.id} key={field.id}><p className="control-field-label"><b>{field.number}. {field.label}</b></p>{field.type==='angle-pair'?<div className="l53-angle-pair"><label htmlFor={`${field.id}-mkc`}><span>∠MKC, градусов</span><input id={`${field.id}-mkc`} className="control-input" inputMode="numeric" value={(responses[field.id]??'|').split('|')[0]??''} onChange={event=>setPairPart(field.id,0,event.target.value)} disabled={!editable}/></label><label htmlFor={`${field.id}-cka`}><span>∠CKA, градусов</span><input id={`${field.id}-cka`} className="control-input" inputMode="numeric" value={(responses[field.id]??'|').split('|')[1]??''} onChange={event=>setPairPart(field.id,1,event.target.value)} disabled={!editable}/></label></div>:<label htmlFor={field.id}><span className="sr-only">{field.label}</span><input id={field.id} className="control-input" value={responses[field.id]??''} onChange={event=>setResponse(field.id,event.target.value)} placeholder={field.placeholder} disabled={!editable} autoComplete="off"/></label>}{submitted&&!correctionMode?<div className={baselineOk?'control-answer correct':'control-answer wrong'}><b>{baselineOk?'Верно':'Ошибка'}</b>{!baselineOk?<><span>Правильный ответ: {answerFor(field,baselineRayAngle)}</span><em>{field.explanation}</em></>:null}</div>:null}{correctionMode&&isCorrectionTarget?<div className={currentlyCorrect?'control-correction-feedback is-correct':'control-correction-feedback is-pending'}>{currentlyCorrect?'Исправлено ✓':'Исправь ответ и проверь ещё раз'}</div>:null}</section>})}</div>:null}
        {stage.kind==='submit'?<div className="control-submit-card"><strong>{answeredCount}/{fields.length}</strong><p>{readyToSubmit?'Все девять ответов заполнены, а луч KC проведён. Можно сдавать работу.':!rayTouched?'В задании 1 ещё нужно провести луч KC ползунком.':'Не все ответы заполнены. Вернись к пропущенным заданиям.'}</p><button type="button" onClick={submit} disabled={!readyToSubmit||submitted}>Сдать контрольную работу</button></div>:null}
        {stage.kind==='summary'?submitted?<div className="control-summary" data-stage-id="l53-summary-result"><div className="control-score"><span>Первичный результат</span><strong>{score}/{fields.length}</strong><b>Оценка: {grade}</b><small>Сдана{completedAt?` · ${new Date(completedAt).toLocaleDateString('ru-RU')}`:''}</small></div>{wrongFieldIds.length?<div className={`control-correction-card ${correctionCompletedAt?'is-complete':''}`}><b>{correctionCompletedAt?'Коррекция завершена ✓':`Нужно исправить: ${wrongFieldIds.length}`}</b><p>{correctionCompletedAt?'Все ошибки первой попытки исправлены. Первичный балл сохранён.':'Откроются только неверные ответы. Построение и первичный результат останутся зафиксированы.'}</p>{!correctionCompletedAt?<button type="button" onClick={startCorrection}>Исправить только ошибки</button>:null}</div>:<div className="control-correction-card is-complete"><b>9 из 9 — все умения подтверждены ✓</b><p>Коррекция не требуется.</p></div>}<div className="control-review-list">{fields.map(field=>{const original=baselineResponses[field.id]??'';const ok=correct(field,original,baselineRayAngle);const corrected=!ok&&Boolean(correctionCompletedAt)&&correct(field,responses[field.id]??'',baselineRayAngle);return <section key={field.id} className={ok||corrected?'correct':'wrong'}><header><span>{field.number}</span><b>{ok?'Верно':corrected?'Исправлено':'Нужно исправить'}</b></header><p>{field.label}</p><small>Ответ при сдаче: {responseForDisplay(field,original)}</small>{corrected?<strong>После коррекции: {responseForDisplay(field,responses[field.id]??'')}</strong>:null}{!ok?<><strong>Правильный ответ: {answerFor(field,baselineRayAngle)}</strong><em>{field.explanation}</em></>:null}</section>})}</div><button className="control-reset" type="button" onClick={reset}>Пройти контрольную заново</button></div>:<div className="control-submit-card"><strong>Результат закрыт</strong><p>Сначала заполни задания и сдай работу.</p></div>:null}
      </article>
      {correctionMode&&stage.kind==='task'?<nav className="lesson-controls control-correction-controls" aria-label="Навигация коррекции"><button type="button" onClick={()=>moveTo(correctionStageIndexes[Math.max(0,correctionPosition-1)]??stageIndex)} disabled={correctionPosition<=0}>← Предыдущая ошибка</button><span>Коррекция {correctionPosition+1} / {correctionStageIndexes.length}</span>{correctionPosition<correctionStageIndexes.length-1?<button className="primary" type="button" onClick={()=>moveTo(correctionStageIndexes[correctionPosition+1])} disabled={!stageComplete}>Следующая ошибка →</button>:<button className="primary" type="button" onClick={finishCorrection} disabled={correctionCorrectCount!==correctionFieldIds.length}>Завершить коррекцию ✓</button>}</nav>:<nav className="lesson-controls" aria-label="Навигация контрольной работы"><button type="button" onClick={()=>moveTo(stageIndex-1)} disabled={stageIndex===0}>← Назад</button><span>Этап {stageIndex+1} из {lessonFiftyThreeStages.length}</span>{stageIndex<lessonFiftyThreeStages.length-2?<button className="primary" type="button" onClick={()=>moveTo(stageIndex+1)} disabled={stage.kind==='task'&&!stageComplete}>Далее →</button>:stage.kind==='submit'?<button className="primary" type="button" onClick={()=>moveTo(lessonFiftyThreeStages.length-1)} disabled={!submitted}>Результат →</button>:<button className="primary" type="button" onClick={()=>moveTo(lessonFiftyThreeStages.length-2)}>К сдаче</button>}</nav>}
    </section>
  </main>;
}
