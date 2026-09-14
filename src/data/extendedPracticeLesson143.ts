import {lessonOneHundredFortyThreePractice} from './lessonOneHundredFortyThreePractice';
import type {ExtendedPracticeSet} from './extendedPracticeTypes';

export const extendedPracticeLesson143:ExtendedPracticeSet={
  title:'Обязательная практика: среднее арифметическое',
  subtitle:'Закрепляем среднее арифметическое, средние величины, среднюю скорость и обратные задачи по §36.',
  estimatedMinutes:25,
  tasks:lessonOneHundredFortyThreePractice.map(task=>({
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
