import {expect,test} from '@playwright/test';
import {lessonOneHundredFiftyNinePractice,lessonOneHundredFiftyNineResponseCount} from '../src/data/lessonOneHundredFiftyNinePractice';
import {extendedPracticeByLesson} from '../src/data/extendedPracticeData';
import {exactRationalEquals,parseExactRational} from '../src/exactRational';

test('lesson 159 has 20 tasks and exactly 50 checked responses',()=>{
  expect(lessonOneHundredFiftyNinePractice).toHaveLength(20);
  expect(lessonOneHundredFiftyNineResponseCount).toBe(50);
  expect(lessonOneHundredFiftyNinePractice.reduce((sum,task)=>sum+task.fields.length,0)).toBe(50);
});

test('lesson 159 references KTP anchors without claiming unverified exact textbook wording',()=>{
  expect(lessonOneHundredFiftyNinePractice.some(task=>task.source.includes('№1123(19)'))).toBe(true);
  expect(lessonOneHundredFiftyNinePractice.some(task=>task.source.includes('№1123(21)'))).toBe(true);
  expect(lessonOneHundredFiftyNinePractice.some(task=>task.source.includes('№1148'))).toBe(true);
  expect(lessonOneHundredFiftyNinePractice.some(task=>task.source.includes('№1150'))).toBe(true);
  expect(lessonOneHundredFiftyNinePractice.every(task=>task.sourceExact!==true)).toBe(true);
});

test('exact rational parser accepts equivalent fractions decimals and mixed numbers only exactly',()=>{
  expect(exactRationalEquals('1/2','2/4')).toBe(true);
  expect(exactRationalEquals('0,500','1/2')).toBe(true);
  expect(exactRationalEquals('3 5/6','23/6')).toBe(true);
  expect(exactRationalEquals('0.500001','1/2')).toBe(false);
  expect(parseExactRational('1/0')).toBeNull();
  expect(parseExactRational('3 7/6')).toBeNull();
});

test('lesson 159 mandatory practice is registered with 50 response fields',()=>{
  const set=extendedPracticeByLesson[159];
  expect(set).toBeTruthy();
  expect(set.tasks).toHaveLength(20);
  expect(set.tasks.reduce((sum,task)=>sum+(task.type==='multi-input'?task.fields.length:1),0)).toBe(50);
  for(const task of set.tasks)if(task.type==='multi-input')for(const field of task.fields)expect(field.validation).toBe('loose');
});
