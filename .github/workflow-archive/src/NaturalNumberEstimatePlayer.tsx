import { useEffect,useMemo,useState } from 'react';
import './lessonPlayer.css';
import './theoryExperience.css';
import './additionProperties.css';

type Activity={id:string;type:'choice'|'input';prompt:string;options?:string[];answer:string;explanation:string;placeholder?:string};
type Visual='round'|'sum'|'difference'|'error'|'bounds'|'exact'|'challenge';
type Stage={id:string;title:string;eyebrow:string;kind:'story'|'model'|'guided'|'practice'|'quiz'|'challenge'|'summary';body:string;note?:string;sourceTag?:string;visual?:Visual;activity?:Activity};
type Saved={version:1;stageIndex:number;responses:Record<string,string>;checked:Record<string,boolean>;results:Record<string,boolean>};

const KEY='mathnikita-lesson-28-progress-v1';

export const lessonTwentyEightStages:Stage[]=[
  {id:'l28-mission',kind:'story',eyebrow:'Урок 28 · § 8 · новый инструмент',title:'Сначала оцени, потом считай',body:'Прикидка — это быстрый предварительный ответ. Она не заменяет точное вычисление, но заранее показывает порядок результата. Если прикидка даёт около 8 000, ответ 80 000 должен сразу вызвать подозрение.',note:'Сегодня тренируем математический самоконтроль: округляем до удобного разряда, оцениваем сумму или разность, затем сопоставляем оценку с точным ответом.',sourceTag:'Мерзляк · § 8 · урок 28: прикидка суммы и разности',visual:'error'},
  {id:'l28-approx',kind:'model',eyebrow:'Новый знак',title:'≈ означает «примерно равно»',body:'Знак = используют только для точного равенства. При прикидке пишут ≈. Например, 398 + 604 ≈ 400 + 600 = 1 000. Мы сознательно заменили исходные числа близкими и удобными.',visual:'sum'},
  {id:'l28-round',kind:'guided',eyebrow:'Округление',title:'Выбираем удобный разряд',body:'Чтобы округлить до сотен, смотрим на цифру десятков. Если она 0–4 — оставляем сотни, если 5–9 — увеличиваем сотни на 1.',activity:{id:'l28-a1',type:'input',prompt:'Округли 6 482 до сотен.',answer:'6500',placeholder:'Число',explanation:'Цифра десятков 8, поэтому 6 482 ≈ 6 500.'},visual:'round'},
  {id:'l28-scale',kind:'model',eyebrow:'Стратегия',title:'Точность прикидки зависит от задачи',body:'Для грубой проверки многозначного ответа удобно округлять до тысяч или десятков тысяч. Если нужен более узкий ориентир, можно округлить до сотен. Главное — получить быстрый и понятный масштаб результата.',note:'Прикидка должна быть проще точного вычисления. Если оценка стала такой же трудной, выбран неудачный способ.',visual:'round'},
  {id:'l28-practice1',kind:'practice',eyebrow:'Практика · 1/6',title:'Оцени сумму',body:'Округли оба числа до сотен.',activity:{id:'l28-p1',type:'input',prompt:'397 + 604 ≈ ?',answer:'1000',placeholder:'Прикидка',explanation:'397 ≈ 400, 604 ≈ 600, поэтому сумма ≈ 1 000.'},visual:'sum'},
  {id:'l28-practice2',kind:'practice',eyebrow:'Практика · 2/6',title:'Оцени разность',body:'Округли оба числа до тысяч.',activity:{id:'l28-p2',type:'input',prompt:'8 012 − 3 987 ≈ ?',answer:'4000',placeholder:'Прикидка',explanation:'8 012 ≈ 8 000, 3 987 ≈ 4 000, поэтому разность ≈ 4 000.'},visual:'difference'},
  {id:'l28-impossible',kind:'model',eyebrow:'Проверка здравого смысла',title:'Прикидка отбрасывает невозможное',body:'620 + 380 находится около 1 000. Поэтому вариант 10 000 неверен ещё до точного сложения. Такой контроль особенно полезен после письменного вычисления или ввода чисел в калькулятор.',visual:'error'},
  {id:'l28-practice3',kind:'practice',eyebrow:'Практика · 3/6',title:'Найди невозможный ответ',body:'Не выполняй длинных вычислений — оцени порядок.',activity:{id:'l28-p3',type:'choice',prompt:'Какой результат не может быть ответом для 49 870 + 20 240?',options:['Около 70 000','70 110','700 110','Чуть больше 70 000'],answer:'700 110',explanation:'50 000 + 20 000 ≈ 70 000. Ответ 700 110 примерно в десять раз больше ожидаемого.'},visual:'error'},
  {id:'l28-subtraction',kind:'model',eyebrow:'Вычитание',title:'Сначала оцени, насколько далеко числа друг от друга',body:'Для 91 200 − 39 600 удобно мыслить так: примерно 90 000 − 40 000 = 50 000. Значит точная разность должна быть около 50 тысяч, а не 5 тысяч и не 130 тысяч.',visual:'difference'},
  {id:'l28-practice4',kind:'practice',eyebrow:'Практика · 4/6',title:'Проверь чужой ответ',body:'Прикидка должна решить, доверять ли вычислению.',activity:{id:'l28-p4',type:'choice',prompt:'Ученик написал 80 100 − 39 870 = 50 230. Что показывает прикидка?',options:['Ответ подозрителен: ожидаем около 40 000','Ответ точно верен','Ожидаем около 120 000','Прикидка здесь невозможна'],answer:'Ответ подозрителен: ожидаем около 40 000',explanation:'80 000 − 40 000 ≈ 40 000. Точная разность 40 230, поэтому 50 230 действительно ошибочна.'},visual:'error'},
  {id:'l28-exact',kind:'model',eyebrow:'Два уровня ответа',title:'Прикидка и точное вычисление работают вместе',body:'Хорошая привычка: сначала получить ориентир, затем вычислить точно, после чего сравнить. Например, 2 947 + 5 126 ≈ 8 000, а точная сумма 8 073. Значения близки — проверка пройдена.',visual:'exact'},
  {id:'l28-practice5',kind:'practice',eyebrow:'Практика · 5/6',title:'Сравни оценку и точный ответ',body:'Сначала мысленно оцени результат.',activity:{id:'l28-p5',type:'input',prompt:'Вычисли точно: 2 947 + 5 126 = ?',answer:'8073',placeholder:'Точный ответ',explanation:'2 947 + 5 126 = 8 073. Прикидка 3 000 + 5 000 ≈ 8 000 подтверждает порядок ответа.'},visual:'exact'},
  {id:'l28-bounds',kind:'model',eyebrow:'Сильная прикидка',title:'Иногда полезнее не одно число, а границы',body:'Можно не угадывать «примерный ответ», а установить диапазон. Если сумма явно больше 40 000, но меньше 41 000, мы получаем гораздо более строгую проверку, не повторяя точный столбик.',visual:'bounds'},
  {id:'l28-practice6',kind:'practice',eyebrow:'Практика · 6/6',title:'Поставь результат в диапазон',body:'Используй округление и небольшие отклонения от круглых чисел.',activity:{id:'l28-p6',type:'choice',prompt:'Где находится сумма 29 876 + 10 240?',options:['От 40 000 до 41 000','От 4 000 до 5 000','От 30 000 до 39 000','Больше 100 000'],answer:'От 40 000 до 41 000',explanation:'Точная сумма 40 116, но и без полного столбика видно: она чуть больше 40 000 и меньше 41 000.'},visual:'bounds'},
  {id:'l28-mistake',kind:'guided',eyebrow:'Типичная ошибка',title:'Прикидка не является точным ответом',body:'Если задача просит вычислить 497 + 304, запись «≈ 800» полезна как контроль, но финальный ответ должен быть точным: 801. Не подменяй одно другим.',activity:{id:'l28-a2',type:'choice',prompt:'Что нужно записать как окончательный ответ, если требуется вычислить 497 + 304?',options:['801','≈ 800','800','≈ 801'],answer:'801',explanation:'Прикидка ≈ 800 — предварительный ориентир. Точное значение суммы равно 801.'},visual:'exact'},
  {id:'l28-quiz1',kind:'quiz',eyebrow:'Контроль · 1/5',title:'Сумма',body:'Без подсказки.',activity:{id:'l28-q1',type:'input',prompt:'199 + 302 ≈ ? (до сотен)',answer:'500',placeholder:'Прикидка',explanation:'199 ≈ 200, 302 ≈ 300, сумма ≈ 500.'},visual:'sum'},
  {id:'l28-quiz2',kind:'quiz',eyebrow:'Контроль · 2/5',title:'Разность',body:'Без подсказки.',activity:{id:'l28-q2',type:'input',prompt:'5 020 − 1 980 ≈ ? (до тысяч)',answer:'3000',placeholder:'Прикидка',explanation:'5 020 ≈ 5 000, 1 980 ≈ 2 000, разность ≈ 3 000.'},visual:'difference'},
  {id:'l28-quiz3',kind:'quiz',eyebrow:'Контроль · 3/5',title:'Порядок величины',body:'Выбери разумный ориентир.',activity:{id:'l28-q3',type:'choice',prompt:'48 + 53 ближе к…',options:['100','1 000','10 000','10'],answer:'100',explanation:'50 + 50 ≈ 100.'},visual:'sum'},
  {id:'l28-quiz4',kind:'quiz',eyebrow:'Контроль · 4/5',title:'Проверка ответа',body:'Оцени результат, не повторяя вычисление.',activity:{id:'l28-q4',type:'choice',prompt:'Для 12 480 + 7 630 ученик получил 201 100. Вердикт?',options:['Неверно: ожидаем около 20 000','Верно: числа многозначные','Нельзя проверить прикидкой','Верно: ответ больше слагаемых'],answer:'Неверно: ожидаем около 20 000',explanation:'12 тысяч + 8 тысяч ≈ 20 тысяч, поэтому 201 100 невозможно.'},visual:'error'},
  {id:'l28-quiz5',kind:'quiz',eyebrow:'Контроль · 5/5',title:'Точный ответ после оценки',body:'Сначала оцени, затем посчитай.',activity:{id:'l28-q5',type:'input',prompt:'9 104 − 4 886 = ?',answer:'4218',placeholder:'Точный ответ',explanation:'Прикидка 9 000 − 5 000 ≈ 4 000; точная разность 4 218 согласуется с оценкой.'},visual:'exact'},
  {id:'l28-challenge',kind:'challenge',eyebrow:'Задача повышенной сложности',title:'По какую сторону от 8 000?',body:'Не выполняй обычное сложение столбиком. Сравни отклонения чисел от 5 000 и 3 000.',activity:{id:'l28-c1',type:'choice',prompt:'4 987 + 3 015 больше, меньше или равно 8 000?',options:['Больше 8 000','Меньше 8 000','Равно 8 000','Определить нельзя'],answer:'Больше 8 000',explanation:'4 987 = 5 000 − 13, а 3 015 = 3 000 + 15. Прибавка 15 перекрывает нехватку 13 на 2, поэтому сумма на 2 больше 8 000.'},visual:'challenge'},
  {id:'l28-reflect',kind:'model',eyebrow:'Самоконтроль',title:'Правильная привычка занимает секунды',body:'Перед сложением или вычитанием больших чисел спроси: «Примерно сколько должно получиться?» После вычисления сравни точный ответ с ориентиром. Это не лишний шаг, а защита от разрядных и вычислительных ошибок.',visual:'error'},
  {id:'l28-summary',kind:'summary',eyebrow:'Итог урока 28',title:'Ты умеешь проверять ответ ещё до проверки',body:'Ты отличаешь прикидку от точного вычисления, округляешь числа до удобного разряда, оцениваешь сумму и разность, находишь невозможные ответы и используешь границы результата.',note:'После основной части закрепи навык в обязательной тренировочной мастерской из 20 заданий.',sourceTag:'Мерзляк · § 8 · урок 28: прикидка суммы и разности',visual:'exact'},
];

function load():Saved{
  const fallback:Saved={version:1,stageIndex:0,responses:{},checked:{},results:{}};
  try{const raw=localStorage.getItem(KEY);if(!raw)return fallback;const parsed=JSON.parse(raw) as Partial<Saved>;return{version:1,stageIndex:Math.min(Math.max(Number(parsed.stageIndex)||0,0),lessonTwentyEightStages.length-1),responses:parsed.responses??{},checked:parsed.checked??{},results:parsed.results??{}}}catch{return fallback}
}
function normalize(value:string){return value.trim().toLowerCase().replace(/\s+/g,'').replace(/[−–]/g,'-')}

function EstimateVisual({kind}:{kind?:Visual}){
  if(kind==='round')return <div className="properties-visual"><div className="property-hero"><b>6 482 ≈ 6 500</b><b>23 449 ≈ 23 000</b><span>выбираем удобный разряд</span></div></div>;
  if(kind==='sum')return <div className="properties-visual"><div className="letter-chain"><span>398</span><i>≈</i><span>400</span><i>+</i><span>600</span><i>=</i><strong>1 000</strong></div></div>;
  if(kind==='difference')return <div className="properties-visual"><div className="letter-chain"><span>8 012</span><i>≈</i><span>8 000</span><i>−</i><span>4 000</span><i>=</i><strong>4 000</strong></div></div>;
  if(kind==='error')return <div className="properties-visual"><div className="property-hero"><b>Оцени порядок</b><b>Сравни ответ</b><span>результат в 10 раз больше ориентира — красный флаг</span></div></div>;
  if(kind==='bounds')return <div className="properties-visual"><div className="property-cards"><div><b>40 000</b><span>нижняя граница</span></div><div><b>41 000</b><span>верхняя граница</span></div></div></div>;
  if(kind==='challenge')return <div className="properties-visual"><div className="property-hero"><b>5 000 − 13</b><b>3 000 + 15</b><span>−13 + 15 = +2 относительно 8 000</span></div></div>;
  return <div className="properties-visual"><div className="properties-algorithm">{['Прикинуть','Вычислить точно','Сравнить','Исправить при необходимости'].map((text,index)=><div key={text}><b>{index+1}</b><span>{text}</span></div>)}</div></div>;
}

export function NaturalNumberEstimatePlayer(){
  const saved=useMemo(load,[]);
  const[stageIndex,setStageIndex]=useState(saved.stageIndex);
  const[responses,setResponses]=useState(saved.responses);
  const[checked,setChecked]=useState(saved.checked);
  const[results,setResults]=useState(saved.results);
  const stage=lessonTwentyEightStages[stageIndex];
  const activity=stage.activity;
  useEffect(()=>{localStorage.setItem(KEY,JSON.stringify({version:1,stageIndex,responses,checked,results} satisfies Saved))},[stageIndex,responses,checked,results]);
  useEffect(()=>{const jump=(event:Event)=>{const detail=(event as CustomEvent<{lessonNumber:number;stageIndex:number}>).detail;if(detail?.lessonNumber!==28)return;stopVoice();setStageIndex(Math.min(Math.max(detail.stageIndex,0),lessonTwentyEightStages.length-1));window.scrollTo({top:0,behavior:'smooth'})};window.addEventListener('mathnikita-go-to-stage',jump);return()=>window.removeEventListener('mathnikita-go-to-stage',jump)},[]);
  const practiceCorrect=lessonTwentyEightStages.filter(item=>item.kind==='practice'&&item.activity).filter(item=>results[item.activity!.id]).length;
  const quizCorrect=lessonTwentyEightStages.filter(item=>item.kind==='quiz'&&item.activity).filter(item=>results[item.activity!.id]).length;
  const currentResponse=activity?responses[activity.id]??'':'';
  const isCorrect=activity?Boolean(results[activity.id]&&checked[activity.id]):true;
  const wasChecked=activity?Boolean(checked[activity.id]):false;
  function stopVoice(){window.dispatchEvent(new CustomEvent('mathnikita-stop-narration'));window.speechSynthesis?.cancel()}
  function choose(value:string){if(!activity)return;setResponses(previous=>({...previous,[activity.id]:value}));setChecked(previous=>({...previous,[activity.id]:false}));setResults(previous=>({...previous,[activity.id]:false}))}
  function checkAnswer(){if(!activity)return;const correct=normalize(currentResponse)===normalize(activity.answer);setChecked(previous=>({...previous,[activity.id]:true}));setResults(previous=>({...previous,[activity.id]:correct}))}
  function resetActivity(){if(!activity)return;setResponses(previous=>({...previous,[activity.id]:''}));setChecked(previous=>({...previous,[activity.id]:false}));setResults(previous=>({...previous,[activity.id]:false}))}
  function move(delta:number){stopVoice();setStageIndex(index=>Math.min(Math.max(index+delta,0),lessonTwentyEightStages.length-1));window.scrollTo({top:0,behavior:'smooth'})}
  return <main className="lesson-player-page"><div className="lesson-workspace">
    <header className="lesson-header"><div><span>Урок 28 · § 8 · прикидка</span><h1>Прикидка суммы и разности</h1><p>Быстрая оценка результата, округление и обнаружение невозможных ответов.</p></div><div className="lesson-duration">≈ 50 минут</div></header>
    <div className="lesson-progress"><i style={{width:`${((stageIndex+1)/lessonTwentyEightStages.length)*100}%`}}/></div>
    <div className="stage-counter"><span>Этап {stageIndex+1} из {lessonTwentyEightStages.length}</span><div><small>{practiceCorrect}/6 практика · {quizCorrect}/5 контроль</small></div></div>
    <section className={`interactive-stage stage-${stage.kind}`} data-stage-id={stage.id}>
      <div className="stage-copy"><span>{stage.eyebrow}</span><h2>{stage.title}</h2><p>{stage.body}</p>{stage.note?<p><b>{stage.note}</b></p>:null}{stage.sourceTag?<small className="properties-source">{stage.sourceTag}</small>:null}</div>
      <EstimateVisual kind={stage.visual}/>
      {activity?<div className="activity-area"><h3>{activity.prompt}</h3>
        {activity.type==='choice'?<div className="choice-grid">{activity.options?.map(option=><button key={option} type="button" className={currentResponse===option?'selected':''} onClick={()=>choose(option)}>{option}</button>)}</div>:<div className="inline-answer"><input value={currentResponse} onChange={event=>choose(event.target.value)} onKeyDown={event=>event.key==='Enter'&&currentResponse.trim()&&checkAnswer()} placeholder={activity.placeholder??'Ответ'}/></div>}
        <div className="activity-actions"><button type="button" className="secondary" onClick={resetActivity}>Сбросить</button><button type="button" className="check-button" disabled={!currentResponse.trim()} onClick={checkAnswer}>Проверить</button></div>
        {wasChecked?<div className={`instant-feedback ${isCorrect?'good':'bad'}`} data-explanation={activity.explanation}><b>{isCorrect?'Верно!':'Проверь ещё раз'}</b><span>{activity.explanation}</span></div>:null}
      </div>:null}
      {stage.kind==='quiz'?<div className="quiz-meter"><span>Контроль урока 28</span><b>{quizCorrect}/5</b></div>:null}
      {stage.kind==='summary'?<div className="summary-card"><div><span>Контроль</span><b>{quizCorrect}/5</b><small>самостоятельных заданий</small></div><div><span>Практика</span><b>{practiceCorrect}/6</b><small>основных упражнений</small></div><div><span>Статус</span><b>{quizCorrect===5&&practiceCorrect===6?'Основная часть готова':'Нужно закончить'}</b><small>дальше — 20 обязательных заданий</small></div></div>:null}
    </section>
    <nav className="lesson-controls" aria-label="Переход между этапами"><button type="button" disabled={stageIndex===0} onClick={()=>move(-1)}>← Назад</button><span>{stageIndex+1} / {lessonTwentyEightStages.length}</span><button type="button" className="primary" disabled={stageIndex===lessonTwentyEightStages.length-1||(Boolean(activity)&&!isCorrect)} onClick={()=>move(1)}>{stageIndex===lessonTwentyEightStages.length-1?'Основная часть завершена':'Дальше →'}</button></nav>
  </div></main>;
}
