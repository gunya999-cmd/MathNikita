import {taskBank,type SkillId} from './data/course';
import type {LearnerState} from './learningEngine';

export const REVIEW_QUEUE_KEY='mathnikita:review-queue:v1';

export type ActiveError={
  taskId:string;
  skill:SkillId;
  atLesson:number;
  lastWrongAt:string;
  wrongCount:number;
  title:string;
  prompt:string;
};

export function buildActiveErrors(state:LearnerState):ActiveError[]{
  const active=new Map<string,ActiveError>();
  const wrongCounts=new Map<string,number>();
  const attempts=[...state.attempts].sort((a,b)=>a.createdAt.localeCompare(b.createdAt));
  for(const attempt of attempts){
    if(attempt.correct){
      active.delete(attempt.taskId);
      continue;
    }
    const task=taskBank.get(attempt.taskId);
    if(!task)continue;
    const wrongCount=(wrongCounts.get(attempt.taskId)??0)+1;
    wrongCounts.set(attempt.taskId,wrongCount);
    active.set(attempt.taskId,{
      taskId:attempt.taskId,
      skill:attempt.skill,
      atLesson:attempt.atLesson,
      lastWrongAt:attempt.createdAt,
      wrongCount,
      title:task.title,
      prompt:task.prompt,
    });
  }
  return [...active.values()].sort((a,b)=>b.wrongCount-a.wrongCount||b.lastWrongAt.localeCompare(a.lastWrongAt));
}

export function saveReviewQueue(taskIds:string[]){
  if(typeof localStorage==='undefined')return;
  const unique=[...new Set(taskIds)].filter(id=>taskBank.has(id));
  localStorage.setItem(REVIEW_QUEUE_KEY,JSON.stringify(unique));
}

export function loadReviewQueue(state?:LearnerState){
  if(typeof localStorage!=='undefined'){
    try{
      const parsed=JSON.parse(localStorage.getItem(REVIEW_QUEUE_KEY)??'[]') as string[];
      const valid=parsed.filter(id=>taskBank.has(id));
      if(valid.length)return valid;
    }catch{/* ignore corrupted queue */}
  }
  return state?buildActiveErrors(state).slice(0,5).map(error=>error.taskId):[];
}

export function clearReviewQueue(){
  if(typeof localStorage!=='undefined')localStorage.removeItem(REVIEW_QUEUE_KEY);
}
