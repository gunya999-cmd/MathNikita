import { loadLessonTiming } from './lessonTiming';
import { totalLessons,yearLessonByNumber,yearPlan } from './data/yearPlan';

export type AnalyticsArea='opening'|'main'|'practice';
export type AnalyticsEventType='lesson_started'|'answer_correct'|'answer_wrong'|'hint'|'mentor_action'|'narration'|'lesson_completed';

export type AnalyticsEvent={
  id:string;
  at:string;
  lessonNumber:number;
  type:AnalyticsEventType;
  area:AnalyticsArea;
  key?:string;
  label?:string;
  firstTry?:boolean;
  recovered?:boolean;
};

export type LessonTelemetry={
  lessonNumber:number;
  sessions:number;
  screenSeconds:number;
  focusSeconds:number;
  activeSeconds:number;
  correct:number;
  wrong:number;
  firstTryCorrect:number;
  recoveredErrors:number;
  hints:number;
  mentorActions:number;
  narrationPlays:number;
  practiceCorrect:number;
  practiceWrong:number;
  completedAt?:string;
  firstSeenAt?:string;
  lastSeenAt?:string;
};

export type DailyTelemetry={
  screenSeconds:number;
  focusSeconds:number;
  activeSeconds:number;
  correct:number;
  wrong:number;
  completedLessons:number;
};

export type AnalyticsStore={
  version:1;
  lessons:Record<string,LessonTelemetry>;
  daily:Record<string,DailyTelemetry>;
  events:AnalyticsEvent[];
};

export type LessonAnalyticsRow={
  lessonNumber:number;
  title:string;
  paragraph:string;
  completed:boolean;
  completedAt?:string;
  screenSeconds:number;
  focusSeconds:number;
  activeSeconds:number;
  sessions:number;
  correct:number;
  wrong:number;
  firstTryCorrect:number;
  recoveredErrors:number;
  hints:number;
  mentorActions:number;
  narrationPlays:number;
  practiceCorrect:number;
  practiceWrong:number;
  accuracy:number|null;
  focusRate:number|null;
  hasDetailedTelemetry:boolean;
};

export type Reward={
  id:string;
  icon:string;
  title:string;
  description:string;
  earned:boolean;
  progress:number;
};

export type DashboardSnapshot={
  completedLessons:number;
  readyLessons:number;
  courseProgress:number;
  screenSeconds:number;
  focusSeconds:number;
  activeSeconds:number;
  correct:number;
  wrong:number;
  firstTryCorrect:number;
  recoveredErrors:number;
  hints:number;
  mentorActions:number;
  narrationPlays:number;
  accuracy:number|null;
  focusRate:number|null;
  streakDays:number;
  studyDaysLast7:number;
  studyDaysLast14:number;
  rhythmScore:number;
  qualityScore:number;
  persistenceScore:number;
  focusScore:number;
  momentum:number;
  mathPoints:number;
  level:number;
  levelProgress:number;
  nextLevelPoints:number;
  lessons:LessonAnalyticsRow[];
  recentErrors:AnalyticsEvent[];
  rewards:Reward[];
  trend:Array<{date:string;label:string;activeMinutes:number;screenMinutes:number;correct:number;wrong:number;completedLessons:number}>;
};

const STORAGE_KEY='mathnikita:student-analytics:v1';
const MAX_EVENTS=2500;
const ACTIVE_STUDY_DAY_SECONDS=5*60;

function emptyStore():AnalyticsStore{return{version:1,lessons:{},daily:{},events:[]}}
function emptyDaily():DailyTelemetry{return{screenSeconds:0,focusSeconds:0,activeSeconds:0,correct:0,wrong:0,completedLessons:0}}
function clamp(value:number,min=0,max=100){return Math.min(max,Math.max(min,value))}
function localDateKey(date=new Date()){
  const year=date.getFullYear();const month=String(date.getMonth()+1).padStart(2,'0');const day=String(date.getDate()).padStart(2,'0');return`${year}-${month}-${day}`;
}
function parseCompletion(lessonNumber:number){
  try{
    const parsed=JSON.parse(localStorage.getItem(`mathnikita:lesson-complete:${lessonNumber}`)??'null') as {completedAt?:string;activeSeconds?:number}|null;
    return parsed?.completedAt?parsed:null;
  }catch{return null}
}
function makeLessonTelemetry(lessonNumber:number):LessonTelemetry{
  const now=new Date().toISOString();
  const legacy=typeof localStorage!=='undefined'?loadLessonTiming(lessonNumber):{activeSeconds:0};
  return{lessonNumber,sessions:0,screenSeconds:Math.max(0,legacy.activeSeconds||0),focusSeconds:0,activeSeconds:0,correct:0,wrong:0,firstTryCorrect:0,recoveredErrors:0,hints:0,mentorActions:0,narrationPlays:0,practiceCorrect:0,practiceWrong:0,firstSeenAt:now,lastSeenAt:now};
}

export function loadAnalyticsStore():AnalyticsStore{
  if(typeof localStorage==='undefined')return emptyStore();
  try{
    const parsed=JSON.parse(localStorage.getItem(STORAGE_KEY)??'null') as AnalyticsStore|null;
    if(parsed?.version===1&&parsed.lessons&&parsed.daily&&Array.isArray(parsed.events))return parsed;
  }catch{/* ignore corrupted analytics */}
  return emptyStore();
}

export function saveAnalyticsStore(store:AnalyticsStore){
  if(typeof localStorage==='undefined')return;
  localStorage.setItem(STORAGE_KEY,JSON.stringify(store));
  window.dispatchEvent(new CustomEvent('mathnikita-analytics-updated'));
}

function ensureLesson(store:AnalyticsStore,lessonNumber:number){
  const key=String(lessonNumber);
  if(!store.lessons[key])store.lessons[key]=makeLessonTelemetry(lessonNumber);
  return store.lessons[key];
}

function ensureDaily(store:AnalyticsStore,dateKey=localDateKey()){
  if(!store.daily[dateKey])store.daily[dateKey]=emptyDaily();
  return store.daily[dateKey];
}

export function startAnalyticsSession(lessonNumber:number){
  const store=loadAnalyticsStore();const lesson=ensureLesson(store,lessonNumber);const now=new Date().toISOString();
  lesson.sessions+=1;lesson.lastSeenAt=now;lesson.firstSeenAt=lesson.firstSeenAt??now;
  store.events=[...store.events.slice(-(MAX_EVENTS-1)),{id:`${Date.now()}-${Math.random().toString(36).slice(2,8)}`,at:now,lessonNumber,type:'lesson_started',area:'opening'}];
  saveAnalyticsStore(store);
}

export function addAnalyticsTime(lessonNumber:number,delta:{screenSeconds:number;focusSeconds:number;activeSeconds:number}){
  if(delta.screenSeconds<=0&&delta.focusSeconds<=0&&delta.activeSeconds<=0)return;
  const store=loadAnalyticsStore();const lesson=ensureLesson(store,lessonNumber);const day=ensureDaily(store);
  lesson.screenSeconds+=Math.max(0,delta.screenSeconds);lesson.focusSeconds+=Math.max(0,delta.focusSeconds);lesson.activeSeconds+=Math.max(0,delta.activeSeconds);lesson.lastSeenAt=new Date().toISOString();
  day.screenSeconds+=Math.max(0,delta.screenSeconds);day.focusSeconds+=Math.max(0,delta.focusSeconds);day.activeSeconds+=Math.max(0,delta.activeSeconds);
  saveAnalyticsStore(store);
}

export function recordAnalyticsEvent(input:Omit<AnalyticsEvent,'id'|'at'>){
  const store=loadAnalyticsStore();const lesson=ensureLesson(store,input.lessonNumber);const day=ensureDaily(store);const now=new Date().toISOString();
  const event:AnalyticsEvent={...input,id:`${Date.now()}-${Math.random().toString(36).slice(2,8)}`,at:now};
  if(input.type==='answer_correct'){
    lesson.correct+=1;day.correct+=1;
    if(input.firstTry)lesson.firstTryCorrect+=1;
    if(input.recovered)lesson.recoveredErrors+=1;
    if(input.area==='practice')lesson.practiceCorrect+=1;
  }
  if(input.type==='answer_wrong'){
    lesson.wrong+=1;day.wrong+=1;
    if(input.area==='practice')lesson.practiceWrong+=1;
  }
  if(input.type==='hint')lesson.hints+=1;
  if(input.type==='mentor_action')lesson.mentorActions+=1;
  if(input.type==='narration')lesson.narrationPlays+=1;
  if(input.type==='lesson_completed'){
    if(!lesson.completedAt)day.completedLessons+=1;
    lesson.completedAt=now;
  }
  lesson.lastSeenAt=now;
  store.events=[...store.events.slice(-(MAX_EVENTS-1)),event];
  saveAnalyticsStore(store);
}

function dateFromKey(key:string){const[y,m,d]=key.split('-').map(Number);return new Date(y,m-1,d)}
function dayDifference(later:Date,earlier:Date){return Math.round((new Date(later.getFullYear(),later.getMonth(),later.getDate()).getTime()-new Date(earlier.getFullYear(),earlier.getMonth(),earlier.getDate()).getTime())/86_400_000)}
function formatShortDay(date:Date){return new Intl.DateTimeFormat('ru-RU',{weekday:'short',day:'numeric'}).format(date).replace('.','')}

function buildLessonRows(store:AnalyticsStore){
  const ready=yearPlan.filter(item=>item.available);
  return ready.map(item=>{
    const telemetry=store.lessons[String(item.number)];
    const completion=parseCompletion(item.number);
    const legacy=loadLessonTiming(item.number);
    const completedAt=telemetry?.completedAt??completion?.completedAt;
    const screenSeconds=Math.max(telemetry?.screenSeconds??0,legacy.activeSeconds??0,completion?.activeSeconds??0);
    const correct=telemetry?.correct??0;const wrong=telemetry?.wrong??0;const attempts=correct+wrong;
    const activeSeconds=telemetry?.activeSeconds??0;const focusSeconds=telemetry?.focusSeconds??0;
    return{
      lessonNumber:item.number,title:item.title,paragraph:item.paragraph,completed:Boolean(completedAt),completedAt,
      screenSeconds,focusSeconds,activeSeconds,sessions:Math.max(telemetry?.sessions??0,legacy.sessions??0),correct,wrong,
      firstTryCorrect:telemetry?.firstTryCorrect??0,recoveredErrors:telemetry?.recoveredErrors??0,hints:telemetry?.hints??0,
      mentorActions:telemetry?.mentorActions??0,narrationPlays:telemetry?.narrationPlays??0,practiceCorrect:telemetry?.practiceCorrect??0,practiceWrong:telemetry?.practiceWrong??0,
      accuracy:attempts?Math.round(correct/attempts*100):null,focusRate:screenSeconds>0&&activeSeconds>0?Math.round(clamp(activeSeconds/screenSeconds*100)):null,
      hasDetailedTelemetry:Boolean(telemetry&&(telemetry.correct+telemetry.wrong+telemetry.activeSeconds+telemetry.focusSeconds>0)),
    } satisfies LessonAnalyticsRow;
  });
}

function buildTrend(store:AnalyticsStore,lessons:LessonAnalyticsRow[]){
  const completionDates=new Map<string,number>();
  for(const lesson of lessons){if(!lesson.completedAt)continue;const key=localDateKey(new Date(lesson.completedAt));completionDates.set(key,(completionDates.get(key)??0)+1)}
  const result:DashboardSnapshot['trend']=[];const today=new Date();
  for(let offset=13;offset>=0;offset-=1){
    const date=new Date(today.getFullYear(),today.getMonth(),today.getDate()-offset);const key=localDateKey(date);const daily=store.daily[key]??emptyDaily();
    result.push({date:key,label:formatShortDay(date),activeMinutes:Math.round(daily.activeSeconds/60),screenMinutes:Math.round(daily.screenSeconds/60),correct:daily.correct,wrong:daily.wrong,completedLessons:Math.max(daily.completedLessons,completionDates.get(key)??0)});
  }
  return result;
}

function currentStreak(studyDates:string[]){
  if(!studyDates.length)return 0;const sorted=[...new Set(studyDates)].sort();const today=new Date();const last=dateFromKey(sorted[sorted.length-1]);const gap=dayDifference(today,last);if(gap>1)return 0;
  let streak=1;for(let index=sorted.length-1;index>0;index-=1){if(dayDifference(dateFromKey(sorted[index]),dateFromKey(sorted[index-1]))===1)streak+=1;else break}return streak;
}

function reward(id:string,icon:string,title:string,description:string,earned:boolean,progress:number):Reward{return{id,icon,title,description,earned,progress:Math.round(clamp(progress))}}

export function buildDashboardSnapshot():DashboardSnapshot{
  const store=loadAnalyticsStore();const lessons=buildLessonRows(store);const completed=lessons.filter(item=>item.completed);const trend=buildTrend(store,lessons);
  const screenSeconds=lessons.reduce((sum,item)=>sum+item.screenSeconds,0);const focusSeconds=lessons.reduce((sum,item)=>sum+item.focusSeconds,0);const activeSeconds=lessons.reduce((sum,item)=>sum+item.activeSeconds,0);
  const correct=lessons.reduce((sum,item)=>sum+item.correct,0);const wrong=lessons.reduce((sum,item)=>sum+item.wrong,0);const firstTryCorrect=lessons.reduce((sum,item)=>sum+item.firstTryCorrect,0);const recoveredErrors=lessons.reduce((sum,item)=>sum+item.recoveredErrors,0);const hints=lessons.reduce((sum,item)=>sum+item.hints,0);const mentorActions=lessons.reduce((sum,item)=>sum+item.mentorActions,0);const narrationPlays=lessons.reduce((sum,item)=>sum+item.narrationPlays,0);
  const attempts=correct+wrong;const accuracy=attempts?Math.round(correct/attempts*100):null;const focusRate=screenSeconds>0&&activeSeconds>0?Math.round(clamp(activeSeconds/screenSeconds*100)):null;
  const completionDates=completed.flatMap(item=>item.completedAt?[localDateKey(new Date(item.completedAt))]:[]);
  const telemetryStudyDates=Object.entries(store.daily).filter(([,day])=>day.activeSeconds>=ACTIVE_STUDY_DAY_SECONDS).map(([date])=>date);const studyDates=[...new Set([...completionDates,...telemetryStudyDates])];
  const last7=trend.slice(-7);const studyDaysLast7=last7.filter(day=>day.activeMinutes>=5||day.completedLessons>0).length;const studyDaysLast14=trend.filter(day=>day.activeMinutes>=5||day.completedLessons>0).length;const streakDays=currentStreak(studyDates);
  const rhythmScore=Math.round(clamp(studyDaysLast7/4*100));const qualityScore=accuracy??(completed.length?78:65);const persistenceScore=wrong?Math.round(clamp(50+recoveredErrors/wrong*50)):(completed.length?90:70);const focusScore=focusRate??(completed.length?78:70);const momentum=Math.round(rhythmScore*.30+qualityScore*.30+persistenceScore*.20+focusScore*.20);
  const rewards=[
    reward('first-finish','🚀','Первый финиш','Завершить первый полный урок.',completed.length>=1,completed.length*100),
    reward('three-lessons','🧭','Маршрут набран','Завершить 3 урока.',completed.length>=3,completed.length/3*100),
    reward('streak-3','🔥','Три дня в ритме','Учиться 3 дня подряд.',streakDays>=3,streakDays/3*100),
    reward('streak-7','⚡','Неделя силы','Учиться 7 дней подряд.',streakDays>=7,streakDays/7*100),
    reward('recovery','🛠️','Мастер исправлений','Исправить 5 ошибок и дойти до верного ответа.',recoveredErrors>=5,recoveredErrors/5*100),
    reward('accuracy','🎯','Точный расчёт','Держать 85%+ точности минимум на 20 проверках.',attempts>=20&&Boolean(accuracy&&accuracy>=85),attempts<20?attempts/20*70:accuracy??0),
    reward('focus','🧠','Глубокий фокус','Накопить 30 минут активной работы с фокусом 80%+.',activeSeconds>=1800&&Boolean(focusRate&&focusRate>=80),Math.min(activeSeconds/1800*80,80)+(focusRate??0)*.2),
    reward('independent','🌟','Самостоятельный ход','Завершить 5 уроков и использовать не больше 5 подсказок.',completed.length>=5&&hints<=5,Math.min(completed.length/5*80,80)+(hints<=5?20:0)),
  ];
  const earnedRewards=rewards.filter(item=>item.earned).length;const mathPoints=completed.length*100+firstTryCorrect*6+recoveredErrors*10+earnedRewards*50+Math.min(streakDays*20,140);const level=Math.floor(mathPoints/500)+1;const levelBase=(level-1)*500;const levelProgress=Math.round((mathPoints-levelBase)/500*100);const nextLevelPoints=level*500;
  const recentErrors=store.events.filter(event=>event.type==='answer_wrong').slice(-10).reverse();
  return{completedLessons:completed.length,readyLessons:lessons.length,courseProgress:Math.round(completed.length/totalLessons*100),screenSeconds,focusSeconds,activeSeconds,correct,wrong,firstTryCorrect,recoveredErrors,hints,mentorActions,narrationPlays,accuracy,focusRate,streakDays,studyDaysLast7,studyDaysLast14,rhythmScore,qualityScore,persistenceScore,focusScore,momentum,mathPoints,level,levelProgress,nextLevelPoints,lessons,recentErrors,rewards,trend};
}

export function formatDashboardTime(seconds:number){
  const whole=Math.max(0,Math.round(seconds));const hours=Math.floor(whole/3600);const minutes=Math.floor((whole%3600)/60);
  if(hours)return`${hours} ч ${minutes} мин`;if(minutes)return`${minutes} мин`;return`${whole} сек`;
}

export function lessonTitle(lessonNumber:number){return yearLessonByNumber.get(lessonNumber)?.title??`Урок ${lessonNumber}`}
