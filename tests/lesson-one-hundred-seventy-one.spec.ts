import {expect,test} from '@playwright/test';
import {lessonOneHundredSeventyOnePractice,lessonOneHundredSeventyOneResponseCount} from '../src/data/lessonOneHundredSeventyOnePractice';
import {extendedPracticeByLesson} from '../src/data/extendedPracticeData';
import {exactDecimalEquals} from '../src/exactDecimal';

test('lesson 171 has 20 tasks and exactly 50 checked responses',()=>{
  expect(lessonOneHundredSeventyOnePractice).toHaveLength(20);
  expect(lessonOneHundredSeventyOneResponseCount).toBe(50);
  expect(lessonOneHundredSeventyOnePractice.reduce((sum,task)=>sum+task.fields.length,0)).toBe(50);
});

test('lesson 171 is authored final mixed text-problem review',()=>{
  expect(lessonOneHundredSeventyOnePractice.every(task=>task.sourceExact!==true)).toBe(true);
  const sources=lessonOneHundredSeventyOnePractice.map(task=>task.source).join(' ');
  expect(sources).toContain('КТП 171');
  expect(sources).toContain('решение текстовых задач');
  expect(sources).not.toContain('№1192');
  expect(sources).not.toContain('§24');
});

test('lesson 171 keeps strict decimal equality across mixed models',()=>{
  expect(exactDecimalEquals('3,2500','3.25')).toBe(true);
  expect(exactDecimalEquals('22.500','22.5')).toBe(true);
  expect(exactDecimalEquals('22.5001','22.5')).toBe(false);
  expect(exactDecimalEquals('13/4','3.25')).toBe(false);
});

test('lesson 171 mandatory practice mirrors all 50 fields',()=>{
  const set=extendedPracticeByLesson[171];
  expect(set).toBeTruthy();
  expect(set.tasks).toHaveLength(20);
  expect(set.tasks.reduce((sum,task)=>sum+(task.type==='multi-input'?task.fields.length:1),0)).toBe(50);
  for(const task of set.tasks)if(task.type==='multi-input')for(const field of task.fields)expect(field.validation).toBe('exact-decimal');
});
