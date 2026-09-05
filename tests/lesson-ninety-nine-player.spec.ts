import {expect,test} from '@playwright/test';
import {readFileSync} from 'node:fs';

const player=readFileSync(new URL('../src/SameDenominatorFractionOperationsPlayer.tsx',import.meta.url),'utf8');
const registry=readFileSync(new URL('../src/LateLessonRegistry.tsx',import.meta.url),'utf8');

test('lesson 99 player covers same-denominator addition, subtraction and equations',()=>{
  expect(player).toContain("id:'l99-parts'");
  expect(player).toContain("id:'l99-add'");
  expect(player).toContain("id:'l99-subtract'");
  expect(player).toContain("id:'l99-chain'");
  expect(player).toContain("id:'l99-equations'");
  expect(player).toContain("id:'l99-word-model'");
  expect(player).toContain("id:'l99-error'");
  expect(player).toContain("id:'l99-summary'");
  expect(player).toContain("detail?.lessonNumber!==99");
  expect(player).toContain('mathnikita-lesson-99-progress-v1');
  expect(registry).toContain('LATEST_READY_LESSON=99');
  expect(registry).toContain('99:lessonNinetyNineOpening');
  expect(registry).toContain('case 99:return <SameDenominatorFractionOperationsPlayer');
});
