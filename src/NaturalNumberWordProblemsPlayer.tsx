import {useEffect,useMemo,useState} from 'react';
import './lessonPlayer.css';
import './theoryExperience.css';

type StepKind='theory'|'example'|'practice'|'control'|'olympiad'|'summary';
type Step={id:string;kind:StepKind;title:string;text:string;question?:string;answer?:string;hint?:string};
type Saved={version:1;stageIndex:number;responses:Record<string,string>;checked:Record<string,boolean>;results:Record<string,boolean>};
type StageJumpDetail={lessonNumber?:number;stageIndex?:number};

const steps:Step[]=[
  {id:'l29-model',kind:'theory',title:'Текст — это модель',text:'Сначала выясни смысл каждого числа: что было, что изменилось и что нужно найти.'},
  {id:'l29-example-add',kind:'example',title:'Одно действие',text:'Было 1 250 книг, привезли 375.',question:'Сколько стало?',answer:'1625',hint:'Количество увеличилось.'},
  {id:'l29-remainder',kind:'theory',title:'Остаток',text:'Если часть ушла, остаток находим вычитанием. Проверка: остаток + ушедшая часть = исходное целое.'},
  {id:'l29-example-subtract',kind:'example',title:'Отправка',text:'Было 2 400 коробок, отправили 685.',question:'Сколько осталось?',answer:'1715',hint:'Вычти отправленное.'},
  {id:'l29-difference-model',kind:'theory',title:'На сколько больше?',text:'Для сравнения двух количеств из большего вычитают меньшее.'},
  {id:'l29-practice-difference',kind:'practice',title:'Сравнение',text:'В школах 1 480 и 1 125 учеников.',question:'На сколько больше в первой?',answer:'355',hint:'1 480 − 1 125.'},
  {id:'l29-two-actions',kind:'theory',title:'Два действия',text:'Сначала найди промежуточную величину, затем используй её для главного ответа.'},
  {id:'l29-example-two-changes',kind:'example',title:'Два изменения',text:'Было 3 200 посетителей. Ушли 875, пришли 460.',question:'Сколько стало?',answer:'2785',hint:'Сначала −875, затем +460.'},
  {id:'l29-practice-bus',kind:'practice',title:'Автобус',text:'Было 46 пассажиров. Вышли 18, вошли 27.',question:'Сколько стало?',answer:'55',hint:'46 − 18 + 27.'},
  {id:'l29-practice-shop',kind:'practice',title:'Магазин',text:'Было 5 000 тетрадей. Продали 1 275, привезли 900.',question:'Сколько стало?',answer:'4625',hint:'5 000 − 1 275 + 900.'},
  {id:'l29-extra-data-model',kind:'theory',title:'Лишние данные',text:'Число, которое не помогает ответить на вопрос, в решение включать не нужно.'},
  {id:'l29-practice-park',kind:'practice',title:'Парк',text:'В парке 840 деревьев, 315 — берёзы. Парк открыт до 21:00.',question:'Сколько деревьев не берёзы?',answer:'525',hint:'Время работы лишнее.'},
  {id:'l29-check-model',kind:'theory',title:'Проверка',text:'Проверь смысл ответа, его порядок и возможность вернуть исходные данные обратным действием.'},
  {id:'l29-practice-reverse',kind:'practice',title:'Обратная задача',text:'Продали 725 билетов, осталось 1 180.',question:'Сколько было?',answer:'1905',hint:'Сложи остаток и проданное.'},
  {id:'l29-practice-expense',kind:'practice',title:'Неизвестный расход',text:'Было 8 400 баллов, осталось 6 875.',question:'Сколько потратили?',answer:'1525',hint:'Начальное минус остаток.'},
  {id:'l29-practice-three-actions',kind:'practice',title:'Три действия',text:'Утром пришли 2 350 человек, днём 1 480, затем ушли 965.',question:'Сколько осталось?',answer:'2865',hint:'Сложи пришедших и вычти ушедших.'},
  {id:'l29-control-1',kind:'control',title:'Контроль 1/5',text:'Было 6 250 кг, отгрузили 1 875 кг.',question:'Сколько осталось?',answer:'4375',hint:'Вычитание.'},
  {id:'l29-control-2',kind:'control',title:'Контроль 2/5',text:'В городах 24 600 и 19 850 жителей.',question:'На сколько больше в первом?',answer:'4750',hint:'Разность.'},
  {id:'l29-control-3',kind:'control',title:'Контроль 3/5',text:'Было 12 000 ₽, получили 3 450 ₽, потратили 5 275 ₽.',question:'Сколько стало?',answer:'10175',hint:'Поступление плюс, расход минус.'},
  {id:'l29-control-4',kind:'control',title:'Контроль 4/5',text:'Отправили 2 760 деталей, осталось 4 315.',question:'Сколько было?',answer:'7075',hint:'Сложи две части.'},
  {id:'l29-control-5',kind:'control',title:'Контроль 5/5',text:'В первой коробке 1 245 деталей, во второй на 380 меньше.',question:'Сколько во второй?',answer:'865',hint:'Вычти 380.'},
  {id:'l29-olympiad',kind:'olympiad',title:'Задача со звёздочкой',text:'Пифагор отдал 275 жетонов, получил 430, и стало 1 205.',question:'Сколько было сначала?',answer:'1050',hint:'Иди от конца обратными действиями.'},
  {id:'l29-summary',kind:'summary',title:'Текстовые задачи под контролем',text:'Ты умеешь переводить текст в действия, решать многошаговые задачи, отбрасывать лишние данные, идти обратными действиями и проверять смысл результата.'},
];

const KEY='mathnikita-lesson-29-progress-v1';
const normalize=(value:string)=>value.trim().replace(/\s+/g,'').replace(',','.').replace(/[−–]/g,'-');
function loadSaved():Saved{try{const parsed=JSON.parse(localStorage.getItem(KEY)??'null') as Partial<Saved>|null;if(parsed?.version===1)return{version:1,stageIndex:Math.max(0,Math.min(Number(parsed.stageIndex)||0,steps.length-1)),responses:parsed.responses??{},checked:parsed.checked??{},results:parsed.results??{}}}catch{/* ignore */}return{version:1,stageIndex:0,responses:{},checked:{},results:{}}}

export function NaturalNumberWordProblemsPlayer(){
  const initial=useMemo(loadSaved,[]);
  const[stageIndex,setStageIndex]=useState(initial.stageIndex);
  const[responses,setResponses]=useState<Record<string,string>>(initial.responses);
  const[checked,setChecked]=useState<Record<string,boolean>>(initial.checked);
  const[results,setResults]=useState<Record<string,boolean>>(initial.results);
  const step=steps[stageIndex];
  const response=responses[step.id]??'';
  const wasChecked=Boolean(checked[step.id]);
  const isCorrect=!step.answer||Boolean(results[step.id]);
  const percent=Math.round(((stageIndex+1)/steps.length)*100);
  const controlCorrect=steps.filter(item=>item.kind==='control'&&results[item.id]).length;

  useEffect(()=>{localStorage.setItem(KEY,JSON.stringify({version:1,stageIndex,responses,checked,results} satisfies Saved))},[stageIndex,responses,checked,results]);
  useEffect(()=>{const jump=(event:Event)=>{const detail=(event as CustomEvent<StageJumpDetail>).detail;if(detail?.lessonNumber!==29||!Number.isInteger(detail.stageIndex))return;stopVoice();setStageIndex(Math.max(0,Math.min(Number(detail.stageIndex),steps.length-1)));window.scrollTo({top:0,behavior:'smooth'})};window.addEventListener('mathnikita-go-to-stage',jump);return()=>window.removeEventListener('mathnikita-go-to-stage',jump)},[]);

  function stopVoice(){window.dispatchEvent(new CustomEvent('mathnikita-stop-narration'));window.speechSynthesis?.cancel()}
  function moveTo(index:number){stopVoice();setStageIndex(Math.max(0,Math.min(index,steps.length-1)));window.scrollTo({top:0,behavior:'smooth'})}
  function setResponse(value:string){setResponses(current=>({...current,[step.id]:value}));setChecked(current=>({...current,[step.id]:false}));setResults(current=>({...current,[step.id]:false}))}
  function checkAnswer(){if(!step.answer||!response.trim())return;const correct=normalize(response)===normalize(step.answer);setChecked(current=>({...current,[step.id]:true}));setResults(current=>({...current,[step.id]:correct}))}
  const kindLabel=step.kind==='theory'?'Разбираемся':step.kind==='example'?'Пример':step.kind==='practice'?'Практика':step.kind==='control'?'Контроль':step.kind==='olympiad'?'Олимпиадная задача':'Итог';

  return <main className="lesson-player"><div className="lesson-progress" aria-label={`Пройдено ${percent}% урока`}><i style={{width:`${percent}%`}}/></div>
    <section className={`interactive-stage ${step.kind==='summary'?'stage-summary':''}`} data-stage-id={step.id}>
      <div className="stage-counter"><span>Этап {stageIndex+1} из {steps.length}</span><div><small>{controlCorrect}/5 контроль</small></div></div>
      <div className={`stage-kind ${step.kind}`}>{kindLabel}</div>
      <div className="stage-copy"><h2>{step.title}</h2><p>{step.text}</p></div>
      {step.question?<div className="lesson-question activity-area"><h3>{step.question}</h3><div className="inline-answer"><input value={response} onChange={event=>setResponse(event.target.value)} onKeyDown={event=>{if(event.key==='Enter')checkAnswer()}} placeholder="Введи ответ" inputMode="numeric" disabled={isCorrect}/><button type="button" className="check-button" onClick={checkAnswer} disabled={!response.trim()||isCorrect}>Проверить</button></div>{wasChecked&&!isCorrect?<div className="instant-feedback bad" data-explanation={step.hint??''}><b>Пока не так.</b><span>{step.hint}</span></div>:null}{isCorrect&&step.answer?<div className="instant-feedback good"><b>Верно!</b><span>{step.hint?`Проверка: ${step.hint}`:'Ответ принят.'}</span></div>:null}</div>:null}
      {step.kind==='summary'?<div className="summary-card"><b>Основная часть урока 29 завершена</b><span>Теперь реши 20 обязательных текстовых задач и объясни, как ты выбираешь действие по смыслу.</span></div>:null}
      {step.kind!=='summary'?<div className="lesson-controls"><button type="button" onClick={()=>moveTo(stageIndex-1)} disabled={stageIndex===0}>← Назад</button><button type="button" onClick={()=>moveTo(stageIndex+1)} disabled={!isCorrect}>{step.answer&&!isCorrect?'Сначала реши задачу':'Дальше →'}</button></div>:null}
    </section>
  </main>;
}
