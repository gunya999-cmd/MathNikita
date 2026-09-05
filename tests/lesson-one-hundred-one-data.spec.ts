import {expect,test} from '@playwright/test';
import {lessonOneHundredOneOpening} from '../src/LessonOneHundredOneOpening';
import {lessonOneHundredOnePractice,lessonOneHundredOneResponseCount} from '../src/data/lessonOneHundredOnePractice';

test('lesson 101 uses exact §28 route and keeps 20/50 contract',()=>{
  expect(lessonOneHundredOneOpening.kicker).toContain('§ 28 · 1 из 1');
  expect(lessonOneHundredOnePractice).toHaveLength(20);
  expect(lessonOneHundredOneResponseCount).toBe(50);
  expect(lessonOneHundredOnePractice.slice(0,4).map(task=>task.source)).toEqual(['№ 759','№ 761','№ 763','№ 765']);
  expect(lessonOneHundredOnePractice[0].fields.map(item=>item.answers[0])).toEqual(['5/7','19/4','1/6','30/4','6/1','12/39']);
  expect(lessonOneHundredOnePractice[1].fields.map(item=>item.answers[0])).toEqual(['5:7','3:10','29:5']);
  expect(lessonOneHundredOnePractice[2].fields.map(item=>item.answers[0])).toEqual(['12/1','60/5','276/23']);
  expect(lessonOneHundredOnePractice[3].fields.map(item=>item.answers[0])).toEqual(['20','15','72']);
});
