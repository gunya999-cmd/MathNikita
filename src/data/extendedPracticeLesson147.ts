import {lessonOneHundredFortySevenPractice} from './lessonOneHundredFortySevenPractice';
import type {ExtendedPracticeSet} from './extendedPracticeTypes';

export const extendedPracticeLesson147:ExtendedPracticeSet={
  title:'Обязательная практика: проценты и десятичные дроби',
  subtitle:'Закрепляем перевод процентов в десятичные дроби и обратно, а также нахождение процентов от числа.',
  estimatedMinutes:25,
  tasks:lessonOneHundredFortySevenPractice.map(task=>({
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