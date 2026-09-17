import {lessonOneHundredFiftySevenPractice} from './lessonOneHundredFiftySevenPractice';
import type {ExtendedPracticeSet} from './extendedPracticeTypes';

export const extendedPracticeLesson157:ExtendedPracticeSet={
  title:'Обязательная практика: натуральные числа',
  subtitle:'Итоговое повторение арифметических действий, уравнений и текстовых задач с натуральными числами.',
  estimatedMinutes:25,
  tasks:lessonOneHundredFiftySevenPractice.map(task=>({
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
