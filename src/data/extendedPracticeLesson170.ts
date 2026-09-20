import {lessonOneHundredSeventyPractice} from './lessonOneHundredSeventyPractice';
import type {ExtendedPracticeSet} from './extendedPracticeTypes';

export const extendedPracticeLesson170:ExtendedPracticeSet={
  title:'Обязательная практика: составные текстовые задачи',
  subtitle:'Второй урок итогового блока: несколько связанных шагов, движение с форой, последовательные проценты, обратные модели и проверка результата.',
  estimatedMinutes:25,
  tasks:lessonOneHundredSeventyPractice.map(task=>({
    id:`extended-${task.id}`,
    type:'multi-input' as const,
    prompt:task.prompt,
    instruction:'Реши задачу по шагам на бумаге. Подпиши смысл каждого промежуточного числа и только потом заполни поля.',
    fields:task.fields.map(field=>({...field,validation:'exact-decimal' as const})),
    hint:task.hint,
    explanation:task.explanation,
    provenance:'curated' as const,
  })),
};
