import {lessonOneHundredFiftyThreePractice} from './lessonOneHundredFiftyThreePractice';
import type {ExtendedPracticeSet} from './extendedPracticeTypes';

export const extendedPracticeLesson153:ExtendedPracticeSet={
  title:'Обязательная практика: итог §38',
  subtitle:'Определяем базу процента, работаем с остатком и восстанавливаем исходные 100%.',
  estimatedMinutes:25,
  tasks:lessonOneHundredFiftyThreePractice.map(task=>({
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
