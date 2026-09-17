import {lessonOneHundredFiftyEightPractice} from './lessonOneHundredFiftyEightPractice';
import type {ExtendedPracticeSet} from './extendedPracticeTypes';

export const extendedPracticeLesson158:ExtendedPracticeSet={
  title:'Обязательная практика: умножение и деление натуральных чисел',
  subtitle:'Итоговое повторение умножения, деления, порядка действий, уравнений и задач на производительность.',
  estimatedMinutes:25,
  tasks:lessonOneHundredFiftyEightPractice.map(task=>({
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
