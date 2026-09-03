import {expect,test} from '@playwright/test';
import {readFileSync} from 'node:fs';
import {yearLessonByNumber} from '../src/data/yearPlan';
import {lessonNinetyOneOpening} from '../src/LessonNinetyOneOpening';

const playerSource=readFileSync(new URL('../src/FractionConceptPlayer.tsx',import.meta.url),'utf8');

test('lesson 91 publishes exact §25 source and practice contract',()=>{
  const lesson=yearLessonByNumber.get(91);
  expect(lesson?.available).toBe(true);
  expect(lesson?.paragraph).toBe('§ 25');
  expect(lesson?.title).toContain('Обыкновенная дробь');
  expect(lessonNinetyOneOpening.kicker).toContain('§ 25');
  expect(lessonNinetyOneOpening.goals.join(' ')).toContain('№ 681');
  expect(playerSource).toContain("source:'№ 681'");
  expect(playerSource).toContain('В классе 32 ученика. Семеро получили оценку «5»');
  expect(playerSource).toContain("answers:['7']");
  expect(playerSource).toContain("answers:['32']");
  expect(playerSource).toContain("fractionField('f','Дробь',7,32)");
  expect(playerSource).toContain('practice.length!==20||responseCount!==50');
  expect(playerSource).toContain('lessonNinetyOnePracticeTaskCount=practice.length');
  expect(playerSource).toContain('lessonNinetyOnePracticeResponseCount=responseCount');
});
