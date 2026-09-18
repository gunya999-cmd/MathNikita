import {lessonOneHundredSixtyFourPractice} from './lessonOneHundredSixtyFourPractice';
import type {ExtendedPracticeSet} from './extendedPracticeTypes';

export const extendedPracticeLesson164:ExtendedPracticeSet={
  title:'Обязательная практика: многоугольники и периметр',
  subtitle:'Итоговое повторение сторон и вершин многоугольника, периметра, правильных многоугольников и неизвестной стороны.',
  estimatedMinutes:25,
  tasks:lessonOneHundredSixtyFourPractice.map(task=>({
    id:`extended-${task.id}`,
    type:'multi-input' as const,
    prompt:task.prompt,
    instruction:'Реши задачу полностью на бумаге и заполни все поля. В числовых полях вводи ответ без единицы измерения.',
    fields:task.fields.map(field=>({...field,validation:'exact-decimal' as const})),
    hint:task.hint,
    explanation:task.explanation,
    provenance:'curated' as const,
  })),
};
