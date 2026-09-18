import {expect,test} from '@playwright/test';
import fs from 'node:fs';

test('lesson 161 player keeps strict decimal matching persistence and 27-stage contract',()=>{
  const source=fs.readFileSync('src/DecimalMultiplicationDivisionReviewPlayer.tsx','utf8');
  const decimal=fs.readFileSync('src/exactDecimal.ts','utf8');
  expect(source).toContain("const KEY='mathnikita-lesson-161-progress-v1'");
  expect(source).toContain('exactDecimalEquals');
  expect(source).toContain('lessonNumber!==161');
  expect(source).toContain('20 задач · 50 ответов · умножение и деление десятичных дробей');
  expect(source).toContain('lessonOneHundredSixtyOneStageCount=stages.length');
  expect(source).toContain('lessonOneHundredSixtyOnePracticeResponseCount=lessonOneHundredSixtyOneResponseCount');
  expect(decimal).not.toContain('parseFloat');
  expect(decimal).not.toContain('Math.abs');
  expect(decimal).not.toContain('toFixed');
});
