import {expect,test} from '@playwright/test';
import {lessonNinetyFiveOpening} from '../src/LessonNinetyFiveOpening';
import {lessonNinetyFivePractice,lessonNinetyFiveResponseCount} from '../src/data/lessonNinetyFivePractice';

test('lesson 95 source plan uses exact late-§25 models and the 20/50 contract',()=>{
  expect(lessonNinetyFiveOpening.kicker).toContain('5 из 5');
  expect(lessonNinetyFivePractice).toHaveLength(20);
  expect(lessonNinetyFiveResponseCount).toBe(50);
  expect(lessonNinetyFivePractice.slice(0,5).map(task=>task.source)).toEqual(['№ 704','№ 708','№ 712','№ 714','№ 715']);
  expect(lessonNinetyFivePractice[0].fields.map(field=>field.answers[0])).toEqual(['3600','5850','4050']);
  expect(lessonNinetyFivePractice[1].fields.map(field=>field.answers[0])).toEqual(['84','49','133']);
  expect(lessonNinetyFivePractice[2].fields.map(field=>field.answers[0])).toEqual(['90','135']);
  expect(lessonNinetyFivePractice[3].fields.map(field=>field.answers[0])).toEqual(['675','351']);
  expect(lessonNinetyFivePractice[4].fields.map(field=>field.answers[0])).toEqual(['1410','752']);
});
