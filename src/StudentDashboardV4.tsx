import { useEffect,useMemo,useState } from 'react';
import { skillLabels } from './data/course';
import { yearLessonByNumber } from './data/yearPlan';
import type { LearnerState } from './learningEngine';
import type { DashboardSnapshot,LessonAnalyticsRow } from './studentAnalytics';
import {
  buildPythagorasEconomy,buyPythagorasItem,consumePythagorasCoinReward,equipPythagorasItem,equippedPythagorasItems,
  nextPythagorasTarget,pythagorasCatalog,pythagorasCategoryLabel,PYTHAGORAS_UPDATED_EVENT,
  type PythagorasCategory,type PythagorasItem,
} from './studentCatEconomy';
import './studentDashboardV4.css';

type Props={snapshot:DashboardSnapshot;state:LearnerState;onContinue?:()=>void};
type ShopCategory='all'|PythagorasCategory;

function findNextLesson(snapshot:DashboardSnapshot):LessonAnalyticsRow{
  const active=[...snapshot.lessons].filter(row=>!row.completed&&row.sessions>0).sort((a,b)=>b.lessonNumber-a.lessonNumber)[0];
  const completed=snapshot.lessons.filter(row=>row.completed).map(row=>row.lessonNumber);const maxCompleted=completed.length?Math.max(...completed):0;
  const fallback=snapshot.lessons[0];if(!fallback)throw new Error('MathNikita course has no lessons');
  if(active&&active.lessonNumber>=maxCompleted)return active;
  return snapshot.lessons.find(row=>row.lessonNumber===maxCompleted+1&&!row.completed)??snapshot.lessons.find(row=>!row.completed)??snapshot.lessons[snapshot.lessons.length-1]??fallback;
}

function clamp(value:number,min=0,max=100){return Math.min(max,Math.max(min,value))}
function percent(value:number|null){return value===null?'—':`${value}%`}
function lessonType(row:LessonAnalyticsRow){return yearLessonByNumber.get(row.lessonNumber)?.lessonType}
function isControl(row:LessonAnalyticsRow){const type=lessonType(row);return type==='control'||type==='final'}

function periodAccuracy(days:DashboardSnapshot['trend']){
  const correct=days.reduce((sum,day)=>sum+day.correct,0);const wrong=days.reduce((sum,day)=>sum+day.wrong,0);const total=correct+wrong;
  return total?Math.round(correct/total*100):null;
}

function PythagorasAvatar({stage}: {stage:number}){
  return <div className={`sdv4-cat-avatar stage-${Math.min(6,Math.max(0,stage))}`} aria-label="Пифагор">
    <svg viewBox="0 0 180 170" role="img" aria-hidden="true">
      <path className="cat-body" d="M53 146c4-31 19-48 38-48s34 17 37 48H53Z"/>
      <path className="cat-tail" d="M126 132c31-6 35 19 15 24-12 3-20-5-18-13"/>
      <path className="cat-ear" d="M50 54 57 15l31 30M130 54l-7-39-31 30"/>
      <ellipse className="cat-face" cx="90" cy="72" rx="53" ry="48"/>
      <ellipse className="cat-muzzle" cx="90" cy="88" rx="23" ry="17"/>
      <ellipse className="cat-eye" cx="70" cy="68" rx="7" ry="10"/><ellipse className="cat-eye" cx="110" cy="68" rx="7" ry="10"/>
      <circle className="cat-eye-light" cx="72" cy="65" r="2"/><circle className="cat-eye-light" cx="112" cy="65" r="2"/>
      <path className="cat-nose" d="m85 82 5 5 5-5Z"/>
      <path className="cat-mouth" d="M90 87c-2 8-9 9-13 7m13-7c2 8 9 9 13 7"/>
      <path className="cat-medal" d="M78 117h24l-4 26H82Z"/>
      {stage>=2&&<path className="cat-glasses" d="M57 64h24v15H57Zm42 0h24v15H99ZM81 70h18"/>}
      {stage>=4&&<path className="cat-crown" d="m67 28 8-13 15 12 15-12 8 13v10H67Z"/>}
    </svg>
  </div>
}

export function StudentDashboardV4({snapshot,state,onContinue}:Props){
  const next=findNextLesson(snapshot);
  const[economyRevision,setEconomyRevision]=useState(0);
  const[shopOpen,setShopOpen]=useState(false);
  const[shopCategory,setShopCategory]=useState<ShopCategory>('all');
  const[shopNotice,setShopNotice]=useState('');
  const[coinReward,setCoinReward]=useState(0);
  const economy=useMemo(()=>buildPythagorasEconomy(snapshot),[snapshot,economyRevision]);
  const target=useMemo(()=>nextPythagorasTarget(snapshot),[snapshot,economyRevision]);
  const equipped=useMemo(()=>equippedPythagorasItems(economy),[economy]);

  useEffect(()=>{
    const refresh=()=>setEconomyRevision(value=>value+1);
    window.addEventListener(PYTHAGORAS_UPDATED_EVENT,refresh);
    return()=>window.removeEventListener(PYTHAGORAS_UPDATED_EVENT,refresh);
  },[]);
  useEffect(()=>{
    const reward=consumePythagorasCoinReward(snapshot);if(reward>0)setCoinReward(reward);
  },[snapshot.completedLessons,snapshot.correct,snapshot.wrong,snapshot.hints,snapshot.recoveredErrors,snapshot]);

  const startLesson=(row:LessonAnalyticsRow)=>{localStorage.setItem('mathnikita-selected-lesson',String(row.lessonNumber));onContinue?.()};
  const routeStart=Math.max(1,next.lessonNumber-3);const routeEnd=Math.min(snapshot.readyLessons,next.lessonNumber+2);
  const route=snapshot.lessons.filter(row=>row.lessonNumber>=routeStart&&row.lessonNumber<=routeEnd);
  const currentUnit=yearLessonByNumber.get(next.lessonNumber)?.unit??next.paragraph??'Текущая тема';
  const currentUnitRows=snapshot.lessons.filter(row=>(yearLessonByNumber.get(row.lessonNumber)?.unit??row.paragraph)===currentUnit);
  const currentUnitDone=currentUnitRows.filter(row=>row.completed).length;
  const currentUnitProgress=currentUnitRows.length?Math.round(currentUnitDone/currentUnitRows.length*100):0;

  const last7=snapshot.trend.slice(-7);const previous7=snapshot.trend.slice(0,7);
  const recentAccuracy=periodAccuracy(last7);const previousAccuracy=periodAccuracy(previous7);
  const accuracyDelta=recentAccuracy!==null&&previousAccuracy!==null?recentAccuracy-previousAccuracy:null;
  const independence=snapshot.correct?Math.round(snapshot.firstTryCorrect/snapshot.correct*100):null;
  const skillRows=Object.entries(state.skills).map(([id,skill])=>({id,label:skillLabels[id as keyof typeof skillLabels]??id,mastery:skill.mastery,needsReview:skill.needsReview}));
  const targetProgress=target?clamp(economy.balance/target.price*100):100;
  const stageProgress=economy.nextStage?clamp((snapshot.completedLessons-economy.stage.minLessons)/(economy.nextStage.minLessons-economy.stage.minLessons)*100):100;
  const shopItems=shopCategory==='all'?pythagorasCatalog:pythagorasCatalog.filter(item=>item.category===shopCategory);

  const handleBuy=(item:PythagorasItem)=>{
    const result=buyPythagorasItem(item.id,snapshot);setShopNotice(result.message);setEconomyRevision(value=>value+1);
  };
  const handleEquip=(item:PythagorasItem)=>{
    const result=equipPythagorasItem(item.id);setShopNotice(result.message);setEconomyRevision(value=>value+1);
  };

  return <main className="student-dashboard-v4">
    <header className="sdv4-topbar">
      <div className="sdv4-brand"><b>MathNikita</b><span>{snapshot.completedLessons} / 175 уроков</span></div>
      <div className="sdv4-course-progress" aria-label={`Пройдено ${snapshot.courseProgress}% курса`}><i><em style={{width:`${snapshot.courseProgress}%`}}/></i><span>{snapshot.courseProgress}%</span></div>
      <button className="sdv4-coins" type="button" onClick={()=>setShopOpen(true)} aria-label={`Монеты Пифагора: ${economy.balance}`}><span>●</span><b>{economy.balance}</b><small>монет</small></button>
      <div className="sdv4-user"><b>Никита</b><span>ученик</span></div>
    </header>

    <section className="sdv4-primary">
      <article className="sdv4-today">
        <span className="sdv4-eyebrow">Сегодня · урок {next.lessonNumber}</span>
        <h1>{next.title}</h1>
        <div className="sdv4-lesson-meta"><span>≈ 10–15 минут</span><span>{currentUnit}</span></div>
        <div className="sdv4-topic-progress"><div><span>Тема</span><b>{currentUnitDone} / {currentUnitRows.length||1}</b></div><i><em style={{width:`${currentUnitProgress}%`}}/></i></div>
        <button className="sdv4-continue" type="button" onClick={()=>startLesson(next)}>{next.sessions>0?'Продолжить урок':'Начать урок'} <b>→</b></button>
      </article>

      <article className="sdv4-pythagoras">
        <div className="sdv4-cat-main"><PythagorasAvatar stage={economy.stage.id}/><div><span>Пифагор растёт вместе с тобой</span><h2>{economy.stage.title}</h2><p>{economy.nextStage?`До этапа «${economy.nextStage.title}»: ${Math.max(0,economy.nextStage.minLessons-snapshot.completedLessons)} уроков`:'Максимальный этап развития'}</p></div></div>
        <div className="sdv4-cat-stage"><i><em style={{width:`${stageProgress}%`}}/></i></div>
        <div className="sdv4-cat-gear">{equipped.length?<>{equipped.map(item=><span key={item.id} title={item.title}>{item.icon} {item.title}</span>)}</>:<span>Апгрейдов пока нет</span>}</div>
        {target&&<div className="sdv4-cat-target"><div><span>Следующая цель</span><b>{target.icon} {target.title}</b><small>{economy.balance} / {target.price} монет</small></div><i><em style={{width:`${targetProgress}%`}}/></i></div>}
        <button className="sdv4-shop-button" type="button" onClick={()=>setShopOpen(true)}>Апгрейды Пифагора <b>→</b></button>
      </article>
    </section>

    <section className="sdv4-route" aria-label="Ближайшие уроки">
      <header><div><span>Твой маршрут</span><h2>Ближайшие шаги</h2></div><b>{currentUnit}</b></header>
      <div className="sdv4-route-line">{route.map(row=>{const current=row.lessonNumber===next.lessonNumber;const control=isControl(row);return <button type="button" key={row.lessonNumber} className={`${row.completed?'is-done ':''}${current?'is-current ':''}${control?'is-control':''}`} onClick={()=>startLesson(row)}><i>{row.completed?'✓':control?'★':row.lessonNumber}</i><span>{row.lessonNumber}</span><small>{row.title}</small></button>})}</div>
    </section>

    <section className="sdv4-two-column">
      <article className="sdv4-growth">
        <header><span>Мой рост</span><h2>Что реально изменилось</h2></header>
        <div className="sdv4-growth-grid">
          <div><span>Точность за 7 дней</span><b>{percent(recentAccuracy)}</b><small className={accuracyDelta!==null&&accuracyDelta>0?'is-up':accuracyDelta!==null&&accuracyDelta<0?'is-down':''}>{accuracyDelta===null?'Недостаточно данных':`${accuracyDelta>0?'+':''}${accuracyDelta} п.п. к прошлой неделе`}</small></div>
          <div><span>С первой попытки</span><b>{percent(independence)}</b><small>из всех верных ответов</small></div>
          <div><span>Ошибок исправлено</span><b>{snapshot.recoveredErrors}</b><small>дошёл до правильного ответа</small></div>
          <div><span>Учебных дней</span><b>{snapshot.studyDaysLast7}</b><small>за последние 7 дней</small></div>
        </div>
      </article>

      <article className="sdv4-skills">
        <header><span>Мои навыки</span><h2>Что уже получается</h2></header>
        <div>{skillRows.map(skill=><section className={skill.needsReview?'needs-review':''} key={skill.id}><div><b>{skill.label}</b><span>{skill.mastery}%</span></div><i><em style={{width:`${skill.mastery}%`}}/></i></section>)}</div>
      </article>
    </section>

    <details className="sdv4-all-lessons">
      <summary>Все уроки и результаты <span>{snapshot.completedLessons} пройдено</span></summary>
      <div className="sdv4-lesson-list">{snapshot.lessons.map(row=><button type="button" key={row.lessonNumber} onClick={()=>startLesson(row)} className={row.lessonNumber===next.lessonNumber?'is-current':''}><b>{row.lessonNumber}</b><span>{row.title}</span><small>{row.completed?`✓ ${percent(row.accuracy)}`:row.sessions?'В процессе':'Не начат'}</small></button>)}</div>
    </details>

    {shopOpen&&<div className="sdv4-modal-backdrop" role="dialog" aria-modal="true" aria-label="Апгрейды Пифагора">
      <section className="sdv4-shop">
        <header><div><span>Пифагор · {economy.stage.title}</span><h2>Апгрейды</h2><p>Монеты выдаются за завершённые уроки, качество, самостоятельность и исправленные ошибки.</p></div><div className="sdv4-shop-balance"><small>Баланс</small><b>● {economy.balance}</b></div><button type="button" onClick={()=>{setShopOpen(false);setShopNotice('')}} aria-label="Закрыть">×</button></header>
        <nav>{(['all','style','gadget','transport','room','development'] as ShopCategory[]).map(category=><button type="button" className={shopCategory===category?'active':''} onClick={()=>setShopCategory(category)} key={category}>{category==='all'?'Все':pythagorasCategoryLabel(category)}</button>)}</nav>
        {shopNotice&&<div className="sdv4-shop-notice">{shopNotice}</div>}
        <div className="sdv4-shop-grid">{shopItems.map(item=>{const owned=economy.purchased.has(item.id);const equippedNow=economy.equipped[item.category]===item.id;const locked=economy.stage.id<item.minStage;return <article className={`${owned?'is-owned ':''}${locked?'is-locked':''}`} key={item.id}><div className="sdv4-item-icon">{item.icon}</div><span>{pythagorasCategoryLabel(item.category)}</span><h3>{item.title}</h3><p>{item.description}</p><footer><b>{owned?'Куплено':`● ${item.price}`}</b>{locked?<small>Откроется позже</small>:owned?<button type="button" disabled={equippedNow} onClick={()=>handleEquip(item)}>{equippedNow?'Выбрано':'Выбрать'}</button>:<button type="button" onClick={()=>handleBuy(item)}>Купить</button>}</footer></article>})}</div>
      </section>
    </div>}

    {coinReward>0&&<div className="sdv4-coin-reward" role="dialog" aria-modal="true" aria-label="Награда за учёбу"><section><span>Награда за прогресс</span><div>●</div><h2>+{coinReward} монет</h2><p>Монеты начислены за реальный результат в уроках. Их можно потратить на развитие Пифагора.</p>{target&&<small>До «{target.title}» сейчас {Math.max(0,target.price-economy.balance)} монет.</small>}<button type="button" onClick={()=>setCoinReward(0)}>Забрать</button></section></div>}
  </main>;
}
