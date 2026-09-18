import {expect,test} from '@playwright/test';
import {lessonOneHundredSixtyFourPractice,lessonOneHundredSixtyFourResponseCount} from '../src/data/lessonOneHundredSixtyFourPractice';
import {extendedPracticeByLesson} from '../src/data/extendedPracticeData';
import {exactDecimalEquals} from '../src/exactDecimal';

test('lesson 164 has 20 polygon tasks and exactly 50 checked responses',()=>{
  expect(lessonOneHundredSixtyFourPractice).toHaveLength(20);
  expect(lessonOneHundredSixtyFourResponseCount).toBe(50);
  expect(lessonOneHundredSixtyFourPractice.reduce((sum,task)=>sum+task.fields.length,0)).toBe(50);
});

test('lesson 164 keeps KTP anchors adapted without fake exact source wording',()=>{
  const sources=lessonOneHundredSixtyFourPractice.map(task=>task.source).join(' ');
  for(const anchor of ['1125(1)','1125(2)','1125(3)','1128(5)','1128(6)','1128(10)','1128(11)','1129(5)','1129(8)','1129(11)','1129(12)','1129(14)'])expect(sources).toContain(anchor);
  expect(lessonOneHundredSixtyFourPractice.every(task=>task.sourceExact!==true)).toBe(true);
});

test('lesson 164 keeps strict decimal equality for lengths and perimeter',()=>{
  expect(exactDecimalEquals('9,50','9.5')).toBe(true);
  expect(exactDecimalEquals('47.500','47.5')).toBe(true);
  expect(exactDecimalEquals('9.500001','9.5')).toBe(false);
  expect(exactDecimalEquals('19/2','9.5')).toBe(false);
});

test('lesson 164 mandatory practice is registered with 50 exact-decimal fields',()=>{
  const set=extendedPracticeByLesson[164];
  expect(set).toBeTruthy();
  expect(set.tasks).toHaveLength(20);
  expect(set.tasks.reduce((sum,task)=>sum+(task.type==='multi-input'?task.fields.length:1),0)).toBe(50);
  for(const task of set.tasks)if(task.type==='multi-input')for(const field of task.fields)expect(field.validation).toBe('exact-decimal');
});
