import {expect,test} from '@playwright/test';
import {lessonOneHundredSixtyNinePractice,lessonOneHundredSixtyNineResponseCount} from '../src/data/lessonOneHundredSixtyNinePractice';
import {extendedPracticeByLesson} from '../src/data/extendedPracticeData';
import {exactDecimalEquals} from '../src/exactDecimal';

test('lesson 169 has 20 tasks and exactly 50 checked responses',()=>{
  expect(lessonOneHundredSixtyNinePractice).toHaveLength(20);
  expect(lessonOneHundredSixtyNineResponseCount).toBe(50);
  expect(lessonOneHundredSixtyNinePractice.reduce((sum,task)=>sum+task.fields.length,0)).toBe(50);
});

test('lesson 169 is authored text-problem review and does not reuse shifted combinatorics homework',()=>{
  expect(lessonOneHundredSixtyNinePractice.every(task=>task.sourceExact!==true)).toBe(true);
  const sources=lessonOneHundredSixtyNinePractice.map(task=>task.source).join(' ');
  expect(sources).toContain('решение текстовых задач');
  expect(sources).not.toContain('№1192');
  expect(sources).not.toContain('§24');
});

test('lesson 169 keeps strict decimal equality',()=>{
  expect(exactDecimalEquals('129,500','129.5')).toBe(true);
  expect(exactDecimalEquals('2.500','2.5')).toBe(true);
  expect(exactDecimalEquals('129.5001','129.5')).toBe(false);
  expect(exactDecimalEquals('259/2','129.5')).toBe(false);
});

test('lesson 169 mandatory practice mirrors all 50 fields',()=>{
  const set=extendedPracticeByLesson[169];
  expect(set).toBeTruthy();
  expect(set.tasks).toHaveLength(20);
  expect(set.tasks.reduce((sum,task)=>sum+(task.type==='multi-input'?task.fields.length:1),0)).toBe(50);
  for(const task of set.tasks)if(task.type==='multi-input')for(const field of task.fields)expect(field.validation).toBe('exact-decimal');
});
