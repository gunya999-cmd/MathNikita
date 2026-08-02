import { useEffect,useMemo,useState } from 'react';
import './lessonPlayer.css';
import './theoryExperience.css';
import './additionProperties.css';

type Activity={id:string;type:'choice'|'input'|'order';prompt:string;options?:string[];items?:string[];answer:string|string[];explanation:string;placeholder?:string};
type Visual='mission'|'swap'|'group'|'strategy'|'letters'|'time'|'error'|'algorithm'|'challenge';
type Stage={id:string;title:string;eyebrow:string;kind:'story'|'model'|'guided'|'practice'|'quiz'|'challenge'|'summary';body:string;note?:string;sourceTag?:string;visual?:Visual;activity?:Activity};
type Saved={version:1;stageIndex:number;responses:Record<string,string>;orders:Record<string,string[]>;checked:Record<string,boolean>;results:Record<string,boolean>};

const KEY='mathnikita-lesson-22-progress-v1';

export const lessonTwentyTwoStages:Stage[]=[
  {id:'l22-mission',kind:'story',eyebrow:'Глава 2 · § 7',title:'Не считай дольше — считай удобнее',body:'Сумма не меняется, если грамотно переставить или сгруппировать слагаемые. Сегодня превратим это наблюдение в два точных математических свойства и научимся использовать их осознанно.',note:'Методика урока 22 требует не только получить ответ, но и уметь назвать свойство, которое использовано при упрощении.',sourceTag:'Мерзляк § 7 · технологическая карта урока 22',visual:'mission'},
  {id:'l22-recall',kind:'guided',eyebrow:'Актуализация',title:'Сначала обычная сумма',body:'Вспомним уверенное сложение и сразу заметим удобную пару.',activity:{id:'l22-a1',type:'input',prompt:'Вычисли: 3 740 + 260.',answer:'4000',placeholder:'Сумма',explanation:'3 740 + 260 = 4 000. Такие круглые суммы особенно полезно замечать в длинных выражениях.'}},
  {id:'l22-commutative',kind:'model',eyebrow:'Свойство № 1',title:'Переместительное свойство',body:'От перестановки слагаемых сумма не меняется. Например, 37 + 63 = 63 + 37 = 100.',note:'В буквенном виде: a + b = b + a.',sourceTag:'Учебник § 7 · переместительное свойство сложения',visual:'swap'},
  {id:'l22-commutative-check',kind:'guided',eyebrow:'Назови свойство',title:'Что произошло со слагаемыми?',body:'Сравни левую и правую части равенства.',activity:{id:'l22-a2',type:'choice',prompt:'Какое свойство использовано: 315 + 85 = 85 + 315?',options:['Переместительное','Сочетательное','Свойство нуля','Никакое'],answer:'Переместительное',explanation:'Слагаемые поменялись местами, поэтому использовано переместительное свойство.'}},
  {id:'l22-associative',kind:'model',eyebrow:'Свойство № 2',title:'Сочетательное свойство',body:'Чтобы к сумме двух чисел прибавить третье, можно к первому числу прибавить сумму второго и третьего. Это позволяет выбирать удобную пару.',note:'В буквенном виде: (a + b) + c = a + (b + c).',sourceTag:'Учебник § 7 · сочетательное свойство сложения',visual:'group'},
  {id:'l22-associative-check',kind:'guided',eyebrow:'Назови свойство',title:'Скобки изменились, сумма — нет',body:'Здесь порядок самих слагаемых не изменился, но изменилась группировка.',activity:{id:'l22-a3',type:'choice',prompt:'Какое свойство использовано: (64 + 23) + 77 = 64 + (23 + 77)?',options:['Сочетательное','Переместительное','Свойство нуля','Распределительное'],answer:'Сочетательное',explanation:'Изменились скобки, то есть группировка слагаемых. Это сочетательное свойство.'}},
  {id:'l22-strategy',kind:'model',eyebrow:'Главная идея',title:'Ищи пары, которые дают круглые числа',body:'В сумме нескольких чисел можно одновременно переставлять слагаемые и заключать их в удобные скобки. Например, 48 + 37 + 152 + 63 удобно превратить в (48 + 152) + (37 + 63).',note:'Также помни: a + 0 = a и 0 + a = a.',visual:'strategy'},
  {id:'l22-practice1',kind:'practice',eyebrow:'Практика · 1/6',title:'Две удобные пары',body:'Не складывай по порядку слева направо. Сначала найди две круглые суммы.',activity:{id:'l22-p1',type:'input',prompt:'Вычисли удобным способом: 48 + 37 + 152 + 63.',answer:'300',placeholder:'Ответ',explanation:'48 + 152 = 200, 37 + 63 = 100. Итого 300. Использованы переместительное и сочетательное свойства.'}},
  {id:'l22-practice2',kind:'practice',eyebrow:'Практика · 2/6',title:'Сначала составь тысячу',body:'Заметь пару, которая даёт 1 000.',activity:{id:'l22-p2',type:'input',prompt:'Вычисли удобным способом: 275 + 49 + 725.',answer:'1049',placeholder:'Ответ',explanation:'275 + 725 = 1 000, затем 1 000 + 49 = 1 049.'}},
  {id:'l22-practice3',kind:'practice',eyebrow:'Практика · 3/6',title:'Скобки решают всё',body:'Сумму 23 + 77 удобно выполнить первой.',activity:{id:'l22-p3',type:'input',prompt:'Вычисли: (64 + 23) + 77.',answer:'164',placeholder:'Ответ',explanation:'По сочетательному свойству: (64 + 23) + 77 = 64 + (23 + 77) = 64 + 100 = 164.'}},
  {id:'l22-letters',kind:'model',eyebrow:'Буквенные выражения',title:'Свойства работают и с неизвестным числом',body:'В выражении 136 + (a + 214) можно переставить 214 и a, а затем сгруппировать числа: (136 + 214) + a = 350 + a.',note:'Мы не узнаём значение a. Мы лишь делаем выражение проще.',visual:'letters'},
  {id:'l22-practice4',kind:'practice',eyebrow:'Практика · 4/6',title:'Упрости выражение',body:'Собери известные числа в одну удобную сумму.',activity:{id:'l22-p4',type:'choice',prompt:'Чему равно 175 + (x + 245) после упрощения?',options:['420 + x','175 + 245x','x + 70','420x'],answer:'420 + x',explanation:'175 + (x + 245) = 175 + (245 + x) = (175 + 245) + x = 420 + x.'}},
  {id:'l22-time',kind:'model',eyebrow:'Величины',title:'Складывай одинаковые единицы вместе',body:'Свойства сложения помогают и с составными величинами. Минуты удобно объединить с минутами, секунды — с секундами, затем лишние 60 секунд превратить в минуту.',note:'Например: 8 мин 35 с + 6 мин 47 с = 14 мин + 82 с = 15 мин 22 с.',sourceTag:'Учебник § 7 · идея примера 2, числа изменены',visual:'time'},
  {id:'l22-practice5',kind:'practice',eyebrow:'Практика · 5/6',title:'Сложение времени',body:'Сначала сложи минуты и секунды отдельно.',activity:{id:'l22-p5',type:'input',prompt:'Вычисли: 9 мин 46 с + 4 мин 39 с. Ответ запиши в формате «14 мин 25 с».',answer:'14мин25с',placeholder:'Ответ',explanation:'9 + 4 = 13 мин, 46 + 39 = 85 с = 1 мин 25 с. Итого 14 мин 25 с.'}},
  {id:'l22-error',kind:'guided',eyebrow:'Разбор ошибки',title:'Не путай перестановку и группировку',body:'Оба свойства сохраняют сумму, но описывают разные действия.',activity:{id:'l22-a4',type:'choice',prompt:'В равенстве 52 + 148 = 148 + 52 что изменилось?',options:['Слагаемые поменялись местами','Изменилась только группировка','К сумме прибавили ноль','Одно слагаемое заменили'],answer:'Слагаемые поменялись местами',explanation:'Это переместительное свойство: меняется порядок слагаемых, а не скобки.'},visual:'error'},
  {id:'l22-algorithm',kind:'model',eyebrow:'Алгоритм удобной суммы',title:'Сначала увидеть, потом переставить и сгруппировать',body:'Рациональное вычисление — это не магический трюк. Это короткий алгоритм: найти удобные пары, при необходимости переставить слагаемые, сгруппировать их, вычислить группы и сложить результаты.',visual:'algorithm'},
  {id:'l22-practice6',kind:'practice',eyebrow:'Практика · 6/6',title:'Собери стратегию',body:'Расположи шаги удобного вычисления в разумном порядке.',activity:{id:'l22-p6',type:'order',prompt:'Как рационально вычислить длинную сумму?',items:['Найти слагаемые, которые удобно сложить вместе','Переставить слагаемые, если это нужно','Сгруппировать удобные пары скобками','Вычислить суммы внутри удобных групп','Сложить полученные результаты'],answer:['Найти слагаемые, которые удобно сложить вместе','Переставить слагаемые, если это нужно','Сгруппировать удобные пары скобками','Вычислить суммы внутри удобных групп','Сложить полученные результаты'],explanation:'Сначала планируем удобные пары, затем используем свойства сложения и только потом считаем.'}},
  {id:'l22-transfer',kind:'guided',eyebrow:'Текстовая задача',title:'Свойства помогают считать данные задачи',body:'На трёх складах лежит 12 750 кг, 3 250 кг и 8 400 кг груза. Первые два числа образуют особенно удобную пару.',activity:{id:'l22-a5',type:'input',prompt:'Сколько килограммов груза на трёх складах вместе?',answer:'24400',placeholder:'Килограммы',explanation:'12 750 + 3 250 = 16 000; 16 000 + 8 400 = 24 400 кг.'},sourceTag:'Методическая линия урока 22 · текстовая задача с новыми данными'},
  {id:'l22-quiz1',kind:'quiz',eyebrow:'Контроль · 1/5',title:'Формула переместительного свойства',body:'Работай самостоятельно.',activity:{id:'l22-q1',type:'choice',prompt:'Какая формула выражает переместительное свойство сложения?',options:['a + b = b + a','(a + b) + c = a + (b + c)','a + 0 = a','a · b = b · a'],answer:'a + b = b + a',explanation:'Переместительное свойство меняет слагаемые местами: a + b = b + a.'}},
  {id:'l22-quiz2',kind:'quiz',eyebrow:'Контроль · 2/5',title:'Формула сочетательного свойства',body:'Работай самостоятельно.',activity:{id:'l22-q2',type:'choice',prompt:'Какая формула выражает сочетательное свойство сложения?',options:['(a + b) + c = a + (b + c)','a + b = b + a','a + 0 = 0','a + a = 2a'],answer:'(a + b) + c = a + (b + c)',explanation:'Сочетательное свойство меняет группировку трёх слагаемых.'}},
  {id:'l22-quiz3',kind:'quiz',eyebrow:'Контроль · 3/5',title:'Четыре слагаемых',body:'Работай самостоятельно.',activity:{id:'l22-q3',type:'input',prompt:'Вычисли удобным способом: 398 + 127 + 602 + 73.',answer:'1200',placeholder:'Ответ',explanation:'398 + 602 = 1 000, 127 + 73 = 200, всего 1 200.'}},
  {id:'l22-quiz4',kind:'quiz',eyebrow:'Контроль · 4/5',title:'Ноль и удобная пара',body:'Работай самостоятельно.',activity:{id:'l22-q4',type:'input',prompt:'Вычисли: 75 + 0 + 925.',answer:'1000',placeholder:'Ответ',explanation:'Ноль не меняет сумму, а 75 + 925 = 1 000.'}},
  {id:'l22-quiz5',kind:'quiz',eyebrow:'Контроль · 5/5',title:'Время',body:'Работай самостоятельно.',activity:{id:'l22-q5',type:'input',prompt:'Вычисли: 12 мин 48 с + 6 мин 35 с. Ответ запиши «19 мин 23 с».',answer:'19мин23с',placeholder:'Ответ',explanation:'48 + 35 = 83 с = 1 мин 23 с; 12 + 6 + 1 = 19 мин. Ответ: 19 мин 23 с.'}},
  {id:'l22-challenge',kind:'challenge',eyebrow:'Задача со звёздочкой',title:'Сумма без длинного счёта',body:'Используй пары, равноудалённые от концов: 1 + 19, 2 + 18 и так далее.',activity:{id:'l22-c1',type:'input',prompt:'Найди сумму всех натуральных чисел от 1 до 19 включительно.',answer:'190',placeholder:'Сумма',explanation:'Получаются 9 пар по 20 и среднее число 10: 9 · 20 + 10 = 190.'},visual:'challenge'},
  {id:'l22-summary',kind:'summary',eyebrow:'Итог урока 22',title:'Теперь ты управляешь порядком сложения',body:'Ты знаешь переместительное и сочетательное свойства, умеешь называть их, находить удобные пары, упрощать буквенные выражения и складывать составные величины. На уроке 23 эти навыки будем закреплять в более сложных вычислениях и задачах.',note:'Методическая домашняя линия: § 7, вопросы 4–6, № 172, 176, 178 (1–2).'},
];

function load():Saved{
  const fallback:Saved={version:1,stageIndex:0,responses:{},orders:{},checked:{},results:{}};
  try{const raw=localStorage.getItem(KEY);if(!raw)return fallback;const parsed=JSON.parse(raw) as Partial<Saved>;return{version:1,stageIndex:Math.min(Math.max(Number(parsed.stageIndex)||0,0),lessonTwentyTwoStages.length-1),responses:parsed.responses??{},orders:parsed.orders??{},checked:parsed.checked??{},results:parsed.results??{}}}catch{return fallback}
}
function normalize(value:string){return value.trim().toLowerCase().replace(/\s+/g,'').replace(/[−–]/g,'-')}
function sameOrder(a:string[],b:string[]){return a.length===b.length&&a.every((value,index)=>value===b[index])}

function PropertiesVisual({kind}:{kind?:Visual}){
  if(kind==='swap')return <div className="properties-visual"><div className="property-formula"><span>37</span><b>+</b><span>63</span><i>⇄</i><span>63</span><b>+</b><span>37</span><strong>= 100</strong></div></div>;
  if(kind==='group')return <div className="properties-visual"><div className="grouping-demo"><div><small>сначала слева</small><b>(64 + 23) + 77</b></div><i>=</i><div><small>сначала удобная пара</small><b>64 + (23 + 77)</b></div></div></div>;
  if(kind==='strategy')return <div className="properties-visual"><div className="pair-board"><span>48</span><span>37</span><span>152</span><span>63</span><b>48 + 152 = 200</b><b>37 + 63 = 100</b></div></div>;
  if(kind==='letters')return <div className="properties-visual"><div className="letter-chain"><span>136 + (a + 214)</span><i>→</i><span>136 + (214 + a)</span><i>→</i><strong>350 + a</strong></div></div>;
  if(kind==='time')return <div className="properties-visual"><div className="time-board"><div><b>8 мин</b><span>+</span><b>6 мин</b><strong>= 14 мин</strong></div><div><b>35 с</b><span>+</span><b>47 с</b><strong>= 82 с</strong></div><p>82 с = 1 мин 22 с → 15 мин 22 с</p></div></div>;
  if(kind==='error')return <div className="properties-visual"><div className="property-cards"><div><b>Переместительное</b><span>меняем места</span><code>a + b = b + a</code></div><div><b>Сочетательное</b><span>меняем группировку</span><code>(a + b) + c = a + (b + c)</code></div></div></div>;
  if(kind==='algorithm')return <div className="properties-visual"><div className="properties-algorithm">{['Увидеть удобные пары','Переставить','Сгруппировать','Посчитать группы','Сложить результаты'].map((text,index)=><div key={text}><b>{index+1}</b><span>{text}</span></div>)}</div></div>;
  if(kind==='challenge')return <div className="properties-visual"><div className="challenge-pairs"><b>1 + 19</b><b>2 + 18</b><b>3 + 17</b><span>…</span><strong>каждая пара = 20</strong></div></div>;
  return <div className="properties-visual"><div className="property-hero"><b>a + b = b + a</b><b>(a + b) + c = a + (b + c)</b><span>Одна сумма — разные удобные маршруты</span></div></div>;
}

export function AdditionPropertiesPlayer(){
  const saved=useMemo(load,[]);
  const[stageIndex,setStageIndex]=useState(saved.stageIndex);
  const[responses,setResponses]=useState(saved.responses);
  const[orders,setOrders]=useState(saved.orders);
  const[checked,setChecked]=useState(saved.checked);
  const[results,setResults]=useState(saved.results);
  const stage=lessonTwentyTwoStages[stageIndex];
  const activity=stage.activity;
  useEffect(()=>{localStorage.setItem(KEY,JSON.stringify({version:1,stageIndex,responses,orders,checked,results} satisfies Saved))},[stageIndex,responses,orders,checked,results]);
  useEffect(()=>{const jump=(event:Event)=>{const detail=(event as CustomEvent<{lessonNumber:number;stageIndex:number}>).detail;if(detail?.lessonNumber!==22)return;setStageIndex(Math.min(Math.max(detail.stageIndex,0),lessonTwentyTwoStages.length-1));window.scrollTo({top:0,behavior:'smooth'})};window.addEventListener('mathnikita-go-to-stage',jump);return()=>window.removeEventListener('mathnikita-go-to-stage',jump)},[]);
  const practiceCorrect=lessonTwentyTwoStages.filter(item=>item.kind==='practice'&&item.activity).filter(item=>results[item.activity!.id]).length;
  const quizCorrect=lessonTwentyTwoStages.filter(item=>item.kind==='quiz'&&item.activity).filter(item=>results[item.activity!.id]).length;
  const currentOrder=activity?orders[activity.id]??[]:[];
  const currentResponse=activity?responses[activity.id]??'':'';
  const isCorrect=activity?Boolean(results[activity.id]):true;
  const wasChecked=activity?Boolean(checked[activity.id]):false;
  function choose(value:string){if(!activity)return;setResponses(previous=>({...previous,[activity.id]:value}));setChecked(previous=>({...previous,[activity.id]:false}))}
  function addOrder(value:string){if(!activity)return;setOrders(previous=>({...previous,[activity.id]:[...(previous[activity.id]??[]),value]}));setChecked(previous=>({...previous,[activity.id]:false}))}
  function removeOrder(index:number){if(!activity)return;setOrders(previous=>({...previous,[activity.id]:(previous[activity.id]??[]).filter((_,itemIndex)=>itemIndex!==index)}));setChecked(previous=>({...previous,[activity.id]:false}))}
  function checkAnswer(){if(!activity)return;const correct=activity.type==='order'?sameOrder(currentOrder,activity.answer as string[]):normalize(currentResponse)===normalize(activity.answer as string);setChecked(previous=>({...previous,[activity.id]:true}));setResults(previous=>({...previous,[activity.id]:correct}))}
  function resetActivity(){if(!activity)return;setResponses(previous=>({...previous,[activity.id]:''}));setOrders(previous=>({...previous,[activity.id]:[]}));setChecked(previous=>({...previous,[activity.id]:false}));setResults(previous=>({...previous,[activity.id]:false}))}
  function move(delta:number){setStageIndex(index=>Math.min(Math.max(index+delta,0),lessonTwentyTwoStages.length-1));window.scrollTo({top:0,behavior:'smooth'})}
  return <main className="lesson-player-page"><div className="lesson-workspace">
    <header className="lesson-header"><div><span>Урок 22 · § 7</span><h1>Свойства сложения</h1><p>Перестановка, группировка и рациональные вычисления.</p></div><div className="lesson-duration">≈ 45 минут</div></header>
    <div className="lesson-progress"><i style={{width:`${((stageIndex+1)/lessonTwentyTwoStages.length)*100}%`}}/></div>
    <div className="stage-counter"><span>Этап {stageIndex+1} из {lessonTwentyTwoStages.length}</span><div><small>{practiceCorrect}/6 практика · {quizCorrect}/5 контроль</small></div></div>
    <section className={`interactive-stage stage-${stage.kind}`} data-stage-id={stage.id}>
      <div className="stage-copy"><span>{stage.eyebrow}</span><h2>{stage.title}</h2><p>{stage.body}</p>{stage.note?<p><b>{stage.note}</b></p>:null}{stage.sourceTag?<small className="properties-source">{stage.sourceTag}</small>:null}</div>
      <PropertiesVisual kind={stage.visual}/>
      {activity?<div className="activity-area"><h3>{activity.prompt}</h3>
        {activity.type==='choice'?<div className="choice-grid">{activity.options?.map(option=><button key={option} type="button" className={currentResponse===option?'selected':''} onClick={()=>choose(option)}>{option}</button>)}</div>:null}
        {activity.type==='input'?<div className="inline-answer"><input value={currentResponse} onChange={event=>choose(event.target.value)} onKeyDown={event=>event.key==='Enter'&&currentResponse.trim()&&checkAnswer()} placeholder={activity.placeholder??'Ответ'}/></div>:null}
        {activity.type==='order'?<><div className="order-bank">{activity.items?.map(item=><button key={item} type="button" disabled={currentOrder.includes(item)} onClick={()=>addOrder(item)}>{item}</button>)}</div><div className="order-result">{currentOrder.length?currentOrder.map((item,index)=><button key={`${item}-${index}`} type="button" onClick={()=>removeOrder(index)}>{index+1}. {item}</button>):<span>Нажимай шаги по порядку</span>}</div></>:null}
        <div className="activity-actions"><button type="button" className="secondary" onClick={resetActivity}>Сбросить</button><button type="button" className="check-button" disabled={activity.type==='order'?!currentOrder.length:!currentResponse.trim()} onClick={checkAnswer}>Проверить</button></div>
        {wasChecked?<div className={`instant-feedback ${isCorrect?'good':'bad'}`} data-explanation={activity.explanation}><b>{isCorrect?'Верно!':'Проверь ещё раз'}</b><span>{activity.explanation}</span></div>:null}
      </div>:null}
      {stage.kind==='quiz'?<div className="quiz-meter"><span>Контроль урока</span><b>{quizCorrect}/5</b></div>:null}
      {stage.kind==='summary'?<div className="summary-card"><div><span>Контроль</span><b>{quizCorrect}/5</b><small>самостоятельных заданий</small></div><div><span>Практика</span><b>{practiceCorrect}/6</b><small>основных упражнений</small></div><div><span>Статус</span><b>{quizCorrect===5&&practiceCorrect===6?'Завершён':'Нужно закончить'}</b><small>урок 22</small></div></div>:null}
    </section>
    <nav className="lesson-controls" aria-label="Переход между этапами"><button type="button" disabled={stageIndex===0} onClick={()=>move(-1)}>← Назад</button><span>{stageIndex+1} / {lessonTwentyTwoStages.length}</span><button type="button" className="primary" disabled={stageIndex===lessonTwentyTwoStages.length-1||(Boolean(activity)&&!isCorrect)} onClick={()=>move(1)}>{stageIndex===lessonTwentyTwoStages.length-1?'Завершено':'Дальше →'}</button></nav>
  </div></main>;
}
