import {lessonOneHundredSixtyEightPractice} from './lessonOneHundredSixtyEightPractice';
import type {ExtendedPracticeSet} from './extendedPracticeTypes';

export const extendedPracticeLesson168:ExtendedPracticeSet={
  title:'Обязательная практика: продвинутые комбинаторные задачи',
  subtitle:'Второй урок §24: ограничения, дополнение, разбиение на случаи, порядок, выбор без повторов и обязательные элементы.',
  estimatedMinutes:25,
  tasks:lessonOneHundredSixtyEightPractice.map(task=>({
    id:`extended-${task.id}`,
    type:'multi-input' as const,
    prompt:task.prompt,
    instruction:'Реши задачу полностью на бумаге, зафиксируй способ подсчёта и заполни все поля числами.',
    fields:task.fields.map(field=>({...field,validation:'exact-decimal' as const})),
    hint:task.hint,
    explanation:task.explanation,
    provenance:'curated' as const,
  })),
};
