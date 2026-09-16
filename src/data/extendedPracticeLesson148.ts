import {lessonOneHundredFortyEightPractice} from './lessonOneHundredFortyEightPractice';
import type {ExtendedPracticeSet} from './extendedPracticeTypes';

export const extendedPracticeLesson148:ExtendedPracticeSet={
  title:'Обязательная практика: составные задачи на проценты',
  subtitle:'Закрепляем остаток до 100%, несколько процентных частей, увеличение и проценты больше 100%.',
  estimatedMinutes:25,
  tasks:lessonOneHundredFortyEightPractice.map(task=>({
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
