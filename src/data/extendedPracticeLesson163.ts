import {lessonOneHundredSixtyThreePractice} from './lessonOneHundredSixtyThreePractice';
import type {ExtendedPracticeSet} from './extendedPracticeTypes';

export const extendedPracticeLesson163:ExtendedPracticeSet={
  title:'Обязательная практика: составные и обратные проценты',
  subtitle:'Индивидуальные задания §§37–38: последовательные изменения, смена базы 100%, процент от части и обратное восстановление.',
  estimatedMinutes:25,
  tasks:lessonOneHundredSixtyThreePractice.map(task=>({
    id:`extended-${task.id}`,
    type:'multi-input' as const,
    prompt:task.prompt,
    instruction:'Реши все процентные шаги по порядку и заполни поля. Перед каждым шагом определи текущую базу 100%.',
    fields:task.fields.map(field=>({...field,validation:'exact-decimal' as const})),
    hint:task.hint,
    explanation:task.explanation,
    provenance:'curated' as const,
  })),
};
