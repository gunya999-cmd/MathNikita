import {expect,test} from '@playwright/test';
import {lessonOneHundredSeventyPractice,lessonOneHundredSeventyResponseCount} from '../src/data/lessonOneHundredSeventyPractice';
import {extendedPracticeByLesson} from '../src/data/extendedPracticeData';
import {exactDecimalEquals} from '../src/exactDecimal';

test('lesson 170 has 20 tasks and exactly 50 checked responses',()=>{
  expect(lessonOneHundredSeventyPractice).toHaveLength(20);
  expect(lessonOneHundredSeventyResponseCount).toBe(50);
  expect(lessonOneHundredSeventyPractice.reduce((sum,task)=>sum+task.fields.length,0)).toBe(50);
});

test('lesson 170 is authored multi-step text-problem review',()=>{
  expect(lessonOneHundredSeventyPractice.every(task=>task.sourceExact!==true)).toBe(true);
  const sources=lessonOneHundredSeventyPractice.map(task=>task.source).join(' ');
  expect(sources).toContain('решение текстовых задач');
  expect(sources).not.toContain('№1192');
  expect(sources).not.toContain('§24');
});

test('lesson 170 keeps strict decimal equality for multi-step values',()=>{
  expect(exactDecimalEquals('2,400','2.4')).toBe(true);
  expect(exactDecimalEquals('2.7000','2.7')).toBe(true);
  expect(exactDecimalEquals('2.4001','2.4')).toBe(false);
  expect(exactDecimalEquals('12/5','2.4')).toBe(false);
});

test('lesson 170 mandatory practice mirrors all 50 fields',()=>{
  const set=extendedPracticeByLesson[170];
  expect(set).toBeTruthy();
  expect(set.tasks).toHaveLength(20);
  expect(set.tasks.reduce((sum,task)=>sum+(task.type==='multi-input'?task.fields.length:1),0)).toBe(50);
  for(const task of set.tasks)if(task.type==='multi-input')for(const field of task.fields)expect(field.validation).toBe('exact-decimal');
});
