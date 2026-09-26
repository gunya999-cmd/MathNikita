import type { ExtendedPracticeTask } from './data/extendedPracticeData';
import { answersEquivalent } from './answerEquivalence';

export type ExtendedPracticeResponse = string | Record<string,string>;

const PRACTICE_VERSION_BY_LESSON:Record<number,number>={5:2,6:3,9:2,10:2,11:2,12:2,13:2,14:2,15:2,16:2};

export function extendedPracticeStorageKey(lessonNumber:number){
  const version=PRACTICE_VERSION_BY_LESSON[lessonNumber]??1;
  return `mathnikita:extended-practice:${lessonNumber}:v${version}`;
}

export function normalizePracticeAnswer(value:string){
  return value
    .normalize('NFKC')
    .toLocaleLowerCase('ru-RU')
    .replace(/ё/g,'е')
    .replace(/[\s.,;!?()[\]{}'"«»]/g,'')
    .replace(/[−–—]/g,'-');
}

export function normalizeDecimalPracticeAnswer(value:string){
  const normalized=value
    .normalize('NFKC')
    .toLocaleLowerCase('ru-RU')
    .replace(/ё/g,'е')
    .replace(/[\s\u00a0]+/g,'')
    .replace(/,/g,'.')
    .replace(/[−–—]/g,'-');
  if(!/^[+-]?\d+(?:\.\d+)?$/.test(normalized))return normalized;
  const numeric=Number(normalized);
  return Number.isFinite(numeric)?String(numeric):normalized;
}

export function normalizeExactDecimalPracticeAnswer(value:string):string|null{
  let normalized=value
    .normalize('NFKC')
    .toLocaleLowerCase('ru-RU')
    .replace(/ё/g,'е')
    .replace(/[\s\u00a0]+/g,'')
    .replace(/,/g,'.')
    .replace(/[−–—]/g,'-');
  if(!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(normalized))return null;
  let sign='';
  if(normalized.startsWith('+')||normalized.startsWith('-')){
    sign=normalized.startsWith('-')?'-':'';
    normalized=normalized.slice(1);
  }
  let[whole,frac='']=normalized.split('.');
  whole=(whole||'0').replace(/^0+(?=\d)/,'');
  frac=frac.replace(/0+$/,'');
  if(whole==='0'&&!frac)sign='';
  return `${sign}${whole}${frac?`.${frac}`:''}`;
}

function looksLikeIntegerSequence(value:string){
  const normalized=value.normalize('NFKC').trim();
  const tokens=normalized.split(/[\s,;|\\]+/).filter(Boolean);
  if(tokens.length<2||!tokens.every(token=>/^[+-]?\d+$/.test(token)))return false;
  if(tokens.length>=3)return true;
  return /[\s;|\\]/.test(normalized);
}

function containsMathematicalValue(value:string){
  return /\d|[+\-−–—/:=<>]/.test(value);
}

export function flexiblePracticeAnswerMatch(value:string,answer:string){
  if(looksLikeIntegerSequence(answer))return answersEquivalent(value,answer,'sequence');
  if(containsMathematicalValue(answer))return answersEquivalent(value,answer,'auto');
  if(normalizePracticeAnswer(value)===normalizePracticeAnswer(answer))return true;
  return answersEquivalent(value,answer,'auto');
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
      if(field.validation==='exact-decimal'){
        const normalized=normalizeExactDecimalPracticeAnswer(response[field.id]??'');
        return normalized!==null&&field.answers.some(answer=>normalized===normalizeExactDecimalPracticeAnswer(answer));
      }
      if(field.validation==='decimal'){
        const normalized=normalizeDecimalPracticeAnswer(response[field.id]??'');
        return field.answers.some(answer=>normalized===normalizeDecimalPracticeAnswer(answer));
      }
      return field.answers.some(answer=>flexiblePracticeAnswerMatch(response[field.id]??'',answer));
    });
  }
  if(typeof response!=='string')return false;
  if(task.type==='choice')return flexiblePracticeAnswerMatch(response,task.answer);
  return task.answers.some(answer=>flexiblePracticeAnswerMatch(response,answer));
}
