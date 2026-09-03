import {useEffect,useMemo,useState} from 'react';
import './lessonPlayer.css';
import './theoryExperience.css';

type Field={id:string;label:string;answers:string[];placeholder?:string};
type Choice={prompt:string;options:string[];answer:string;hint:string;explanation:string};
type Practice={prompt:string;instruction:string;fields:Field[];hint:string;explanation:string;source?:string};
type Stage={id:string;kind:'story'|'model'|'guided'|'diagnostic'|'practice'|'summary';eyebrow:string;title:string;body:string;note?:string;choice?:Choice;practice?:Practice};
type Saved={version:1;stageIndex:number;responses:Record<string,string>;checked:Record<string,boolean>;results:Record<string,boolean>;attempts:Record<string,number>};
type StageJumpDetail={lessonNumber?:number;stageIndex?:number};

const KEY='mathnikita-lesson-91-progress-v1';
const normalize=(value:string)=>value.normalize('NFKC').trim().toLocaleLowerCase('ru-RU').replace(/ё/g,'е').replace(/[\s.,;:!?()[\]{}'"«»]/g,'');
const answerMatches=(value:string,answers:string[])=>answers.some(answer=>normalize(value)===normalize(answer));
const fractionField=(id:string,label:string,numerator:number,denominator:number):Field=>({id,label,answers:[`${numerator}/${denominator}`,`${numerator} / ${denominator}`],placeholder:`${numerator}/${denominator}`});

const practice:Practice[]=[
  {source:'№ 681',prompt:'В классе 32 ученика. Семеро получили оценку «5». Какую часть класса составляют эти ученики?',instruction:'Заполни числитель, знаменатель и запись дроби.',fields:[{id:'n',label:'Числитель',answers:['7']},{id:'d',label:'Знаменатель',answers:['32']},fractionField('f','Дробь',7,32)],hint:'Знаменатель показывает всех учеников класса, числитель — тех, кто получил пятёрку.',explanation:'Класс — целое из 32 учеников. Выбраны 7 учеников, поэтому получаем семь тридцать вторых.'},
  {prompt:'Пиццу разделили на 8 равных кусков и взяли 3 куска.',instruction:'Опиши выбранную часть тремя ответами.',fields:[{id:'n',label:'Числитель',answers:['3']},{id:'d',label:'Знаменатель',answers:['8']},fractionField('f','Дробь',3,8)],hint:'Всего равных частей восемь, взяли три.',explanation:'Три из восьми равных частей — три восьмых.'},
  {prompt:'Ленту разделили на 10 равных частей, 4 части закрасили.',instruction:'Заполни три поля.',fields:[{id:'n',label:'Числитель',answers:['4']},{id:'d',label:'Знаменатель',answers:['10']},fractionField('f','Дробь',4,10)],hint:'Сначала назови число всех равных частей.',explanation:'Всего десять частей, отмечены четыре: четыре десятых.'},
  {prompt:'Из 15 одинаковых флажков 6 красные.',instruction:'Заполни три поля для части красных флажков.',fields:[{id:'n',label:'Числитель',answers:['6']},{id:'d',label:'Знаменатель',answers:['15']},fractionField('f','Дробь',6,15)],hint:'Все пятнадцать флажков образуют целое множество.',explanation:'Красных шесть из пятнадцати: шесть пятнадцатых.'},
  {prompt:'Из 60 минут часа прошло 15 минут.',instruction:'Заполни три поля для прошедшей части часа.',fields:[{id:'n',label:'Числитель',answers:['15']},{id:'d',label:'Знаменатель',answers:['60']},fractionField('f','Дробь',15,60)],hint:'Целый час содержит шестьдесят минут.',explanation:'Прошло пятнадцать из шестидесяти равных минутных частей.'},
  {prompt:'Из 24 часов суток прошло 6 часов.',instruction:'Заполни три поля.',fields:[{id:'n',label:'Числитель',answers:['6']},{id:'d',label:'Знаменатель',answers:['24']},fractionField('f','Дробь',6,24)],hint:'Сутки — это двадцать четыре часа.',explanation:'Шесть из двадцати четырёх часов — шесть двадцать четвёртых суток.'},
  {prompt:'Метр разделён на 100 сантиметров. Отмечены первые 25 сантиметров.',instruction:'Заполни три поля.',fields:[{id:'n',label:'Числитель',answers:['25']},{id:'d',label:'Знаменатель',answers:['100']},fractionField('f','Дробь',25,100)],hint:'В целом метре сто сантиметров.',explanation:'Отмечены двадцать пять из ста равных сантиметровых частей.'},
  {prompt:'В коробке 12 одинаковых ячеек, заняты 5.',instruction:'Заполни три поля.',fields:[{id:'n',label:'Числитель',answers:['5']},{id:'d',label:'Знаменатель',answers:['12']},fractionField('f','Дробь',5,12)],hint:'Знаменатель — число всех ячеек.',explanation:'Заняты пять из двенадцати ячеек: пять двенадцатых.'},
  {prompt:'На полке 20 книг, 9 из них в синей обложке.',instruction:'Заполни три поля для синих книг.',fields:[{id:'n',label:'Числитель',answers:['9']},{id:'d',label:'Знаменатель',answers:['20']},fractionField('f','Дробь',9,20)],hint:'Целое множество — все двадцать книг.',explanation:'Синих книг девять из двадцати: девять двадцатых.'},
  {prompt:'В наборе 30 шариков, 12 зелёных.',instruction:'Заполни три поля.',fields:[{id:'n',label:'Числитель',answers:['12']},{id:'d',label:'Знаменатель',answers:['30']},fractionField('f','Дробь',12,30)],hint:'Не сокращай дробь: сейчас тренируем смысл числителя и знаменателя.',explanation:'Зелёных двенадцать из тридцати: двенадцать тридцатых.'},
  {prompt:'Дробь две седьмых описывает часть целого.',instruction:'Укажи число выбранных частей и число всех равных частей.',fields:[{id:'selected',label:'Выбрано частей',answers:['2']},{id:'total',label:'Всего равных частей',answers:['7']}],hint:'В записи дроби верхнее число — выбранные части, нижнее — все равные части.',explanation:'Две седьмых: выбраны две части из семи.'},
  {prompt:'Дробь четыре девятых описывает часть целого.',instruction:'Укажи два числа.',fields:[{id:'selected',label:'Выбрано частей',answers:['4']},{id:'total',label:'Всего равных частей',answers:['9']}],hint:'Числитель четыре, знаменатель девять.',explanation:'Выбраны четыре из девяти равных частей.'},
  {prompt:'Дробь семь десятых описывает часть целого.',instruction:'Укажи числитель и знаменатель.',fields:[{id:'n',label:'Числитель',answers:['7']},{id:'d',label:'Знаменатель',answers:['10']}],hint:'Смотри на роль верхнего и нижнего числа.',explanation:'Числитель равен семи, знаменатель — десяти.'},
  {prompt:'Круг разделили на 6 равных секторов и закрасили один.',instruction:'Укажи числитель и знаменатель.',fields:[{id:'n',label:'Числитель',answers:['1']},{id:'d',label:'Знаменатель',answers:['6']}],hint:'Закрашена одна часть из шести.',explanation:'Получается одна шестая.'},
  {prompt:'Отрезок разделён на 11 равных частей, отмечены 8.',instruction:'Укажи числитель и знаменатель.',fields:[{id:'n',label:'Числитель',answers:['8']},{id:'d',label:'Знаменатель',answers:['11']}],hint:'Всего частей одиннадцать.',explanation:'Отмечены восемь одиннадцатых отрезка.'},
  {prompt:'Из 18 одинаковых карточек 13 содержат рисунок.',instruction:'Укажи числитель и знаменатель.',fields:[{id:'n',label:'Числитель',answers:['13']},{id:'d',label:'Знаменатель',answers:['18']}],hint:'Все карточки — целое множество.',explanation:'Карточки с рисунком составляют тринадцать восемнадцатых набора.'},
  {prompt:'Прямоугольник разделён на 14 равных клеток, закрашены 9.',instruction:'Укажи два числа дроби.',fields:[{id:'n',label:'Числитель',answers:['9']},{id:'d',label:'Знаменатель',answers:['14']}],hint:'Закрашено девять, всего четырнадцать.',explanation:'Числитель девять, знаменатель четырнадцать.'},
  {prompt:'Из 16 равных долей шоколадки осталось 5.',instruction:'Укажи числитель и знаменатель для оставшейся части.',fields:[{id:'n',label:'Числитель',answers:['5']},{id:'d',label:'Знаменатель',answers:['16']}],hint:'Осталось пять частей из шестнадцати.',explanation:'Осталось пять шестнадцатых шоколадки.'},
  {prompt:'Квадрат разделили на 25 одинаковых маленьких квадратов, 17 закрасили.',instruction:'Укажи два числа дроби.',fields:[{id:'n',label:'Числитель',answers:['17']},{id:'d',label:'Знаменатель',answers:['25']}],hint:'Все двадцать пять клеток равны.',explanation:'Закрашены семнадцать двадцать пятых квадрата.'},
  {prompt:'В команде 12 игроков, пятеро сейчас на площадке.',instruction:'Укажи числитель и знаменатель части игроков на площадке.',fields:[{id:'n',label:'Числитель',answers:['5']},{id:'d',label:'Знаменатель',answers:['12']}],hint:'Пять выбранных игроков из двенадцати.',explanation:'На площадке пять двенадцатых состава команды.'}
];

const responseCount=practice.reduce((total,task)=>total+task.fields.length,0);
if(practice.length!==20||responseCount!==50)throw new Error(`Lesson 91 practice contract broken: ${practice.length} tasks / ${responseCount} responses`);

const conceptStages:Stage[]=[
  {id:'l91-mission',kind:'story',eyebrow:'Урок 91 · § 25',title:'Дробь начинается с целого',body:'Прежде чем говорить о дроби, нужно назвать целое. Это может быть пицца, отрезок, час, класс учеников или любое другое множество, которое мы рассматриваем как один объект.',note:'Сегодня не сокращаем дроби и не сравниваем их. Сначала строим прочный смысл записи.'},
  {id:'l91-equal-parts',kind:'model',eyebrow:'Главное условие',title:'Части должны быть равными',body:'Если целое разделили на равные части, каждая часть имеет одинаковую долю целого. Только тогда число всех частей можно использовать как знаменатель.',note:'Неравные куски нельзя честно описать одной обыкновенной дробью как одинаковые доли.'},
  {id:'l91-diagnostic-equal',kind:'diagnostic',eyebrow:'Диагностика',title:'Проверяем основу',body:'Перед новой записью убедимся, что слово «часть» понимается правильно.',choice:{prompt:'Какое разбиение подходит для дробной модели?',options:['Целое разделено на 6 равных частей','Целое разрезано на 6 частей разного размера','Два целых сложили вместе'],answer:'Целое разделено на 6 равных частей',hint:'Для знаменателя важно, чтобы все доли были одинаковыми.',explanation:'Обыкновенная дробь в этой модели считает равные части одного целого.'}},
  {id:'l91-denominator',kind:'model',eyebrow:'Нижнее число',title:'Знаменатель отвечает: на сколько равных частей разделили целое',body:'Если целое разделили на восемь равных частей, знаменатель равен восьми. Он описывает размер одной доли через число одинаковых частей всего целого.',note:'Сначала определяй целое и только потом знаменатель.'},
  {id:'l91-numerator',kind:'model',eyebrow:'Верхнее число',title:'Числитель отвечает: сколько равных частей взяли',body:'Если из восьми равных частей выбрали три, числитель равен трём. Дробь читается как три восьмых.',note:'Числитель считает выбранные части, знаменатель — все равные части целого.'},
  {id:'l91-reading',kind:'guided',eyebrow:'Читаем дроби',title:'Одна запись — две информации',body:'Одна пятая означает одну выбранную часть из пяти равных. Две седьмых — две части из семи. Девять двадцатых — девять частей из двадцати.',note:'Слова помогают слышать структуру дроби и не путать роли чисел.'},
  {id:'l91-diagnostic-roles',kind:'diagnostic',eyebrow:'Диагностика',title:'Не перепутай роли чисел',body:'Представь целое, разделённое на десять равных частей, из которых четыре отмечены.',choice:{prompt:'Какой смысл у числа десять?',options:['Это знаменатель: всего равных частей','Это числитель: отмеченных частей','Это число целых объектов'],answer:'Это знаменатель: всего равных частей',hint:'Спроси: сколько равных частей образуют всё целое?',explanation:'Десять — число всех равных частей, поэтому это знаменатель.'}},
  {id:'l91-source',kind:'guided',eyebrow:'Учебник · № 681',title:'Дробь может описывать часть множества',body:'В классе 32 ученика, семеро получили оценку «5». Все ученики класса образуют целое множество, а семеро учеников — выбранную часть.',note:'Значит, числитель равен семи, знаменатель — тридцати двум. Получаем семь тридцать вторых.'},
  {id:'l91-transfer',kind:'model',eyebrow:'Перенос',title:'Один алгоритм работает для фигур, времени и множеств',body:'Шаг первый: назови целое. Шаг второй: убедись, что части равны или элементы считаются одинаковыми единицами. Шаг третий: найди число всех частей. Шаг четвёртый: найди число выбранных частей.',note:'Эти четыре шага будут основой всей темы § 25.'}
];

const practiceStages:Stage[]=practice.map((task,index)=>({id:`l91-practice-${String(index+1).padStart(2,'0')}`,kind:'practice',eyebrow:`Обязательная практика · ${index+1} из 20${task.source?` · ${task.source}`:''}`,title:index===0?'Точная задача из учебника':'Переведи ситуацию в дробную модель',body:task.prompt,note:task.instruction,practice:task}));
const stages:Stage[]=[...conceptStages,...practiceStages,{id:'l91-reflection',kind:'story',eyebrow:'Перед итогом',title:'Объясни дробь словами',body:'Для любой дроби сначала скажи, что является целым, затем назови число всех равных частей и только после этого — число выбранных частей.',note:'Если эти три фразы понятны, запись дроби перестаёт быть набором двух чисел.'},{id:'l91-summary',kind:'summary',eyebrow:'Урок 91 · итог',title:'Числитель и знаменатель получили смысл',body:'Ты научился видеть целое, проверять равенство частей, находить знаменатель по числу всех частей и числитель по числу выбранных частей. Обязательная практика содержит 20 задач и ровно 50 проверяемых ответов.',note:'Следующий урок § 25 сможет опираться на эту модель и расширять работу с дробями.'}];

function loadSaved():Saved{try{const parsed=JSON.parse(localStorage.getItem(KEY)??'null') as Saved|null;if(parsed?.version===1)return parsed}catch{}return{version:1,stageIndex:0,responses:{},checked:{},results:{},attempts:{}}}

export function FractionConceptPlayer(){
  const initial=useMemo(loadSaved,[]);
  const[stageIndex,setStageIndex]=useState(initial.stageIndex);
  const[responses,setResponses]=useState(initial.responses);
  const[checked,setChecked]=useState(initial.checked);
  const[results,setResults]=useState(initial.results);
  const[attempts,setAttempts]=useState(initial.attempts);
  const stage=stages[Math.min(stageIndex,stages.length-1)];
  const stageKey=stage.id;

  useEffect(()=>{localStorage.setItem(KEY,JSON.stringify({version:1,stageIndex,responses,checked,results,attempts} satisfies Saved))},[stageIndex,responses,checked,results,attempts]);
  useEffect(()=>{const jump=(event:Event)=>{const detail=(event as CustomEvent<StageJumpDetail>).detail??{};if(detail.lessonNumber!==undefined&&detail.lessonNumber!==91)return;if(typeof detail.stageIndex!=='number')return;setStageIndex(Math.min(Math.max(detail.stageIndex,0),stages.length-1))};window.addEventListener('mathnikita-go-to-stage',jump);return()=>window.removeEventListener('mathnikita-go-to-stage',jump)},[]);

  const choiceResult=stage.choice?results[stageKey]:undefined;
  const practiceResult=stage.practice?results[stageKey]:undefined;
  const activitySatisfied=!stage.choice&&!stage.practice||results[stageKey]===true;
  const responseKey=(fieldId:string)=>`${stageKey}:${fieldId}`;
  const checkChoice=(option:string)=>{if(!stage.choice)return;const ok=option===stage.choice.answer;setResponses(prev=>({...prev,[stageKey]:option}));setChecked(prev=>({...prev,[stageKey]:true}));setResults(prev=>({...prev,[stageKey]:ok}));setAttempts(prev=>({...prev,[stageKey]:(prev[stageKey]??0)+1}))};
  const checkPractice=()=>{if(!stage.practice)return;const ok=stage.practice.fields.every(field=>answerMatches(responses[responseKey(field.id)]??'',field.answers));setChecked(prev=>({...prev,[stageKey]:true}));setResults(prev=>({...prev,[stageKey]:ok}));setAttempts(prev=>({...prev,[stageKey]:(prev[stageKey]??0)+1}))};
  const progress=Math.round(((stageIndex+1)/stages.length)*100);

  return <section className="lesson-player fraction-concept-player">
    <div className="lesson-progress"><span>§ 25 · Понятие обыкновенной дроби</span><b>{progress}%</b><i style={{width:`${progress}%`}}/></div>
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

export const lessonNinetyOneStageCount=stages.length;
export const lessonNinetyOnePracticeTaskCount=practice.length;
export const lessonNinetyOnePracticeResponseCount=responseCount;
