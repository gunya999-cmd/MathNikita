import type { ExtendedPracticeTask } from './data/extendedPracticeData';

export function extendedPracticeStorageKey(lessonNumber:number){
  return `mathnikita:extended-practice:${lessonNumber}:v1`;
}

export function normalizePracticeAnswer(value:string){
  return value
    .normalize('NFKC')
    .toLocaleLowerCase('ru-RU')
    .replace(/ё/g,'е')
    .replace(/[\s.,;:!?()[\]{}'"«»]/g,'')
    .replace(/[−–—]/g,'-');
}

export function loadExtendedPracticeProgress(lessonNumber:number,taskCount:number){
  try{
    const value=Number(window.localStorage.getItem(extendedPracticeStorageKey(lessonNumber))??0);
    return Math.max(0,Math.min(taskCount,Number.isFinite(value)?value:0));
  }catch{return 0}
}

export function saveExtendedPracticeProgress(lessonNumber:number,completed:number){
  window.localStorage.setItem(extendedPracticeStorageKey(lessonNumber),String(completed));
}

export function isExtendedPracticeAnswerCorrect(task:ExtendedPracticeTask,response:string){
  const normalized=normalizePracticeAnswer(response);
  if(task.type==='choice')return normalized===normalizePracticeAnswer(task.answer);
  return task.answers.some(answer=>normalized===normalizePracticeAnswer(answer));
}
