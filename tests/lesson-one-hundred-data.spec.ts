import {expect,test} from '@playwright/test';
import {lessonOneHundredOpening} from '../src/LessonOneHundredOpening';
import {lessonOneHundredPractice,lessonOneHundredResponseCount} from '../src/data/lessonOneHundredPractice';

test('lesson 100 uses exact §27 route and keeps 20/50 contract',()=>{
  expect(lessonOneHundredOpening.kicker).toContain('§ 27 · 2 из 2');
  expect(lessonOneHundredPractice).toHaveLength(20);
  expect(lessonOneHundredResponseCount).toBe(50);
  expect(lessonOneHundredPractice.slice(0,4).map(task=>task.source)).toEqual(['№ 750','№ 752','№ 754','№ 757']);
  expect(lessonOneHundredPractice[0].fields.map(item=>item.answers[0])).toEqual(['18/50','41/50']);
  expect(lessonOneHundredPractice[1].fields.map(item=>item.answers[0])).toEqual(['42','5/42','12/17','11/43']);
  expect(lessonOneHundredPractice[2].fields.map(item=>item.answers[0])).toEqual(['15/23','60']);
  expect(lessonOneHundredPractice[3].fields.map(item=>item.answers[0])).toEqual(['7','12']);
});
