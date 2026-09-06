import {expect,test} from '@playwright/test';
import {readFileSync} from 'node:fs';
import {lessonOneHundredSixPractice,lessonOneHundredSixResponseCount} from '../src/data/lessonOneHundredSixPractice';
import {lessonOneHundredSixOpening} from '../src/LessonOneHundredSixOpening';
const source=readFileSync(new URL('../src/MixedNumberSynthesisPlayer.tsx',import.meta.url),'utf8');

test('lesson 106 player covers final mixed-number synthesis',()=>{
  expect(lessonOneHundredSixOpening.kicker).toContain('5 из 5');
  expect(lessonOneHundredSixPractice).toHaveLength(20);
  expect(lessonOneHundredSixResponseCount).toBe(50);
  expect(source).toContain("id:'l106-map'");
  expect(source).toContain("id:'l106-convert'");
  expect(source).toContain("id:'l106-operations'");
  expect(source).toContain("id:'l106-denominator'");
  expect(source).toContain("id:'l106-summary'");
  expect(source).toContain("d?.lessonNumber!==106");
  expect(source).toContain('mathnikita-lesson-106-progress-v1');
});
