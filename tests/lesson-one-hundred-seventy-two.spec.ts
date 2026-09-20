import {expect,test} from '@playwright/test';
import {lessonOneHundredSeventyTwoPractice,lessonOneHundredSeventyTwoResponseCount} from '../src/data/lessonOneHundredSeventyTwoPractice';
import {extendedPracticeByLesson} from '../src/data/extendedPracticeData';
import {exactDecimalEquals} from '../src/exactDecimal';

test('lesson 172 has 20 tasks and exactly 50 checked responses',()=>{
  expect(lessonOneHundredSeventyTwoPractice).toHaveLength(20);
  expect(lessonOneHundredSeventyTwoResponseCount).toBe(50);
  expect(lessonOneHundredSeventyTwoPractice.reduce((sum,task)=>sum+task.fields.length,0)).toBe(50);
});

test('lesson 172 is authored expressions formulas equations review',()=>{
  expect(lessonOneHundredSeventyTwoPractice.every(task=>task.sourceExact!==true)).toBe(true);
  const sources=lessonOneHundredSeventyTwoPractice.map(task=>task.source).join(' ');
  expect(sources).toContain('КТП 172');
  expect(sources).toContain('выражения, формулы и уравнения');
});

test('lesson 172 keeps strict decimal equality',()=>{
  expect(exactDecimalEquals('138,7500','138.75')).toBe(true);
  expect(exactDecimalEquals('7.500','7.5')).toBe(true);
  expect(exactDecimalEquals('7.5001','7.5')).toBe(false);
  expect(exactDecimalEquals('15/2','7.5')).toBe(false);
});

test('lesson 172 mandatory practice mirrors all 50 fields',()=>{
  const set=extendedPracticeByLesson[172];
  expect(set).toBeTruthy();
  expect(set.tasks).toHaveLength(20);
  expect(set.tasks.reduce((sum,task)=>sum+(task.type==='multi-input'?task.fields.length:1),0)).toBe(50);
  for(const task of set.tasks)if(task.type==='multi-input')for(const field of task.fields)expect(field.validation).toBe('exact-decimal');
});
