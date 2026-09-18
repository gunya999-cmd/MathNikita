import {expect,test} from '@playwright/test';
import {lessonOneHundredSixtyOnePractice,lessonOneHundredSixtyOneResponseCount} from '../src/data/lessonOneHundredSixtyOnePractice';
import {extendedPracticeByLesson} from '../src/data/extendedPracticeData';
import {canonicalDecimal,exactDecimalEquals} from '../src/exactDecimal';

test('lesson 161 has 20 tasks and exactly 50 checked responses',()=>{
  expect(lessonOneHundredSixtyOnePractice).toHaveLength(20);
  expect(lessonOneHundredSixtyOneResponseCount).toBe(50);
  expect(lessonOneHundredSixtyOnePractice.reduce((sum,task)=>sum+task.fields.length,0)).toBe(50);
});

test('lesson 161 references KTP anchors without claiming unverified exact textbook wording',()=>{
  expect(lessonOneHundredSixtyOnePractice.some(task=>task.source.includes('№1127(3)'))).toBe(true);
  expect(lessonOneHundredSixtyOnePractice.some(task=>task.source.includes('№1127(4)'))).toBe(true);
  expect(lessonOneHundredSixtyOnePractice.some(task=>task.source.includes('№1152'))).toBe(true);
  expect(lessonOneHundredSixtyOnePractice.some(task=>task.source.includes('№1166'))).toBe(true);
  expect(lessonOneHundredSixtyOnePractice.every(task=>task.sourceExact!==true)).toBe(true);
});

test('lesson 161 uses strict decimal equality without float tolerance or fraction syntax',()=>{
  expect(exactDecimalEquals('12,500','12.5')).toBe(true);
  expect(exactDecimalEquals('0,1680','0.168')).toBe(true);
  expect(exactDecimalEquals('12.500001','12.5')).toBe(false);
  expect(exactDecimalEquals('25/2','12.5')).toBe(false);
  expect(canonicalDecimal('0009,000')).toBe('9');
});

test('lesson 161 mandatory practice is registered with 50 exact-decimal fields',()=>{
  const set=extendedPracticeByLesson[161];
  expect(set).toBeTruthy();
  expect(set.tasks).toHaveLength(20);
  expect(set.tasks.reduce((sum,task)=>sum+(task.type==='multi-input'?task.fields.length:1),0)).toBe(50);
  for(const task of set.tasks)if(task.type==='multi-input')for(const field of task.fields)expect(field.validation).toBe('exact-decimal');
});
