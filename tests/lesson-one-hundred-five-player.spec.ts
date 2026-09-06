import {expect,test} from '@playwright/test';
import {readFileSync} from 'node:fs';
import {lessonOneHundredFivePractice,lessonOneHundredFiveResponseCount} from '../src/data/lessonOneHundredFivePractice';
import {lessonOneHundredFiveOpening} from '../src/LessonOneHundredFiveOpening';
const source=readFileSync(new URL('../src/MixedNumberAdvancedPlayer.tsx',import.meta.url),'utf8');

test('lesson 105 player covers advanced mixed-number expressions and inequalities',()=>{
  expect(lessonOneHundredFiveOpening.kicker).toContain('4 из 5');
  expect(lessonOneHundredFivePractice).toHaveLength(20);
  expect(lessonOneHundredFiveResponseCount).toBe(50);
  expect(source).toContain("id:'l105-expression'");
  expect(source).toContain("id:'l105-equation'");
  expect(source).toContain("id:'l105-double'");
  expect(source).toContain("id:'l105-denominator'");
  expect(source).toContain("id:'l105-summary'");
  expect(source).toContain("d?.lessonNumber!==105");
  expect(source).toContain('mathnikita-lesson-105-progress-v1');
});
