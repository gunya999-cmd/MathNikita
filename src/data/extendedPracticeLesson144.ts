import {lessonOneHundredFortyFourPractice} from './lessonOneHundredFortyFourPractice';
import type {ExtendedPracticeSet} from './extendedPracticeTypes';

export const extendedPracticeLesson144:ExtendedPracticeSet={
  title:'Обязательная практика: обратные задачи на среднее',
  subtitle:'Закрепляем восстановление суммы, неизвестных значений, среднюю цену, среднюю скорость и объединение групп по §36.',
  estimatedMinutes:25,
  tasks:lessonOneHundredFortyFourPractice.map(task=>({
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
