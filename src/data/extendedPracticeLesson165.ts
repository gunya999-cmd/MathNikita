import {lessonOneHundredSixtyFivePractice} from './lessonOneHundredSixtyFivePractice';
import type {ExtendedPracticeSet} from './extendedPracticeTypes';

export const extendedPracticeLesson165:ExtendedPracticeSet={
  title:'Обязательная практика: площади и объёмы',
  subtitle:'Итоговое повторение площади прямоугольника и квадрата, квадратных и кубических единиц, прямоугольного параллелепипеда, куба и объёма.',
  estimatedMinutes:25,
  tasks:lessonOneHundredSixtyFivePractice.map(task=>({
    id:`extended-${task.id}`,
    type:'multi-input' as const,
    prompt:task.prompt,
    instruction:'Реши задачу полностью на бумаге, выбери формулу площади или объёма и заполни все поля числами без единиц измерения.',
    fields:task.fields.map(field=>({...field,validation:'exact-decimal' as const})),
    hint:task.hint,
    explanation:task.explanation,
    provenance:'curated' as const,
  })),
};
