import {expect,test} from '@playwright/test';
import {lessonOneHundredFourOpening} from '../src/LessonOneHundredFourOpening';
import {lessonOneHundredFourPractice,lessonOneHundredFourResponseCount} from '../src/data/lessonOneHundredFourPractice';

test('lesson 104 uses exact §29 route and keeps 20/50 contract',()=>{
  expect(lessonOneHundredFourOpening.kicker).toContain('§ 29 · 3 из 5');
  expect(lessonOneHundredFourPractice).toHaveLength(20);
  expect(lessonOneHundredFourResponseCount).toBe(50);
  expect(lessonOneHundredFourPractice.slice(0,3).map(task=>task.source)).toEqual(['№ 778(6–8)','№ 781(1)','№ 787(1)']);
  expect(lessonOneHundredFourPractice[0].fields.map(item=>item.answers[0])).toEqual(['9 8/13','10 5/9','5 11/16']);
  expect(lessonOneHundredFourPractice[1].fields.map(item=>item.answers[0])).toEqual(['1 23/30']);
  expect(lessonOneHundredFourPractice[2].fields.map(item=>item.answers[0])).toEqual(['15','20']);
});
