import {useEffect,useMemo,useState} from 'react';
import './lessonPlayer.css';
import './theoryExperience.css';
import {lessonOneHundredPractice,lessonOneHundredResponseCount,type Lesson100Practice} from './data/lessonOneHundredPractice';

type Stage={id:string;eyebrow:string;title:string;body:string;note?:string;practice?:Lesson100Practice;summary?:boolean};
type Saved={version:1;stageIndex:number;responses:Record<string,string>;checked:Record<string,boolean>;attempts:Record<string,number>};
type StageJumpDetail={lessonNumber?:number;stageIndex?:number};
const KEY='mathnikita-lesson-100-progress-v1';
const normalize=(value:string)=>value.normalize('NFKC').trim().toLocaleLowerCase('ru-RU').replace(/\s+/g,'').replace(/,/g,'.');
const answerMatches=(value:string,answers:string[])=>answers.some(answer=>normalize(value)===normalize(answer));

const conceptStages:Stage[]=[
  {id:'l100-two-step',eyebrow:'Урок 100 · § 27 · 2 из 2',title:'Сначала модель, потом вычисление',body:'В итоговых задачах § 27 ответ редко получается одним действием. Сначала определяем, что неизвестно: в № 750 нужно восстановить путь за второй час, а уже затем найти общий путь.',note:'Два действия должны отвечать двум разным вопросам условия.'},
  {id:'l100-equations',eyebrow:'Уравнения со скобками',title:'Не спеши убирать знаменатели — сначала пойми структуру',body:'В № 752 встречаются скобки и неизвестные в разных ролях. Работают обычные правила неизвестных компонентов, а одинаковые знаменатели делают арифметику прозрачной.',note:'После каждого преобразования полезно подставить найденное значение обратно.'},
  {id:'l100-part-of-whole',eyebrow:'Дробь от величины',title:'Сначала складываем доли, потом переводим их в километры или килограммы',body:'В № 754 сначала получаем 15/23 всей дороги, а затем находим 15/23 от 92 км. Смешивать эти два шага в одно действие опасно.',note:'Дробь описывает часть целого, а число с единицей измерения — реальную величину.'},
  {id:'l100-worst-case',eyebrow:'Задача на гарантию',title:'Ищи самый длинный плохой сценарий',body:'Чтобы доказать, что событие гарантировано, сначала строим максимально длинную последовательность, где оно ещё не произошло. Следующий предмет и даёт минимальную гарантию.',note:'Так в № 757 шесть шаров ещё могут быть по два каждого цвета, а седьмой уже обязательно создаст тройку.'},
  {id:'l100-check-whole',eyebrow:'Контроль смысла',title:'Сверяй дробь с единицей и исходным целым',body:'После сложения или вычитания оцени результат: меньше ли он единицы, равен ей или больше. В задачах на часть запаса это часто мгновенно обнаруживает ошибку.',note:'Единицу удобно записывать дробью с тем же знаменателем.'},
  {id:'l100-error-proof',eyebrow:'Защита от типичных ошибок',title:'Одинаковый знаменатель сохраняется на всём пути решения',body:'Даже в длинном выражении знаменатель не складывается и не вычитается. Меняются числители, а размер доли остаётся прежним.',note:'Если внезапно появился новый знаменатель без сокращения дроби, решение надо перепроверить.'},
  {id:'l100-transfer',eyebrow:'Перенос навыка',title:'Один алгоритм работает в вычислениях, уравнениях и задачах',body:'Определи одно целое, проверь одинаковые знаменатели, выполни действие с числителями, затем интерпретируй результат. Для уравнений добавь правило неизвестного компонента, для задач на гарантию — худший случай.',note:'Это и есть итоговая схема § 27.'},
  {id:'l100-ready',eyebrow:'Перед практикой',title:'Финальный маршрут § 27',body:'Тебя ждут точные № 750, № 752, № 754 и № 757, затем задания на цепочки, уравнения, доли величин, проверку относительно единицы и гарантированный результат.',note:'20 обязательных задач · ровно 50 проверяемых ответов.'}
];
const practiceStages:Stage[]=lessonOneHundredPractice.map((practice,index)=>({id:`l100-practice-${String(index+1).padStart(2,'0')}`,eyebrow:practice.source?`Учебник · ${practice.source}`:`Обязательная практика · ${index+1} из 20`,title:practice.source?`Точная задача ${practice.source}`:`Итоговая практика § 27 · ${index+1}`,body:practice.prompt,practice}));
const stages:Stage[]=[...conceptStages,...practiceStages,{id:'l100-summary',eyebrow:'Итог урока 100',title:'§ 27 полностью закрыт',body:'Ты выполняешь действия с дробями одного знаменателя, решаешь уравнения со скобками, находишь дробь от величины, строишь двухшаговые модели и умеешь доказывать минимальную гарантию через худший случай.',note:'Дальше урок 101 начинает § 28: дроби и деление натуральных чисел.',summary:true}];
export const lessonOneHundredStageCount=stages.length;
export const lessonOneHundredPracticeTaskCount=lessonOneHundredPractice.length;
export const lessonOneHundredPracticeResponseCount=lessonOneHundredResponseCount;
function loadSaved():Saved{try{const raw=localStorage.getItem(KEY);if(!raw)return{version:1,stageIndex:0,responses:{},checked:{},attempts:{}};const parsed=JSON.parse(raw) as Saved;return parsed?.version===1?parsed:{version:1,stageIndex:0,responses:{},checked:{},attempts:{}}}catch{return{version:1,stageIndex:0,responses:{},checked:{},attempts:{}}}}

export function SameDenominatorFractionSynthesisPlayer(){
  const initial=useMemo(loadSaved,[]);
  const[stageIndex,setStageIndex]=useState(()=>Math.max(0,Math.min(initial.stageIndex,stages.length-1)));
  const[responses,setResponses]=useState<Record<string,string>>(initial.responses);
  const[checked,setChecked]=useState<Record<string,boolean>>(initial.checked);
  const[attempts,setAttempts]=useState<Record<string,number>>(initial.attempts);
  const stage=stages[stageIndex];const task=stage.practice;const taskKey=stage.id;
  const taskComplete=task?task.fields.every(item=>answerMatches(responses[`${taskKey}:${item.id}`]??'',item.answers)):true;
  useEffect(()=>{localStorage.setItem(KEY,JSON.stringify({version:1,stageIndex,responses,checked,attempts} satisfies Saved))},[stageIndex,responses,checked,attempts]);
  useEffect(()=>{const handle=(event:Event)=>{const detail=(event as CustomEvent<StageJumpDetail>).detail;if(detail?.lessonNumber!==100||typeof detail.stageIndex!=='number')return;setStageIndex(Math.max(0,Math.min(Math.trunc(detail.stageIndex),stages.length-1)))};window.addEventListener('mathnikita-go-to-stage',handle);return()=>window.removeEventListener('mathnikita-go-to-stage',handle)},[]);
  function checkTask(){if(!task)return;setChecked(prev=>({...prev,[taskKey]:true}));setAttempts(prev=>({...prev,[taskKey]:(prev[taskKey]??0)+1}))}
  function move(delta:number){setStageIndex(current=>Math.max(0,Math.min(current+delta,stages.length-1)))}
  return <section className="lesson-player theory-experience" aria-label="Урок 100: итог сложения и вычитания дробей с одинаковыми знаменателями">
    <article className={`interactive-stage ${stage.summary?'stage-summary':''}`} data-stage-id={stage.id} data-stage-index={stageIndex}>
      <div className="stage-copy"><span className="stage-eyebrow">{stage.eyebrow}</span><h2>{stage.title}</h2><p>{stage.body}</p>{stage.note?<p className="theory-note">{stage.note}</p>:null}</div>
      {task?<div className="activity-area"><h3>{task.instruction}</h3><div className="answer-grid">{task.fields.map(item=>{const key=`${taskKey}:${item.id}`;return <label className="inline-answer" key={item.id}><span>{item.label}</span><input value={responses[key]??''} placeholder="Введите ответ" onChange={event=>{setResponses(prev=>({...prev,[key]:event.target.value}));setChecked(prev=>({...prev,[taskKey]:false}))}}/></label>})}</div><button className="check-button" type="button" onClick={checkTask}>Проверить</button>{checked[taskKey]?taskComplete?<div className="instant-feedback good" data-explanation={task.explanation}><b>Верно.</b><span>{task.explanation}</span></div>:<div className="instant-feedback bad" data-explanation={task.explanation}><b>Пока есть ошибка.</b><span>{attempts[taskKey]>1?task.hint:'Раздели решение на шаги и проверь роль каждого числа или дроби.'}</span></div>:null}</div>:null}
      {stage.summary?<div className="summary-card"><b>Урок 100 завершён</b><span>20 задач · 50 ответов · § 27 закрыт</span></div>:null}
    </article>
    <nav className="lesson-controls" aria-label="Навигация по этапам урока 100"><button type="button" onClick={()=>move(-1)} disabled={stageIndex===0}>← Назад</button><span>Этап {stageIndex+1} из {stages.length}</span><button type="button" onClick={()=>move(1)} disabled={stageIndex===stages.length-1}>Дальше →</button></nav>
  </section>
}
