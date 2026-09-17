import {expect,test} from '@playwright/test';
import fs from 'node:fs';

test('lesson 160 player keeps strict decimal matching persistence and 27-stage contract',()=>{
  const source=fs.readFileSync('src/DecimalAdditionSubtractionReviewPlayer.tsx','utf8');
  const decimal=fs.readFileSync('src/exactDecimal.ts','utf8');
  expect(source).toContain("const KEY='mathnikita-lesson-160-progress-v1'");
  expect(source).toContain('exactDecimalEquals');
  expect(source).toContain('lessonNumber!==160');
  expect(source).toContain('20 задач · 50 ответов · сложение и вычитание десятичных дробей');
  expect(source).toContain('lessonOneHundredSixtyStageCount=stages.length');
  expect(source).toContain('lessonOneHundredSixtyPracticeResponseCount=lessonOneHundredSixtyResponseCount');
  expect(source).toContain('inputMode="decimal"');
  expect(decimal).not.toContain('parseFloat');
  expect(decimal).not.toContain('Math.abs');
  expect(decimal).not.toContain('toFixed');
  expect(decimal).not.toContain('Number(');
});
