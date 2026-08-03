import type { ExtendedPracticeTask } from './data/extendedPracticeData';

export type ExtendedPracticeResponse = string | Record<string,string>;

const PRACTICE_VERSION_BY_LESSON:Record<number,number>={5:2,6:3,9:2,10:2,11:2,12:2,13:2,14:2,15:2};

export function extendedPracticeStorageKey(lessonNumber:number){
  const version=PRACTICE_VERSION_BY_LESSON[lessonNumber]??1;
  return `mathnikita:extended-practice:${lessonNumber}:v${version}`;
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

export function isExtendedPracticeAnswerCorrect(task:ExtendedPracticeTask,response:ExtendedPracticeResponse){
  if(task.type==='multi-input'){
    if(typeof response==='string')return false;
    return task.fields.every(field=>{
      const normalized=normalizePracticeAnswer(response[field.id]??'');
      return field.answers.some(answer=>normalized===normalizePracticeAnswer(answer));
    });
  }
  if(typeof response!=='string')return false;
  const normalized=normalizePracticeAnswer(response);
  if(task.type==='choice')return normalized===normalizePracticeAnswer(task.answer);
  return task.answers.some(answer=>normalized===normalizePracticeAnswer(answer));
}
