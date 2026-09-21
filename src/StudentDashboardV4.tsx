import {useMemo} from 'react';
import {yearLessonByNumber} from './data/yearPlan';
import type {DashboardSnapshot,LessonAnalyticsRow} from './studentAnalytics';
import './studentDashboardV4.css';

type Props={snapshot:DashboardSnapshot;onContinue?:()=>void};

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

function pluralLessons(value:number){
  const mod10=value%10;const mod100=value%100;
  if(mod10===1&&mod100!==11)return'урок';
  if(mod10>=2&&mod10<=4&&(mod100<12||mod100>14))return'урока';
  return'уроков';
}

function catStage(progress:number){
  if(progress>=75)return{title:'Мастер',next:100};
  if(progress>=50)return{title:'Знаток',next:75};
  if(progress>=25)return{title:'Исследователь',next:50};
  if(progress>=10)return{title:'Ученик',next:25};
  return{title:'Котёнок',next:10};
}

function lessonState(row:LessonAnalyticsRow,nextNumber:number){
  if(row.completed)return'Пройден';
  if(row.lessonNumber===nextNumber)return'Сейчас';
  if(row.sessions>0)return'В процессе';
  return'Впереди';
}

export function StudentDashboardV4({snapshot,onContinue}:Props){
  const next=findNextLesson(snapshot);
  const nextMeta=yearLessonByNumber.get(next.lessonNumber);
  const currentUnit=nextMeta?.unit??'Курс';
  const unitRows=useMemo(()=>snapshot.lessons.filter(row=>yearLessonByNumber.get(row.lessonNumber)?.unit===currentUnit),[snapshot.lessons,currentUnit]);
  const unitDone=unitRows.filter(row=>row.completed).length;
  const unitProgress=unitRows.length?Math.round(unitDone/unitRows.length*100):0;
  const nextControl=snapshot.lessons.find(row=>row.lessonNumber>=next.lessonNumber&&['control','final'].includes(yearLessonByNumber.get(row.lessonNumber)?.lessonType??''));
  const distanceToControl=nextControl?Math.max(0,nextControl.lessonNumber-next.lessonNumber):0;
  const last7=snapshot.trend.slice(-7);
  const previous7=snapshot.trend.slice(-14,-7);
  const weekAccuracy=accuracyFor(last7);
  const previousAccuracy=accuracyFor(previous7);
  const accuracyDelta=weekAccuracy!==null&&previousAccuracy!==null?weekAccuracy-previousAccuracy:null;
  const weeklyCompleted=last7.reduce((sum,day)=>sum+day.completedLessons,0);
  const nextIndex=Math.max(0,snapshot.lessons.findIndex(row=>row.lessonNumber===next.lessonNumber));
  const route=snapshot.lessons.slice(Math.max(0,nextIndex-2),Math.min(snapshot.lessons.length,nextIndex+4));
  const cat=catStage(snapshot.courseProgress);
  const nextCatLesson=Math.min(175,Math.ceil(cat.next/100*175));
  const lessonsToCat=Math.max(0,nextCatLesson-snapshot.completedLessons);
  const motivation=accuracyDelta!==null&&accuracyDelta>0
    ?`Точность за неделю выросла на ${accuracyDelta} п.п.`
    :snapshot.streakDays>=3
      ?`Ты занимаешься ${snapshot.streakDays} дней подряд.`
      :snapshot.recoveredErrors>0
        ?`Ты уже исправил ${snapshot.recoveredErrors} ошибок и дошёл до верного ответа.`
        :'Следующий маленький шаг — закончить текущий урок.';

  const startLesson=()=>{
    localStorage.setItem('mathnikita-selected-lesson',String(next.lessonNumber));
    onContinue?.();
  };

  return <main className="sdv4">
    <header className="sdv4-top">
      <div><span>MathNikita</span><h1>Твой курс</h1></div>
      <div className="sdv4-student"><b>Никита</b><span>{snapshot.streakDays>0?`${snapshot.streakDays} дней подряд`:'Сегодня можно начать серию'}</span></div>
    </header>

    <section className="sdv4-course" aria-label="Прогресс курса">
      <div className="sdv4-course-number"><b>{snapshot.completedLessons}</b><span>/ 175</span></div>
      <div className="sdv4-course-copy"><strong>уроков пройдено</strong><div className="sdv4-bar"><i style={{width:`${snapshot.courseProgress}%`}}/></div><small>{snapshot.courseProgress}% курса</small></div>
    </section>

    <section className="sdv4-main-grid">
      <article className="sdv4-next">
        <div className="sdv4-kicker">Сейчас</div>
        <div className="sdv4-next-number">Урок {next.lessonNumber}</div>
        <h2>{next.title}</h2>
        <p>{currentUnit}</p>
        <button type="button" onClick={startLesson}>Продолжить урок <span>→</span></button>
      </article>

      <aside className="sdv4-topic">
        <span>Текущая тема</span>
        <h2>{currentUnit}</h2>
        <div><b>{unitDone}</b><span>/ {unitRows.length} уроков</span></div>
        <div className="sdv4-bar"><i style={{width:`${unitProgress}%`}}/></div>
        <small>{nextControl
          ?distanceToControl===0?'Сегодня контрольная':`До контрольной ${distanceToControl} ${pluralLessons(distanceToControl)}`
          :'До конца курса осталось немного'}</small>
      </aside>
    </section>

    <section className="sdv4-route" aria-label="Ближайшие уроки">
      {route.map(row=>{
        const state=lessonState(row,next.lessonNumber);
        return <div className={`sdv4-route-item ${row.completed?'is-done ':''}${row.lessonNumber===next.lessonNumber?'is-current':''}`} key={row.lessonNumber}>
          <i>{row.completed?'✓':row.lessonNumber}</i>
          <span>{state}</span>
        </div>;
      })}
      {nextControl&&<div className="sdv4-route-goal"><span>Ближайшая цель</span><b>Контрольная №{nextControl.lessonNumber}</b></div>}
    </section>

    <section className="sdv4-growth">
      <header><div><span>Твой прогресс</span><h2>{motivation}</h2></div><small>последние 7 дней</small></header>
      <div className="sdv4-growth-grid">
        <div><span>Точность</span><b>{weekAccuracy===null?'—':`${weekAccuracy}%`}</b><small>{accuracyDelta===null?'нужно больше ответов':accuracyDelta===0?'без изменений':`${accuracyDelta>0?'↑':'↓'} ${Math.abs(accuracyDelta)} п.п.`}</small></div>
        <div><span>Пройдено</span><b>{weeklyCompleted}</b><small>{pluralLessons(weeklyCompleted)}</small></div>
        <div><span>Учебные дни</span><b>{snapshot.studyDaysLast7}</b><small>из 7</small></div>
        <div><span>Исправлено ошибок</span><b>{snapshot.recoveredErrors}</b><small>за всё время</small></div>
      </div>
    </section>

    <section className="sdv4-pythagoras">
      <div className="sdv4-cat" aria-hidden="true">🐱</div>
      <div><span>Пифагор растёт вместе с тобой</span><b>{cat.title}</b><p>{lessonsToCat>0?`Ещё ${lessonsToCat} ${pluralLessons(lessonsToCat)} до следующего этапа.`:'Следующий этап уже открыт.'}</p></div>
      <div className="sdv4-cat-progress"><i style={{width:`${Math.min(100,snapshot.courseProgress/cat.next*100)}%`}}/></div>
    </section>

    <details className="sdv4-all-lessons">
      <summary>Все уроки и подробный прогресс</summary>
      <div className="sdv4-all-lessons-grid">{snapshot.lessons.map(row=><div className={`sdv4-lesson ${row.completed?'is-done':''}`} key={row.lessonNumber}>
        <b>{row.lessonNumber}</b><span>{row.title}</span><small>{row.completed?'Пройден':row.sessions>0?'В процессе':'Не начат'}</small>
      </div>)}</div>
    </details>
  </main>;
}
