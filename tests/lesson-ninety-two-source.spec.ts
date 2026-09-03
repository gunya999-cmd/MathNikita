import {expect,test} from '@playwright/test';
import {readFileSync} from 'node:fs';
import {yearLessonByNumber} from '../src/data/yearPlan';
import {lessonNinetyTwoOpening} from '../src/LessonNinetyTwoOpening';

const playerSource=readFileSync(new URL('../src/FractionOfNumberPlayer.tsx',import.meta.url),'utf8');

test('lesson 92 publishes exact §25 source and practice contract',()=>{
  const lesson=yearLessonByNumber.get(92);
  expect(lesson?.available).toBe(true);
  expect(lesson?.paragraph).toBe('§ 25');
  expect(lesson?.title).toContain('Нахождение дроби от числа');
  expect(lessonNinetyTwoOpening.kicker).toContain('§ 25');
  expect(lessonNinetyTwoOpening.goals.join(' ')).toContain('№ 684');
  expect(lessonNinetyTwoOpening.goals.join(' ')).toContain('№ 686');
  expect(playerSource).toContain("source:'№ 684'");
  expect(playerSource).toContain("source:'№ 686'");
  expect(playerSource).toContain("source:'№ 687'");
  expect(playerSource).toContain("numeric('a','Одна треть от 36',12)");
  expect(playerSource).toContain("numeric('f','Одиннадцать восемнадцатых',22)");
  expect(playerSource).toContain("numeric('r','Прочитано страниц',80)");
  expect(playerSource).toContain("numeric('r','Пять восьмых',45)");
  expect(playerSource).toContain('practice.length!==20||responseCount!==50');
  expect(playerSource).toContain('lessonNinetyTwoStageCount=stages.length');
  expect(playerSource).toContain('lessonNinetyTwoPracticeTaskCount=practice.length');
  expect(playerSource).toContain('lessonNinetyTwoPracticeResponseCount=responseCount');
});
