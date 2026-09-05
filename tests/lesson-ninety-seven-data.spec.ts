import {expect,test} from '@playwright/test';
import {lessonNinetySevenOpening} from '../src/LessonNinetySevenOpening';
import {lessonNinetySevenPractice,lessonNinetySevenResponseCount} from '../src/data/lessonNinetySevenPractice';

test('lesson 97 follows §26 lesson 2 source anchors and the 20/50 contract',()=>{
  expect(lessonNinetySevenOpening.kicker).toContain('2 из 3');
  expect(lessonNinetySevenPractice).toHaveLength(20);
  expect(lessonNinetySevenResponseCount).toBe(50);
  expect(lessonNinetySevenPractice.slice(0,3).map(task=>task.source)).toEqual(['№ 724 (1–6)','№ 726','№ 734']);
  expect(lessonNinetySevenPractice[0].fields.map(item=>item.answers[0])).toEqual(['>','<','<','>','<','<']);
  expect(lessonNinetySevenPractice[1].fields.map(item=>item.answers[0])).toEqual(['1/20','3/20','6/20','7/20','9/20','17/20']);
  expect(lessonNinetySevenPractice[2].fields.map(item=>item.answers[0])).toEqual(['1,2,3,4,5,6','1,2,3,4,5,6,7,8,9,10']);
});
