import {useEffect,useMemo,useState} from 'react';
import './lessonPlayer.css';
import './theoryExperience.css';

type Field={id:string;label:string;answers:string[];placeholder?:string};
type Choice={prompt:string;options:string[];answer:string;hint:string;explanation:string};
type Practice={prompt:string;instruction:string;fields:Field[];hint:string;explanation:string;source?:string};
type Stage={id:string;kind:'story'|'model'|'guided'|'diagnostic'|'practice'|'summary';eyebrow:string;title:string;body:string;note?:string;choice?:Choice;practice?:Practice};
type Saved={version:1;stageIndex:number;responses:Record<string,string>;checked:Record<string,boolean>;results:Record<string,boolean>;attempts:Record<string,number>};
type StageJumpDetail={lessonNumber?:number;stageIndex?:number};

const KEY='mathnikita-lesson-93-progress-v1';
const normalizeText=(value:string)=>value.normalize('NFKC').trim().toLocaleLowerCase('ru-RU').replace(/ё/g,'е').replace(/[\s;:!?()[\]{}'"«»]/g,'');
const parseNumericAnswer=(value:string)=>{const normalized=value.normalize('NFKC').trim().replace(',', '.');if(!/^[+-]?(?:\d+(?:\.\d+)?|\.\d+)$/.test(normalized))return null;const parsed=Number(normalized);return Number.isFinite(parsed)?parsed:null};
const answerMatches=(value:string,answers:string[])=>{const numericValue=parseNumericAnswer(value);return answers.some(answer=>{const numericAnswer=parseNumericAnswer(answer);if(numericValue!==null&&numericAnswer!==null)return numericValue===numericAnswer;return normalizeText(value)===normalizeText(answer)})};
const numeric=(id:string,label:string,answer:number):Field=>({id,label,answers:[String(answer)],placeholder:'Введите ответ'});
const kindField=(answer:'прямая'|'обратная'):Field=>({id:'kind',label:'Тип задачи',answers:[answer,`${answer} задача`],placeholder:'прямая или обратная'});

const practice:Practice[]=[
  {source:'№ 692',prompt:'Найди число, если одна девятая, две пятых, две девятых, три десятых, пять шестых и восемнадцать девятнадцатых этого числа равны 90.',instruction:'Введи шесть найденных целых чисел по порядку.',fields:[numeric('a','Одна девятая равна 90',810),numeric('b','Две пятых равны 90',225),numeric('c','Две девятых равны 90',405),numeric('d','Три десятых равны 90',300),numeric('e','Пять шестых равны 90',108),numeric('f','Восемнадцать девятнадцатых равны 90',95)],hint:'Известное значение дели на числитель, чтобы найти одну долю, затем умножай на знаменатель.',explanation:'Ответы по порядку: 810, 225, 405, 300, 108 и 95.'},
  {prompt:'Три четверти книги составляют 48 страниц. Сколько страниц во всей книге?',instruction:'Покажи три шага обратной модели.',fields:[numeric('n','Известно долей',3),numeric('u','Одна четверть',16),numeric('w','Вся книга',64)],hint:'48 страниц — это три одинаковые доли. Сначала раздели 48 на 3.',explanation:'Одна четверть — 16 страниц, четыре четверти — 64 страницы.'},
  {prompt:'Пять восьмых всех предметов составляют 45 предметов. Сколько предметов всего?',instruction:'Найди число известных долей, одну долю и целое.',fields:[numeric('n','Известно долей',5),numeric('u','Одна восьмая',9),numeric('w','Целое',72)],hint:'45 раздели на 5, затем результат умножь на 8.',explanation:'Одна восьмая равна 9, восемь восьмых равны 72.'},
  {prompt:'Две седьмых числа равны 18. Найди это число.',instruction:'Заполни три шага.',fields:[numeric('n','Известно долей',2),numeric('u','Одна седьмая',9),numeric('w','Число',63)],hint:'18 раздели на 2, затем умножь на 7.',explanation:'Одна седьмая равна 9, всё число равно 63.'},
  {prompt:'Четыре девятых числа равны 36. Найди число.',instruction:'Заполни три шага.',fields:[numeric('n','Известно долей',4),numeric('u','Одна девятая',9),numeric('w','Число',81)],hint:'36 раздели на 4, затем умножь на 9.',explanation:'Одна девятая равна 9, девять девятых равны 81.'},
  {prompt:'Семь десятых числа равны 63. Найди число.',instruction:'Заполни три шага.',fields:[numeric('n','Известно долей',7),numeric('u','Одна десятая',9),numeric('w','Число',90)],hint:'63 раздели на 7, затем умножь на 10.',explanation:'Одна десятая равна 9, всё число равно 90.'},
  {prompt:'Одиннадцать двенадцатых числа равны 55. Найди число.',instruction:'Заполни три шага.',fields:[numeric('n','Известно долей',11),numeric('u','Одна двенадцатая',5),numeric('w','Число',60)],hint:'55 раздели на 11, затем умножь на 12.',explanation:'Одна двенадцатая равна 5, всё число равно 60.'},
  {prompt:'Три пятых числа равны 24. Определи тип задачи и найди число.',instruction:'Сначала назови модель, затем вычисли результат.',fields:[kindField('обратная'),numeric('r','Число',40)],hint:'Целое неизвестно, значит это обратная задача.',explanation:'Это обратная задача: 24 разделить на 3 и умножить на 5 — получаем 40.'},
  {prompt:'Найди четыре седьмых от 63. Определи тип задачи и результат.',instruction:'Сначала назови модель, затем вычисли.',fields:[kindField('прямая'),numeric('r','Результат',36)],hint:'Исходное целое 63 уже известно.',explanation:'Это прямая задача: 63 разделить на 7 и умножить на 4 — получаем 36.'},
  {prompt:'Пять шестых числа равны 50. Определи тип задачи и найди число.',instruction:'Назови модель и ответ.',fields:[kindField('обратная'),numeric('r','Число',60)],hint:'Известна часть, а целое надо восстановить.',explanation:'50 разделить на 5 и умножить на 6 — получаем 60.'},
  {prompt:'Найди восемь девятых от 81. Определи тип задачи и результат.',instruction:'Назови модель и ответ.',fields:[kindField('прямая'),numeric('r','Результат',72)],hint:'Целое 81 известно заранее.',explanation:'81 разделить на 9 и умножить на 8 — получаем 72.'},
  {prompt:'Две трети числа равны 30. Определи тип задачи и найди число.',instruction:'Назови модель и ответ.',fields:[kindField('обратная'),numeric('r','Число',45)],hint:'30 — значение нескольких долей неизвестного целого.',explanation:'30 разделить на 2 и умножить на 3 — получаем 45.'},
  {prompt:'Найди три восьмых от 56. Определи тип задачи и результат.',instruction:'Назови модель и ответ.',fields:[kindField('прямая'),numeric('r','Результат',21)],hint:'56 — известное целое.',explanation:'56 разделить на 8 и умножить на 3 — получаем 21.'},
  {prompt:'Семь двенадцатых числа равны 42. Определи тип задачи и найди число.',instruction:'Назови модель и ответ.',fields:[kindField('обратная'),numeric('r','Число',72)],hint:'Нужно восстановить двенадцать одинаковых долей.',explanation:'42 разделить на 7 и умножить на 12 — получаем 72.'},
  {prompt:'Найди девять десятых от 90. Определи тип задачи и результат.',instruction:'Назови модель и ответ.',fields:[kindField('прямая'),numeric('r','Результат',81)],hint:'90 — уже известное целое.',explanation:'90 разделить на 10 и умножить на 9 — получаем 81.'},
  {prompt:'Четыре пятнадцатых числа равны 24. Определи тип задачи и найди число.',instruction:'Назови модель и ответ.',fields:[kindField('обратная'),numeric('r','Число',90)],hint:'24 — это четыре одинаковые доли.',explanation:'24 разделить на 4 и умножить на 15 — получаем 90.'},
  {prompt:'Найди тринадцать двадцатых от 100. Определи тип задачи и результат.',instruction:'Назови модель и ответ.',fields:[kindField('прямая'),numeric('r','Результат',65)],hint:'100 — известное целое.',explanation:'100 разделить на 20 и умножить на 13 — получаем 65.'},
  {prompt:'Пять шестнадцатых числа равны 40. Определи тип задачи и найди число.',instruction:'Назови модель и ответ.',fields:[kindField('обратная'),numeric('r','Число',128)],hint:'40 раздели на число известных долей.',explanation:'40 разделить на 5 и умножить на 16 — получаем 128.'},
  {prompt:'Найди шесть одиннадцатых от 88. Определи тип задачи и результат.',instruction:'Назови модель и ответ.',fields:[kindField('прямая'),numeric('r','Результат',48)],hint:'88 — известное целое.',explanation:'88 разделить на 11 и умножить на 6 — получаем 48.'},
  {prompt:'Три четырнадцатых числа равны 18. Определи тип задачи и найди число.',instruction:'Назови модель и ответ.',fields:[kindField('обратная'),numeric('r','Число',84)],hint:'18 — это три одинаковые доли.',explanation:'18 разделить на 3 и умножить на 14 — получаем 84.'}
];

const responseCount=practice.reduce((total,task)=>total+task.fields.length,0);
if(practice.length!==20||responseCount!==50)throw new Error(`Lesson 93 practice contract broken: ${practice.length} tasks / ${responseCount} responses`);

const conceptStages:Stage[]=[
  {id:'l93-mission',kind:'story',eyebrow:'Урок 93 · § 25 · 3 из 5',title:'Сегодня условие разворачивается',body:'Раньше целое число было известно, и мы находили его часть. Теперь известно значение нескольких равных долей, а всё целое спрятано.',note:'Главный навык — сначала определить, какая перед тобой модель: прямая или обратная.'},
  {id:'l93-two-models',kind:'model',eyebrow:'Две модели',title:'Прямая и обратная задачи начинаются с разных известных данных',body:'В прямой задаче известно целое: делим его на знаменатель и умножаем на числитель. В обратной задаче известно значение нескольких долей: делим его на числитель и умножаем на знаменатель.',note:'Смотри не на порядок чисел в тексте, а на то, что известно и что требуется найти.'},
  {id:'l93-model-diagnostic',kind:'diagnostic',eyebrow:'Диагностика',title:'Какая это задача?',body:'Три четверти книги составляют 48 страниц, а требуется узнать объём всей книги.',choice:{prompt:'Какой алгоритм подходит?',options:['48 разделить на 3, затем умножить на 4','48 разделить на 4, затем умножить на 3','48 умножить на 3, затем разделить на 4'],answer:'48 разделить на 3, затем умножить на 4',hint:'48 страниц — это уже три одинаковые доли.',explanation:'Сначала находим одну четверть, разделив известные три доли на 3, затем собираем четыре доли.'}},
  {id:'l93-unit-part',kind:'model',eyebrow:'Шаг 1',title:'В обратной задаче сначала найди одну долю',body:'Если три четверти равны 48, то 48 — это три одинаковые части. Делим 48 на числитель 3 и узнаём размер одной четверти.',note:'В обратной задаче первое деление задаёт числитель.'},
  {id:'l93-whole-step',kind:'guided',eyebrow:'Шаг 2',title:'Затем собери все доли целого',body:'Когда размер одной доли найден, знаменатель показывает, сколько таких долей составляет всё целое. Поэтому размер одной доли умножаем на знаменатель.',note:'Обратная схема: известное значение разделить на числитель, результат умножить на знаменатель.'},
  {id:'l93-direction-diagnostic',kind:'diagnostic',eyebrow:'Диагностика смысла',title:'Не перепутай направление',body:'Сравни два вопроса: найти три пятых от 40 и найти число, три пятых которого равны 24.',choice:{prompt:'В каком вопросе целое неизвестно?',options:['В первом','Во втором','В обоих'],answer:'Во втором',hint:'В первом вопросе исходное число 40 уже дано.',explanation:'Во втором вопросе дано только значение трёх пятых, поэтому требуется восстановить всё целое.'}},
  {id:'l93-source-bridge',kind:'guided',eyebrow:'Учебник · № 692',title:'Шесть обратных задач с одним известным значением',body:'В № 692 каждая заданная дробь неизвестного числа равна 90. Меняются числитель и знаменатель, а обратный алгоритм остаётся одним и тем же.',note:'Полная № 692 из шести подпунктов — первая задача обязательной практики.'},
  {id:'l93-check-back',kind:'model',eyebrow:'Самопроверка',title:'Проверь обратную задачу прямым действием',body:'После восстановления целого найди от него исходную дробь по правилу урока 92. Если вернулось данное в условии значение, модель согласована.',note:'Обратное решение и прямая проверка образуют надёжную пару.'}
];

const practiceStages:Stage[]=practice.map((task,index)=>({id:`l93-practice-${String(index+1).padStart(2,'0')}`,kind:'practice',eyebrow:`Обязательная практика · ${index+1} из 20${task.source?` · ${task.source}`:''}`,title:index===0?'Полная задача № 692':task.source?'Задача из учебника':'Прямая или обратная модель',body:task.prompt,note:task.instruction,practice:task}));
const stages:Stage[]=[...conceptStages,...practiceStages,{id:'l93-reflection',kind:'story',eyebrow:'Перед итогом',title:'Скажи правило без формулы',body:'Если известны несколько равных долей, сначала раздели их значение на числитель и найди одну долю. Затем умножь одну долю на знаменатель и восстанови целое.',note:'После этого проверь ответ прямым правилом нахождения дроби от числа.'},{id:'l93-summary',kind:'summary',eyebrow:'Урок 93 · итог',title:'Теперь ты умеешь двигаться в обе стороны',body:'Ты различаешь прямую и обратную задачи, восстанавливаешь целое по известной дроби и проверяешь результат обратным вычислением. Обязательная практика содержит 20 задач и ровно 50 проверяемых ответов.',note:'Урок 94 углубит обратные задачи и многошаговые модели § 25.'}];

function loadSaved():Saved{try{const parsed=JSON.parse(localStorage.getItem(KEY)??'null') as Saved|null;if(parsed?.version===1)return parsed}catch{}return{version:1,stageIndex:0,responses:{},checked:{},results:{},attempts:{}}}

export function FractionWholeFromPartPlayer(){
  const initial=useMemo(loadSaved,[]);
  const[stageIndex,setStageIndex]=useState(initial.stageIndex);
  const[responses,setResponses]=useState(initial.responses);
  const[checked,setChecked]=useState(initial.checked);
  const[results,setResults]=useState(initial.results);
  const[attempts,setAttempts]=useState(initial.attempts);
  const stage=stages[Math.min(stageIndex,stages.length-1)];
  const stageKey=stage.id;

  useEffect(()=>{localStorage.setItem(KEY,JSON.stringify({version:1,stageIndex,responses,checked,results,attempts} satisfies Saved))},[stageIndex,responses,checked,results,attempts]);
  useEffect(()=>{const jump=(event:Event)=>{const detail=(event as CustomEvent<StageJumpDetail>).detail??{};if(detail.lessonNumber!==undefined&&detail.lessonNumber!==93)return;if(typeof detail.stageIndex!=='number')return;setStageIndex(Math.min(Math.max(detail.stageIndex,0),stages.length-1))};window.addEventListener('mathnikita-go-to-stage',jump);return()=>window.removeEventListener('mathnikita-go-to-stage',jump)},[]);

  const choiceResult=stage.choice?results[stageKey]:undefined;
  const practiceResult=stage.practice?results[stageKey]:undefined;
  const activitySatisfied=!stage.choice&&!stage.practice||results[stageKey]===true;
  const responseKey=(fieldId:string)=>`${stageKey}:${fieldId}`;
  const checkChoice=(option:string)=>{if(!stage.choice)return;const ok=option===stage.choice.answer;setResponses(prev=>({...prev,[stageKey]:option}));setChecked(prev=>({...prev,[stageKey]:true}));setResults(prev=>({...prev,[stageKey]:ok}));setAttempts(prev=>({...prev,[stageKey]:(prev[stageKey]??0)+1}))};
  const checkPractice=()=>{if(!stage.practice)return;const ok=stage.practice.fields.every(field=>answerMatches(responses[responseKey(field.id)]??'',field.answers));setChecked(prev=>({...prev,[stageKey]:true}));setResults(prev=>({...prev,[stageKey]:ok}));setAttempts(prev=>({...prev,[stageKey]:(prev[stageKey]??0)+1}))};
  const progress=Math.round(((stageIndex+1)/stages.length)*100);

  return <section className="lesson-player fraction-of-number-player">
    <div className="lesson-progress"><span>§ 25 · Нахождение целого по его дроби</span><b>{progress}%</b><i style={{width:`${progress}%`}}/></div>
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

export const lessonNinetyThreeStageCount=stages.length;
export const lessonNinetyThreePracticeTaskCount=practice.length;
export const lessonNinetyThreePracticeResponseCount=responseCount;