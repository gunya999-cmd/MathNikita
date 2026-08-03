import { useEffect,useState,type CSSProperties } from 'react';
import { skillLabels } from './data/course';
import type { LearnerState } from './learningEngine';
import { buildDashboardSnapshot,formatDashboardTime,lessonTitle,type DashboardSnapshot,type LessonAnalyticsRow } from './studentAnalytics';
import './learnerDashboard.css';

type Props={mode:'student'|'parent';state:LearnerState;onContinue?:()=>void};
type Insight={tone:'good'|'warn'|'neutral';eyebrow:string;title:string;text:string};

function percent(value:number|null){return value===null?'—':`${value}%`}
function completedDate(value?:string){if(!value)return'—';return new Intl.DateTimeFormat('ru-RU',{day:'numeric',month:'short'}).format(new Date(value)).replace('.','')}
function useSnapshot(){
  const[snapshot,setSnapshot]=useState<DashboardSnapshot>(()=>buildDashboardSnapshot());
  useEffect(()=>{const refresh=()=>setSnapshot(buildDashboardSnapshot());window.addEventListener('mathnikita-analytics-updated',refresh);window.addEventListener('storage',refresh);return()=>{window.removeEventListener('mathnikita-analytics-updated',refresh);window.removeEventListener('storage',refresh)}},[]);
  return snapshot;
}
function ScoreRing({value,label}:{value:number;label:string}){return <div className="ld-score-ring" style={{'--score':`${Math.max(0,Math.min(100,value))*3.6}deg`} as CSSProperties}><div><b>{value}</b><span>{label}</span></div></div>}
function SectionHeading({eyebrow,title,caption}:{eyebrow:string;title:string;caption?:string}){return <div className="ld-section-heading"><div><span>{eyebrow}</span><h2>{title}</h2></div>{caption?<p>{caption}</p>:null}</div>}

function findNextLesson(snapshot:DashboardSnapshot){
  const active=[...snapshot.lessons].filter(row=>!row.completed&&row.sessions>0).sort((a,b)=>b.lessonNumber-a.lessonNumber)[0];
  const completed=snapshot.lessons.filter(row=>row.completed).map(row=>row.lessonNumber);const maxCompleted=completed.length?Math.max(...completed):0;
  if(active&&active.lessonNumber>=maxCompleted)return active;
  return snapshot.lessons.find(row=>row.lessonNumber===maxCompleted+1&&!row.completed)??snapshot.lessons.find(row=>!row.completed)??snapshot.lessons[snapshot.lessons.length-1];
}
function recentRows(snapshot:DashboardSnapshot,count=6){
  return [...snapshot.lessons].filter(row=>row.completed||row.sessions>0).sort((a,b)=>{
    const byActivity=(b.completedAt??b.lastSeenAt??'').localeCompare(a.completedAt??a.lastSeenAt??'');
    return byActivity||b.lessonNumber-a.lessonNumber;
  }).slice(0,count);
}

function WeekStrip({snapshot}:{snapshot:DashboardSnapshot}){
  const days=snapshot.trend.slice(-7);const max=Math.max(10,...days.map(day=>day.activeMinutes));
  return <div className="ld-week-strip" aria-label="Учебная активность за последние 7 дней">{days.map(day=><div className="ld-week-day" key={day.date}><div className="ld-week-bar"><i style={{height:`${Math.max(day.activeMinutes?12:3,day.activeMinutes/max*100)}%`}}/></div><b>{day.activeMinutes?`${day.activeMinutes}м`:'—'}</b><span>{day.label}</span></div>)}</div>
}
function MiniStats({snapshot,parent=false}:{snapshot:DashboardSnapshot;parent?:boolean}){
  const items=parent?[
    ['Активное время',formatDashboardTime(snapshot.activeSeconds),`экран ${formatDashboardTime(snapshot.screenSeconds)}`],
    ['Точность',percent(snapshot.accuracy),`${snapshot.correct} верно · ${snapshot.wrong} ошибок`],
    ['Фокус',percent(snapshot.focusRate),'активная работа / экран'],
    ['Учебных дней',String(snapshot.studyDaysLast7),'за последние 7 дней'],
  ]:[
    ['На этой неделе',`${snapshot.studyDaysLast7}/4`,'учебных дня'],
    ['Точность',percent(snapshot.accuracy),`${snapshot.correct} верно`],
    ['Серия',`${snapshot.streakDays} дн.`,'без пропуска'],
    ['Исправлено',String(snapshot.recoveredErrors),'ошибок до верного ответа'],
  ];
  return <div className="ld-mini-stats">{items.map(([label,value,caption])=><article key={label}><span>{label}</span><b>{value}</b><small>{caption}</small></article>)}</div>
}
function CoursePath({snapshot,nextLesson}:{snapshot:DashboardSnapshot;nextLesson:LessonAnalyticsRow}){
  const index=Math.max(0,snapshot.lessons.findIndex(row=>row.lessonNumber===nextLesson.lessonNumber));const start=Math.max(0,Math.min(index-2,snapshot.lessons.length-5));const visible=snapshot.lessons.slice(start,start+5);
  return <div className="ld-course-path">{visible.map(row=>{const current=row.lessonNumber===nextLesson.lessonNumber;return <article key={row.lessonNumber} className={row.completed?'is-done':current?'is-current':'is-next'}><div className="ld-path-marker">{row.completed?'✓':row.lessonNumber}</div><div><span>{row.completed?'Пройден':current?'Сейчас':'Дальше'}</span><b>Урок {row.lessonNumber}</b><p>{row.title}</p></div></article>})}</div>
}
function StudentInsights({snapshot,state}:{snapshot:DashboardSnapshot;state:LearnerState}){
  const skills=Object.entries(state.skills).map(([id,skill])=>({id,label:skillLabels[id as keyof typeof skillLabels],...skill}));const weak=[...skills].sort((a,b)=>a.mastery-b.mastery)[0];const strong=[...skills].sort((a,b)=>b.mastery-a.mastery)[0];
  const insights:Insight[]=[];
  if(strong)insights.push({tone:'good',eyebrow:'Сильная сторона',title:strong.label,text:`Освоение ${strong.mastery}%. Здесь можно двигаться дальше без дополнительного повторения.`});
  if(weak)insights.push({tone:weak.needsReview?'warn':'neutral',eyebrow:weak.needsReview?'Нужно повторить':'Следующая зона роста',title:weak.label,text:`Освоение ${weak.mastery}%. Пифагор будет чаще возвращать короткие задания по этой теме.`});
  insights.push(snapshot.recoveredErrors>0?{tone:'good',eyebrow:'Упорство',title:`${snapshot.recoveredErrors} ошибок исправлено`,text:'Это хороший учебный сигнал: ошибка превращается в понимание, если после неё найден правильный ход.'}:{tone:'neutral',eyebrow:'Стратегия',title:'Не бойся ошибаться',text:'В кабинете учитывается не скорость, а качество работы и способность исправлять ошибки.'});
  return <div className="ld-insight-grid">{insights.slice(0,3).map(item=><article className={`is-${item.tone}`} key={`${item.eyebrow}-${item.title}`}><span>{item.eyebrow}</span><h3>{item.title}</h3><p>{item.text}</p></article>)}</div>
}
function RewardStrip({snapshot}:{snapshot:DashboardSnapshot}){
  const earned=snapshot.rewards.filter(item=>item.earned);const next=snapshot.rewards.filter(item=>!item.earned).sort((a,b)=>b.progress-a.progress)[0];const visible=[...earned.slice(-3),...(next?[next]:[])].slice(-4);
  return <div className="ld-reward-strip">{visible.length?visible.map(item=><article className={item.earned?'is-earned':''} key={item.id}><div>{item.icon}</div><span>{item.earned?'Получено':'Ближе всего'}</span><b>{item.title}</b><small>{item.earned?'Готово ✓':`${item.progress}%`}</small></article>):<p className="ld-empty">Первая награда появится после завершённого урока.</p>}</div>
}
function LessonHistory({snapshot,parent=false}:{snapshot:DashboardSnapshot;parent?:boolean}){
  const rows=recentRows(snapshot,parent?12:5);if(!rows.length)return <p className="ld-empty">История появится после начала первого урока.</p>;
  return <div className="ld-history">{rows.map(row=><article key={row.lessonNumber}><div className="ld-history-title"><div className={row.completed?'is-done':'is-progress'}>{row.completed?'✓':row.lessonNumber}</div><div><b>Урок {row.lessonNumber} · {row.title}</b><span>{row.completed?`Завершён ${completedDate(row.completedAt)}`:'В процессе'}</span></div></div><div className="ld-history-metrics"><span><small>Активно</small><b>{row.hasDetailedTelemetry?formatDashboardTime(row.activeSeconds):formatDashboardTime(row.screenSeconds)}</b></span><span><small>На экране</small><b>{formatDashboardTime(row.screenSeconds)}</b></span><span><small>Точность</small><b>{percent(row.accuracy)}</b></span><span><small>Ошибки</small><b>{row.wrong}</b></span></div></article>)}</div>
}
function SkillsPanel({state}:{state:LearnerState}){
  return <div className="ld-skills">{Object.entries(state.skills).map(([id,skill])=><div key={id}><div><b>{skillLabels[id as keyof typeof skillLabels]}</b><span>{skill.mastery}%</span></div><i><em style={{width:`${skill.mastery}%`}}/></i><small>{skill.needsReview?'Нужно повторить':skill.mastery>=80?'Уверенное владение':'В процессе освоения'}</small></div>)}</div>
}
function ParentAttention({snapshot,state}:{snapshot:DashboardSnapshot;state:LearnerState}){
  const weak=Object.entries(state.skills).filter(([,skill])=>skill.needsReview||skill.mastery<65).sort((a,b)=>a[1].mastery-b[1].mastery)[0];const items:Insight[]=[];
  if(snapshot.studyDaysLast7<3)items.push({tone:'warn',eyebrow:'Ритм',title:`${snapshot.studyDaysLast7} учебных дня за неделю`,text:'Для устойчивого прогресса сейчас лучше добавить ещё один короткий учебный день, а не удлинять одно занятие.'});
  if(snapshot.accuracy!==null&&snapshot.accuracy<75)items.push({tone:'warn',eyebrow:'Качество',title:`Точность ${snapshot.accuracy}%`,text:'Ниже рабочего диапазона. Ниже показаны уроки и ошибки, к которым стоит вернуться.'});
  if(snapshot.focusRate!==null&&snapshot.focusRate<65)items.push({tone:'warn',eyebrow:'Фокус',title:`Фокус ${snapshot.focusRate}%`,text:'Заметная часть экранного времени проходит без активной работы. Лучше короче, но без длинных пауз.'});
  if(weak)items.push({tone:'warn',eyebrow:'Тема риска',title:skillLabels[weak[0] as keyof typeof skillLabels],text:`Текущее освоение ${weak[1].mastery}%. Это первая тема для повторения.`});
  if(!items.length)items.push({tone:'good',eyebrow:'Статус',title:'Критичных сигналов нет',text:'Ритм, качество ответов и фокус сейчас находятся в рабочем диапазоне.'});
  return <div className="ld-parent-attention">{items.slice(0,4).map(item=><article className={`is-${item.tone}`} key={`${item.eyebrow}-${item.title}`}><span>{item.eyebrow}</span><b>{item.title}</b><p>{item.text}</p></article>)}</div>
}
function ErrorJournal({snapshot}:{snapshot:DashboardSnapshot}){
  if(!snapshot.recentErrors.length)return <p className="ld-empty">Новых ошибок в подробном журнале пока нет.</p>;
  const grouped=new Map<number,{count:number;latest:string;labels:string[]}>();for(const event of snapshot.recentErrors){const current=grouped.get(event.lessonNumber)??{count:0,latest:event.at,labels:[]};current.count+=1;if(!current.labels.includes(event.label??'Задание'))current.labels.push(event.label??'Задание');if(event.at>current.latest)current.latest=event.at;grouped.set(event.lessonNumber,current)}
  return <div className="ld-error-journal">{[...grouped.entries()].slice(0,6).map(([lessonNumber,item])=><article key={lessonNumber}><div><span>Урок {lessonNumber}</span><b>{lessonTitle(lessonNumber)}</b><p>{item.labels.slice(0,2).join(' · ')}</p></div><strong>{item.count}</strong></article>)}</div>
}

function StudentDashboard({snapshot,state,onContinue}:{snapshot:DashboardSnapshot;state:LearnerState;onContinue?:()=>void}){
  const nextLesson=findNextLesson(snapshot);const weekGoal=Math.max(0,4-snapshot.studyDaysLast7);const earned=snapshot.rewards.filter(item=>item.earned).length;
  return <>
    <section className="ld-student-hero">
      <div className="ld-student-hero-copy"><span>Личный кабинет</span><h1>{nextLesson.completed?'Все доступные уроки пройдены':`Продолжим с урока ${nextLesson.lessonNumber}`}</h1><p>{nextLesson.title}</p><button type="button" onClick={onContinue}>Продолжить обучение <b>→</b></button></div>
      <div className="ld-course-progress"><div><span>Курс</span><b>{snapshot.completedLessons}/{snapshot.readyLessons}</b></div><i><em style={{width:`${snapshot.readyLessons?Math.round(snapshot.completedLessons/snapshot.readyLessons*100):0}%`}}/></i><p>{snapshot.courseProgress}% годовой программы · {snapshot.readyLessons} уроков сейчас доступны</p></div>
      <div className="ld-momentum"><ScoreRing value={snapshot.momentum} label="импульс"/><div><span>Учебный импульс</span><b>{snapshot.momentum>=80?'Отличный ритм':snapshot.momentum>=60?'Хороший темп':'Набираем ритм'}</b><p>{weekGoal?`Ещё ${weekGoal} учебн. ${weekGoal===1?'день':'дня'} до цели недели`:'Недельная цель выполнена'}</p></div></div>
    </section>
    <MiniStats snapshot={snapshot}/>
    <section className="ld-panel ld-route-panel"><SectionHeading eyebrow="Маршрут" title="Где ты сейчас" caption="Без таблиц: пройдено → текущий урок → что дальше"/><CoursePath snapshot={snapshot} nextLesson={nextLesson}/></section>
    <section className="ld-grid ld-grid-2"><article className="ld-panel"><SectionHeading eyebrow="Эта неделя" title="Ритм занятий" caption={`${snapshot.studyDaysLast7}/4 учебных дня`}/><WeekStrip snapshot={snapshot}/></article><article className="ld-panel ld-level-panel"><SectionHeading eyebrow="Прогресс" title="Уровень и награды"/><div className="ld-level-row"><div><span>Уровень {snapshot.level}</span><b>{snapshot.mathPoints} MP</b><small>до следующего: {Math.max(0,snapshot.nextLevelPoints-snapshot.mathPoints)} MP</small></div><div className="ld-level-progress"><i><em style={{width:`${snapshot.levelProgress}%`}}/></i><span>{earned} наград получено</span></div></div><RewardStrip snapshot={snapshot}/></article></section>
    <section className="ld-panel"><SectionHeading eyebrow="Персонально" title="Что получается и что подтянуть" caption="Только три вывода, которые реально помогают двигаться дальше"/><StudentInsights snapshot={snapshot} state={state}/></section>
    <section className="ld-grid ld-grid-2"><article className="ld-panel"><SectionHeading eyebrow="Навыки" title="Карта освоения"/><SkillsPanel state={state}/></article><article className="ld-panel"><SectionHeading eyebrow="Последние занятия" title="Что уже сделано"/><LessonHistory snapshot={snapshot}/></article></section>
    <details className="ld-details"><summary>Подробная статистика</summary><div className="ld-details-grid"><div><span>Время на экране</span><b>{formatDashboardTime(snapshot.screenSeconds)}</b></div><div><span>Активная работа</span><b>{formatDashboardTime(snapshot.activeSeconds)}</b></div><div><span>Ответов с первой попытки</span><b>{snapshot.firstTryCorrect}</b></div><div><span>Подсказок</span><b>{snapshot.hints}</b></div><div><span>Обращений к Пифагору</span><b>{snapshot.mentorActions}</b></div><div><span>Озвучек</span><b>{snapshot.narrationPlays}</b></div></div></details>
  </>
}
function ParentDashboard({snapshot,state}:{snapshot:DashboardSnapshot;state:LearnerState}){
  const next=findNextLesson(snapshot);const latest=recentRows(snapshot,1)[0];
  return <>
    <section className="ld-parent-hero"><div><span>Родительский кабинет</span><h1>Обзор обучения</h1><p>Не поток сырых метрик, а состояние курса: прогресс, время, качество, самостоятельность и темы, где нужна помощь.</p></div><div className="ld-parent-summary"><span>Текущая точка</span><b>Урок {next.lessonNumber}</b><small>{next.title}</small></div></section>
    <MiniStats snapshot={snapshot} parent/>
    <section className="ld-grid ld-grid-parent"><article className="ld-panel ld-parent-priority"><SectionHeading eyebrow="Главное" title="На что обратить внимание"/><ParentAttention snapshot={snapshot} state={state}/></article><article className="ld-panel"><SectionHeading eyebrow="Последние 7 дней" title="Учебный ритм" caption={`${snapshot.studyDaysLast7} учебных дня`}/><WeekStrip snapshot={snapshot}/><div className="ld-parent-week-foot"><span>Активно <b>{formatDashboardTime(snapshot.last7ActiveSeconds)}</b></span><span>Экран <b>{formatDashboardTime(snapshot.last7ScreenSeconds)}</b></span><span>Фокус <b>{percent(snapshot.last7FocusRate)}</b></span></div></article></section>
    <section className="ld-panel ld-route-panel"><SectionHeading eyebrow="Курс" title="Продвижение по урокам" caption={`${snapshot.completedLessons} из ${snapshot.readyLessons} доступных уроков завершено`}/><CoursePath snapshot={snapshot} nextLesson={next}/></section>
    <section className="ld-grid ld-grid-2"><article className="ld-panel"><SectionHeading eyebrow="Освоение" title="Навыки и темы риска"/><SkillsPanel state={state}/></article><article className="ld-panel"><SectionHeading eyebrow="Ошибки" title="Где возникали трудности"/><ErrorJournal snapshot={snapshot}/></article></section>
    <section className="ld-panel"><SectionHeading eyebrow="История" title="Последние занятия" caption="Активное и экранное время, точность и ошибки по каждому уроку"/><LessonHistory snapshot={snapshot} parent/></section>
    <section className="ld-parent-footer"><div><span>Последнее занятие</span><b>{latest?`Урок ${latest.lessonNumber} · ${latest.title}`:'Пока нет данных'}</b><small>{latest?.completedAt?completedDate(latest.completedAt):latest?'В процессе':'История начнёт заполняться после первого урока'}</small></div><div><span>Самостоятельность</span><b>{snapshot.hints?`${snapshot.hints} подсказок`:'Без подсказок'}</b><small>{snapshot.recoveredErrors} ошибок исправлено до верного ответа</small></div><p>Подробные метрики ошибок, фокуса, подсказок и действий наставника собираются с момента появления аналитики. Историческое завершение и накопленное время восстановлены из старого прогресса.</p></section>
  </>
}

export function LearnerDashboard({mode,state,onContinue}:Props){const snapshot=useSnapshot();return <main className={`learner-dashboard dashboard-v2 ${mode==='parent'?'parent-dashboard':'student-dashboard'}`}>{mode==='student'?<StudentDashboard snapshot={snapshot} state={state} onContinue={onContinue}/>:<ParentDashboard snapshot={snapshot} state={state}/>}</main>}
