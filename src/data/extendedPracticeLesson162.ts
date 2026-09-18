import {lessonOneHundredSixtyTwoPractice} from './lessonOneHundredSixtyTwoPractice';
import type {ExtendedPracticeSet} from './extendedPracticeTypes';

export const extendedPracticeLesson162:ExtendedPracticeSet={
  title:'Обязательная практика: проценты от числа и число по его процентам',
  subtitle:'Итоговое повторение прямых и обратных процентных задач, скидок, наценок и задач с меняющейся базой 100%.',
  estimatedMinutes:25,
  tasks:lessonOneHundredSixtyTwoPractice.map(task=>({
    id:`extended-${task.id}`,
    type:'multi-input' as const,
    prompt:task.prompt,
    instruction:'Реши задачу полностью на бумаге и заполни все поля. Для процентов сначала определи базу 100%.',
    fields:task.fields.map(field=>({...field,validation:'exact-decimal' as const})),
    hint:task.hint,
    explanation:task.explanation,
    provenance:'curated' as const,
  })),
};
