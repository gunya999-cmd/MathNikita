import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {expect,test} from '@playwright/test';
import {extendedPracticeByLesson} from '../src/data/extendedPracticeData';
import {extendedPracticeSetResponseCount} from '../src/data/extendedPracticeTypes';

test('lesson 71 preserves the verified method-guide route and mature lesson contract',()=>{
  const source=readFileSync(resolve(process.cwd(),'src/PowerFoundationsPlayer.tsx'),'utf8');
  const stageIds=source.match(/^\{id:'l71-[^']+'/gm)??[];
  const activityIds=source.match(/activity:\{id:'l71-p\d+'/g)??[];
  expect(stageIds).toHaveLength(36);
  expect(activityIds).toHaveLength(21);
  expect(new Set(stageIds).size).toBe(36);
  expect(new Set(activityIds).size).toBe(21);
  for(const exercise of ['№ 548','№ 549','№ 550','№ 552','№ 560'])expect(source).toContain(exercise);
  expect(source).toContain('Устно № 1');
  expect(source).toContain('Устно № 2');
  expect(source).toContain('a¹=a');
  expect(source).toContain('квадрат');
  expect(source).toContain('куб');
  expect(source).toContain('сначала вычисляют степень');
  expect(source).toContain('десять множителей 6 дают 6¹⁰');
  expect(source).toContain('data-source-exercise-range="548,549,550,552,560"');
  const practice=extendedPracticeByLesson[71];
  expect(practice.tasks).toHaveLength(20);
  expect(extendedPracticeSetResponseCount(practice)).toBe(50);
  expect(practice.tasks.filter(task=>task.provenance==='parametric')).toHaveLength(0);
});
