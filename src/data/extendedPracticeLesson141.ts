import {lessonOneHundredFortyOnePractice} from './lessonOneHundredFortyOnePractice';
import type {ExtendedPracticeSet} from './extendedPracticeTypes';

export const extendedPracticeLesson141:ExtendedPracticeSet={
  title:'Обязательная практика: итог §35',
  subtitle:'Закрепляем уравнения, производительность, перенос запятой и смешанные задачи на деление перед контрольной работой №8.',
  estimatedMinutes:25,
  tasks:lessonOneHundredFortyOnePractice.map(task=>({
    id:`extended-${task.id}`,
    type:'multi-input' as const,
    prompt:task.prompt,
    instruction:'Реши задачу полностью на бумаге и заполни все поля. Проверка засчитывается только целиком.',
    fields:task.fields.map(field=>({...field,validation:'decimal' as const})),
    hint:task.hint,
    explanation:task.explanation,
    provenance:'curated' as const,
  })),
};
