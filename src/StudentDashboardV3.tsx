import { useEffect,useMemo,useState } from 'react';
import { skillLabels } from './data/course';
import { yearLessonByNumber } from './data/yearPlan';
import type { LearnerState } from './learningEngine';
import { formatDashboardTime,type DashboardSnapshot,type LessonAnalyticsRow } from './studentAnalytics';
import { artifactForBoss,bossLessons,bossReadiness,celebrationForProgress,maxCompletedLesson,nextBossAfter,timMessage,WOW_PROGRESS_KEY,worldMeta,type Celebration } from './studentWowModel';
import './studentDashboardV3.css';

type Props={snapshot:DashboardSnapshot;state:LearnerState;onContinue?:()=>void};
type Filter='all'|'done'|'excellent'|'review';
type Quality={stars:0|1|2|3;label:string;tone:'new'|'progress'|'done'|'excellent'|'review';legacy?:boolean};

function quality(row:LessonAnalyticsRow):Quality{
  if(!row.completed)return row.sessions>0?{stars:0,label:'В процессе',tone:'progress'}:{stars:0,label:'Не начат',tone:'new'};
  if(!row.hasDetailedTelemetry||row.correct+row.wrong<5)return{stars:0,label:'Пройден ранее',tone:'done',legacy:true};
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
  const[bossPreview,setBossPreview]=useState<LessonAnalyticsRow|null>(null);
  const[celebration,setCelebration]=useState<Celebration|null>(null);
  const qualities=useMemo(()=>new Map(snapshot.lessons.map(row=>[row.lessonNumber,quality(row)])),[snapshot.lessons]);
  const excellent=snapshot.lessons.filter(row=>qualities.get(row.lessonNumber)?.stars===3).length;
  const solid=snapshot.lessons.filter(row=>row.completed&&qualities.get(row.lessonNumber)?.tone==='done').length;
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
  const startLesson=(row:LessonAnalyticsRow)=>{localStorage.setItem('mathnikita-selected-lesson',String(row.lessonNumber));onContinue?.()};
  const openLesson=(row:LessonAnalyticsRow)=>{const meta=yearLessonByNumber.get(row.lessonNumber);if(!row.completed&&(meta?.lessonType==='control'||meta?.lessonType==='final')){setBossPreview(row);return}startLesson(row)};
  const selectedQuality=qualities.get(selected.lessonNumber)??quality(selected);
  const firstTry=selected.correct?Math.round(selected.firstTryCorrect/selected.correct*100):null;
  const skillRows=Object.entries(state.skills).map(([id,skill])=>({id,label:skillLabels[id as keyof typeof skillLabels],mastery:skill.mastery,needsReview:skill.needsReview}));
  const nextBoss=nextBossAfter(next.lessonNumber);const nextBossRow=snapshot.lessons.find(row=>row.lessonNumber===nextBoss.number)??snapshot.lessons[snapshot.lessons.length-1];
  const readiness=bossReadiness(snapshot,nextBoss.number);const distanceToBoss=Math.max(0,nextBoss.number-next.lessonNumber);
  const tim=timMessage(snapshot,next,review);
  const completedBosses=bossLessons().filter(meta=>snapshot.lessons.find(row=>row.lessonNumber===meta.number)?.completed);
  const currentWorldIndex=Math.max(0,groups.findIndex(([,rows])=>rows.some(row=>row.lessonNumber===next.lessonNumber)));
  const currentWorld=worldMeta(currentWorldIndex);

  useEffect(()=>{
    const current=maxCompletedLesson(snapshot);let previous=current;
    try{const stored=JSON.parse(localStorage.getItem(WOW_PROGRESS_KEY)??'null') as {seenCompleted?:number}|null;if(stored&&typeof stored.seenCompleted==='number')previous=stored.seenCompleted}catch{}
    const unlocked=celebrationForProgress(previous,current);if(unlocked)setCelebration(unlocked);
    localStorage.setItem(WOW_PROGRESS_KEY,JSON.stringify({seenCompleted:current,updatedAt:new Date().toISOString()}));
  },[snapshot.completedLessons,snapshot]);

  return <main className="student-dashboard-v3">
    <section className="sdv3-hero sdv3-wow-hero">
      <div className="sdv3-hero-main"><span>Мой математический мир</span><div className="sdv3-progress-number"><b>{snapshot.completedLessons}</b><i>/ 175 уроков</i></div><div className="sdv3-main-bar"><i style={{width:`${snapshot.courseProgress}%`}}/></div><p>{snapshot.courseProgress}% мира построено · впереди {Math.max(0,175-snapshot.completedLessons)} уроков</p><div className="sdv3-ability"><span>Новая сила этого мира</span><b>{currentWorld.ability}</b></div></div>
      <div className="sdv3-next"><span>Следующий шаг</span><b>Урок {next.lessonNumber}</b><p>{next.title}</p><button type="button" onClick={()=>openLesson(next)}>{yearLessonByNumber.get(next.lessonNumber)?.lessonType==='control'||yearLessonByNumber.get(next.lessonNumber)?.lessonType==='final'?'Начать Boss Level':'Продолжить приключение'} <strong>→</strong></button><small>{distanceToBoss===0?'⚔️ Boss Level уже здесь':`До Boss Level: ${distanceToBoss} ${distanceToBoss===1?'урок':'урока'}`}</small></div>
      <div className={`sdv3-tim is-${tim.mood}`}><div className="sdv3-tim-avatar" aria-hidden="true"><i/><b>TIM</b></div><div><span>TIM · навигатор</span><h2>{tim.title}</h2><p>{tim.text}</p><small>{tim.cta}</small></div></div>
    </section>

    <section className="sdv3-player-strip" aria-label="Игровой прогресс">
      <article><span>⚡</span><div><small>Уровень {snapshot.level}</small><b>{levelTitle(snapshot.level)}</b><em>{snapshot.mathPoints} XP</em></div><i><u style={{width:`${snapshot.levelProgress}%`}}/></i></article>
      <article><span>🔥</span><div><small>Серия</small><b>{snapshot.streakDays} дней</b><em>{snapshot.studyDaysLast7} учебных дней за неделю</em></div></article>
      <article><span>🧰</span><div><small>Артефакты боссов</small><b>{completedBosses.length} / {bossLessons().length}</b><em>{completedBosses.length?artifactForBoss(completedBosses.at(-1)!.number).title:'Первый ждёт впереди'}</em></div></article>
      <article><span>{currentWorld.icon}</span><div><small>Текущая территория</small><b>{currentWorld.name}</b><em>{distanceToBoss?`До открытия следующего рубежа: ${distanceToBoss}`:'Пора победить босса'}</em></div></article>
    </section>

    <section className="sdv3-card sdv3-world sdv3-living-world">
      <header><div><span>Живая карта</span><h2>Твой мир растёт от знаний</h2><p>Каждый урок достраивает территорию. Контрольные открывают ворота в следующий мир.</p></div><div className="sdv3-world-power"><small>Сейчас развивается</small><b>{currentWorld.name}</b></div></header>
      <div className="sdv3-world-path" aria-label="Математический мир из семи территорий">{groups.map(([unit,rows],index)=>{const done=rows.filter(row=>row.completed).length;const current=rows.some(row=>row.lessonNumber===next.lessonNumber);const complete=done===rows.length;const unlocked=current||complete||done>0||next.lessonNumber>=rows[0].lessonNumber;const meta=worldMeta(index);const boss=rows.find(row=>{const lesson=yearLessonByNumber.get(row.lessonNumber);return lesson?.lessonType==='control'||lesson?.lessonType==='final'});return <article className={`${current?'is-current ':''}${complete?'is-complete ':''}${unlocked?'is-unlocked':'is-locked'} theme-${meta.accent}`} key={unit}><div className="sdv3-world-sky"><span className="sdv3-world-landmark">{meta.icon}</span><i className="cloud-one"/><i className="cloud-two"/><b>{complete?'✓':current?'●':'○'}</b></div><div className="sdv3-world-copy"><small>Территория {index+1}</small><h3>{meta.name}</h3><p>{unlocked?meta.ability:'Сначала открой предыдущую территорию'}</p><div><i><em style={{width:`${rows.length?done/rows.length*100:0}%`}}/></i><span>{done}/{rows.length}</span></div>{boss&&<button type="button" onClick={()=>{setSelected(boss);document.querySelector('.sdv3-lessons')?.scrollIntoView({behavior:'smooth',block:'start'})}}>{snapshot.lessons.find(row=>row.lessonNumber===boss.lessonNumber)?.completed?'Босс побеждён':'Boss Level'} · №{boss.lessonNumber}</button>}</div></article>})}<div className="sdv3-world-route" aria-hidden="true"/></div>
      <footer className="sdv3-artifacts"><div><span>Коллекция артефактов</span><b>Побеждай контрольные — собирай доказательства мастерства</b></div><div>{bossLessons().map(meta=>{const earned=snapshot.lessons.find(row=>row.lessonNumber===meta.number)?.completed;const artifact=artifactForBoss(meta.number);return <span className={earned?'is-earned':''} title={`${artifact.title} · урок ${meta.number}`} key={meta.number}>{earned?artifact.icon:'?'}</span>})}</div></footer>
    </section>

    <section className="sdv3-status-grid" aria-label="Статус курса">
      <article><span>★★★</span><b>{excellent}</b><small>уверенно освоено</small></article>
      <article><span>✓</span><b>{solid}</b><small>пройдено</small></article>
      <article className="is-review"><span>↻</span><b>{review}</b><small>нужно закрепить</small></article>
      <article><span>▶</span><b>{inProgress||next.lessonNumber}</b><small>{inProgress?'уроков в процессе':`текущий урок №${next.lessonNumber}`}</small></article>
    </section>

    <section className="sdv3-grid sdv3-grid-top">
      <article className="sdv3-card sdv3-mission"><header><div><span>Цель недели</span><h2>Миссия недели</h2></div><b>{missionDone}/4</b></header><div className="sdv3-mission-list">{missions.map(item=><div className={item.done?'is-done':''} key={item.label}><i>{item.done?'✓':'○'}</i><span>{item.label}</span><b>{item.done?'Готово':`${Math.min(item.value,item.target)}/${item.target}`}</b></div>)}</div><footer>{missionDone===4?'Миссия выполнена. Можно идти за новым личным рекордом.':`Осталось выполнить ${4-missionDone} ${4-missionDone===1?'цель':'цели'}.`}</footer></article>
      <article className="sdv3-card sdv3-boss-radar"><span>Следующий вызов</span><div className="sdv3-boss-mark">⚔️</div><h2>Boss Level · №{nextBoss.number}</h2><p>{nextBoss.title}</p><div className="sdv3-readiness"><div><b>{readiness}%</b><span>готовность</span></div><i><em style={{width:`${readiness}%`}}/></i></div><small>{distanceToBoss===0?'Ворота открыты. Можно начинать.':`Осталось пройти ${distanceToBoss} ${distanceToBoss===1?'урок':'урока'} до босса.`}</small><button type="button" onClick={()=>{setSelected(nextBossRow);if(distanceToBoss===0)setBossPreview(nextBossRow);else document.querySelector('.sdv3-lessons')?.scrollIntoView({behavior:'smooth'})}}>{distanceToBoss===0?'Проверить готовность':'Посмотреть босса'} →</button></article>
      <article className="sdv3-card sdv3-next-reward"><span>Следующее достижение</span>{nextReward?<><div className="sdv3-reward-icon">{nextReward.icon}</div><h2>{nextReward.title}</h2><p>{nextReward.description}</p><div className="sdv3-reward-bar"><i style={{width:`${nextReward.progress}%`}}/></div><small>{nextReward.progress}% готово</small></>:<><div className="sdv3-reward-icon">🏆</div><h2>Все достижения собраны</h2></>}</article>
    </section>

    <section className="sdv3-grid sdv3-grid-middle">
      <article className="sdv3-card"><header className="sdv3-simple-head"><div><span>Мои способности</span><h2>Мои математические силы</h2></div></header><div className="sdv3-skills">{skillRows.map(skill=>{const power=Math.max(1,Math.min(5,Math.ceil(skill.mastery/20)));return <div className={skill.needsReview?'needs-review':''} key={skill.id}><div><b>{skill.label}</b><span>{'◆'.repeat(power)}{'◇'.repeat(5-power)}</span></div><i><em style={{width:`${skill.mastery}%`}}/></i><small>{skill.needsReview?'Следующая зона роста':skill.mastery>=80?'Сильная сторона':'Прокачивается'} · {skill.mastery}%</small></div>})}</div></article>
      <article className="sdv3-card sdv3-week-recap"><span>Твоя неделя</span><h2>{weeklyCompleted?`+${weeklyCompleted} ${weeklyCompleted===1?'урок':'урока'}`:'Начни первый урок недели'}</h2><div><p><b>{snapshot.correct}</b><span>верных ответов всего</span></p><p><b>{snapshot.recoveredErrors}</b><span>ошибок исправлено</span></p><p><b>{snapshot.studyDaysLast7}</b><span>учебных дней</span></p><p><b>{percent(snapshot.accuracy)}</b><span>точность</span></p></div><footer>{review?`Главная цель: закрепить ${review} ${review===1?'урок':'урока'} с пробелами.`:'Уроков с критичным статусом сейчас нет.'}</footer></article>
    </section>

    <section className="sdv3-card sdv3-lessons">
      <header><div><span>Весь курс</span><h2>Все 175 уроков</h2><p>Найди любой урок и сразу увидь, как он был пройден.</p></div><div className="sdv3-filters"><button className={filter==='all'?'active':''} onClick={()=>setFilter('all')}>Все</button><button className={filter==='done'?'active':''} onClick={()=>setFilter('done')}>Пройдено</button><button className={filter==='excellent'?'active':''} onClick={()=>setFilter('excellent')}>★★★</button><button className={filter==='review'?'active':''} onClick={()=>setFilter('review')}>Повторить</button></div></header>
      <div className="sdv3-course-layout"><div className="sdv3-units">{groups.map(([unit,rows])=>{const visible=rows.filter(filtered);if(!visible.length)return null;return <section key={unit}><header><b>{unit}</b><span>{rows.filter(row=>row.completed).length}/{rows.length}</span></header><div className="sdv3-node-grid">{visible.map(row=>{const meta=yearLessonByNumber.get(row.lessonNumber);const q=qualities.get(row.lessonNumber)!;const boss=meta?.lessonType==='control'||meta?.lessonType==='final';return <button type="button" className={`sdv3-lesson-node is-${q.tone} ${boss?'is-boss':''} ${selected.lessonNumber===row.lessonNumber?'is-selected':''}`} onClick={()=>setSelected(row)} key={row.lessonNumber} aria-label={`Урок ${row.lessonNumber}: ${row.title}`}><b>{boss?'♛':row.lessonNumber}</b><span>{boss?`№${row.lessonNumber}`:q.legacy?'✓ ранее':stars(q.stars)}</span></button>})}</div></section>})}</div>
        <aside className={`sdv3-lesson-detail ${yearLessonByNumber.get(selected.lessonNumber)?.lessonType==='control'||yearLessonByNumber.get(selected.lessonNumber)?.lessonType==='final'?'is-boss-detail':''}`}><span>{yearLessonByNumber.get(selected.lessonNumber)?.lessonType==='control'||yearLessonByNumber.get(selected.lessonNumber)?.lessonType==='final'?'⚔️ BOSS LEVEL':'Урок'} {selected.lessonNumber}</span><h3>{selected.title}</h3><div className={`sdv3-quality is-${selectedQuality.tone}`}><b>{selectedQuality.stars?stars(selectedQuality.stars):selectedQuality.legacy?'✓':selectedQuality.tone==='review'?'↻':'▶'}</b><span>{selectedQuality.label}</span></div><dl><div><dt>Статус</dt><dd>{selected.completed?`Завершён ${completedDate(selected.completedAt)}`:selected.sessions?'В процессе':'Не начат'}</dd></div><div><dt>Точность</dt><dd>{percent(selected.accuracy)}</dd></div><div><dt>С первой попытки</dt><dd>{percent(firstTry)}</dd></div><div><dt>Ошибки</dt><dd>{selected.wrong}</dd></div><div><dt>Исправлено</dt><dd>{selected.recoveredErrors}</dd></div><div><dt>Активная работа</dt><dd>{formatDashboardTime(selected.hasDetailedTelemetry?selected.activeSeconds:selected.screenSeconds)}</dd></div></dl><button type="button" onClick={()=>openLesson(selected)}>{selected.completed?'Открыть урок для повторения':yearLessonByNumber.get(selected.lessonNumber)?.lessonType==='control'||yearLessonByNumber.get(selected.lessonNumber)?.lessonType==='final'?'Войти в Boss Level':'Перейти к уроку'} <b>→</b></button></aside>
      </div>
    </section>

    <details className="sdv3-details"><summary>Подробная статистика</summary><div><span>Экран <b>{formatDashboardTime(snapshot.screenSeconds)}</b></span><span>Активная работа <b>{formatDashboardTime(snapshot.activeSeconds)}</b></span><span>С первой попытки <b>{snapshot.firstTryCorrect}</b></span><span>Подсказок <b>{snapshot.hints}</b></span><span>Обращений к Пифагору <b>{snapshot.mentorActions}</b></span></div></details>

    {bossPreview&&<div className="sdv3-modal-backdrop" role="dialog" aria-modal="true" aria-label={`Boss Level ${bossPreview.lessonNumber}`}><section className="sdv3-boss-modal"><button className="sdv3-modal-close" onClick={()=>setBossPreview(null)} aria-label="Закрыть">×</button><span>⚔️ BOSS LEVEL</span><div className="sdv3-boss-emblem">♛</div><h2>{bossPreview.title}</h2><p>Контрольная открывает следующий участок мира. Скорость не важна — важны стратегия и точность.</p><div className="sdv3-boss-ready"><b>{bossReadiness(snapshot,bossPreview.lessonNumber)}%</b><span>готовность по пройденным урокам</span><i><em style={{width:`${bossReadiness(snapshot,bossPreview.lessonNumber)}%`}}/></i></div><div className="sdv3-boss-prize"><span>{artifactForBoss(bossPreview.lessonNumber).icon}</span><div><small>Награда за победу</small><b>{artifactForBoss(bossPreview.lessonNumber).title}</b></div></div><button className="sdv3-boss-start" onClick={()=>startLesson(bossPreview)}>Начать битву <b>→</b></button></section></div>}

    {celebration&&<div className="sdv3-celebration" role="dialog" aria-modal="true" aria-label={celebration.eyebrow}><div className="sdv3-confetti" aria-hidden="true">{Array.from({length:18},(_,index)=><i key={index}/>)}</div><section><span>{celebration.eyebrow}</span><div>{celebration.icon}</div><h2>{celebration.title}</h2><p>{celebration.message}</p><button onClick={()=>setCelebration(null)}>Забрать открытие</button></section></div>}
  </main>
}