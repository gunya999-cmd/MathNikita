import {expect,test} from '@playwright/test';
import fs from 'node:fs';

test('lesson 98 player and late registry expose final §26 runtime',()=>{
  const player=fs.readFileSync('src/FractionComparisonSynthesisPlayer.tsx','utf8');
  const registry=fs.readFileSync('src/LateLessonRegistry.tsx','utf8');
  const shell=fs.readFileSync('src/LessonCourseShellV2.tsx','utf8');
  expect(player).toContain('Финал параграфа: не вычисляй дробь, переводи условие');
  expect(player).toContain('№724 (7–12)');
  expect(player).toContain('№737');
  expect(player).toContain('№739');
  expect(player).toContain('20 обязательных задач');
  expect(player).toContain('§ 26 завершён');
  expect(registry).toContain('LATEST_READY_LESSON=98');
  expect(registry).toContain('98:lessonNinetyEightOpening');
  expect(registry).toContain('case 98:return <FractionComparisonSynthesisPlayer');
  expect(shell).toContain('lateOpeningForLesson(selectedLesson)');
  expect(shell).toContain('lateRuntimeForLesson(selectedLesson)');
});
