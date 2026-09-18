import {expect,test} from '@playwright/test';
import fs from 'node:fs';

test('lesson 163 player keeps strict decimal matching persistence and 27-stage contract',()=>{
  const source=fs.readFileSync('src/AdvancedPercentReviewPlayer.tsx','utf8');
  const decimal=fs.readFileSync('src/exactDecimal.ts','utf8');
  expect(source).toContain("const KEY='mathnikita-lesson-163-progress-v1'");
  expect(source).toContain('exactDecimalEquals');
  expect(source).toContain('lessonNumber!==163');
  expect(source).toContain('20 задач · 50 ответов · составные и обратные проценты');
  expect(source).toContain('lessonOneHundredSixtyThreeStageCount=stages.length');
  expect(source).toContain('lessonOneHundredSixtyThreePracticeResponseCount=lessonOneHundredSixtyThreeResponseCount');
  expect(decimal).not.toContain('parseFloat');
  expect(decimal).not.toContain('Math.abs');
  expect(decimal).not.toContain('toFixed');
});
