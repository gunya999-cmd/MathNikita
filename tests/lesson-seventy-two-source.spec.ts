import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {expect,test} from '@playwright/test';
import {extendedPracticeByLesson} from '../src/data/extendedPracticeData';
import {extendedPracticeSetResponseCount} from '../src/data/extendedPracticeTypes';

test('lesson 72 preserves the verified method-guide route and mature lesson contract',()=>{
  const source=readFileSync(resolve(process.cwd(),'src/PowerReinforcementPlayer.tsx'),'utf8');
  const stageIds=source.match(/^\{id:'l72-[^']+'/gm)??[];
  const activityIds=source.match(/activity:\{id:'l72-p\d+'/g)??[];
  expect(stageIds).toHaveLength(36);
  expect(activityIds).toHaveLength(21);
  expect(new Set(stageIds).size).toBe(36);
  expect(new Set(activityIds).size).toBe(21);
  for(const exercise of ['№ 554','№ 556','№ 558','№ 560','№ 562'])expect(source).toContain(exercise);
  expect(source).toContain('Устно № 3');
  expect(source).toContain('Устно № 4');
  expect(source).toContain('Устно № 5');
  expect(source).toContain('(x²−y²):(x−y)');
  expect(source).toContain('243=3⁵');
  expect(source).toContain('Разность квадратов ≠ квадрат разности');
  expect(source).toContain('№ 563 оставлен как дополнительный источник задания и не подменяется придуманной формулировкой');
  expect(source).toContain('data-source-exercise-range="554,556,558,560,562"');
  const practice=extendedPracticeByLesson[72];
  expect(practice.tasks).toHaveLength(20);
  expect(extendedPracticeSetResponseCount(practice)).toBe(50);
  expect(practice.tasks.filter(task=>task.provenance==='parametric')).toHaveLength(0);
});
