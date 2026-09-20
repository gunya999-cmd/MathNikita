import {lessonOneHundredSeventyThreePractice} from './lessonOneHundredSeventyThreePractice';
import type {ExtendedPracticeSet} from './extendedPracticeTypes';

export const extendedPracticeLesson173:ExtendedPracticeSet={
  title:'Обязательная практика: итоговая диагностика курса',
  subtitle:'Смешанная проверка восьми областей курса перед генеральной репетицией и итоговой контрольной.',
  estimatedMinutes:30,
  tasks:lessonOneHundredSeventyThreePractice.map(task=>({
    id:`extended-${task.id}`,
    type:'multi-input' as const,
    prompt:`${task.domain}. ${task.prompt}`,
    instruction:'Решай без подсказки названия алгоритма. Записывай промежуточные действия и обязательно проверяй ответ по смыслу.',
    fields:task.fields.map(field=>({...field,validation:'exact-decimal' as const})),
    hint:task.hint,
    explanation:task.explanation,
    provenance:'curated' as const,
  })),
};
