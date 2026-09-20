import {expect,test} from '@playwright/test';
import {extendedPracticeByLesson} from '../src/data/extendedPracticeData';
import {lessonOneHundredSeventyFiveFields,lessonOneHundredSeventyFiveResponseCount,lessonOneHundredSeventyFiveTasks} from '../src/data/lessonOneHundredSeventyFiveControl';
import {exactDecimalEquals} from '../src/exactDecimal';

test('lesson 175 final control has 20 tasks and exactly 50 responses',()=>{
  expect(lessonOneHundredSeventyFiveTasks).toHaveLength(20);
  expect(lessonOneHundredSeventyFiveResponseCount).toBe(50);
  expect(lessonOneHundredSeventyFiveFields).toHaveLength(50);
  expect(new Set(lessonOneHundredSeventyFiveTasks.map(task=>task.domain)).size).toBe(8);
});

test('lesson 175 answers use strict decimal matching',()=>{
  expect(exactDecimalEquals('46,3350','46.335')).toBe(true);
  expect(exactDecimalEquals('0,390','0.39')).toBe(true);
  expect(exactDecimalEquals('0.391','0.39')).toBe(false);
});

test('lesson 175 is control work and has no mandatory training set',()=>{
  expect(extendedPracticeByLesson[175]).toBeUndefined();
});
