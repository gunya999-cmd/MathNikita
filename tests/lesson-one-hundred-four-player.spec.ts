import {expect,test} from '@playwright/test';
import {readFileSync} from 'node:fs';
import {lessonOneHundredFourPractice,lessonOneHundredFourResponseCount} from '../src/data/lessonOneHundredFourPractice';
import {lessonOneHundredFourOpening} from '../src/LessonOneHundredFourOpening';
const source=readFileSync(new URL('../src/MixedNumberPracticePlayer.tsx',import.meta.url),'utf8');

test('lesson 104 player covers mixed-number practice and inequalities',()=>{
  expect(lessonOneHundredFourOpening.kicker).toContain('3 из 5');
  expect(lessonOneHundredFourPractice).toHaveLength(20);
  expect(lessonOneHundredFourResponseCount).toBe(50);
  expect(source).toContain("id:'l104-borrow'");
  expect(source).toContain("id:'l104-equation'");
  expect(source).toContain("id:'l104-floor'");
  expect(source).toContain("id:'l104-ceil'");
  expect(source).toContain("id:'l104-summary'");
  expect(source).toContain("d?.lessonNumber!==104");
  expect(source).toContain('mathnikita-lesson-104-progress-v1');
});
