import {expect,test} from '@playwright/test';
import {readFileSync} from 'node:fs';
import {yearLessonByNumber} from '../src/data/yearPlan';
import {lessonNinetyThreeOpening} from '../src/LessonNinetyThreeOpening';
import {lessonNinetyThreePracticeResponseCount,lessonNinetyThreePracticeTaskCount,lessonNinetyThreeStageCount} from '../src/FractionWholeFromPartPlayer';

const playerSource=readFileSync(new URL('../src/FractionWholeFromPartPlayer.tsx',import.meta.url),'utf8');

test('lesson 93 publishes exact §25 inverse-fraction source and practice contract',()=>{
  const lesson=yearLessonByNumber.get(93);
  expect(lesson?.available).toBe(true);
  expect(lesson?.paragraph).toBe('§ 25');
  expect(lesson?.title).toContain('Нахождение целого');
  expect(lessonNinetyThreeOpening.kicker).toContain('3 из 5');
  expect(lessonNinetyThreeOpening.goals.join(' ')).toContain('№ 692');
  expect(playerSource).toContain("source:'№ 692'");
  expect(playerSource).toContain("numeric('a','Одна девятая равна 90',810)");
  expect(playerSource).toContain("numeric('b','Две пятых равны 90',225)");
  expect(playerSource).toContain("numeric('c','Две девятых равны 90',405)");
  expect(playerSource).toContain("numeric('d','Три десятых равны 90',300)");
  expect(playerSource).toContain("numeric('e','Пять шестых равны 90',108)");
  expect(playerSource).toContain("numeric('f','Восемнадцать девятнадцатых равны 90',95)");
  expect(lessonNinetyThreeStageCount).toBe(30);
  expect(lessonNinetyThreePracticeTaskCount).toBe(20);
  expect(lessonNinetyThreePracticeResponseCount).toBe(50);
});