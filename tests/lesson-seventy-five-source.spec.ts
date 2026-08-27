import {expect,test} from '@playwright/test';
import {readFileSync} from 'node:fs';
import {extendedPracticeLesson75} from '../src/data/extendedPracticeLesson75';
import {extendedPracticeSetResponseCount} from '../src/data/extendedPracticeTypes';

test('lesson 75 keeps the verified Merzlyak §21 reinforcement route and mature lesson contract',()=>{
  const source=readFileSync(new URL('../src/AreaReinforcementPlayer.tsx',import.meta.url),'utf8');
  const stageIds=[...source.matchAll(/^\{id:'(l75-[^']+)'/gm)].map(match=>match[1]);
  const activityIds=[...source.matchAll(/activity:\{id:'(l75-p\d+)'/g)].map(match=>match[1]);
  expect(stageIds).toHaveLength(36);expect(new Set(stageIds).size).toBe(36);
  expect(activityIds).toHaveLength(21);expect(new Set(activityIds).size).toBe(21);
  for(const marker of ['§ 21','№ 574','№ 576','№ 578','№ 589','№ 596(2)','1 а = 100 м²','1 га = 100 а','S=ab'])expect(source).toContain(marker);
  expect(source).toContain('№ 578 · source checkpoint');
  expect(source).toContain('№ 596(2) · source checkpoint');
  expect(source).toContain('не подменяет её похожей задачей');
  expect(source).toContain('не реконструируем');
  expect(extendedPracticeLesson75.tasks).toHaveLength(20);
  expect(extendedPracticeSetResponseCount(extendedPracticeLesson75)).toBe(50);
  expect(new Set(extendedPracticeLesson75.tasks.map(task=>task.id)).size).toBe(20);
});
