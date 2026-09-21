import {useMemo,useState} from 'react';
import {skillLabels,type SkillId} from './data/course';
import {yearLessonByNumber} from './data/yearPlan';
import type {LearnerState} from './learningEngine';
import {loadAnalyticsStore,type DashboardSnapshot,type LessonAnalyticsRow} from './studentAnalytics';
import './studentDashboardV4.css';

type Props={snapshot:DashboardSnapshot;state:LearnerState;onContinue?:()=>void};
type GrowthRow={id:SkillId;label:string;before:number|null;now:number|null;delta:number|null;recentAttempts:number};

const TOTAL_LESSONS=175;
const skillOrder:SkillId[]=['arithmetic','fractions','wordProblems','expressions','geometry','logic'];
const skillGlyph:Record<SkillId,string>={
  arithmetic:'∑',expressions:'x',wordProblems:'?',fractions:'½',geometry:'△',logic:'◇',combinatorics:'⋈',
};

function clamp(value:number,min=5,max=100){return Math.min(max,Math.max(min,value))}
function pluralLessons(value:number){
  const mod10=value%10;const mod100=value%100;
  if(mod10===1&&mod100!==11)return'урок';
  if(mod10>=2&&mod10<=4&&(mod100<12||mod100>14))return'урока';
  return'уроков';
}
function pluralDays(value:number){
  const mod10=value%10;const mod100=value%100;
  if(mod10===1&&mod100!==11)return'день';
  if(mod10>=2&&mod10<=4&&(mod100<12||mod100>14))return'дня';
  return'дней';
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
function gainForAttempt(attempt:LearnerState['attempts'][number]){
  if(!attempt.correct)return-7;
  return attempt.firstTry&&!attempt.usedHint?9:4;
}
function buildGrowthRows(state:LearnerState):GrowthRow[]{
  const cutoff=Date.now()-7*86_400_000;
  const rows=(Object.entries(state.skills) as [SkillId,LearnerState['skills'][SkillId]][]).map(([id,skill])=>{
    const recent=state.attempts.filter(attempt=>attempt.skill===id&&new Date(attempt.createdAt).getTime()>=cutoff);
    if(skill.attempts===0)return{id,label:skillLabels[id],before:null,now:null,delta:null,recentAttempts:0};
    const recentGain=recent.reduce((sum,attempt)=>sum+gainForAttempt(attempt),0);
    const before=recent.length?clamp(skill.mastery-recentGain):skill.mastery;
    return{id,label:skillLabels[id],before,now:skill.mastery,delta:skill.mastery-before,recentAttempts:recent.length};
  });
  return rows.sort((a,b)=>b.recentAttempts-a.recentAttempts||((b.now??0)-(a.now??0))).slice(0,3);
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

function PythagorasMascot(){
  return <svg className="sdv4-mascot-svg" viewBox="0 0 360 250" role="img" aria-label="Кот Пифагор">
    <defs>
      <linearGradient id="catFur" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#233f68"/><stop offset="1" stopColor="#101f3b"/></linearGradient>
      <linearGradient id="bookBlue" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#17376d"/><stop offset="1" stopColor="#27589e"/></linearGradient>
    </defs>
    <ellipse cx="205" cy="229" rx="130" ry="14" fill="#9fd893" opacity=".55"/>
    <rect x="105" y="195" width="190" height="30" rx="8" fill="url(#bookBlue)"/><rect x="122" y="168" width="176" height="31" rx="8" fill="#284d82"/><rect x="135" y="142" width="154" height="30" rx="8" fill="#17345f"/>
    <text x="168" y="162" fill="white" fontSize="12" fontWeight="800">МАТЕМАТИКА</text>
    <path d="M165 51 L138 20 L137 79 Z" fill="url(#catFur)"/><path d="M252 53 L280 21 L280 82 Z" fill="url(#catFur)"/><path d="M150 31 L145 61 L160 48 Z" fill="#e68f93"/><path d="M269 32 L274 63 L258 49 Z" fill="#e68f93"/>
    <ellipse cx="210" cy="92" rx="72" ry="68" fill="url(#catFur)"/>
    <ellipse cx="184" cy="86" rx="17" ry="21" fill="#fff"/><ellipse cx="185" cy="89" rx="10" ry="13" fill="#f6b72e"/><ellipse cx="186" cy="91" rx="5" ry="8" fill="#162039"/><circle cx="190" cy="84" r="3" fill="#fff"/>
    <path d="M231 82 Q246 73 257 84" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round"/>
    <path d="M206 105 L215 105 L211 112 Z" fill="#f29a9e"/><path d="M211 113 Q199 121 189 113 M211 113 Q221 123 231 114" fill="none" stroke="#f3f6fb" strokeWidth="3" strokeLinecap="round"/>
    <path d="M165 108 L120 100 M163 117 L116 120 M253 108 L302 99 M254 118 L305 122" stroke="#92a7c8" strokeWidth="2" strokeLinecap="round"/>
    <path d="M171 137 Q159 158 172 178 L249 177 Q260 153 246 134 Q210 151 171 137Z" fill="url(#catFur)"/>
    <ellipse cx="163" cy="155" rx="14" ry="30" transform="rotate(-25 163 155)" fill="#182f54"/><ellipse cx="255" cy="154" rx="14" ry="29" transform="rotate(24 255 154)" fill="#182f54"/>
    <g transform="translate(151 126) rotate(-20)"><rect x="0" y="0" width="8" height="50" rx="4" fill="#f4a62a"/><rect x="0" y="6" width="8" height="24" fill="#ffd257"/><path d="M0 0 L4 -10 L8 0Z" fill="#f4ddbb"/><path d="M3 -8 L4 -11 L5 -8Z" fill="#25354f"/></g>
    <path d="M264 145 Q321 130 310 183 Q305 207 278 201" fill="none" stroke="#162b4d" strokeWidth="18" strokeLinecap="round"/>
  </svg>;
}

export function StudentDashboardV4({snapshot,state,onContinue}:Props){
  const[showCourse,setShowCourse]=useState(false);
  const[search,setSearch]=useState('');
  const next=findNextLesson(snapshot);
  const currentUnit=yearLessonByNumber.get(next.lessonNumber)?.unit??next.paragraph??'Курс';
  const last7=snapshot.trend.slice(-7);const previous7=snapshot.trend.slice(-14,-7);
  const weekAccuracy=accuracyFor(last7);const previousAccuracy=accuracyFor(previous7);
  const accuracyDelta=weekAccuracy!==null&&previousAccuracy!==null?weekAccuracy-previousAccuracy:null;
  const growthRows=useMemo(()=>buildGrowthRows(state),[state]);
  const record=useMemo(()=>longestCorrectRun(),[snapshot.correct,snapshot.wrong]);
  const nextControl=snapshot.lessons.find(row=>row.lessonNumber>=next.lessonNumber&&['control','final'].includes(yearLessonByNumber.get(row.lessonNumber)?.lessonType??''));
  const distanceToControl=nextControl?Math.max(0,nextControl.lessonNumber-next.lessonNumber):0;
  const nextIndex=Math.max(0,snapshot.lessons.findIndex(row=>row.lessonNumber===next.lessonNumber));
  const routeStart=Math.max(0,Math.min(snapshot.lessons.length-6,nextIndex-3));
  const route=snapshot.lessons.slice(routeStart,routeStart+6);
  const earnedRewards=snapshot.rewards.filter(reward=>reward.earned).length;
  const weeklyCompleted=last7.reduce((sum,day)=>sum+day.completedLessons,0);
  const stage=catStage(snapshot.courseProgress);
  const heroMessage=accuracyDelta!==null&&accuracyDelta>0
    ?`Точность за неделю выросла на ${accuracyDelta} п.п.`
    :snapshot.streakDays>=2
      ?`${snapshot.streakDays} ${pluralDays(snapshot.streakDays)} подряд — серия продолжается.`
      :weeklyCompleted>0
        ?`На этой неделе уже пройдено ${weeklyCompleted} ${pluralLessons(weeklyCompleted)}.`
        :'Следующий шаг — один урок.';
  const skills=skillOrder.map(id=>({id,label:skillLabels[id],skill:state.skills[id]}));
  const searchResults=search.trim().length>=1?snapshot.lessons.filter(row=>`${row.lessonNumber} ${row.title}`.toLowerCase().includes(search.trim().toLowerCase())).slice(0,6):[];

  const startLesson=(row:LessonAnalyticsRow)=>{
    localStorage.setItem('mathnikita-selected-lesson',String(row.lessonNumber));
    onContinue?.();
  };
  const scrollTo=(id:string)=>document.getElementById(id)?.scrollIntoView({behavior:'smooth',block:'start'});
  const openCourse=()=>{setShowCourse(true);window.setTimeout(()=>scrollTo('sdv4-course-list'),40)};

  return <div className="sdv4-shell">
    <header className="sdv4-appbar">
      <div className="sdv4-brand" role="img" aria-label="MathNikita"><span className="sdv4-cap">◆</span><b>Math<span>Nikita</span></b></div>
      <nav className="sdv4-topnav" aria-label="Разделы кабинета">
        <button className="is-active" type="button" onClick={()=>scrollTo('sdv4-home')}>Главная</button>
        <button type="button" onClick={openCourse}>Уроки</button>
        <button type="button" onClick={()=>scrollTo('sdv4-motivation')}>Достижения</button>
        <button type="button" onClick={()=>scrollTo('sdv4-growth')}>Статистика</button>
      </nav>
      <div className="sdv4-tools">
        <div className="sdv4-search">
          <span aria-hidden="true">⌕</span><input value={search} onChange={event=>setSearch(event.target.value)} placeholder="Поиск уроков" aria-label="Поиск уроков"/>
          {searchResults.length>0&&<div className="sdv4-search-results">{searchResults.map(row=><button type="button" key={row.lessonNumber} onClick={()=>startLesson(row)}><b>{row.lessonNumber}</b><span>{row.title}</span></button>)}</div>}
        </div>
        <div className="sdv4-profile"><div className="sdv4-mini-cat" aria-hidden="true">⌃•ﻌ•⌃</div><span><b>Никита</b><small>{stage}</small></span></div>
      </div>
    </header>

    <div className="sdv4-layout">
      <aside className="sdv4-sidebar" aria-label="Навигация ученика">
        <button className="is-active" type="button" onClick={()=>scrollTo('sdv4-home')}><i>⌂</i><span>Главная</span></button>
        <button type="button" onClick={openCourse}><i>▶</i><span>Уроки</span></button>
        <button type="button" onClick={()=>scrollTo('sdv4-motivation')}><i>▥</i><span>Достижения</span></button>
        <button type="button" onClick={()=>scrollTo('sdv4-skills')}><i>☆</i><span>Мои навыки</span></button>
        <button type="button" onClick={()=>scrollTo('sdv4-motivation')}><i>♕</i><span>Награды</span></button>
      </aside>

      <main className="sdv4" id="sdv4-home">
        <div className="sdv4-dashboard">
          <section className="sdv4-hero" aria-label="Следующий урок">
            <div className="sdv4-hero-copy">
              <div className="sdv4-today"><span aria-hidden="true">☀</span><b>Сегодня</b><small>{formatToday()}</small></div>
              <div className="sdv4-lesson-number">Урок {next.lessonNumber}</div>
              <h1>{next.title}</h1>
              <div className="sdv4-hero-meta"><span>◷&nbsp; ≈ 10 минут</span><span>▤&nbsp; {next.lessonNumber} из {TOTAL_LESSONS} уроков</span></div>
              <button className="sdv4-primary" type="button" onClick={()=>startLesson(next)}>Продолжить <span>→</span></button>
            </div>
            <div className="sdv4-hero-character">
              <div className="sdv4-speech"><b>{heroMessage}</b><small>Пифагор · {stage}</small></div>
              <PythagorasMascot/>
            </div>
          </section>

          <section className="sdv4-growth" id="sdv4-growth">
            <header><div><span className="sdv4-section-icon">▥</span><h2>Мой рост</h2></div><button type="button" onClick={()=>scrollTo('sdv4-skills')}>Все навыки →</button></header>
            <p>Изменения за последние 7 дней</p>
            <div className="sdv4-growth-cards">{growthRows.map(row=>{
              const before=row.before;const now=row.now;const delta=row.delta;
              const mid=before!==null&&now!==null?Math.round((before+now)/2):null;
              return <article key={row.id} className={now===null?'is-empty':''}>
                <span>{row.label}</span>
                <div className="sdv4-growth-value">{before===null||now===null?<b>—</b>:<><b>{before}%</b><i>→</i><strong>{now}%</strong></>}</div>
                <div className="sdv4-mini-bars" aria-hidden="true"><i style={{height:`${Math.max(18,before??18)}%`}}/><i style={{height:`${Math.max(18,mid??18)}%`}}/><i style={{height:`${Math.max(18,now??18)}%`}}/></div>
                <small>{delta===null?'Появится после ответов':delta>0?`+${delta} п.п. ↑`:delta<0?`${delta} п.п. ↓`:'без изменений'}</small>
              </article>;
            })}</div>
          </section>

          <section className="sdv4-route" aria-label="Твой маршрут">
            <header><div><span className="sdv4-section-icon">▰</span><div><h2>Твой маршрут</h2><p>{currentUnit}</p></div></div><button type="button" onClick={openCourse}>Весь курс →</button></header>
            <div className="sdv4-route-track">{route.map(row=>{
              const lessonType=yearLessonByNumber.get(row.lessonNumber)?.lessonType;
              const isControl=lessonType==='control'||lessonType==='final';
              const isCurrent=row.lessonNumber===next.lessonNumber;
              return <article className={`${row.completed?'is-done ':''}${isCurrent?'is-current ':''}${isControl?'is-control':''}`} key={row.lessonNumber}>
                <div className="sdv4-route-dot">{row.completed?'✓':isControl?'⚑':row.lessonNumber}</div>
                <b>{row.lessonNumber}</b><span>{isControl?'Контрольная':row.title}</span>{isCurrent&&<small>Сейчас</small>}
              </article>;
            })}</div>
          </section>

          <section className="sdv4-skills" id="sdv4-skills">
            <header><div><span className="sdv4-section-icon">★</span><h2>Мои навыки</h2></div><span>{state.attempts.length} ответов учтено</span></header>
            <div className="sdv4-skill-grid">{skills.map(({id,label,skill})=>{
              const hasData=skill.attempts>0;
              return <article key={id}><i>{skillGlyph[id]}</i><div><div><b>{label}</b><strong>{hasData?`${skill.mastery}%`:'—'}</strong></div><span><em style={{width:hasData?`${skill.mastery}%`:'0%'}}/></span></div></article>;
            })}</div>
          </section>

          <section className="sdv4-motivation" id="sdv4-motivation">
            <article><span aria-hidden="true">🏆</span><div><small>Личный рекорд</small><b>{record>0?`${record} подряд`:'Пока нет'}</b><p>{record>0?'правильных ответов без ошибки':'Появится после первых ответов'}</p></div></article>
            <article><span aria-hidden="true">◎</span><div><small>До контрольной</small><b>{nextControl?(distanceToControl===0?'Сегодня':`${distanceToControl} ${pluralLessons(distanceToControl)}`):'Финиш рядом'}</b><p>{nextControl?`Контрольная №${nextControl.lessonNumber}`:'Итоговый этап курса'}</p></div></article>
            <article><span aria-hidden="true">✓</span><div><small>Прогресс курса</small><b>{snapshot.completedLessons} / {TOTAL_LESSONS}</b><p>{earnedRewards>0?`Наград получено: ${earnedRewards}`:`${snapshot.courseProgress}% курса завершено`}</p></div></article>
          </section>
        </div>

        {showCourse&&<section className="sdv4-course-list" id="sdv4-course-list">
          <header><div><h2>Все уроки</h2><p>{snapshot.completedLessons} из {TOTAL_LESSONS} пройдено</p></div><button type="button" onClick={()=>setShowCourse(false)}>Скрыть ×</button></header>
          <div className="sdv4-all-lessons-grid">{snapshot.lessons.map(row=>{
            const type=yearLessonByNumber.get(row.lessonNumber)?.lessonType;
            return <button type="button" className={`sdv4-lesson ${row.completed?'is-done ':''}${row.lessonNumber===next.lessonNumber?'is-current':''}`} key={row.lessonNumber} onClick={()=>startLesson(row)}>
              <b>{row.completed?'✓':row.lessonNumber}</b><span>{row.title}</span><small>{type==='control'||type==='final'?'Контрольная':row.completed?'Пройден':row.sessions>0?'В процессе':'Не начат'}</small>
            </button>;
          })}</div>
        </section>}
      </main>
    </div>
  </div>;
}
