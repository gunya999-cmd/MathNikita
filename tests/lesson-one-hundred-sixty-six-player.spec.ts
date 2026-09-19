import {expect,test} from '@playwright/test';
import fs from 'node:fs';

test('lesson 166 player keeps strict decimal matching persistence and 27-stage contract',()=>{
  const source=fs.readFileSync('src/AngleMeasurementReviewPlayer.tsx','utf8');
  const decimal=fs.readFileSync('src/exactDecimal.ts','utf8');
  expect(source).toContain("const KEY='mathnikita-lesson-166-progress-v1'");
  expect(source).toContain('exactDecimalEquals');
  expect(source).toContain('lessonNumber!==166');
  expect(source).toContain('20 задач · 50 ответов · измерение и построение углов');
  expect(source).toContain('lessonOneHundredSixtySixStageCount=stages.length');
  expect(source).toContain('lessonOneHundredSixtySixPracticeResponseCount=lessonOneHundredSixtySixResponseCount');
  expect(decimal).not.toContain('parseFloat');
  expect(decimal).not.toContain('Math.abs');
  expect(decimal).not.toContain('toFixed');
});
