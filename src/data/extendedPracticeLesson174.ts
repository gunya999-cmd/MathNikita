import {lessonOneHundredSeventyFourPractice} from './lessonOneHundredSeventyFourPractice';
import type {ExtendedPracticeSet} from './extendedPracticeTypes';

export const extendedPracticeLesson174:ExtendedPracticeSet={
  title:'Обязательная практика: генеральная репетиция',
  subtitle:'Смешанный вариант перед итоговой контрольной №175. Темы не подписаны: распознай способ решения самостоятельно.',
  estimatedMinutes:40,
  tasks:lessonOneHundredSeventyFourPractice.map(task=>({
    id:`extended-${task.id}`,
    type:'multi-input' as const,
    prompt:task.prompt,
    instruction:'Решай без подсказки темы. Записывай промежуточные действия на бумаге и проверяй ответ перед вводом.',
    fields:task.fields.map(field=>({...field,validation:'exact-decimal' as const})),
    hint:'Режим репетиции: сначала перепроверь решение самостоятельно, не меняя модель случайным перебором.',
    explanation:task.explanation,
    provenance:'curated' as const,
  })),
};
