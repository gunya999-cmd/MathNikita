import {lessonOneHundredSixtyNinePractice} from './lessonOneHundredSixtyNinePractice';
import type {ExtendedPracticeSet} from './extendedPracticeTypes';

export const extendedPracticeLesson169:ExtendedPracticeSet={
  title:'Обязательная практика: решение текстовых задач',
  subtitle:'Первый итоговый урок текстовых задач: математическая модель, движение, покупки, части, проценты, геометрия и простые уравнения.',
  estimatedMinutes:25,
  tasks:lessonOneHundredSixtyNinePractice.map(task=>({
    id:`extended-${task.id}`,
    type:'multi-input' as const,
    prompt:task.prompt,
    instruction:'Запиши модель и вычисления на бумаге, проверь единицы и введи в поля только числовые ответы без единиц.',
    fields:task.fields.map(field=>({...field,validation:'exact-decimal' as const})),
    hint:task.hint,
    explanation:task.explanation,
    provenance:'curated' as const,
  })),
};
