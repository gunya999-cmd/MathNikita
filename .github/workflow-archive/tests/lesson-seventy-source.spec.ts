import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {expect,test} from '@playwright/test';
import {extendedPracticeByLesson} from '../src/data/extendedPracticeData';
import {extendedPracticeSetResponseCount} from '../src/data/extendedPracticeTypes';

test('lesson 70 preserves the verified method-guide route and mature lesson contract',()=>{
  const source=readFileSync(resolve(process.cwd(),'src/RemainderDivisionSynthesisPlayer.tsx'),'utf8');
  const stageIds=source.match(/^\{id:'l70-[^']+'/gm)??[];
  const activityIds=source.match(/activity:\{id:'l70-p\d+'/g)??[];
  expect(stageIds).toHaveLength(36);
  expect(activityIds).toHaveLength(21);
  expect(new Set(stageIds).size).toBe(36);
  expect(new Set(activityIds).size).toBe(21);
  for(const exercise of ['№ 531','№ 537','№ 538','№ 540','№ 543','№ 544','№ 547'])expect(source).toContain(exercise);
  expect(source).toContain('211−26=185');
  expect(source).toContain('37 или на 185');
  expect(source).toContain('8, 13, 26, 52 и 104');
  expect(source).toContain('366=7·52+2');
  expect(source).toContain('a=10b+r');
  expect(source).toContain('3a+1');expect(source).toContain('8a+3');expect(source).toContain('11a+7');
  expect(source).toContain('полная формулировка не восстановлена надёжно');
  expect(source).toContain('data-source-exercise-range="531,537,538,540,543,544,547"');
  const practice=extendedPracticeByLesson[70];
  expect(practice.tasks).toHaveLength(20);
  expect(extendedPracticeSetResponseCount(practice)).toBe(50);
  expect(practice.tasks.filter(task=>task.provenance==='parametric')).toHaveLength(0);
});
