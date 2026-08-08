import { useEffect,useMemo,useState } from 'react';
import './lessonPlayer.css';
import './theoryExperience.css';
import './additionProperties.css';

type Activity={id:string;type:'choice'|'input'|'order';prompt:string;options?:string[];items?:string[];answer:string|string[];explanation:string;placeholder?:string};
type Visual='inverse'|'terms'|'difference'|'column'|'borrow'|'zeros'|'check'|'properties'|'story'|'error'|'algorithm'|'challenge';
type Stage={id:string;title:string;eyebrow:string;kind:'story'|'model'|'guided'|'practice'|'quiz'|'challenge'|'summary';body:string;note?:string;sourceTag?:string;visual?:Visual;activity?:Activity};
type Saved={version:1;stageIndex:number;responses:Record<string,string>;orders:Record<string,string[]>;checked:Record<string,boolean>;results:Record<string,boolean>};

const KEY='mathnikita-lesson-25-progress-v1';

export const lessonTwentyFiveStages:Stage[]=[
  {id:'l25-mission',kind:'story',eyebrow:'Глава 2 · § 8 · новая тема',title:'Вычитание начинаем со связи со сложением',body:'Вычитание — не отдельный набор механических правил. Если 12 + 5 = 17, то 17 − 5 = 12. Сегодня построим эту связь, назовём компоненты вычитания, разберём письменный алгоритм и научимся проверять ответ сложением.',note:'По технологической карте урока 25 изучаем § 8 на странице 55 только до правила вычитания суммы из числа. Линия первичного закрепления: № 197, 199, 201, 202, 203; повторение № 237 (1–2).',sourceTag:'Мерзляк · § 8 · технологическая карта урока 25',visual:'inverse'},
  {id:'l25-warmup',kind:'guided',eyebrow:'Актуализация',title:'Найди неизвестное слагаемое',body:'Если известно целое и одна часть, вторую часть можно восстановить вычитанием.',activity:{id:'l25-a1',type:'input',prompt:'Какое число нужно прибавить к 5, чтобы получить 17?',answer:'12',placeholder:'Число',explanation:'5 + 12 = 17, поэтому 17 − 5 = 12.'},visual:'inverse'},
  {id:'l25-definition',kind:'model',eyebrow:'Новое понятие',title:'Что означает запись a − b = c',body:'Разность a − b равна такому числу c, которое вместе с b даёт a: b + c = a. Поэтому сложение — естественный способ проверить вычитание.',note:'Это определение особенно полезно, когда нужно не просто посчитать, а объяснить смысл действия.',sourceTag:'Мерзляк · § 8 · определение вычитания через сложение',visual:'inverse'},
  {id:'l25-terms',kind:'guided',eyebrow:'Язык математики',title:'Уменьшаемое, вычитаемое, разность',body:'В записи 173 − 89 = 84 число 173 — уменьшаемое, 89 — вычитаемое, 84 — разность.',activity:{id:'l25-a2',type:'choice',prompt:'Как называется число 89 в записи 173 − 89 = 84?',options:['Вычитаемое','Уменьшаемое','Разность','Слагаемое'],answer:'Вычитаемое',explanation:'89 — число, которое вычитают, поэтому это вычитаемое.'},visual:'terms'},
  {id:'l25-difference',kind:'model',eyebrow:'Смысл разности',title:'Разность отвечает на вопрос «на сколько?»',body:'Если одно количество больше другого, их разность показывает, на сколько первое больше второго или второе меньше первого. Например, 95 − 73 = 22: 95 больше 73 на 22.',visual:'difference'},
  {id:'l25-practice1',kind:'practice',eyebrow:'Практика · 1/6',title:'Связь со сложением',body:'Вычисли и мысленно проверь результат обратным действием.',activity:{id:'l25-p1',type:'input',prompt:'Вычисли: 2 368 − 572.',answer:'1796',placeholder:'Разность',explanation:'2 368 − 572 = 1 796. Проверка: 1 796 + 572 = 2 368.'},visual:'inverse'},
  {id:'l25-column',kind:'model',eyebrow:'Письменный алгоритм',title:'Одинаковые разряды — друг под другом',body:'При вычитании столбиком единицы записываем под единицами, десятки под десятками, сотни под сотнями. Начинаем справа. Если цифры уменьшаемого достаточно, вычитаем в этом разряде без размена.',note:'Аккуратное выравнивание разрядов — часть алгоритма, а не вопрос оформления.',visual:'column'},
  {id:'l25-practice2',kind:'practice',eyebrow:'Практика · 2/6',title:'Без перехода через разряд',body:'Сначала проверь расположение разрядов, затем считай справа налево.',activity:{id:'l25-p2',type:'input',prompt:'Вычисли: 4 938 − 2 714.',answer:'2224',placeholder:'Ответ',explanation:'По разрядам получаем 2 224. Проверка: 2 224 + 2 714 = 4 938.'},visual:'column'},
  {id:'l25-borrow',kind:'model',eyebrow:'Переход через разряд',title:'Если единиц не хватает — размениваем десяток',body:'В одном десятке 10 единиц. Если в разряде уменьшаемого цифра меньше цифры вычитаемого, берём одну единицу старшего разряда и превращаем её в 10 единиц текущего разряда. То же рассуждение работает для десятков, сотен и тысяч.',visual:'borrow'},
  {id:'l25-practice3',kind:'practice',eyebrow:'Практика · 3/6',title:'Размен одного и нескольких разрядов',body:'Следи не только за текущим разрядом, но и за тем, как изменился старший.',activity:{id:'l25-p3',type:'input',prompt:'Вычисли: 6 204 − 1 876.',answer:'4328',placeholder:'Ответ',explanation:'После необходимых разменов получаем 4 328. Проверка: 4 328 + 1 876 = 6 204.'},visual:'borrow'},
  {id:'l25-zeros',kind:'model',eyebrow:'Цепочка нулей',title:'Через нули размен идёт по цепочке',body:'В примере вроде 50 000 − 27 846 нельзя «занять у нуля». Идём влево до первого ненулевого разряда, уменьшаем его на 1 и передаём размен вправо по цепочке. Каждый пройденный нулевой разряд становится 9 после передачи единицы дальше.',note:'Это место требует медленного проговаривания разрядов; скорость здесь хуже точности.',visual:'zeros'},
  {id:'l25-practice4',kind:'practice',eyebrow:'Практика · 4/6',title:'Вычитание через несколько нулей',body:'Выполни цепочку разменов на бумаге.',activity:{id:'l25-p4',type:'input',prompt:'Вычисли: 50 000 − 27 846.',answer:'22154',placeholder:'Ответ',explanation:'50 000 − 27 846 = 22 154. Проверка: 22 154 + 27 846 = 50 000.'},visual:'zeros'},
  {id:'l25-check',kind:'model',eyebrow:'Самопроверка',title:'Разность + вычитаемое = уменьшаемое',body:'После письменного вычитания не нужно повторять тот же алгоритм второй раз. Сложи найденную разность и вычитаемое. Если получилось исходное уменьшаемое, связь действий подтверждает результат.',visual:'check'},
  {id:'l25-practice5',kind:'practice',eyebrow:'Практика · 5/6',title:'Выбери правильную проверку',body:'Проверка должна восстановить исходное число.',activity:{id:'l25-p5',type:'choice',prompt:'Какая проверка подходит для 5 260 − 1 784 = 3 476?',options:['3 476 + 1 784 = 5 260','5 260 + 1 784 = 3 476','5 260 − 3 476 = 7 044','1 784 − 3 476 = 5 260'],answer:'3 476 + 1 784 = 5 260',explanation:'Разность плюс вычитаемое должны дать уменьшаемое.'},visual:'check'},
  {id:'l25-properties',kind:'model',eyebrow:'Два важных случая',title:'Вычитание нуля и числа из самого себя',body:'Если ничего не вычесть, число не изменится: a − 0 = a. Если вычесть всё исходное количество, останется 0: a − a = 0.',note:'Эти свойства следуют из смысла действия и легко проверяются сложением.',visual:'properties'},
  {id:'l25-story',kind:'model',eyebrow:'Текстовая задача',title:'Когда задача просит вычитать',body:'Сигналы бывают разными: «осталось», «на сколько больше», «на сколько меньше», «какова разница». Но действие выбираем не по слову, а по связи величин: из целого убираем часть или сравниваем два количества.',sourceTag:'Мерзляк · § 8 · линия упражнений 197–203',visual:'story'},
  {id:'l25-practice6',kind:'practice',eyebrow:'Практика · 6/6',title:'Остаток после уменьшения',body:'На складе было 12 500 кг груза. Отправили 4 780 кг.',activity:{id:'l25-p6',type:'input',prompt:'Сколько килограммов груза осталось?',answer:'7720',placeholder:'Осталось, кг',explanation:'12 500 − 4 780 = 7 720 кг.'},visual:'story'},
  {id:'l25-error',kind:'guided',eyebrow:'Разбор ошибки',title:'Неверный ответ должен провалить обратную проверку',body:'Ученик записал 5 000 − 2 738 = 3 738. Вместо повторения тех же шагов проверь связь действий.',activity:{id:'l25-a3',type:'choice',prompt:'Как быстрее всего доказать, что ответ неверен?',options:['Сложить 3 738 и 2 738','Переписать пример ещё раз','Поменять числа местами','Посчитать только последнюю цифру'],answer:'Сложить 3 738 и 2 738',explanation:'3 738 + 2 738 не равно 5 000. Значит найденная разность неверна.'},visual:'error'},
  {id:'l25-quiz1',kind:'quiz',eyebrow:'Контроль · 1/5',title:'Точное вычитание',body:'Работай самостоятельно.',activity:{id:'l25-q1',type:'input',prompt:'Вычисли: 803 − 467.',answer:'336',placeholder:'Ответ',explanation:'803 − 467 = 336; 336 + 467 = 803.'},visual:'borrow'},
  {id:'l25-quiz2',kind:'quiz',eyebrow:'Контроль · 2/5',title:'Компоненты действия',body:'Работай без подсказки.',activity:{id:'l25-q2',type:'choice',prompt:'Как называется число 803 в записи 803 − 467 = 336?',options:['Уменьшаемое','Вычитаемое','Разность','Слагаемое'],answer:'Уменьшаемое',explanation:'803 — число, из которого вычитают, поэтому это уменьшаемое.'},visual:'terms'},
  {id:'l25-quiz3',kind:'quiz',eyebrow:'Контроль · 3/5',title:'Нули и размен',body:'Не спеши на цепочке нулей.',activity:{id:'l25-q3',type:'input',prompt:'Вычисли: 7 000 − 3 856.',answer:'3144',placeholder:'Ответ',explanation:'7 000 − 3 856 = 3 144.'},visual:'zeros'},
  {id:'l25-quiz4',kind:'quiz',eyebrow:'Контроль · 4/5',title:'Сравнение двух величин',body:'В первом городе 8 450 участников, во втором 3 765.',activity:{id:'l25-q4',type:'input',prompt:'На сколько участников в первом городе больше?',answer:'4685',placeholder:'Разница',explanation:'8 450 − 3 765 = 4 685.'},visual:'difference'},
  {id:'l25-quiz5',kind:'quiz',eyebrow:'Контроль · 5/5',title:'Смысл свойства',body:'Выбери равенство, которое верно всегда.',activity:{id:'l25-q5',type:'choice',prompt:'Что верно для любого натурального a?',options:['a − 0 = a','a − 0 = 0','a − a = a','0 − a = a'],answer:'a − 0 = a',explanation:'Если из числа ничего не вычитают, оно не изменяется.'},visual:'properties'},
  {id:'l25-challenge',kind:'challenge',eyebrow:'Задача повышенной сложности',title:'Восстанови пропущенную цифру через обратное действие',body:'В записи 7□2 − 348 = 374 пропущена цифра. Не перебирай все десять вариантов: сначала восстанови уменьшаемое сложением.',activity:{id:'l25-c1',type:'input',prompt:'Какую цифру нужно поставить вместо □?',answer:'2',placeholder:'Цифра',explanation:'374 + 348 = 722. Значит исходное уменьшаемое 722 и пропущена цифра 2.'},visual:'challenge'},
  {id:'l25-summary',kind:'summary',eyebrow:'Итог первого урока § 8',title:'Вычитание теперь связано со смыслом и проверкой',body:'Ты связал вычитание со сложением, научился называть его компоненты, находить разность многозначных чисел по разрядам, проходить через нули, проверять результат сложением и применять вычитание в задачах.',note:'Рефлексия: «Теперь я понимаю …», «При вычитании через нули мне помогает …», «Проверка сложением нужна, потому что …». После основной части обязательны 20 курируемых заданий.',sourceTag:'Мерзляк · § 8 · урок 25 · первичное изучение вычитания'},
];

function load():Saved{
  const fallback:Saved={version:1,stageIndex:0,responses:{},orders:{},checked:{},results:{}};
  try{const raw=localStorage.getItem(KEY);if(!raw)return fallback;const parsed=JSON.parse(raw) as Partial<Saved>;return{version:1,stageIndex:Math.min(Math.max(Number(parsed.stageIndex)||0,0),lessonTwentyFiveStages.length-1),responses:parsed.responses??{},orders:parsed.orders??{},checked:parsed.checked??{},results:parsed.results??{}}}catch{return fallback}
}
function normalize(value:string){return value.trim().toLowerCase().replace(/\s+/g,'').replace(/[−–]/g,'-')}
function sameOrder(a:string[],b:string[]){return a.length===b.length&&a.every((value,index)=>value===b[index])}

function SubtractionVisual({kind}:{kind?:Visual}){
  if(kind==='inverse'||kind==='check')return <div className="properties-visual"><div className="letter-chain"><span>173 − 89 = 84</span><i>↔</i><strong>84 + 89 = 173</strong></div></div>;
  if(kind==='terms')return <div className="properties-visual"><div className="property-cards"><div><b>173</b><span>уменьшаемое</span></div><div><b>89</b><span>вычитаемое</span></div><div><b>84</b><span>разность</span></div></div></div>;
  if(kind==='difference')return <div className="properties-visual"><div className="property-hero"><b>95 − 73 = 22</b><b>на 22 больше</b><span>разность показывает расстояние между двумя количествами</span></div></div>;
  if(kind==='column'||kind==='borrow'||kind==='zeros')return <div className="properties-visual"><div className="property-hero"><b>Разряд под разрядом</b><b>Считаем справа налево</b><span>{kind==='zeros'?'через нули размен передаётся по цепочке':'если цифры не хватает — размениваем единицу старшего разряда'}</span></div></div>;
  if(kind==='properties')return <div className="properties-visual"><div className="property-cards"><div><b>a − 0 = a</b><span>ничего не убрали</span></div><div><b>a − a = 0</b><span>убрали всё</span></div></div></div>;
  if(kind==='error')return <div className="properties-visual"><div className="property-hero"><b>Ответ?</b><b>Разность + вычитаемое</b><span>должно вернуться уменьшаемое</span></div></div>;
  if(kind==='challenge')return <div className="properties-visual"><div className="challenge-pairs"><b>7□2 − 348 = 374</b><strong>374 + 348 = 722</strong></div></div>;
  if(kind==='story')return <div className="properties-visual"><div className="property-hero"><b>Было → уменьшилось</b><b>Больше ↔ меньше</b><span>выбирай действие по связи величин, а не по одному слову</span></div></div>;
  return <div className="properties-visual"><div className="properties-algorithm">{['Понять смысл','Выровнять разряды','Вычесть','Проверить сложением'].map((text,index)=><div key={text}><b>{index+1}</b><span>{text}</span></div>)}</div></div>;
}

export function NaturalNumberSubtractionPlayer(){
  const saved=useMemo(load,[]);
  const[stageIndex,setStageIndex]=useState(saved.stageIndex);
  const[responses,setResponses]=useState(saved.responses);
  const[orders,setOrders]=useState(saved.orders);
  const[checked,setChecked]=useState(saved.checked);
  const[results,setResults]=useState(saved.results);
  const stage=lessonTwentyFiveStages[stageIndex];
  const activity=stage.activity;
  useEffect(()=>{localStorage.setItem(KEY,JSON.stringify({version:1,stageIndex,responses,orders,checked,results} satisfies Saved))},[stageIndex,responses,orders,checked,results]);
  useEffect(()=>{const jump=(event:Event)=>{const detail=(event as CustomEvent<{lessonNumber:number;stageIndex:number}>).detail;if(detail?.lessonNumber!==25)return;setStageIndex(Math.min(Math.max(detail.stageIndex,0),lessonTwentyFiveStages.length-1));window.scrollTo({top:0,behavior:'smooth'})};window.addEventListener('mathnikita-go-to-stage',jump);return()=>window.removeEventListener('mathnikita-go-to-stage',jump)},[]);
  const practiceCorrect=lessonTwentyFiveStages.filter(item=>item.kind==='practice'&&item.activity).filter(item=>results[item.activity!.id]).length;
  const quizCorrect=lessonTwentyFiveStages.filter(item=>item.kind==='quiz'&&item.activity).filter(item=>results[item.activity!.id]).length;
  const currentOrder=activity?orders[activity.id]??[]:[];
  const currentResponse=activity?responses[activity.id]??'':'';
  const isCorrect=activity?Boolean(results[activity.id]&&checked[activity.id]):true;
  const wasChecked=activity?Boolean(checked[activity.id]):false;
  function invalidateCurrent(){if(!activity)return;setChecked(previous=>({...previous,[activity.id]:false}));setResults(previous=>({...previous,[activity.id]:false}))}
  function choose(value:string){if(!activity)return;setResponses(previous=>({...previous,[activity.id]:value}));invalidateCurrent()}
  function addOrder(value:string){if(!activity)return;setOrders(previous=>({...previous,[activity.id]:[...(previous[activity.id]??[]),value]}));invalidateCurrent()}
  function removeOrder(index:number){if(!activity)return;setOrders(previous=>({...previous,[activity.id]:(previous[activity.id]??[]).filter((_,itemIndex)=>itemIndex!==index)}));invalidateCurrent()}
  function checkAnswer(){if(!activity)return;const correct=activity.type==='order'?sameOrder(currentOrder,activity.answer as string[]):normalize(currentResponse)===normalize(activity.answer as string);setChecked(previous=>({...previous,[activity.id]:true}));setResults(previous=>({...previous,[activity.id]:correct}))}
  function resetActivity(){if(!activity)return;setResponses(previous=>({...previous,[activity.id]:''}));setOrders(previous=>({...previous,[activity.id]:[]}));setChecked(previous=>({...previous,[activity.id]:false}));setResults(previous=>({...previous,[activity.id]:false}))}
  function move(delta:number){setStageIndex(index=>Math.min(Math.max(index+delta,0),lessonTwentyFiveStages.length-1));window.scrollTo({top:0,behavior:'smooth'})}
  return <main className="lesson-player-page"><div className="lesson-workspace">
    <header className="lesson-header"><div><span>Урок 25 · § 8 · новая тема</span><h1>Вычитание натуральных чисел</h1><p>Смысл действия, письменный алгоритм, проверка сложением и первые задачи.</p></div><div className="lesson-duration">≈ 48 минут</div></header>
    <div className="lesson-progress"><i style={{width:`${((stageIndex+1)/lessonTwentyFiveStages.length)*100}%`}}/></div>
    <div className="stage-counter"><span>Этап {stageIndex+1} из {lessonTwentyFiveStages.length}</span><div><small>{practiceCorrect}/6 практика · {quizCorrect}/5 контроль</small></div></div>
    <section className={`interactive-stage stage-${stage.kind}`} data-stage-id={stage.id}>
      <div className="stage-copy"><span>{stage.eyebrow}</span><h2>{stage.title}</h2><p>{stage.body}</p>{stage.note?<p><b>{stage.note}</b></p>:null}{stage.sourceTag?<small className="properties-source">{stage.sourceTag}</small>:null}</div>
      <SubtractionVisual kind={stage.visual}/>
      {activity?<div className="activity-area"><h3>{activity.prompt}</h3>
        {activity.type==='choice'?<div className="choice-grid">{activity.options?.map(option=><button key={option} type="button" className={currentResponse===option?'selected':''} onClick={()=>choose(option)}>{option}</button>)}</div>:null}
        {activity.type==='input'?<div className="inline-answer"><input value={currentResponse} onChange={event=>choose(event.target.value)} onKeyDown={event=>event.key==='Enter'&&currentResponse.trim()&&checkAnswer()} placeholder={activity.placeholder??'Ответ'}/></div>:null}
        {activity.type==='order'?<><div className="order-bank">{activity.items?.map(item=><button key={item} type="button" disabled={currentOrder.includes(item)} onClick={()=>addOrder(item)}>{item}</button>)}</div><div className="order-result">{currentOrder.length?currentOrder.map((item,index)=><button key={`${item}-${index}`} type="button" onClick={()=>removeOrder(index)}>{index+1}. {item}</button>):<span>Нажимай шаги по порядку</span>}</div></>:null}
        <div className="activity-actions"><button type="button" className="secondary" onClick={resetActivity}>Сбросить</button><button type="button" className="check-button" disabled={activity.type==='order'?!currentOrder.length:!currentResponse.trim()} onClick={checkAnswer}>Проверить</button></div>
        {wasChecked?<div className={`instant-feedback ${isCorrect?'good':'bad'}`} data-explanation={activity.explanation}><b>{isCorrect?'Верно!':'Проверь ещё раз'}</b><span>{activity.explanation}</span></div>:null}
      </div>:null}
      {stage.kind==='quiz'?<div className="quiz-meter"><span>Контроль урока 25</span><b>{quizCorrect}/5</b></div>:null}
      {stage.kind==='summary'?<div className="summary-card"><div><span>Контроль</span><b>{quizCorrect}/5</b><small>самостоятельных заданий</small></div><div><span>Практика</span><b>{practiceCorrect}/6</b><small>основных упражнений</small></div><div><span>Статус</span><b>{quizCorrect===5&&practiceCorrect===6?'Основная часть готова':'Нужно закончить'}</b><small>дальше — 20 обязательных заданий</small></div></div>:null}
    </section>
    <nav className="lesson-controls" aria-label="Переход между этапами"><button type="button" disabled={stageIndex===0} onClick={()=>move(-1)}>← Назад</button><span>{stageIndex+1} / {lessonTwentyFiveStages.length}</span><button type="button" className="primary" disabled={stageIndex===lessonTwentyFiveStages.length-1||(Boolean(activity)&&!isCorrect)} onClick={()=>move(1)}>{stageIndex===lessonTwentyFiveStages.length-1?'Основная часть завершена':'Дальше →'}</button></nav>
  </div></main>;
}
