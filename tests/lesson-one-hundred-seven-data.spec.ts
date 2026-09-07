import {expect,test} from '@playwright/test';
import {lessonOneHundredSevenOpening} from '../src/LessonOneHundredSevenOpening';
import {lessonOneHundredSevenPractice,lessonOneHundredSevenResponseCount} from '../src/data/lessonOneHundredSevenPractice';

test('lesson 107 covers chapter 4 review and keeps 20/50 contract without invented textbook numbers',()=>{
  expect(lessonOneHundredSevenOpening.kicker).toContain('повторение перед контрольной № 6');
  expect(lessonOneHundredSevenPractice).toHaveLength(20);
  expect(lessonOneHundredSevenResponseCount).toBe(50);
  expect(lessonOneHundredSevenPractice.slice(0,10).map(task=>task.source)).toEqual([
    'Диагностика · § 25','Диагностика · § 25','Диагностика · § 25','Диагностика · § 26','Диагностика · § 26',
    'Диагностика · § 27','Диагностика · § 27','Диагностика · § 28','Диагностика · § 28','Диагностика · § 29'
  ]);
  expect(lessonOneHundredSevenPractice.filter(task=>task.source).some(task=>task.source?.startsWith('№'))).toBe(false);
  expect(lessonOneHundredSevenPractice[0].fields.map(item=>item.answers[0])).toEqual(['7','12','правильная']);
  expect(lessonOneHundredSevenPractice[5].fields.map(item=>item.answers[0])).toEqual(['12/15','5/17','12']);
  expect(lessonOneHundredSevenPractice[9].fields.map(item=>item.answers[0])).toEqual(['4 5/6','6 2/8','38/5']);
});
