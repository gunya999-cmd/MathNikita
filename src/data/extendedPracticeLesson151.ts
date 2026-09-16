import {lessonOneHundredFiftyOnePractice} from './lessonOneHundredFiftyOnePractice';
import type {ExtendedPracticeSet} from './extendedPracticeTypes';

export const extendedPracticeLesson151:ExtendedPracticeSet={
  title:'Обязательная практика: прикладные обратные задачи на проценты',
  subtitle:'Восстанавливаем 100% в задачах на растворы, сушку, скидки, планы и проценты больше 100%.',
  estimatedMinutes:25,
  tasks:lessonOneHundredFiftyOnePractice.map(task=>({
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
