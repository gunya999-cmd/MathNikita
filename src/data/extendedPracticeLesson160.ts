import {lessonOneHundredSixtyPractice} from './lessonOneHundredSixtyPractice';
import type {ExtendedPracticeSet} from './extendedPracticeTypes';

export const extendedPracticeLesson160:ExtendedPracticeSet={
  title:'Обязательная практика: сложение и вычитание десятичных дробей',
  subtitle:'Итоговое повторение разрядной записи, действий, уравнений и прикладных задач с десятичными дробями.',
  estimatedMinutes:25,
  tasks:lessonOneHundredSixtyPractice.map(task=>({
    id:`extended-${task.id}`,
    type:'multi-input' as const,
    prompt:task.prompt,
    instruction:'Реши задачу полностью на бумаге и заполни все поля. Используй десятичную запись; запятая или точка допустимы.',
    fields:task.fields.map(field=>({...field,validation:'exact-decimal' as const})),
    hint:task.hint,
    explanation:task.explanation,
    provenance:'curated' as const,
  })),
};
