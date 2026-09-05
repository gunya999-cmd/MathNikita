import {expect,test} from '@playwright/test';
import {readFileSync} from 'node:fs';
import {lessonNinetySevenPractice,lessonNinetySevenResponseCount} from '../src/data/lessonNinetySevenPractice';
import {lessonNinetySevenOpening} from '../src/LessonNinetySevenOpening';
const source=readFileSync(new URL('../src/FractionComparisonOrderingPlayer.tsx',import.meta.url),'utf8');

test('lesson 97 player covers ordering and fraction inequalities',()=>{
  expect(lessonNinetySevenOpening.kicker).toContain('2 из 3');
  expect(lessonNinetySevenPractice).toHaveLength(20);
  expect(lessonNinetySevenResponseCount).toBe(50);
  expect(source).toContain("id:'l97-rule-choice'");
  expect(source).toContain("id:'l97-same-denominator'");
  expect(source).toContain("id:'l97-same-numerator'");
  expect(source).toContain("id:'l97-ordering'");
  expect(source).toContain("id:'l97-variable-denominator'");
  expect(source).toContain("id:'l97-variable-numerator'");
  expect(source).toContain("id:'l97-summary'");
  expect(source).toContain("detail?.lessonNumber!==97");
  expect(source).toContain('mathnikita-lesson-97-progress-v1');
});
