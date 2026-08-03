import { useEffect,useMemo,useState } from 'react';
import './lessonPlayer.css';
import './theoryExperience.css';
import './planeLineRay.css';
import './lessonTwelve.css';

type Activity={id:string;type:'choice'|'input'|'order';prompt:string;options?:string[];items?:string[];answer:string|string[];explanation:string;placeholder?:string};
type Stage={id:string;title:string;eyebrow:string;kind:'story'|'model'|'guided'|'practice'|'quiz'|'challenge'|'summary';body:string;note?:string;sourceTag?:string;activity?:Activity};
type Saved={version:2;stageIndex:number;responses:Record<string,string>;orders:Record<string,string[]>;checked:Record<string,boolean>;results:Record<string,boolean>};
const KEY='mathnikita-lesson-12-progress-v2';
const LEGACY_KEY='mathnikita-lesson-12-progress-v1';

export const lessonTwelveStages:Stage[]=[
  {id:'l12-story',kind:'story',eyebrow:'Итог § 4',title:'Собираем всю тему в одну систему',body:'Сегодня ты связываешь свойства плоскости, прямой, луча и отрезка и применяешь их в смешанных задачах.',note:'Перед ответом называй фигуру, её границы, начало и направление.',sourceTag:'Мерзляк § 4 · итоговое повторение'},
  {id:'l12-map',kind:'model',eyebrow:'Карта понятий',title:'Четыре фигуры — разные свойства',body:'Плоскость бесконечна. Прямая не имеет концов. Луч имеет начало и одно направление. Отрезок ограничен двумя концами.'},
  {id:'l12-diagnostic',kind:'guided',eyebrow:'Разминка',title:'Определи фигуру по свойству',body:'Начинаем с точного языка геометрии.',activity:{id:'l12-a1',type:'choice',prompt:'Какая фигура имеет начало, но не имеет конца?',options:['луч','отрезок','прямая','точка'],answer:'луч',explanation:'Луч начинается в одной точке и продолжается бесконечно в одном направлении.'}},
  {id:'l12-line-rule',kind:'model',eyebrow:'Ключевое свойство',title:'Через две точки проходит одна прямая',body:'Через любые две различные точки можно провести ровно одну прямую. Для прямой AB и BA — два обозначения одной фигуры.',note:'Порядок букв не задаёт направление прямой.'},
  {id:'l12-ray-names',kind:'model',eyebrow:'Обозначения',title:'У луча первая буква — начало',body:'Лучи AB и BA обычно различны: у них разные начала и противоположные направления. Каждая отмеченная точка на прямой задаёт два луча.'},
  {id:'l12-position',kind:'model',eyebrow:'Расположение точек',title:'Один набор расстояний — несколько чертежей',body:'Если известны расстояния от одной точки до двух других, точки могут лежать по одну сторону или по разные стороны. Поэтому иногда нужен не один, а два ответа.'},
  {id:'l12-practice1',kind:'practice',eyebrow:'Практика · 1/6',title:'Прямая через точки',body:'Проверяем основное свойство.',activity:{id:'l12-p1',type:'input',prompt:'Сколько различных прямых можно провести через две различные точки A и B?',answer:'1',placeholder:'Количество',explanation:'Через две различные точки проходит ровно одна прямая.'}},
  {id:'l12-practice2',kind:'practice',eyebrow:'Практика · 2/6',title:'Прямая и луч пересекаются по-разному',body:'Луч MK пересекает прямую TF в точке X, но луч TF не должен пересекать прямую MK.',sourceTag:'Мерзляк § 4 · модель № 95',activity:{id:'l12-p2',type:'choice',prompt:'Как это возможно?',options:['точка X лежит на прямой TF по другую сторону от T, чем F','луч TF всегда совпадает с прямой TF','точка X должна совпасть с F','прямая MK имеет конец в M'],answer:'точка X лежит на прямой TF по другую сторону от T, чем F',explanation:'Прямая TF продолжается в обе стороны, а луч TF идёт только от T через F. Поэтому X может принадлежать прямой TF, но не лучу TF.'}},
  {id:'l12-practice3',kind:'practice',eyebrow:'Практика · 3/6',title:'Количество лучей',body:'Каждая отмеченная точка на прямой задаёт два противоположных луча.',sourceTag:'Мерзляк § 4 · модель № 98',activity:{id:'l12-p3',type:'input',prompt:'Сколько лучей задают 7 отмеченных на прямой точек?',answer:'14',placeholder:'Количество лучей',explanation:'7 · 2 = 14 лучей.'}},
  {id:'l12-practice4',kind:'practice',eyebrow:'Практика · 4/6',title:'Два расположения точек',body:'AB = 18 см, AC = 25 см. Порядок точек заранее не задан.',sourceTag:'Мерзляк § 4 · по модели № 99',activity:{id:'l12-p4',type:'choice',prompt:'Какие значения может иметь BC?',options:['7 см или 43 см','только 7 см','только 43 см','18 см или 25 см'],answer:'7 см или 43 см',explanation:'По одну сторону от A: 25 − 18 = 7 см. По разные стороны: 25 + 18 = 43 см.'}},
  {id:'l12-practice5',kind:'practice',eyebrow:'Практика · 5/6',title:'Общая часть лучей',body:'Сравни начала и направления двух лучей.',sourceTag:'Мерзляк § 4 · модель № 94',activity:{id:'l12-p5',type:'choice',prompt:'Что может быть общей частью двух лучей?',options:['точка, отрезок или луч','только точка','только отрезок','только луч'],answer:'точка, отрезок или луч',explanation:'В зависимости от взаимного положения начал и направлений общая часть может быть точкой, отрезком или лучом.'}},
  {id:'l12-practice6',kind:'practice',eyebrow:'Практика · 6/6',title:'Алгоритм анализа чертежа',body:'Собери надёжный порядок действий.',activity:{id:'l12-p6',type:'order',prompt:'Расставь шаги анализа',items:['Проверить направления лучей','Сверить вывод с условием','Назвать все фигуры','Отметить пересечения и общие части','Определить начала и концы'],answer:['Назвать все фигуры','Определить начала и концы','Проверить направления лучей','Отметить пересечения и общие части','Сверить вывод с условием'],explanation:'Сначала определяем фигуры и их границы, затем направление и взаимное расположение, и только после этого проверяем итог.'}},
  {id:'l12-control',kind:'model',eyebrow:'Перед проверкой',title:'Пять вопросов к любому чертежу',body:'Что это за фигура? Есть ли у неё начало или концы? Куда она продолжается? Какие точки ей принадлежат? Как она расположена относительно других фигур?',note:'Не доверяй рисунку на глаз — проверяй определения.'},
  {id:'l12-quiz1',kind:'quiz',eyebrow:'Мини-проверка · 1/5',title:'Плоскость',body:'Без подсказки.',activity:{id:'l12-q1',type:'choice',prompt:'Какое утверждение о плоскости верно?',options:['плоскость бесконечна','плоскость имеет четыре края','плоскость — это отрезок','плоскость имеет одно начало'],answer:'плоскость бесконечна',explanation:'Математическая плоскость не имеет края и бесконечна.'}},
  {id:'l12-quiz2',kind:'quiz',eyebrow:'Мини-проверка · 2/5',title:'Название прямой',body:'Без подсказки.',activity:{id:'l12-q2',type:'choice',prompt:'Что верно для прямой через точки A и B?',options:['AB и BA обозначают одну и ту же прямую','AB и BA всегда разные прямые','первая буква задаёт начало прямой','через A и B проходят две прямые'],answer:'AB и BA обозначают одну и ту же прямую',explanation:'У прямой нет направления, поэтому порядок двух точек в её названии не меняет фигуру.'}},
  {id:'l12-quiz3',kind:'quiz',eyebrow:'Мини-проверка · 3/5',title:'Пять точек',body:'Без подсказки.',activity:{id:'l12-q3',type:'input',prompt:'Сколько лучей задают 5 отмеченных точек на одной прямой?',answer:'10',placeholder:'Количество',explanation:'Каждая точка задаёт два луча: 5 · 2 = 10.'}},
  {id:'l12-quiz4',kind:'quiz',eyebrow:'Мини-проверка · 4/5',title:'Начало луча',body:'Без подсказки.',activity:{id:'l12-q4',type:'choice',prompt:'У луча PQ какая точка является началом?',options:['P','Q','обе','ни одна'],answer:'P',explanation:'Первая буква в названии луча обозначает его начало.'}},
  {id:'l12-quiz5',kind:'quiz',eyebrow:'Мини-проверка · 5/5',title:'Положение точек',body:'Без подсказки.',activity:{id:'l12-q5',type:'choice',prompt:'Почему задача на три точки одной прямой иногда имеет два ответа?',options:['точки могут лежать по одну или по разные стороны от исходной точки','прямая имеет два конца','луч всегда совпадает с прямой','расстояния можно только складывать'],answer:'точки могут лежать по одну или по разные стороны от исходной точки',explanation:'Разное взаимное расположение даёт разность или сумму расстояний.'}},
  {id:'l12-challenge',kind:'challenge',eyebrow:'Задача повышенной сложности',title:'Три прямые и части плоскости',body:'Сравни два крайних расположения трёх различных прямых.',sourceTag:'Мерзляк § 4 · модель № 102',activity:{id:'l12-c1',type:'choice',prompt:'Каковы максимум и минимум числа частей плоскости?',options:['7 и 4','7 и 3','6 и 4','8 и 4'],answer:'7 и 4',explanation:'Максимум 7 дают попарные пересечения в трёх разных точках. Минимум 4 дают три параллельные прямые.'}},
  {id:'l12-reflection',kind:'model',eyebrow:'Рефлексия',title:'Что теперь должно получаться автоматически',body:'Различать фигуры по свойствам, правильно называть прямые и лучи, учитывать направление, проверять принадлежность точек и находить все допустимые расположения.'},
  {id:'l12-summary',kind:'summary',eyebrow:'Итог основной части',title:'§ 4 собран в систему',body:'Основная часть завершает повторение свойств плоскости, прямой, луча и отрезка. Полный урок закончится только после обязательной практики и финальной рефлексии.'},
];

const empty:Saved={version:2,stageIndex:0,responses:{},orders:{},checked:{},results:{}};
function norm(value:string){return value.trim().toLowerCase().replace(/[\s\u00a0]+/g,'').replace(/ё/g,'е')}
function load():Saved{try{const parsed=JSON.parse(localStorage.getItem(KEY)??'null') as Partial<Saved>|null;return parsed?.version===2?{...empty,...parsed,stageIndex:Math.min(Math.max(Number(parsed.stageIndex)||0,0),lessonTwelveStages.length-1),responses:parsed.responses??{},orders:parsed.orders??{},checked:parsed.checked??{},results:parsed.results??{}}:empty}catch{return empty}}

function StageVisual({stageId}:{stageId:string}){
  if(stageId==='l12-map')return <div className="l12-figure-map" aria-label="Свойства четырёх геометрических фигур">
    <div><i className="shape shape-plane"/><b>Плоскость</b><span>бесконечна, края нет</span></div>
    <div><i className="shape shape-line"/><b>Прямая</b><span>0 концов, два направления</span></div>
    <div><i className="shape shape-ray"/><b>Луч</b><span>1 начало, одно направление</span></div>
    <div><i className="shape shape-segment"/><b>Отрезок</b><span>2 конца</span></div>
  </div>;
  if(stageId==='l12-practice2')return <div className="l12-intersection-model" aria-label="Модель пересечения луча MK и прямой TF">
    <div className="diagram"><i className="line-tf"/><i className="ray-mk"/><span className="dot x"/><b className="label x">X</b><b className="label t">T</b><b className="label f">F</b><b className="label m">M</b><b className="label k">K</b></div>
    <div className="copy"><b>X принадлежит прямой TF, но не лучу TF</b><span>От T луч идёт через F. Точка X расположена по другую сторону от T.</span></div>
  </div>;
  if(stageId==='l12-practice4')return <div className="l12-distance-cases" aria-label="Два расположения точек A B C">
    <div><b>Одна сторона от A</b><span>A — B — C</span><strong>25 − 18 = 7 см</strong></div>
    <div><b>Разные стороны от A</b><span>B — A — C</span><strong>18 + 25 = 43 см</strong></div>
  </div>;
  if(stageId==='l12-practice5')return <div className="l12-common-part-model" aria-label="Три вида общей части двух лучей">
    <div><b>Точка</b><span>противоположные лучи с одним началом</span></div>
    <div><b>Отрезок</b><span>лучи AB и BA</span></div>
    <div><b>Луч</b><span>сонаправленные лучи с разными началами</span></div>
  </div>;
  if(stageId==='l12-challenge')return <div className="l12-three-lines-model" aria-label="Максимум и минимум частей плоскости для трёх прямых">
    <div className="maximum"><b>Максимум</b><i/><i/><i/><span>7 частей</span></div>
    <div className="minimum"><b>Минимум</b><i/><i/><i/><span>4 части</span></div>
  </div>;
  return null;
}

export function PlaneLineRaySummaryPlayer(){
  const saved=useMemo(load,[]);
  const[stageIndex,setStageIndex]=useState(saved.stageIndex);
  const[responses,setResponses]=useState(saved.responses);
  const[orders,setOrders]=useState(saved.orders);
  const[checked,setChecked]=useState(saved.checked);
  const[results,setResults]=useState(saved.results);
  const stage=lessonTwelveStages[stageIndex];
  const activity=stage.activity;
  const answer=activity?responses[activity.id]??'':'';
  const ordered=activity?orders[activity.id]??[]:[];
  const isChecked=activity?Boolean(checked[activity.id]):false;
  const correct=activity?Boolean(results[activity.id]):false;
  const quiz=['l12-q1','l12-q2','l12-q3','l12-q4','l12-q5'];
  const practice=['l12-p1','l12-p2','l12-p3','l12-p4','l12-p5','l12-p6'];
  const quizScore=quiz.filter(id=>results[id]).length;
  const practiceScore=practice.filter(id=>results[id]).length;
  const coreReady=quizScore>=4&&practiceScore>=5;
  const progress=Math.round(((stageIndex+1)/lessonTwelveStages.length)*100);

  useEffect(()=>localStorage.setItem(KEY,JSON.stringify({version:2,stageIndex,responses,orders,checked,results})),[stageIndex,responses,orders,checked,results]);
  useEffect(()=>{const handler=(event:Event)=>{const detail=(event as CustomEvent).detail;if(detail?.lessonNumber===12&&Number.isInteger(detail.stageIndex))goTo(detail.stageIndex)};window.addEventListener('mathnikita-go-to-stage',handler);return()=>window.removeEventListener('mathnikita-go-to-stage',handler)},[]);
  function goTo(index:number){setStageIndex(Math.min(Math.max(index,0),lessonTwelveStages.length-1));window.scrollTo({top:0,behavior:'smooth'})}
  function setAnswer(value:string){if(!activity)return;setResponses(previous=>({...previous,[activity.id]:value}));setChecked(previous=>({...previous,[activity.id]:false}))}
  function setOrder(value:string[]){if(!activity)return;setOrders(previous=>({...previous,[activity.id]:value}));setChecked(previous=>({...previous,[activity.id]:false}))}
  function submit(){if(!activity)return;const ok=activity.type==='order'?JSON.stringify(ordered)===JSON.stringify(activity.answer):norm(answer)===norm(String(activity.answer));setChecked(previous=>({...previous,[activity.id]:true}));setResults(previous=>({...previous,[activity.id]:ok}))}
  function reset(){localStorage.removeItem(KEY);localStorage.removeItem(LEGACY_KEY);setStageIndex(0);setResponses({});setOrders({});setChecked({});setResults({});window.dispatchEvent(new CustomEvent('mathnikita-lesson-reset',{detail:{lessonNumber:12}}))}
  function render(current:Activity){
    if(current.type==='choice')return <div className="activity-area"><h3>{current.prompt}</h3><div className="choice-grid">{current.options!.map(option=><button key={option} className={answer===option?'selected':''} onClick={()=>setAnswer(option)}>{option}</button>)}</div><button className="check-button" disabled={!answer} onClick={submit}>Проверить</button></div>;
    if(current.type==='input')return <div className="activity-area"><h3>{current.prompt}</h3><div className="inline-answer"><input value={answer} onChange={event=>setAnswer(event.target.value)} onKeyDown={event=>event.key==='Enter'&&submit()} placeholder={current.placeholder??'Ответ'}/><button className="check-button" disabled={!answer.trim()} onClick={submit}>Проверить</button></div></div>;
    const items=current.items??[];
    return <div className="activity-area"><h3>{current.prompt}</h3><div className="order-bank">{items.map(item=><button key={item} disabled={ordered.includes(item)} onClick={()=>setOrder([...ordered,item])}>{item}</button>)}</div><div className="order-result">{ordered.map((item,index)=><button key={`${item}-${index}`} onClick={()=>setOrder(ordered.filter((_,position)=>position!==index))}>{index+1}. {item}</button>)}</div><button className="check-button" disabled={ordered.length!==items.length} onClick={submit}>Проверить</button></div>;
  }

  return <main className="lesson-player-page plane-line-ray-page"><section className="lesson-workspace interactive-workspace"><header className="lesson-header"><div><span>Урок 12 из 175 · § 4</span><h1>Плоскость. Прямая. Луч — обобщение</h1><p>Итоговое повторение темы, смешанные задачи и проверка понимания.</p></div><div className="lesson-duration">План · 40 мин</div></header><div className="lesson-progress"><i style={{width:`${progress}%`}}/></div><div className="stage-counter"><span>Этап {stageIndex+1} из {lessonTwelveStages.length}</span><button type="button" onClick={reset}>Начать заново</button></div><article className={`interactive-stage stage-${stage.kind}`} data-stage-id={stage.id}><div className="stage-copy"><span>{stage.eyebrow}</span><h2>{stage.title}</h2><p>{stage.body}</p>{stage.sourceTag?<small className="source-tag">Источник: {stage.sourceTag}</small>:null}{stage.note?<div className="theory-note"><b>Запомни</b><span>{stage.note}</span></div>:null}</div><StageVisual stageId={stage.id}/>{activity?render(activity):null}{isChecked&&activity?<div className={`instant-feedback ${correct?'good':'bad'}`} data-explanation={activity.explanation}><b>{correct?'Верно!':'Пока не получилось'}</b><span>{correct?activity.explanation:`Проверь свойства фигуры, начало, направление и взаимное расположение. ${activity.explanation}`}</span></div>:null}{stage.kind==='quiz'&&isChecked?<div className="quiz-meter"><span>Текущий результат</span><b>{quizScore} из 5</b></div>:null}{stage.kind==='summary'?<div className="summary-card"><div><span>Мини-проверка</span><b>{quizScore}/5</b><small>{quizScore>=4?'ключевые свойства удерживаются':'исправь ошибки основной части'}</small></div><div><span>Практика</span><b>{practiceScore}/6</b><small>{practiceScore>=5?'основная практика выполнена':'вернись к ошибочным заданиям'}</small></div><div><span>Статус</span><b>{coreReady?'Основная часть ✓':'Повторить'}</b><small>{coreReady?'дальше — обязательная практика':'полный урок ещё не завершён'}</small></div></div>:null}</article><footer className="lesson-controls"><button onClick={()=>goTo(stageIndex-1)} disabled={stageIndex===0}>← Назад</button><span>{progress}% основной части</span><button className="primary" onClick={()=>goTo(stageIndex+1)} disabled={stageIndex===lessonTwelveStages.length-1||Boolean(activity&&!correct)}>Продолжить →</button></footer></section></main>;
}
