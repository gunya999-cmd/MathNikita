import {expect,test} from '@playwright/test';
import fs from 'node:fs';

test('lesson 171 player keeps persistence strict matching and 27-stage contract',()=>{
  const source=fs.readFileSync('src/FinalTextProblemReviewPlayer.tsx','utf8');
  const decimal=fs.readFileSync('src/exactDecimal.ts','utf8');
  expect(source).toContain("const KEY='mathnikita-lesson-171-progress-v1'");
  expect(source).toContain('exactDecimalEquals');
  expect(source).toContain('lessonNumber!==171');
  expect(source).toContain('20 задач · 50 ответов · финальный смешанный тренажёр');
  expect(source).toContain('lessonOneHundredSeventyOneStageCount=stages.length');
  expect(source).toContain('lessonOneHundredSeventyOnePracticeResponseCount=lessonOneHundredSeventyOneResponseCount');
  expect(decimal).not.toContain('parseFloat');
  expect(decimal).not.toContain('Math.abs');
  expect(decimal).not.toContain('toFixed');
});
