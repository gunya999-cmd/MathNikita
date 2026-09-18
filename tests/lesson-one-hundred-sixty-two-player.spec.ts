import {expect,test} from '@playwright/test';
import fs from 'node:fs';

test('lesson 162 player keeps strict decimal matching persistence and 27-stage contract',()=>{
  const source=fs.readFileSync('src/PercentCourseReviewPlayer.tsx','utf8');
  const decimal=fs.readFileSync('src/exactDecimal.ts','utf8');
  expect(source).toContain("const KEY='mathnikita-lesson-162-progress-v1'");
  expect(source).toContain('exactDecimalEquals');
  expect(source).toContain('lessonNumber!==162');
  expect(source).toContain('20 задач · 50 ответов · проценты от числа и число по процентам');
  expect(source).toContain('lessonOneHundredSixtyTwoStageCount=stages.length');
  expect(source).toContain('lessonOneHundredSixtyTwoPracticeResponseCount=lessonOneHundredSixtyTwoResponseCount');
  expect(decimal).not.toContain('parseFloat');
  expect(decimal).not.toContain('Math.abs');
  expect(decimal).not.toContain('toFixed');
});
