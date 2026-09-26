import {useEffect,useMemo,useState} from 'react';
import {skillLabels,type SkillId} from './data/course';
import {yearLessonByNumber} from './data/yearPlan';
import type {LearnerState} from './learningEngine';
import {loadAnalyticsStore,type DashboardSnapshot,type LessonAnalyticsRow} from './studentAnalytics';
import {buildActiveErrors,saveReviewQueue} from './studentReview';
import './studentDashboardV4.css';
import './adaptiveDashboard.css';

type Props={snapshot:DashboardSnapshot;state:LearnerState;studentName?:string;studentAvatar?:string;onContinue?:()=>void;onReview?:()=>void};
type GrowthRow={id:SkillId;label:string;current:number|null;previous:number|null;delta:number|null;recentAttempts:number;totalAttempts:number};
type WowEvent={id:string;eyebrow:string;title:string;detail:string};

const TOTAL_LESSONS=175;
const DAY=86_400_000;
const skillOrder:SkillId[]=['arithmetic','fractions','wordProblems','expressions','geometry','logic'];
const skillGlyph:Record<SkillId,string>={arithmetic:'∑',expressions:'x',wordProblems:'?',fractions:'½',geometry:'△',logic:'◇',combinatorics:'⋈'};

function pluralLessons(value:number){
  const mod10=value%10;const mod100=value%100;
  if(mod10===1&&mod100!==11)return'урок';
  if(mod10>=2&&mod10<=4&&(mod100<12||mod100>14))return'урока';
  return'уроков';
}
function pluralErrors(value:number){
  const mod10=value%10;const mod100=value%100;
  if(mod10===1&&mod100!==11)return'ошибку';
  if(mod10>=2&&mod10<=4&&(mod100<12||mod100>14))return'ошибки';
  return'ошибок';
}
function formatToday(){
  const value=new Intl.DateTimeFormat('ru-RU',{weekday:'long',day:'numeric',month:'long'}).format(new Date()).replace(/^./,letter=>letter.toUpperCase());
  return value.replace(' г.','');
}
function findNextLesson(snapshot:DashboardSnapshot){
  const active=[...snapshot.lessons].filter(row=>!row.completed&&row.sessions>0).sort((a,b)=>b.lessonNumber-a.lessonNumber)[0];
  const completed=snapshot.lessons.filter(row=>row.completed).map(row=>row.lessonNumber);
  const maxCompleted=completed.length?Math.max(...completed):0;
  if(active&&active.lessonNumber>=maxCompleted)return active;
  return snapshot.lessons.find(row=>row.lessonNumber===maxCompleted+1&&!row.completed)??snapshot.lessons.find(row=>!row.completed)??snapshot.lessons[snapshot.lessons.length-1];
}
function accuracyFor(days:DashboardSnapshot['trend']){
  const correct=days.reduce((sum,day)=>sum+day.correct,0);
  const wrong=days.reduce((sum,day)=>sum+day.wrong,0);
  return correct+wrong?Math.round(correct/(correct+wrong)*100):null;
}
function attemptAccuracy(attempts:LearnerState['attempts']){
  if(!attempts.length)return null;
  const correct=attempts.filter(attempt=>attempt.correct).length;
  return Math.round(correct/attempts.length*100);
}
function buildGrowthRows(state:LearnerState):GrowthRow[]{
  const today=new Date();
  const recentCutoff=new Date(today.getFullYear(),today.getMonth(),today.getDate()-6).getTime();
  const recentEnd=new Date(today.getFullYear(),today.getMonth(),today.getDate()+1).getTime();
  const previousCutoff=new Date(today.getFullYear(),today.getMonth(),today.getDate()-13).getTime();
  const rows=(Object.entries(state.skills) as [SkillId,LearnerState['skills'][SkillId]][]).map(([id,skill])=>{
    const relevant=state.attempts.filter(attempt=>attempt.skill===id);
    const recent=relevant.filter(attempt=>{const at=new Date(attempt.createdAt).getTime();return at>=recentCutoff&&at<recentEnd});
    const previous=relevant.filter(attempt=>{const at=new Date(attempt.createdAt).getTime();return at>=previousCutoff&&at<recentCutoff});
    const previousAccuracy=attemptAccuracy(previous);
    const recentAccuracy=attemptAccuracy(recent);
    const current=recentAccuracy??(skill.attempts>0?skill.mastery:null);
    const delta=previousAccuracy!==null&&recentAccuracy!==null?recentAccuracy-previousAccuracy:null;
    return{id,label:skillLabels[id],current,previous:previousAccuracy,delta,recentAttempts:recent.length,totalAttempts:skill.attempts};
  });
  return rows.sort((a,b)=>b.recentAttempts-a.recentAttempts||b.totalAttempts-a.totalAttempts||((b.current??0)-(a.current??0))).slice(0,3);
}
function longestCorrectRun(){
  const events=loadAnalyticsStore().events.filter(event=>event.type==='answer_correct'||event.type==='answer_wrong').sort((a,b)=>a.at.localeCompare(b.at));
  let current=0;let best=0;
  for(const event of events){if(event.type==='answer_correct'){current+=1;best=Math.max(best,current)}else current=0}
  return best;
}
function catStage(progress:number){
  if(progress>=75)return'Мастер';
  if(progress>=50)return'Знаток';
  if(progress>=25)return'Исследователь';
  if(progress>=10)return'Ученик';
  return'Котёнок';
}
function buildWowEvent(accuracyDelta:number|null,weekAccuracy:number|null,previousAccuracy:number|null,record:number,distanceToControl:number,nextControl?:LessonAnalyticsRow):WowEvent|null{
  if(accuracyDelta!==null&&accuracyDelta>=8&&weekAccuracy!==null&&previousAccuracy!==null)return{id:`accuracy-${previousAccuracy}-${weekAccuracy}`,eyebrow:'Рост за неделю',title:`${previousAccuracy}% → ${weekAccuracy}%`,detail:`Точность выросла на ${accuracyDelta} п.п.`};
  if(record>=10)return{id:`record-${record}`,eyebrow:'Новый личный рубеж',title:`${record} правильных подряд`,detail:'Лучший результат без ошибки'};
  if(nextControl&&distanceToControl===1)return{id:`control-${nextControl.lessonNumber}`,eyebrow:'Следующая цель',title:'Один урок до контрольной',detail:`Контрольная №${nextControl.lessonNumber}`};
  return null;
}
function PythagorasProgress({progress}: {progress:number}){
  const bounded=Math.max(0,Math.min(100,progress));
  return <div className="sdv4-cat-progress" aria-label={`Пифагор: ${bounded}% курса`}>
    <svg viewBox="0 0 120 120" role="img" aria-label="Кот Пифагор">
      <circle className="sdv4-cat-ring-bg" cx="60" cy="60" r="52" pathLength="100"/>
      <circle className="sdv4-cat-ring" cx="60" cy="60" r="52" pathLength="100" strokeDasharray="100" strokeDashoffset={100-bounded}/>
      <path d="M39 46 29 29 48 38M81 46l10-17-19 9" className="sdv4-cat-fur"/>
      <path d="M34 50c0-19 12-31 26-31s26 12 26 31v20c0 17-11 29-26 29S34 87 34 70Z" className="sdv4-cat-fur"/>
      <ellipse cx="50" cy="59" rx="7" ry="9" className="sdv4-cat-eye"/><ellipse cx="70" cy="59" rx="7" ry="9" className="sdv4-cat-eye"/>
      <circle cx="51" cy="60" r="3.2" className="sdv4-cat-pupil"/><circle cx="69" cy="60" r="3.2" className="sdv4-cat-pupil"/>
      <path d="m56 72 4 3 4-3M60 75q-6 8-12 2M60 75q6 8 12 2" className="sdv4-cat-face"/>
    </svg>
  </div>;
}

export function StudentDashboardV4({snapshot,state,studentName='Ученик',studentAvatar='🙂',onContinue,onReview}:Props){
  const[showCourse,setShowCourse]=useState(false);
  const[wow,setWow]=useState<WowEvent|null>(null);
  const next=findNextLesson(snapshot);
  const currentUnit=yearLessonByNumber.get(next.lessonNumber)?.unit??next.paragraph??'Курс';
  const last7=snapshot.trend.slice(-7);const previous7=snapshot.trend.slice(-14,-7);
  const weekAccuracy=accuracyFor(last7);const previousAccuracy=accuracyFor(previous7);
  const accuracyDelta=weekAccuracy!==null&&previousAccuracy!==null?weekAccuracy-previousAccuracy:null;
  const growthRows=useMemo(()=>buildGrowthRows(state),[state]);
  const activeErrors=useMemo(()=>buildActiveErrors(state),[state]);
  const record=useMemo(()=>longestCorrectRun(),[snapshot.correct,snapshot.wrong]);
  const nextControl=snapshot.lessons.find(row=>row.lessonNumber>=next.lessonNumber&&['control','final'].includes(yearLessonByNumber.get(row.lessonNumber)?.lessonType??''));
  const distanceToControl=nextControl?Math.max(0,nextControl.lessonNumber-next.lessonNumber):0;
  const nextIndex=Math.max(0,snapshot.lessons.findIndex(row=>row.lessonNumber===next.lessonNumber));
  const routeStart=Math.max(0,Math.min(snapshot.lessons.length-6,nextIndex-3));
  const route=snapshot.lessons.slice(routeStart,routeStart+6);
  const weeklyCompleted=last7.reduce((sum,day)=>sum+day.completedLessons,0);
  const stage=catStage(snapshot.courseProgress);
  const skills=skillOrder.map(id=>({id,label:skillLabels[id],skill:state.skills[id]}));
  const currentUnitRows=snapshot.lessons.filter(row=>(yearLessonByNumber.get(row.lessonNumber)?.unit??row.paragraph??'Курс')===currentUnit);
  const currentUnitCompleted=currentUnitRows.filter(row=>row.completed).length;
  const currentUnitTotal=currentUnitRows.length;
  const weakestSkill=skills.filter(({skill})=>skill.attempts>0).sort((a,b)=>a.skill.mastery-b.skill.mastery)[0];
  const latestAttempt=state.attempts.reduce<string|null>((latest,attempt)=>!latest||attempt.createdAt>latest?attempt.createdAt:latest,null);
  const inactiveDays=latestAttempt?Math.max(0,Math.floor((Date.now()-new Date(latestAttempt).getTime())/DAY)):null;
  const shouldReview=activeErrors.length>0&&((weakestSkill?.skill.mastery??100)<60||distanceToControl<=1||activeErrors.length>=3);
  const plan=shouldReview
    ?{eyebrow:'Приоритет',title:`Исправить ${Math.min(activeErrors.length,5)} ${pluralErrors(Math.min(activeErrors.length,5))}`,detail:distanceToControl<=1?'Перед контрольной лучше закрыть свежие ошибки.':`Самый слабый навык: ${weakestSkill?.label??skillLabels[activeErrors[0].skill]}.`,action:'review' as const}
    :inactiveDays!==null&&inactiveDays>=3
      ?{eyebrow:'Возвращаем ритм',title:`Продолжить с урока ${next.lessonNumber}`,detail:`Перерыв ${inactiveDays} дн. Начни с одного короткого урока.`,action:'lesson' as const}
      :{eyebrow:'Следующий шаг',title:`Урок ${next.lessonNumber}: ${next.title}`,detail:activeErrors.length?`${activeErrors.length} ${pluralErrors(activeErrors.length)} остаются в очереди повторения.`:'Активных ошибок нет — можно двигаться дальше.',action:'lesson' as const};
  const heroSignal=accuracyDelta!==null&&weekAccuracy!==null
    ?{label:'Точность за 7 дней',value:`${weekAccuracy}%`,detail:`${accuracyDelta>0?'+':''}${accuracyDelta} п.п. к прошлой неделе`}
    :weeklyCompleted>0
      ?{label:'За 7 дней',value:`${weeklyCompleted} ${pluralLessons(weeklyCompleted)}`,detail:'реально завершено'}
      :{label:'Прогресс курса',value:`${snapshot.completedLessons} / ${TOTAL_LESSONS}`,detail:`${snapshot.courseProgress}% завершено`};

  useEffect(()=>{
    const event=buildWowEvent(accuracyDelta,weekAccuracy,previousAccuracy,record,distanceToControl,nextControl);
    if(!event)return;
    try{
      const key='mathnikita:dashboard-wow:v2';
      const seen=JSON.parse(localStorage.getItem(key)??'[]') as string[];
      if(seen.includes(event.id))return;
      localStorage.setItem(key,JSON.stringify([...seen.slice(-19),event.id]));
      setWow(event);
    }catch{setWow(event)}
  },[accuracyDelta,weekAccuracy,previousAccuracy,record,distanceToControl,nextControl?.lessonNumber]);

  const startLesson=(row:LessonAnalyticsRow)=>{
    localStorage.setItem('mathnikita-selected-lesson',String(row.lessonNumber));
    onContinue?.();
  };
  const startReview=()=>{
    if(!activeErrors.length)return;
    saveReviewQueue(activeErrors.slice(0,5).map(error=>error.taskId));
    onReview?.();
  };
  const scrollTo=(id:string)=>document.getElementById(id)?.scrollIntoView({behavior:'smooth',block:'start'});
  const openCourse=()=>{setShowCourse(true);window.setTimeout(()=>scrollTo('sdv4-course-list'),40)};

  return <div className="sdv4-shell">
    <header className="sdv4-appbar">
      <button className="sdv4-brand" type="button" onClick={()=>scrollTo('sdv4-home')} aria-label="MathNikita — главная"><span className="sdv4-brandmark">M</span><b>Math<span>Nikita</span></b></button>
      <nav className="sdv4-topnav" aria-label="Разделы кабинета">
        <button className="is-active" type="button" onClick={()=>scrollTo('sdv4-home')}>Главная</button>
        <button type="button" onClick={openCourse}>Уроки</button>
        <button type="button" onClick={()=>scrollTo('sdv4-growth')}>Прогресс</button>
      </nav>
      <div className="sdv4-profile" aria-label={`Профиль ученика ${studentName}`}><span><b>{studentName}</b><small>{stage}</small></span><div className="sdv4-mini-cat sdv4-profile-avatar" style={{fontSize:20}} aria-hidden="true">{studentAvatar}</div></div>
    </header>

    <main className="sdv4" id="sdv4-home">
      {wow&&<section className="sdv4-wow" role="status" aria-live="polite">
        <div><small>{wow.eyebrow}</small><b>{wow.title}</b><span>{wow.detail}</span></div>
        <button type="button" onClick={()=>setWow(null)} aria-label="Закрыть достижение">×</button>
      </section>}

      <section className="sdv4-adaptive-plan" aria-label="План на сегодня">
        <div><small>{plan.eyebrow}</small><h2>План на сегодня</h2><b>{plan.title}</b><p>{plan.detail}</p></div>
        {plan.action==='review'&&<div className="sdv4-plan-actions">
          <button className="is-primary" type="button" onClick={startReview}>Исправить ошибки</button>
          <button type="button" onClick={()=>startLesson(next)}>К уроку {next.lessonNumber}</button>
        </div>}
      </section>

      <div className="sdv4-dashboard">
        <section className="sdv4-hero" aria-label="Следующий урок">
          <div className="sdv4-hero-copy">
            <div className="sdv4-today"><b>Сегодня</b><small>{formatToday()}</small></div>
            <div className="sdv4-lesson-number">Урок {next.lessonNumber}</div>
            <h1>{next.title}</h1>
            <div className="sdv4-hero-meta">
              <span>≈ 10 минут</span>
              <span>{snapshot.completedLessons} из {TOTAL_LESSONS} пройдено</span>
            </div>
            {currentUnitTotal>0&&<div className="sdv4-topic-progress">
              <div><span>Тема: {currentUnit}</span><b>{currentUnitCompleted} / {currentUnitTotal}</b></div>
              <i><em style={{width:`${Math.round(currentUnitCompleted/currentUnitTotal*100)}%`}}/></i>
            </div>}
            <button className="sdv4-primary" type="button" onClick={()=>startLesson(next)}>Продолжить урок <span>→</span></button>
          </div>
          <div className="sdv4-companion">
            <PythagorasProgress progress={snapshot.courseProgress}/>
            <div><small>Пифагор · {stage}</small><b>{heroSignal.value}</b><span>{heroSignal.label}</span><p>{heroSignal.detail}</p></div>
          </div>
        </section>

        <section className="sdv4-growth" id="sdv4-growth">
          <header><div><small>Изменения и текущий уровень</small><h2>Мой рост</h2></div><span className="sdv4-period">7 дней</span></header>
          <div className="sdv4-growth-cards">{growthRows.map(row=>{
            const hasCurrent=row.current!==null;
            return <article key={row.id} className={!hasCurrent?'is-empty':''}>
              <div className="sdv4-growth-head"><span>{row.label}</span>{row.delta!==null&&<strong className={row.delta>0?'is-up':row.delta<0?'is-down':''}>{row.delta>0?'+':''}{row.delta} п.п.</strong>}</div>
              <div className="sdv4-growth-value">
                {row.previous!==null&&row.recentAttempts>0?<><small>{row.previous}%</small><i>→</i></>:null}
                <b>{hasCurrent?`${row.current}%`:'—'}</b>
              </div>
              <div className="sdv4-growth-bar"><i style={{width:hasCurrent?`${row.current}%`:'0%'}}/></div>
              <p>{row.recentAttempts>0?`${row.recentAttempts} ответов за 7 дней`:hasCurrent?'Текущий уровень':'Появится после ответов'}</p>
            </article>;
          })}</div>
          <div className="sdv4-growth-summary">
            <span>Точность недели</span><b>{weekAccuracy===null?'—':`${weekAccuracy}%`}</b>
            {accuracyDelta!==null&&<em className={accuracyDelta>0?'is-up':accuracyDelta<0?'is-down':''}>{accuracyDelta>0?'+':''}${accuracyDelta} п.п.</em>}
          </div>
        </section>

        <section className="sdv4-route" aria-label="Твой маршрут">
          <header><div><small>{currentUnit}</small><h2>Твой маршрут</h2></div><button type="button" onClick={openCourse}>Весь курс →</button></header>
          <div className="sdv4-route-track">{route.map(row=>{
            const lessonType=yearLessonByNumber.get(row.lessonNumber)?.lessonType;
            const isControl=lessonType==='control'||lessonType==='final';
            const isCurrent=row.lessonNumber===next.lessonNumber;
            return <article className={`${row.completed?'is-done ':''}${isCurrent?'is-current ':''}${isControl?'is-control':''}`} key={row.lessonNumber}>
              <div className="sdv4-route-dot">{row.completed?'✓':isControl?'⚑':row.lessonNumber}</div>
              <b>{isControl?'Контрольная':`Урок ${row.lessonNumber}`}</b><span>{row.title}</span>{isCurrent&&<small>Сейчас</small>}
            </article>;
          })}</div>
          {nextControl&&<div className="sdv4-route-goal"><span>Ближайшая цель</span><b>{distanceToControl===0?'Контрольная сегодня':`${distanceToControl} ${pluralLessons(distanceToControl)} до контрольной`}</b></div>}
        </section>

        <section className="sdv4-skills" id="sdv4-skills">
          <header><div><small>По реальным ответам</small><h2>Мои навыки</h2></div><span>{state.attempts.length} ответов</span></header>
          <div className="sdv4-skill-grid">{skills.map(({id,label,skill})=>{
            const hasData=skill.attempts>0;
            return <article key={id} className={hasData?'':'is-empty'}><i>{skillGlyph[id]}</i><div><div><b>{label}</b><strong>{hasData?`${skill.mastery}%`:'—'}</strong></div><span><em style={{width:hasData?`${skill.mastery}%`:'0%'}}/></span><small>{hasData?`${skill.attempts} ответов`:'Нет данных'}</small></div></article>;
          })}</div>
        </section>

        <section className="sdv4-motivation" id="sdv4-motivation" aria-label="Личная цель">
          <div className="sdv4-challenge-main"><small>Личный результат</small><b>{record>0?`${record} правильных подряд`:'Первый рекорд ещё впереди'}</b><span>{record>0?'Лучший результат без ошибки':'Рекорд появится после первых ответов'}</span></div>
          <div className="sdv4-challenge-stat"><small>До контрольной</small><b>{nextControl?(distanceToControl===0?'сейчас':String(distanceToControl)):'—'}</b><span>{nextControl?(distanceToControl===0?'Можно начинать':`${pluralLessons(distanceToControl)} осталось`):'Итоговый этап'}</span></div>
          <div className="sdv4-challenge-stat"><small>Курс</small><b>{snapshot.completedLessons}/{TOTAL_LESSONS}</b><span>{snapshot.courseProgress}% завершено</span></div>
        </section>
      </div>

      {activeErrors.length>0&&<section className="sdv4-errors" aria-label="Работа над ошибками">
        <header><div><small>Активная очередь</small><h2>Работа над ошибками</h2><p>Здесь остаются только ошибки, после которых ещё не было правильного ответа на то же задание.</p></div><button type="button" onClick={startReview}>Исправить {Math.min(activeErrors.length,5)}</button></header>
        <div className="sdv4-error-grid">{activeErrors.slice(0,3).map(error=><article key={error.taskId}>
          <span>{skillLabels[error.skill]}</span><b>{error.title}</b><p>{error.prompt}</p><small>Урок {error.atLesson}{error.wrongCount>1?` · ошибок: ${error.wrongCount}`:''}</small>
        </article>)}</div>
      </section>}

      {showCourse&&<section className="sdv4-course-list" id="sdv4-course-list">
        <header><div><small>Полная программа</small><h2>Все уроки</h2><p>{snapshot.completedLessons} из {TOTAL_LESSONS} пройдено</p></div><button type="button" onClick={()=>setShowCourse(false)}>Скрыть ×</button></header>
        <div className="sdv4-all-lessons-grid">{snapshot.lessons.map(row=>{
          const type=yearLessonByNumber.get(row.lessonNumber)?.lessonType;
          return <button type="button" className={`sdv4-lesson ${row.completed?'is-done ':''}${row.lessonNumber===next.lessonNumber?'is-current':''}`} key={row.lessonNumber} onClick={()=>startLesson(row)}>
            <b>{row.completed?'✓':row.lessonNumber}</b><span>{row.title}</span><small>{type==='control'||type==='final'?'Контрольная':row.completed?'Пройден':row.sessions>0?'В процессе':'Не начат'}</small>
          </button>;
        })}</div>
      </section>}
    </main>
  </div>;
}