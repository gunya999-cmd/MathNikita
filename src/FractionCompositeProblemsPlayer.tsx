import {useEffect,useMemo,useState} from 'react';
import './lessonPlayer.css';
import './theoryExperience.css';

type Field={id:string;label:string;answers:string[];placeholder?:string};
type Choice={prompt:string;options:string[];answer:string;hint:string;explanation:string};
type Practice={prompt:string;instruction:string;fields:Field[];hint:string;explanation:string;source?:string};
type Stage={id:string;kind:'story'|'model'|'guided'|'diagnostic'|'practice'|'summary';eyebrow:string;title:string;body:string;note?:string;choice?:Choice;practice?:Practice};
type Saved={version:1;stageIndex:number;responses:Record<string,string>;checked:Record<string,boolean>;results:Record<string,boolean>;attempts:Record<string,number>};
type StageJumpDetail={lessonNumber?:number;stageIndex?:number};

const KEY='mathnikita-lesson-94-progress-v1';
const normalize=(value:string)=>value.normalize('NFKC').trim().toLocaleLowerCase('ru-RU').replace(/ё/g,'е').replace(/[\s.,;:!?()[\]{}'"«»]/g,'');
const answerMatches=(value:string,answers:string[])=>answers.some(answer=>normalize(value)===normalize(answer));
const numeric=(id:string,label:string,answer:number):Field=>({id,label,answers:[String(answer)],placeholder:String(answer)});

const practice:Practice[]=[
  {source:'№ 701',prompt:'Сколько градусов составляют семь восемнадцатых величины прямого угла и пять двенадцатых величины развёрнутого угла?',instruction:'Введи два ответа по порядку.',fields:[numeric('a','Семь восемнадцатых прямого угла',35),numeric('b','Пять двенадцатых развёрнутого угла',75)],hint:'Прямой угол — 90 градусов, развёрнутый — 180. Сначала дели величину угла на знаменатель.',explanation:'Семь восемнадцатых от 90 градусов — 35 градусов, пять двенадцатых от 180 градусов — 75 градусов.'},
  {source:'№ 703',prompt:'За четыре дня яхта «Беда» прошла 624 километра. В первый день прошли две тринадцатых всего пути, во второй — пять двадцать шестых, в третий — пять двенадцатых, а в четвёртый — остаток.',instruction:'Найди путь за каждый из четырёх дней.',fields:[numeric('d1','Первый день',96),numeric('d2','Второй день',120),numeric('d3','Третий день',260),numeric('d4','Четвёртый день',148)],hint:'Найди первые три части от одного и того же целого 624, затем вычти их сумму из 624.',explanation:'Яхта прошла 96, 120 и 260 километров за первые три дня. Осталось 148 километров.'},
  {source:'№ 717',prompt:'С двух яблонь собрали 65 килограммов яблок, причём с одной яблони собрали на 17 килограммов меньше, чем со второй. Сколько собрали с каждой?',instruction:'Введи меньшую и большую массы.',fields:[numeric('small','С меньшей яблони',24),numeric('large','Со второй яблони',41)],hint:'Это не задача на дроби. Убери разницу 17 из общей массы, раздели остаток пополам и верни разницу.',explanation:'Меньшая масса — 24 килограмма, большая — 41 килограмм. Проверка: 24 плюс 41 равно 65.'},
  {prompt:'Из 96 страниц прочитали три восьмых. Найди одну восьмую, прочитанную часть и остаток.',instruction:'Заполни три величины.',fields:[numeric('u','Одна восьмая',12),numeric('p','Прочитано',36),numeric('r','Осталось',60)],hint:'96 раздели на 8, затем умножь на 3. Остаток вычти из 96.',explanation:'Одна восьмая — 12 страниц, прочитано 36, осталось 60.'},
  {prompt:'Из 144 страниц в первый этап изучили пять двенадцатых, во второй — одну шестую всего материала. Сколько страниц пришлось на каждый этап и сколько осталось?',instruction:'Все доли берутся от исходных 144 страниц.',fields:[numeric('a','Первый этап',60),numeric('b','Второй этап',24),numeric('r','Осталось',60)],hint:'Каждую часть находи отдельно от 144, затем вычти обе из целого.',explanation:'Первый этап — 60 страниц, второй — 24, осталось 60.'},
  {prompt:'Маршрут равен 150 километрам. Семь пятнадцатых прошли утром, две пятых — днём. Найди обе части и остаток.',instruction:'Обе дроби относятся ко всему маршруту.',fields:[numeric('a','Утром',70),numeric('b','Днём',60),numeric('r','Осталось',20)],hint:'Семь пятнадцатых от 150 и две пятых от 150 считай отдельно.',explanation:'Утром прошли 70 километров, днём 60, осталось 20.'},
  {prompt:'На проект есть 240 минут. Три восьмых времени ушло на исследование, одна четверть — на оформление. Сколько минут заняли этапы и сколько осталось?',instruction:'Считай обе части от 240 минут.',fields:[numeric('a','Исследование',90),numeric('b','Оформление',60),numeric('r','Осталось',90)],hint:'240 раздели на 8 и умножь на 3; затем 240 раздели на 4.',explanation:'Исследование — 90 минут, оформление — 60, осталось 90.'},
  {prompt:'Бюджет равен 1800 единиц. Две девятых потратили на материалы, одну треть — на оборудование. Найди расходы и остаток.',instruction:'Все доли относятся к исходному бюджету.',fields:[numeric('a','Материалы',400),numeric('b','Оборудование',600),numeric('r','Осталось',800)],hint:'Сначала найди две девятых и одну треть от 1800.',explanation:'Материалы — 400, оборудование — 600, остаток — 800.'},
  {prompt:'От развёрнутого угла взяли четыре девятых. Найди одну девятую, выбранную часть и остаток.',instruction:'Развёрнутый угол равен 180 градусам.',fields:[numeric('u','Одна девятая',20),numeric('p','Четыре девятых',80),numeric('r','Остаток',100)],hint:'180 раздели на 9, затем умножь на 4.',explanation:'Одна девятая — 20 градусов, четыре девятых — 80, остаток — 100.'},
  {prompt:'В коллекции 196 предметов. Пять четырнадцатых относятся к первой группе, три седьмых — ко второй. Найди обе группы и остаток.',instruction:'Каждую группу считай от 196.',fields:[numeric('a','Первая группа',70),numeric('b','Вторая группа',84),numeric('r','Осталось',42)],hint:'196 раздели на 14 и умножь на 5; затем 196 раздели на 7 и умножь на 3.',explanation:'Первая группа — 70, вторая — 84, осталось 42.'},
  {prompt:'В классе 30 учеников. Две пятых участвуют в олимпиаде, одна треть — в спортивной команде. Группы не пересекаются. Найди обе группы и остальных.',instruction:'Обе дроби относятся ко всему классу.',fields:[numeric('a','Олимпиада',12),numeric('b','Спорт',10),numeric('r','Остальные',8)],hint:'Найди две пятых и одну треть от 30, затем вычти обе группы.',explanation:'В олимпиаде 12 учеников, в спорте 10, остальные 8.'},
  {prompt:'Из 84 страниц прочитали пять седьмых. Сколько прочитали и сколько осталось?',instruction:'Найди часть и дополнение до целого.',fields:[numeric('p','Прочитано',60),numeric('r','Осталось',24)],hint:'84 раздели на 7 и умножь на 5.',explanation:'Прочитано 60 страниц, осталось 24.'},
  {prompt:'Из резервуара объёмом 150 литров использовали три десятых воды. Сколько использовали и сколько осталось?',instruction:'Считай от исходных 150 литров.',fields:[numeric('p','Использовали',45),numeric('r','Осталось',105)],hint:'150 раздели на 10 и умножь на 3.',explanation:'Использовали 45 литров, осталось 105.'},
  {prompt:'Из маршрута 96 километров пройдено семь двенадцатых. Сколько пройдено и сколько осталось?',instruction:'Найди часть и остаток.',fields:[numeric('p','Пройдено',56),numeric('r','Осталось',40)],hint:'96 раздели на 12 и умножь на 7.',explanation:'Пройдено 56 километров, осталось 40.'},
  {prompt:'Из 72 мячей пять восьмых красные. Сколько красных и сколько остальных?',instruction:'Найди две взаимодополняющие части.',fields:[numeric('p','Красные',45),numeric('r','Остальные',27)],hint:'72 раздели на 8 и умножь на 5.',explanation:'Красных 45, остальных 27.'},
  {prompt:'Из 200 минут три пятых заняла основная работа. Сколько минут заняла работа и сколько осталось?',instruction:'Найди часть от времени и остаток.',fields:[numeric('p','Работа',120),numeric('r','Осталось',80)],hint:'200 раздели на 5 и умножь на 3.',explanation:'Работа заняла 120 минут, осталось 80.'},
  {prompt:'Из 132 килограммов пять одиннадцатых отправили в первый магазин. Сколько отправили и сколько осталось?',instruction:'Найди часть и остаток.',fields:[numeric('p','Отправили',60),numeric('r','Осталось',72)],hint:'132 раздели на 11 и умножь на 5.',explanation:'Отправили 60 килограммов, осталось 72.'},
  {prompt:'От развёрнутого угла взяли семь десятых. Сколько градусов составляет эта часть и сколько осталось?',instruction:'Целое — 180 градусов.',fields:[numeric('p','Семь десятых',126),numeric('r','Остаток',54)],hint:'180 раздели на 10 и умножь на 7.',explanation:'Семь десятых — 126 градусов, осталось 54.'},
  {prompt:'Из 250 заданий выполнено две пятых. Сколько выполнено и сколько осталось?',instruction:'Найди часть и остаток.',fields:[numeric('p','Выполнено',100),numeric('r','Осталось',150)],hint:'250 раздели на 5 и умножь на 2.',explanation:'Выполнено 100 заданий, осталось 150.'},
  {prompt:'Дистанция равна 1600 метрам. Пройдено три восьмых. Сколько метров пройдено и сколько осталось?',instruction:'Найди часть и дополнение до всей дистанции.',fields:[numeric('p','Пройдено',600),numeric('r','Осталось',1000)],hint:'1600 раздели на 8 и умножь на 3.',explanation:'Пройдено 600 метров, осталось 1000.'}
];

const responseCount=practice.reduce((total,task)=>total+task.fields.length,0);
if(practice.length!==20||responseCount!==50)throw new Error(`Lesson 94 practice contract broken: ${practice.length} tasks / ${responseCount} responses`);

const conceptStages:Stage[]=[
  {id:'l94-mission',kind:'story',eyebrow:'Урок 94 · § 25 · 4 из 5',title:'Одна задача — несколько дробных шагов',body:'Сегодня дробь будет работать не только с количеством предметов. Целым может быть путь, угол, время или масса, а после нескольких найденных частей часто нужно определить остаток.',note:'Главная цель — удерживать одно и то же целое на протяжении всей задачи.'},
  {id:'l94-whole-first',kind:'model',eyebrow:'Шаг 1',title:'Сначала назови целое и его единицу измерения',body:'Перед вычислениями ответь на два вопроса: что здесь считается целым и в каких единицах оно измеряется. Только после этого дробь получает конкретный смысл.',note:'Например, в задаче про яхту целое — весь путь 624 километра.'},
  {id:'l94-whole-diagnostic',kind:'diagnostic',eyebrow:'Диагностика',title:'Что является целым в задаче № 703?',body:'Яхта за четыре дня проходит весь маршрут, а дробями заданы части этого маршрута за отдельные дни.',choice:{prompt:'От какой величины надо находить каждую дробь?',options:['От 624 километров','От пути предыдущего дня','От оставшегося после каждого дня пути'],answer:'От 624 километров',hint:'В условии сказано, какую часть всего расстояния прошли в каждый из первых трёх дней.',explanation:'Все три дроби относятся к одному целому — ко всему расстоянию 624 километра.'}},
  {id:'l94-separate-parts',kind:'model',eyebrow:'Шаг 2',title:'Несколько частей находи от одного исходного целого',body:'Если условие говорит, что каждая дробь относится ко всему пути, не пересчитывай вторую часть от остатка после первой. Найди каждую часть отдельно от исходного целого, затем сложи найденные значения и вычти их из целого.',note:'Смысл текста определяет базу вычисления.'},
  {id:'l94-source-701',kind:'guided',eyebrow:'Учебник · № 701',title:'Дробь от геометрической величины',body:'В № 701 целое задаётся не количеством предметов, а величиной угла. Для прямого угла целое равно 90 градусам, для развёрнутого — 180 градусам. Алгоритм нахождения дроби от числа остаётся тем же.',note:'Точная № 701 — первая задача обязательной практики.'},
  {id:'l94-source-703',kind:'guided',eyebrow:'Учебник · № 703',title:'Три дробные части и остаток',body:'В № 703 от одного маршрута 624 километра отдельно находятся пути первых трёх дней. Четвёртый день — это не ещё одна заданная дробь, а остаток после вычитания уже найденных расстояний.',note:'Точная № 703 — вторая задача обязательной практики.'},
  {id:'l94-model-diagnostic',kind:'diagnostic',eyebrow:'Диагностика модели',title:'Не вся задача в § 25 требует дробей',body:'Задача № 717 дана в маршруте урока как смешанное повторение: известны общая масса яблок и разница между двумя яблонями.',choice:{prompt:'Что здесь нужно сделать первым?',options:['Применить правило нахождения дроби от числа','Применить обратную дробную модель','Решить обычную задачу на сумму и разность'],answer:'Решить обычную задачу на сумму и разность',hint:'В условии № 717 вообще не задана дробь.',explanation:'Нужно распознать модель задачи. Для № 717 дробный алгоритм не нужен.'}},
  {id:'l94-balance-check',kind:'model',eyebrow:'Самопроверка',title:'Проверь баланс частей',body:'После решения составной задачи сложи все найденные части и остаток. Их сумма должна вернуть исходное целое. Такая проверка быстро обнаруживает ошибку в базе дроби или арифметике.',note:'Для № 703 четыре дневных расстояния вместе должны дать 624 километра.'}
];

const practiceStages:Stage[]=practice.map((task,index)=>({id:`l94-practice-${String(index+1).padStart(2,'0')}`,kind:'practice',eyebrow:`Обязательная практика · ${index+1} из 20${task.source?` · ${task.source}`:''}`,title:index===0?'Точная задача № 701':index===1?'Точная задача № 703':index===2?'Точная задача № 717':task.source?'Задача из учебника':'Составная задача на дроби',body:task.prompt,note:task.instruction,practice:task}));
const stages:Stage[]=[...conceptStages,...practiceStages,{id:'l94-reflection',kind:'story',eyebrow:'Перед итогом',title:'Проговори план составной задачи',body:'Назови целое и единицу измерения. Определи, от какого целого берётся каждая дробь. Найди части отдельно, затем вычисли остаток. В конце проверь, что все части вместе возвращают исходное целое.',note:'Если дроби в условии нет, сначала проверь, не нужна ли совсем другая арифметическая модель.'},{id:'l94-summary',kind:'summary',eyebrow:'Урок 94 · итог',title:'Теперь дроби работают внутри многошаговой задачи',body:'Ты умеешь находить дробь от разных величин, работать с несколькими частями одного целого, вычислять остаток и отличать дробную задачу от обычной. Обязательная практика содержит 20 задач и ровно 50 проверяемых ответов.',note:'Урок 95 завершит § 25 итоговой смешанной практикой перед переходом к правильным и неправильным дробям.'}];

function loadSaved():Saved{try{const parsed=JSON.parse(localStorage.getItem(KEY)??'null') as Saved|null;if(parsed?.version===1)return parsed}catch{}return{version:1,stageIndex:0,responses:{},checked:{},results:{},attempts:{}}}

export function FractionCompositeProblemsPlayer(){
  const initial=useMemo(loadSaved,[]);
  const[stageIndex,setStageIndex]=useState(initial.stageIndex);
  const[responses,setResponses]=useState(initial.responses);
  const[checked,setChecked]=useState(initial.checked);
  const[results,setResults]=useState(initial.results);
  const[attempts,setAttempts]=useState(initial.attempts);
  const stage=stages[Math.min(stageIndex,stages.length-1)];
  const stageKey=stage.id;

  useEffect(()=>{localStorage.setItem(KEY,JSON.stringify({version:1,stageIndex,responses,checked,results,attempts} satisfies Saved))},[stageIndex,responses,checked,results,attempts]);
  useEffect(()=>{const jump=(event:Event)=>{const detail=(event as CustomEvent<StageJumpDetail>).detail??{};if(detail.lessonNumber!==undefined&&detail.lessonNumber!==94)return;if(typeof detail.stageIndex!=='number')return;setStageIndex(Math.min(Math.max(detail.stageIndex,0),stages.length-1))};window.addEventListener('mathnikita-go-to-stage',jump);return()=>window.removeEventListener('mathnikita-go-to-stage',jump)},[]);

  const choiceResult=stage.choice?results[stageKey]:undefined;
  const practiceResult=stage.practice?results[stageKey]:undefined;
  const activitySatisfied=!stage.choice&&!stage.practice||results[stageKey]===true;
  const responseKey=(fieldId:string)=>`${stageKey}:${fieldId}`;
  const checkChoice=(option:string)=>{if(!stage.choice)return;const ok=option===stage.choice.answer;setResponses(prev=>({...prev,[stageKey]:option}));setChecked(prev=>({...prev,[stageKey]:true}));setResults(prev=>({...prev,[stageKey]:ok}));setAttempts(prev=>({...prev,[stageKey]:(prev[stageKey]??0)+1}))};
  const checkPractice=()=>{if(!stage.practice)return;const ok=stage.practice.fields.every(field=>answerMatches(responses[responseKey(field.id)]??'',field.answers));setChecked(prev=>({...prev,[stageKey]:true}));setResults(prev=>({...prev,[stageKey]:ok}));setAttempts(prev=>({...prev,[stageKey]:(prev[stageKey]??0)+1}))};
  const progress=Math.round(((stageIndex+1)/stages.length)*100);

  return <section className="lesson-player fraction-composite-player">
    <div className="lesson-progress"><span>§ 25 · Составные задачи на дроби</span><b>{progress}%</b><i style={{width:`${progress}%`}}/></div>
    <article className={`interactive-stage stage-${stage.kind}`} data-stage-id={stage.id}>
      <header className="stage-heading"><span>{stage.eyebrow}</span><b>Этап {stageIndex+1} из {stages.length}</b></header>
      <div className="stage-copy"><h2>{stage.title}</h2><p>{stage.body}</p></div>
      {stage.note?<div className="theory-note">{stage.note}</div>:null}
      {stage.choice?<section className="activity-area"><h3>{stage.choice.prompt}</h3><p>Выбери один вариант. Объяснение появится только после ответа.</p><div className="choice-grid">{stage.choice.options.map(option=><button type="button" key={option} onClick={()=>checkChoice(option)} className={responses[stageKey]===option?'selected':''}>{option}</button>)}</div>{checked[stageKey]?<div className={`instant-feedback ${choiceResult?'good':'bad'}`} data-explanation={stage.choice.explanation}><b>{choiceResult?'Верно':'Проверь ещё раз'}</b><span>{choiceResult?stage.choice.explanation:stage.choice.hint}</span></div>:null}</section>:null}
      {stage.practice?<section className="activity-area"><h3>{stage.practice.prompt}</h3><p>{stage.practice.instruction}</p><div className="lesson-items">{stage.practice.fields.map(field=><label key={field.id} className="lesson-item"><strong>{field.label}</strong><input aria-label={field.label} value={responses[responseKey(field.id)]??''} placeholder={field.placeholder??'Ответ'} onChange={event=>{setResponses(prev=>({...prev,[responseKey(field.id)]:event.target.value}));setChecked(prev=>({...prev,[stageKey]:false}));setResults(prev=>({...prev,[stageKey]:false}))}}/></label>)}</div><button type="button" className="check-button" onClick={checkPractice}>Проверить все поля</button>{checked[stageKey]?<div className={`instant-feedback ${practiceResult?'good':'bad'}`} data-explanation={stage.practice.explanation}><b>{practiceResult?'Верно':'Есть ошибка'}</b><span>{practiceResult?stage.practice.explanation:stage.practice.hint}</span></div>:null}</section>:null}
    </article>
    <div className="lesson-controls"><button type="button" onClick={()=>setStageIndex(index=>Math.max(0,index-1))} disabled={stageIndex===0}>Назад</button><span>Этап {stageIndex+1} из {stages.length}</span><button type="button" onClick={()=>setStageIndex(index=>Math.min(stages.length-1,index+1))} disabled={stageIndex===stages.length-1||!activitySatisfied}>Дальше</button></div>
  </section>
}

export const lessonNinetyFourStageCount=stages.length;
export const lessonNinetyFourPracticeTaskCount=practice.length;
export const lessonNinetyFourPracticeResponseCount=responseCount;
