import type { AnalyticsEvent, DashboardSnapshot } from './studentAnalytics';

export type LearningKpi = {
  score:number;
  hasEnoughData:boolean;
  label:string;
  firstTryRate:number|null;
  independence:number|null;
  recovery:number|null;
  rhythm:number;
};

export type WeekComparison = {
  currentActiveMinutes:number;
  previousActiveMinutes:number;
  activeDeltaPercent:number|null;
  currentAccuracy:number|null;
  previousAccuracy:number|null;
  accuracyDeltaPoints:number|null;
};

export type ErrorJournalEntry = {
  lessonNumber:number;
  label:string;
  count:number;
  latestAt:string;
  recovered:boolean;
};

function clamp(value:number,min=0,max=100){return Math.min(max,Math.max(min,value))}
function roundedRatio(numerator:number,denominator:number){return denominator>0?Math.round(clamp(numerator/denominator*100)):null}

export function buildLearningKpi(snapshot:DashboardSnapshot):LearningKpi{
  const attempts=snapshot.correct+snapshot.wrong;
  const firstTryRate=roundedRatio(snapshot.firstTryCorrect,snapshot.correct);
  const independence=snapshot.correct>0?Math.round(clamp(100-snapshot.hints/snapshot.correct*100)):null;
  const recovery=snapshot.wrong>0?roundedRatio(snapshot.recoveredErrors,snapshot.wrong):(snapshot.correct>=10?100:null);
  const hasEnoughData=attempts>=10;
  const quality=firstTryRate??snapshot.accuracy??70;
  const independenceScore=independence??70;
  const recoveryScore=recovery??70;
  const rhythm=snapshot.rhythmScore;
  const score=hasEnoughData?Math.round(quality*.35+independenceScore*.25+recoveryScore*.20+rhythm*.20):0;
  const label=!hasEnoughData?'Нужно ещё данных':score>=85?'Устойчивый прогресс':score>=70?'Хорошая динамика':score>=55?'Есть точки роста':'Нужна поддержка';
  return{score,hasEnoughData,label,firstTryRate,independence,recovery,rhythm};
}

function summarizeWeek(days:DashboardSnapshot['trend']){
  const activeMinutes=days.reduce((sum,day)=>sum+day.activeMinutes,0);
  const correct=days.reduce((sum,day)=>sum+day.correct,0);
  const wrong=days.reduce((sum,day)=>sum+day.wrong,0);
  const attempts=correct+wrong;
  return{activeMinutes,accuracy:attempts?Math.round(correct/attempts*100):null};
}

export function buildWeekComparison(snapshot:DashboardSnapshot):WeekComparison{
  const current=summarizeWeek(snapshot.trend.slice(-7));
  const previous=summarizeWeek(snapshot.trend.slice(-14,-7));
  const activeDeltaPercent=previous.activeMinutes>0?Math.round((current.activeMinutes-previous.activeMinutes)/previous.activeMinutes*100):null;
  const accuracyDeltaPoints=current.accuracy!==null&&previous.accuracy!==null?current.accuracy-previous.accuracy:null;
  return{currentActiveMinutes:current.activeMinutes,previousActiveMinutes:previous.activeMinutes,activeDeltaPercent,currentAccuracy:current.accuracy,previousAccuracy:previous.accuracy,accuracyDeltaPoints};
}

function eventIdentity(event:AnalyticsEvent){return `${event.lessonNumber}:${event.key??event.label??event.id}`}

export function buildErrorJournalEntries(events:AnalyticsEvent[],limit=8):ErrorJournalEntry[]{
  const groups=new Map<string,ErrorJournalEntry>();
  for(const event of events){
    if(event.type!=='answer_wrong')continue;
    const identity=eventIdentity(event);
    const existing=groups.get(identity);
    if(existing){existing.count+=1;if(event.at>existing.latestAt){existing.latestAt=event.at;existing.recovered=false}}
    else groups.set(identity,{lessonNumber:event.lessonNumber,label:event.label??'Задание',count:1,latestAt:event.at,recovered:false});
  }
  for(const event of events){
    if(event.type!=='answer_correct'||!event.recovered)continue;
    const identity=eventIdentity(event);const group=groups.get(identity);
    if(group&&event.at>=group.latestAt)group.recovered=true;
  }
  return [...groups.values()].sort((a,b)=>b.latestAt.localeCompare(a.latestAt)).slice(0,limit);
}
