import {expect,test} from '@playwright/test';
import fs from 'node:fs';

test('lesson 170 player keeps persistence strict matching and 27-stage contract',()=>{
  const source=fs.readFileSync('src/MultiStepTextProblemReviewPlayer.tsx','utf8');
  const decimal=fs.readFileSync('src/exactDecimal.ts','utf8');
  expect(source).toContain("const KEY='mathnikita-lesson-170-progress-v1'");
  expect(source).toContain('exactDecimalEquals');
  expect(source).toContain('lessonNumber!==170');
  expect(source).toContain('20 задач · 50 ответов · составные текстовые модели');
  expect(source).toContain('lessonOneHundredSeventyStageCount=stages.length');
  expect(source).toContain('lessonOneHundredSeventyPracticeResponseCount=lessonOneHundredSeventyResponseCount');
  expect(decimal).not.toContain('parseFloat');
  expect(decimal).not.toContain('Math.abs');
  expect(decimal).not.toContain('toFixed');
});
