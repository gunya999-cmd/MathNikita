import {expect,test} from '@playwright/test';
import {lessonNinetyEightOpening} from '../src/LessonNinetyEightOpening';
import {lessonNinetyEightPractice,lessonNinetyEightResponseCount} from '../src/data/lessonNinetyEightPractice';
import {yearLessonByNumber} from '../src/data/yearPlan';

test('lesson 98 closes §26 with exact source anchors and 20/50 contract',()=>{
  const lesson=yearLessonByNumber.get(98);
  expect(lesson).toMatchObject({number:98,paragraph:'§ 26',topicLessonIndex:3,topicLessonCount:3,available:true,title:'Итог § 26: сложные сравнения и дробные неравенства'});
  expect(lessonNinetyEightOpening.kicker).toContain('3 из 3');
  expect(lessonNinetyEightOpening.title).toBe('Итог § 26: сложные сравнения и дробные неравенства');
  expect(lessonNinetyEightPractice).toHaveLength(20);
  expect(lessonNinetyEightResponseCount).toBe(50);
  expect(lessonNinetyEightPractice.slice(0,3).map(task=>task.source)).toEqual(['№ 724 (7–12)','№ 737','№ 739']);
  expect(lessonNinetyEightPractice[0].fields.map(field=>field.answers[0])).toEqual(['>','<','=','=', '<','>']);
  expect(lessonNinetyEightPractice[1].fields[0].answers[0]).toBe('1,2,3,4,5,6,7,8');
  expect(lessonNinetyEightPractice[2].fields.map(field=>field.answers[0])).toEqual(['8,9','10,11,12']);
});
