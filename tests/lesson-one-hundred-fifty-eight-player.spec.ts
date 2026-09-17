import {expect,test} from '@playwright/test';
import fs from 'node:fs';

test('lesson 158 player keeps strict matching persistence and 27-stage contract',()=>{
  const source=fs.readFileSync('src/NaturalMultiplicationDivisionReviewPlayer.tsx','utf8');
  expect(source).toContain("const KEY='mathnikita-lesson-158-progress-v1'");
  expect(source).toContain('canonicalDecimal');
  expect(source).not.toContain('Math.abs');
  expect(source).not.toContain('toFixed');
  expect(source).toContain('lessonNumber!==158');
  expect(source).toContain('20 задач · 50 ответов · умножение и деление');
  expect(source).toContain('lessonOneHundredFiftyEightStageCount=stages.length');
  expect(source).toContain('lessonOneHundredFiftyEightPracticeResponseCount=lessonOneHundredFiftyEightResponseCount');
});
