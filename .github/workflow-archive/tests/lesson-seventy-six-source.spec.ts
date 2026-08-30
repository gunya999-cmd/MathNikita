import {expect,test} from '@playwright/test';
import {readFileSync} from 'node:fs';
import {extendedPracticeLesson76} from '../src/data/extendedPracticeLesson76';
import {extendedPracticeSetResponseCount} from '../src/data/extendedPracticeTypes';

test('lesson 76 keeps the verified Merzlyak §21 applied-practice route and mature contract',()=>{
  const source=readFileSync(new URL('../src/AreaAppliedPracticePlayer.tsx',import.meta.url),'utf8');
  const stageIds=[...source.matchAll(/^\{id:'(l76-[^']+)'/gm)].map(match=>match[1]);
  const activityIds=[...source.matchAll(/activity:\{id:'(l76-p\d+)'/g)].map(match=>match[1]);
  expect(stageIds).toHaveLength(36);expect(new Set(stageIds).size).toBe(36);
  expect(activityIds).toHaveLength(21);expect(new Set(activityIds).size).toBe(21);
  for(const marker of ['Устно № 3, с. 141','№ 580','№ 581','№ 583','№ 590','№ 592','№ 582','№ 591','500 м × 400 м','260 кг','4 м 50 см','180 г'])expect(source).toContain(marker);
  expect(source).toContain('№ 590 · source checkpoint');
  expect(source).toContain('№ 592 · source checkpoint');
  expect(source).toContain('№ 591 · source checkpoint');
  expect(source).toContain('Полное условие № 590 не реконструируем');
  expect(source).toContain('Полную формулировку и рисунок № 592 не реконструируем');
  expect(source).toContain('не подменяет их похожей задачей');
  expect(extendedPracticeLesson76.tasks).toHaveLength(20);
  expect(extendedPracticeSetResponseCount(extendedPracticeLesson76)).toBe(50);
  expect(new Set(extendedPracticeLesson76.tasks.map(task=>task.id)).size).toBe(20);
});
