import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {expect,test} from '@playwright/test';
import {extendedPracticeByLesson} from '../src/data/extendedPracticeData';
import {extendedPracticeSetResponseCount} from '../src/data/extendedPracticeTypes';

test('lesson 68 preserves the verified method-guide route and mature lesson contract',()=>{
  const source=readFileSync(resolve(process.cwd(),'src/RemainderDivisionPlayer.tsx'),'utf8');
  const stageIds=source.match(/^\{id:'l68-[^']+'/gm)??[];
  const activityIds=source.match(/activity:\{id:'l68-p\d+'/g)??[];
  expect(stageIds).toHaveLength(36);
  expect(activityIds).toHaveLength(21);
  expect(new Set(stageIds).size).toBe(36);
  expect(new Set(activityIds).size).toBe(21);
  for(const exercise of ['№ 521','№ 523','№ 525','№ 527','№ 545'])expect(source).toContain(exercise);
  expect(source).toContain('0 ≤ r < b');
  expect(source).toContain('a = b·q + r');
  expect(source).toContain('data-source-exercise-range="521,523,525,527,545"');
  const practice=extendedPracticeByLesson[68];
  expect(practice.tasks).toHaveLength(20);
  expect(extendedPracticeSetResponseCount(practice)).toBe(50);
});
