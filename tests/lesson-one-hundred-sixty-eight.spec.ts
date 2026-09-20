import {expect,test} from '@playwright/test';
import {lessonOneHundredSixtyEightPractice,lessonOneHundredSixtyEightResponseCount} from '../src/data/lessonOneHundredSixtyEightPractice';
import {extendedPracticeByLesson} from '../src/data/extendedPracticeData';
import {exactDecimalEquals} from '../src/exactDecimal';

test('lesson 168 has 20 tasks and exactly 50 checked responses',()=>{
  expect(lessonOneHundredSixtyEightPractice).toHaveLength(20);
  expect(lessonOneHundredSixtyEightResponseCount).toBe(50);
  expect(lessonOneHundredSixtyEightPractice.reduce((sum,task)=>sum+task.fields.length,0)).toBe(50);
});

test('lesson 168 is second §24 combinatorics lesson without shifted angle reference',()=>{
  const sources=lessonOneHundredSixtyEightPractice.map(task=>task.source).join(' ');
  expect(sources).toContain('КТП 168');
  expect(sources).toContain('§24');
  expect(sources).not.toContain('§12');
  expect(sources).not.toContain('№1191');
  expect(lessonOneHundredSixtyEightPractice.every(task=>task.sourceExact!==true)).toBe(true);
  expect(lessonOneHundredSixtyEightPractice.some(task=>task.title==='Хотя бы одна семёрка')).toBe(true);
  expect(lessonOneHundredSixtyEightPractice.some(task=>task.title==='Чётные числа: разбиение на случаи')).toBe(true);
});

test('lesson 168 keeps strict exact decimal matching',()=>{
  expect(exactDecimalEquals('3439.000','3439')).toBe(true);
  expect(exactDecimalEquals('30,0','30')).toBe(true);
  expect(exactDecimalEquals('3439.0001','3439')).toBe(false);
  expect(exactDecimalEquals('6878/2','3439')).toBe(false);
});

test('lesson 168 mandatory practice is registered with 50 exact-decimal fields',()=>{
  const set=extendedPracticeByLesson[168];
  expect(set).toBeTruthy();
  expect(set.tasks).toHaveLength(20);
  expect(set.tasks.reduce((sum,task)=>sum+(task.type==='multi-input'?task.fields.length:1),0)).toBe(50);
  for(const task of set.tasks)if(task.type==='multi-input')for(const field of task.fields)expect(field.validation).toBe('exact-decimal');
});
