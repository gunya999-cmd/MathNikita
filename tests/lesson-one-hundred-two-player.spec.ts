import {expect,test} from '@playwright/test';
import {readFileSync} from 'node:fs';
import {lessonOneHundredTwoPractice,lessonOneHundredTwoResponseCount} from '../src/data/lessonOneHundredTwoPractice';
import {lessonOneHundredTwoOpening} from '../src/LessonOneHundredTwoOpening';
const source=readFileSync(new URL('../src/MixedNumberFoundationsPlayer.tsx',import.meta.url),'utf8');

test('lesson 102 player covers mixed-number foundations',()=>{
  expect(lessonOneHundredTwoOpening.kicker).toContain('1 из 5');
  expect(lessonOneHundredTwoPractice).toHaveLength(20);
  expect(lessonOneHundredTwoResponseCount).toBe(50);
  expect(source).toContain("id:'l102-meaning'");
  expect(source).toContain("id:'l102-divide'");
  expect(source).toContain("id:'l102-remainder'");
  expect(source).toContain("id:'l102-back'");
  expect(source).toContain("id:'l102-summary'");
  expect(source).toContain("detail?.lessonNumber!==102");
  expect(source).toContain('mathnikita-lesson-102-progress-v1');
});
