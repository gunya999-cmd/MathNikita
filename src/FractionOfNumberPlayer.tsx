import {useEffect,useMemo,useState} from 'react';
import './lessonPlayer.css';
import './theoryExperience.css';

type Field={id:string;label:string;answers:string[];placeholder?:string};
type Choice={prompt:string;options:string[];answer:string;hint:string;explanation:string};
type Practice={prompt:string;instruction:string;fields:Field[];hint:string;explanation:string;source?:string};
type Stage={id:string;kind:'story'|'model'|'guided'|'diagnostic'|'practice'|'summary';eyebrow:string;title:string;body:string;note?:string;choice?:Choice;practice?:Practice};
type Saved={version:1;stageIndex:number;responses:Record<string,string>;checked:Record<string,boolean>;results:Record<string,boolean>;attempts:Record<string,number>};
type StageJumpDetail={lessonNumber?:number;stageIndex?:number};

const KEY='mathnikita-lesson-92-progress-v1';
const normalize=(value:string)=>value.normalize('NFKC').trim().toLocaleLowerCase('ru-RU').replace(/ё/g,'е').replace(/[\s.,;:!?()[\]{}'"«»]/g,'');
const answerMatches=(value:string,answers:string[])=>answers.some(answer=>normalize(value)===normalize(answer));
const numeric=(id:string,label:string,answer:number):Field=>({id,label,answers:[String(answer)],placeholder:String(answer)});

const practice:Practice[]=[
  {source:'№ 684',prompt:'Найди от числа 36: одну треть, три четверти, пять шестых, четыре девятых, пять двенадцатых и одиннадцать восемнадцатых.',instruction:'Введи шесть результатов по порядку.',fields:[numeric('a','Одна треть от 36',12),numeric('b','Три четверти от 36',27),numeric('c','Пять шестых от 36',30),numeric('d','Четыре девятых от 36',16),numeric('e','Пять двенадцатых от 36',15),numeric('f','Одиннадцать восемнадцатых от 36',22)],hint:'Для каждого пункта сначала раздели 36 на знаменатель, затем умножь результат на числитель.',explanation:'Получаем по порядку: 12, 27, 30, 16, 15 и 22.'},
  {source:'№ 686',prompt:'Андрей прочитал четыре девятых книги, в которой 180 страниц. Сколько страниц он прочитал?',instruction:'Покажи знаменатель, размер одной девятой и итог.',fields:[numeric('d','Знаменатель',9),numeric('u','Одна девятая книги',20),numeric('r','Прочитано страниц',80)],hint:'Сначала найди одну девятую: 180 разделить на 9.',explanation:'Одна девятая — 20 страниц. Четыре девятых — 20 умножить на 4, то есть 80 страниц.'},
  {source:'№ 687',prompt:'Золушка сделала 72 вареника. Вареники с творогом составляли пять восьмых всех вареников. Сколько было вареников с творогом?',instruction:'Заполни три шага.',fields:[numeric('d','Знаменатель',8),numeric('u','Одна восьмая',9),numeric('r','Пять восьмых',45)],hint:'Раздели 72 на 8, затем умножь на 5.',explanation:'Одна восьмая — 9 вареников, пять восьмых — 45.'},
  {prompt:'Найди три седьмых от 42.',instruction:'Заполни три шага.',fields:[numeric('d','Знаменатель',7),numeric('u','Одна седьмая',6),numeric('r','Три седьмых',18)],hint:'Сначала 42 разделить на 7.',explanation:'Одна седьмая равна 6, три седьмых равны 18.'},
  {prompt:'Найди пять шестых от 54.',instruction:'Заполни три шага.',fields:[numeric('d','Знаменатель',6),numeric('u','Одна шестая',9),numeric('r','Пять шестых',45)],hint:'54 разделить на 6, затем результат умножить на 5.',explanation:'Одна шестая равна 9, пять шестых равны 45.'},
  {prompt:'Найди семь десятых от 90.',instruction:'Заполни три шага.',fields:[numeric('d','Знаменатель',10),numeric('u','Одна десятая',9),numeric('r','Семь десятых',63)],hint:'Одна десятая от 90 — 9.',explanation:'Девять умножить на семь равно 63.'},
  {prompt:'Найди одиннадцать двенадцатых от 60.',instruction:'Заполни три шага.',fields:[numeric('d','Знаменатель',12),numeric('u','Одна двенадцатая',5),numeric('r','Одиннадцать двенадцатых',55)],hint:'60 разделить на 12, затем умножить на 11.',explanation:'Одна двенадцатая равна 5, одиннадцать двенадцатых равны 55.'},
  {prompt:'Найди две трети от 48.',instruction:'Найди одну долю и итог.',fields:[numeric('u','Одна треть',16),numeric('r','Две трети',32)],hint:'48 разделить на 3.',explanation:'Одна треть равна 16, две трети равны 32.'},
  {prompt:'Найди три пятых от 50.',instruction:'Найди одну долю и итог.',fields:[numeric('u','Одна пятая',10),numeric('r','Три пятых',30)],hint:'50 разделить на 5.',explanation:'Одна пятая равна 10, три пятых равны 30.'},
  {prompt:'Найди семь восьмых от 64.',instruction:'Найди одну долю и итог.',fields:[numeric('u','Одна восьмая',8),numeric('r','Семь восьмых',56)],hint:'64 разделить на 8.',explanation:'Одна восьмая равна 8, семь восьмых равны 56.'},
  {prompt:'Найди четыре одиннадцатых от 88.',instruction:'Найди одну долю и итог.',fields:[numeric('u','Одна одиннадцатая',8),numeric('r','Четыре одиннадцатых',32)],hint:'88 разделить на 11.',explanation:'Одна одиннадцатая равна 8, четыре одиннадцатых равны 32.'},
  {prompt:'Найди пять девятых от 81.',instruction:'Найди одну долю и итог.',fields:[numeric('u','Одна девятая',9),numeric('r','Пять девятых',45)],hint:'81 разделить на 9.',explanation:'Одна девятая равна 9, пять девятых равны 45.'},
  {prompt:'Найди шесть седьмых от 70.',instruction:'Найди одну долю и итог.',fields:[numeric('u','Одна седьмая',10),numeric('r','Шесть седьмых',60)],hint:'70 разделить на 7.',explanation:'Одна седьмая равна 10, шесть седьмых равны 60.'},
  {prompt:'Найди три четверти от 100.',instruction:'Найди одну долю и итог.',fields:[numeric('u','Одна четверть',25),numeric('r','Три четверти',75)],hint:'100 разделить на 4.',explanation:'Одна четверть равна 25, три четверти равны 75.'},
  {prompt:'Найди девять десятых от 120.',instruction:'Найди одну долю и итог.',fields:[numeric('u','Одна десятая',12),numeric('r','Девять десятых',108)],hint:'120 разделить на 10.',explanation:'Одна десятая равна 12, девять десятых равны 108.'},
  {prompt:'Найди две пятых от 75.',instruction:'Найди одну долю и итог.',fields:[numeric('u','Одна пятая',15),numeric('r','Две пятых',30)],hint:'75 разделить на 5.',explanation:'Одна пятая равна 15, две пятых равны 30.'},
  {prompt:'Найди семь двенадцатых от 96.',instruction:'Найди одну долю и итог.',fields:[numeric('u','Одна двенадцатая',8),numeric('r','Семь двенадцатых',56)],hint:'96 разделить на 12.',explanation:'Одна двенадцатая равна 8, семь двенадцатых равны 56.'},
  {prompt:'Найди тринадцать двадцатых от 100.',instruction:'Найди одну долю и итог.',fields:[numeric('u','Одна двадцатая',5),numeric('r','Тринадцать двадцатых',65)],hint:'100 разделить на 20.',explanation:'Одна двадцатая равна 5, тринадцать двадцатых равны 65.'},
  {prompt:'Найди четыре пятнадцатых от 90.',instruction:'Найди одну долю и итог.',fields:[numeric('u','Одна пятнадцатая',6),numeric('r','Четыре пятнадцатых',24)],hint:'90 разделить на 15.',explanation:'Одна пятнадцатая равна 6, четыре пятнадцатых равны 24.'},
  {prompt:'Найди пять шестнадцатых от 128.',instruction:'Найди одну долю и итог.',fields:[numeric('u','Одна шестнадцатая',8),numeric('r','Пять шестнадцатых',40)],hint:'128 разделить на 16.',explanation:'Одна шестнадцатая равна 8, пять шестнадцатых равны 40.'}
];

const responseCount=practice.reduce((total,task)=>total+task.fields.length,0);
if(practice.length!==20||responseCount!==50)throw new Error(`Lesson 92 practice contract broken: ${practice.length} tasks / ${responseCount} responses`);

const conceptStages:Stage[]=[
  {id:'l92-mission',kind:'story',eyebrow:'Урок 92 · § 25 · 2 из 5',title:'Теперь дробь помогает находить часть числа',body:'На прошлом уроке числитель показывал, сколько равных частей взято, а знаменатель — на сколько равных частей разделено целое. Теперь этим смыслом воспользуемся для вычислений.',note:'Сегодня главный навык — находить заданную дробь от числа без угадывания.'},
  {id:'l92-unit-fraction',kind:'model',eyebrow:'Шаг 1',title:'Сначала найди одну долю',body:'Чтобы найти одну пятую от числа, раздели число на пять. Чтобы найти одну девятую, раздели число на девять. Знаменатель говорит, на сколько равных долей нужно разделить целое.',note:'Первое действие определяется знаменателем.'},
  {id:'l92-order-diagnostic',kind:'diagnostic',eyebrow:'Диагностика',title:'Какой порядок действий правильный?',body:'Проверь, что алгоритм не превратился в механическую перестановку чисел.',choice:{prompt:'Как найти три пятых от 40?',options:['40 разделить на 5, затем умножить на 3','40 разделить на 3, затем умножить на 5','40 умножить на 5, затем разделить на 3'],answer:'40 разделить на 5, затем умножить на 3',hint:'Сначала знаменатель помогает найти одну равную долю.',explanation:'40 разделить на 5 равно 8. Три такие доли дают 24.'}},
  {id:'l92-numerator-step',kind:'model',eyebrow:'Шаг 2',title:'Затем возьми столько долей, сколько показывает числитель',body:'После деления на знаменатель мы знаем размер одной доли. Теперь умножаем эту долю на числитель — получаем нужное количество равных частей.',note:'Схема: число разделить на знаменатель, результат умножить на числитель.'},
  {id:'l92-worked-example',kind:'guided',eyebrow:'Разбор',title:'Три четверти от 28',body:'Сначала 28 разделим на 4 и получим 7 — это одна четверть. Затем 7 умножим на 3 и получим 21. Значит, три четверти от 28 равны 21.',note:'Проверка здравого смысла: результат меньше 28, потому что взяли не всё целое.'},
  {id:'l92-error-diagnostic',kind:'diagnostic',eyebrow:'Диагностика ошибки',title:'Найди верное решение',body:'Ученик ищет пять шестых от 54.',choice:{prompt:'Какое решение верное?',options:['54 разделить на 6 равно 9, затем 9 умножить на 5 равно 45','54 разделить на 5 равно 10,8, затем умножить на 6','54 умножить на 6 равно 324, затем разделить на 5'],answer:'54 разделить на 6 равно 9, затем 9 умножить на 5 равно 45',hint:'Одна шестая находится делением на шесть.',explanation:'Знаменатель 6 задаёт число равных долей; числитель 5 — сколько таких долей нужно взять.'}},
  {id:'l92-source-bridge',kind:'guided',eyebrow:'Учебник',title:'№ 684 превращает правило в серию вычислений',body:'В задаче № 684 нужно найти несколько разных дробей от одного и того же числа 36. Это полезная тренировка: меняются числитель и знаменатель, но алгоритм остаётся одинаковым.',note:'Полная № 684 будет первой задачей обязательной практики.'},
  {id:'l92-self-check',kind:'model',eyebrow:'Самопроверка',title:'Как быстро заметить грубую ошибку',body:'Если числитель меньше знаменателя и мы берём часть положительного числа, ответ не должен быть больше исходного числа. Это не заменяет вычисление, но помогает поймать неверный порядок действий.',note:'Сначала смысл, затем вычисление, затем проверка результата.'}
];

const practiceStages:Stage[]=practice.map((task,index)=>({id:`l92-practice-${String(index+1).padStart(2,'0')}`,kind:'practice',eyebrow:`Обязательная практика · ${index+1} из 20${task.source?` · ${task.source}`:''}`,title:index===0?'Полная задача № 684':task.source?'Задача из учебника':'Найди дробь от числа',body:task.prompt,note:task.instruction,practice:task}));
const stages:Stage[]=[...conceptStages,...practiceStages,{id:'l92-reflection',kind:'story',eyebrow:'Перед итогом',title:'Сформулируй алгоритм без формулы',body:'Назови два действия словами: сначала разделить исходное число на знаменатель, чтобы найти одну долю; затем умножить эту долю на числитель, чтобы взять нужное количество долей.',note:'Если можешь объяснить оба действия, алгоритм опирается на смысл дроби.'},{id:'l92-summary',kind:'summary',eyebrow:'Урок 92 · итог',title:'Дробь стала вычислительным инструментом',body:'Ты научился находить дробь от числа через размер одной доли, проверять порядок действий и оценивать разумность ответа. Обязательная практика содержит 20 задач и ровно 50 проверяемых ответов.',note:'Следующий урок § 25 продолжит работу с дробями на новых моделях и задачах.'}];

function loadSaved():Saved{try{const parsed=JSON.parse(localStorage.getItem(KEY)??'null') as Saved|null;if(parsed?.version===1)return parsed}catch{}return{version:1,stageIndex:0,responses:{},checked:{},results:{},attempts:{}}}

export function FractionOfNumberPlayer(){
  const initial=useMemo(loadSaved,[]);
  const[stageIndex,setStageIndex]=useState(initial.stageIndex);
  const[responses,setResponses]=useState(initial.responses);
  const[checked,setChecked]=useState(initial.checked);
  const[results,setResults]=useState(initial.results);
  const[attempts,setAttempts]=useState(initial.attempts);
  const stage=stages[Math.min(stageIndex,stages.length-1)];
  const stageKey=stage.id;

  useEffect(()=>{localStorage.setItem(KEY,JSON.stringify({version:1,stageIndex,responses,checked,results,attempts} satisfies Saved))},[stageIndex,responses,checked,results,attempts]);
  useEffect(()=>{const jump=(event:Event)=>{const detail=(event as CustomEvent<StageJumpDetail>).detail??{};if(detail.lessonNumber!==undefined&&detail.lessonNumber!==92)return;if(typeof detail.stageIndex!=='number')return;setStageIndex(Math.min(Math.max(detail.stageIndex,0),stages.length-1))};window.addEventListener('mathnikita-go-to-stage',jump);return()=>window.removeEventListener('mathnikita-go-to-stage',jump)},[]);

  const choiceResult=stage.choice?results[stageKey]:undefined;
  const practiceResult=stage.practice?results[stageKey]:undefined;
  const activitySatisfied=!stage.choice&&!stage.practice||results[stageKey]===true;
  const responseKey=(fieldId:string)=>`${stageKey}:${fieldId}`;
  const checkChoice=(option:string)=>{if(!stage.choice)return;const ok=option===stage.choice.answer;setResponses(prev=>({...prev,[stageKey]:option}));setChecked(prev=>({...prev,[stageKey]:true}));setResults(prev=>({...prev,[stageKey]:ok}));setAttempts(prev=>({...prev,[stageKey]:(prev[stageKey]??0)+1}))};
  const checkPractice=()=>{if(!stage.practice)return;const ok=stage.practice.fields.every(field=>answerMatches(responses[responseKey(field.id)]??'',field.answers));setChecked(prev=>({...prev,[stageKey]:true}));setResults(prev=>({...prev,[stageKey]:ok}));setAttempts(prev=>({...prev,[stageKey]:(prev[stageKey]??0)+1}))};
  const progress=Math.round(((stageIndex+1)/stages.length)*100);

  return <section className="lesson-player fraction-of-number-player">
    <div className="lesson-progress"><span>§ 25 · Нахождение дроби от числа</span><b>{progress}%</b><i style={{width:`${progress}%`}}/></div>
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

export const lessonNinetyTwoStageCount=stages.length;
export const lessonNinetyTwoPracticeTaskCount=practice.length;
export const lessonNinetyTwoPracticeResponseCount=responseCount;
