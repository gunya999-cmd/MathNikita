import {expect,test} from '@playwright/test';
import {lessonOneHundredSixtyPractice,lessonOneHundredSixtyResponseCount} from '../src/data/lessonOneHundredSixtyPractice';
import {extendedPracticeByLesson} from '../src/data/extendedPracticeData';
import {canonicalDecimal,exactDecimalEquals} from '../src/exactDecimal';

test('lesson 160 has 20 tasks and exactly 50 checked responses',()=>{
  expect(lessonOneHundredSixtyPractice).toHaveLength(20);
  expect(lessonOneHundredSixtyResponseCount).toBe(50);
  expect(lessonOneHundredSixtyPractice.reduce((sum,task)=>sum+task.fields.length,0)).toBe(50);
});

test('lesson 160 references KTP anchors without claiming unverified exact textbook wording',()=>{
  expect(lessonOneHundredSixtyPractice.some(task=>task.source.includes('№1124(4)'))).toBe(true);
  expect(lessonOneHundredSixtyPractice.some(task=>task.source.includes('№1124(5)'))).toBe(true);
  expect(lessonOneHundredSixtyPractice.some(task=>task.source.includes('№1127(6)'))).toBe(true);
  expect(lessonOneHundredSixtyPractice.some(task=>task.source.includes('№1127(7)'))).toBe(true);
  expect(lessonOneHundredSixtyPractice.some(task=>task.source.includes('№1146'))).toBe(true);
  expect(lessonOneHundredSixtyPractice.every(task=>task.sourceExact!==true)).toBe(true);
});

test('exact decimal matcher normalizes decimal notation but rejects fractions and nearby values',()=>{
  expect(canonicalDecimal('12,700')).toBe('12.7');
  expect(canonicalDecimal('000.5000')).toBe('0.5');
  expect(exactDecimalEquals('0,500','0.5')).toBe(true);
  expect(exactDecimalEquals('12.70','12.7')).toBe(true);
  expect(exactDecimalEquals('1/2','0.5')).toBe(false);
  expect(exactDecimalEquals('0.500001','0.5')).toBe(false);
  expect(canonicalDecimal('1e-1')).toBeNull();
});

test('lesson 160 mandatory practice is registered with exact-decimal validation',()=>{
  const set=extendedPracticeByLesson[160];
  expect(set).toBeTruthy();
  expect(set.tasks).toHaveLength(20);
  expect(set.tasks.reduce((sum,task)=>sum+(task.type==='multi-input'?task.fields.length:1),0)).toBe(50);
  for(const task of set.tasks)if(task.type==='multi-input')for(const field of task.fields)expect(field.validation).toBe('exact-decimal');
});
