import {expect,test} from '@playwright/test';
import {lessonOneHundredFiftyEightPractice,lessonOneHundredFiftyEightResponseCount} from '../src/data/lessonOneHundredFiftyEightPractice';
import {extendedPracticeByLesson} from '../src/data/extendedPracticeData';

test('lesson 158 has 20 tasks and exactly 50 checked responses',()=>{
  expect(lessonOneHundredFiftyEightPractice).toHaveLength(20);
  expect(lessonOneHundredFiftyEightResponseCount).toBe(50);
  expect(lessonOneHundredFiftyEightPractice.reduce((sum,task)=>sum+task.fields.length,0)).toBe(50);
});

test('lesson 158 keeps exact textbook anchors for 1123 parts 7 and 8',()=>{
  const first=lessonOneHundredFiftyEightPractice[1];
  const second=lessonOneHundredFiftyEightPractice[2];
  expect(first.source).toContain('№1123(7)');
  expect(second.source).toContain('№1123(8)');
  expect(first.sourceExact).toBe(true);
  expect(second.sourceExact).toBe(true);
  expect(first.fields.map(field=>field.answers[0])).toEqual(['6048','5040','1008','1008','1']);
  expect(second.fields.map(field=>field.answers[0])).toEqual(['19076','2030','17046','1','17046']);
});

test('lesson 158 includes source-adapted 1141 and 1144 tasks without claiming exact wording',()=>{
  const task1141=lessonOneHundredFiftyEightPractice.find(task=>task.source.includes('№1141'));
  const task1144=lessonOneHundredFiftyEightPractice.find(task=>task.source.includes('№1144'));
  expect(task1141?.sourceExact).toBe(false);
  expect(task1144?.sourceExact).toBe(false);
  expect(task1141?.fields.map(field=>field.answers[0])).toEqual(['12','100']);
  expect(task1144?.fields.map(field=>field.answers[0])).toEqual(['60','3,5','700','490']);
});

test('lesson 158 mandatory practice is registered with exact validation',()=>{
  const set=extendedPracticeByLesson[158];
  expect(set).toBeTruthy();
  expect(set.tasks).toHaveLength(20);
  expect(set.tasks.reduce((sum,task)=>sum+(task.type==='multi-input'?task.fields.length:1),0)).toBe(50);
  for(const task of set.tasks)if(task.type==='multi-input')for(const field of task.fields)expect(field.validation).toBe('exact-decimal');
});
