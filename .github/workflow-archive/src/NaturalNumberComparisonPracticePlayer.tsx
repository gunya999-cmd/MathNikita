import { useEffect,useMemo,useState } from 'react';
import './lessonPlayer.css';
import './theoryExperience.css';
import './coordinateRay.css';
import './naturalComparison.css';
import './naturalComparisonPractice.css';

type Activity={id:string;type:'choice'|'input'|'order';prompt:string;options?:string[];items?:string[];answer:string|string[];explanation:string;placeholder?:string};
type Visual='mission'|'ray'|'relation'|'double'|'digits'|'cases'|'error'|'challenge';
export type ComparisonPracticeStage={id:string;title:string;eyebrow:string;kind:'story'|'model'|'guided'|'practice'|'quiz'|'challenge'|'summary';body:string;note?:string;sourceTag?:string;visual?:Visual;activity?:Activity};
type Saved={version:1;stageIndex:number;responses:Record<string,string>;orders:Record<string,string[]>;checked:Record<string,boolean>;results:Record<string,boolean>;completedAt?:string};

const KEY='mathnikita-lesson-17-progress-v1';

export const lessonSeventeenStages:ComparisonPracticeStage[]=[
  {id:'l17-mission',kind:'story',eyebrow:'Закрепление § 6',title:'Сравнение становится геометрией',body:'На координатном луче числа не просто подписаны: их положение показывает результат сравнения. Чем правее точка, тем больше её координата.',note:'Сегодня каждое неравенство будем проверять двумя способами: по записи числа и по положению на луче.',sourceTag:'Методическое пособие Мерзляка · технологическая карта урока 17',visual:'mission'},
  {id:'l17-recall',kind:'guided',eyebrow:'Актуализация',title:'Восстанови главное правило',body:'Сравнение по цифрам остаётся основным вычислительным способом.',activity:{id:'l17-a1',type:'choice',prompt:'Как правильно сравнить 58 407 и 58 470?',options:['Найти первую различающуюся цифру слева','Сравнить только последние цифры','Сложить цифры каждого числа','Числа нельзя сравнить без луча'],answer:'Найти первую различающуюся цифру слева',explanation:'Первые три цифры совпадают, затем 0 < 7, поэтому 58 407 < 58 470.'},visual:'digits'},
  {id:'l17-left-right',kind:'model',eyebrow:'Новая связь',title:'Меньше — значит левее',body:'Если a < b, то точка A(a) расположена на координатном луче левее точки B(b). Верно и обратное: если A левее B, то a < b.',note:'Связи «меньше — левее» и «больше — правее» работают только при одинаковом направлении и масштабе луча.',sourceTag:'Мерзляк § 6 · ключевой вывод урока 17',visual:'ray'},
  {id:'l17-diagnostic',kind:'guided',eyebrow:'Проверка модели',title:'Прочитай расположение точек',body:'На луче точка K(4) находится левее точки M(9).',activity:{id:'l17-a2',type:'choice',prompt:'Какое неравенство следует из рисунка?',options:['4 < 9','4 > 9','4 = 9','Определить нельзя'],answer:'4 < 9',explanation:'Левая точка имеет меньшую координату, поэтому 4 < 9.'},visual:'relation'},
  {id:'l17-ray-reading',kind:'model',eyebrow:'Задача № 155',title:'Положение точек и знак неравенства',body:'Чтобы определить взаимное расположение двух точек, достаточно сравнить их координаты. Меньшая координата окажется левее, большая — правее.',note:'Это двустороннее правило: по координатам строим расположение, а по расположению восстанавливаем неравенство.',sourceTag:'Мерзляк § 6 · № 155; методический комментарий: ключевая задача урока',visual:'relation'},
  {id:'l17-practice1',kind:'practice',eyebrow:'Практика · 1/6',title:'Кто расположен правее?',body:'Сравни координаты точек.',activity:{id:'l17-p1',type:'choice',prompt:'Даны A(37) и B(42). Какая точка расположена правее?',options:['B','A','Они совпадают','Зависит от единичного отрезка'],answer:'B',explanation:'42 > 37, поэтому точка B(42) расположена правее A(37).'},sourceTag:'По модели задачи № 155'},
  {id:'l17-practice2',kind:'practice',eyebrow:'Практика · 2/6',title:'Восстанови знак по лучу',body:'Точка P(126) расположена левее точки Q(162).',activity:{id:'l17-p2',type:'input',prompt:'Поставь знак: 126 □ 162',answer:'<',placeholder:'>, < или =',explanation:'Если P(126) левее Q(162), то 126 < 162.'}},
  {id:'l17-double-model',kind:'model',eyebrow:'Двойное неравенство',title:'Точка между двумя границами',body:'Если точка X находится правее A(12), но левее B(18), то её координата удовлетворяет двойному неравенству 12 < x < 18.',note:'Одна запись объединяет два условия: x > 12 и x < 18.',visual:'double'},
  {id:'l17-practice3',kind:'practice',eyebrow:'Практика · 3/6',title:'Запиши положение точки',body:'Точка C(c) лежит между A(205) и B(211).',activity:{id:'l17-p3',type:'choice',prompt:'Какая запись точно описывает положение C?',options:['205 < c < 211','c < 205 < 211','205 > c > 211','c = 205 = 211'],answer:'205 < c < 211',explanation:'Точка C правее 205 и левее 211, поэтому 205 < c < 211.'},visual:'double'},
  {id:'l17-cases-model',kind:'model',eyebrow:'Комбинаторика · № 153–154',title:'Перебираем варианты без пропусков',body:'Когда число составляют из заданных цифр или заменяют звёздочку, одного удачного примера недостаточно. Нужно перечислить все допустимые варианты и проверить каждый.',note:'Удобный порядок: определить решающий разряд → перебрать цифры по возрастанию → исключить неподходящие.',sourceTag:'Мерзляк § 6 · № 153–154; методический комментарий',visual:'cases'},
  {id:'l17-practice4',kind:'practice',eyebrow:'Практика · 4/6',title:'Все значения звёздочки',body:'Сравнение решается в разряде сотен.',activity:{id:'l17-p4',type:'input',prompt:'Какие цифры можно поставить вместо *, чтобы 4*7 < 437? Запиши по возрастанию.',answer:'0,1,2',placeholder:'Например: 1,2,3',explanation:'Сотни равны. Чтобы 4*7 было меньше 437, цифра десятков должна быть меньше 3: подходят 0, 1 и 2.'},sourceTag:'По типу комбинаторных задач № 153–154'},
  {id:'l17-practice5',kind:'practice',eyebrow:'Практика · 5/6',title:'Наибольшее подходящее число',body:'Используй условие и положение числа перед границей.',activity:{id:'l17-p5',type:'input',prompt:'Запиши наибольшее трёхзначное число, которое меньше 508 и оканчивается цифрой 8.',answer:'498',placeholder:'Число',explanation:'Числа 508 и больше не подходят. Ближайшее меньшее число с последней цифрой 8 — 498.'},sourceTag:'По типу задачи № 153'},
  {id:'l17-practice6',kind:'practice',eyebrow:'Практика · 6/6',title:'Алгоритм работы с координатами',body:'Собери надёжный порядок рассуждения.',activity:{id:'l17-p6',type:'order',prompt:'Как определить взаимное расположение точек по координатам?',items:['Сравнить координаты точек','Определить меньшее и большее число','Поместить меньшую координату левее','Поместить большую координату правее','Проверить результат неравенством'],answer:['Сравнить координаты точек','Определить меньшее и большее число','Поместить меньшую координату левее','Поместить большую координату правее','Проверить результат неравенством'],explanation:'Положение на координатном луче напрямую следует из результата сравнения.'}},
  {id:'l17-error-check',kind:'guided',eyebrow:'Коррекция ошибки',title:'Луч направлен вправо — порядок нельзя переворачивать',body:'Ученик увидел, что D(73) правее C(68), но записал 73 < 68.',activity:{id:'l17-a3',type:'choice',prompt:'Как исправить запись?',options:['68 < 73','73 < 68','68 = 73','Нужно изменить координаты точек'],answer:'68 < 73',explanation:'Правее находится большее число: 73 > 68, то же самое можно записать как 68 < 73.'},visual:'error'},
  {id:'l17-transfer',kind:'guided',eyebrow:'Применение',title:'Сравнение величин после перевода единиц',body:'Перед сравнением величин нужно привести их к одной единице.',activity:{id:'l17-a4',type:'choice',prompt:'Какая запись верна: 6 ц □ 598 кг?',options:['6 ц > 598 кг','6 ц < 598 кг','6 ц = 598 кг'],answer:'6 ц > 598 кг',explanation:'6 ц = 600 кг, а 600 > 598.'}},
  {id:'l17-quiz1',kind:'quiz',eyebrow:'Контроль · 1/5',title:'Координатный луч',body:'Без подсказки.',activity:{id:'l17-q1',type:'choice',prompt:'Если M(m) левее N(n), какая запись верна?',options:['m < n','m > n','m = n'],answer:'m < n',explanation:'На координатном луче левее расположено меньшее число.'}},
  {id:'l17-quiz2',kind:'quiz',eyebrow:'Контроль · 2/5',title:'Поразрядное сравнение',body:'Без подсказки.',activity:{id:'l17-q2',type:'input',prompt:'Поставь знак: 806 095 □ 806 059',answer:'>',placeholder:'Знак',explanation:'Первые четыре цифры совпадают, затем 9 > 5.'}},
  {id:'l17-quiz3',kind:'quiz',eyebrow:'Контроль · 3/5',title:'Между точками',body:'Без подсказки.',activity:{id:'l17-q3',type:'input',prompt:'Сколько натуральных координат может иметь X, если 31 < x < 37?',answer:'5',placeholder:'Количество',explanation:'Подходят 32, 33, 34, 35 и 36 — всего 5.'}},
  {id:'l17-quiz4',kind:'quiz',eyebrow:'Контроль · 4/5',title:'Цифра вместо звёздочки',body:'Без подсказки.',activity:{id:'l17-q4',type:'input',prompt:'Запиши все цифры *, для которых 72* > 726.',answer:'7,8,9',placeholder:'Цифры по возрастанию',explanation:'Сотни и десятки равны, поэтому единицы должны быть больше 6: 7, 8 или 9.'}},
  {id:'l17-quiz5',kind:'quiz',eyebrow:'Контроль · 5/5',title:'Крайнее значение',body:'Без подсказки.',activity:{id:'l17-q5',type:'input',prompt:'Какое наибольшее натуральное n удовлетворяет n < 4 000?',answer:'3999',placeholder:'Число',explanation:'Перед 4 000 в натуральном ряду стоит 3 999.'}},
  {id:'l17-challenge',kind:'challenge',eyebrow:'Задача повышенного уровня',title:'Где может находиться неизвестная точка?',body:'На координатном луче отмечены A(2), B(5) и C(a). Известно, что C не совпадает с A и B, а a — натуральное число меньше 8.',activity:{id:'l17-c1',type:'input',prompt:'Сколько различных натуральных координат может иметь точка C?',answer:'5',placeholder:'Количество',explanation:'Возможны 1, 3, 4, 6 и 7. Координаты 2 и 5 запрещены, а натуральные числа меньше 8 начинаются с 1.'},sourceTag:'Развитие методического комментария к № 155',visual:'challenge'},
  {id:'l17-reflection',kind:'model',eyebrow:'Рефлексия',title:'Продолжи три высказывания',body:'Самым интересным на уроке для меня было… Я научился… Я хотел бы ещё узнать…',note:'Отдельно отметь, где было сложнее: сравнить числа, прочитать луч или перебрать все варианты.',sourceTag:'Методическое пособие · рефлексия урока 17'},
  {id:'l17-summary',kind:'summary',eyebrow:'Итог урока',title:'Неравенство и координатный луч говорят об одном',body:'Ты умеешь переходить от сравнения координат к расположению точек и обратно, записывать двойные неравенства и системно перебирать возможные цифры.',note:'Следующий урок обобщит весь § 6 и завершит тему сравнением задач разных типов.'},
];

const empty:Saved={version:1,stageIndex:0,responses:{},orders:{},checked:{},results:{}};
function normalize(value:string){return value.trim().toLowerCase().replace(/ё/g,'е').replace(/[\s\u00a0]+/g,'').replace(/;/g,',')}
function load():Saved{try{const parsed=JSON.parse(localStorage.getItem(KEY)??'null') as Partial<Saved>|null;return parsed?.version===1?{...empty,...parsed,stageIndex:Math.min(Math.max(Number(parsed.stageIndex)||0,0),lessonSeventeenStages.length-1),responses:parsed.responses??{},orders:parsed.orders??{},checked:parsed.checked??{},results:parsed.results??{}}:empty}catch{return empty}}

function StageVisual({visual}:{visual?:Visual}){
  if(visual==='ray'||visual==='relation')return <div className="comparison-practice-ray" aria-label="Координатный луч"><div className="ray-line"><i/><span className="tick t1">0</span><span className="tick t2">2</span><span className="tick t3">5</span><span className="tick t4">8</span><b className="point p1">A</b><b className="point p2">B</b></div><p>левее — меньше · правее — больше</p></div>;
  if(visual==='double')return <div className="comparison-practice-double"><b>205</b><strong>&lt;</strong><span>c</span><strong>&lt;</strong><b>211</b></div>;
  if(visual==='digits')return <div className="comparison-practice-digits"><span>58 4<mark>0</mark>7</span><strong>&lt;</strong><span>58 4<mark>7</mark>0</span></div>;
  if(visual==='cases')return <div className="comparison-practice-cases"><b>4*7 &lt; 437</b><div><span>0 ✓</span><span>1 ✓</span><span>2 ✓</span><span>3 ✕</span><span>4 ✕</span></div></div>;
  if(visual==='error')return <div className="comparison-practice-error"><s>73 &lt; 68</s><b>68 &lt; 73</b><span>73 находится правее</span></div>;
  if(visual==='challenge')return <div className="comparison-practice-cases"><b>a &lt; 8</b><div><span>1</span><span>3</span><span>4</span><span>6</span><span>7</span></div></div>;
  if(visual==='mission')return <div className="comparison-practice-mission"><div><b>37</b><span>левее</span></div><strong>&lt;</strong><div><b>42</b><span>правее</span></div></div>;
  return null;
}

export function NaturalNumberComparisonPracticePlayer(){
  const saved=useMemo(load,[]);
  const[stageIndex,setStageIndex]=useState(saved.stageIndex);
  const[responses,setResponses]=useState(saved.responses);
  const[orders,setOrders]=useState(saved.orders);
  const[checked,setChecked]=useState(saved.checked);
  const[results,setResults]=useState(saved.results);
  const[completedAt,setCompletedAt]=useState(saved.completedAt);
  const stage=lessonSeventeenStages[stageIndex];
  const activity=stage.activity;
  const answer=activity?responses[activity.id]??'':'';
  const order=activity?orders[activity.id]??[]:[];
  const wasChecked=activity?Boolean(checked[activity.id]):false;
  const correct=activity?Boolean(results[activity.id]):false;

  useEffect(()=>{localStorage.setItem(KEY,JSON.stringify({version:1,stageIndex,responses,orders,checked,results,completedAt} satisfies Saved))},[stageIndex,responses,orders,checked,results,completedAt]);
  useEffect(()=>{const handler=(event:Event)=>{const detail=(event as CustomEvent<{lessonNumber:number;stageIndex:number}>).detail;if(detail?.lessonNumber!==17)return;setStageIndex(Math.min(Math.max(detail.stageIndex,0),lessonSeventeenStages.length-1))};window.addEventListener('mathnikita-go-to-stage',handler);return()=>window.removeEventListener('mathnikita-go-to-stage',handler)},[]);

  function checkAnswer(){
    if(!activity)return;
    const isCorrect=activity.type==='order'
      ?Array.isArray(activity.answer)&&activity.answer.length===order.length&&activity.answer.every((item,index)=>item===order[index])
      :normalize(answer)===normalize(String(activity.answer));
    setChecked(previous=>({...previous,[activity.id]:true}));
    setResults(previous=>({...previous,[activity.id]:isCorrect}));
  }
  function go(delta:number){
    const next=Math.min(Math.max(stageIndex+delta,0),lessonSeventeenStages.length-1);
    setStageIndex(next);
    if(next===lessonSeventeenStages.length-1&&!completedAt)setCompletedAt(new Date().toISOString());
    window.scrollTo({top:0,behavior:'smooth'});
  }
  const practiceScore=['l17-p1','l17-p2','l17-p3','l17-p4','l17-p5','l17-p6'].filter(id=>results[id]).length;
  const quizScore=['l17-q1','l17-q2','l17-q3','l17-q4','l17-q5'].filter(id=>results[id]).length;
  const canContinue=!activity||correct;

  return <main className="lesson-player-page natural-comparison-page comparison-practice-page">
    <div className="lesson-stage-topline"><span className="stage-counter">Этап {stageIndex+1} из {lessonSeventeenStages.length}</span><span>{stage.eyebrow}</span></div>
    <section className={`interactive-stage stage-${stage.kind}`} data-stage-id={stage.id}>
      <div className="stage-copy"><small>{stage.eyebrow}</small><h2>{stage.title}</h2><p>{stage.body}</p>{stage.note?<div className="theory-note"><b>Важно</b><span>{stage.note}</span></div>:null}{stage.sourceTag?<div className="source-tag">{stage.sourceTag}</div>:null}</div>
      <StageVisual visual={stage.visual}/>
      {activity?<div className="activity-area"><h3>{activity.prompt}</h3>
        {activity.type==='choice'?<div className="choice-grid">{activity.options?.map(option=><button key={option} type="button" className={answer===option?'selected':''} onClick={()=>{setResponses(previous=>({...previous,[activity.id]:option}));setChecked(previous=>({...previous,[activity.id]:false}))}}>{option}</button>)}</div>:null}
        {activity.type==='input'?<div className="inline-answer"><input value={answer} onChange={event=>{setResponses(previous=>({...previous,[activity.id]:event.target.value}));setChecked(previous=>({...previous,[activity.id]:false}))}} placeholder={activity.placeholder??'Ответ'} onKeyDown={event=>{if(event.key==='Enter')checkAnswer()}}/><button className="check-button" type="button" onClick={checkAnswer}>Проверить</button></div>:null}
        {activity.type==='order'?<div className="order-activity"><div className="order-result">{order.map((item,index)=><button type="button" key={`${item}-${index}`} onClick={()=>{setOrders(previous=>({...previous,[activity.id]:order.filter((_,itemIndex)=>itemIndex!==index)}));setChecked(previous=>({...previous,[activity.id]:false}))}}><span>{index+1}</span>{item}</button>)}</div><div className="order-bank">{activity.items?.filter(item=>!order.includes(item)).map(item=><button type="button" key={item} onClick={()=>{setOrders(previous=>({...previous,[activity.id]:[...order,item]}));setChecked(previous=>({...previous,[activity.id]:false}))}}>{item}</button>)}</div><button className="check-button" type="button" onClick={checkAnswer}>Проверить порядок</button></div>:null}
        {activity.type==='choice'?<button className="check-button" type="button" disabled={!answer} onClick={checkAnswer}>Проверить</button>:null}
        {wasChecked?<div className={`instant-feedback ${correct?'good':'bad'}`} data-explanation={activity.explanation}><b>{correct?'Верно!':'Проверь ещё раз'}</b><span>{activity.explanation}</span></div>:null}
      </div>:null}
      {stage.kind==='summary'?<div className="summary-card"><div><span>Практика</span><b>{practiceScore}/6</b></div><div><span>Контроль</span><b>{quizScore}/5</b></div><div><span>Статус</span><b>{completedAt?'Завершён':'Завершён'}</b></div></div>:null}
    </section>
    <div className="lesson-controls"><button type="button" onClick={()=>go(-1)} disabled={stageIndex===0}>← Назад</button>{stageIndex<lessonSeventeenStages.length-1?<button className="primary" type="button" onClick={()=>go(1)} disabled={!canContinue}>Дальше →</button>:<span/>}</div>
  </main>;
}
