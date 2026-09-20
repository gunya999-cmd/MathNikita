import {expect,test} from '@playwright/test';
import {lessonOneHundredSeventyThreePractice,lessonOneHundredSeventyThreeResponseCount} from '../src/data/lessonOneHundredSeventyThreePractice';
import {extendedPracticeByLesson} from '../src/data/extendedPracticeData';
import {exactDecimalEquals} from '../src/exactDecimal';

test('lesson 173 has 20 tasks and exactly 50 checked responses',()=>{
  expect(lessonOneHundredSeventyThreePractice).toHaveLength(20);
  expect(lessonOneHundredSeventyThreeResponseCount).toBe(50);
  expect(lessonOneHundredSeventyThreePractice.reduce((sum,task)=>sum+task.fields.length,0)).toBe(50);
});

test('lesson 173 diagnostic covers eight course domains with planned response weights',()=>{
  const counts=new Map<string,number>();
  for(const task of lessonOneHundredSeventyThreePractice)counts.set(task.domain,(counts.get(task.domain)??0)+task.fields.length);
  expect(Object.fromEntries(counts)).toEqual({
    'Натуральные числа':5,
    'Обыкновенные дроби':7,
    'Десятичные дроби':7,
    'Проценты и среднее':7,
    'Геометрия':8,
    'Комбинаторика':4,
    'Текстовые задачи':6,
    'Выражения и уравнения':6,
  });
  expect(lessonOneHundredSeventyThreePractice.every(task=>task.source.includes('КТП 173')&&task.sourceExact!==true)).toBe(true);
});

test('lesson 173 keeps strict decimal equality',()=>{
  expect(exactDecimalEquals('25,1580','25.158')).toBe(true);
  expect(exactDecimalEquals('18,750','18.75')).toBe(true);
  expect(exactDecimalEquals('18.751','18.75')).toBe(false);
  expect(exactDecimalEquals('75/4','18.75')).toBe(false);
});

test('lesson 173 mandatory practice mirrors all 50 fields',()=>{
  const set=extendedPracticeByLesson[173];
  expect(set).toBeTruthy();
  expect(set.tasks).toHaveLength(20);
  expect(set.tasks.reduce((sum,task)=>sum+(task.type==='multi-input'?task.fields.length:1),0)).toBe(50);
  for(const task of set.tasks)if(task.type==='multi-input')for(const field of task.fields)expect(field.validation).toBe('exact-decimal');
});
