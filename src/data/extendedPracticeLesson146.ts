import {lessonOneHundredFortySixPractice} from './lessonOneHundredFortySixPractice';
import type {ExtendedPracticeSet} from './extendedPracticeTypes';

export const extendedPracticeLesson146:ExtendedPracticeSet={
  title:'Обязательная практика: проценты',
  subtitle:'Закрепляем смысл процента, нахождение процентов от числа, перевод процентов и задачи на изменение величины.',
  estimatedMinutes:25,
  tasks:lessonOneHundredFortySixPractice.map(task=>({
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
