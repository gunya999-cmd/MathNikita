import { expect,test } from '@playwright/test';
import { extendedPracticeByLesson,extendedPracticeLessonNumbers } from '../src/data/extendedPracticeData';
import { extendedPracticeSetResponseCount } from '../src/data/extendedPracticeTypes';
import { isExtendedPracticeAnswerCorrect,normalizePracticeAnswer } from '../src/extendedPracticeEngine';

test('all twenty-three lessons meet the mandatory mastery workload floor',()=>{
  expect(extendedPracticeLessonNumbers.sort((a,b)=>a-b)).toEqual([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23]);
  const allTasks=extendedPracticeLessonNumbers.flatMap(number=>extendedPracticeByLesson[number].tasks);
  expect(allTasks).toHaveLength(416);
  expect(new Set(allTasks.map(task=>task.id)).size).toBe(416);
  for(const number of extendedPracticeLessonNumbers){
    const practice=extendedPracticeByLesson[number];
    expect(practice.tasks.length,`lesson ${number} task count`).toBeGreaterThanOrEqual(18);
    expect(extendedPracticeSetResponseCount(practice),`lesson ${number} checked responses`).toBeGreaterThanOrEqual(48);
    expect(practice.estimatedMinutes).toBeGreaterThan(0);
    for(const task of practice.tasks){
      expect(task.prompt.trim()).not.toBe('');
      expect(task.hint.trim()).not.toBe('');
      expect(task.explanation.trim()).not.toBe('');
      if(task.type==='choice')expect(task.options).toContain(task.answer);
      else if(task.type==='input')expect(task.answers.length).toBeGreaterThan(0);
      else{
        expect(task.fields.length).toBeGreaterThanOrEqual(2);
        expect(new Set(task.fields.map(field=>field.id)).size).toBe(task.fields.length);
        for(const field of task.fields){
          expect(field.label.trim()).not.toBe('');
          expect(field.answers.length).toBeGreaterThan(0);
        }
      }
    }
  }
});

test('lesson 4 has a full mastery workload rather than a time label',()=>{
  const practice=extendedPracticeByLesson[4];
  expect(practice.tasks).toHaveLength(20);
  expect(extendedPracticeSetResponseCount(practice)).toBe(50);
  expect(practice.tasks.filter(task=>task.type==='multi-input')).toHaveLength(10);
});

test('generated mastery tasks are topic-specific across the course',()=>{
  expect(extendedPracticeByLesson[1].tasks.at(-1)?.prompt).toContain('Натуральный ряд');
  expect(extendedPracticeByLesson[3].tasks.at(-1)?.prompt).toContain('Паспорт многозначного числа');
  expect(extendedPracticeByLesson[7].tasks.at(-1)?.prompt).toContain('Точка C лежит между A и B');
  expect(extendedPracticeByLesson[8].tasks.at(-1)?.prompt).toContain('Ломаная состоит из звеньев');
  expect(extendedPracticeByLesson[11].tasks.at(-1)?.prompt).toContain('Рассмотри луч');
  expect(extendedPracticeByLesson[14].tasks.at(-1)?.prompt).toContain('координатном луче');
  expect(extendedPracticeByLesson[17].tasks.at(-1)?.prompt).toContain('Сравни');
  expect(extendedPracticeByLesson[19].tasks.at(-1)?.prompt).toContain('Смешанная проверка главы');
  expect(extendedPracticeByLesson[22].tasks.at(-1)?.prompt).toContain('Найди удобные пары');
});

test('practice checking accepts formatted, unit and multi-step answers',()=>{
  expect(normalizePracticeAnswer('3 000 000 + 40 000 + 200 + 5')).toBe('3000000+40000+200+5');
  expect(isExtendedPracticeAnswerCorrect(extendedPracticeByLesson[4].tasks[6],'3 000 000 + 40 000 + 200 + 5')).toBe(true);
  expect(isExtendedPracticeAnswerCorrect(extendedPracticeByLesson[4].tasks[8],{
    classes:'3',
    'ten-thousands':'0',
    'three-value':'300 000',
    'full-thousands':'8 305',
  })).toBe(true);
  expect(isExtendedPracticeAnswerCorrect(extendedPracticeByLesson[4].tasks[8],{
    classes:'3',
    'ten-thousands':'5',
    'three-value':'300 000',
    'full-thousands':'8 305',
  })).toBe(false);
  expect(isExtendedPracticeAnswerCorrect(extendedPracticeByLesson[7].tasks[1],'4 м 80 см')).toBe(true);
  expect(isExtendedPracticeAnswerCorrect(extendedPracticeByLesson[7].tasks[1],'4 м 8 см')).toBe(false);
  expect(isExtendedPracticeAnswerCorrect(extendedPracticeByLesson[13].tasks[1],'150 г')).toBe(true);
  expect(isExtendedPracticeAnswerCorrect(extendedPracticeByLesson[14].tasks[0],'8')).toBe(true);
  expect(isExtendedPracticeAnswerCorrect(extendedPracticeByLesson[15].tasks[0],'6')).toBe(true);
  expect(isExtendedPracticeAnswerCorrect(extendedPracticeByLesson[16].tasks[1],'>')).toBe(true);
  expect(isExtendedPracticeAnswerCorrect(extendedPracticeByLesson[17].tasks[0],'84 < 91')).toBe(true);
  expect(isExtendedPracticeAnswerCorrect(extendedPracticeByLesson[18].tasks[7],'5 007')).toBe(true);
  expect(isExtendedPracticeAnswerCorrect(extendedPracticeByLesson[19].tasks[7],'7 941')).toBe(true);
  expect(isExtendedPracticeAnswerCorrect(extendedPracticeByLesson[20].tasks[7],'9')).toBe(true);
  expect(isExtendedPracticeAnswerCorrect(extendedPracticeByLesson[21].tasks[2],'66 825')).toBe(true);
  expect(isExtendedPracticeAnswerCorrect(extendedPracticeByLesson[22].tasks[5],'13 мин 20 с')).toBe(true);
  expect(isExtendedPracticeAnswerCorrect(extendedPracticeByLesson[22].tasks[7],'120')).toBe(true);
  expect(isExtendedPracticeAnswerCorrect(extendedPracticeByLesson[23].tasks[5],'23 000')).toBe(true);
  expect(isExtendedPracticeAnswerCorrect(extendedPracticeByLesson[23].tasks[5],'22 000')).toBe(false);
  expect(isExtendedPracticeAnswerCorrect(extendedPracticeByLesson[23].tasks[7],'570')).toBe(true);
});
