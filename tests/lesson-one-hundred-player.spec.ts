import {expect,test} from '@playwright/test';
import {readFileSync} from 'node:fs';
import {lessonOneHundredPractice,lessonOneHundredResponseCount} from '../src/data/lessonOneHundredPractice';
import {lessonOneHundredOpening} from '../src/LessonOneHundredOpening';
const source=readFileSync(new URL('../src/SameDenominatorFractionSynthesisPlayer.tsx',import.meta.url),'utf8');

test('lesson 100 player covers final §27 synthesis',()=>{
  expect(lessonOneHundredOpening.kicker).toContain('2 из 2');
  expect(lessonOneHundredPractice).toHaveLength(20);
  expect(lessonOneHundredResponseCount).toBe(50);
  expect(source).toContain("id:'l100-two-step'");
  expect(source).toContain("id:'l100-equations'");
  expect(source).toContain("id:'l100-part-of-whole'");
  expect(source).toContain("id:'l100-worst-case'");
  expect(source).toContain("id:'l100-summary'");
  expect(source).toContain("detail?.lessonNumber!==100");
  expect(source).toContain('mathnikita-lesson-100-progress-v1');
});
