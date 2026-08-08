import { useEffect,useMemo,useState } from 'react';
import './lessonPlayer.css';
import './theoryExperience.css';
import './additionProperties.css';

type Activity={id:string;type:'choice'|'input';prompt:string;options?:string[];answer:string;explanation:string;placeholder?:string};
type Visual='column'|'zeros'|'check'|'story'|'difference'|'error'|'algorithm'|'challenge';
type Stage={id:string;title:string;eyebrow:string;kind:'story'|'model'|'guided'|'practice'|'quiz'|'challenge'|'summary';body:string;note?:string;sourceTag?:string;visual?:Visual;activity?:Activity};
type Saved={version:1;stageIndex:number;responses:Record<string,string>;checked:Record<string,boolean>;results:Record<string,boolean>};

const KEY='mathnikita-lesson-27-progress-v1';

export const lessonTwentySevenStages:Stage[]=[
  {id:'l27-mission',kind:'story',eyebrow:'Урок 27 · § 8 · обобщение',title:'Собираем вычитание в единую систему',body:'Сегодня новых правил не вводим. Задача урока — научиться выбирать способ решения осознанно: понимать смысл вычитания, уверенно считать многозначные числа, распознавать тип текстовой задачи, работать с неизвестными компонентами и проверять результат.',note:'Технологическая карта урока 27: обобщение и систематизация навыков вычитания натуральных чисел; углубление арифметического решения текстовых задач.',sourceTag:'Мерзляк · § 8 · технологическая карта урока 27',visual:'algorithm'},
  {id:'l27-map',kind:'guided',eyebrow:'Карта темы',title:'Три числа — одна связь',body:'В записи a − b = c число a — уменьшаемое, b — вычитаемое, c — разность. Если вычисление верно, то b + c = a. Эта связь помогает не только проверять ответ, но и восстанавливать неизвестный компонент.',activity:{id:'l27-a1',type:'choice',prompt:'В равенстве 12 608 − 4 759 = 7 849 какое число является разностью?',options:['12 608','4 759','7 849','17 367'],answer:'7 849',explanation:'Разность — результат вычитания, здесь это 7 849.'},visual:'check'},
  {id:'l27-strategy',kind:'model',eyebrow:'Стратегия',title:'Сначала смысл, потом вычисление',body:'Перед каждым примером или задачей задай себе четыре вопроса: что известно, что нужно найти, почему здесь нужно вычитание и как я проверю ответ. Такой порядок защищает от ошибки выбора действия ещё до столбика.',visual:'algorithm'},
  {id:'l27-practice1',kind:'practice',eyebrow:'Практика · 1/6',title:'Вычисление + обратная связь',body:'Найди разность и мысленно проверь её сложением.',activity:{id:'l27-p1',type:'input',prompt:'12 608 − 4 759 = ?',answer:'7849',placeholder:'Ответ',explanation:'12 608 − 4 759 = 7 849; проверка: 7 849 + 4 759 = 12 608.'},visual:'check'},
  {id:'l27-story',kind:'model',eyebrow:'Текстовая задача',title:'Несколько событий — несколько осмысленных шагов',body:'Если количество уменьшается несколько раз, не пытайся угадывать одно «волшебное действие». После каждого события обновляй текущее количество и только потом переходи к следующему шагу.',note:'Правила вычитания суммы из числа здесь ещё не вводим — это материал следующего урока.',visual:'story'},
  {id:'l27-practice2',kind:'practice',eyebrow:'Практика · 2/6',title:'Два последовательных расхода',body:'На складе было 45 800 кг крупы. Утром отправили 12 675 кг, после обеда ещё 9 840 кг.',activity:{id:'l27-p2',type:'input',prompt:'Сколько килограммов осталось?',answer:'23285',placeholder:'кг',explanation:'45 800 − 12 675 = 33 125; 33 125 − 9 840 = 23 285 кг.'},visual:'story'},
  {id:'l27-difference',kind:'model',eyebrow:'Разностное сравнение',title:'«На сколько?» требует сначала определить большее',body:'При разностном сравнении из большего количества вычитают меньшее. Поэтому до вычисления важно сравнить величины, а не механически брать числа в порядке появления в условии.',visual:'difference'},
  {id:'l27-practice3',kind:'practice',eyebrow:'Практика · 3/6',title:'Сравни две величины',body:'В одной школе 24 506 книг, в другой — 18 937.',activity:{id:'l27-p3',type:'input',prompt:'На сколько книг в первой школе больше?',answer:'5569',placeholder:'Книг',explanation:'24 506 − 18 937 = 5 569.'},visual:'difference'},
  {id:'l27-unknown',kind:'model',eyebrow:'Неизвестный компонент',title:'Неизвестное не нужно угадывать',body:'Если известно уменьшаемое и разность, вычитаемое можно восстановить: вычитаемое + разность = уменьшаемое. Это тот же смысл обратного действия, а не отдельное правило для запоминания.',visual:'check'},
  {id:'l27-practice4',kind:'practice',eyebrow:'Практика · 4/6',title:'Найди неизвестное вычитаемое',body:'Реши через связь компонентов действия.',activity:{id:'l27-p4',type:'input',prompt:'32 000 − x = 18 475. Чему равно x?',answer:'13525',placeholder:'x',explanation:'x = 32 000 − 18 475 = 13 525; проверка: 13 525 + 18 475 = 32 000.'},visual:'check'},
  {id:'l27-units',kind:'model',eyebrow:'Именованные величины',title:'Сначала одна единица измерения',body:'Километры и метры, метры и сантиметры нельзя вычитать как независимые колонки. Сначала переведи величины в одну удобную единицу, выполни вычитание и только потом при необходимости верни составную запись.',visual:'algorithm'},
  {id:'l27-practice5',kind:'practice',eyebrow:'Практика · 5/6',title:'Длина маршрута',body:'Работай в метрах.',activity:{id:'l27-p5',type:'input',prompt:'5 км 240 м − 2 км 785 м = сколько метров?',answer:'2455',placeholder:'м',explanation:'5 км 240 м = 5 240 м; 2 км 785 м = 2 785 м; 5 240 − 2 785 = 2 455 м.'},visual:'difference'},
  {id:'l27-estimate',kind:'model',eyebrow:'Самоконтроль',title:'Прикидка ловит грубую ошибку раньше проверки',body:'До точного вычисления оцени порядок ответа. Например, 800 тысяч минус примерно 370 тысяч должно дать немного больше 400 тысяч. Ответ 43 тысячи или 730 тысяч сразу подозрителен.',visual:'error'},
  {id:'l27-practice6',kind:'practice',eyebrow:'Практика · 6/6',title:'Большие числа без потери разрядов',body:'Сначала оцени ответ, затем вычисли точно.',activity:{id:'l27-p6',type:'input',prompt:'800 000 − 367 458 = ?',answer:'432542',placeholder:'Ответ',explanation:'800 000 − 367 458 = 432 542; результат согласуется с предварительной оценкой.'},visual:'zeros'},
  {id:'l27-error',kind:'guided',eyebrow:'Коррекция',title:'Хорошая проверка должна разоблачать ошибку',body:'Ученик получил 60 002 − 18 765 = 51 237.',activity:{id:'l27-a2',type:'choice',prompt:'Какой контроль надёжнее всего покажет ошибку?',options:['Сложить 51 237 и 18 765','Посмотреть, что ответ пятизначный','Повторить тот же столбик быстрее','Сравнить только последние цифры'],answer:'Сложить 51 237 и 18 765',explanation:'Обратное сложение не возвращает 60 002. Правильная разность — 41 237.'},visual:'error'},
  {id:'l27-system',kind:'model',eyebrow:'Система § 8',title:'Пять шагов зрелого решения',body:'1) Определи математическую связь. 2) Оцени ожидаемый результат. 3) Выровняй разряды или единицы измерения. 4) Вычисли. 5) Проверь обратным действием и смыслом условия.',visual:'algorithm'},
  {id:'l27-quiz1',kind:'quiz',eyebrow:'Контроль · 1/5',title:'Соседние числа',body:'Без подсказки.',activity:{id:'l27-q1',type:'input',prompt:'100 000 − 99 999 = ?',answer:'1',placeholder:'Ответ',explanation:'100 000 и 99 999 — соседние натуральные числа, их разность равна 1.'},visual:'column'},
  {id:'l27-quiz2',kind:'quiz',eyebrow:'Контроль · 2/5',title:'Неизвестная использованная часть',body:'Из 50 000 деталей после работы осталось 12 850.',activity:{id:'l27-q2',type:'input',prompt:'Сколько деталей использовали?',answer:'37150',placeholder:'Деталей',explanation:'50 000 − 12 850 = 37 150.'},visual:'story'},
  {id:'l27-quiz3',kind:'quiz',eyebrow:'Контроль · 3/5',title:'Восстанови уменьшаемое',body:'Используй обратное действие.',activity:{id:'l27-q3',type:'input',prompt:'x − 18 725 = 42 680. Чему равно x?',answer:'61405',placeholder:'x',explanation:'x = 42 680 + 18 725 = 61 405.'},visual:'check'},
  {id:'l27-quiz4',kind:'quiz',eyebrow:'Контроль · 4/5',title:'Единицы длины',body:'Ответ дай в сантиметрах.',activity:{id:'l27-q4',type:'input',prompt:'7 м 5 см − 2 м 78 см = сколько сантиметров?',answer:'427',placeholder:'см',explanation:'705 см − 278 см = 427 см.'},visual:'difference'},
  {id:'l27-quiz5',kind:'quiz',eyebrow:'Контроль · 5/5',title:'Проверка результата',body:'Выбери равенство, которое подтверждает вычисление 73 000 − 28 459.',activity:{id:'l27-q5',type:'choice',prompt:'Какой вариант верен?',options:['44 541 + 28 459 = 73 000','44 541 − 28 459 = 73 000','73 000 + 28 459 = 44 541','28 459 − 44 541 = 73 000'],answer:'44 541 + 28 459 = 73 000',explanation:'Разность 44 541 плюс вычитаемое 28 459 возвращают уменьшаемое 73 000.'},visual:'check'},
  {id:'l27-challenge',kind:'challenge',eyebrow:'Задача повышенной сложности',title:'Восстанови скрытый второй шаг',body:'Маршрут экспедиции — 120 000 м. В первый день прошли 38 750 м. После второго дня осталось пройти 47 680 м.',activity:{id:'l27-c1',type:'input',prompt:'Сколько метров прошли во второй день?',answer:'33570',placeholder:'м',explanation:'После первого дня оставалось 120 000 − 38 750 = 81 250 м. Второй день: 81 250 − 47 680 = 33 570 м.'},visual:'challenge'},
  {id:'l27-reflect',kind:'model',eyebrow:'Самооценка',title:'Можешь ли ты объяснить выбор действия?',body:'Проверь себя не по скорости. Ты готов к следующему уроку, если можешь словами объяснить, почему вычитаешь именно эти величины, как восстанавливаешь неизвестный компонент и чем подтверждаешь ответ.',visual:'algorithm'},
  {id:'l27-summary',kind:'summary',eyebrow:'Итог урока 27',title:'Базовое вычитание систематизировано',body:'Ты собрал в одну систему смысл вычитания, письменный алгоритм, текстовые модели, неизвестные компоненты, именованные величины, прикидку и обратную проверку.',note:'После основной части обязательны 20 курируемых заданий. Новые правила преобразования разностей начнутся только в уроке 28.',sourceTag:'Мерзляк · § 8 · урок 27 · обобщение и систематизация'},
];

function load():Saved{
  const fallback:Saved={version:1,stageIndex:0,responses:{},checked:{},results:{}};
  try{const raw=localStorage.getItem(KEY);if(!raw)return fallback;const parsed=JSON.parse(raw) as Partial<Saved>;return{version:1,stageIndex:Math.min(Math.max(Number(parsed.stageIndex)||0,0),lessonTwentySevenStages.length-1),responses:parsed.responses??{},checked:parsed.checked??{},results:parsed.results??{}}}catch{return fallback}
}
function normalize(value:string){return value.trim().toLowerCase().replace(/\s+/g,'').replace(/[−–]/g,'-')}

function PracticeVisual({kind}:{kind?:Visual}){
  if(kind==='check')return <div className="properties-visual"><div className="letter-chain"><span>разность</span><i>+</i><span>вычитаемое</span><i>=</i><strong>уменьшаемое</strong></div></div>;
  if(kind==='zeros')return <div className="properties-visual"><div className="property-hero"><b>0 → ищем разряд слева</b><b>размен передаём вправо</b><span>промежуточный ноль после передачи становится 9</span></div></div>;
  if(kind==='difference')return <div className="properties-visual"><div className="property-hero"><b>большее − меньшее</b><b>= разница</b><span>ответ показывает «на сколько?»</span></div></div>;
  if(kind==='story')return <div className="properties-visual"><div className="property-cards"><div><b>было − убрали</b><span>остаток</span></div><div><b>большее − меньшее</b><span>разница</span></div></div></div>;
  if(kind==='error')return <div className="properties-visual"><div className="property-hero"><b>Не повторяй ошибку</b><b>Проверь сложением</b><span>обратное действие — независимый контроль</span></div></div>;
  if(kind==='challenge')return <div className="properties-visual"><div className="properties-algorithm"><div><b>1</b><span>выполни первый осмысленный шаг</span></div><div><b>2</b><span>восстанови скрытый второй шаг</span></div></div></div>;
  return <div className="properties-visual"><div className="properties-algorithm">{['Понять задачу','Выровнять разряды','Вычесть','Проверить'].map((text,index)=><div key={text}><b>{index+1}</b><span>{text}</span></div>)}</div></div>;
}

export function NaturalNumberSubtractionGeneralizationPlayer(){
  const saved=useMemo(load,[]);
  const[stageIndex,setStageIndex]=useState(saved.stageIndex);
  const[responses,setResponses]=useState(saved.responses);
  const[checked,setChecked]=useState(saved.checked);
  const[results,setResults]=useState(saved.results);
  const stage=lessonTwentySevenStages[stageIndex];
  const activity=stage.activity;
  useEffect(()=>{localStorage.setItem(KEY,JSON.stringify({version:1,stageIndex,responses,checked,results} satisfies Saved))},[stageIndex,responses,checked,results]);
  useEffect(()=>{const jump=(event:Event)=>{const detail=(event as CustomEvent<{lessonNumber:number;stageIndex:number}>).detail;if(detail?.lessonNumber!==27)return;setStageIndex(Math.min(Math.max(detail.stageIndex,0),lessonTwentySevenStages.length-1));window.scrollTo({top:0,behavior:'smooth'})};window.addEventListener('mathnikita-go-to-stage',jump);return()=>window.removeEventListener('mathnikita-go-to-stage',jump)},[]);
  const practiceCorrect=lessonTwentySevenStages.filter(item=>item.kind==='practice'&&item.activity).filter(item=>results[item.activity!.id]).length;
  const quizCorrect=lessonTwentySevenStages.filter(item=>item.kind==='quiz'&&item.activity).filter(item=>results[item.activity!.id]).length;
  const currentResponse=activity?responses[activity.id]??'':'';
  const isCorrect=activity?Boolean(results[activity.id]&&checked[activity.id]):true;
  const wasChecked=activity?Boolean(checked[activity.id]):false;
  function choose(value:string){if(!activity)return;setResponses(previous=>({...previous,[activity.id]:value}));setChecked(previous=>({...previous,[activity.id]:false}));setResults(previous=>({...previous,[activity.id]:false}))}
  function checkAnswer(){if(!activity)return;const correct=normalize(currentResponse)===normalize(activity.answer);setChecked(previous=>({...previous,[activity.id]:true}));setResults(previous=>({...previous,[activity.id]:correct}))}
  function resetActivity(){if(!activity)return;setResponses(previous=>({...previous,[activity.id]:''}));setChecked(previous=>({...previous,[activity.id]:false}));setResults(previous=>({...previous,[activity.id]:false}))}
  function move(delta:number){setStageIndex(index=>Math.min(Math.max(index+delta,0),lessonTwentySevenStages.length-1));window.scrollTo({top:0,behavior:'smooth'})}
  return <main className="lesson-player-page"><div className="lesson-workspace">
    <header className="lesson-header"><div><span>Урок 27 · § 8 · обобщение</span><h1>Вычитание натуральных чисел — обобщение</h1><p>Система вычитания: модели задач, неизвестные компоненты, величины, оценка и проверка.</p></div><div className="lesson-duration">≈ 50 минут</div></header>
    <div className="lesson-progress"><i style={{width:`${((stageIndex+1)/lessonTwentySevenStages.length)*100}%`}}/></div>
    <div className="stage-counter"><span>Этап {stageIndex+1} из {lessonTwentySevenStages.length}</span><div><small>{practiceCorrect}/6 практика · {quizCorrect}/5 контроль</small></div></div>
    <section className={`interactive-stage stage-${stage.kind}`} data-stage-id={stage.id}>
      <div className="stage-copy"><span>{stage.eyebrow}</span><h2>{stage.title}</h2><p>{stage.body}</p>{stage.note?<p><b>{stage.note}</b></p>:null}{stage.sourceTag?<small className="properties-source">{stage.sourceTag}</small>:null}</div>
      <PracticeVisual kind={stage.visual}/>
      {activity?<div className="activity-area"><h3>{activity.prompt}</h3>
        {activity.type==='choice'?<div className="choice-grid">{activity.options?.map(option=><button key={option} type="button" className={currentResponse===option?'selected':''} onClick={()=>choose(option)}>{option}</button>)}</div>:<div className="inline-answer"><input value={currentResponse} onChange={event=>choose(event.target.value)} onKeyDown={event=>event.key==='Enter'&&currentResponse.trim()&&checkAnswer()} placeholder={activity.placeholder??'Ответ'}/></div>}
        <div className="activity-actions"><button type="button" className="secondary" onClick={resetActivity}>Сбросить</button><button type="button" className="check-button" disabled={!currentResponse.trim()} onClick={checkAnswer}>Проверить</button></div>
        {wasChecked?<div className={`instant-feedback ${isCorrect?'good':'bad'}`} data-explanation={activity.explanation}><b>{isCorrect?'Верно!':'Проверь ещё раз'}</b><span>{activity.explanation}</span></div>:null}
      </div>:null}
      {stage.kind==='quiz'?<div className="quiz-meter"><span>Контроль урока 27</span><b>{quizCorrect}/5</b></div>:null}
      {stage.kind==='summary'?<div className="summary-card"><div><span>Контроль</span><b>{quizCorrect}/5</b><small>самостоятельных заданий</small></div><div><span>Практика</span><b>{practiceCorrect}/6</b><small>основных упражнений</small></div><div><span>Статус</span><b>{quizCorrect===5&&practiceCorrect===6?'Основная часть готова':'Нужно закончить'}</b><small>дальше — 20 обязательных заданий</small></div></div>:null}
    </section>
    <nav className="lesson-controls" aria-label="Переход между этапами"><button type="button" disabled={stageIndex===0} onClick={()=>move(-1)}>← Назад</button><span>{stageIndex+1} / {lessonTwentySevenStages.length}</span><button type="button" className="primary" disabled={stageIndex===lessonTwentySevenStages.length-1||(Boolean(activity)&&!isCorrect)} onClick={()=>move(1)}>{stageIndex===lessonTwentySevenStages.length-1?'Основная часть завершена':'Дальше →'}</button></nav>
  </div></main>;
}
