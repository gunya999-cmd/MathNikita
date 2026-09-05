import {useEffect,useMemo,useState} from 'react';
import './lessonPlayer.css';
import './theoryExperience.css';
import {lessonNinetyFivePractice,lessonNinetyFiveResponseCount,type Lesson95Practice} from './data/lessonNinetyFivePractice';

type Stage={id:string;eyebrow:string;title:string;body:string;note?:string;practice?:Lesson95Practice;summary?:boolean};
type Saved={version:1;stageIndex:number;responses:Record<string,string>;checked:Record<string,boolean>;attempts:Record<string,number>};
type StageJumpDetail={lessonNumber?:number;stageIndex?:number};

const KEY='mathnikita-lesson-95-progress-v1';
const parseNumericAnswer=(value:string)=>{const normalized=value.normalize('NFKC').trim().replace(',', '.');if(!/^[+-]?(?:\d+(?:\.\d+)?|\.\d+)$/.test(normalized))return null;const parsed=Number(normalized);return Number.isFinite(parsed)?parsed:null};
const answerMatches=(value:string,answers:string[])=>{const numericValue=parseNumericAnswer(value);return answers.some(answer=>{const numericAnswer=parseNumericAnswer(answer);return numericValue!==null&&numericAnswer!==null?numericValue===numericAnswer:value.normalize('NFKC').trim().toLocaleLowerCase('ru-RU')===answer.normalize('NFKC').trim().toLocaleLowerCase('ru-RU')})};

const conceptStages:Stage[]=[
  {id:'l95-mission',eyebrow:'Урок 95 · параграф 25 · 5 из 5',title:'У каждой дроби есть своё целое',body:'В многошаговой задаче нельзя автоматически брать каждую дробь от исходного числа. После первого действия может появиться остаток или новая величина, и именно она становится целым для следующего шага.',note:'Перед каждым вычислением проговори: «дробь от чего я сейчас нахожу?»'},
  {id:'l95-map',eyebrow:'Модель',title:'Целое → часть → остаток → новая часть',body:'Если сначала берут дробь от всего запаса, а затем дробь от остатка, решение строится цепочкой. Сначала вычисли первую часть, вычти её из целого, и только затем применяй вторую дробь к полученному остатку.',note:'Вторая дробь может иметь тот же знаменатель, но её целое уже другое.'},
  {id:'l95-dependent',eyebrow:'Модель',title:'Одна величина как дробь другой',body:'В задачах про бананы, апельсины и мандарины каждая следующая величина может зависеть от предыдущей. Сначала найди базовую величину первого шага, затем используй её как новое целое.',note:'Не перемножай дроби механически, пока не назвал величину каждого шага.'},
  {id:'l95-bridge',eyebrow:'Связь моделей',title:'Прямая задача превращается в обратную',body:'Иногда одна дробь известного числа равна дроби неизвестного. Сначала найди известную часть. После этого задача становится знакомой обратной: по известной дроби восстанови целое.',note:'Например: сначала найти три седьмых от известного числа, потом восстановить число по его двум третям.'},
  {id:'l95-sum',eyebrow:'Обратная модель',title:'Известное слагаемое — дробь всей суммы',body:'Если одно слагаемое составляет определённую дробь суммы, известное слагаемое является частью неизвестного целого. Восстанови всю сумму, затем найди второе слагаемое вычитанием.',note:'Проверка: оба слагаемых должны снова дать найденную сумму.'},
  {id:'l95-difference',eyebrow:'Обратная модель',title:'Вычитаемое или разность как часть уменьшаемого',body:'Если вычитаемое задано как дробь уменьшаемого, сначала восстанови уменьшаемое. Если дробью уменьшаемого является разность, восстанови уменьшаемое по разности и затем найди вычитаемое.',note:'Всегда подпиши, какая величина является известной дробной частью.'},
  {id:'l95-check',eyebrow:'Контроль',title:'Проверка восстанавливает исходное условие',body:'После решения пройди цепочку назад: сложи части и остаток, подставь найденное целое в исходную дробь, проверь сумму или разность. Такая обратная проверка ловит ошибку выбора целого.',note:'Если проверка не возвращает исходные данные, ошибка чаще всего появилась на смене целого.'},
  {id:'l95-ready',eyebrow:'Перед практикой',title:'Алгоритм из четырёх вопросов',body:'Первое: что сейчас является целым? Второе: какую его дробь нужно найти или какая дробь уже известна? Третье: меняется ли целое после действия? Четвёртое: каким обратным действием проверить результат?',note:'Дальше — 20 обязательных задач и ровно 50 проверяемых ответов.'}
];

const practiceStages:Stage[]=lessonNinetyFivePractice.map((practice,index)=>({id:`l95-practice-${String(index+1).padStart(2,'0')}`,eyebrow:practice.source?`Учебник · ${practice.source}`:`Обязательная практика · ${index+1} из 20`,title:practice.source?`Точная задача ${practice.source}`:`Цепочка ${index+1}`,body:practice.prompt,practice}));
const stages:Stage[]=[...conceptStages,...practiceStages,{id:'l95-summary',eyebrow:'Итог параграфа 25',title:'Дробные модели собраны в одну систему',body:'Ты различаешь исходное и промежуточное целое, умеешь брать дробь от остатка, связывать зависимые величины, переходить от прямой задачи к обратной и восстанавливать сумму или уменьшаемое по известной дробной части.',note:'Обязательная практика завершает параграф: 20 задач и ровно 50 проверяемых ответов. Следующий урок начнёт параграф 26 — правильные и неправильные дроби и сравнение дробей.',summary:true}];

export const lessonNinetyFiveStageCount=stages.length;
export const lessonNinetyFivePracticeTaskCount=lessonNinetyFivePractice.length;
export const lessonNinetyFivePracticeResponseCount=lessonNinetyFiveResponseCount;

function loadSaved():Saved{try{const raw=localStorage.getItem(KEY);if(!raw)return{version:1,stageIndex:0,responses:{},checked:{},attempts:{}};const parsed=JSON.parse(raw) as Saved;return parsed?.version===1?parsed:{version:1,stageIndex:0,responses:{},checked:{},attempts:{}}}catch{return{version:1,stageIndex:0,responses:{},checked:{},attempts:{}}}}

export function FractionSynthesisPlayer(){
  const initial=useMemo(loadSaved,[]);
  const[stageIndex,setStageIndex]=useState(()=>Math.max(0,Math.min(initial.stageIndex,stages.length-1)));
  const[responses,setResponses]=useState<Record<string,string>>(initial.responses);
  const[checked,setChecked]=useState<Record<string,boolean>>(initial.checked);
  const[attempts,setAttempts]=useState<Record<string,number>>(initial.attempts);
  const stage=stages[stageIndex];
  const task=stage.practice;
  const taskKey=stage.id;
  const taskComplete=task?task.fields.every(field=>answerMatches(responses[`${taskKey}:${field.id}`]??'',field.answers)):true;

  useEffect(()=>{localStorage.setItem(KEY,JSON.stringify({version:1,stageIndex,responses,checked,attempts} satisfies Saved))},[stageIndex,responses,checked,attempts]);
  useEffect(()=>{const handle=(event:Event)=>{const detail=(event as CustomEvent<StageJumpDetail>).detail;if(detail?.lessonNumber!==95||typeof detail.stageIndex!=='number')return;setStageIndex(Math.max(0,Math.min(Math.trunc(detail.stageIndex),stages.length-1)))};window.addEventListener('mathnikita-go-to-stage',handle);return()=>window.removeEventListener('mathnikita-go-to-stage',handle)},[]);

  function checkTask(){if(!task)return;setChecked(previous=>({...previous,[taskKey]:true}));setAttempts(previous=>({...previous,[taskKey]:(previous[taskKey]??0)+1}))}
  function move(delta:number){setStageIndex(current=>Math.max(0,Math.min(current+delta,stages.length-1)))}

  return <section className="lesson-player theory-experience" aria-label="Урок 95: итог параграфа 25">
    <article className={`interactive-stage ${stage.summary?'stage-summary':''}`} data-stage-id={stage.id} data-stage-index={stageIndex}>
      <div className="stage-copy">
        <span className="stage-eyebrow">{stage.eyebrow}</span>
        <h2>{stage.title}</h2>
        <p>{stage.body}</p>
        {stage.note?<p className="theory-note">{stage.note}</p>:null}
      </div>
      {task?<div className="activity-area">
        <h3>{task.instruction}</h3>
        <div className="answer-grid">
          {task.fields.map(field=>{const key=`${taskKey}:${field.id}`;return <label className="inline-answer" key={field.id}><span>{field.label}</span><input inputMode="decimal" value={responses[key]??''} placeholder="Введите ответ" onChange={event=>{const value=event.target.value;setResponses(previous=>({...previous,[key]:value}));setChecked(previous=>({...previous,[taskKey]:false}))}}/></label>})}
        </div>
        <button className="check-button" type="button" onClick={checkTask}>Проверить</button>
        {checked[taskKey]?taskComplete?<div className="instant-feedback good" data-explanation={task.explanation}><b>Верно.</b><span>{task.explanation}</span></div>:<div className="instant-feedback bad" data-explanation={task.explanation}><b>Пока есть ошибка.</b><span>{attempts[taskKey]>1?task.hint:'Проверь, от какого целого берётся каждая дробь.'}</span></div>:null}
      </div>:null}
      {stage.summary?<div className="summary-card"><b>§ 25 завершён</b><span>20 задач · 50 ответов · переход к § 26</span></div>:null}
    </article>
    <nav className="lesson-controls" aria-label="Навигация по этапам урока 95">
      <button type="button" onClick={()=>move(-1)} disabled={stageIndex===0}>← Назад</button>
      <span>Этап {stageIndex+1} из {stages.length}</span>
      <button type="button" onClick={()=>move(1)} disabled={stageIndex===stages.length-1}>Дальше →</button>
    </nav>
  </section>
}
