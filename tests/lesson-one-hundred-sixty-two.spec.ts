import {expect,test} from '@playwright/test';
import {lessonOneHundredSixtyTwoPractice,lessonOneHundredSixtyTwoResponseCount} from '../src/data/lessonOneHundredSixtyTwoPractice';
import {extendedPracticeByLesson} from '../src/data/extendedPracticeData';
import {canonicalDecimal,exactDecimalEquals} from '../src/exactDecimal';

test('lesson 162 has 20 tasks and exactly 50 checked responses',()=>{
  expect(lessonOneHundredSixtyTwoPractice).toHaveLength(20);
  expect(lessonOneHundredSixtyTwoResponseCount).toBe(50);
  expect(lessonOneHundredSixtyTwoPractice.reduce((sum,task)=>sum+task.fields.length,0)).toBe(50);
});

test('lesson 162 references KTP anchors without claiming unverified exact textbook wording',()=>{
  expect(lessonOneHundredSixtyTwoPractice.some(task=>task.source.includes('№1177'))).toBe(true);
  expect(lessonOneHundredSixtyTwoPractice.some(task=>task.source.includes('№1182'))).toBe(true);
  expect(lessonOneHundredSixtyTwoPractice.some(task=>task.source.includes('№1203'))).toBe(true);
  expect(lessonOneHundredSixtyTwoPractice.every(task=>task.sourceExact!==true)).toBe(true);
});

test('lesson 162 uses strict decimal equality without float tolerance or fraction syntax',()=>{
  expect(exactDecimalEquals('0,2500','0.25')).toBe(true);
  expect(exactDecimalEquals('274,950','274.95')).toBe(true);
  expect(exactDecimalEquals('0.250001','0.25')).toBe(false);
  expect(exactDecimalEquals('1/4','0.25')).toBe(false);
  expect(canonicalDecimal('00085,000')).toBe('85');
});

test('lesson 162 mandatory practice is registered with 50 exact-decimal fields',()=>{
  const set=extendedPracticeByLesson[162];
  expect(set).toBeTruthy();
  expect(set.tasks).toHaveLength(20);
  expect(set.tasks.reduce((sum,task)=>sum+(task.type==='multi-input'?task.fields.length:1),0)).toBe(50);
  for(const task of set.tasks)if(task.type==='multi-input')for(const field of task.fields)expect(field.validation).toBe('exact-decimal');
});
