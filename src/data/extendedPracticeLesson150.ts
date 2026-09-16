import {lessonOneHundredFiftyPractice} from './lessonOneHundredFiftyPractice';
import type {ExtendedPracticeSet} from './extendedPracticeTypes';

export const extendedPracticeLesson150:ExtendedPracticeSet={
  title:'Обязательная практика: нахождение числа по его процентам',
  subtitle:'Восстанавливаем 100% по известной процентной части и проверяем решение обратным вычислением.',
  estimatedMinutes:25,
  tasks:lessonOneHundredFiftyPractice.map(task=>({
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
