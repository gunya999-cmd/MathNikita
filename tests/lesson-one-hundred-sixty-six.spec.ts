import {expect,test} from '@playwright/test';
import {lessonOneHundredSixtySixPractice,lessonOneHundredSixtySixResponseCount} from '../src/data/lessonOneHundredSixtySixPractice';
import {extendedPracticeByLesson} from '../src/data/extendedPracticeData';
import {exactDecimalEquals} from '../src/exactDecimal';

test('lesson 166 has 20 tasks and exactly 50 checked responses',()=>{
  expect(lessonOneHundredSixtySixPractice).toHaveLength(20);
  expect(lessonOneHundredSixtySixResponseCount).toBe(50);
  expect(lessonOneHundredSixtySixPractice.reduce((sum,task)=>sum+task.fields.length,0)).toBe(50);
});

test('lesson 166 uses verified angle-review anchors without claiming exact textbook wording',()=>{
  const sources=lessonOneHundredSixtySixPractice.map(task=>task.source).join(' ');
  expect(sources).toContain('№1189');
  expect(sources).toContain('№1191');
  expect(sources).toContain('№1192');
  expect(lessonOneHundredSixtySixPractice.every(task=>task.sourceExact!==true)).toBe(true);
  expect(lessonOneHundredSixtySixPractice.every(task=>!task.source.includes('№1199')&&!task.source.includes('№1200'))).toBe(true);
});

test('lesson 166 keeps strict decimal equality for degree measures',()=>{
  expect(exactDecimalEquals('57,500','57.5')).toBe(true);
  expect(exactDecimalEquals('118.000','118')).toBe(true);
  expect(exactDecimalEquals('57.5001','57.5')).toBe(false);
  expect(exactDecimalEquals('115/2','57.5')).toBe(false);
});

test('lesson 166 mandatory practice is registered with 50 exact-decimal fields',()=>{
  const set=extendedPracticeByLesson[166];
  expect(set).toBeTruthy();
  expect(set.tasks).toHaveLength(20);
  expect(set.tasks.reduce((sum,task)=>sum+(task.type==='multi-input'?task.fields.length:1),0)).toBe(50);
  for(const task of set.tasks)if(task.type==='multi-input')for(const field of task.fields)expect(field.validation).toBe('exact-decimal');
});
