import {expect,test} from '@playwright/test';
import fs from 'node:fs';

test('lesson 174 player keeps persistence exam mode and 27-stage contract',()=>{
  const source=fs.readFileSync('src/FinalControlRehearsalPlayer.tsx','utf8');
  const decimal=fs.readFileSync('src/exactDecimal.ts','utf8');
  expect(source).toContain("const KEY='mathnikita-lesson-174-progress-v1'");
  expect(source).toContain('lessonNumber!==174');
  expect(source).toContain('exactDecimalEquals');
  expect(source).toContain('20 задач · 50 ответов · генеральная репетиция');
  expect(source).toContain('Алгоритм не показывается в режиме репетиции');
  expect(source).toContain("totalCorrect>=45?'Высокая готовность'");
  expect(source).toContain('lessonOneHundredSeventyFourStageCount=stages.length');
  expect(source).toContain('lessonOneHundredSeventyFourPracticeResponseCount=lessonOneHundredSeventyFourResponseCount');
  expect(decimal).not.toContain('parseFloat');
  expect(decimal).not.toContain('Math.abs');
  expect(decimal).not.toContain('toFixed');
});
