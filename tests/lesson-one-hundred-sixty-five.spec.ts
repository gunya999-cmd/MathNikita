import {expect,test} from '@playwright/test';
import {lessonOneHundredSixtyFivePractice,lessonOneHundredSixtyFiveResponseCount} from '../src/data/lessonOneHundredSixtyFivePractice';
import {extendedPracticeByLesson} from '../src/data/extendedPracticeData';
import {exactDecimalEquals} from '../src/exactDecimal';

test('lesson 165 has 20 tasks and exactly 50 checked responses',()=>{
  expect(lessonOneHundredSixtyFivePractice).toHaveLength(20);
  expect(lessonOneHundredSixtyFiveResponseCount).toBe(50);
  expect(lessonOneHundredSixtyFivePractice.reduce((sum,task)=>sum+task.fields.length,0)).toBe(50);
});

test('lesson 165 reconciles the shifted KTP references without fake exact source claims',()=>{
  expect(lessonOneHundredSixtyFivePractice.every(task=>task.sourceExact!==true)).toBe(true);
  expect(lessonOneHundredSixtyFivePractice.some(task=>task.source.includes('№1199'))).toBe(true);
  expect(lessonOneHundredSixtyFivePractice.some(task=>task.source.includes('№1200'))).toBe(true);
  expect(lessonOneHundredSixtyFivePractice.every(task=>!task.source.includes('№1193')&&!task.source.includes('№1194')&&!task.source.includes('№1197'))).toBe(true);
});

test('lesson 165 keeps strict decimal equality for area and volume answers',()=>{
  expect(exactDecimalEquals('90,2500','90.25')).toBe(true);
  expect(exactDecimalEquals('91.1250','91.125')).toBe(true);
  expect(exactDecimalEquals('90.250001','90.25')).toBe(false);
  expect(exactDecimalEquals('361/4','90.25')).toBe(false);
});

test('lesson 165 mandatory practice is registered with 50 exact-decimal fields',()=>{
  const set=extendedPracticeByLesson[165];
  expect(set).toBeTruthy();
  expect(set.tasks).toHaveLength(20);
  expect(set.tasks.reduce((sum,task)=>sum+(task.type==='multi-input'?task.fields.length:1),0)).toBe(50);
  for(const task of set.tasks)if(task.type==='multi-input')for(const field of task.fields)expect(field.validation).toBe('exact-decimal');
});
