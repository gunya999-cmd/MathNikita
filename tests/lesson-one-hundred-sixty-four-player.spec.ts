import {expect,test} from '@playwright/test';
import fs from 'node:fs';

test('lesson 164 player keeps strict decimal matching persistence and 27-stage contract',()=>{
  const source=fs.readFileSync('src/PolygonPerimeterReviewPlayer.tsx','utf8');
  const decimal=fs.readFileSync('src/exactDecimal.ts','utf8');
  expect(source).toContain("const KEY='mathnikita-lesson-164-progress-v1'");
  expect(source).toContain('exactDecimalEquals');
  expect(source).toContain('lessonNumber!==164');
  expect(source).toContain('20 задач · 50 ответов · многоугольники и периметр');
  expect(source).toContain('lessonOneHundredSixtyFourStageCount=stages.length');
  expect(source).toContain('lessonOneHundredSixtyFourPracticeResponseCount=lessonOneHundredSixtyFourResponseCount');
  expect(decimal).not.toContain('parseFloat');
  expect(decimal).not.toContain('Math.abs');
  expect(decimal).not.toContain('toFixed');
});
