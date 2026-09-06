import {expect,test} from '@playwright/test';
import {lessonOneHundredSixOpening} from '../src/LessonOneHundredSixOpening';
import {lessonOneHundredSixPractice,lessonOneHundredSixResponseCount} from '../src/data/lessonOneHundredSixPractice';

test('lesson 106 uses exact §29 synthesis route and keeps 20/50 contract',()=>{
  expect(lessonOneHundredSixOpening.kicker).toContain('§ 29 · 5 из 5');
  expect(lessonOneHundredSixPractice).toHaveLength(20);
  expect(lessonOneHundredSixResponseCount).toBe(50);
  expect(lessonOneHundredSixPractice.slice(0,3).map(task=>task.source)).toEqual(['№ 784','№ 788','№ 790']);
  expect(lessonOneHundredSixPractice[0].fields.map(item=>item.answers[0])).toEqual(['15/13','1 2/13','ошибся']);
  expect(lessonOneHundredSixPractice[1].fields.map(item=>item.answers[0])).toEqual(['8,9,10','9,10,11']);
  expect(lessonOneHundredSixPractice[2].fields.map(item=>item.answers[0])).toEqual(['11,12,13,14,15,16,17,18,19,20','1']);
});
