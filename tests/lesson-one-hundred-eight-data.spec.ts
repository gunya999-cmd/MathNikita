import {expect,test} from '@playwright/test';
import {lessonOneHundredEightFields,lessonOneHundredEightResponseCount,lessonOneHundredEightStages,lessonOneHundredEightTaskCount} from '../src/data/lessonOneHundredEightControl';
import {lessonOneHundredEightOpening} from '../src/LessonOneHundredEightOpening';

test('lesson 108 exact control work 6 variant 1 contract',()=>{
  expect(lessonOneHundredEightOpening.title).toContain('Контрольная работа № 6');
  expect(lessonOneHundredEightTaskCount).toBe(8);
  expect(lessonOneHundredEightResponseCount).toBe(15);
  expect(lessonOneHundredEightFields).toHaveLength(15);
  expect(lessonOneHundredEightStages).toHaveLength(11);
  expect(lessonOneHundredEightFields.slice(0,4).map(field=>field.answer)).toEqual(['<','<','>','>']);
  expect(lessonOneHundredEightFields.slice(4,8).map(field=>field.answer)).toEqual(['9/14','3 9/14','9/17','1 2/3']);
  expect(lessonOneHundredEightFields.find(field=>field.number==='3')?.answer).toBe('16');
  expect(lessonOneHundredEightFields.find(field=>field.number==='4')?.answer).toBe('81');
  expect(lessonOneHundredEightFields.filter(field=>field.number.startsWith('5.')).map(field=>field.answer)).toEqual(['3 1/2','4 3/8']);
  expect(lessonOneHundredEightFields.find(field=>field.number==='6')?.answer).toBe('нет');
  expect(lessonOneHundredEightFields.find(field=>field.number==='7')?.answer).toBe('18,19,20,21');
  expect(lessonOneHundredEightFields.find(field=>field.number==='8')?.answer).toBe('2,3,4,5,6');
});
