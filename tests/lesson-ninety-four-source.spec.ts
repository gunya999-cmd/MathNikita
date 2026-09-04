import {expect,test} from '@playwright/test';
import {readFileSync} from 'node:fs';
import {yearLessonByNumber} from '../src/data/yearPlan';
import {lessonNinetyFourOpening} from '../src/LessonNinetyFourOpening';

const playerSource=readFileSync(new URL('../src/FractionCompositeProblemsPlayer.tsx',import.meta.url),'utf8');

test('lesson 94 publishes exact §25 composite-problem source and practice contract',()=>{
  const lesson=yearLessonByNumber.get(94);
  expect(lesson?.available).toBe(true);
  expect(lesson?.paragraph).toBe('§ 25');
  expect(lesson?.title).toContain('Составные задачи');
  expect(lessonNinetyFourOpening.kicker).toContain('4 из 5');
  const goals=lessonNinetyFourOpening.goals.join(' ');
  expect(goals).toContain('№ 701');
  expect(goals).toContain('№ 703');
  expect(goals).toContain('№ 717');
  expect(playerSource).toContain("source:'№ 701'");
  expect(playerSource).toContain("numeric('a','Семь восемнадцатых прямого угла',35)");
  expect(playerSource).toContain("numeric('b','Пять двенадцатых развёрнутого угла',75)");
  expect(playerSource).toContain("source:'№ 703'");
  expect(playerSource).toContain("numeric('d1','Первый день',96)");
  expect(playerSource).toContain("numeric('d2','Второй день',120)");
  expect(playerSource).toContain("numeric('d3','Третий день',260)");
  expect(playerSource).toContain("numeric('d4','Четвёртый день',148)");
  expect(playerSource).toContain("source:'№ 717'");
  expect(playerSource).toContain("numeric('small','С меньшей яблони',24)");
  expect(playerSource).toContain("numeric('large','Со второй яблони',41)");
  expect(playerSource).toContain('if(practice.length!==20||responseCount!==50)');
  expect(playerSource).toContain('export const lessonNinetyFourStageCount=stages.length');
  expect(playerSource).toContain('export const lessonNinetyFourPracticeTaskCount=practice.length');
  expect(playerSource).toContain('export const lessonNinetyFourPracticeResponseCount=responseCount');
});
