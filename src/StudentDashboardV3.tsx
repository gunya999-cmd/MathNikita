import { useMemo,useState } from 'react';
import { skillLabels } from './data/course';
import { yearLessonByNumber } from './data/yearPlan';
import type { LearnerState } from './learningEngine';
import { formatDashboardTime,type DashboardSnapshot,type LessonAnalyticsRow } from './studentAnalytics';
import './studentDashboardV3.css';

type Props={snapshot:DashboardSnapshot;state:LearnerState;onContinue?:()=>void};
type Filter='all'|'done'|'excellent'|'review';
type Quality={stars:0|1|2|3;label:string;tone:'new'|'progress'|'done'|'excellent'|'review'};

function quality(row:LessonAnalyticsRow):Quality{
  if(!row.completed)return row.sessions>0?{stars:0,label:'В процессе',tone:'progress'}:{stars:0,label:'Не начат',tone:'new'};
  if(!row.hasDetailedTelemetry||row.correct+row.wrong<5)return{stars:2,label:'Пройден',tone:'done'};
  const firstTry=row.correct?Math.round(row.firstTryCorrect/row.correct*100):0;
  if((row.accuracy??0)>=90&&firstTry>=80&&row.hints<=1)return{stars:3,label:'Уверенно',tone:'excellent'};
  if((row.accuracy??0)>=80)return{stars:2,label:'Хорошо',tone:'done'};
  if((row.accuracy??0)>=65)return{stars:1,label:'Пройден',tone:'done'};
  return{stars:0,label:'Повторить',tone:'review'};
}
function stars(count:number){return count?`${'★'.repeat(count)}${'☆'.repeat(3-count)}`:'—'}
function levelTitle(level:number){return level>=10?'Архитектор':level>=8?'Мастер':level>=6?'Стратег':level>=4?'Навигатор':level>=2?'Исследователь':'Новичок'}
function percent(value:number|null){return value===null?'—':`${value}%`}
function completedDate(value?:string){if(!value)return'—';return new Intl.DateTimeFormat('ru-RU',{day:'numeric',month:'short'}).format(new Date(value)).replace('.','')}
function findNextLesson(snapshot:DashboardSnapshot){
  const active=[...snapshot.lessons].filter(row=>!row.completed&&row.sessions>0).sort((a,b)=>b.lessonNumber-a.lessonNumber)[0];
  const completed=snapshot.lessons.filter(row=>row.completed).map(row=>row.lessonNumber);const maxCompleted=completed.length?Math.max(...completed):0;
  if(active&&active.lessonNumber>=maxCompleted)return active;
  return snapshot.lessons.find(row=>row.lessonNumber===maxCompleted+1&&!row.completed)??snapshot.lessons.find(row=>!row.completed)??snapshot.lessons[snapshot.lessons.length-1];
}

export function StudentDashboardV3({snapshot,state,onContinue}:Props){
  const next=findNextLesson(snapshot);
  const[selected,setSelected]=useState<LessonAnalyticsRow>(next);
  const[filter,setFilter]=useState<Filter>('all');
  const qualities=useMemo(()=>new Map(snapshot.lessons.map(row=>[row.lessonNumber,quality(row)])),[snapshot.lessons]);
  const excellent=snapshot.lessons.filter(row=>qualities.get(row.lessonNumber)?.stars===3).length;
  const solid=snapshot.lessons.filter(row=>row.completed&&(qualities.get(row.lessonNumber)?.stars??0)>0&&(qualities.get(row.lessonNumber)?.stars??0)<3).length;
  const review=snapshot.lessons.filter(row=>qualities.get(row.lessonNumber)?.tone==='review').length;
  const inProgress=snapshot.lessons.filter(row=>!row.completed&&row.sessions>0).length;
  const weeklyCompleted=snapshot.trend.slice(-7).reduce((sum,day)=>sum+day.completedLessons,0);
  const missions=[
    {label:'Пройти 2 урока',value:weeklyCompleted,target:2,done:weeklyCompleted>=2},
    {label:'Учиться 3 разных дня',value:snapshot.studyDaysLast7,target:3,done:snapshot.studyDaysLast7>=3},
    {label:'Исправить 3 ошибки',value:snapshot.recoveredErrors,target:3,done:snapshot.recoveredErrors>=3},
    {label:'Держать точность 80%+',value:snapshot.accuracy??0,target:80,done:(snapshot.correct+snapshot.wrong)>=10&&(snapshot.accuracy??0)>=80},
  ];
  const missionDone=missions.filter(item=>item.done).length;
  const nextReward=snapshot.rewards.filter(item=>!item.earned).sort((a,b)=>b.progress-a.progress)[0];
  const groups=useMemo(()=>{
    const map=new Map<string,LessonAnalyticsRow[]>();
    for(const row of snapshot.lessons){const unit=yearLessonByNumber.get(row.lessonNumber)?.unit??'Курс';const list=map.get(unit)??[];list.push(row);map.set(unit,list)}
    return[...map.entries()];
  },[snapshot.lessons]);
  const filtered=(row:LessonAnalyticsRow)=>filter==='all'||(filter==='done'&&row.completed)||(filter==='excellent'&&qualities.get(row.lessonNumber)?.stars===3)||(filter==='review'&&qualities.get(row.lessonNumber)?.tone==='review');
  const openLesson=(row:LessonAnalyticsRow)=>{localStorage.setItem('mathnikita-selected-lesson',String(row.lessonNumber));onContinue?.()};
  const selectedQuality=qualities.get(selected.lessonNumber)??quality(selected);
  const firstTry=selected.correct?Math.round(selected.firstTryCorrect/selected.correct*100):null;
  const skillRows=Object.entries(state.skills).map(([id,skill])=>({id,label:skillLabels[id as keyof typeof skillLabels],mastery:skill.mastery,needsReview:skill.needsReview}));

  return <main className="student-dashboard-v3">
    <section className="sdv3-hero">
      <div className="sdv3-hero-main"><span>Мой путь по математике</span><div className="sdv3-progress-number"><b>{snapshot.completedLessons}</b><i>/ 175 уроков</i></div><div className="sdv3-main-bar"><i style={{width:`${snapshot.courseProgress}%`}}/></div><p>{snapshot.courseProgress}% курса пройдено · впереди {Math.max(0,175-snapshot.completedLessons)} уроков</p></div>
      <div className="sdv3-next"><span>Сейчас</span><b>Урок {next.lessonNumber}</b><p>{next.title}</p><button type="button" onClick={()=>openLesson(next)}>Продолжить <strong>→</strong></button></div>
      <div className="sdv3-level"><div><span>Уровень {snapshot.level}</span><b>{levelTitle(snapshot.level)}</b><small>{snapshot.mathPoints} XP</small></div><div className="sdv3-level-bar"><i style={{width:`${snapshot.levelProgress}%`}}/></div><p>До следующего уровня: {Math.max(0,snapshot.nextLevelPoints-snapshot.mathPoints)} XP</p></div>
    </section>

    <section className="sdv3-status-grid" aria-label="Статус курса">
      <article><span>★★★</span><b>{excellent}</b><small>уверенно освоено</small></article>
      <article><span>✓</span><b>{solid}</b><small>пройдено</small></article>
      <article className="is-review"><span>↻</span><b>{review}</b><small>нужно закрепить</small></article>
      <article><span>▶</span><b>{inProgress||next.lessonNumber}</b><small>{inProgress?'уроков в процессе':`текущий урок №${next.lessonNumber}`}</small></article>
    </section>

    <section className="sdv3-grid sdv3-grid-top">
      <article className="sdv3-card sdv3-mission"><header><div><span>Цель недели</span><h2>Миссия недели</h2></div><b>{missionDone}/4</b></header><div className="sdv3-mission-list">{missions.map(item=><div className={item.done?'is-done':''} key={item.label}><i>{item.done?'✓':'○'}</i><span>{item.label}</span><b>{item.done?'Готово':`${Math.min(item.value,item.target)}/${item.target}`}</b></div>)}</div><footer>{missionDone===4?'Миссия выполнена. Можно идти за новым личным рекордом.':`Осталось выполнить ${4-missionDone} ${4-missionDone===1?'цель':'цели'}.`}</footer></article>
      <article className="sdv3-card sdv3-streak"><span>Ритм</span><div className="sdv3-streak-number">🔥 <b>{snapshot.streakDays}</b><small>дней подряд</small></div><p>{snapshot.studyDaysLast7}/4 учебных дня на этой неделе</p><div className="sdv3-week-dots">{snapshot.trend.slice(-7).map(day=><i className={day.activeMinutes>=5||day.completedLessons>0?'is-active':''} key={day.date} title={`${day.label}: ${day.activeMinutes} мин`}>{day.label.slice(0,1)}</i>)}</div></article>
      <article className="sdv3-card sdv3-next-reward"><span>Следующее достижение</span>{nextReward?<><div className="sdv3-reward-icon">{nextReward.icon}</div><h2>{nextReward.title}</h2><p>{nextReward.description}</p><div className="sdv3-reward-bar"><i style={{width:`${nextReward.progress}%`}}/></div><small>{nextReward.progress}% готово</small></>:<><div className="sdv3-reward-icon">🏆</div><h2>Все достижения собраны</h2></>}</article>
    </section>

    <section className="sdv3-card sdv3-world">
      <header><div><span>Карта курса</span><h2>Математический мир</h2><p>Весь путь из 175 уроков. Контрольные — это Boss Level.</p></div><div className="sdv3-map-legend"><span><i className="excellent"/> уверенно</span><span><i className="done"/> пройден</span><span><i className="review"/> повторить</span><span><i className="new"/> впереди</span></div></header>
      <div className="sdv3-world-strip">{groups.map(([unit,rows],index)=>{const done=rows.filter(row=>row.completed).length;const current=rows.some(row=>row.lessonNumber===next.lessonNumber);return <article className={current?'is-current':''} key={unit}><div className="sdv3-world-icon">{index===0?'🏘':index===1?'🏰':index===2?'⚙':index===3?'◐':index===4?'🔬':index===5?'🚀':'🏆'}</div><b>{unit.replace(/^Глава \d+\.\s*/,'')}</b><span>{done}/{rows.length}</span><i><em style={{width:`${rows.length?done/rows.length*100:0}%`}}/></i></article>})}</div>
    </section>

    <section className="sdv3-grid sdv3-grid-middle">
      <article className="sdv3-card"><header className="sdv3-simple-head"><div><span>Мои способности</span><h2>Мои математические силы</h2></div></header><div className="sdv3-skills">{skillRows.map(skill=>{const power=Math.max(1,Math.min(5,Math.ceil(skill.mastery/20)));return <div className={skill.needsReview?'needs-review':''} key={skill.id}><div><b>{skill.label}</b><span>{'◆'.repeat(power)}{'◇'.repeat(5-power)}</span></div><i><em style={{width:`${skill.mastery}%`}}/></i><small>{skill.needsReview?'Следующая зона роста':skill.mastery>=80?'Сильная сторона':'Прокачивается'} · {skill.mastery}%</small></div>})}</div></article>
      <article className="sdv3-card sdv3-week-recap"><span>Твоя неделя</span><h2>{weeklyCompleted?`+${weeklyCompleted} ${weeklyCompleted===1?'урок':'урока'}`:'Начни первый урок недели'}</h2><div><p><b>{snapshot.correct}</b><span>верных ответов всего</span></p><p><b>{snapshot.recoveredErrors}</b><span>ошибок исправлено</span></p><p><b>{snapshot.studyDaysLast7}</b><span>учебных дней</span></p><p><b>{percent(snapshot.accuracy)}</b><span>точность</span></p></div><footer>{review?`Главная цель: закрепить ${review} ${review===1?'урок':'урока'} с пробелами.`:'Уроков с критичным статусом сейчас нет.'}</footer></article>
    </section>

    <section className="sdv3-card sdv3-lessons">
      <header><div><span>Весь курс</span><h2>Все 175 уроков</h2><p>Найди любой урок и сразу увидь, как он был пройден.</p></div><div className="sdv3-filters"><button className={filter==='all'?'active':''} onClick={()=>setFilter('all')}>Все</button><button className={filter==='done'?'active':''} onClick={()=>setFilter('done')}>Пройдено</button><button className={filter==='excellent'?'active':''} onClick={()=>setFilter('excellent')}>★★★</button><button className={filter==='review'?'active':''} onClick={()=>setFilter('review')}>Повторить</button></div></header>
      <div className="sdv3-course-layout"><div className="sdv3-units">{groups.map(([unit,rows])=>{const visible=rows.filter(filtered);if(!visible.length)return null;return <section key={unit}><header><b>{unit}</b><span>{rows.filter(row=>row.completed).length}/{rows.length}</span></header><div className="sdv3-node-grid">{visible.map(row=>{const meta=yearLessonByNumber.get(row.lessonNumber);const q=qualities.get(row.lessonNumber)!;const boss=meta?.lessonType==='control'||meta?.lessonType==='final';return <button type="button" className={`sdv3-lesson-node is-${q.tone} ${boss?'is-boss':''} ${selected.lessonNumber===row.lessonNumber?'is-selected':''}`} onClick={()=>setSelected(row)} key={row.lessonNumber} aria-label={`Урок ${row.lessonNumber}: ${row.title}`}><b>{boss?'♛':row.lessonNumber}</b><span>{boss?`№${row.lessonNumber}`:stars(q.stars)}</span></button>})}</div></section>})}</div>
        <aside className="sdv3-lesson-detail"><span>Урок {selected.lessonNumber}</span><h3>{selected.title}</h3><div className={`sdv3-quality is-${selectedQuality.tone}`}><b>{selectedQuality.stars?stars(selectedQuality.stars):selectedQuality.tone==='review'?'↻':'▶'}</b><span>{selectedQuality.label}</span></div><dl><div><dt>Статус</dt><dd>{selected.completed?`Завершён ${completedDate(selected.completedAt)}`:selected.sessions?'В процессе':'Не начат'}</dd></div><div><dt>Точность</dt><dd>{percent(selected.accuracy)}</dd></div><div><dt>С первой попытки</dt><dd>{percent(firstTry)}</dd></div><div><dt>Ошибки</dt><dd>{selected.wrong}</dd></div><div><dt>Исправлено</dt><dd>{selected.recoveredErrors}</dd></div><div><dt>Активная работа</dt><dd>{formatDashboardTime(selected.hasDetailedTelemetry?selected.activeSeconds:selected.screenSeconds)}</dd></div></dl><button type="button" onClick={()=>openLesson(selected)}>{selected.completed?'Открыть урок для повторения':'Перейти к уроку'} <b>→</b></button></aside>
      </div>
    </section>

    <details className="sdv3-details"><summary>Подробная статистика</summary><div><span>Экран <b>{formatDashboardTime(snapshot.screenSeconds)}</b></span><span>Активная работа <b>{formatDashboardTime(snapshot.activeSeconds)}</b></span><span>С первой попытки <b>{snapshot.firstTryCorrect}</b></span><span>Подсказок <b>{snapshot.hints}</b></span><span>Обращений к Пифагору <b>{snapshot.mentorActions}</b></span></div></details>
  </main>
}
