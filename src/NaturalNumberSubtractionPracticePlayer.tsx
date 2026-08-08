import { useEffect,useMemo,useState } from 'react';
import './lessonPlayer.css';
import './theoryExperience.css';
import './additionProperties.css';

type Activity={id:string;type:'choice'|'input';prompt:string;options?:string[];answer:string;explanation:string;placeholder?:string};
type Visual='column'|'zeros'|'check'|'story'|'difference'|'error'|'algorithm'|'challenge';
type Stage={id:string;title:string;eyebrow:string;kind:'story'|'model'|'guided'|'practice'|'quiz'|'challenge'|'summary';body:string;note?:string;sourceTag?:string;visual?:Visual;activity?:Activity};
type Saved={version:1;stageIndex:number;responses:Record<string,string>;checked:Record<string,boolean>;results:Record<string,boolean>};

const KEY='mathnikita-lesson-26-progress-v1';

export const lessonTwentySixStages:Stage[]=[
  {id:'l26-mission',kind:'story',eyebrow:'Урок 26 · § 8 · закрепление',title:'Теперь вычитание должно стать надёжным инструментом',body:'Сегодня почти не вводим новых правил. Главная цель — закрепить вычитание натуральных чисел: считать без потери разрядов, видеть математическую модель текстовой задачи и проверять себя сложением.',note:'Технологическая карта урока 26: закрепление знаний; учебник № 206 (1–2), 208, 210, 212, 216; повторение № 238.',sourceTag:'Мерзляк · § 8 · технологическая карта урока 26',visual:'algorithm'},
  {id:'l26-warmup',kind:'guided',eyebrow:'Актуализация',title:'Сначала восстановим смысл вычитания',body:'Если a − b = c, то b + c = a. Эта связь остаётся главным способом самопроверки.',activity:{id:'l26-a1',type:'choice',prompt:'Как проверить равенство 900 − 347 = 553?',options:['553 + 347 = 900','900 + 347 = 553','553 − 347 = 900','347 − 553 = 900'],answer:'553 + 347 = 900',explanation:'Разность плюс вычитаемое должны вернуть уменьшаемое.'},visual:'check'},
  {id:'l26-speed',kind:'model',eyebrow:'Стратегия урока',title:'Сначала точность, потом скорость',body:'На закреплении легко начать спешить. Но одна ошибка при размене портит весь пример. Держи цикл: выровнять разряды → вычесть справа налево → проверить сложением.',visual:'algorithm'},
  {id:'l26-practice1',kind:'practice',eyebrow:'Практика · 1/6',title:'Один переход через разряд',body:'Реши на бумаге и введи только ответ.',activity:{id:'l26-p1',type:'input',prompt:'8 400 − 2 756 = ?',answer:'5644',placeholder:'Ответ',explanation:'8 400 − 2 756 = 5 644.'},visual:'column'},
  {id:'l26-zeros',kind:'model',eyebrow:'Точность вычислений',title:'Ноль не даёт размен сам по себе',body:'Если в нужном старшем разряде стоит 0, идём ещё левее до ненулевой цифры. После передачи единицы по цепочке промежуточные нули превращаются в 9.',note:'Не пытайся держать всю цепочку в голове — помечай изменения над цифрами.',visual:'zeros'},
  {id:'l26-practice2',kind:'practice',eyebrow:'Практика · 2/6',title:'Размен через ноль',body:'Этот пример проверяет именно устойчивость алгоритма.',activity:{id:'l26-p2',type:'input',prompt:'65 003 − 27 849 = ?',answer:'37154',placeholder:'Ответ',explanation:'65 003 − 27 849 = 37 154.'},visual:'zeros'},
  {id:'l26-story-model',kind:'model',eyebrow:'Текстовые задачи',title:'Не ищи «слово-подсказку» — ищи связь величин',body:'Вычитание нужно, когда из целого убирают часть, когда известно целое и нужно найти неизвестную часть, а также при вопросе «на сколько больше/меньше». Сначала сформулируй, что известно и что ищем.',sourceTag:'Мерзляк · урок 26 · арифметический способ решения текстовых задач',visual:'story'},
  {id:'l26-practice3',kind:'practice',eyebrow:'Практика · 3/6',title:'Сколько осталось пройти?',body:'Автобус должен пройти 824 км. Уже пройдено 357 км.',activity:{id:'l26-p3',type:'input',prompt:'Сколько километров осталось?',answer:'467',placeholder:'км',explanation:'824 − 357 = 467 км.'},visual:'story'},
  {id:'l26-difference-model',kind:'model',eyebrow:'Разностное сравнение',title:'«На сколько?» — это расстояние между двумя количествами',body:'Чтобы узнать, на сколько одно количество больше другого, из большего вычитают меньшее. Ответ — не новое количество, а разница между ними.',visual:'difference'},
  {id:'l26-practice4',kind:'practice',eyebrow:'Практика · 4/6',title:'Сравни две библиотеки',body:'В первой библиотеке 18 450 книг, во второй 12 786.',activity:{id:'l26-p4',type:'input',prompt:'На сколько книг в первой библиотеке больше?',answer:'5664',placeholder:'Разница',explanation:'18 450 − 12 786 = 5 664.'},visual:'difference'},
  {id:'l26-part-model',kind:'model',eyebrow:'Неизвестная часть',title:'Было = осталось + убрали',body:'Если известно, сколько было и сколько осталось, количество убранного — это разность. Полезно мысленно записать проверку: осталось + убрали = было.',visual:'story'},
  {id:'l26-practice5',kind:'practice',eyebrow:'Практика · 5/6',title:'Восстанови убранную часть',body:'В парке было 14 300 деревьев. После санитарной вырубки осталось 8 750.',activity:{id:'l26-p5',type:'input',prompt:'Сколько деревьев убрали?',answer:'5550',placeholder:'Деревьев',explanation:'14 300 − 8 750 = 5 550; проверка: 8 750 + 5 550 = 14 300.'},visual:'story'},
  {id:'l26-check-model',kind:'model',eyebrow:'Контроль вычисления',title:'Проверка должна быть независимой от исходного вычитания',body:'Если просто ещё раз выполнить то же вычитание, можно повторить ту же ошибку. Лучше использовать обратное действие: разность + вычитаемое = уменьшаемое.',visual:'check'},
  {id:'l26-practice6',kind:'practice',eyebrow:'Практика · 6/6',title:'Большие числа + проверка',body:'Реши пример аккуратно по разрядам.',activity:{id:'l26-p6',type:'input',prompt:'73 520 − 18 467 = ?',answer:'55053',placeholder:'Ответ',explanation:'73 520 − 18 467 = 55 053; 55 053 + 18 467 = 73 520.'},visual:'check'},
  {id:'l26-error',kind:'guided',eyebrow:'Разбор ошибки',title:'Не доверяй красивому ответу — проверяй связь действий',body:'Ученик записал 70 000 − 28 439 = 51 561.',activity:{id:'l26-a2',type:'choice',prompt:'Как быстрее всего доказать, что ответ неверен?',options:['Сложить 51 561 и 28 439','Посмотреть только на последнюю цифру','Переписать пример без вычислений','Поменять числа местами'],answer:'Сложить 51 561 и 28 439',explanation:'51 561 + 28 439 не равно 70 000. Правильная разность — 41 561.'},visual:'error'},
  {id:'l26-algorithm',kind:'model',eyebrow:'Перед контролем',title:'Четыре вопроса перед тем, как нажать «Проверить»',body:'1) Я правильно определил, что нужно вычитать? 2) Разряды стоят друг под другом? 3) Все размены отмечены? 4) Ответ прошёл обратную проверку?',visual:'algorithm'},
  {id:'l26-quiz1',kind:'quiz',eyebrow:'Контроль · 1/5',title:'Цепочка нулей',body:'Работай самостоятельно.',activity:{id:'l26-q1',type:'input',prompt:'90 000 − 48 765 = ?',answer:'41235',placeholder:'Ответ',explanation:'90 000 − 48 765 = 41 235.'},visual:'zeros'},
  {id:'l26-quiz2',kind:'quiz',eyebrow:'Контроль · 2/5',title:'Выбери математическую модель',body:'Было 12 000 деталей, 3 450 использовали.',activity:{id:'l26-q2',type:'choice',prompt:'Как найти, сколько деталей осталось?',options:['12 000 − 3 450','12 000 + 3 450','3 450 − 12 000','12 000 · 3 450'],answer:'12 000 − 3 450',explanation:'Из целого количества убрали использованную часть.'},visual:'story'},
  {id:'l26-quiz3',kind:'quiz',eyebrow:'Контроль · 3/5',title:'Размен в нескольких разрядах',body:'Без подсказки.',activity:{id:'l26-q3',type:'input',prompt:'62 005 − 27 896 = ?',answer:'34109',placeholder:'Ответ',explanation:'62 005 − 27 896 = 34 109.'},visual:'zeros'},
  {id:'l26-quiz4',kind:'quiz',eyebrow:'Контроль · 4/5',title:'Разностное сравнение',body:'На первом складе 82 400 кг товара, на втором 35 760 кг.',activity:{id:'l26-q4',type:'input',prompt:'На сколько килограммов на первом складе больше?',answer:'46640',placeholder:'Разница, кг',explanation:'82 400 − 35 760 = 46 640.'},visual:'difference'},
  {id:'l26-quiz5',kind:'quiz',eyebrow:'Контроль · 5/5',title:'Обратное действие',body:'Не перебирай цифры наугад.',activity:{id:'l26-q5',type:'input',prompt:'В равенстве 9□5 − 478 = 457 найди пропущенную цифру.',answer:'3',placeholder:'Цифра',explanation:'457 + 478 = 935, значит пропущенная цифра — 3.'},visual:'check'},
  {id:'l26-challenge',kind:'challenge',eyebrow:'Задача повышенной сложности',title:'Два шага без потери смысла',body:'В экспедицию взяли 100 000 мл воды. К середине пути израсходовали 45 678 мл, а затем ещё 12 345 мл.',activity:{id:'l26-c1',type:'input',prompt:'Сколько миллилитров воды осталось?',answer:'41977',placeholder:'мл',explanation:'100 000 − 45 678 = 54 322; 54 322 − 12 345 = 41 977.'},visual:'challenge'},
  {id:'l26-reflect',kind:'model',eyebrow:'Самооценка',title:'Где именно ты теперь контролируешь себя?',body:'Сильный навык — это не только быстрый ответ. Отметь для себя: я проверяю выбор действия; я вижу разряды; я не теряю размен через нули; я умею подтвердить ответ сложением.',visual:'algorithm'},
  {id:'l26-summary',kind:'summary',eyebrow:'Итог урока 26',title:'Закрепление завершено — дальше будем углублять § 8',body:'Ты закрепил письменное вычитание, разностное сравнение, задачи на остаток и неизвестную часть, а также обратную проверку сложением.',note:'После основной части обязательны 20 курируемых заданий. Только после них урок считается завершённым.',sourceTag:'Мерзляк · § 8 · урок 26 · закрепление'},
];

function load():Saved{
  const fallback:Saved={version:1,stageIndex:0,responses:{},checked:{},results:{}};
  try{const raw=localStorage.getItem(KEY);if(!raw)return fallback;const parsed=JSON.parse(raw) as Partial<Saved>;return{version:1,stageIndex:Math.min(Math.max(Number(parsed.stageIndex)||0,0),lessonTwentySixStages.length-1),responses:parsed.responses??{},checked:parsed.checked??{},results:parsed.results??{}}}catch{return fallback}
}
function normalize(value:string){return value.trim().toLowerCase().replace(/\s+/g,'').replace(/[−–]/g,'-')}

function PracticeVisual({kind}:{kind?:Visual}){
  if(kind==='check')return <div className="properties-visual"><div className="letter-chain"><span>разность</span><i>+</i><span>вычитаемое</span><i>=</i><strong>уменьшаемое</strong></div></div>;
  if(kind==='zeros')return <div className="properties-visual"><div className="property-hero"><b>0 → ищем разряд слева</b><b>размен передаём вправо</b><span>промежуточный ноль после передачи становится 9</span></div></div>;
  if(kind==='difference')return <div className="properties-visual"><div className="property-hero"><b>большее − меньшее</b><b>= разница</b><span>ответ показывает «на сколько?»</span></div></div>;
  if(kind==='story')return <div className="properties-visual"><div className="property-cards"><div><b>было − убрали</b><span>остаток</span></div><div><b>большее − меньшее</b><span>разница</span></div></div></div>;
  if(kind==='error')return <div className="properties-visual"><div className="property-hero"><b>Не повторяй ошибку</b><b>Проверь сложением</b><span>обратное действие — независимый контроль</span></div></div>;
  if(kind==='challenge')return <div className="properties-visual"><div className="properties-algorithm"><div><b>1</b><span>найди остаток после первого расхода</span></div><div><b>2</b><span>вычти второй расход</span></div></div></div>;
  return <div className="properties-visual"><div className="properties-algorithm">{['Понять задачу','Выровнять разряды','Вычесть','Проверить'].map((text,index)=><div key={text}><b>{index+1}</b><span>{text}</span></div>)}</div></div>;
}

export function NaturalNumberSubtractionPracticePlayer(){
  const saved=useMemo(load,[]);
  const[stageIndex,setStageIndex]=useState(saved.stageIndex);
  const[responses,setResponses]=useState(saved.responses);
  const[checked,setChecked]=useState(saved.checked);
  const[results,setResults]=useState(saved.results);
  const stage=lessonTwentySixStages[stageIndex];
  const activity=stage.activity;
  useEffect(()=>{localStorage.setItem(KEY,JSON.stringify({version:1,stageIndex,responses,checked,results} satisfies Saved))},[stageIndex,responses,checked,results]);
  useEffect(()=>{const jump=(event:Event)=>{const detail=(event as CustomEvent<{lessonNumber:number;stageIndex:number}>).detail;if(detail?.lessonNumber!==26)return;setStageIndex(Math.min(Math.max(detail.stageIndex,0),lessonTwentySixStages.length-1));window.scrollTo({top:0,behavior:'smooth'})};window.addEventListener('mathnikita-go-to-stage',jump);return()=>window.removeEventListener('mathnikita-go-to-stage',jump)},[]);
  const practiceCorrect=lessonTwentySixStages.filter(item=>item.kind==='practice'&&item.activity).filter(item=>results[item.activity!.id]).length;
  const quizCorrect=lessonTwentySixStages.filter(item=>item.kind==='quiz'&&item.activity).filter(item=>results[item.activity!.id]).length;
  const currentResponse=activity?responses[activity.id]??'':'';
  const isCorrect=activity?Boolean(results[activity.id]&&checked[activity.id]):true;
  const wasChecked=activity?Boolean(checked[activity.id]):false;
  function choose(value:string){if(!activity)return;setResponses(previous=>({...previous,[activity.id]:value}));setChecked(previous=>({...previous,[activity.id]:false}));setResults(previous=>({...previous,[activity.id]:false}))}
  function checkAnswer(){if(!activity)return;const correct=normalize(currentResponse)===normalize(activity.answer);setChecked(previous=>({...previous,[activity.id]:true}));setResults(previous=>({...previous,[activity.id]:correct}))}
  function resetActivity(){if(!activity)return;setResponses(previous=>({...previous,[activity.id]:''}));setChecked(previous=>({...previous,[activity.id]:false}));setResults(previous=>({...previous,[activity.id]:false}))}
  function move(delta:number){setStageIndex(index=>Math.min(Math.max(index+delta,0),lessonTwentySixStages.length-1));window.scrollTo({top:0,behavior:'smooth'})}
  return <main className="lesson-player-page"><div className="lesson-workspace">
    <header className="lesson-header"><div><span>Урок 26 · § 8 · закрепление</span><h1>Вычитание натуральных чисел — закрепление</h1><p>Точность вычислений, текстовые задачи, разностное сравнение и проверка.</p></div><div className="lesson-duration">≈ 48 минут</div></header>
    <div className="lesson-progress"><i style={{width:`${((stageIndex+1)/lessonTwentySixStages.length)*100}%`}}/></div>
    <div className="stage-counter"><span>Этап {stageIndex+1} из {lessonTwentySixStages.length}</span><div><small>{practiceCorrect}/6 практика · {quizCorrect}/5 контроль</small></div></div>
    <section className={`interactive-stage stage-${stage.kind}`} data-stage-id={stage.id}>
      <div className="stage-copy"><span>{stage.eyebrow}</span><h2>{stage.title}</h2><p>{stage.body}</p>{stage.note?<p><b>{stage.note}</b></p>:null}{stage.sourceTag?<small className="properties-source">{stage.sourceTag}</small>:null}</div>
      <PracticeVisual kind={stage.visual}/>
      {activity?<div className="activity-area"><h3>{activity.prompt}</h3>
        {activity.type==='choice'?<div className="choice-grid">{activity.options?.map(option=><button key={option} type="button" className={currentResponse===option?'selected':''} onClick={()=>choose(option)}>{option}</button>)}</div>:<div className="inline-answer"><input value={currentResponse} onChange={event=>choose(event.target.value)} onKeyDown={event=>event.key==='Enter'&&currentResponse.trim()&&checkAnswer()} placeholder={activity.placeholder??'Ответ'}/></div>}
        <div className="activity-actions"><button type="button" className="secondary" onClick={resetActivity}>Сбросить</button><button type="button" className="check-button" disabled={!currentResponse.trim()} onClick={checkAnswer}>Проверить</button></div>
        {wasChecked?<div className={`instant-feedback ${isCorrect?'good':'bad'}`} data-explanation={activity.explanation}><b>{isCorrect?'Верно!':'Проверь ещё раз'}</b><span>{activity.explanation}</span></div>:null}
      </div>:null}
      {stage.kind==='quiz'?<div className="quiz-meter"><span>Контроль урока 26</span><b>{quizCorrect}/5</b></div>:null}
      {stage.kind==='summary'?<div className="summary-card"><div><span>Контроль</span><b>{quizCorrect}/5</b><small>самостоятельных заданий</small></div><div><span>Практика</span><b>{practiceCorrect}/6</b><small>основных упражнений</small></div><div><span>Статус</span><b>{quizCorrect===5&&practiceCorrect===6?'Основная часть готова':'Нужно закончить'}</b><small>дальше — 20 обязательных заданий</small></div></div>:null}
    </section>
    <nav className="lesson-controls" aria-label="Переход между этапами"><button type="button" disabled={stageIndex===0} onClick={()=>move(-1)}>← Назад</button><span>{stageIndex+1} / {lessonTwentySixStages.length}</span><button type="button" className="primary" disabled={stageIndex===lessonTwentySixStages.length-1||(Boolean(activity)&&!isCorrect)} onClick={()=>move(1)}>{stageIndex===lessonTwentySixStages.length-1?'Основная часть завершена':'Дальше →'}</button></nav>
  </div></main>;
}
