import {expect,test} from '@playwright/test';
import {readFileSync} from 'node:fs';
import {lessonOneHundredThreePractice,lessonOneHundredThreeResponseCount} from '../src/data/lessonOneHundredThreePractice';
import {lessonOneHundredThreeOpening} from '../src/LessonOneHundredThreeOpening';
const source=readFileSync(new URL('../src/MixedNumberOperationsPlayer.tsx',import.meta.url),'utf8');

test('lesson 103 player covers mixed-number addition and subtraction',()=>{
  expect(lessonOneHundredThreeOpening.kicker).toContain('2 из 5');
  expect(lessonOneHundredThreePractice).toHaveLength(20);expect(lessonOneHundredThreeResponseCount).toBe(50);
  expect(source).toContain("id:'l103-add'");expect(source).toContain("id:'l103-carry'");expect(source).toContain("id:'l103-borrow'");expect(source).toContain("id:'l103-natural'");expect(source).toContain("id:'l103-summary'");
  expect(source).toContain("d?.lessonNumber!==103");expect(source).toContain('mathnikita-lesson-103-progress-v1');
});
