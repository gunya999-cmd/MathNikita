import {lessonOneHundredSeventyTwoPractice} from './lessonOneHundredSeventyTwoPractice';
import type {ExtendedPracticeSet} from './extendedPracticeTypes';

export const extendedPracticeLesson172:ExtendedPracticeSet={
  title:'Обязательная практика: выражения, формулы и уравнения',
  subtitle:'Итоговое повторение алгебраического языка курса: порядок действий, подстановка, формулы, обратные формулы и уравнения с проверкой.',
  estimatedMinutes:30,
  tasks:lessonOneHundredSeventyTwoPractice.map(task=>({
    id:`extended-${task.id}`,
    type:'multi-input' as const,
    prompt:task.prompt,
    instruction:'Запиши выражение или формулу на бумаге, отметь порядок действий и только затем вычисляй. Для уравнений сделай проверку подстановкой.',
    fields:task.fields.map(field=>({...field,validation:'exact-decimal' as const})),
    hint:task.hint,
    explanation:task.explanation,
    provenance:'curated' as const,
  })),
};
