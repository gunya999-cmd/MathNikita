import { yearLessonByNumber } from './data/yearPlan';
import type { DashboardSnapshot,LessonAnalyticsRow } from './studentAnalytics';

export type WorldMeta={icon:string;name:string;ability:string;accent:string};
export type Celebration={kind:'boss'|'world';eyebrow:string;title:string;message:string;icon:string};

export const WOW_PROGRESS_KEY='mathnikita:student-wow:v1';

const WORLD_META:WorldMeta[]=[
  {icon:'🏙️',name:'Город чисел',ability:'Сравнивать, измерять и видеть числа вокруг себя',accent:'numbers'},
  {icon:'🏗️',name:'Город формул',ability:'Строить фигуры, формулы и решать уравнения',accent:'geometry'},
  {icon:'⚙️',name:'Механика вычислений',ability:'Управлять умножением, делением, площадью и объёмом',accent:'mechanics'},
  {icon:'🏝️',name:'Архипелаг дробей',ability:'Работать с частями целого и смешанными числами',accent:'fractions'},
  {icon:'🚀',name:'Космопорт десятичных',ability:'Использовать десятичные дроби, средние и проценты',accent:'decimals'},
  {icon:'🧪',name:'Лаборатория мастера',ability:'Связывать темы курса и находить стратегию решения',accent:'lab'},
  {icon:'🏆',name:'Башня мастера',ability:'Подтвердить владение всем курсом',accent:'final'},
];

export function worldMeta(index:number):WorldMeta{return WORLD_META[index]??WORLD_META[WORLD_META.length-1]}

export function maxCompletedLesson(snapshot:DashboardSnapshot){
  return snapshot.lessons.reduce((max,row)=>row.completed?Math.max(max,row.lessonNumber):max,0);
}

export function bossLessons(){
  return [...yearLessonByNumber.values()].filter(lesson=>lesson.lessonType==='control'||lesson.lessonType==='final');
}

export function nextBossAfter(lessonNumber:number){
  return bossLessons().find(lesson=>lesson.number>=lessonNumber)??bossLessons().at(-1)!;
}

export function bossReadiness(snapshot:DashboardSnapshot,bossNumber:number){
  const boss=yearLessonByNumber.get(bossNumber);if(!boss)return 0;
  const unitRows=snapshot.lessons.filter(row=>yearLessonByNumber.get(row.lessonNumber)?.unit===boss.unit&&row.lessonNumber<bossNumber);
  if(!unitRows.length)return 0;
  const completed=unitRows.filter(row=>row.completed);
  const completion=completed.length/unitRows.length*70;
  const detailed=completed.filter(row=>row.accuracy!==null);
  const accuracy=detailed.length?detailed.reduce((sum,row)=>sum+(row.accuracy??0),0)/detailed.length:75;
  return Math.max(0,Math.min(100,Math.round(completion+accuracy*.3)));
}

export function timMessage(snapshot:DashboardSnapshot,next:LessonAnalyticsRow,reviewCount:number){
  const boss=nextBossAfter(next.lessonNumber);const distance=Math.max(0,boss.number-next.lessonNumber);
  if(reviewCount>0)return{mood:'coach',title:'TIM нашёл точку роста',text:`Есть ${reviewCount} ${reviewCount===1?'урок, который стоит закрепить':'урока, которые стоит закрепить'}. Исправленные ошибки дают больше силы, чем идеальная первая попытка.`,cta:'Закрепим и усилим мир'};
  if(snapshot.streakDays>=7)return{mood:'fire',title:`TIM: серия ${snapshot.streakDays} дней`,text:`Ты уже держишь настоящий учебный ритм. ${distance?`До следующего Boss Level — ${distance} ${distance===1?'урок':'урока'}.`:'Следующий шаг — Boss Level.'}`,cta:'Не теряем ритм'};
  if((snapshot.accuracy??0)>=90&&snapshot.correct+snapshot.wrong>=10)return{mood:'star',title:'TIM впечатлён точностью',text:`${snapshot.accuracy}% правильных ответов. Сейчас можно идти вперёд: твой мир растёт без явных пробелов.`,cta:'Открываем новую территорию'};
  if(distance<=2)return{mood:'boss',title:'TIM: впереди босс',text:distance===0?'Контрольная уже здесь. Проверь готовность и начинай Boss Level.':`До контрольной всего ${distance} ${distance===1?'урок':'урока'}. Я покажу готовность перед битвой.`,cta:'Готовимся к битве'};
  return{mood:'explore',title:'TIM ведёт дальше',text:`Следующий шаг — урок ${next.lessonNumber}. Каждый завершённый урок достраивает твой математический мир и приближает новое открытие.`,cta:'Посмотрим, что откроется'};
}

export function celebrationForProgress(previousMax:number,currentMax:number):Celebration|null{
  if(currentMax<=previousMax)return null;
  const newlyCompleted=Array.from({length:currentMax-previousMax},(_,index)=>previousMax+index+1).filter(number=>number<=175);
  const boss=[...newlyCompleted].reverse().map(number=>yearLessonByNumber.get(number)).find(lesson=>lesson?.lessonType==='control'||lesson?.lessonType==='final');
  if(boss)return{kind:'boss',eyebrow:'BOSS ПОБЕЖДЁН',title:boss.lessonType==='final'?'Башня мастера покорена':boss.title,message:boss.lessonType==='final'?'Ты завершил весь математический маршрут. Мир собран полностью.':'Контроль пройден. Новая территория математического мира теперь открыта.',icon:boss.lessonType==='final'?'🏆':'⚔️'};
  const previousUnit=yearLessonByNumber.get(previousMax)?.unit;const currentUnit=yearLessonByNumber.get(currentMax)?.unit;
  if(previousUnit&&currentUnit&&previousUnit!==currentUnit){const index=[...new Set([...yearLessonByNumber.values()].map(lesson=>lesson.unit))].indexOf(currentUnit);const meta=worldMeta(index);return{kind:'world',eyebrow:'НОВАЯ ТЕРРИТОРИЯ',title:meta.name,message:`Открыта новая способность: ${meta.ability}.`,icon:meta.icon}}
  return null;
}

export function artifactForBoss(number:number){
  const artifacts=new Map<number,{icon:string;title:string}>([[20,{icon:'🧭',title:'Компас чисел'}],[33,{icon:'📐',title:'Ключ формул'}],[53,{icon:'🏗️',title:'Знак архитектора'}],[73,{icon:'⚙️',title:'Механизм умножения'}],[90,{icon:'💎',title:'Кристалл объёма'}],[108,{icon:'🏝️',title:'Компас дробей'}],[125,{icon:'🔭',title:'Линза десятичных'}],[142,{icon:'🚀',title:'Двигатель вычислений'}],[156,{icon:'%',title:'Знак процентов'}],[175,{icon:'🏆',title:'Корона мастера'}]]);
  return artifacts.get(number)??{icon:'⚔️',title:`Артефакт босса ${number}`};
}
