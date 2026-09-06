import {expect,test} from '@playwright/test';
import {lessonOneHundredThreeOpening} from '../src/LessonOneHundredThreeOpening';
import {lessonOneHundredThreePractice,lessonOneHundredThreeResponseCount} from '../src/data/lessonOneHundredThreePractice';

test('lesson 103 uses exact §29 route and keeps 20/50 contract',()=>{
  expect(lessonOneHundredThreeOpening.kicker).toContain('§ 29 · 2 из 5');
  expect(lessonOneHundredThreePractice).toHaveLength(20);
  expect(lessonOneHundredThreeResponseCount).toBe(50);
  expect(lessonOneHundredThreePractice.slice(0,3).map(task=>task.source)).toEqual(['№ 776','№ 778(1–5)','№ 783']);
  expect(lessonOneHundredThreePractice[0].fields.map(item=>item.answers[0])).toEqual(['5 14/93','13 36/41','7 4/38','19 4/10']);
  expect(lessonOneHundredThreePractice[1].fields.map(item=>item.answers[0])).toEqual(['10','22 10/27','7/19','4 9/15','5/11']);
  expect(lessonOneHundredThreePractice[2].fields.map(item=>item.answers[0])).toEqual(['10/16','6/16']);
});
