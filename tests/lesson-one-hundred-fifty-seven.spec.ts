import {expect,test} from '@playwright/test';
import {lessonOneHundredFiftySevenPractice,lessonOneHundredFiftySevenResponseCount} from '../src/data/lessonOneHundredFiftySevenPractice';
import {extendedPracticeByLesson} from '../src/data/extendedPracticeData';

test('lesson 157 has 20 tasks and exactly 50 checked responses',()=>{
  expect(lessonOneHundredFiftySevenPractice).toHaveLength(20);
  expect(lessonOneHundredFiftySevenResponseCount).toBe(50);
  expect(lessonOneHundredFiftySevenPractice.reduce((sum,task)=>sum+task.fields.length,0)).toBe(50);
});

test('lesson 157 keeps exact textbook anchors for 1123 parts 5 and 6',()=>{
  const first=lessonOneHundredFiftySevenPractice[1];
  const second=lessonOneHundredFiftySevenPractice[2];
  expect(first.source).toContain('№1123(5)');
  expect(second.source).toContain('№1123(6)');
  expect(first.sourceExact).toBe(true);
  expect(second.sourceExact).toBe(true);
  expect(first.fields.map(field=>field.answers[0])).toEqual(['27468','235141','5003']);
  expect(second.fields.map(field=>field.answers[0])).toEqual(['85932','116203','4007']);
});

test('lesson 157 mandatory practice is registered with exact validation',()=>{
  const set=extendedPracticeByLesson[157];
  expect(set).toBeTruthy();
  expect(set.tasks).toHaveLength(20);
  expect(set.tasks.reduce((sum,task)=>sum+(task.type==='multi-input'?task.fields.length:1),0)).toBe(50);
  for(const task of set.tasks)if(task.type==='multi-input')for(const field of task.fields)expect(field.validation).toBe('exact-decimal');
});
