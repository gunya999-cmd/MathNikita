import {expect,test} from '@playwright/test';
import fs from 'node:fs';

test('lesson 167 player keeps strict matching persistence and 27-stage contract',()=>{
  const source=fs.readFileSync('src/CombinatorialReviewPlayer.tsx','utf8');
  const decimal=fs.readFileSync('src/exactDecimal.ts','utf8');
  expect(source).toContain("const KEY='mathnikita-lesson-167-progress-v1'");
  expect(source).toContain('exactDecimalEquals');
  expect(source).toContain('lessonNumber!==167');
  expect(source).toContain('20 задач · 50 ответов · комбинаторные задачи');
  expect(source).toContain('lessonOneHundredSixtySevenStageCount=stages.length');
  expect(source).toContain('lessonOneHundredSixtySevenPracticeResponseCount=lessonOneHundredSixtySevenResponseCount');
  expect(decimal).not.toContain('parseFloat');
  expect(decimal).not.toContain('Math.abs');
  expect(decimal).not.toContain('toFixed');
});
