import {expect,test} from '@playwright/test';
import {lessonOneHundredSixtySevenPractice,lessonOneHundredSixtySevenResponseCount} from '../src/data/lessonOneHundredSixtySevenPractice';
import {extendedPracticeByLesson} from '../src/data/extendedPracticeData';
import {exactDecimalEquals} from '../src/exactDecimal';

test('lesson 167 has 20 tasks and exactly 50 checked responses',()=>{
  expect(lessonOneHundredSixtySevenPractice).toHaveLength(20);
  expect(lessonOneHundredSixtySevenResponseCount).toBe(50);
  expect(lessonOneHundredSixtySevenPractice.reduce((sum,task)=>sum+task.fields.length,0)).toBe(50);
});

test('lesson 167 follows combinatorics §24 without carrying shifted angle references',()=>{
  const sources=lessonOneHundredSixtySevenPractice.map(task=>task.source).join(' ');
  expect(sources).toContain('§24');
  expect(lessonOneHundredSixtySevenPractice.every(task=>task.sourceExact!==true)).toBe(true);
  expect(sources).not.toContain('№1189');
  expect(sources).not.toContain('№1191');
  expect(sources).not.toContain('№1192');
});

test('lesson 167 keeps strict exact answer matching',()=>{
  expect(exactDecimalEquals('12.0','12')).toBe(true);
  expect(exactDecimalEquals('10000,000','10000')).toBe(true);
  expect(exactDecimalEquals('11.0001','11')).toBe(false);
  expect(exactDecimalEquals('24/2','12')).toBe(false);
});

test('lesson 167 mandatory practice is registered with 50 exact-decimal fields',()=>{
  const set=extendedPracticeByLesson[167];
  expect(set).toBeTruthy();
  expect(set.tasks).toHaveLength(20);
  expect(set.tasks.reduce((sum,task)=>sum+(task.type==='multi-input'?task.fields.length:1),0)).toBe(50);
  for(const task of set.tasks)if(task.type==='multi-input')for(const field of task.fields)expect(field.validation).toBe('exact-decimal');
});
