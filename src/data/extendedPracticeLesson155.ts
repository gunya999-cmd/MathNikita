import {lessonOneHundredFiftyFivePractice} from './lessonOneHundredFiftyFivePractice';
import type {ExtendedPracticeSet} from './extendedPracticeTypes';

export const extendedPracticeLesson155:ExtendedPracticeSet={
  title:'Обязательная практика: репетиция контрольной №9',
  subtitle:'Смешанные карточки по §36–§38 без подсказки о типе задачи.',
  estimatedMinutes:25,
  tasks:lessonOneHundredFiftyFivePractice.map(task=>({
    id:`extended-${task.id}`,
    type:'multi-input' as const,
    prompt:task.prompt,
    instruction:'Реши карточку полностью на бумаге и заполни все поля. Проверка засчитывается только целиком.',
    fields:task.fields.map(field=>({...field,validation:'exact-decimal' as const})),
    hint:task.hint,
    explanation:task.explanation,
    provenance:'curated' as const,
  })),
};
