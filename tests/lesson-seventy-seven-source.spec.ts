import {expect,test} from '@playwright/test';
import {readFileSync} from 'node:fs';
import {extendedPracticeLesson77} from '../src/data/extendedPracticeLesson77';
import {extendedPracticeSetResponseCount} from '../src/data/extendedPracticeTypes';

test('lesson 77 keeps the verified Merzlyak §21 synthesis route and mature contract',()=>{
  const source=readFileSync(new URL('../src/AreaSynthesisPlayer.tsx',import.meta.url),'utf8');
  const stageIds=[...source.matchAll(/^\{id:'(l77-[^']+)'/gm)].map(match=>match[1]);
  const activityIds=[...source.matchAll(/activity:\{id:'(l77-p\d+)'/g)].map(match=>match[1]);
  expect(stageIds).toHaveLength(36);expect(new Set(stageIds).size).toBe(36);
  expect(activityIds).toHaveLength(21);expect(new Set(activityIds).size).toBe(21);
  for(const marker of ['Устно № 4, с. 142','№ 584','№ 586','№ 587','№ 593','№ 594','№ 597','12 см','18 см','26 см','4 раза','S=ab','S=a²'])expect(source).toContain(marker);
  expect(source).toContain('№ 593 · source checkpoint');
  expect(source).toContain('№ 597 · source checkpoint');
  expect(source).toContain('авторское указание');
  expect(source).toContain('не реконструируем');
  expect(source).toContain('не подменяет номер заданием из другого издания');
  expect(extendedPracticeLesson77.tasks).toHaveLength(20);
  expect(extendedPracticeSetResponseCount(extendedPracticeLesson77)).toBe(50);
  expect(new Set(extendedPracticeLesson77.tasks.map(task=>task.id)).size).toBe(20);
});
