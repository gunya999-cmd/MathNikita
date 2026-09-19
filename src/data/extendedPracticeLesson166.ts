import {lessonOneHundredSixtySixPractice} from './lessonOneHundredSixtySixPractice';
import type {ExtendedPracticeSet} from './extendedPracticeTypes';

export const extendedPracticeLesson166:ExtendedPracticeSet={
  title:'Обязательная практика: измерение и построение углов',
  subtitle:'Итоговое повторение видов углов, градусной меры, прямого и развёрнутого угла, биссектрисы и составных углов.',
  estimatedMinutes:25,
  tasks:lessonOneHundredSixtySixPractice.map(task=>({
    id:`extended-${task.id}`,
    type:'multi-input' as const,
    prompt:task.prompt,
    instruction:'Реши задачу полностью, запиши градусные меры и заполни все поля числами без знака градуса.',
    fields:task.fields.map(field=>({...field,validation:'exact-decimal' as const})),
    hint:task.hint,
    explanation:task.explanation,
    provenance:'curated' as const,
  })),
};
