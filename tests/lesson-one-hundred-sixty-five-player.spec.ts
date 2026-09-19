import {expect,test} from '@playwright/test';
import fs from 'node:fs';

test('lesson 165 player keeps strict decimal matching persistence and 27-stage contract',()=>{
  const source=fs.readFileSync('src/AreaVolumeReviewPlayer.tsx','utf8');
  const decimal=fs.readFileSync('src/exactDecimal.ts','utf8');
  expect(source).toContain("const KEY='mathnikita-lesson-165-progress-v1'");
  expect(source).toContain('exactDecimalEquals');
  expect(source).toContain('lessonNumber!==165');
  expect(source).toContain('20 задач · 50 ответов · площади и объёмы');
  expect(source).toContain('lessonOneHundredSixtyFiveStageCount=stages.length');
  expect(source).toContain('lessonOneHundredSixtyFivePracticeResponseCount=lessonOneHundredSixtyFiveResponseCount');
  expect(source).toContain('inputMode="decimal"');
  expect(decimal).not.toContain('parseFloat');
  expect(decimal).not.toContain('Math.abs');
  expect(decimal).not.toContain('toFixed');
});
