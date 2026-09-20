import {expect,test} from '@playwright/test';
import fs from 'node:fs';

test('lesson 172 player keeps persistence strict matching and 27-stage contract',()=>{
  const source=fs.readFileSync('src/ExpressionsFormulasEquationsReviewPlayer.tsx','utf8');
  const decimal=fs.readFileSync('src/exactDecimal.ts','utf8');
  expect(source).toContain("const KEY='mathnikita-lesson-172-progress-v1'");
  expect(source).toContain('exactDecimalEquals');
  expect(source).toContain('lessonNumber!==172');
  expect(source).toContain('20 задач · 50 ответов · выражения, формулы и уравнения');
  expect(source).toContain('lessonOneHundredSeventyTwoStageCount=stages.length');
  expect(source).toContain('lessonOneHundredSeventyTwoPracticeResponseCount=lessonOneHundredSeventyTwoResponseCount');
  expect(decimal).not.toContain('parseFloat');
  expect(decimal).not.toContain('Math.abs');
  expect(decimal).not.toContain('toFixed');
});
