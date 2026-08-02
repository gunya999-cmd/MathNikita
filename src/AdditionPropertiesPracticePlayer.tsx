import { useEffect,useMemo,useState } from 'react';
import './lessonPlayer.css';
import './theoryExperience.css';
import './additionProperties.css';

type Activity={id:string;type:'choice'|'input'|'order';prompt:string;options?:string[];items?:string[];answer:string|string[];explanation:string;placeholder?:string};
type Visual='mission'|'strategy'|'group'|'letters'|'time'|'error'|'algorithm'|'challenge';
type Stage={id:string;title:string;eyebrow:string;kind:'story'|'model'|'guided'|'practice'|'quiz'|'challenge'|'summary';body:string;note?:string;sourceTag?:string;visual?:Visual;activity?:Activity};
type Saved={version:1;stageIndex:number;responses:Record<string,string>;orders:Record<string,string[]>;checked:Record<string,boolean>;results:Record<string,boolean>};

const KEY='mathnikita-lesson-23-progress-v1';

export const lessonTwentyThreeStages:Stage[]=[
  {id:'l23-mission',kind:'story',eyebrow:'Глава 2 · § 7',title:'Теперь свойства должны работать без подсказки',body:'На уроке 22 мы разобрали переместительное и сочетательное свойства. Сегодня закрепляем их в вычислениях и задачах: сначала увидеть удобный ход, затем объяснить его и только потом считать.',note:'По технологической карте урок 23 — урок закрепления знаний с акцентом на самостоятельную работу и текстовые задачи.',sourceTag:'Мерзляк § 7 · технологическая карта урока 23',visual:'mission'},
  {id:'l23-warmup',kind:'guided',eyebrow:'Актуализация',title:'Увидь круглую сумму сразу',body:'Такие пары экономят время в более длинных выражениях.',activity:{id:'l23-a1',type:'input',prompt:'Вычисли: 650 + 350.',answer:'1000',placeholder:'Сумма',explanation:'650 + 350 = 1 000. Круглые суммы стоит замечать до начала длинного вычисления.'}},
  {id:'l23-strategy',kind:'model',eyebrow:'Стратегия закрепления',title:'Три вопроса перед вычислением',body:'Посмотри на все слагаемые. Есть ли пары до 100, 1 000 или другого круглого числа? Нужно ли менять порядок? Какие числа выгодно заключить в одну группу?',note:'Правильный ответ важен, но на этом уроке важен и рациональный путь.',visual:'strategy'},
  {id:'l23-practice1',kind:'practice',eyebrow:'Практика · 1/6',title:'Две тысячи двумя парами',body:'Не складывай четыре числа подряд.',activity:{id:'l23-p1',type:'input',prompt:'Вычисли удобным способом: 240 + 760 + 135 + 865.',answer:'2000',placeholder:'Ответ',explanation:'240 + 760 = 1 000, 135 + 865 = 1 000. Итого 2 000.'}},
  {id:'l23-property-check',kind:'guided',eyebrow:'Объясни преобразование',title:'Иногда нужны оба свойства',body:'В длинной сумме мы можем и переставить слагаемые, и изменить их группировку.',activity:{id:'l23-a2',type:'choice',prompt:'Что использовано в переходе 95 + 416 + 284 = (416 + 284) + 95?',options:['Только переместительное','Только сочетательное','Оба свойства','Ни одно'],answer:'Оба свойства',explanation:'95 перенесли в конец — это перестановка; 416 и 284 объединили в удобную группу — это сочетательное свойство.'}},
  {id:'l23-practice2',kind:'practice',eyebrow:'Практика · 2/6',title:'Сначала выбери пару',body:'Результат можно получить по-разному, но один путь заметно короче.',activity:{id:'l23-p2',type:'input',prompt:'Вычисли удобным способом: 95 + 416 + 284.',answer:'795',placeholder:'Ответ',explanation:'416 + 284 = 700, затем 700 + 95 = 795.'}},
  {id:'l23-grouping',kind:'model',eyebrow:'Усложняем',title:'Удобные пары могут быть далеко друг от друга',body:'В выражении 1 275 + 3 480 + 725 + 520 соседние числа не образуют лучших пар. Свойства позволяют соединить 1 275 с 725, а 3 480 с 520.',note:'Именно поэтому сначала анализируем всю сумму, а не начинаем считать слева направо.',visual:'group'},
  {id:'l23-practice3',kind:'practice',eyebrow:'Практика · 3/6',title:'Две круглые группы',body:'Найди пару до 2 000 и пару до 4 000.',activity:{id:'l23-p3',type:'input',prompt:'Вычисли: 1 275 + 3 480 + 725 + 520.',answer:'6000',placeholder:'Ответ',explanation:'1 275 + 725 = 2 000, 3 480 + 520 = 4 000. Всего 6 000.'}},
  {id:'l23-letters',kind:'model',eyebrow:'Буквенное выражение',title:'Неизвестное число не мешает собирать известные',body:'Если значение x неизвестно, числовые слагаемые всё равно можно переставить и сгруппировать. Например, 185 + (x + 315) превращается в 500 + x.',visual:'letters'},
  {id:'l23-practice4',kind:'practice',eyebrow:'Практика · 4/6',title:'Упрости без значения x',body:'Собери только известные числа.',activity:{id:'l23-p4',type:'choice',prompt:'Как упростить 185 + (x + 315)?',options:['500 + x','185 + 315x','x + 130','500x'],answer:'500 + x',explanation:'185 + (x + 315) = 185 + (315 + x) = (185 + 315) + x = 500 + x.'}},
  {id:'l23-text-model',kind:'model',eyebrow:'Текстовые задачи',title:'Сначала восстанови недостающее значение',body:'В задаче одно количество может быть задано через другое. Тогда сначала выполняем действие по связи «на сколько больше», а уже после этого считаем общий итог.',note:'Методическая карта урока 23 отдельно усиливает навыки решения текстовых задач арифметическим способом.',sourceTag:'Методическая линия № 182, 184, 186 · новые данные',visual:'strategy'},
  {id:'l23-practice5',kind:'practice',eyebrow:'Практика · 5/6',title:'Три дня работы',body:'За первый день выполнили 12 450 деталей. За второй — на 550 больше, чем за первый. За третий — 7 000 деталей.',activity:{id:'l23-p5',type:'input',prompt:'Сколько деталей изготовили за три дня?',answer:'32450',placeholder:'Всего деталей',explanation:'Во второй день: 12 450 + 550 = 13 000. Всего: 12 450 + 13 000 + 7 000 = 32 450.'}},
  {id:'l23-error',kind:'guided',eyebrow:'Разбор ошибки',title:'Название свойства должно совпадать с действием',body:'Ученик написал: (398 + 167) + 602 = 398 + (167 + 602) и назвал это переместительным свойством.',activity:{id:'l23-a3',type:'choice',prompt:'Какое свойство применено на самом деле?',options:['Сочетательное','Переместительное','Свойство нуля','Распределительное'],answer:'Сочетательное',explanation:'Порядок слагаемых 398, 167, 602 не изменился. Изменилась только группировка, значит свойство сочетательное.'},visual:'error'},
  {id:'l23-time',kind:'guided',eyebrow:'Составные величины',title:'Перенос между единицами',body:'При сложении времени сначала объединяем одинаковые единицы, а затем переводим лишние 60 минут в час.',activity:{id:'l23-a4',type:'input',prompt:'Вычисли: 2 ч 48 мин + 1 ч 35 мин. Запиши «4 ч 23 мин».',answer:'4ч23мин',placeholder:'Ответ',explanation:'48 + 35 = 83 мин = 1 ч 23 мин; 2 + 1 + 1 = 4 ч. Ответ: 4 ч 23 мин.'},visual:'time'},
  {id:'l23-algorithm',kind:'model',eyebrow:'Самостоятельная работа',title:'Для задачи нужен план, а не угадывание действия',body:'Прочитай вопрос, найди связи между величинами, вычисли недостающие данные, затем выбери удобный порядок сложения и обязательно проверь смысл ответа.',visual:'algorithm'},
  {id:'l23-practice6',kind:'practice',eyebrow:'Практика · 6/6',title:'Собери план текстовой задачи',body:'Расположи шаги так, чтобы решение было понятным и проверяемым.',activity:{id:'l23-p6',type:'order',prompt:'Как решать задачу, где одно слагаемое задано через другое?',items:['Прочитать вопрос и выделить известные величины','Найти величину, заданную через другую','Записать все величины, которые входят в итог','Выбрать удобный порядок сложения','Проверить вычисления и записать ответ с единицами'],answer:['Прочитать вопрос и выделить известные величины','Найти величину, заданную через другую','Записать все величины, которые входят в итог','Выбрать удобный порядок сложения','Проверить вычисления и записать ответ с единицами'],explanation:'Сначала восстанавливаем недостающие данные, затем считаем итог и проверяем его.'}},
  {id:'l23-quiz1',kind:'quiz',eyebrow:'Контроль · 1/5',title:'Удобная сумма',body:'Работай самостоятельно.',activity:{id:'l23-q1',type:'input',prompt:'Вычисли удобным способом: 675 + 325 + 148.',answer:'1148',placeholder:'Ответ',explanation:'675 + 325 = 1 000; 1 000 + 148 = 1 148.'}},
  {id:'l23-quiz2',kind:'quiz',eyebrow:'Контроль · 2/5',title:'Сочетательное свойство',body:'Работай самостоятельно.',activity:{id:'l23-q2',type:'choice',prompt:'Какая формула выражает сочетательное свойство сложения?',options:['(a + b) + c = a + (b + c)','a + b = b + a','a + 0 = a','a · b = b · a'],answer:'(a + b) + c = a + (b + c)',explanation:'Сочетательное свойство изменяет группировку трёх слагаемых.'}},
  {id:'l23-quiz3',kind:'quiz',eyebrow:'Контроль · 3/5',title:'Буквенное выражение',body:'Работай самостоятельно.',activity:{id:'l23-q3',type:'choice',prompt:'Упрости 420 + (a + 580).',options:['1 000 + a','420 + 580a','a + 160','1 000a'],answer:'1 000 + a',explanation:'420 + (a + 580) = (420 + 580) + a = 1 000 + a.'}},
  {id:'l23-quiz4',kind:'quiz',eyebrow:'Контроль · 4/5',title:'Задача в два шага',body:'Утром магазин продал 2 350 кг товара, днём — на 650 кг больше, чем утром, вечером — 1 250 кг.',activity:{id:'l23-q4',type:'input',prompt:'Сколько килограммов товара продали за день?',answer:'6600',placeholder:'Ответ',explanation:'Днём: 2 350 + 650 = 3 000. Всего: 2 350 + 3 000 + 1 250 = 6 600 кг.'}},
  {id:'l23-quiz5',kind:'quiz',eyebrow:'Контроль · 5/5',title:'Сложение времени',body:'Работай самостоятельно.',activity:{id:'l23-q5',type:'input',prompt:'Вычисли: 3 ч 45 мин + 2 ч 35 мин. Запиши «6 ч 20 мин».',answer:'6ч20мин',placeholder:'Ответ',explanation:'45 + 35 = 80 мин = 1 ч 20 мин; 3 + 2 + 1 = 6 ч. Ответ: 6 ч 20 мин.'}},
  {id:'l23-challenge',kind:'challenge',eyebrow:'Задача со звёздочкой',title:'Сумма вокруг середины',body:'Числа от 38 до 62 симметричны относительно 50. Соедини первое с последним, второе с предпоследним и так далее.',activity:{id:'l23-c1',type:'input',prompt:'Найди сумму всех натуральных чисел от 38 до 62 включительно.',answer:'1250',placeholder:'Сумма',explanation:'38 + 62 = 100, 39 + 61 = 100 и так далее. Получаем 12 пар по 100 и среднее число 50: 1 200 + 50 = 1 250.'},visual:'challenge'},
  {id:'l23-summary',kind:'summary',eyebrow:'Итог урока 23',title:'Свойства сложения стали рабочим инструментом',body:'Ты закрепил рациональные вычисления, буквенные выражения, сложение составных величин и текстовые задачи в несколько действий. Следующий урок завершит § 7 обобщением и систематизацией.',note:'Методическая домашняя линия урока 23: § 7, № 180, 183, 185.'},
];

function load():Saved{
  const fallback:Saved={version:1,stageIndex:0,responses:{},orders:{},checked:{},results:{}};
  try{const raw=localStorage.getItem(KEY);if(!raw)return fallback;const parsed=JSON.parse(raw) as Partial<Saved>;return{version:1,stageIndex:Math.min(Math.max(Number(parsed.stageIndex)||0,0),lessonTwentyThreeStages.length-1),responses:parsed.responses??{},orders:parsed.orders??{},checked:parsed.checked??{},results:parsed.results??{}}}catch{return fallback}
}
function normalize(value:string){return value.trim().toLowerCase().replace(/\s+/g,'').replace(/[−–]/g,'-')}
function sameOrder(a:string[],b:string[]){return a.length===b.length&&a.every((value,index)=>value===b[index])}

function PracticeVisual({kind}:{kind?:Visual}){
  if(kind==='group')return <div className="properties-visual"><div className="pair-board"><span>1 275</span><span>3 480</span><span>725</span><span>520</span><b>1 275 + 725 = 2 000</b><b>3 480 + 520 = 4 000</b></div></div>;
  if(kind==='letters')return <div className="properties-visual"><div className="letter-chain"><span>185 + (x + 315)</span><i>→</i><span>185 + (315 + x)</span><i>→</i><strong>500 + x</strong></div></div>;
  if(kind==='time')return <div className="properties-visual"><div className="time-board"><div><b>2 ч 48 мин</b><span>+</span><b>1 ч 35 мин</b></div><p>83 мин = 1 ч 23 мин → 4 ч 23 мин</p></div></div>;
  if(kind==='error')return <div className="properties-visual"><div className="property-cards"><div><b>Переместительное</b><span>меняем порядок</span><code>a + b = b + a</code></div><div><b>Сочетательное</b><span>меняем группировку</span><code>(a + b) + c = a + (b + c)</code></div></div></div>;
  if(kind==='algorithm')return <div className="properties-visual"><div className="properties-algorithm">{['Понять вопрос','Восстановить данные','Найти удобный порядок','Вычислить','Проверить смысл'].map((text,index)=><div key={text}><b>{index+1}</b><span>{text}</span></div>)}</div></div>;
  if(kind==='challenge')return <div className="properties-visual"><div className="challenge-pairs"><b>38 + 62</b><b>39 + 61</b><b>40 + 60</b><span>…</span><strong>каждая пара = 100</strong></div></div>;
  if(kind==='strategy')return <div className="properties-visual"><div className="property-hero"><b>Ищу круглую пару</b><b>Выбираю свойство</b><span>Считаю только после того, как увидел короткий путь</span></div></div>;
  return <div className="properties-visual"><div className="property-hero"><b>a + b = b + a</b><b>(a + b) + c = a + (b + c)</b><span>Сегодня — применение без готового маршрута</span></div></div>;
}

export function AdditionPropertiesPracticePlayer(){
  const saved=useMemo(load,[]);
  const[stageIndex,setStageIndex]=useState(saved.stageIndex);
  const[responses,setResponses]=useState(saved.responses);
  const[orders,setOrders]=useState(saved.orders);
  const[checked,setChecked]=useState(saved.checked);
  const[results,setResults]=useState(saved.results);
  const stage=lessonTwentyThreeStages[stageIndex];
  const activity=stage.activity;
  useEffect(()=>{localStorage.setItem(KEY,JSON.stringify({version:1,stageIndex,responses,orders,checked,results} satisfies Saved))},[stageIndex,responses,orders,checked,results]);
  useEffect(()=>{const jump=(event:Event)=>{const detail=(event as CustomEvent<{lessonNumber:number;stageIndex:number}>).detail;if(detail?.lessonNumber!==23)return;setStageIndex(Math.min(Math.max(detail.stageIndex,0),lessonTwentyThreeStages.length-1));window.scrollTo({top:0,behavior:'smooth'})};window.addEventListener('mathnikita-go-to-stage',jump);return()=>window.removeEventListener('mathnikita-go-to-stage',jump)},[]);
  const practiceCorrect=lessonTwentyThreeStages.filter(item=>item.kind==='practice'&&item.activity).filter(item=>results[item.activity!.id]).length;
  const quizCorrect=lessonTwentyThreeStages.filter(item=>item.kind==='quiz'&&item.activity).filter(item=>results[item.activity!.id]).length;
  const currentOrder=activity?orders[activity.id]??[]:[];
  const currentResponse=activity?responses[activity.id]??'':'';
  const isCorrect=activity?Boolean(results[activity.id]):true;
  const wasChecked=activity?Boolean(checked[activity.id]):false;
  function choose(value:string){if(!activity)return;setResponses(previous=>({...previous,[activity.id]:value}));setChecked(previous=>({...previous,[activity.id]:false}))}
  function addOrder(value:string){if(!activity)return;setOrders(previous=>({...previous,[activity.id]:[...(previous[activity.id]??[]),value]}));setChecked(previous=>({...previous,[activity.id]:false}))}
  function removeOrder(index:number){if(!activity)return;setOrders(previous=>({...previous,[activity.id]:(previous[activity.id]??[]).filter((_,itemIndex)=>itemIndex!==index)}));setChecked(previous=>({...previous,[activity.id]:false}))}
  function checkAnswer(){if(!activity)return;const correct=activity.type==='order'?sameOrder(currentOrder,activity.answer as string[]):normalize(currentResponse)===normalize(activity.answer as string);setChecked(previous=>({...previous,[activity.id]:true}));setResults(previous=>({...previous,[activity.id]:correct}))}
  function resetActivity(){if(!activity)return;setResponses(previous=>({...previous,[activity.id]:''}));setOrders(previous=>({...previous,[activity.id]:[]}));setChecked(previous=>({...previous,[activity.id]:false}));setResults(previous=>({...previous,[activity.id]:false}))}
  function move(delta:number){setStageIndex(index=>Math.min(Math.max(index+delta,0),lessonTwentyThreeStages.length-1));window.scrollTo({top:0,behavior:'smooth'})}
  return <main className="lesson-player-page"><div className="lesson-workspace">
    <header className="lesson-header"><div><span>Урок 23 · § 7</span><h1>Сложение и свойства — закрепление</h1><p>Рациональные вычисления и текстовые задачи без готового маршрута.</p></div><div className="lesson-duration">≈ 45 минут</div></header>
    <div className="lesson-progress"><i style={{width:`${((stageIndex+1)/lessonTwentyThreeStages.length)*100}%`}}/></div>
    <div className="stage-counter"><span>Этап {stageIndex+1} из {lessonTwentyThreeStages.length}</span><div><small>{practiceCorrect}/6 практика · {quizCorrect}/5 контроль</small></div></div>
    <section className={`interactive-stage stage-${stage.kind}`} data-stage-id={stage.id}>
      <div className="stage-copy"><span>{stage.eyebrow}</span><h2>{stage.title}</h2><p>{stage.body}</p>{stage.note?<p><b>{stage.note}</b></p>:null}{stage.sourceTag?<small className="properties-source">{stage.sourceTag}</small>:null}</div>
      <PracticeVisual kind={stage.visual}/>
      {activity?<div className="activity-area"><h3>{activity.prompt}</h3>
        {activity.type==='choice'?<div className="choice-grid">{activity.options?.map(option=><button key={option} type="button" className={currentResponse===option?'selected':''} onClick={()=>choose(option)}>{option}</button>)}</div>:null}
        {activity.type==='input'?<div className="inline-answer"><input value={currentResponse} onChange={event=>choose(event.target.value)} onKeyDown={event=>event.key==='Enter'&&currentResponse.trim()&&checkAnswer()} placeholder={activity.placeholder??'Ответ'}/></div>:null}
        {activity.type==='order'?<><div className="order-bank">{activity.items?.map(item=><button key={item} type="button" disabled={currentOrder.includes(item)} onClick={()=>addOrder(item)}>{item}</button>)}</div><div className="order-result">{currentOrder.length?currentOrder.map((item,index)=><button key={`${item}-${index}`} type="button" onClick={()=>removeOrder(index)}>{index+1}. {item}</button>):<span>Нажимай шаги по порядку</span>}</div></>:null}
        <div className="activity-actions"><button type="button" className="secondary" onClick={resetActivity}>Сбросить</button><button type="button" className="check-button" disabled={activity.type==='order'?!currentOrder.length:!currentResponse.trim()} onClick={checkAnswer}>Проверить</button></div>
        {wasChecked?<div className={`instant-feedback ${isCorrect?'good':'bad'}`} data-explanation={activity.explanation}><b>{isCorrect?'Верно!':'Проверь ещё раз'}</b><span>{activity.explanation}</span></div>:null}
      </div>:null}
      {stage.kind==='quiz'?<div className="quiz-meter"><span>Контроль урока</span><b>{quizCorrect}/5</b></div>:null}
      {stage.kind==='summary'?<div className="summary-card"><div><span>Контроль</span><b>{quizCorrect}/5</b><small>самостоятельных заданий</small></div><div><span>Практика</span><b>{practiceCorrect}/6</b><small>основных упражнений</small></div><div><span>Статус</span><b>{quizCorrect===5&&practiceCorrect===6?'Завершён':'Нужно закончить'}</b><small>урок 23</small></div></div>:null}
    </section>
    <nav className="lesson-controls" aria-label="Переход между этапами"><button type="button" disabled={stageIndex===0} onClick={()=>move(-1)}>← Назад</button><span>{stageIndex+1} / {lessonTwentyThreeStages.length}</span><button type="button" className="primary" disabled={stageIndex===lessonTwentyThreeStages.length-1||(Boolean(activity)&&!isCorrect)} onClick={()=>move(1)}>{stageIndex===lessonTwentyThreeStages.length-1?'Завершено':'Дальше →'}</button></nav>
  </div></main>;
}
