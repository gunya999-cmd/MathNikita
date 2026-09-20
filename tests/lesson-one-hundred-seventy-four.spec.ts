import {expect,test} from '@playwright/test';
import {lessonOneHundredSeventyFourPractice,lessonOneHundredSeventyFourResponseCount} from '../src/data/lessonOneHundredSeventyFourPractice';
import {extendedPracticeByLesson} from '../src/data/extendedPracticeData';
import {exactDecimalEquals} from '../src/exactDecimal';

test('lesson 174 has 20 tasks and exactly 50 checked responses',()=>{
  expect(lessonOneHundredSeventyFourPractice).toHaveLength(20);
  expect(lessonOneHundredSeventyFourResponseCount).toBe(50);
  expect(lessonOneHundredSeventyFourPractice.reduce((sum,task)=>sum+task.fields.length,0)).toBe(50);
});

test('lesson 174 is an authored mixed final rehearsal',()=>{
  expect(lessonOneHundredSeventyFourPractice.every(task=>task.sourceExact!==true)).toBe(true);
  expect(new Set(lessonOneHundredSeventyFourPractice.map(task=>task.domain)).size).toBe(8);
  const sources=lessonOneHundredSeventyFourPractice.map(task=>task.source).join(' ');
  expect(sources).toContain('КТП 174');
  expect(sources).toContain('генеральная репетиция');
});

test('lesson 174 keeps strict decimal equality',()=>{
  expect(exactDecimalEquals('34,2150','34.215')).toBe(true);
  expect(exactDecimalEquals('53.400','53.4')).toBe(true);
  expect(exactDecimalEquals('53.401','53.4')).toBe(false);
  expect(exactDecimalEquals('39/100','0.39')).toBe(false);
});

test('lesson 174 mandatory practice mirrors all 50 fields',()=>{
  const set=extendedPracticeByLesson[174];
  expect(set).toBeTruthy();
  expect(set.tasks).toHaveLength(20);
  expect(set.tasks.reduce((sum,task)=>sum+(task.type==='multi-input'?task.fields.length:1),0)).toBe(50);
  for(const task of set.tasks)if(task.type==='multi-input')for(const field of task.fields)expect(field.validation).toBe('exact-decimal');
});
