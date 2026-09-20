import {expect,test} from '@playwright/test';
import fs from 'node:fs';

test('lesson 173 player keeps persistence strict matching diagnostic map and 27-stage contract',()=>{
  const source=fs.readFileSync('src/CourseDiagnosticReviewPlayer.tsx','utf8');
  const decimal=fs.readFileSync('src/exactDecimal.ts','utf8');
  expect(source).toContain("const KEY='mathnikita-lesson-173-progress-v1'");
  expect(source).toContain('exactDecimalEquals');
  expect(source).toContain('lessonNumber!==173');
  expect(source).toContain('Диагностическая карта');
  expect(source).toContain('Натуральные числа');
  expect(source).toContain('Выражения и уравнения');
  expect(source).toContain('lessonOneHundredSeventyThreeStageCount=stages.length');
  expect(source).toContain('lessonOneHundredSeventyThreePracticeResponseCount=lessonOneHundredSeventyThreeResponseCount');
  expect(decimal).not.toContain('parseFloat');
  expect(decimal).not.toContain('Math.abs');
  expect(decimal).not.toContain('toFixed');
});
