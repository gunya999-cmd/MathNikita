import {expect,test} from '@playwright/test';
import {lessonOneHundredSixtyThreePractice,lessonOneHundredSixtyThreeResponseCount} from '../src/data/lessonOneHundredSixtyThreePractice';
import {extendedPracticeByLesson} from '../src/data/extendedPracticeData';
import {exactDecimalEquals} from '../src/exactDecimal';

test('lesson 163 has 20 challenge tasks and exactly 50 checked responses',()=>{
  expect(lessonOneHundredSixtyThreePractice).toHaveLength(20);
  expect(lessonOneHundredSixtyThreeResponseCount).toBe(50);
  expect(lessonOneHundredSixtyThreePractice.reduce((sum,task)=>sum+task.fields.length,0)).toBe(50);
});

test('lesson 163 follows KTP individual-assignment continuation without fake exact source tasks',()=>{
  expect(lessonOneHundredSixtyThreePractice.every(task=>task.source.includes('индивидуальные задания'))).toBe(true);
  expect(lessonOneHundredSixtyThreePractice.every(task=>task.sourceExact!==true)).toBe(true);
  expect(lessonOneHundredSixtyThreePractice.some(task=>task.title==='Две скидки')).toBe(true);
  expect(lessonOneHundredSixtyThreePractice.some(task=>task.title==='Обратный ход по двум шагам')).toBe(true);
});

test('lesson 163 keeps strict decimal equality for percentage chains',()=>{
  expect(exactDecimalEquals('492,800','492.8')).toBe(true);
  expect(exactDecimalEquals('0.7200','0.72')).toBe(true);
  expect(exactDecimalEquals('492.800001','492.8')).toBe(false);
  expect(exactDecimalEquals('18/25','0.72')).toBe(false);
});

test('lesson 163 mandatory practice is registered with 50 exact-decimal fields',()=>{
  const set=extendedPracticeByLesson[163];
  expect(set).toBeTruthy();
  expect(set.tasks).toHaveLength(20);
  expect(set.tasks.reduce((sum,task)=>sum+(task.type==='multi-input'?task.fields.length:1),0)).toBe(50);
  for(const task of set.tasks)if(task.type==='multi-input')for(const field of task.fields)expect(field.validation).toBe('exact-decimal');
});
