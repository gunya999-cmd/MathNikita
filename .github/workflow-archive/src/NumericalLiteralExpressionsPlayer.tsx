import { useEffect,useMemo,useState } from 'react';
import { ExtendedPracticeLab } from './ExtendedPracticeLab';
import './lessonPlayer.css';
import './theoryExperience.css';
import './additionProperties.css';

type Activity={id:string;type:'choice'|'input';prompt:string;options?:string[];answer:string;hint:string;explanation:string;placeholder?:string};
type Stage={id:string;kind:'story'|'model'|'guided'|'practice'|'quiz'|'challenge'|'summary';eyebrow:string;title:string;body:string;note?:string;activity?:Activity};
type Saved={version:1;stageIndex:number;responses:Record<string,string>;checked:Record<string,boolean>;results:Record<string,boolean>};

const KEY='mathnikita-lesson-30-progress-v1';

export const lessonThirtyStages:Stage[]=[
  {id:'l30-mission',kind:'story',eyebrow:'Урок 30 · § 9 · новый язык',title:'Одна запись — много задач',body:'Математика умеет не только считать конкретные числа. Буквы позволяют записать общий способ решения: меняются значения, а математическая структура остаётся той же.',note:'Сегодня научимся различать числовые и буквенные выражения, находить их значения и читать формулы.'},
  {id:'l30-number-expression',kind:'model',eyebrow:'Понятие 1',title:'Что такое числовое выражение',body:'Числовое выражение — осмысленная запись, составленная из чисел, знаков арифметических действий и, если нужно, скобок. Например: 12 : 4 − 1 или 2 · 3 + 2 · 5.'},
  {id:'l30-number-choice',kind:'guided',eyebrow:'Проверь понимание',title:'Узнай числовое выражение',body:'В числовом выражении нет букв.',activity:{id:'l30-a1',type:'choice',prompt:'Какая запись является числовым выражением?',options:['(27 + 16) · 5','32 : a','P = 4a','x + 9'],answer:'(27 + 16) · 5',hint:'Ищи запись только с числами, действиями и скобками.',explanation:'(27 + 16) · 5 — числовое выражение: букв в нём нет.'}},
  {id:'l30-value',kind:'model',eyebrow:'Понятие 2',title:'Значение выражения',body:'Когда все действия в числовом выражении выполнены, полученное число называют значением выражения. Например, значение 2 · 3 + 2 · 5 равно 16.'},
  {id:'l30-value-practice',kind:'practice',eyebrow:'Практика · 1/7',title:'Найди значение',body:'Соблюдай порядок действий.',activity:{id:'l30-p1',type:'input',prompt:'56 + 42 : 14 − 7 = ?',answer:'52',placeholder:'Ответ',hint:'Сначала выполни деление 42 : 14.',explanation:'42 : 14 = 3, затем 56 + 3 − 7 = 52.'}},
  {id:'l30-brackets',kind:'guided',eyebrow:'Скобки меняют ход вычислений',title:'Похожие записи могут иметь разные значения',body:'Сравни 56 + 42 : 14 − 7 и (56 + 42) : 14 − 7. Скобки заставляют сначала выполнить сумму.',activity:{id:'l30-p2',type:'input',prompt:'(56 + 42) : 14 − 7 = ?',answer:'0',placeholder:'Ответ',hint:'Сначала 56 + 42.',explanation:'98 : 14 = 7, а 7 − 7 = 0.'}},
  {id:'l30-letter-expression',kind:'model',eyebrow:'Понятие 3',title:'Буквенное выражение',body:'Если в выражении кроме чисел и действий есть буквы, это буквенное выражение. Например: a + b + 11, 5 + 3x, n : 2 + 5k. Буква может принимать разные значения.'},
  {id:'l30-letter-choice',kind:'practice',eyebrow:'Практика · 2/7',title:'Отличи буквенное выражение',body:'Не путай буквенное выражение с формулой: формула записана как равенство.',activity:{id:'l30-p3',type:'choice',prompt:'Какая запись является буквенным выражением?',options:['5 + 3x','48 − 19','P = 4a','72 : 8'],answer:'5 + 3x',hint:'Ищи букву, но не равенство, задающее зависимость.',explanation:'5 + 3x — буквенное выражение.'}},
  {id:'l30-multiplication',kind:'model',eyebrow:'Математическая запись',title:'Знак умножения часто опускают',body:'В буквенных выражениях вместо 5 · y пишут 5y, вместо m · n — mn, вместо 2 · (a + b) — 2(a + b). Это не новая операция, а более короткая запись умножения.'},
  {id:'l30-multiplication-check',kind:'practice',eyebrow:'Практика · 3/7',title:'Прочитай короткую запись',body:'Запись 7a означает 7 · a.',activity:{id:'l30-p4',type:'choice',prompt:'Что означает 3(x + 4)?',options:['3 · (x + 4)','3 + (x + 4)','3 : (x + 4)','x + 12 без вычислений'],answer:'3 · (x + 4)',hint:'Число перед скобками умножается на выражение в скобках.',explanation:'3(x + 4) — сокращённая запись произведения 3 · (x + 4).'}},
  {id:'l30-substitution',kind:'model',eyebrow:'Подстановка',title:'Из буквенного выражения получаем числовое',body:'Если заданы значения букв, подставь их вместо букв. Например, при a = 3 и b = 5 выражение 2a + 2b превращается в 2 · 3 + 2 · 5.'},
  {id:'l30-substitution-practice',kind:'practice',eyebrow:'Практика · 4/7',title:'Подставь значение буквы',body:'После подстановки выполни обычные вычисления.',activity:{id:'l30-p5',type:'input',prompt:'Найди значение 374 + x при x = 268.',answer:'642',placeholder:'Ответ',hint:'Запиши 374 + 268.',explanation:'374 + 268 = 642.'}},
  {id:'l30-two-letters',kind:'practice',eyebrow:'Практика · 5/7',title:'Две буквы',body:'Каждой букве соответствует своё заданное значение.',activity:{id:'l30-p6',type:'input',prompt:'Найди значение a + b + 988 при a = 714, b = 569.',answer:'2271',placeholder:'Ответ',hint:'Подставь: 714 + 569 + 988.',explanation:'714 + 569 + 988 = 2 271.'}},
  {id:'l30-formula',kind:'model',eyebrow:'Понятие 4',title:'Формула — это правило в виде равенства',body:'Равенство, которое показывает зависимость между величинами, называют формулой. Для прямоугольника со сторонами a и b периметр задаёт формула P = 2a + 2b.'},
  {id:'l30-rectangle',kind:'practice',eyebrow:'Практика · 6/7',title:'Работаем по формуле',body:'Формула остаётся одной и той же, меняются только значения сторон.',activity:{id:'l30-p7',type:'input',prompt:'Найди P по формуле P = 2a + 2b, если a = 3 см, b = 5 см.',answer:'16',placeholder:'Периметр, см',hint:'2 · 3 + 2 · 5.',explanation:'P = 6 + 10 = 16 см.'}},
  {id:'l30-square',kind:'model',eyebrow:'Ещё одна формула',title:'Периметр квадрата',body:'Если сторона квадрата равна a, его периметр вычисляют по формуле P = 4a. Одна формула подходит для квадрата любого размера.'},
  {id:'l30-path',kind:'model',eyebrow:'Формула пути',title:'s = vt',body:'Формула пути связывает три величины: s — путь, v — скорость, t — время. Чтобы найти путь, скорость умножают на время.'},
  {id:'l30-path-practice',kind:'practice',eyebrow:'Практика · 7/7',title:'Примени формулу пути',body:'Следи за единицами: км/ч · ч дают километры.',activity:{id:'l30-p8',type:'input',prompt:'Найди путь по формуле s = vt, если v = 60 км/ч, t = 4 ч.',answer:'240',placeholder:'Путь, км',hint:'60 · 4.',explanation:'s = 60 · 4 = 240 км.'}},
  {id:'l30-find-speed',kind:'guided',eyebrow:'Формула работает в обе стороны',title:'Известны путь и время',body:'Если s = vt, то скорость можно найти делением: v = s : t. Это тот же смысл формулы, только ищем другую величину.',activity:{id:'l30-a2',type:'input',prompt:'Поезд прошёл 324 км за 6 ч. Найди скорость.',answer:'54',placeholder:'км/ч',hint:'324 : 6.',explanation:'v = 324 : 6 = 54 км/ч.'}},
  {id:'l30-word-model',kind:'model',eyebrow:'От текста к выражению',title:'Буква хранит неизвестное или меняющееся число',body:'Если было m горшочков мёда, подарили 24, а затем съели n, остаток описывает выражение m + 24 − n. Оно работает при любых допустимых m и n.'},
  {id:'l30-word-check',kind:'guided',eyebrow:'Перевод на язык математики',title:'Составь выражение',body:'Сначала назови смысл каждого изменения.',activity:{id:'l30-a3',type:'choice',prompt:'Было m книг, купили ещё 18 и подарили другу n книг. Как записать остаток?',options:['m + 18 − n','m − 18 + n','18 − m − n','m + 18 + n'],answer:'m + 18 − n',hint:'Покупка увеличивает количество, подарок другу уменьшает.',explanation:'После двух изменений получаем m + 18 − n.'}},
  {id:'l30-quiz1',kind:'quiz',eyebrow:'Контроль · 1/5',title:'Распознавание',body:'Без подсказки из теории.',activity:{id:'l30-q1',type:'choice',prompt:'Что за запись 32 : a?',options:['Буквенное выражение','Числовое выражение','Формула','Уравнение с известным ответом'],answer:'Буквенное выражение',hint:'В записи есть буква и нет знака равенства.',explanation:'32 : a — буквенное выражение.'}},
  {id:'l30-quiz2',kind:'quiz',eyebrow:'Контроль · 2/5',title:'Значение выражения',body:'Соблюдай порядок действий.',activity:{id:'l30-q2',type:'input',prompt:'56 + 42 : (14 − 7) = ?',answer:'62',placeholder:'Ответ',hint:'Сначала скобки, затем деление.',explanation:'14 − 7 = 7, 42 : 7 = 6, 56 + 6 = 62.'}},
  {id:'l30-quiz3',kind:'quiz',eyebrow:'Контроль · 3/5',title:'Подстановка',body:'Вместо буквы подставь данное число.',activity:{id:'l30-q3',type:'input',prompt:'Найди 900 − x при x = 376.',answer:'524',placeholder:'Ответ',hint:'900 − 376.',explanation:'900 − 376 = 524.'}},
  {id:'l30-quiz4',kind:'quiz',eyebrow:'Контроль · 4/5',title:'Формула периметра',body:'Проверь подстановку обеих сторон.',activity:{id:'l30-q4',type:'input',prompt:'P = 2a + 2b. Найди P при a = 7 см, b = 4 см.',answer:'22',placeholder:'см',hint:'2 · 7 + 2 · 4.',explanation:'P = 14 + 8 = 22 см.'}},
  {id:'l30-quiz5',kind:'quiz',eyebrow:'Контроль · 5/5',title:'Формула пути',body:'Один короткий расчёт.',activity:{id:'l30-q5',type:'input',prompt:'s = vt. Найди s при v = 72 км/ч, t = 3 ч.',answer:'216',placeholder:'км',hint:'72 · 3.',explanation:'s = 216 км.'}},
  {id:'l30-challenge',kind:'challenge',eyebrow:'Задача повышенной сложности',title:'Построй формулу сам',body:'У Карлсона было 712 пирожных. Каждый час он съедает 18 пирожных. Через t часов будет съедено 18t пирожных.',activity:{id:'l30-c1',type:'choice',prompt:'Какая формула задаёт число c оставшихся пирожных?',options:['c = 712 − 18t','c = 712 + 18t','c = 18 − 712t','c = 712t − 18'],answer:'c = 712 − 18t',hint:'Из начального количества вычти то, что съедено за t часов.',explanation:'За t часов съедено 18t, поэтому c = 712 − 18t.'}},
  {id:'l30-summary',kind:'summary',eyebrow:'Итог урока 30',title:'Ты начал говорить на языке формул',body:'Теперь ты отличаешь числовое выражение от буквенного, находишь значение после подстановки, понимаешь смысл формулы и умеешь применять P = 2a + 2b, P = 4a и s = vt. Закрепи навык в обязательной практике.',note:'Урок 31 продолжит § 9: больше самостоятельного составления и преобразования выражений.'},
];

function normalize(value:string){return value.trim().toLowerCase().replace(/\s+/g,'').replace(/×/g,'·').replace(/\*/g,'·').replace(/,/g,'.')}
function loadSaved():Saved{
  try{const parsed=JSON.parse(localStorage.getItem(KEY)??'null') as Saved|null;if(parsed?.version===1&&Number.isInteger(parsed.stageIndex))return parsed}catch{/* ignore damaged progress */}
  return{version:1,stageIndex:0,responses:{},checked:{},results:{}};
}

export function NumericalLiteralExpressionsPlayer(){
  const initial=useMemo(loadSaved,[]);
  const[stageIndex,setStageIndex]=useState(Math.min(initial.stageIndex,lessonThirtyStages.length-1));
  const[responses,setResponses]=useState<Record<string,string>>(initial.responses);
  const[checked,setChecked]=useState<Record<string,boolean>>(initial.checked);
  const[results,setResults]=useState<Record<string,boolean>>(initial.results);
  const[practiceComplete,setPracticeComplete]=useState(false);
  const stage=lessonThirtyStages[stageIndex];
  const activity=stage.activity;
  const response=activity?responses[activity.id]??'':'';
  const isChecked=activity?Boolean(checked[activity.id]):false;
  const isCorrect=activity?Boolean(results[activity.id]):false;
  const percent=Math.round(((stageIndex+1)/lessonThirtyStages.length)*100);

  useEffect(()=>{localStorage.setItem(KEY,JSON.stringify({version:1,stageIndex,responses,checked,results} satisfies Saved))},[stageIndex,responses,checked,results]);

  function stopVoice(){window.dispatchEvent(new CustomEvent('mathnikita-stop-narration'));if('speechSynthesis'in window)window.speechSynthesis.cancel()}
  function moveTo(nextIndex:number){stopVoice();setStageIndex(Math.max(0,Math.min(nextIndex,lessonThirtyStages.length-1)));window.scrollTo({top:0,behavior:'smooth'})}
  function setResponse(value:string){if(!activity)return;setResponses(current=>({...current,[activity.id]:value}));setChecked(current=>({...current,[activity.id]:false}));setResults(current=>({...current,[activity.id]:false}))}
  function checkAnswer(){if(!activity||!response.trim())return;const correct=normalize(response)===normalize(activity.answer);setChecked(current=>({...current,[activity.id]:true}));setResults(current=>({...current,[activity.id]:correct}))}
  const canAdvance=!activity||isCorrect;

  return <main className="lesson-player">
    <div className="lesson-progress" aria-label={`Пройдено ${percent}% урока`}><i style={{width:`${percent}%`}}/></div>
    <section className={`interactive-stage ${stage.kind==='summary'?'stage-summary':''}`} data-stage-id={stage.id}>
      <div className="stage-counter">
        <span>{stageIndex+1} / {lessonThirtyStages.length}</span>
        <div>
          <button type="button" onClick={()=>moveTo(stageIndex-1)} disabled={stageIndex===0} aria-label="Предыдущий этап">←</button>
          <button type="button" onClick={()=>moveTo(stageIndex+1)} disabled={stageIndex===lessonThirtyStages.length-1||!canAdvance} aria-label="Следующий этап">→</button>
        </div>
      </div>
      <div className="stage-copy">
        <span>{stage.eyebrow}</span>
        <h2>{stage.title}</h2>
        <p>{stage.body}</p>
        {stage.note?<aside>{stage.note}</aside>:null}
      </div>

      {activity?<div className="activity-area">
        <h3>{activity.prompt}</h3>
        {activity.type==='choice'?<div className="choice-grid">{activity.options?.map(option=><button key={option} type="button" className={response===option?'selected':''} aria-pressed={response===option} onClick={()=>setResponse(option)} disabled={isCorrect}>{option}</button>)}</div>:<div className="inline-answer"><input value={response} onChange={event=>setResponse(event.target.value)} onKeyDown={event=>{if(event.key==='Enter')checkAnswer()}} placeholder={activity.placeholder??'Введи ответ'} disabled={isCorrect}/><button type="button" className="check-button" onClick={checkAnswer} disabled={!response.trim()||isCorrect}>Проверить</button></div>}
        {isChecked&&!isCorrect?<div className="instant-feedback bad" data-explanation={activity.explanation}><b>Пока не так.</b><span>{activity.hint}</span></div>:null}
        {isCorrect?<div className="instant-feedback good"><b>Верно!</b><span>{activity.explanation}</span></div>:null}
      </div>:null}

      {stage.kind==='summary'?<>
        <div className="summary-card"><b>{practiceComplete?'Обязательная практика пройдена':'Следующий шаг — обязательная практика'}</b><span>{practiceComplete?'Все 20 заданий урока 30 выполнены. Можно перейти к рефлексии урока.':'Практика закрепит классификацию выражений, подстановку и работу с формулами.'}</span></div>
        <ExtendedPracticeLab lessonNumber={30} onComplete={()=>setPracticeComplete(true)} onRestart={()=>setPracticeComplete(false)}/>
      </>:null}

      {stage.kind!=='summary'?<div className="lesson-controls">
        <button type="button" onClick={()=>moveTo(stageIndex-1)} disabled={stageIndex===0}>← Назад</button>
        <button type="button" onClick={()=>moveTo(stageIndex+1)} disabled={!canAdvance}>{activity&&!isCorrect?'Сначала реши задание':'Дальше →'}</button>
      </div>:null}
    </section>
  </main>;
}
