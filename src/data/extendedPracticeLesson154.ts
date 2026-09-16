import {lessonOneHundredFiftyFourPractice} from './lessonOneHundredFiftyFourPractice';
import type {ExtendedPracticeSet} from './extendedPracticeTypes';

export const extendedPracticeLesson154:ExtendedPracticeSet={
  title:'Обязательная практика: повторение §36–§38',
  subtitle:'Среднее арифметическое, проценты от числа и восстановление числа по процентам в смешанных задачах.',
  estimatedMinutes:25,
  tasks:lessonOneHundredFiftyFourPractice.map(task=>({
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
