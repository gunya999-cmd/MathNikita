import {lessonOneHundredSeventyOnePractice} from './lessonOneHundredSeventyOnePractice';
import type {ExtendedPracticeSet} from './extendedPracticeTypes';

export const extendedPracticeLesson171:ExtendedPracticeSet={
  title:'Обязательная практика: итоговый тренажёр текстовых задач',
  subtitle:'Финальный урок блока: самостоятельный выбор модели, обратные задачи, движение, проценты и доли, среднее, производительность, геометрия и единицы измерения.',
  estimatedMinutes:30,
  tasks:lessonOneHundredSeventyOnePractice.map(task=>({
    id:`extended-${task.id}`,
    type:'multi-input' as const,
    prompt:task.prompt,
    instruction:'Сначала назови модель задачи и запиши план решения на бумаге. Затем выполни вычисления, проверь единицы и заполни поля.',
    fields:task.fields.map(field=>({...field,validation:'exact-decimal' as const})),
    hint:task.hint,
    explanation:task.explanation,
    provenance:'curated' as const,
  })),
};
