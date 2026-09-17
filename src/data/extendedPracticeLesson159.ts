import {lessonOneHundredFiftyNinePractice} from './lessonOneHundredFiftyNinePractice';
import type {ExtendedPracticeSet} from './extendedPracticeTypes';

export const extendedPracticeLesson159:ExtendedPracticeSet={
  title:'Обязательная практика: обыкновенные дроби',
  subtitle:'Итоговое повторение дробей, смешанных чисел, действий и задач на часть целого.',
  estimatedMinutes:25,
  tasks:lessonOneHundredFiftyNinePractice.map(task=>({
    id:`extended-${task.id}`,
    type:'multi-input' as const,
    prompt:task.prompt,
    instruction:'Реши задачу полностью на бумаге и заполни все поля. Дробь можно записывать через косую черту.',
    fields:task.fields.map(field=>({...field,validation:'loose' as const})),
    hint:task.hint,
    explanation:task.explanation,
    provenance:'curated' as const,
  })),
};
