import {lessonOneHundredFortyFivePractice} from './lessonOneHundredFortyFivePractice';
import type {ExtendedPracticeSet} from './extendedPracticeTypes';

export const extendedPracticeLesson145:ExtendedPracticeSet={
  title:'Обязательная практика: итог §36',
  subtitle:'Закрепляем объединение групп, среднюю цену, среднюю скорость, обратные задачи и округление.',
  estimatedMinutes:25,
  tasks:lessonOneHundredFortyFivePractice.map(task=>({
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
