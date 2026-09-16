import {lessonOneHundredFortyNinePractice} from './lessonOneHundredFortyNinePractice';
import type {ExtendedPracticeSet} from './extendedPracticeTypes';

export const extendedPracticeLesson149:ExtendedPracticeSet={
  title:'Обязательная практика: итог §37 и смена базы процента',
  subtitle:'Закрепляем последовательные процентные изменения, проценты от остатка и итоговые задачи §37.',
  estimatedMinutes:25,
  tasks:lessonOneHundredFortyNinePractice.map(task=>({
    id:`extended-${task.id}`,
    type:'multi-input' as const,
    prompt:task.prompt,
    instruction:'Реши задачу полностью на бумаге и заполни все поля. Проверка засчитывается только целиком.',
    fields:task.fields.map(field=>({...field,validation:'exact-decimal' as const})),
    hint:task.hint,
    explanation:task.explanation,
    provenance:'curated' as const,
  })),
};
