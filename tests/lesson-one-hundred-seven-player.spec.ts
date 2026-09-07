import {expect,test} from '@playwright/test';
import {readFileSync} from 'node:fs';
import {lessonOneHundredSevenPractice,lessonOneHundredSevenResponseCount} from '../src/data/lessonOneHundredSevenPractice';
import {lessonOneHundredSevenOpening} from '../src/LessonOneHundredSevenOpening';
const source=readFileSync(new URL('../src/ChapterFourReviewPlayer.tsx',import.meta.url),'utf8');

test('lesson 107 player covers every chapter 4 skill family before control 6',()=>{
  expect(lessonOneHundredSevenOpening.title).toContain('Повторение главы 4');
  expect(lessonOneHundredSevenPractice).toHaveLength(20);
  expect(lessonOneHundredSevenResponseCount).toBe(50);
  expect(source).toContain("id:'l107-map'");
  expect(source).toContain("id:'l107-part'");
  expect(source).toContain("id:'l107-compare'");
  expect(source).toContain("id:'l107-operations'");
  expect(source).toContain("id:'l107-division'");
  expect(source).toContain("id:'l107-mixed'");
  expect(source).toContain("id:'l107-control'");
  expect(source).toContain("id:'l107-summary'");
  expect(source).toContain("d?.lessonNumber!==107");
  expect(source).toContain('mathnikita-lesson-107-progress-v1');
});
