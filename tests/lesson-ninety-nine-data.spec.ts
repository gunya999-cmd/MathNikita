import {expect,test} from '@playwright/test';
import {lessonNinetyNineOpening} from '../src/LessonNinetyNineOpening';
import {lessonNinetyNinePractice,lessonNinetyNineResponseCount} from '../src/data/lessonNinetyNinePractice';
import {yearLessonByNumber} from '../src/data/yearPlan';

test('lesson 99 opens §27 with exact source anchors and 20/50 contract',()=>{
  const lesson=yearLessonByNumber.get(99);
  expect(lesson).toMatchObject({number:99,paragraph:'§ 27',topicLessonIndex:1,topicLessonCount:2,available:true,title:'Сложение и вычитание дробей с одинаковыми знаменателями'});
  expect(lessonNinetyNineOpening.kicker).toContain('1 из 2');
  expect(lessonNinetyNinePractice).toHaveLength(20);
  expect(lessonNinetyNineResponseCount).toBe(50);
  expect(lessonNinetyNinePractice.slice(0,3).map(task=>task.source)).toEqual(['№ 744','№ 746','№ 748']);
  expect(lessonNinetyNinePractice[0].fields.map(field=>field.answers[0])).toEqual(['11/19','3/13','1/25','11/39']);
  expect(lessonNinetyNinePractice[1].fields.map(field=>field.answers[0])).toEqual(['2/10','14/32']);
  expect(lessonNinetyNinePractice[2].fields[0].answers[0]).toBe('14/19');
});
