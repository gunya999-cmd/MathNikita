import {lessonOneHundredSixtyOnePractice} from './lessonOneHundredSixtyOnePractice';
import type {ExtendedPracticeSet} from './extendedPracticeTypes';

export const extendedPracticeLesson161:ExtendedPracticeSet={
  title:'Обязательная практика: умножение и деление десятичных дробей',
  subtitle:'Итоговое повторение умножения, деления, уравнений и прикладных задач с десятичными дробями.',
  estimatedMinutes:25,
  tasks:lessonOneHundredSixtyOnePractice.map(task=>({
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
