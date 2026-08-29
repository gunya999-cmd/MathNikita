import { useEffect,useMemo,useState } from 'react';
import './lessonPlayer.css';
import './theoryExperience.css';
import './coordinateRay.css';
import './naturalComparison.css';
import './naturalComparisonPractice.css';

type Activity={id:string;type:'choice'|'input';prompt:string;options?:string[];answer:string;explanation:string;placeholder?:string};
type Visual='mission'|'algorithm'|'digits'|'signs'|'double'|'boundary'|'ray'|'units'|'error'|'challenge';
export type ComparisonSummaryStage={id:string;title:string;eyebrow:string;kind:'story'|'model'|'guided'|'practice'|'quiz'|'challenge'|'summary';body:string;note?:string;sourceTag?:string;visual?:Visual;activity?:Activity};
type Saved={version:1;stageIndex:number;responses:Record<string,string>;checked:Record<string,boolean>;results:Record<string,boolean>;completedAt?:string};

const KEY='mathnikita-lesson-18-progress-v1';

export const lessonEighteenStages:ComparisonSummaryStage[]=[
  {id:'l18-mission',kind:'story',eyebrow:'Обобщение § 6',title:'Финальная проверка системы сравнения',body:'На двух предыдущих уроках ты изучил правила сравнения и связь с координатным лучом. Теперь нужно самостоятельно выбирать подходящий способ и объяснять результат.',note:'Главный принцип: сначала определи, что именно сравниваешь — числа, координаты или величины.',sourceTag:'Методическое пособие Мерзляка · технологическая карта урока 18',visual:'mission'},
  {id:'l18-diagnostic',kind:'guided',eyebrow:'Актуализация',title:'Выбери полный алгоритм',body:'Надёжный алгоритм должен работать для любых натуральных чисел.',activity:{id:'l18-a1',type:'choice',prompt:'Как правильно начать сравнение двух натуральных чисел?',options:['Сравнить количество цифр, затем разряды слева направо','Сравнить последние цифры','Сложить цифры каждого числа','Сразу построить координатный луч'],answer:'Сравнить количество цифр, затем разряды слева направо',explanation:'Сначала сравнивают длину записи. При равном количестве цифр ищут первую различающуюся цифру слева.'},visual:'algorithm'},
  {id:'l18-system',kind:'model',eyebrow:'Карта знаний',title:'Один навык — четыре формы',body:'Сравнение встречается в четырёх формах: два числа, неравенство с неизвестным, координаты точек и величины с единицами измерения.',note:'Правило по цифрам определяет порядок чисел; координатный луч показывает этот порядок геометрически.',sourceTag:'Мерзляк § 6 · итоговая систематизация',visual:'algorithm'},
  {id:'l18-practice1',kind:'practice',eyebrow:'Практика · 1/6',title:'Сначала количество цифр',body:'Не сравнивай первые цифры, пока не проверил длину записи.',activity:{id:'l18-p1',type:'input',prompt:'Поставь знак: 105 004 □ 99 999',answer:'>',placeholder:'>, < или =',explanation:'105 004 — шестизначное число, поэтому оно больше пятизначного 99 999.'},visual:'digits'},
  {id:'l18-practice2',kind:'practice',eyebrow:'Практика · 2/6',title:'Первая разница слева',body:'После первой различающейся цифры сравнение нужно остановить.',activity:{id:'l18-p2',type:'input',prompt:'Поставь знак: 564 321 □ 564 370',answer:'<',placeholder:'>, < или =',explanation:'Первые четыре цифры совпадают, затем 2 < 7, поэтому 564 321 < 564 370.'},visual:'digits'},
  {id:'l18-signs-model',kind:'model',eyebrow:'Язык неравенств',title:'Запись должна читаться как предложение',body:'Знаки > и < направлены острым концом к меньшему числу. Записи a < b и b > a сообщают один и тот же факт.',note:'После записи обязательно прочитай неравенство слева направо — это помогает заметить перевёрнутый знак.',visual:'signs'},
  {id:'l18-practice3',kind:'practice',eyebrow:'Практика · 3/6',title:'Переведи фразу на язык математики',body:'Буквы обозначают числа и сравниваются теми же знаками.',activity:{id:'l18-p3',type:'choice',prompt:'Как записать: «число a меньше числа b»?',options:['a < b','a > b','a = b','b < a'],answer:'a < b',explanation:'Фраза читается слева направо: a меньше b, значит a < b.'},visual:'signs'},
  {id:'l18-double-model',kind:'model',eyebrow:'Двойное неравенство',title:'Две строгие границы',body:'Запись 14 < x < 18 означает одновременно x > 14 и x < 18. Числа 14 и 18 не входят в множество решений.',note:'Чтобы ничего не пропустить, выписывай натуральные числа по порядку между границами.',sourceTag:'Математический диктант 5 · задание 4',visual:'double'},
  {id:'l18-practice4',kind:'practice',eyebrow:'Практика · 4/6',title:'Все числа между границами',body:'Запиши решения по возрастанию через запятую.',activity:{id:'l18-p4',type:'input',prompt:'Запиши все натуральные x, для которых 14 < x < 18.',answer:'15,16,17',placeholder:'Например: 2,3,4',explanation:'Строгим условиям удовлетворяют 15, 16 и 17.'},visual:'double'},
  {id:'l18-boundaries',kind:'model',eyebrow:'Крайние значения',title:'Следующее и предыдущее число',body:'Наименьшее натуральное число, большее a, равно a + 1. Наибольшее натуральное число, меньшее b, равно b − 1.',note:'Это работает для строгих неравенств m > a и n < b.',sourceTag:'Математический диктант 5 · задания 6–7',visual:'boundary'},
  {id:'l18-practice5',kind:'practice',eyebrow:'Практика · 5/6',title:'Наименьшее число после границы',body:'Возьми следующее натуральное число.',activity:{id:'l18-p5',type:'input',prompt:'Какое наименьшее натуральное m делает неравенство m > 734 верным?',answer:'735',placeholder:'Число',explanation:'Первое натуральное число после 734 — это 735.'},visual:'boundary'},
  {id:'l18-practice6',kind:'practice',eyebrow:'Практика · 6/6',title:'Наибольшее число перед границей',body:'Возьми предыдущее натуральное число.',activity:{id:'l18-p6',type:'input',prompt:'Какое наибольшее натуральное n делает неравенство n < 3 108 верным?',answer:'3107',placeholder:'Число',explanation:'Непосредственно перед 3 108 стоит число 3 107.'},visual:'boundary'},
  {id:'l18-ray-model',kind:'model',eyebrow:'Координатный луч',title:'Порядок чисел становится положением точек',body:'Если a < b, то A(a) расположена левее B(b). Если точка расположена правее, её координата больше.',note:'Направление луча и единичный отрезок должны быть одинаковыми для всех отмеченных точек.',visual:'ray'},
  {id:'l18-units-model',kind:'model',eyebrow:'Практические величины',title:'Сначала одинаковые единицы — потом знак',body:'Нельзя надёжно сравнить 2 км 85 м и 2 122 м по записанным цифрам. Сначала 2 км 85 м превращаем в 2 085 м, затем сравниваем 2 085 и 2 122.',note:'Числа сравнивают только после того, как обе величины выражены в одной единице.',sourceTag:'Методический комментарий к упражнениям № 161–162',visual:'units'},
  {id:'l18-transfer',kind:'guided',eyebrow:'Применение',title:'Сравни длины',body:'Переведи километры в метры.',activity:{id:'l18-a2',type:'choice',prompt:'Какая запись верна?',options:['2 км 85 м < 2 122 м','2 км 85 м > 2 122 м','2 км 85 м = 2 122 м'],answer:'2 км 85 м < 2 122 м',explanation:'2 км 85 м = 2 085 м, а 2 085 < 2 122.'},visual:'units'},
  {id:'l18-error-check',kind:'guided',eyebrow:'Коррекция ошибки',title:'Цифры без единиц могут обмануть',body:'Ученик записал 6 ц < 598 кг, потому что 6 < 598.',activity:{id:'l18-a3',type:'choice',prompt:'Как исправить решение?',options:['6 ц > 598 кг, потому что 6 ц = 600 кг','6 ц < 598 кг, потому что 6 меньше 598','Сравнить эти величины невозможно','6 ц = 598 кг'],answer:'6 ц > 598 кг, потому что 6 ц = 600 кг',explanation:'После перевода получаем 600 кг > 598 кг.'},visual:'error'},
  {id:'l18-quiz1',kind:'quiz',eyebrow:'Контроль · 1/5',title:'Поразрядное сравнение',body:'Без подсказки.',activity:{id:'l18-q1',type:'input',prompt:'Поставь знак: 1 020 400 □ 1 020 040',answer:'>',placeholder:'Знак',explanation:'Первые четыре цифры равны, затем 4 > 0.'}},
  {id:'l18-quiz2',kind:'quiz',eyebrow:'Контроль · 2/5',title:'Граница разрядности',body:'Без подсказки.',activity:{id:'l18-q2',type:'input',prompt:'Запиши наименьшее пятизначное натуральное число.',answer:'10000',placeholder:'Число',explanation:'Первое пятизначное натуральное число — 10 000.'}},
  {id:'l18-quiz3',kind:'quiz',eyebrow:'Контроль · 3/5',title:'Строго между числами',body:'Без подсказки.',activity:{id:'l18-q3',type:'input',prompt:'Сколько натуральных решений имеет неравенство 209 < x < 214?',answer:'4',placeholder:'Количество',explanation:'Подходят 210, 211, 212 и 213 — четыре числа.'}},
  {id:'l18-quiz4',kind:'quiz',eyebrow:'Контроль · 4/5',title:'Сравнение массы',body:'Без подсказки.',activity:{id:'l18-q4',type:'choice',prompt:'Выбери верную запись.',options:['7 ц 32 кг > 723 кг','7 ц 32 кг < 723 кг','7 ц 32 кг = 723 кг'],answer:'7 ц 32 кг > 723 кг',explanation:'7 ц 32 кг = 732 кг, а 732 > 723.'}},
  {id:'l18-quiz5',kind:'quiz',eyebrow:'Контроль · 5/5',title:'Все допустимые цифры',body:'Без подсказки.',activity:{id:'l18-q5',type:'input',prompt:'Запиши все цифры *, для которых 6*8 < 638.',answer:'0,1,2',placeholder:'Цифры по возрастанию',explanation:'Сотни равны. Цифра десятков должна быть меньше 3: 0, 1 или 2.'}},
  {id:'l18-challenge',kind:'challenge',eyebrow:'Задача повышенного уровня',title:'Ближайшее число с условием',body:'Нужно одновременно удержать строгую границу, разрядность и последнюю цифру.',activity:{id:'l18-c1',type:'input',prompt:'Какое наибольшее четырёхзначное число меньше 5 017 и оканчивается цифрой 7?',answer:'5007',placeholder:'Число',explanation:'Ближайшее число перед 5 017 с последней цифрой 7 — это 5 007. Оно четырёхзначное и удовлетворяет строгому неравенству.'},sourceTag:'Развитие математического диктанта 5 · задание 5',visual:'challenge'},
  {id:'l18-reflection',kind:'model',eyebrow:'Рефлексия',title:'Оцени не скорость, а надёжность',body:'Вспомни, где требовалось выбрать правило, где — проверить знак, а где — сначала перевести единицы. Назови один шаг, который теперь будешь выполнять автоматически.',note:'Причина большинства ошибок — пропущенный первый шаг: количество цифр, строгая граница или перевод единиц.',visual:'mission'},
  {id:'l18-summary',kind:'summary',eyebrow:'Итог § 6',title:'Система сравнения собрана',body:'Ты умеешь сравнивать натуральные числа по длине записи и разрядам, читать неравенства, находить числа между границами, работать с координатами и сравнивать величины после перевода единиц.',note:'Следующий урок — повторение всей главы 1 перед контрольной работой.',sourceTag:'Мерзляк · завершение § 6',visual:'mission'},
];

function normalize(value:string){return value.trim().toLowerCase().replace(/\s+/g,'').replace(/;/g,',').replace(/[–—]/g,'-')}
function emptySaved():Saved{return{version:1,stageIndex:0,responses:{},checked:{},results:{}}}
function load():Saved{
  try{
    const raw=localStorage.getItem(KEY);
    if(!raw)return emptySaved();
    const value=JSON.parse(raw) as Partial<Saved>;
    return{version:1,stageIndex:Math.min(Math.max(Number(value.stageIndex)||0,0),lessonEighteenStages.length-1),responses:value.responses??{},checked:value.checked??{},results:value.results??{},completedAt:value.completedAt};
  }catch{return emptySaved()}
}

function VisualBlock({kind}: {kind?:Visual}){
  if(kind==='algorithm')return <div className="comparison-visual"><div className="comparison-steps"><div><b>1</b>Что сравниваем?</div><div><b>2</b>Цифры или единицы</div><div><b>3</b>Решающий шаг</div><div><b>4</b>Знак и проверка</div></div></div>;
  if(kind==='digits')return <div className="comparison-visual"><div className="digit-cards"><span>5</span><span>6</span><span>4</span><span>3</span><mark>2</mark><span>1</span></div><div className="digit-cards"><span>5</span><span>6</span><span>4</span><span>3</span><mark>7</mark><span>0</span></div><p>Первая разница: 2 &lt; 7</p></div>;
  if(kind==='signs')return <div className="comparison-visual"><div className="comparison-sign-board"><b>17</b><strong>&lt;</strong><b>25</b><span>острый конец смотрит на меньшее</span></div></div>;
  if(kind==='double')return <div className="comparison-visual"><div className="comparison-sign-board"><b>14</b><strong>&lt;</strong><b>x</b><strong>&lt;</strong><b>18</b></div><p>15 · 16 · 17</p></div>;
  if(kind==='boundary')return <div className="comparison-visual"><div className="comparison-steps"><div><b>734</b>граница</div><div><b>735</b>первое большее</div><div><b>3107</b>последнее меньшее</div><div><b>3108</b>граница</div></div></div>;
  if(kind==='ray')return <div className="comparison-visual"><div className="comparison-ray"><span>меньше · левее</span><i/><b>→</b><span>больше · правее</span></div></div>;
  if(kind==='units')return <div className="comparison-visual"><div className="comparison-steps"><div><b>2 км 85 м</b>разные единицы</div><div><b>= 2085 м</b>одна единица</div><div><b>2085 &lt; 2122</b>сравнение</div></div></div>;
  if(kind==='error')return <div className="comparison-visual"><div className="comparison-sign-board"><b>6 ц</b><strong>?</strong><b>598 кг</b></div><p>Сначала: 6 ц = 600 кг</p></div>;
  if(kind==='challenge')return <div className="comparison-visual"><div className="digit-cards"><span>5</span><span>0</span><span>0</span><span>7</span></div><p>Ближайшее подходящее число перед 5 017</p></div>;
  return <div className="comparison-visual mission-visual"><div><b>1</b><span>Выбери правило</span></div><div><b>✓</b><span>Докажи результат</span></div></div>;
}

export function NaturalNumberComparisonSummaryPlayer(){
  const saved=useMemo(load,[]);
  const[stageIndex,setStageIndex]=useState(saved.stageIndex);
  const[responses,setResponses]=useState(saved.responses);
  const[checked,setChecked]=useState(saved.checked);
  const[results,setResults]=useState(saved.results);
  const[completedAt,setCompletedAt]=useState(saved.completedAt);
  const stage=lessonEighteenStages[stageIndex];

  useEffect(()=>{
    localStorage.setItem(KEY,JSON.stringify({version:1,stageIndex,responses,checked,results,completedAt} satisfies Saved));
  },[stageIndex,responses,checked,results,completedAt]);

  useEffect(()=>{
    const handler=(event:Event)=>{
      const detail=(event as CustomEvent<{lessonNumber:number;stageIndex:number}>).detail;
      if(detail?.lessonNumber!==18)return;
      setStageIndex(Math.min(Math.max(detail.stageIndex,0),lessonEighteenStages.length-1));
    };
    window.addEventListener('mathnikita-go-to-stage',handler);
    return()=>window.removeEventListener('mathnikita-go-to-stage',handler);
  },[]);

  useEffect(()=>{
    if(stage.id==='l18-summary'&&!completedAt)setCompletedAt(new Date().toISOString());
  },[stage.id,completedAt]);

  const activity=stage.activity;
  const response=activity?responses[activity.id]??'':'';
  const isChecked=activity?Boolean(checked[activity.id]):false;
  const isCorrect=activity?Boolean(results[activity.id]):true;
  const practiceIds=lessonEighteenStages.filter(item=>item.kind==='practice').flatMap(item=>item.activity?[item.activity.id]:[]);
  const quizIds=lessonEighteenStages.filter(item=>item.kind==='quiz').flatMap(item=>item.activity?[item.activity.id]:[]);
  const practiceScore=practiceIds.filter(id=>results[id]).length;
  const quizScore=quizIds.filter(id=>results[id]).length;

  function select(value:string){
    if(!activity)return;
    setResponses(previous=>({...previous,[activity.id]:value}));
    setChecked(previous=>({...previous,[activity.id]:false}));
    setResults(previous=>({...previous,[activity.id]:false}));
  }
  function checkAnswer(){
    if(!activity||!response.trim())return;
    const correct=normalize(response)===normalize(activity.answer);
    setChecked(previous=>({...previous,[activity.id]:true}));
    setResults(previous=>({...previous,[activity.id]:correct}));
  }
  function move(delta:number){
    setStageIndex(index=>Math.min(Math.max(index+delta,0),lessonEighteenStages.length-1));
    window.scrollTo({top:0,behavior:'smooth'});
  }

  return <main className="lesson-player-page comparison-practice-page">
    <section className="lesson-progress"><span>Урок 18 · страница {stageIndex+1} из {lessonEighteenStages.length}</span><div><i style={{width:`${((stageIndex+1)/lessonEighteenStages.length)*100}%`}}/></div></section>
    <article className="interactive-stage" data-stage-id={stage.id}>
      <div className="stage-copy">
        <span>{stage.eyebrow}</span>
        <h2>{stage.title}</h2>
        <p>{stage.body}</p>
        {stage.note?<aside className="stage-note">{stage.note}</aside>:null}
        {stage.sourceTag?<small className="source-tag">{stage.sourceTag}</small>:null}
      </div>
      <VisualBlock kind={stage.visual}/>
      {activity?<section className="activity-area">
        <h3>{activity.prompt}</h3>
        {activity.type==='choice'?<div className="choice-options">{activity.options?.map(option=><button type="button" key={option} className={response===option?'selected':''} onClick={()=>select(option)}>{option}</button>)}</div>:<div className="inline-answer"><input value={response} onChange={event=>select(event.target.value)} onKeyDown={event=>event.key==='Enter'&&checkAnswer()} placeholder={activity.placeholder??'Ответ'}/></div>}
        <button type="button" className="check-button" disabled={!response.trim()} onClick={checkAnswer}>Проверить</button>
        {isChecked?<div className={`instant-feedback ${isCorrect?'good':'bad'}`} data-explanation={activity.explanation}><b>{isCorrect?'Верно':'Проверь ещё раз'}</b><span>{isCorrect?activity.explanation:'Вернись к правилу этой страницы и проверь решающий шаг.'}</span></div>:null}
      </section>:null}
      {stage.kind==='summary'?<section className="summary-card"><span>§ 6 завершён</span><h3>Сравнение натуральных чисел</h3><div><b>{practiceScore}/6</b><small>тренировка</small></div><div><b>{quizScore}/5</b><small>контроль</small></div><strong>{practiceScore===6&&quizScore===5?'Завершён':'Нужно повторить задания'}</strong></section>:null}
    </article>
    <nav className="lesson-controls">
      <button type="button" onClick={()=>move(-1)} disabled={stageIndex===0}>← Назад</button>
      <button type="button" className="primary" onClick={()=>move(1)} disabled={stageIndex===lessonEighteenStages.length-1||Boolean(activity)&&(!isChecked||!isCorrect)}>{stageIndex===lessonEighteenStages.length-2?'К итогу →':'Дальше →'}</button>
    </nav>
  </main>;
}
