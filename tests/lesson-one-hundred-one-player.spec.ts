import {expect,test} from '@playwright/test';
import {readFileSync} from 'node:fs';
import {lessonOneHundredOnePractice,lessonOneHundredOneResponseCount} from '../src/data/lessonOneHundredOnePractice';
import {lessonOneHundredOneOpening} from '../src/LessonOneHundredOneOpening';
const source=readFileSync(new URL('../src/FractionDivisionConnectionPlayer.tsx',import.meta.url),'utf8');

test('lesson 101 player covers §28 fraction-division connection',()=>{
  expect(lessonOneHundredOneOpening.kicker).toContain('1 из 1');
  expect(lessonOneHundredOnePractice).toHaveLength(20);
  expect(lessonOneHundredOneResponseCount).toBe(50);
  expect(source).toContain("id:'l101-fraction-bar'");
  expect(source).toContain("id:'l101-quotient-to-fraction'");
  expect(source).toContain("id:'l101-fraction-to-quotient'");
  expect(source).toContain("id:'l101-natural-as-fraction'");
  expect(source).toContain("id:'l101-equations'");
  expect(source).toContain("id:'l101-summary'");
  expect(source).toContain("detail?.lessonNumber!==101");
  expect(source).toContain('mathnikita-lesson-101-progress-v1');
});
