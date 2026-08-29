import type { ExtendedPracticeTask } from './data/extendedPracticeTypes';

function safeToken(value:string){return value.toLowerCase().replace(/[^a-z0-9-]+/g,'-').replace(/^-+|-+$/g,'').slice(0,96)}

export function practiceNarrationId(lessonNumber:number,task:ExtendedPracticeTask){
  return `lesson-${String(lessonNumber).padStart(2,'0')}-practice-${safeToken(task.id)}`;
}

export function practiceNarrationText(task:ExtendedPracticeTask,index:number,total:number){
  const parts=[`Задание ${index+1} из ${total}.`,task.prompt,task.instruction??''];
  if(task.type==='choice')parts.push(`Варианты ответа: ${task.options.join('; ')}.`);
  if(task.type==='multi-input')parts.push(`Нужно заполнить: ${task.fields.map(field=>field.label).join('; ')}.`);
  return parts.filter(Boolean).join(' ');
}
