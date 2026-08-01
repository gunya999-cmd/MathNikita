import { expect,test } from '@playwright/test';
import { extendedPracticeByLesson,extendedPracticeLessonNumbers } from '../src/data/extendedPracticeData';
import { isExtendedPracticeAnswerCorrect,normalizePracticeAnswer } from '../src/extendedPracticeEngine';

test('all nineteen lessons contain eight valid extended-practice tasks',()=>{
  expect(extendedPracticeLessonNumbers.sort((a,b)=>a-b)).toEqual([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19]);
  const allTasks=extendedPracticeLessonNumbers.flatMap(number=>extendedPracticeByLesson[number].tasks);
  expect(allTasks).toHaveLength(152);
  expect(new Set(allTasks.map(task=>task.id)).size).toBe(152);
  expect(allTasks.filter(task=>task.type==='input').length).toBeGreaterThanOrEqual(79);
  for(const number of extendedPracticeLessonNumbers){
    const practice=extendedPracticeByLesson[number];
    expect(practice.tasks,`lesson ${number}`).toHaveLength(8);
    expect(practice.estimatedMinutes).toBeGreaterThanOrEqual(14);
    for(const task of practice.tasks){
      expect(task.prompt.trim()).not.toBe('');
      expect(task.hint.trim()).not.toBe('');
      expect(task.explanation.trim()).not.toBe('');
      if(task.type==='choice')expect(task.options).toContain(task.answer);
      else expect(task.answers.length).toBeGreaterThan(0);
    }
  }
});

test('practice checking accepts formatted numeric and unit answers',()=>{
  expect(normalizePracticeAnswer('3 000 000 + 40 000 + 200 + 5')).toBe('3000000+40000+200+5');
  expect(isExtendedPracticeAnswerCorrect(extendedPracticeByLesson[4].tasks[6],'3 000 000 + 40 000 + 200 + 5')).toBe(true);
  expect(isExtendedPracticeAnswerCorrect(extendedPracticeByLesson[7].tasks[1],'4 м 80 см')).toBe(true);
  expect(isExtendedPracticeAnswerCorrect(extendedPracticeByLesson[7].tasks[1],'4 м 8 см')).toBe(false);
  expect(isExtendedPracticeAnswerCorrect(extendedPracticeByLesson[13].tasks[1],'150 г')).toBe(true);
  expect(isExtendedPracticeAnswerCorrect(extendedPracticeByLesson[14].tasks[0],'8')).toBe(true);
  expect(isExtendedPracticeAnswerCorrect(extendedPracticeByLesson[15].tasks[0],'6')).toBe(true);
  expect(isExtendedPracticeAnswerCorrect(extendedPracticeByLesson[16].tasks[1],'>')).toBe(true);
  expect(isExtendedPracticeAnswerCorrect(extendedPracticeByLesson[17].tasks[0],'84 < 91')).toBe(true);
  expect(isExtendedPracticeAnswerCorrect(extendedPracticeByLesson[18].tasks[7],'5 007')).toBe(true);
  expect(isExtendedPracticeAnswerCorrect(extendedPracticeByLesson[19].tasks[7],'7 941')).toBe(true);
});
