import {expect,test} from '@playwright/test';
import {lessonOneHundredTwoOpening} from '../src/LessonOneHundredTwoOpening';
import {lessonOneHundredTwoPractice,lessonOneHundredTwoResponseCount} from '../src/data/lessonOneHundredTwoPractice';

test('lesson 102 uses exact §29 route and keeps 20/50 contract',()=>{
  expect(lessonOneHundredTwoOpening.kicker).toContain('§ 29 · 1 из 5');
  expect(lessonOneHundredTwoPractice).toHaveLength(20);
  expect(lessonOneHundredTwoResponseCount).toBe(50);
  expect(lessonOneHundredTwoPractice.slice(0,3).map(task=>task.source)).toEqual(['№ 770','№ 772','№ 774']);
  expect(lessonOneHundredTwoPractice[0].fields.map(item=>item.answers[0])).toEqual(['2 3/5','1 7/11','3 1/12','2 22/23','6 7/12','4 11/18']);
  expect(lessonOneHundredTwoPractice[1].fields.map(item=>item.answers[0])).toEqual(['3 1/2','2 1/4','3 1/8','5 10/20','32 7/10','10 2/81']);
  expect(lessonOneHundredTwoPractice[2].fields.map(item=>item.answers[0])).toEqual(['19/4','105/11','60/17','77/6','1349/100','131/16']);
});
