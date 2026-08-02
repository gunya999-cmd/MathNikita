import { useEffect,useMemo,useState } from 'react';
import { skillLabels } from './data/course';
import type { LearnerState } from './learningEngine';
import { buildDashboardSnapshot,formatDashboardTime,lessonTitle,type DashboardSnapshot,type LessonAnalyticsRow } from './studentAnalytics';
import './learnerDashboard.css';

type Props={mode:'student'|'parent';state:LearnerState};

function percent(value:number|null){return value===null?'—':`${value}%`}
function completedDate(value?:string){if(!value)return'—';return new Intl.DateTimeFormat('ru-RU',{day:'numeric',month:'short'}).format(new Date(value)).replace('.','')}
function useSnapshot(){
  const[snapshot,setSnapshot]=useState<DashboardSnapshot>(()=>buildDashboardSnapshot());
  useEffect(()=>{
    const refresh=()=>setSnapshot(buildDashboardSnapshot());
    window.addEventListener('mathnikita-analytics-updated',refresh);window.addEventListener('storage',refresh);
    return()=>{window.removeEventListener('mathnikita-analytics-updated',refresh);window.removeEventListener('storage',refresh)};
  },[]);
  return snapshot;
}
function ScoreRing({value,label}:{value:number;label:string}){return <div className="score-ring" style={{'--score':`${Math.max(0,Math.min(100,value))*3.6}deg`} as React.CSSProperties}><div><b>{value}</b><span>{label}</span></div></div>}
function MetricBar({label,value,caption}:{label:string;value:number;caption:string}){return <div className="metric-bar"><div><b>{label}</b><span>{value}%</span></div><i><em style={{width:`${Math.max(0,Math.min(100,value))}%`}}/></i><small>{caption}</small></div>}
function ActivityChart({snapshot}:{snapshot:DashboardSnapshot}){
  const max=Math.max(15,...snapshot.trend.map(day=>day.activeMinutes));
  return <section className="analytics-panel activity-panel"><div className="panel-heading"><div><span>Последние 14 дней</span><h2>Ритм занятий</h2></div><b>{snapshot.studyDaysLast7}/4 дня на этой неделе</b></div><div className="activity-chart" aria-label="Активное время занятий за 14 дней">{snapshot.trend.map(day=><div className="activity-column" key={day.date} title={`${day.label}: ${day.activeMinutes} мин активной работы`}><div className="activity-bar-wrap"><i style={{height:`${Math.max(day.activeMinutes?8:2,day.activeMinutes/max*100)}%`}}>{day.completedLessons?<em>{day.completedLessons}</em>:null}</i></div><small>{day.label}</small></div>)}</div><div className="chart-legend"><span><i/> активные минуты</span><span><b>1</b> завершённый урок</span></div></section>
}
function LessonTrend({rows}:{rows:LessonAnalyticsRow[]}){
  const recent=rows.filter(row=>row.completed||row.sessions>0).slice(-8);const max=Math.max(1,...recent.map(row=>Math.max(row.activeSeconds,row.screenSeconds)/60));
  return <section className="analytics-panel"><div className="panel-heading"><div><span>По урокам</span><h2>Время и точность</h2></div></div>{recent.length?<div className="lesson-trend">{recent.map(row=><div key={row.lessonNumber} className="lesson-trend-row"><span>№{row.lessonNumber}</span><div className="lesson-trend-bar"><i style={{width:`${Math.max(4,(Math.max(row.activeSeconds,row.screenSeconds)/60)/max*100)}%`}}/></div><b>{formatDashboardTime(row.activeSeconds||row.screenSeconds)}</b><em>{percent(row.accuracy)}</em></div>)}</div>:<p className="empty-analytics">После первого урока здесь появится сравнение времени и точности.</p>}</section>
}
function Rewards({snapshot}:{snapshot:DashboardSnapshot}){return <section className="analytics-panel rewards-panel"><div className="panel-heading"><div><span>Награды</span><h2>Коллекция достижений</h2></div><b>{snapshot.rewards.filter(item=>item.earned).length}/{snapshot.rewards.length}</b></div><div className="reward-grid">{snapshot.rewards.map(item=><article key={item.id} className={item.earned?'earned':''}><div className="reward-icon">{item.icon}</div><div><b>{item.title}</b><p>{item.description}</p><div className="reward-progress"><i style={{width:`${item.progress}%`}}/></div><small>{item.earned?'Получено ✓':`${item.progress}%`}</small></div></article>)}</div></section>}
function Skills({state}:{state:LearnerState}){return <section className="analytics-panel"><div className="panel-heading"><div><span>Навыки</span><h2>Карта освоения</h2></div></div><div className="analytics-skills">{Object.entries(state.skills).map(([id,skill])=><div key={id}><div><b>{skillLabels[id as keyof typeof skillLabels]}</b><span>{skill.mastery}%</span></div><i><em style={{width:`${skill.mastery}%`}}/></i><small>{skill.needsReview?'Нужно повторить':skill.mastery>=80?'Сильная сторона':'В работе'}</small></div>)}</div></section>}
function RecentLessons({snapshot,parent=false}:{snapshot:DashboardSnapshot;parent?:boolean}){
  const rows=[...snapshot.lessons].filter(row=>row.completed||row.sessions>0).sort((a,b)=>(b.completedAt??'').localeCompare(a.completedAt??'')||b.lessonNumber-a.lessonNumber).slice(0,parent?12:6);
  if(!rows.length)return <section className="analytics-panel"><div className="panel-heading"><div><span>История</span><h2>Пройденные уроки</h2></div></div><p className="empty-analytics">История появится после начала первого урока.</p></section>;
  return <section className="analytics-panel lesson-history"><div className="panel-heading"><div><span>История</span><h2>{parent?'Последние занятия':'Недавние уроки'}</h2></div></div><div className="lesson-history-table"><div className="lesson-history-head"><span>Урок</span><span>Статус</span><span>На экране</span><span>Активно</span><span>Точность</span><span>Ошибки</span></div>{rows.map(row=><div className="lesson-history-row" key={row.lessonNumber}><span><b>№{row.lessonNumber}</b><small>{row.title}</small></span><span className={row.completed?'status-done':'status-progress'}>{row.completed?'✓ Завершён':'В процессе'}<small>{completedDate(row.completedAt)}</small></span><span>{formatDashboardTime(row.screenSeconds)}</span><span>{row.hasDetailedTelemetry?formatDashboardTime(row.activeSeconds):'—'}</span><span>{percent(row.accuracy)}</span><span>{row.wrong}</span></div>)}</div></section>
}

export function LearnerDashboard({mode,state}:Props){
  const snapshot=useSnapshot();const isParent=mode==='parent';
  const nextGoal=useMemo(()=>{
    if(snapshot.studyDaysLast7<4)return`Ещё ${4-snapshot.studyDaysLast7} ${4-snapshot.studyDaysLast7===1?'день':'дня'} занятий до недельной цели`;
    if(snapshot.momentum<80)return'Поднять «Учебный импульс» до 80 — без спешки, за счёт качества и фокуса';
    return'Удержать ритм и завершить следующий урок';
  },[snapshot]);
  const attention=useMemo(()=>{
    const items:Array<{kind:'warn'|'good';title:string;text:string}>=[];
    if(snapshot.studyDaysLast7<3)items.push({kind:'warn',title:'Ритм занятий',text:`За 7 дней было ${snapshot.studyDaysLast7} активных учебных дня. Цель — 4.`});
    if(snapshot.accuracy!==null&&snapshot.accuracy<75)items.push({kind:'warn',title:'Точность',text:`Текущая точность ${snapshot.accuracy}%. Полезно повторить уроки с наибольшим числом ошибок.`});
    if(snapshot.focusRate!==null&&snapshot.focusRate<65)items.push({kind:'warn',title:'Фокус',text:`Активная работа занимает ${snapshot.focusRate}% времени на экране. Есть заметные паузы/переключения.`});
    if(snapshot.hints>Math.max(5,snapshot.correct*.35))items.push({kind:'warn',title:'Самостоятельность',text:`Подсказки использовались ${snapshot.hints} раз. Стоит проверить, в каких темах они нужны чаще.`});
    if(!items.length)items.push({kind:'good',title:'Критичных сигналов нет',text:'Ритм, точность и фокус сейчас не показывают выраженной проблемы.'});
    return items;
  },[snapshot]);
  return <main className={`learner-dashboard ${isParent?'parent-dashboard':'student-dashboard'}`}>
    <header className="analytics-hero"><div><span>{isParent?'Родительский кабинет':'Личный кабинет ученика'}</span><h1>{isParent?'Полная аналитика обучения':'Твой математический маршрут'}</h1><p>{isParent?'Все доступные данные по занятиям: прогресс, ошибки, время, фокус, подсказки и динамика.':'Здесь важен не рекорд скорости, а регулярность, понимание и умение исправлять ошибки.'}</p></div>{!isParent?<div className="level-card"><span>Уровень {snapshot.level}</span><b>{snapshot.mathPoints} MP</b><i><em style={{width:`${snapshot.levelProgress}%`}}/></i><small>до уровня {snapshot.level+1}: {Math.max(0,snapshot.nextLevelPoints-snapshot.mathPoints)} MP</small></div>:<div className="parent-data-badge"><b>{snapshot.completedLessons}</b><span>уроков завершено</span><small>{snapshot.courseProgress}% годового курса</small></div>}</header>

    <section className="analytics-score-grid">
      <article className="momentum-card"><ScoreRing value={snapshot.momentum} label="импульс"/><div><span>Главный KPI</span><h2>Учебный импульс</h2><p>Ритм 30% · качество 30% · исправление ошибок 20% · фокус 20%. Скорость не повышает показатель.</p></div></article>
      <article><span>Завершено</span><b>{snapshot.completedLessons}</b><small>из {snapshot.readyLessons} готовых · {snapshot.courseProgress}% года</small></article>
      <article><span>{isParent?'Время на экране':'Активная работа'}</span><b>{formatDashboardTime(isParent?snapshot.screenSeconds:snapshot.activeSeconds)}</b><small>{isParent?`активно ${formatDashboardTime(snapshot.activeSeconds)}`:`на экране ${formatDashboardTime(snapshot.screenSeconds)}`}</small></article>
      <article><span>Серия</span><b>{snapshot.streakDays} {snapshot.streakDays===1?'день':'дн.'}</b><small>{snapshot.studyDaysLast7}/4 учебных дня на неделе</small></article>
      <article><span>Точность</span><b>{percent(snapshot.accuracy)}</b><small>{snapshot.correct} верно · {snapshot.wrong} ошибок</small></article>
    </section>

    {!isParent?<>
      <section className="analytics-layout two-columns"><section className="analytics-panel momentum-breakdown"><div className="panel-heading"><div><span>KPI без гонки</span><h2>Из чего складывается импульс</h2></div></div><MetricBar label="Ритм" value={snapshot.rhythmScore} caption="Цель: 4 учебных дня за последние 7 дней."/><MetricBar label="Качество" value={snapshot.qualityScore} caption="Доля правильных ответов среди проверок."/><MetricBar label="Упорство" value={snapshot.persistenceScore} caption="Ошибки ценятся, если после них найден правильный ход."/><MetricBar label="Фокус" value={snapshot.focusScore} caption="Активная работа относительно времени на экране."/></section><section className="analytics-panel mission-panel"><span>Следующая миссия</span><h2>{nextGoal}</h2><p>За завершённый урок начисляется 100 MP, за верный ответ с первой попытки — 6 MP, за исправленную ошибку — 10 MP. Время само по себе очков не приносит.</p><div className="mission-stats"><div><b>{snapshot.recoveredErrors}</b><span>исправлено ошибок</span></div><div><b>{snapshot.firstTryCorrect}</b><span>с первой попытки</span></div><div><b>{snapshot.hints}</b><span>подсказок</span></div></div></section></section>
      <ActivityChart snapshot={snapshot}/><Rewards snapshot={snapshot}/><section className="analytics-layout two-columns"><LessonTrend rows={snapshot.lessons}/><Skills state={state}/></section><RecentLessons snapshot={snapshot}/>
    </>:<>
      <section className="analytics-layout two-columns"><section className="analytics-panel"><div className="panel-heading"><div><span>Сигналы</span><h2>На что обратить внимание</h2></div></div><div className="attention-list">{attention.map(item=><article className={item.kind} key={item.title}><b>{item.kind==='good'?'✓':'!'} {item.title}</b><p>{item.text}</p></article>)}</div></section><section className="analytics-panel parent-metrics"><div className="panel-heading"><div><span>Детали</span><h2>Поведение в занятиях</h2></div></div><div className="parent-metric-grid"><div><span>Фокус</span><b>{percent(snapshot.focusRate)}</b><small>активное / экранное время</small></div><div><span>Исправлено</span><b>{snapshot.recoveredErrors}</b><small>ошибок доведено до верного ответа</small></div><div><span>Подсказки</span><b>{snapshot.hints}</b><small>включая Пифагора</small></div><div><span>Пифагор</span><b>{snapshot.mentorActions}</b><small>обращений к наставнику</small></div><div><span>Озвучка</span><b>{snapshot.narrationPlays}</b><small>ручных запусков</small></div><div><span>Учебных дней</span><b>{snapshot.studyDaysLast14}</b><small>за последние 14 дней</small></div></div></section></section>
      <section className="analytics-layout two-columns"><ActivityChart snapshot={snapshot}/><LessonTrend rows={snapshot.lessons}/></section><RecentLessons snapshot={snapshot} parent/><section className="analytics-layout two-columns"><Skills state={state}/><section className="analytics-panel"><div className="panel-heading"><div><span>Журнал ошибок</span><h2>Последние ошибки</h2></div></div>{snapshot.recentErrors.length?<div className="error-journal">{snapshot.recentErrors.map(event=><article key={event.id}><b>Урок {event.lessonNumber} · {lessonTitle(event.lessonNumber)}</b><p>{event.label??'Задание'}</p><small>{new Intl.DateTimeFormat('ru-RU',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}).format(new Date(event.at))}</small></article>)}</div>:<p className="empty-analytics">Подробный журнал начнёт заполняться при следующих проверках ответов.</p>}</section></section><p className="analytics-data-note">Историческое завершение уроков и ранее накопленное время восстановлены из существующего прогресса. Подробные метрики фокуса, ошибок, подсказок и действий Пифагора собираются с момента появления нового кабинета.</p>
    </>}
  </main>;
}
