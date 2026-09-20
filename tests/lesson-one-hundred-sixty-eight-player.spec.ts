import {expect,test} from '@playwright/test';
import fs from 'node:fs';

test('lesson 168 player keeps strict matching persistence and 27-stage contract',()=>{
  const source=fs.readFileSync('src/AdvancedCombinatorialReviewPlayer.tsx','utf8');
  const decimal=fs.readFileSync('src/exactDecimal.ts','utf8');
  expect(source).toContain("const KEY='mathnikita-lesson-168-progress-v1'");
  expect(source).toContain('exactDecimalEquals');
  expect(source).toContain('lessonNumber!==168');
  expect(source).toContain('20 задач · 50 ответов · продвинутая комбинаторика');
  expect(source).toContain('lessonOneHundredSixtyEightStageCount=stages.length');
  expect(source).toContain('lessonOneHundredSixtyEightPracticeResponseCount=lessonOneHundredSixtyEightResponseCount');
  expect(decimal).not.toContain('parseFloat');
  expect(decimal).not.toContain('Math.abs');
  expect(decimal).not.toContain('toFixed');
});
