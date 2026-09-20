import {lessonOneHundredSixtySevenPractice} from './lessonOneHundredSixtySevenPractice';
import type {ExtendedPracticeSet} from './extendedPracticeTypes';

export const extendedPracticeLesson167:ExtendedPracticeSet={
  title:'Обязательная практика: комбинаторные задачи',
  subtitle:'Полный перебор, дерево вариантов, правила произведения и суммы, порядок, ограничения и повторения.',
  estimatedMinutes:25,
  tasks:lessonOneHundredSixtySevenPractice.map(task=>({
    id:`extended-${task.id}`,
    type:'multi-input' as const,
    prompt:task.prompt,
    instruction:'Организуй перебор на бумаге или используй правило произведения/суммы. Заполни все поля числами.',
    fields:task.fields.map(field=>({...field,validation:'exact-decimal' as const})),
    hint:task.hint,
    explanation:task.explanation,
    provenance:'curated' as const,
  })),
};
