import {expect,test} from '@playwright/test';
import {lessonOneHundredFiveOpening} from '../src/LessonOneHundredFiveOpening';
import {lessonOneHundredFivePractice,lessonOneHundredFiveResponseCount} from '../src/data/lessonOneHundredFivePractice';

test('lesson 105 uses exact §29 route and keeps 20/50 contract',()=>{
  expect(lessonOneHundredFiveOpening.kicker).toContain('§ 29 · 4 из 5');
  expect(lessonOneHundredFivePractice).toHaveLength(20);
  expect(lessonOneHundredFiveResponseCount).toBe(50);
  expect(lessonOneHundredFivePractice.slice(0,3).map(task=>task.source)).toEqual(['№ 778(9–10)','№ 781(2)','№ 789']);
  expect(lessonOneHundredFivePractice[0].fields.map(item=>item.answers[0])).toEqual(['21','2 11/14']);
  expect(lessonOneHundredFivePractice[1].fields.map(item=>item.answers[0])).toEqual(['4']);
  expect(lessonOneHundredFivePractice[2].fields.map(item=>item.answers[0])).toEqual(['57,58,59','4,5,6,7']);
});
