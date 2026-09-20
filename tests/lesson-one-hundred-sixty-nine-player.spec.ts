import {expect,test} from '@playwright/test';
import fs from 'node:fs';

test('lesson 169 player keeps persistence strict matching and 27-stage contract',()=>{
  const source=fs.readFileSync('src/TextProblemModelingReviewPlayer.tsx','utf8');
  const decimal=fs.readFileSync('src/exactDecimal.ts','utf8');
  expect(source).toContain("const KEY='mathnikita-lesson-169-progress-v1'");
  expect(source).toContain('exactDecimalEquals');
  expect(source).toContain('lessonNumber!==169');
  expect(source).toContain('20 задач · 50 ответов · математическая модель текстовых задач');
  expect(source).toContain('lessonOneHundredSixtyNineStageCount=stages.length');
  expect(source).toContain('lessonOneHundredSixtyNinePracticeResponseCount=lessonOneHundredSixtyNineResponseCount');
  expect(decimal).not.toContain('parseFloat');
  expect(decimal).not.toContain('Math.abs');
  expect(decimal).not.toContain('toFixed');
});
