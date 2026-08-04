import { useEffect, useMemo, useState } from 'react';
import { lessonOneSources } from './data/lessonSources';
import './lessonPlayer.css';
import './theoryExperience.css';

type Activity =
  | { id: string; type: 'choice'; prompt: string; options: string[]; answer: string; explanation: string }
  | { id: string; type: 'input'; prompt: string; answer: string; explanation: string; placeholder?: string }
  | { id: string; type: 'order'; prompt: string; items: string[]; answer: string[]; explanation: string }
  | { id: string; type: 'compare'; left: string; right: string; answer: '<' | '>' | '='; explanation: string }
  | { id: string; type: 'number-line'; prompt: string; min: number; max: number; answer: number; explanation: string };

type Stage = {
  id: string;
  title: string;
  eyebrow: string;
  kind: 'story' | 'model' | 'guided' | 'practice' | 'quiz' | 'challenge' | 'summary';
  body: string;
  note?: string;
  sourceTag?: string;
  activity?: Activity;
};

type SavedProgress = {
  version: 2;
  stageIndex: number;
  answer: string;
  ordered: string[];
  checked: boolean;
  correct: boolean;
  modelValue: number;
  results: Record<string, boolean>;
  completedAt?: string;
};

const STORAGE_KEY = 'mathnikita-lesson-1-progress-v2';

export const lessonOneStages: Stage[] = [
  { id:'story',kind:'story',eyebrow:'Проблемная ситуация',title:'Один вопрос — два разных действия',body:'Мы спрашиваем «сколько?» и когда считаем книги, и когда измеряем длину стола. В первом случае мы пересчитываем предметы, во втором — узнаём, сколько одинаковых мерок поместилось в длине.',note:'Натуральные числа возникают при счёте предметов и при измерении, если мерка укладывается целое число раз.',sourceTag:'Дорофеев–Петерсон: счёт и измерение' },
  { id:'count-rule',kind:'model',eyebrow:'Считаем правильно',title:'Почему последнее число показывает количество',body:'Каждому предмету мы ставим в соответствие ровно одно число. Когда предметы закончились, последнее произнесённое число показывает, сколько предметов было всего.',note:'Нельзя пропускать предметы и нельзя считать один предмет дважды.',sourceTag:'Мерзляк § 1: числа, используемые при счёте' },
  { id:'measure',kind:'model',eyebrow:'Измеряем',title:'Когда измерение даёт натуральное число',body:'Отрезок длиной 5 сантиметров можно заполнить пятью мерками по 1 сантиметру. Получилось натуральное число 5. Если мерка не укладывается целое число раз, одних натуральных чисел уже недостаточно.',note:'Число зависит от выбранной мерки: одна и та же длина может быть 5 см или 50 мм.',sourceTag:'Дорофеев–Петерсон: натуральные числа при измерении' },
  { id:'natural-check',kind:'guided',eyebrow:'Уточняем понятие',title:'Какие числа входят в натуральный ряд',body:'В этом школьном курсе натуральный ряд начинается с 1: 1, 2, 3, 4, … . Число 0 и дроби в натуральный ряд не входят.',note:'Множество натуральных чисел коротко обозначают буквой N.',sourceTag:'Мерзляк § 1; Дорофеев–Петерсон, N = {1, 2, 3, …}',activity:{id:'t1',type:'choice',prompt:'В каком наборе записаны только натуральные числа?',options:['1, 7, 24','0, 3, 8','1/2, 4, 9','−1, 2, 5'],answer:'1, 7, 24',explanation:'1, 7 и 24 — натуральные числа. В остальных наборах есть 0, дробь или отрицательное число.'} },
  { id:'row',kind:'model',eyebrow:'Строим натуральный ряд',title:'Почему в записи стоит многоточие',body:'Натуральные числа записывают в порядке возрастания. После каждого числа идёт следующее, поэтому выписать весь ряд невозможно. Многоточие означает: ряд продолжается без конца.',note:'Первое число натурального ряда — 1. Последнего числа нет.',sourceTag:'Мерзляк § 1: натуральный ряд и его свойства' },
  { id:'model',kind:'model',eyebrow:'Интерактивное доказательство',title:'У каждого натурального числа есть следующее',body:'Нажимай «+1». Какое бы число ни было выбрано, прибавление единицы создаёт новое натуральное число, которое больше предыдущего.',note:'Именно поэтому наибольшего натурального числа не существует.',sourceTag:'Мерзляк § 1: следующее число больше на единицу' },
  { id:'previous-one',kind:'guided',eyebrow:'Важное исключение',title:'У каждого ли числа есть предыдущее?',body:'Для чисел 2, 3, 4, … предыдущее натуральное число получается вычитанием единицы. Но перед числом 1 в натуральном ряду ничего нет.',activity:{id:'t2',type:'choice',prompt:'Какое натуральное число предшествует числу 1?',options:['0','−1','Такого натурального числа нет','2'],answer:'Такого натурального числа нет',explanation:'В принятом в этом курсе натуральном ряду число 1 является первым и не имеет предыдущего натурального числа.'} },
  { id:'counterexample',kind:'guided',eyebrow:'Учимся опровергать',title:'Первая цифра не всегда решает всё',body:'Иногда неверное правило выглядит убедительно. Чтобы его опровергнуть, достаточно одного контрпримера.',note:'Контрпример — конкретный случай, в котором общее утверждение не работает.',sourceTag:'Петерсон: истинные и ложные общие высказывания',activity:{id:'t3',type:'choice',prompt:'Какая пара опровергает правило «больше то число, у которого больше первая цифра»?',options:['81 и 72','54 и 31','99 и 100','63 и 42'],answer:'99 и 100',explanation:'У 99 первая цифра 9, а у 100 — 1, но 100 больше 99. Значит, правило неверно.'} },
  { id:'choice',kind:'guided',eyebrow:'Пробуем вместе',title:'Какое число идёт следующим?',body:'Следующее натуральное число всегда на 1 больше предыдущего.',activity:{id:'a1',type:'choice',prompt:'После числа 39 идёт…',options:['38','40','49','30'],answer:'40',explanation:'39 + 1 = 40.'} },
  { id:'compare',kind:'guided',eyebrow:'Пробуем вместе',title:'Сравниваем по положению в ряду',body:'В натуральном ряду число, которое расположено правее, больше.',activity:{id:'a2',type:'compare',left:'27',right:'32',answer:'<',explanation:'27 встречается раньше 32, поэтому 27 < 32.'} },
  { id:'numberline',kind:'practice',eyebrow:'Самостоятельно',title:'Найди число на луче',body:'Выбери точку, которая соответствует числу 6.',activity:{id:'a3',type:'number-line',prompt:'Отметь число 6',min:0,max:10,answer:6,explanation:'Число 6 находится на шестом делении после нуля.'} },
  { id:'order',kind:'practice',eyebrow:'Самостоятельно',title:'Расположи по возрастанию',body:'Нажимай числа в правильном порядке — от меньшего к большему.',activity:{id:'a4',type:'order',prompt:'Расположи числа',items:['14','7','21','9'],answer:['7','9','14','21'],explanation:'На натуральном ряду числа идут так: 7, 9, 14, 21.'} },
  { id:'input',kind:'practice',eyebrow:'Закрепление',title:'Предыдущее число',body:'Для натурального числа, большего 1, предыдущее число на единицу меньше.',activity:{id:'a5',type:'input',prompt:'Какое число стоит перед 500?',answer:'499',placeholder:'Введи число',explanation:'500 − 1 = 499.'} },
  { id:'bounds',kind:'practice',eyebrow:'Повышенный уровень',title:'Перечисли все подходящие числа',body:'В сильной математике важно не потерять ни одного решения и не добавить лишнее.',sourceTag:'Задачник школы № 57: натуральные решения неравенств',activity:{id:'a6',type:'choice',prompt:'Какие натуральные числа удовлетворяют условию 4 < x ≤ 8?',options:['4, 5, 6, 7, 8','5, 6, 7, 8','5, 6, 7','4, 5, 6, 7'],answer:'5, 6, 7, 8',explanation:'Число 4 не подходит из-за строгого знака <, а число 8 подходит из-за знака ≤.'} },
  { id:'quiz1',kind:'quiz',eyebrow:'Мини-проверка · 1/5',title:'Распознаём натуральные числа',body:'Ответь без подсказки.',activity:{id:'q1',type:'choice',prompt:'Какое число не является натуральным в этом курсе?',options:['1','37','0','1000'],answer:'0',explanation:'В используемом определении натуральный ряд начинается с 1.'} },
  { id:'quiz2',kind:'quiz',eyebrow:'Мини-проверка · 2/5',title:'Следующее число',body:'Ответь без подсказки.',activity:{id:'q2',type:'input',prompt:'Какое число следует за 999?',answer:'1000',explanation:'999 + 1 = 1000.'} },
  { id:'quiz3',kind:'quiz',eyebrow:'Мини-проверка · 3/5',title:'Предыдущее число',body:'Ответь без подсказки.',activity:{id:'q3',type:'choice',prompt:'Какое число предшествует 100?',options:['99','101','90','1000'],answer:'99',explanation:'100 − 1 = 99.'} },
  { id:'quiz4',kind:'quiz',eyebrow:'Мини-проверка · 4/5',title:'Свойство натурального ряда',body:'Выбери верное утверждение.',activity:{id:'q4',type:'choice',prompt:'Какое утверждение верно?',options:['У натурального ряда есть последнее число','Каждое натуральное число имеет предыдущее натуральное число','После каждого натурального числа есть следующее','Все натуральные числа меньше 1 000 000'],answer:'После каждого натурального числа есть следующее',explanation:'К любому натуральному числу можно прибавить 1 и получить следующее.'} },
  { id:'quiz5',kind:'quiz',eyebrow:'Мини-проверка · 5/5',title:'Порядок чисел',body:'Расположи числа по возрастанию.',activity:{id:'q5',type:'order',prompt:'Расставь числа',items:['101','98','100','99'],answer:['98','99','100','101'],explanation:'Каждое следующее число здесь на 1 больше предыдущего.'} },
  { id:'challenge',kind:'challenge',eyebrow:'Исследовательская задача',title:'370 учеников и дни рождения',body:'В году не больше 366 возможных дат рождения. В школе учатся 370 учеников. Обязательно ли найдутся хотя бы двое, родившиеся в один день года?',note:'Попробуй рассуждать не перебором, а по количеству учеников и возможных дат.',sourceTag:'Мерзляк § 1, устная задача; первое знакомство с принципом Дирихле',activity:{id:'c1',type:'choice',prompt:'Какой вывод верный?',options:['Нет, даты могут не повториться','Да, совпадение обязательно','Только если все ученики одного возраста','Недостаточно данных'],answer:'Да, совпадение обязательно',explanation:'Учеников больше, чем возможных дат. Поэтому хотя бы одна дата обязательно достанется двум ученикам.'} },
  { id:'summary',kind:'summary',eyebrow:'Итог',title:'Урок завершён',body:'Ты умеешь распознавать натуральные числа, объяснять натуральный ряд, находить следующее и предыдущее число, приводить контрпример и перечислять все решения простого неравенства.' }
];

const emptyProgress: SavedProgress = { version:2,stageIndex:0,answer:'',ordered:[],checked:false,correct:false,modelValue:1,results:{} };

function normalize(value:string){return value.trim().toLowerCase().replace(/\s+/g,'').replace(/,/g,'.')}
function loadProgress():SavedProgress{
  try{
    const parsed=JSON.parse(localStorage.getItem(STORAGE_KEY)??'null') as Partial<SavedProgress>|null;
    if(!parsed||parsed.version!==2)return emptyProgress;
    return {...emptyProgress,...parsed,stageIndex:Math.min(Math.max(Number(parsed.stageIndex)||0,0),lessonOneStages.length-1),ordered:Array.isArray(parsed.ordered)?parsed.ordered:[],results:parsed.results??{}};
  }catch{return emptyProgress}
}

export function LessonPlayer(){
  const saved=useMemo(loadProgress,[]);
  const[stageIndex,setStageIndex]=useState(saved.stageIndex);
  const[answer,setAnswer]=useState(saved.answer);
  const[ordered,setOrdered]=useState<string[]>(saved.ordered);
  const[checked,setChecked]=useState(saved.checked);
  const[correct,setCorrect]=useState(saved.correct);
  const[modelValue,setModelValue]=useState(saved.modelValue);
  const[results,setResults]=useState<Record<string,boolean>>(saved.results);
  const[completedAt,setCompletedAt]=useState(saved.completedAt);
  const[restored,setRestored]=useState(saved.stageIndex>0||Object.keys(saved.results).length>0);
  const stage=lessonOneStages[stageIndex];
  const progress=Math.round(((stageIndex+1)/lessonOneStages.length)*100);
  const quizIds=['q1','q2','q3','q4','q5'];
  const practiceIds=['a1','a2','a3','a4','a5','a6'];
  const quizScore=quizIds.filter(id=>results[id]).length;
  const practiceScore=practiceIds.filter(id=>results[id]).length;
  const activity=stage.activity;

  useEffect(()=>{const payload:SavedProgress={version:2,stageIndex,answer,ordered,checked,correct,modelValue,results,completedAt};localStorage.setItem(STORAGE_KEY,JSON.stringify(payload))},[stageIndex,answer,ordered,checked,correct,modelValue,results,completedAt]);
  useEffect(()=>{if(stage.kind==='summary'&&!completedAt)setCompletedAt(new Date().toISOString())},[stage.kind,completedAt]);
  useEffect(()=>{const handler=(event:Event)=>{const detail=(event as CustomEvent<{lessonNumber:number;stageIndex:number}>).detail;if(detail?.lessonNumber===1)goTo(detail.stageIndex)};window.addEventListener('mathnikita-go-to-stage',handler);return()=>window.removeEventListener('mathnikita-go-to-stage',handler)},[]);

  function resetStage(){setAnswer('');setOrdered([]);setChecked(false);setCorrect(false)}
  function goTo(index:number){setStageIndex(Math.min(Math.max(index,0),lessonOneStages.length-1));resetStage();window.scrollTo({top:0,behavior:'smooth'})}
  function go(delta:number){goTo(stageIndex+delta)}
  function resetLesson(){localStorage.removeItem(STORAGE_KEY);setStageIndex(0);setAnswer('');setOrdered([]);setChecked(false);setCorrect(false);setModelValue(1);setResults({});setCompletedAt(undefined);setRestored(false);window.scrollTo({top:0,behavior:'smooth'})}
  function submit(value?:string){if(!activity)return;const isCorrect=activity.type==='order'?JSON.stringify(ordered)===JSON.stringify(activity.answer):normalize(value??answer)===normalize(String(activity.answer));setCorrect(isCorrect);setChecked(true);setResults(previous=>({...previous,[activity.id]:isCorrect}))}

  const visualModel=useMemo(()=>{
    if(stage.id==='story')return <div className="dual-question-model"><div><span>📚📚📚📚📚</span><b>Счёт</b><small>5 книг</small></div><div><span className="measure-bar"><i/><i/><i/><i/><i/></span><b>Измерение</b><small>5 мерок</small></div></div>;
    if(stage.id==='count-rule')return <div className="theory-scene"><div className="pifagor-bubble"><b>Кот Пифагор</b><span>Каждой книге — одно число. Последнее число отвечает на вопрос «сколько всего?»</span></div><div className="object-count" aria-label="Пять книг">{['📘','📗','📙','📕','📓'].map((item,index)=><span key={index} style={{animationDelay:`${index*90}ms`}}>{item}<small>{index+1}</small></span>)}</div></div>;
    if(stage.id==='measure')return <div className="ruler-model"><div className="ruler-segments">{[1,2,3,4,5].map(number=><span key={number}>{number}</span>)}</div><b>AB = 5 см</b><small>Пять одинаковых мерок по 1 см</small></div>;
    if(stage.id==='natural-check')return <div className="set-model"><b>N</b><span>1</span><span>2</span><span>3</span><span>4</span><i>…</i></div>;
    if(stage.id==='row')return <div className="natural-row-model">{[1,2,3,4,5,6].map(number=><span key={number}>{number}</span>)}<b>…</b></div>;
    if(stage.id==='model')return <div className="successor-model"><button onClick={()=>setModelValue(value=>Math.max(1,value-1))}>−1</button><div><small>текущее число</small><b>{modelValue}</b><span>следующее: {modelValue+1}</span></div><button onClick={()=>setModelValue(value=>value+1)}>+1</button></div>;
    if(stage.id==='previous-one')return <div className="first-number-model"><span className="blocked">←</span><b>1</b><span>2</span><span>3</span><small>Перед 1 натурального числа нет</small></div>;
    if(stage.id==='counterexample')return <div className="counterexample-model"><div><b>99</b><small>первая цифра 9</small></div><span>&lt;</span><div><b>100</b><small>первая цифра 1</small></div></div>;
    if(stage.id==='challenge')return <div className="birthday-model"><div><b>370</b><span>учеников</span></div><strong>&gt;</strong><div><b>366</b><span>возможных дат</span></div></div>;
    return null;
  },[stage.id,modelValue]);

  function renderActivity(current:Activity){
    if(current.type==='choice')return <div className="activity-area"><h3>{current.prompt}</h3><div className="choice-grid">{current.options.map(option=><button key={option} className={answer===option?'selected':''} onClick={()=>{setAnswer(option);setChecked(false)}}>{option}</button>)}</div><button className="check-button" disabled={!answer} onClick={()=>submit()}>Проверить</button></div>;
    if(current.type==='input')return <div className="activity-area"><h3>{current.prompt}</h3><div className="inline-answer"><input value={answer} onChange={event=>{setAnswer(event.target.value);setChecked(false)}} onKeyDown={event=>event.key==='Enter'&&submit()} placeholder={current.placeholder??'Ответ'}/><button className="check-button" disabled={!answer.trim()} onClick={()=>submit()}>Проверить</button></div></div>;
    if(current.type==='compare')return <div className="activity-area"><h3>Поставь правильный знак</h3><div className="compare-board"><b>{current.left}</b><div>{['<','=','>'].map(sign=><button key={sign} className={answer===sign?'selected':''} onClick={()=>{setAnswer(sign);setChecked(false)}}>{sign}</button>)}</div><b>{current.right}</b></div><button className="check-button" disabled={!answer} onClick={()=>submit()}>Проверить</button></div>;
    if(current.type==='number-line')return <div className="activity-area"><h3>{current.prompt}</h3><div className="number-line">{Array.from({length:current.max-current.min+1},(_,index)=>index+current.min).map(number=><button key={number} className={answer===String(number)?'selected':''} onClick={()=>{setAnswer(String(number));setChecked(false)}}><i/><span>{number}</span></button>)}</div><button className="check-button" disabled={!answer} onClick={()=>submit()}>Проверить</button></div>;
    return <div className="activity-area"><h3>{current.prompt}</h3><div className="order-bank">{current.items.map(item=><button key={item} disabled={ordered.includes(item)} onClick={()=>{setOrdered(list=>[...list,item]);setChecked(false)}}>{item}</button>)}</div><div className="order-result">{ordered.length?ordered.map((item,index)=><button key={`${item}-${index}`} onClick={()=>{setOrdered(list=>list.filter((_,itemIndex)=>itemIndex!==index));setChecked(false)}}>{item}</button>):<span>Нажимай числа по порядку</span>}</div><div className="activity-actions"><button className="secondary" onClick={()=>setOrdered([])}>Сбросить</button><button className="check-button" disabled={ordered.length!==current.items.length} onClick={()=>submit()}>Проверить</button></div></div>;
  }

  return <main className="lesson-player-page"><section className="lesson-workspace interactive-workspace">
    <header className="lesson-header"><div><span>Урок 1 из 175 · Натуральные числа</span><h1>Натуральные числа и натуральный ряд</h1><p>Урок собран по учебникам Мерзляка и Дорофеева–Петерсон, методическому пособию и задачнику школы № 57.</p></div><div className="lesson-duration">30–35 мин</div></header>
    <div className="lesson-progress"><i style={{width:`${progress}%`}}/></div>
    <div className="stage-counter"><span>Этап {stageIndex+1} из {lessonOneStages.length}</span><div>{restored?<small>Прогресс восстановлен</small>:null}<button type="button" onClick={resetLesson}>Начать заново</button></div></div>
    <article className={`interactive-stage stage-${stage.kind}`} data-stage-id={stage.id}>
      <div className="stage-copy"><span>{stage.eyebrow}</span><h2>{stage.title}</h2><p>{stage.body}</p>{stage.sourceTag?<small className="source-tag">Источник: {stage.sourceTag}</small>:null}{stage.note?<div className="theory-note"><b>Запомни</b><span>{stage.note}</span></div>:null}</div>
      {visualModel}{activity&&renderActivity(activity)}
      {checked&&activity?<div className={`instant-feedback ${correct?'good':'bad'}`} data-explanation={activity.explanation}><b>{correct?'Верно!':'Пока не получилось'}</b><span>{correct?activity.explanation:`Посмотри на модель ещё раз. ${activity.explanation}`}</span></div>:null}
      {stage.kind==='quiz'&&checked?<div className="quiz-meter"><span>Текущий результат</span><b>{quizScore} из 5</b></div>:null}
      {stage.kind==='summary'?<><div className="summary-card"><div><span>Мини-проверка</span><b>{quizScore}/5</b><small>{quizScore>=4?'Тема усвоена':'Нужно короткое повторение'}</small></div><div><span>Практика</span><b>{practiceScore}/6</b><small>заданий выполнено верно</small></div><div><span>Статус</span><b>{quizScore>=4&&practiceScore>=5?'Завершён':'Повторить'}</b><small>{completedAt?new Date(completedAt).toLocaleDateString('ru-RU'):'сегодня'}</small></div></div><details className="lesson-sources"><summary>Методическая основа урока</summary>{lessonOneSources.map(source=><div key={source.reference}><b>{source.shortTitle}</b><span>{source.reference}</span><small>{source.contribution}</small></div>)}</details></>:null}
    </article>
    <footer className="lesson-controls"><button onClick={()=>go(-1)} disabled={stageIndex===0}>← Назад</button><span>{progress}% урока</span><button className="primary" onClick={()=>go(1)} disabled={stageIndex===lessonOneStages.length-1||Boolean(activity&&!correct)}>Продолжить →</button></footer>
  </section></main>;
}
