import { useEffect, useMemo, useState } from 'react';
import './lessonPlayer.css';
import './theoryExperience.css';
import './decimalNotationMastery.css';

type Activity = {
  id: string;
  type: 'choice' | 'input' | 'order';
  prompt: string;
  options?: string[];
  items?: string[];
  answer: string | string[];
  explanation: string;
  placeholder?: string;
};

export type DecimalMasteryStage = {
  id: string;
  title: string;
  eyebrow: string;
  kind: 'story' | 'model' | 'guided' | 'practice' | 'quiz' | 'challenge' | 'summary';
  body: string;
  note?: string;
  sourceTag?: string;
  activity?: Activity;
};

type Saved = {
  version: 1;
  stageIndex: number;
  responses: Record<string, string>;
  orders: Record<string, string[]>;
  checked: Record<string, boolean>;
  results: Record<string, boolean>;
  completedAt?: string;
};

const KEY = 'mathnikita-lesson-5-progress-v1';

export const lessonFiveStages: DecimalMasteryStage[] = [
  { id:'l5-story',kind:'story',eyebrow:'Финал § 2',title:'Паспорт большого числа',body:'У каждого многозначного числа есть точная структура: цифры, классы, разряды и разрядные слагаемые. Сегодня мы соберём все эти знания в один надёжный алгоритм.',note:'Урок № 5 в методическом плане — обобщение и систематизация темы «Цифры. Десятичная запись натуральных чисел».',sourceTag:'Мерзляк § 2 · технологическая карта урока № 5' },
  { id:'l5-diagnostic',kind:'guided',eyebrow:'Быстрый вход',title:'Сначала проверь запись',body:'Пробелы между классами помогают читать число, но не меняют его значение. Главное — отделять группы справа налево по три цифры.',activity:{id:'l5-a1',type:'choice',prompt:'Какая запись правильно разбивает число 12005040 на классы?',options:['1 200 50 40','12 005 040','120 05 040','12 00 5 040'],answer:'12 005 040',explanation:'Справа получаются группы 040, 005 и 12: 12 005 040.'}},
  { id:'l5-digits',kind:'model',eyebrow:'Десять знаков',title:'Цифр десять, а чисел бесконечно много',body:'Все натуральные числа записывают десятью цифрами: 0, 1, 2, 3, 4, 5, 6, 7, 8, 9. Значение цифры зависит от позиции, поэтому одинаковый знак может обозначать единицы, тысячи или миллионы.',note:'Цифра — знак записи. Число — математический объект, записанный одной или несколькими цифрами.',sourceTag:'Мерзляк § 2: цифры и многозначные числа' },
  { id:'l5-decimal-step',kind:'guided',eyebrow:'Десятичная система',title:'Соседние разряды отличаются в 10 раз',body:'Десять единиц образуют десяток, десять десятков — сотню, десять сотен — тысячу. Поэтому каждый шаг влево умножает значение позиции на 10.',activity:{id:'l5-a2',type:'choice',prompt:'Какое значение имеет цифра 1, если она стоит на два разряда левее тысяч?',options:['10 000','100 000','1 000 000','100'],answer:'100 000',explanation:'От тысяч два шага влево: десятки тысяч, затем сотни тысяч. Получаем 100 000.'}},
  { id:'l5-classes',kind:'model',eyebrow:'Карта числа',title:'Классы читают слева направо',body:'Справа находятся классы единиц, тысяч, миллионов и миллиардов. В каждом классе три разряда: сотни, десятки и единицы этого класса.',note:'Левый класс может содержать одну, две или три цифры. Остальные классы при записи занимают ровно три места.' },
  { id:'l5-zero-check',kind:'guided',eyebrow:'Нули на посту',title:'Нуль сохраняет адрес соседних цифр',body:'Если разряд отсутствует, на его месте пишут 0. Полностью нулевой класс не произносят при чтении, но обязательно сохраняют в записи.',activity:{id:'l5-a3',type:'choice',prompt:'Как записать число «триста пять тысяч семь»?',options:['35 007','305 007','305 700','3 005 007'],answer:'305 007',explanation:'Класс тысяч равен 305, класс единиц — 007. Получаем 305 007.'}},
  { id:'l5-expanded-model',kind:'model',eyebrow:'Разрядная сумма',title:'Каждая ненулевая цифра даёт одно слагаемое',body:'Запись 4 080 706 025 можно разобрать как сумму значений всех ненулевых цифр. Нулевые разряды отдельными слагаемыми не записывают.',note:'Разложение — удобная проверка: если сложить все разрядные слагаемые, должно получиться исходное число.' },
  { id:'l5-read',kind:'practice',eyebrow:'Практика · 1/6',title:'Прочитай число с пустыми классами',body:'Читай ненулевые классы слева направо. Полностью нулевой класс пропускай, но не сдвигай остальные.',activity:{id:'l5-p1',type:'choice',prompt:'Как правильно прочитать 48 007 005 090?',options:['сорок восемь миллиардов семь миллионов пять тысяч девяносто','сорок восемь миллиардов семь тысяч пятьсот девяносто','сорок восемь миллионов семь тысяч пятьдесят девять','сорок восемь миллиардов семь миллионов пятьсот девять'],answer:'сорок восемь миллиардов семь миллионов пять тысяч девяносто',explanation:'Классы: 48 миллиардов, 007 миллионов, 005 тысяч, 090 единиц.'}},
  { id:'l5-write',kind:'practice',eyebrow:'Практика · 2/6',title:'Запиши число по названию',body:'Сначала подготовь по три позиции для каждого класса, затем заполни их цифрами. Пустые разряды обозначь нулями.',activity:{id:'l5-p2',type:'input',prompt:'Запиши цифрами: шесть миллиардов тридцать миллионов четыреста тысяч два',answer:'6030400002',placeholder:'Только цифры',explanation:'Классы: 6 | 030 | 400 | 002. Получаем 6 030 400 002.'}},
  { id:'l5-address',kind:'practice',eyebrow:'Практика · 3/6',title:'Назови точный разряд цифры',body:'Двойное название разряда состоит из места внутри класса и названия самого класса.',activity:{id:'l5-p3',type:'choice',prompt:'Что означает цифра 7 в числе 3 742 018 605?',options:['7 десятков миллионов','7 сотен миллионов','7 единиц миллиардов','7 сотен тысяч'],answer:'7 сотен миллионов',explanation:'Класс миллионов равен 742. Цифра 7 занимает в нём позицию сотен миллионов.'}},
  { id:'l5-expand',kind:'practice',eyebrow:'Практика · 4/6',title:'Выбери полное разложение',body:'Сверяй каждую ненулевую цифру с её позицией.',activity:{id:'l5-p4',type:'choice',prompt:'Как разложить 4 080 706 025?',options:['4 000 000 000 + 80 000 000 + 700 000 + 6 000 + 20 + 5','4 000 000 000 + 8 000 000 + 700 000 + 6 000 + 20 + 5','400 000 000 + 80 000 000 + 700 000 + 6 000 + 20 + 5','4 000 000 000 + 80 000 000 + 70 000 + 6 000 + 20 + 5'],answer:'4 000 000 000 + 80 000 000 + 700 000 + 6 000 + 20 + 5',explanation:'Ненулевые цифры стоят в миллиардах, десятках миллионов, сотнях тысяч, единицах тысяч, десятках и единицах.'}},
  { id:'l5-compose',kind:'practice',eyebrow:'Практика · 5/6',title:'Собери число из слагаемых',body:'Размести каждое слагаемое в своём разряде и заполни пустые позиции нулями.',activity:{id:'l5-p5',type:'input',prompt:'Собери число: 9 000 000 000 + 20 000 000 + 400 + 6',answer:'9020000406',placeholder:'Только цифры',explanation:'Получаем классы 9 | 020 | 000 | 406, то есть 9 020 000 406.'}},
  { id:'l5-digit-build',kind:'practice',eyebrow:'Практика · 6/6',title:'Составь числа без ведущего нуля',body:'Цифра 0 может стоять внутри или в конце записи, но многозначное число не начинается с нуля. При полном переборе важно не потерять варианты и не посчитать лишние.',activity:{id:'l5-p6',type:'input',prompt:'Сколько трёхзначных чисел можно составить из цифр 5, 6 и 0, используя каждую ровно один раз?',answer:'4',explanation:'Подходят 506, 560, 605 и 650. Записи 056 и 065 не являются трёхзначными.'}},
  { id:'l5-full-thousands',kind:'guided',eyebrow:'Скрытый вопрос',title:'Цифра разряда и количество полных единиц',body:'В числе 7 034 918 цифра тысяч равна 4, но полных тысяч содержится 7034. Для количества полных тысяч нужно отбросить последние три цифры.',activity:{id:'l5-a4',type:'input',prompt:'Сколько полных тысяч содержится в числе 7 034 918?',answer:'7034',explanation:'7 034 918 = 7034 · 1000 + 918.'}},
  { id:'l5-page-model',kind:'model',eyebrow:'Нумерация страниц',title:'Разные страницы требуют разного числа цифр',body:'Страницы 1–9 используют по одной цифре, 10–99 — по две, а трёхзначные номера — по три. Поэтому подсчёт разбивают на диапазоны.',note:'Для страниц 1–172: 9 + 90 · 2 + 73 · 3 = 408 цифр.',sourceTag:'Мерзляк § 2, задача на количество цифр в нумерации страниц' },
  { id:'l5-page-count',kind:'guided',eyebrow:'Считаем по диапазонам',title:'Сколько цифр ушло на нумерацию?',body:'Сначала посчитай цифры в однозначных и двузначных номерах, затем добавь трёхзначные.',activity:{id:'l5-a5',type:'input',prompt:'Сколько цифр нужно, чтобы пронумеровать страницы от 1 до 172?',answer:'408',explanation:'9 однозначных дают 9 цифр, 90 двузначных — 180, 73 трёхзначных — 219. Всего 408.'}},
  { id:'l5-algorithm',kind:'guided',eyebrow:'Самопроверка',title:'Универсальный порядок работы',body:'Один и тот же порядок помогает читать, записывать и разбирать любые большие числа.',activity:{id:'l5-a6',type:'order',prompt:'Расставь шаги проверки многозначного числа',items:['Разделить запись справа по три цифры','Назвать классы слева направо','Проверить нули и разряды','При необходимости разложить на слагаемые'],answer:['Разделить запись справа по три цифры','Назвать классы слева направо','Проверить нули и разряды','При необходимости разложить на слагаемые'],explanation:'Классы создают структуру, после чего можно проверить разряды, нули и разложение.'}},
  { id:'l5-quiz1',kind:'quiz',eyebrow:'Мини-проверка · 1/5',title:'Чтение числа',body:'Ответь без подсказки.',activity:{id:'l5-q1',type:'choice',prompt:'Как прочитать 5 060 004?',options:['пять миллионов шестьдесят тысяч четыре','пять миллионов шесть тысяч четыре','пятьсот шесть тысяч четыре','пять миллионов шестьдесят четыре'],answer:'пять миллионов шестьдесят тысяч четыре',explanation:'Классы равны 5 миллионов, 060 тысяч и 004 единиц.'}},
  { id:'l5-quiz2',kind:'quiz',eyebrow:'Мини-проверка · 2/5',title:'Запись числа',body:'Ответь без подсказки.',activity:{id:'l5-q2',type:'input',prompt:'Запиши цифрами: семь миллиардов восемь миллионов сорок две тысячи девять',answer:'7008042009',placeholder:'Только цифры',explanation:'Классы: 7 | 008 | 042 | 009.'}},
  { id:'l5-quiz3',kind:'quiz',eyebrow:'Мини-проверка · 3/5',title:'Разрядное значение',body:'Ответь без подсказки.',activity:{id:'l5-q3',type:'choice',prompt:'Что означает цифра 3 в числе 4 305 018?',options:['3 тысячи','3 десятка тысяч','3 сотни тысяч','3 миллиона'],answer:'3 сотни тысяч',explanation:'Класс тысяч равен 305, поэтому цифра 3 означает 300 000.'}},
  { id:'l5-quiz4',kind:'quiz',eyebrow:'Мини-проверка · 4/5',title:'Разрядная сумма',body:'Ответь без подсказки.',activity:{id:'l5-q4',type:'choice',prompt:'Как разложить 70 040 006?',options:['70 000 000 + 40 000 + 6','7 000 000 + 40 000 + 6','70 000 000 + 4 000 + 6','70 000 000 + 400 000 + 6'],answer:'70 000 000 + 40 000 + 6',explanation:'Цифра 4 стоит в десятках тысяч.'}},
  { id:'l5-quiz5',kind:'quiz',eyebrow:'Мини-проверка · 5/5',title:'Полные сотни',body:'Ответь без подсказки.',activity:{id:'l5-q5',type:'input',prompt:'Сколько полных сотен содержится в числе 91 284?',answer:'912',explanation:'91 284 = 912 · 100 + 84.'}},
  { id:'l5-challenge',kind:'challenge',eyebrow:'Задача от исследователя',title:'Восстанови количество страниц',body:'Для нумерации книги от страницы 1 использовали 2004 цифры. Определи, сколько страниц было в книге.',note:'Отдельно учти страницы 1–9 и 10–99, затем выясни количество трёхзначных страниц.',sourceTag:'Мерзляк § 2, задача о нумерации страниц',activity:{id:'l5-c1',type:'input',prompt:'Сколько страниц в книге?',answer:'704',explanation:'До страницы 99 использовано 189 цифр. Осталось 1815 цифр, это 605 трёхзначных номеров. Всего 99 + 605 = 704 страницы.'}},
  { id:'l5-summary',kind:'summary',eyebrow:'Итог § 2',title:'Система собрана',body:'Ты умеешь читать и записывать многозначные числа, определять классы и разряды, работать с нулями, раскладывать и собирать числа, а также решать задачи на количество цифр.',note:'Следующий урок открывает геометрию: точка, отрезок и измерение длины.' },
];

const empty: Saved = { version:1,stageIndex:0,responses:{},orders:{},checked:{},results:{} };
function norm(value:string){return value.trim().toLowerCase().replace(/[\s\u00a0]+/g,'').replace(/ё/g,'е')}
function load():Saved{
  try{
    const parsed=JSON.parse(localStorage.getItem(KEY)??'null') as Partial<Saved>|null;
    return parsed?.version===1?{...empty,...parsed,stageIndex:Math.min(Math.max(Number(parsed.stageIndex)||0,0),lessonFiveStages.length-1),responses:parsed.responses??{},orders:parsed.orders??{},checked:parsed.checked??{},results:parsed.results??{}}:empty;
  }catch{return empty}
}

export function DecimalNotationMasteryPlayer(){
  const saved=useMemo(load,[]);
  const[stageIndex,setStageIndex]=useState(saved.stageIndex);
  const[responses,setResponses]=useState(saved.responses);
  const[orders,setOrders]=useState(saved.orders);
  const[checked,setChecked]=useState(saved.checked);
  const[results,setResults]=useState(saved.results);
  const[completedAt,setCompletedAt]=useState(saved.completedAt);
  const stage=lessonFiveStages[stageIndex];
  const activity=stage.activity;
  const answer=activity?responses[activity.id]??'':'';
  const ordered=activity?orders[activity.id]??[]:[];
  const isChecked=activity?Boolean(checked[activity.id]):false;
  const correct=activity?Boolean(results[activity.id]):false;
  const quiz=['l5-q1','l5-q2','l5-q3','l5-q4','l5-q5'];
  const practice=['l5-p1','l5-p2','l5-p3','l5-p4','l5-p5','l5-p6'];
  const quizScore=quiz.filter(id=>results[id]).length;
  const practiceScore=practice.filter(id=>results[id]).length;
  const progress=Math.round(((stageIndex+1)/lessonFiveStages.length)*100);

  useEffect(()=>localStorage.setItem(KEY,JSON.stringify({version:1,stageIndex,responses,orders,checked,results,completedAt})),[stageIndex,responses,orders,checked,results,completedAt]);
  useEffect(()=>{if(stage.kind==='summary'&&!completedAt)setCompletedAt(new Date().toISOString())},[stage.kind,completedAt]);
  useEffect(()=>{const handler=(event:Event)=>{const detail=(event as CustomEvent).detail;if(detail?.lessonNumber===5&&Number.isInteger(detail.stageIndex))goTo(detail.stageIndex)};window.addEventListener('mathnikita-go-to-stage',handler);return()=>window.removeEventListener('mathnikita-go-to-stage',handler)},[]);

  function goTo(index:number){setStageIndex(Math.min(Math.max(index,0),lessonFiveStages.length-1));window.scrollTo({top:0,behavior:'smooth'})}
  function setAnswer(value:string){if(!activity)return;setResponses(previous=>({...previous,[activity.id]:value}));setChecked(previous=>({...previous,[activity.id]:false}))}
  function setOrder(value:string[]){if(!activity)return;setOrders(previous=>({...previous,[activity.id]:value}));setChecked(previous=>({...previous,[activity.id]:false}))}
  function submit(){if(!activity)return;const ok=activity.type==='order'?JSON.stringify(ordered)===JSON.stringify(activity.answer):norm(answer)===norm(String(activity.answer));setChecked(previous=>({...previous,[activity.id]:true}));setResults(previous=>({...previous,[activity.id]:ok}))}
  function reset(){localStorage.removeItem(KEY);setStageIndex(0);setResponses({});setOrders({});setChecked({});setResults({});setCompletedAt(undefined)}

  const model=useMemo(()=>{
    if(stage.id==='l5-story'||stage.id==='l5-diagnostic')return <div className="l5-number-passport"><b>12 005 040</b><div><span>12<small>миллионы</small></span><span>005<small>тысячи</small></span><span>040<small>единицы</small></span></div></div>;
    if(stage.id==='l5-digits'||stage.id==='l5-decimal-step')return <div className="l5-decimal-machine"><div className="l5-digit-strip">{[0,1,2,3,4,5,6,7,8,9].map(digit=><span key={digit}>{digit}</span>)}</div><div className="l5-place-flow"><b>1</b><i>×10</i><b>10</b><i>×10</i><b>100</b><i>×10</i><b>1 000</b></div></div>;
    if(['l5-classes','l5-zero-check','l5-read','l5-write','l5-address'].includes(stage.id))return <div className="l5-class-board">{[['миллиарды','48'],['миллионы','007'],['тысячи','005'],['единицы','090']].map(([name,value])=><div key={name}><small>{name}</small><b>{value}</b><span>сотни · десятки · единицы</span></div>)}</div>;
    if(['l5-expanded-model','l5-expand','l5-compose'].includes(stage.id))return <div className="l5-expanded-board"><b>4 080 706 025</b><i>→</i><div><span>4 000 000 000</span><span>80 000 000</span><span>700 000</span><span>6 000</span><span>20</span><span>5</span></div></div>;
    if(stage.id==='l5-digit-build')return <div className="l5-permutation-board">{['506','560','605','650'].map(value=><span key={value}>{value}</span>)}<small><s>056</s> и <s>065</s> не трёхзначные</small></div>;
    if(stage.id==='l5-full-thousands')return <div className="l5-full-units"><b>7 034 918</b><div><span>цифра тысяч<strong>4</strong></span><span>полных тысяч<strong>7034</strong></span></div></div>;
    if(stage.id==='l5-page-model'||stage.id==='l5-page-count'||stage.id==='l5-challenge')return <div className="l5-page-counter"><div><span>1–9</span><b>9 × 1</b></div><div><span>10–99</span><b>90 × 2</b></div><div><span>100 и далее</span><b>по 3 цифры</b></div></div>;
    return null;
  },[stage.id]);

  function render(current:Activity){
    if(current.type==='choice')return <div className="activity-area"><h3>{current.prompt}</h3><div className="choice-grid">{current.options!.map(option=><button key={option} className={answer===option?'selected':''} onClick={()=>setAnswer(option)}>{option}</button>)}</div><button className="check-button" disabled={!answer} onClick={submit}>Проверить</button></div>;
    if(current.type==='input')return <div className="activity-area"><h3>{current.prompt}</h3><div className="inline-answer"><input value={answer} onChange={event=>setAnswer(event.target.value)} onKeyDown={event=>event.key==='Enter'&&submit()} placeholder={current.placeholder??'Ответ'}/><button className="check-button" disabled={!answer.trim()} onClick={submit}>Проверить</button></div></div>;
    const items=current.items??[];
    return <div className="activity-area"><h3>{current.prompt}</h3><div className="order-bank">{items.map(item=><button key={item} disabled={ordered.includes(item)} onClick={()=>setOrder([...ordered,item])}>{item}</button>)}</div><div className="order-result">{ordered.map((item,index)=><button key={`${item}-${index}`} onClick={()=>setOrder(ordered.filter((_,position)=>position!==index))}>{index+1}. {item}</button>)}</div><button className="check-button" disabled={ordered.length!==items.length} onClick={submit}>Проверить</button></div>;
  }

  return <main className="lesson-player-page decimal-notation-mastery-page"><section className="lesson-workspace interactive-workspace">
    <header className="lesson-header"><div><span>Урок 5 из 175 · § 2</span><h1>Десятичная запись: обобщение</h1><p>Финальный урок параграфа: чтение и запись больших чисел, классы, разряды, нули, разрядные слагаемые и задачи на количество цифр.</p></div><div className="lesson-duration">40–45 мин</div></header>
    <div className="lesson-progress"><i style={{width:`${progress}%`}}/></div>
    <div className="stage-counter"><span>Этап {stageIndex+1} из {lessonFiveStages.length}</span><button type="button" onClick={reset}>Начать заново</button></div>
    <article className={`interactive-stage stage-${stage.kind}`} data-stage-id={stage.id}>
      <div className="stage-copy"><span>{stage.eyebrow}</span><h2>{stage.title}</h2><p>{stage.body}</p>{stage.sourceTag?<small className="source-tag">Источник: {stage.sourceTag}</small>:null}{stage.note?<div className="theory-note"><b>Запомни</b><span>{stage.note}</span></div>:null}</div>
      {model}{activity?render(activity):null}
      {isChecked&&activity?<div className={`instant-feedback ${correct?'good':'bad'}`} data-explanation={activity.explanation}><b>{correct?'Верно!':'Пока не получилось'}</b><span>{correct?activity.explanation:`Раздели число на классы и проверь каждую позицию. ${activity.explanation}`}</span></div>:null}
      {stage.kind==='quiz'&&isChecked?<div className="quiz-meter"><span>Текущий результат</span><b>{quizScore} из 5</b></div>:null}
      {stage.kind==='summary'?<div className="summary-card"><div><span>Мини-проверка</span><b>{quizScore}/5</b><small>{quizScore>=4?'Тема усвоена':'Нужно повторение'}</small></div><div><span>Практика</span><b>{practiceScore}/6</b><small>выполнено верно</small></div><div><span>Статус</span><b>{quizScore>=4&&practiceScore>=5?'Завершён':'Повторить'}</b><small>{completedAt?new Date(completedAt).toLocaleDateString('ru-RU'):'сегодня'}</small></div></div>:null}
    </article>
    <footer className="lesson-controls"><button onClick={()=>goTo(stageIndex-1)} disabled={stageIndex===0}>← Назад</button><span>{progress}% урока</span><button className="primary" onClick={()=>goTo(stageIndex+1)} disabled={stageIndex===lessonFiveStages.length-1||Boolean(activity&&!correct)}>Продолжить →</button></footer>
  </section></main>;
}
