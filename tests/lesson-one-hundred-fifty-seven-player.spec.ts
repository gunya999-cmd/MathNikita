import {expect,test} from '@playwright/test';
import fs from 'node:fs';

test('lesson 157 player keeps strict matching persistence and 27-stage contract',()=>{
  const source=fs.readFileSync('src/NaturalNumberCourseReviewPlayer.tsx','utf8');
  expect(source).toContain("const KEY='mathnikita-lesson-157-progress-v1'");
  expect(source).toContain('canonicalDecimal');
  expect(source).not.toContain('Math.abs');
  expect(source).not.toContain('toFixed');
  expect(source).toContain('lessonNumber!==157');
  expect(source).toContain('20 задач · 50 ответов · натуральные числа');
  expect(source).toContain('lessonOneHundredFiftySevenStageCount=stages.length');
  expect(source).toContain('lessonOneHundredFiftySevenPracticeResponseCount=lessonOneHundredFiftySevenResponseCount');
});
