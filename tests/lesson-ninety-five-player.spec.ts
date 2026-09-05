import {expect,test} from '@playwright/test';
import {readFileSync} from 'node:fs';
import {lessonNinetyFivePractice,lessonNinetyFiveResponseCount} from '../src/data/lessonNinetyFivePractice';
import {lessonNinetyFiveOpening} from '../src/LessonNinetyFiveOpening';

const playerSource=readFileSync(new URL('../src/FractionSynthesisPlayer.tsx',import.meta.url),'utf8');

test('lesson 95 player covers final §25 synthesis and exact practice contract',()=>{
  expect(lessonNinetyFiveOpening.kicker).toContain('5 из 5');
  expect(lessonNinetyFivePractice).toHaveLength(20);
  expect(lessonNinetyFiveResponseCount).toBe(50);
  expect(playerSource).toContain("id:'l95-mission'");
  expect(playerSource).toContain("id:'l95-summary'");
  expect(playerSource).toContain('lessonNinetyFiveStageCount=stages.length');
  expect(playerSource).toContain('lessonNinetyFivePracticeTaskCount=lessonNinetyFivePractice.length');
  expect(playerSource).toContain('lessonNinetyFivePracticeResponseCount=lessonNinetyFiveResponseCount');
  expect(playerSource).toContain("detail?.lessonNumber!==95");
  expect(playerSource).toContain("mathnikita-lesson-95-progress-v1");
  expect(playerSource).toContain('instant-feedback good');
  expect(playerSource).toContain('instant-feedback bad');
  expect(playerSource).toContain('20 задач и ровно 50 проверяемых ответов');
});
