import { useEffect,useMemo,useState } from 'react';
import './lessonPlayer.css';
import './theoryExperience.css';
import './naturalAddition.css';

type Activity={id:string;type:'choice'|'input'|'order';prompt:string;options?:string[];items?:string[];answer:string|string[];explanation:string;placeholder?:string};
type Visual='terms'|'columns'|'carry'|'multi-carry'|'zero'|'check'|'algorithm'|'challenge'|'mission';
type Stage={id:string;title:string;eyebrow:string;kind:'story'|'model'|'guided'|'practice'|'quiz'|'challenge'|'summary';body:string;note?:string;sourceTag?:string;visual?:Visual;activity?:Activity};
type Saved={version:1;stageIndex:number;responses:Record<string,string>;orders:Record<string,string[]>;checked:Record<string,boolean>;results:Record<string,boolean>};

const KEY='mathnikita-lesson-21-progress-v1';

export const lessonTwentyOneStages:Stage[]=[
  {id:'l21-mission',kind:'story',eyebrow:'Глава 2 · § 7',title:'Большие числа тоже складываются по цифрам',body:'Сложение многозначных чисел выглядит сложным только до тех пор, пока мы не видим разряды. Сегодня разберём действие на простые шаги и научимся объяснять каждый перенос.',note:'Урок 21 по методике проходит теоретический материал § 7 только до свойств сложения. Перестановку и группировку слагаемых подробно изучим на следующем уроке.',sourceTag:'Мерзляк § 7 · технологическая карта урока 21',visual:'mission'},
  {id:'l21-recall',kind:'guided',eyebrow:'Актуализация',title:'Таблица сложения — двигатель столбика',body:'При сложении в столбик мы снова и снова складываем однозначные числа. Поэтому быстрый ответ на простой пример освобождает внимание для разрядов.',activity:{id:'l21-a1',type:'input',prompt:'Вычисли без столбика: 8 + 7.',answer:'15',placeholder:'Ответ',explanation:'8 + 7 = 15. Именно такие маленькие суммы встречаются внутри большого сложения.'}},
  {id:'l21-terms',kind:'model',eyebrow:'Математический язык',title:'Слагаемые и сумма',body:'В равенстве a + b = c числа a и b называют слагаемыми. Число c — сумма. Саму запись a + b тоже называют суммой.',note:'Например, в 2 340 + 615 = 2 955 числа 2 340 и 615 — слагаемые, а 2 955 — значение суммы.',sourceTag:'Учебник § 7 · вопросы 1–3, с. 50',visual:'terms'},
  {id:'l21-diagnostic',kind:'guided',eyebrow:'Проверим термин',title:'Что здесь является слагаемыми?',body:'Важно различать числа, которые складывают, и полученный результат.',activity:{id:'l21-a2',type:'choice',prompt:'В равенстве 4 208 + 731 = 4 939 какие числа являются слагаемыми?',options:['4 208 и 731','731 и 4 939','4 208 и 4 939','Только 4 939'],answer:'4 208 и 731',explanation:'Слагаемые — это числа, которые складывают: 4 208 и 731.'}},
  {id:'l21-columns',kind:'model',eyebrow:'Главный принцип',title:'Одинаковые разряды — друг под другом',body:'При сложении в столбик единицы записывают под единицами, десятки под десятками, сотни под сотнями. Тогда каждое действие выполняется внутри одного разряда.',note:'Начинаем справа, с единиц, и движемся влево.',sourceTag:'Методика урока 21: объяснить удобство и эффективность сложения в столбик',visual:'columns'},
  {id:'l21-practice1',kind:'practice',eyebrow:'Практика · 1/6',title:'Без перехода через разряд',body:'Сначала случай, где ни в одном разряде сумма цифр не достигает десяти.',activity:{id:'l21-p1',type:'input',prompt:'Вычисли: 4 208 + 731.',answer:'4939',placeholder:'Сумма',explanation:'Единицы: 8+1=9; десятки: 0+3=3; сотни: 2+7=9; тысячи: 4. Получаем 4 939.'}},
  {id:'l21-carry',kind:'model',eyebrow:'Переход через разряд',title:'10 единиц превращаются в 1 десяток',body:'Если сумма цифр разряда равна 10 или больше, записываем только цифру единиц результата, а десяток переносим в следующий разряд. Например, 6 + 9 = 15: пишем 5, а 1 десяток переносим.',note:'Перенесённая единица относится уже к следующему, более старшему разряду.',visual:'carry'},
  {id:'l21-practice2',kind:'practice',eyebrow:'Практика · 2/6',title:'Один перенос',body:'Следи за переносом из единиц в десятки и не теряй его.',activity:{id:'l21-p2',type:'input',prompt:'Вычисли: 38 476 + 5 209.',answer:'43685',placeholder:'Сумма',explanation:'6+9=15: пишем 5, переносим 1. Затем 7+0+1=8, 4+2=6, 8+5=13 и переносим 1 в десятки тысяч. Итог: 43 685.'}},
  {id:'l21-multi-carry',kind:'model',eyebrow:'Несколько переносов',title:'Перенос может идти цепочкой',body:'Иногда новый десяток появляется сразу в нескольких соседних разрядах. Тогда перенос нужно учитывать на каждом шаге, не пытаясь сложить всё число «целиком в уме».',note:'Хорошая привычка: проговаривать «пишу…, один переношу…».',visual:'multi-carry'},
  {id:'l21-practice3',kind:'practice',eyebrow:'Практика · 3/6',title:'Цепочка переносов',body:'Работай справа налево и учитывай каждую перенесённую единицу.',activity:{id:'l21-p3',type:'input',prompt:'Вычисли: 7 958 + 3 467.',answer:'11425',placeholder:'Сумма',explanation:'8+7=15; 5+6+1=12; 9+4+1=14; 7+3+1=11. Получаем 11 425.'}},
  {id:'l21-zero',kind:'model',eyebrow:'Особый случай',title:'Ноль не изменяет сумму',body:'Если к числу прибавить 0, число не изменится. Это видно и по смыслу действия: к имеющемуся количеству ничего не добавили.',note:'Можно записать: a + 0 = a и 0 + a = a. Подробно свойства сложения будем систематизировать в уроке 22.',visual:'zero'},
  {id:'l21-practice4',kind:'practice',eyebrow:'Практика · 4/6',title:'Сложение с нулём',body:'Здесь столбик вообще не нужен.',activity:{id:'l21-p4',type:'input',prompt:'Вычисли: 56 308 + 0.',answer:'56308',placeholder:'Сумма',explanation:'Прибавление нуля не меняет число: 56 308 + 0 = 56 308.'}},
  {id:'l21-check',kind:'model',eyebrow:'Самопроверка',title:'Ответ должен быть правдоподобным',body:'Перед тем как считать работу законченной, проверь три вещи: разряды записаны ровно друг под другом, последняя цифра суммы согласуется с единицами слагаемых, а величина ответа разумна.',note:'Например, 48 тысяч + 2 тысячи должны дать немного больше 50 тысяч, а не 5 тысяч и не 500 тысяч.',visual:'check'},
  {id:'l21-practice5',kind:'practice',eyebrow:'Практика · 5/6',title:'Большая сумма и быстрая оценка',body:'Сначала прикинь порядок ответа, затем вычисли точно.',activity:{id:'l21-p5',type:'input',prompt:'Вычисли: 48 750 + 2 365.',answer:'51115',placeholder:'Сумма',explanation:'48 750 + 2 365 = 51 115. Результат действительно немного больше 51 тысячи.'}},
  {id:'l21-error-check',kind:'guided',eyebrow:'Разбор ошибки',title:'Столбик съехал на один разряд',body:'Ученик получил для 32 405 + 786 число 40 265. Причина — он начал подписывать 786 под тысячами, а не под единицами.',activity:{id:'l21-a3',type:'choice',prompt:'Какова правильная сумма?',options:['33 191','40 265','32 491','111 005'],answer:'33 191',explanation:'Записываем 786 так, чтобы 6 стояло под 5 в разряде единиц. Тогда 32 405 + 786 = 33 191.'}},
  {id:'l21-algorithm',kind:'model',eyebrow:'Алгоритм',title:'Пять шагов сложения в столбик',body:'Алгоритм нужен не для замедления, а чтобы при больших числах не терять разряды и переносы.',note:'После нескольких тренировок эти шаги выполняются почти автоматически.',visual:'algorithm'},
  {id:'l21-practice6',kind:'practice',eyebrow:'Практика · 6/6',title:'Собери алгоритм',body:'Расположи действия в правильном порядке.',activity:{id:'l21-p6',type:'order',prompt:'Как складывать многозначные числа в столбик?',items:['Записать одинаковые разряды друг под другом','Начать сложение с единиц','Записать цифру результата данного разряда','Перенести лишний десяток в следующий разряд, если он появился','После последнего разряда проверить запись и величину ответа'],answer:['Записать одинаковые разряды друг под другом','Начать сложение с единиц','Записать цифру результата данного разряда','Перенести лишний десяток в следующий разряд, если он появился','После последнего разряда проверить запись и величину ответа'],explanation:'Сначала выравниваем разряды, затем идём справа налево, фиксируя результат и переносы, и в конце проверяем ответ.'}},
  {id:'l21-transfer',kind:'guided',eyebrow:'Задача',title:'Сложение отвечает на вопрос «сколько всего?»',body:'В первой школьной библиотеке 18 745 книг, во второй — 6 380 книг. Нужно узнать общее количество.',activity:{id:'l21-a4',type:'input',prompt:'Сколько книг в двух библиотеках вместе?',answer:'25125',placeholder:'Количество книг',explanation:'18 745 + 6 380 = 25 125 книг.'},sourceTag:'Линия упражнений № 167, 169, 173 · новые числа'},
  {id:'l21-quiz1',kind:'quiz',eyebrow:'Контроль · 1/5',title:'Термины',body:'Работай самостоятельно.',activity:{id:'l21-q1',type:'choice',prompt:'Как называют числа, которые складывают?',options:['Слагаемыми','Суммами','Разрядами','Множителями'],answer:'Слагаемыми',explanation:'Числа, которые складывают, называют слагаемыми.'}},
  {id:'l21-quiz2',kind:'quiz',eyebrow:'Контроль · 2/5',title:'Многозначное сложение',body:'Работай самостоятельно.',activity:{id:'l21-q2',type:'input',prompt:'Вычисли: 604 781 + 32 509.',answer:'637290',placeholder:'Сумма',explanation:'604 781 + 32 509 = 637 290.'}},
  {id:'l21-quiz3',kind:'quiz',eyebrow:'Контроль · 3/5',title:'Переход через десяток тысяч',body:'Работай самостоятельно.',activity:{id:'l21-q3',type:'input',prompt:'Вычисли: 9 999 + 26.',answer:'10025',placeholder:'Сумма',explanation:'9 999 + 26 = 10 025. Перенос последовательно проходит через несколько разрядов.'}},
  {id:'l21-quiz4',kind:'quiz',eyebrow:'Контроль · 4/5',title:'Ноль',body:'Работай самостоятельно.',activity:{id:'l21-q4',type:'input',prompt:'Вычисли: 83 407 + 0.',answer:'83407',placeholder:'Сумма',explanation:'Прибавление нуля не изменяет число.'}},
  {id:'l21-quiz5',kind:'quiz',eyebrow:'Контроль · 5/5',title:'Разрядное чувство',body:'Работай самостоятельно.',activity:{id:'l21-q5',type:'input',prompt:'Найди сумму наименьшего трёхзначного и наименьшего четырёхзначного натуральных чисел.',answer:'1100',placeholder:'Сумма',explanation:'Наименьшее трёхзначное число — 100, четырёхзначное — 1 000. Их сумма 1 100.'}},
  {id:'l21-challenge',kind:'challenge',eyebrow:'Задача со звёздочкой',title:'Восстанови потерянную цифру',body:'В столбике одна цифра стёрлась. Используй разряды и переносы, а не перебор всех чисел.',activity:{id:'l21-c1',type:'input',prompt:'5□8 + 267 = 825. Какая цифра скрыта?',answer:'5',placeholder:'Цифра',explanation:'Из равенства 5□8 + 267 = 825 получаем первое слагаемое 558. Значит, в разряде десятков скрыта цифра 5.'},visual:'challenge'},
  {id:'l21-summary',kind:'summary',eyebrow:'Итог урока 21',title:'Сложение стало алгоритмом',body:'Теперь ты называешь компоненты сложения, правильно выравниваешь разряды, выполняешь переносы и умеешь проверить правдоподобие результата. На уроке 22 выясним, как свойства сложения позволяют менять порядок вычислений и считать быстрее.',note:'Домашняя линия методики: § 7, вопросы 1–3, упражнения № 168, 170, 174.'},
];

function load():Saved{
  const fallback:Saved={version:1,stageIndex:0,responses:{},orders:{},checked:{},results:{}};
  try{
    const raw=localStorage.getItem(KEY);if(!raw)return fallback;
    const parsed=JSON.parse(raw) as Partial<Saved>;
    return {version:1,stageIndex:Math.min(Math.max(Number(parsed.stageIndex)||0,0),lessonTwentyOneStages.length-1),responses:parsed.responses??{},orders:parsed.orders??{},checked:parsed.checked??{},results:parsed.results??{}};
  }catch{return fallback}
}
function normalize(value:string){return value.trim().toLowerCase().replace(/\s+/g,'').replace(/[−–]/g,'-')}
function sameOrder(a:string[],b:string[]){return a.length===b.length&&a.every((value,index)=>value===b[index])}

function AdditionVisual({kind}:{kind?:Visual}){
  if(kind==='terms')return <div className="addition-visual"><div className="addition-equation"><span><b>a</b><small>слагаемое</small></span><i>+</i><span><b>b</b><small>слагаемое</small></span><i>=</i><span><b>c</b><small>сумма</small></span></div></div>;
  if(kind==='columns')return <div className="addition-visual"><div className="column-addition"><div className="number-row"><span>+</span><span>3 853 164</span></div><div className="number-row"><span></span><span>2 700 503</span></div><div className="number-row sum-row"><span></span><span>6 553 667</span></div></div><div className="addition-place-strip"><div><small>тысячи</small><b>3 + 2</b></div><div><small>сотни</small><b>1 + 5</b></div><div><small>десятки</small><b>6 + 0</b></div><div><small>единицы</small><b>4 + 3</b></div></div></div>;
  if(kind==='carry')return <div className="addition-visual"><div className="carry-demo"><span>6 + 9 = <b>15</b></span><span>пишем <b>5</b></span><span><b>1</b> десяток переносим ←</span></div></div>;
  if(kind==='multi-carry')return <div className="addition-visual"><div className="column-addition"><div className="carry-row">1 1 1</div><div className="number-row"><span>+</span><span>7 958</span></div><div className="number-row"><span></span><span>3 467</span></div><div className="number-row sum-row"><span></span><span>11 425</span></div></div></div>;
  if(kind==='zero')return <div className="addition-visual"><div className="addition-equation"><span><b>a</b><small>любое число</small></span><i>+</i><span><b>0</b><small>ничего не добавили</small></span><i>=</i><span><b>a</b><small>то же число</small></span></div></div>;
  if(kind==='check')return <div className="addition-visual"><div className="addition-check-list"><div><b>1. Разряды</b><span>Единицы под единицами, десятки под десятками.</span></div><div><b>2. Последняя цифра</b><span>Проверь отдельно сумму единиц.</span></div><div><b>3. Величина</b><span>Ответ должен быть разумного порядка.</span></div></div></div>;
  if(kind==='algorithm')return <div className="addition-visual"><div className="addition-algorithm">{['Выровнять разряды','Начать с единиц','Записать цифру','Учесть перенос','Проверить ответ'].map((text,index)=><div key={text}><b>{index+1}</b><span>{text}</span></div>)}</div></div>;
  if(kind==='challenge')return <div className="addition-visual"><div className="addition-challenge"><span>5<span className="box">?</span>8</span><span>+</span><span>267</span><span></span><span>=</span><span>825</span></div></div>;
  return <div className="addition-visual"><div className="addition-equation"><span><b>3 853 164</b><small>первое слагаемое</small></span><i>+</i><span><b>2 700 503</b><small>второе слагаемое</small></span><i>=</i><span><b>?</b><small>сумма</small></span></div></div>;
}

export function NaturalNumberAdditionPlayer(){
  const saved=useMemo(load,[]);
  const[stageIndex,setStageIndex]=useState(saved.stageIndex);
  const[responses,setResponses]=useState(saved.responses);
  const[orders,setOrders]=useState(saved.orders);
  const[checked,setChecked]=useState(saved.checked);
  const[results,setResults]=useState(saved.results);
  const stage=lessonTwentyOneStages[stageIndex];
  const activity=stage.activity;

  useEffect(()=>{localStorage.setItem(KEY,JSON.stringify({version:1,stageIndex,responses,orders,checked,results} satisfies Saved))},[stageIndex,responses,orders,checked,results]);
  useEffect(()=>{
    const jump=(event:Event)=>{
      const detail=(event as CustomEvent<{lessonNumber:number;stageIndex:number}>).detail;
      if(detail?.lessonNumber!==21)return;
      const next=Math.min(Math.max(detail.stageIndex,0),lessonTwentyOneStages.length-1);
      setStageIndex(next);window.scrollTo({top:0,behavior:'smooth'});
    };
    window.addEventListener('mathnikita-go-to-stage',jump);return()=>window.removeEventListener('mathnikita-go-to-stage',jump);
  },[]);

  const practiceCorrect=lessonTwentyOneStages.filter(item=>item.kind==='practice'&&item.activity).filter(item=>results[item.activity!.id]).length;
  const quizCorrect=lessonTwentyOneStages.filter(item=>item.kind==='quiz'&&item.activity).filter(item=>results[item.activity!.id]).length;
  const currentOrder=activity?orders[activity.id]??[]:[];
  const currentResponse=activity?responses[activity.id]??'':'';
  const isCorrect=activity?Boolean(results[activity.id]):true;
  const wasChecked=activity?Boolean(checked[activity.id]):false;

  function choose(value:string){if(!activity)return;setResponses(previous=>({...previous,[activity.id]:value}));setChecked(previous=>({...previous,[activity.id]:false}))}
  function addOrder(value:string){if(!activity)return;setOrders(previous=>({...previous,[activity.id]:[...(previous[activity.id]??[]),value]}));setChecked(previous=>({...previous,[activity.id]:false}))}
  function removeOrder(index:number){if(!activity)return;setOrders(previous=>({...previous,[activity.id]:(previous[activity.id]??[]).filter((_,itemIndex)=>itemIndex!==index)}));setChecked(previous=>({...previous,[activity.id]:false}))}
  function checkAnswer(){
    if(!activity)return;
    const correct=activity.type==='order'?sameOrder(currentOrder,activity.answer as string[]):normalize(currentResponse)===normalize(activity.answer as string);
    setChecked(previous=>({...previous,[activity.id]:true}));setResults(previous=>({...previous,[activity.id]:correct}));
  }
  function resetActivity(){if(!activity)return;setResponses(previous=>({...previous,[activity.id]:''}));setOrders(previous=>({...previous,[activity.id]:[]}));setChecked(previous=>({...previous,[activity.id]:false}));setResults(previous=>({...previous,[activity.id]:false}))}
  function move(delta:number){setStageIndex(index=>Math.min(Math.max(index+delta,0),lessonTwentyOneStages.length-1));window.scrollTo({top:0,behavior:'smooth'})}

  return <main className="lesson-player-page">
    <div className="lesson-workspace">
      <header className="lesson-header"><div><span>Урок 21 · § 7</span><h1>Сложение натуральных чисел</h1><p>Слагаемые, сумма, разрядная запись, перенос и самопроверка.</p></div><div className="lesson-duration">≈ 46 минут</div></header>
      <div className="lesson-progress"><i style={{width:`${((stageIndex+1)/lessonTwentyOneStages.length)*100}%`}}/></div>
      <div className="stage-counter"><span>Этап {stageIndex+1} из {lessonTwentyOneStages.length}</span><div><small>{practiceCorrect}/6 практика · {quizCorrect}/5 контроль</small></div></div>
      <section className={`interactive-stage stage-${stage.kind}`} data-stage-id={stage.id}>
        <div className="stage-copy"><span>{stage.eyebrow}</span><h2>{stage.title}</h2><p>{stage.body}</p>{stage.note?<p><b>{stage.note}</b></p>:null}{stage.sourceTag?<small className="addition-source">{stage.sourceTag}</small>:null}</div>
        <AdditionVisual kind={stage.visual}/>
        {activity?<div className="activity-area"><h3>{activity.prompt}</h3>
          {activity.type==='choice'?<div className="choice-grid">{activity.options?.map(option=><button key={option} type="button" className={currentResponse===option?'selected':''} onClick={()=>choose(option)}>{option}</button>)}</div>:null}
          {activity.type==='input'?<div className="inline-answer"><input value={currentResponse} onChange={event=>choose(event.target.value)} onKeyDown={event=>event.key==='Enter'&&currentResponse.trim()&&checkAnswer()} placeholder={activity.placeholder??'Ответ'}/></div>:null}
          {activity.type==='order'?<><div className="order-bank">{activity.items?.map(item=><button key={item} type="button" disabled={currentOrder.includes(item)} onClick={()=>addOrder(item)}>{item}</button>)}</div><div className="order-result">{currentOrder.length?currentOrder.map((item,index)=><button key={`${item}-${index}`} type="button" onClick={()=>removeOrder(index)}>{index+1}. {item}</button>):<span>Нажимай шаги по порядку</span>}</div></>:null}
          <div className="activity-actions"><button type="button" className="secondary" onClick={resetActivity}>Сбросить</button><button type="button" className="check-button" disabled={activity.type==='order'?!currentOrder.length:!currentResponse.trim()} onClick={checkAnswer}>Проверить</button></div>
          {wasChecked?<div className={`instant-feedback ${isCorrect?'good':'bad'}`} data-explanation={activity.explanation}><b>{isCorrect?'Верно!':'Проверь ещё раз'}</b><span>{activity.explanation}</span></div>:null}
        </div>:null}
        {stage.kind==='quiz'?<div className="quiz-meter"><span>Контроль урока</span><b>{quizCorrect}/5</b></div>:null}
        {stage.kind==='summary'?<div className="summary-card"><div><span>Контроль</span><b>{quizCorrect}/5</b><small>самостоятельных заданий</small></div><div><span>Практика</span><b>{practiceCorrect}/6</b><small>основных упражнений</small></div><div><span>Статус</span><b>{quizCorrect===5&&practiceCorrect===6?'Завершён':'Нужно закончить'}</b><small>урок 21</small></div></div>:null}
      </section>
      <nav className="lesson-controls" aria-label="Переход между этапами"><button type="button" disabled={stageIndex===0} onClick={()=>move(-1)}>← Назад</button><span>{stageIndex+1} / {lessonTwentyOneStages.length}</span><button type="button" className="primary" disabled={stageIndex===lessonTwentyOneStages.length-1||(Boolean(activity)&&!isCorrect)} onClick={()=>move(1)}>{stageIndex===lessonTwentyOneStages.length-1?'Завершено':'Дальше →'}</button></nav>
    </div>
  </main>;
}
