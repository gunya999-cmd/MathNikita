import { useMemo, useState } from 'react';
import { allRichLessons, type LessonBlockKind } from './data/richLessonContent';
import './lessonPlayer.css';

type Activity =
  | { id:string; type:'choice'; prompt:string; options:string[]; answer:string; explanation:string }
  | { id:string; type:'input'; prompt:string; answer:string; explanation:string; placeholder?:string }
  | { id:string; type:'order'; prompt:string; items:string[]; answer:string[]; explanation:string }
  | { id:string; type:'compare'; left:string; right:string; answer:'<'|'>'|'='; explanation:string }
  | { id:string; type:'number-line'; prompt:string; min:number; max:number; answer:number; explanation:string };

type Stage = {
  id:string;
  title:string;
  eyebrow:string;
  kind:'story'|'model'|'guided'|'practice'|'quiz'|'challenge'|'summary';
  body:string;
  activity?:Activity;
};

const labels: Record<LessonBlockKind, string> = {
  motivation:'Зачем это нужно', explanation:'Объяснение', guided:'Решаем вместе', practice:'Закрепление',
  mistakes:'Типичная ошибка', checkpoint:'Проверка понимания', thinking:'Подумай', olympiad:'Задача со звёздочкой', summary:'Итог урока',
};

const lessonOneStages: Stage[] = [
  { id:'story', kind:'story', eyebrow:'Наблюдаем', title:'Счёт помогает описывать мир', body:'На полке стоят пять книг. Чтобы ответить «сколько?», мы называем числа по порядку: 1, 2, 3, 4, 5. Числа, которые используют при счёте, называются натуральными.' },
  { id:'model', kind:'model', eyebrow:'Интерактивная модель', title:'Натуральный ряд продолжается без конца', body:'Нажимай «+1» и наблюдай: у каждого натурального числа есть следующее. Поэтому самого большого натурального числа не существует.' },
  { id:'choice', kind:'guided', eyebrow:'Пробуем вместе', title:'Какое число идёт следующим?', body:'Каждое следующее натуральное число на 1 больше предыдущего.', activity:{ id:'a1', type:'choice', prompt:'После числа 39 идёт…', options:['38','40','49','30'], answer:'40', explanation:'39 + 1 = 40. Следующее число всегда на единицу больше.' } },
  { id:'compare', kind:'guided', eyebrow:'Пробуем вместе', title:'Сравниваем числа', body:'В натуральном ряду число, которое расположено правее, больше.', activity:{ id:'a2', type:'compare', left:'27', right:'32', answer:'<', explanation:'27 встречается раньше 32, поэтому 27 < 32.' } },
  { id:'numberline', kind:'practice', eyebrow:'Самостоятельно', title:'Найди число на луче', body:'Выбери точку, которая соответствует числу 6.', activity:{ id:'a3', type:'number-line', prompt:'Отметь число 6', min:0, max:10, answer:6, explanation:'Число 6 находится на шестом делении после нуля.' } },
  { id:'order', kind:'practice', eyebrow:'Самостоятельно', title:'Расположи по возрастанию', body:'Нажимай числа в правильном порядке — от меньшего к большему.', activity:{ id:'a4', type:'order', prompt:'Расположи числа', items:['14','7','21','9'], answer:['7','9','14','21'], explanation:'На натуральном ряду числа идут так: 7, 9, 14, 21.' } },
  { id:'input', kind:'practice', eyebrow:'Закрепление', title:'Предыдущее число', body:'Чтобы найти предыдущее число, вычти 1.', activity:{ id:'a5', type:'input', prompt:'Какое число стоит перед 500?', answer:'499', placeholder:'Введи число', explanation:'500 − 1 = 499.' } },
  { id:'quiz1', kind:'quiz', eyebrow:'Мини-проверка · 1/4', title:'Следующее число', body:'Ответь без подсказки.', activity:{ id:'q1', type:'input', prompt:'Какое число следует за 999?', answer:'1000', explanation:'999 + 1 = 1000.' } },
  { id:'quiz2', kind:'quiz', eyebrow:'Мини-проверка · 2/4', title:'Предыдущее число', body:'Ответь без подсказки.', activity:{ id:'q2', type:'choice', prompt:'Какое число предшествует 100?', options:['99','101','90','1000'], answer:'99', explanation:'100 − 1 = 99.' } },
  { id:'quiz3', kind:'quiz', eyebrow:'Мини-проверка · 3/4', title:'Свойство ряда', body:'Выбери верное утверждение.', activity:{ id:'q3', type:'choice', prompt:'Какое утверждение верно?', options:['У натурального ряда есть последнее число','Натуральный ряд начинается с 1 и продолжается без конца','После каждого числа идёт число на 2 больше','Число 0 всегда первое натуральное число'], answer:'Натуральный ряд начинается с 1 и продолжается без конца', explanation:'В школьном курсе натуральный ряд записывают 1, 2, 3, …; последнего числа нет.' } },
  { id:'quiz4', kind:'quiz', eyebrow:'Мини-проверка · 4/4', title:'Порядок чисел', body:'Расположи числа по возрастанию.', activity:{ id:'q4', type:'order', prompt:'Расставь числа', items:['101','98','100','99'], answer:['98','99','100','101'], explanation:'Каждое следующее число на 1 больше предыдущего.' } },
  { id:'challenge', kind:'challenge', eyebrow:'Задача со звёздочкой', title:'Можно ли назвать самое большое число?', body:'Попробуй объяснить словами. Подсказка: что произойдёт, если к предложенному числу прибавить 1?', activity:{ id:'c1', type:'choice', prompt:'Какой вывод правильный?', options:['Самое большое число — 1 000 000','Самого большого натурального числа нет','Самое большое число — 999 999','Самое большое число зависит от учебника'], answer:'Самого большого натурального числа нет', explanation:'Какое бы число ни назвали, можно прибавить 1 и получить ещё большее.' } },
  { id:'summary', kind:'summary', eyebrow:'Итог', title:'Урок завершён', body:'Ты умеешь продолжать натуральный ряд, находить предыдущее и следующее число, сравнивать числа и объяснять, почему натуральный ряд бесконечен.' },
];

function normalize(value:string){ return value.trim().toLowerCase().replace(/\s+/g,'').replace(',', '.'); }

function GenericLesson({ lessonNumber }:{ lessonNumber:number }){
  const lesson = allRichLessons.find(item=>item.lessonNumber===lessonNumber) ?? allRichLessons[0];
  const [blockIndex,setBlockIndex]=useState(0);
  const block=lesson.blocks[blockIndex];
  const progress=Math.round(((blockIndex+1)/lesson.blocks.length)*100);
  return <section className="lesson-workspace">
    <header className="lesson-header"><div><span>Урок {lesson.lessonNumber} из 175</span><h1>{lesson.title}</h1><p>{lesson.goal}</p></div><div className="lesson-duration">≈ {lesson.durationMinutes} мин</div></header>
    <div className="lesson-progress"><i style={{width:`${progress}%`}} /></div>
    <article className={`lesson-block block-${block.kind}`}><div className="block-kicker">{labels[block.kind]}</div><h2>{block.title}</h2><p className="block-text">{block.text}</p>{block.items?.length?<ol className="lesson-items">{block.items.map((item,index)=><li key={index}>{item}</li>)}</ol>:null}</article>
    <footer className="lesson-controls"><button onClick={()=>setBlockIndex(i=>Math.max(0,i-1))} disabled={blockIndex===0}>← Назад</button><span>{blockIndex+1} из {lesson.blocks.length}</span><button className="primary" onClick={()=>setBlockIndex(i=>Math.min(lesson.blocks.length-1,i+1))} disabled={blockIndex===lesson.blocks.length-1}>Продолжить →</button></footer>
  </section>;
}

export function LessonPlayer(){
  const [lessonNumber,setLessonNumber]=useState(1);
  const [stageIndex,setStageIndex]=useState(0);
  const [answer,setAnswer]=useState('');
  const [ordered,setOrdered]=useState<string[]>([]);
  const [checked,setChecked]=useState(false);
  const [correct,setCorrect]=useState(false);
  const [modelValue,setModelValue]=useState(1);
  const [results,setResults]=useState<Record<string,boolean>>({});
  const stage=lessonOneStages[stageIndex];
  const progress=Math.round(((stageIndex+1)/lessonOneStages.length)*100);
  const quizIds=['q1','q2','q3','q4'];
  const quizScore=quizIds.filter(id=>results[id]).length;

  const resetStage=()=>{ setAnswer(''); setOrdered([]); setChecked(false); setCorrect(false); };
  const chooseLesson=(n:number)=>{ setLessonNumber(n); setStageIndex(0); resetStage(); };
  const go=(delta:number)=>{ setStageIndex(i=>Math.min(Math.max(i+delta,0),lessonOneStages.length-1)); resetStage(); };

  const activity=stage?.activity;
  function submit(value?:string){
    if(!activity) return;
    let isCorrect=false;
    if(activity.type==='order') isCorrect=JSON.stringify(ordered)===JSON.stringify(activity.answer);
    else isCorrect=normalize(value ?? answer)===normalize(String(activity.answer));
    setCorrect(isCorrect); setChecked(true); setResults(prev=>({...prev,[activity.id]:isCorrect}));
  }

  const visualModel=useMemo(()=>{
    if(stage?.id==='story') return <div className="object-count" aria-label="Пять книг">{['📘','📗','📙','📕','📓'].map((item,i)=><span key={i} style={{animationDelay:`${i*90}ms`}}>{item}<small>{i+1}</small></span>)}</div>;
    if(stage?.id==='model') return <div className="successor-model"><button onClick={()=>setModelValue(v=>Math.max(1,v-1))}>−1</button><div><small>текущее число</small><b>{modelValue}</b><span>следующее: {modelValue+1}</span></div><button onClick={()=>setModelValue(v=>v+1)}>+1</button></div>;
    return null;
  },[stage?.id,modelValue]);

  function renderActivity(a:Activity){
    if(a.type==='choice') return <div className="activity-area"><h3>{a.prompt}</h3><div className="choice-grid">{a.options.map(option=><button key={option} className={answer===option?'selected':''} onClick={()=>{setAnswer(option);setChecked(false);}}>{option}</button>)}</div><button className="check-button" disabled={!answer} onClick={()=>submit()}>Проверить</button></div>;
    if(a.type==='input') return <div className="activity-area"><h3>{a.prompt}</h3><div className="inline-answer"><input value={answer} onChange={e=>{setAnswer(e.target.value);setChecked(false);}} onKeyDown={e=>e.key==='Enter'&&submit()} placeholder={a.placeholder??'Ответ'} /><button className="check-button" disabled={!answer.trim()} onClick={()=>submit()}>Проверить</button></div></div>;
    if(a.type==='compare') return <div className="activity-area"><h3>Поставь правильный знак</h3><div className="compare-board"><b>{a.left}</b><div>{['<','=','>'].map(sign=><button key={sign} className={answer===sign?'selected':''} onClick={()=>{setAnswer(sign);setChecked(false);}}>{sign}</button>)}</div><b>{a.right}</b></div><button className="check-button" disabled={!answer} onClick={()=>submit()}>Проверить</button></div>;
    if(a.type==='number-line') return <div className="activity-area"><h3>{a.prompt}</h3><div className="number-line">{Array.from({length:a.max-a.min+1},(_,i)=>i+a.min).map(n=><button key={n} className={answer===String(n)?'selected':''} onClick={()=>{setAnswer(String(n));setChecked(false);}}><i/><span>{n}</span></button>)}</div><button className="check-button" disabled={!answer} onClick={()=>submit()}>Проверить</button></div>;
    return <div className="activity-area"><h3>{a.prompt}</h3><div className="order-bank">{a.items.map(item=><button key={item} disabled={ordered.includes(item)} onClick={()=>{setOrdered(list=>[...list,item]);setChecked(false);}}>{item}</button>)}</div><div className="order-result">{ordered.length?ordered.map((item,i)=><button key={`${item}-${i}`} onClick={()=>{setOrdered(list=>list.filter((_,index)=>index!==i));setChecked(false);}}>{item}</button>):<span>Нажимай числа по порядку</span>}</div><div className="activity-actions"><button className="secondary" onClick={()=>setOrdered([])}>Сбросить</button><button className="check-button" disabled={ordered.length!==a.items.length} onClick={()=>submit()}>Проверить</button></div></div>;
  }

  return <main className="lesson-player-page">
    <aside className="lesson-catalog"><div className="catalog-head"><span>Курс 5 класса</span><b>Интерактивные уроки</b></div><div className="lesson-list">{allRichLessons.map(item=><button key={item.lessonNumber} className={item.lessonNumber===lessonNumber?'active':''} onClick={()=>chooseLesson(item.lessonNumber)}><span>{item.lessonNumber}</span><div><b>{item.title}</b><small>{item.lessonNumber===1?'интерактивный':'конспект'}</small></div></button>)}</div></aside>
    {lessonNumber!==1?<GenericLesson lessonNumber={lessonNumber}/>:<section className="lesson-workspace interactive-workspace">
      <header className="lesson-header"><div><span>Урок 1 из 175 · Натуральные числа</span><h1>Натуральные числа и счёт</h1><p>Поймём, как устроен натуральный ряд, и сразу применим новое знание.</p></div><div className="lesson-duration">20–25 мин</div></header>
      <div className="lesson-progress"><i style={{width:`${progress}%`}} /></div>
      <div className="stage-counter">Этап {stageIndex+1} из {lessonOneStages.length}</div>
      <article className={`interactive-stage stage-${stage.kind}`}><div className="stage-copy"><span>{stage.eyebrow}</span><h2>{stage.title}</h2><p>{stage.body}</p></div>{visualModel}{activity&&renderActivity(activity)}{checked&&activity?<div className={`instant-feedback ${correct?'good':'bad'}`}><b>{correct?'Верно!':'Пока не получилось'}</b><span>{correct?activity.explanation:'Попробуй ещё раз. Подсказка: '+activity.explanation}</span></div>:null}{stage.kind==='quiz'&&checked?<div className="quiz-meter"><span>Текущий результат</span><b>{quizScore} из 4</b></div>:null}{stage.kind==='summary'?<div className="summary-card"><div><span>Мини-проверка</span><b>{quizScore}/4</b><small>{quizScore>=3?'Тема усвоена':'Нужно короткое повторение'}</small></div><div><span>Практика</span><b>{Object.keys(results).filter(id=>id.startsWith('a')).filter(id=>results[id]).length}/5</b><small>выполнено верно</small></div><div><span>Следующий шаг</span><b>Урок 2</b><small>Натуральный ряд и закономерности</small></div></div>:null}</article>
      <footer className="lesson-controls"><button onClick={()=>go(-1)} disabled={stageIndex===0}>← Назад</button><span>{progress}% урока</span><button className="primary" onClick={()=>go(1)} disabled={stageIndex===lessonOneStages.length-1 || (!!activity&&!correct)}>Продолжить →</button></footer>
    </section>}
  </main>;
}
