import {lessonOneHundredFiftyTwoPractice} from './lessonOneHundredFiftyTwoPractice';
import type {ExtendedPracticeSet} from './extendedPracticeTypes';

export const extendedPracticeLesson152:ExtendedPracticeSet={
  title:'Обязательная практика: составные задачи §38',
  subtitle:'Находим скрытый процент, восстанавливаем 100% и соединяем прямые и обратные процентные шаги.',
  estimatedMinutes:25,
  tasks:lessonOneHundredFiftyTwoPractice.map(task=>({
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
