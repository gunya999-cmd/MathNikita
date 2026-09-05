import {expect,test} from '@playwright/test';
import {lessonNinetySixOpening} from '../src/LessonNinetySixOpening';
import {lessonNinetySixPractice,lessonNinetySixResponseCount} from '../src/data/lessonNinetySixPractice';

test('lesson 96 starts §26 with exact source anchors and 20/50 contract',()=>{
  expect(lessonNinetySixOpening.kicker).toContain('1 из 3');
  expect(lessonNinetySixOpening.title).toContain('Правильные и неправильные дроби');
  expect(lessonNinetySixPractice).toHaveLength(20);
  expect(lessonNinetySixResponseCount).toBe(50);
  expect(lessonNinetySixPractice.slice(0,3).map(task=>task.source)).toEqual(['№ 719','№ 721','№ 723']);
  expect(lessonNinetySixPractice[0].fields.map(field=>field.answers[0])).toEqual(['1/8','2/8','3/8','4/8','5/8','6/8','7/8']);
  expect(lessonNinetySixPractice[1].fields.map(field=>field.answers[0])).toEqual(['8/1','8/2','8/3','8/4','8/5','8/6','8/7','8/8']);
  expect(lessonNinetySixPractice[2].fields.map(field=>field.answers[0])).toEqual(['<','>','>','<','>','>','<','>','=','=', '<','<']);
});
