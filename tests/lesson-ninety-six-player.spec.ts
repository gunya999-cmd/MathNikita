import {expect,test} from '@playwright/test';
import {readFileSync} from 'node:fs';
import {lessonNinetySixPractice,lessonNinetySixResponseCount} from '../src/data/lessonNinetySixPractice';
import {lessonNinetySixOpening} from '../src/LessonNinetySixOpening';

const playerSource=readFileSync(new URL('../src/FractionComparisonFoundationsPlayer.tsx',import.meta.url),'utf8');

test('lesson 96 player covers first §26 comparison models and 20/50 contract',()=>{
  expect(lessonNinetySixOpening.kicker).toContain('1 из 3');
  expect(lessonNinetySixPractice).toHaveLength(20);
  expect(lessonNinetySixResponseCount).toBe(50);
  expect(playerSource).toContain("id:'l96-whole'");
  expect(playerSource).toContain("id:'l96-proper'");
  expect(playerSource).toContain("id:'l96-improper'");
  expect(playerSource).toContain("id:'l96-same-denominator'");
  expect(playerSource).toContain("id:'l96-same-numerator'");
  expect(playerSource).toContain("id:'l96-summary'");
  expect(playerSource).toContain('lessonNinetySixStageCount=stages.length');
  expect(playerSource).toContain("detail?.lessonNumber!==96");
  expect(playerSource).toContain('mathnikita-lesson-96-progress-v1');
});
