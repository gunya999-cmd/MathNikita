import { useEffect, useMemo, useState, type CSSProperties, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import './mentorMarkerOverlay.css';
import './catMentorVoice.css';

type MentorMarkerOverlayProps = {
  rootRef: RefObject<HTMLElement | null>;
  lessonNumber: number;
  mode: 'opening' | 'lesson';
  sceneKey: string;
  stageId?: string;
  title: string;
  body: string;
  prompt: string;
  action: 'welcome' | 'different' | 'example' | 'hint' | 'why';
};

function extractBounds(text: string) {
  const values = (text.match(/\d[\d\s\u00a0]*/g) ?? [])
    .map(value => Number(value.replace(/[\s\u00a0]/g, '')))
    .filter(value => Number.isFinite(value));
  const unique = values.filter((value, index) => values.indexOf(value) === index);
  if (unique.length < 2) return null;
  const [first, second] = unique;
  return first <= second ? [first, second] as const : [second, first] as const;
}

function BoardHeader({ onClose }: { onClose: () => void }) {
  return <header><div><span>Электронный маркер</span><b>Пифагор показывает ход мысли</b></div><button type="button" onClick={onClose} aria-label="Скрыть разбор">×</button></header>;
}

function LessonOneBoard({ stageId, onClose }: { stageId: string; onClose: () => void }) {
  if (stageId === 'story') return <section className="mentor-marker-overlay lesson-one-marker"><BoardHeader onClose={onClose}/><div className="marker-two-paths"><div><b>📚 📚 📚 📚 📚</b><span>считаем предметы</span><strong>5 книг</strong></div><i>и</i><div><b>▮ ▮ ▮ ▮ ▮</b><span>считаем одинаковые мерки</span><strong>5 мерок</strong></div></div><p>Действия разные, но натуральное число отвечает на вопрос «сколько?» в обеих ситуациях.</p></section>;
  if (stageId === 'count-rule') return <section className="mentor-marker-overlay lesson-one-marker"><BoardHeader onClose={onClose}/><div className="marker-counting-row">{['📘','📗','📙','📕','📓'].map((book,index)=><div key={book}><b>{book}</b><span>{index+1}</span></div>)}</div><div className="marker-rule-card"><b>1 предмет ↔ 1 число</b><span>Последнее число: 5</span><strong>Значит, всего 5 предметов</strong></div><p>Ответ верен только тогда, когда ни один предмет не пропущен и ни один не посчитан дважды.</p></section>;
  if (stageId === 'measure') return <section className="mentor-marker-overlay lesson-one-marker"><BoardHeader onClose={onClose}/><div className="marker-measure-line">{[1,2,3,4,5].map(number=><span key={number}>{number} см</span>)}</div><div className="marker-rule-card"><b>5 одинаковых мерок по 1 см</b><span>AB = 5 см</span><strong>Число зависит от выбранной мерки</strong></div><p>Тот же отрезок можно записать как 50 мм: длина не изменилась, изменилась единица измерения.</p></section>;
  if (stageId === 'natural-check' || stageId === 'quiz1') return <section className="mentor-marker-overlay lesson-one-marker"><BoardHeader onClose={onClose}/><div className="marker-set-filter"><div className="is-yes"><span>1</span><span>7</span><span>24</span><b>натуральные</b></div><div className="is-no"><span>0</span><span>½</span><span>−1</span><b>не входят</b></div></div><p>В этом курсе натуральные числа — целые положительные числа, начиная с единицы.</p></section>;
  if (stageId === 'row' || stageId === 'model' || stageId === 'quiz4') return <section className="mentor-marker-overlay lesson-one-marker"><BoardHeader onClose={onClose}/><div className="marker-infinite-row">{[1,2,3,4,5,6].map(number=><span key={number}>{number}</span>)}<b>…</b></div><div className="marker-formula-single"><span>для любого n</span><b>n → n + 1</b><strong>последнего числа нет</strong></div><p>Какое бы большое натуральное число ни выбрали, прибавление единицы создаёт ещё одно, большее число.</p></section>;
  if (stageId === 'previous-one' || stageId === 'input' || stageId === 'quiz3') return <section className="mentor-marker-overlay lesson-one-marker"><BoardHeader onClose={onClose}/><div className="marker-previous-row"><i>нет натурального</i><b>1</b><span>2</span><span>3</span><span>4</span></div><div className="marker-formula-single"><span>для числа больше 1</span><b>n → n − 1</b><strong>но у 1 предыдущего нет</strong></div><p>Ноль не входит в натуральный ряд этого курса, поэтому единица является первым числом.</p></section>;
  if (stageId === 'counterexample') return <section className="mentor-marker-overlay lesson-one-marker"><BoardHeader onClose={onClose}/><div className="marker-counterexample"><div><b>99</b><span>первая цифра 9</span></div><strong>&lt;</strong><div><b>100</b><span>первая цифра 1</span></div></div><div className="marker-strike">«Больше первая цифра → больше число»</div><p>Один конкретный случай, где правило не работает, полностью опровергает утверждение со словом «всегда».</p></section>;
  if (stageId === 'choice' || stageId === 'quiz2') return <section className="mentor-marker-overlay lesson-one-marker"><BoardHeader onClose={onClose}/><div className="marker-formula-single"><span>следующее число</span><b>39 + 1 = 40</b><strong>один шаг вправо</strong></div><p>Правило не меняется при переходе через десяток или разряд: всегда прибавляем единицу.</p></section>;
  if (stageId === 'compare' || stageId === 'order' || stageId === 'quiz5') return <section className="mentor-marker-overlay lesson-one-marker"><BoardHeader onClose={onClose}/><div className="marker-order-row"><span>7</span><span>9</span><span>14</span><span>21</span><b>→ больше</b></div><p>На числовом луче движение вправо означает увеличение. Для сортировки каждый раз выбирай наименьшее из оставшихся чисел.</p></section>;
  if (stageId === 'numberline') return <section className="mentor-marker-overlay lesson-one-marker"><BoardHeader onClose={onClose}/><div className="marker-unit-steps">{Array.from({length:7},(_,index)=><span key={index} className={index===6?'is-target':''}>{index}</span>)}</div><p>Координата 6 означает шесть единичных шагов от начала луча — от нуля вправо.</p></section>;
  if (stageId === 'bounds') return <section className="mentor-marker-overlay lesson-one-marker"><BoardHeader onClose={onClose}/><div className="marker-inequality"><span className="excluded">4</span><span>5</span><span>6</span><span>7</span><span className="included">8</span></div><div className="marker-rule-card"><b>4 &lt; x</b><span>4 исключаем</span><strong>x ≤ 8 — число 8 включаем</strong></div><p>Итоговый набор натуральных решений: 5, 6, 7, 8.</p></section>;
  if (stageId === 'challenge') return <section className="mentor-marker-overlay lesson-one-marker"><BoardHeader onClose={onClose}/><div className="marker-pigeonhole"><div><b>370</b><span>учеников</span></div><strong>&gt;</strong><div><b>366</b><span>дат</span></div></div><div className="marker-formula-single"><span>объектов больше, чем ящиков</span><b>370 − 366 = 4</b><strong>повторение обязательно</strong></div><p>После распределения по одному ученику на каждую дату останутся ещё четыре ученика, поэтому совпадение неизбежно.</p></section>;
  return null;
}

export function MentorMarkerOverlay({rootRef,lessonNumber,mode,sceneKey,stageId='',title,body,prompt,action}:MentorMarkerOverlayProps){
  const [mountNode,setMountNode]=useState<HTMLElement|null>(null);
  const [dismissed,setDismissed]=useState(false);
  useEffect(()=>{const root=rootRef.current;if(!root)return;const refresh=()=>{const next=root.querySelector<HTMLElement>('.lesson-runtime:not([hidden]) .interactive-stage');setMountNode(previous=>previous===next?previous:next)};refresh();const observer=new MutationObserver(refresh);observer.observe(root,{subtree:true,childList:true,attributes:true,attributeFilter:['class','hidden','data-stage-id']});return()=>observer.disconnect()},[rootRef,lessonNumber,mode]);
  useEffect(()=>setDismissed(false),[sceneKey,action]);
  const data=useMemo(()=>{const text=`${prompt} ${title} ${body}`;const isRelevant=/между|границ|промежут|включительно/i.test(text);const bounds=extractBounds(`${prompt} ${title}`)??extractBounds(body);if(!isRelevant||!bounds)return null;const[left,right]=bounds;const difference=right-left;if(difference<=0)return null;const inclusive=/включительно/i.test(text);const result=inclusive?difference+1:Math.max(0,difference-1);const visibleNumbers=difference<=12?Array.from({length:difference+1},(_,index)=>left+index):[left,right];return{left,right,difference,inclusive,result,visibleNumbers}},[title,body,prompt]);
  const shouldShow=mode==='lesson'&&action!=='welcome'&&Boolean(mountNode)&&!dismissed;if(!shouldShow||!mountNode)return null;
  if(lessonNumber===1&&stageId){const board=<LessonOneBoard stageId={stageId} onClose={()=>setDismissed(true)}/>;return board?createPortal(board,mountNode):null}
  if(lessonNumber!==2||!data)return null;
  return createPortal(<section className={`mentor-marker-overlay marker-${action}`} aria-label="Разбор Пифагора электронным маркером"><BoardHeader onClose={()=>setDismissed(true)}/><div className="mentor-number-track" style={{'--marker-count':data.visibleNumbers.length} as CSSProperties}>{data.visibleNumbers.map((number,index)=>{const boundary=index===0||index===data.visibleNumbers.length-1;const hiddenGap=data.difference>12&&index===1;return <div key={`${number}-${index}`} className={boundary?'is-boundary':'is-between'}>{hiddenGap?<span className="marker-ellipsis">…</span>:<span>{number.toLocaleString('ru-RU')}</span>}{!boundary&&!hiddenGap?<i aria-hidden="true"/>:null}</div>})}<svg className="mentor-marker-arc" viewBox="0 0 600 90" preserveAspectRatio="none" aria-hidden="true"><path d="M18 72 C140 4 460 4 582 72"/></svg></div><div className="mentor-marker-formula"><div><span>Сначала разность</span><b>{data.right.toLocaleString('ru-RU')} − {data.left.toLocaleString('ru-RU')} = {data.difference.toLocaleString('ru-RU')}</b></div><i aria-hidden="true">↓</i><div className="is-result"><span>{data.inclusive?'Обе границы считаются':'Границы не считаются'}</span><b>{data.difference.toLocaleString('ru-RU')} {data.inclusive?'+ 1':'− 1'} = <strong>{data.result.toLocaleString('ru-RU')}</strong></b></div></div><p>{data.inclusive?'При подсчёте от одного числа до другого включительно добавляем левую границу: разность плюс один.':'Разность показывает число шагов. Чисел строго между границами на одно меньше.'}</p></section>,mountNode)
}
