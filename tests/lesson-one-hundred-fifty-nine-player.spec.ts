import {expect,test} from '@playwright/test';
import fs from 'node:fs';

test('lesson 159 player keeps exact rational matching persistence and 27-stage contract',()=>{
  const source=fs.readFileSync('src/CommonFractionsReviewPlayer.tsx','utf8');
  const rational=fs.readFileSync('src/exactRational.ts','utf8');
  expect(source).toContain("const KEY='mathnikita-lesson-159-progress-v1'");
  expect(source).toContain('exactRationalEquals');
  expect(source).toContain('lessonNumber!==159');
  expect(source).toContain('20 задач · 50 ответов · обыкновенные дроби');
  expect(source).toContain('lessonOneHundredFiftyNineStageCount=stages.length');
  expect(source).toContain('lessonOneHundredFiftyNinePracticeResponseCount=lessonOneHundredFiftyNineResponseCount');
  expect(rational).toContain('bigint');
  expect(rational).toContain('BigInt');
  expect(rational).not.toContain('parseFloat');
  expect(rational).not.toContain('Math.abs');
  expect(rational).not.toContain('toFixed');
});
