import {expect,test} from '@playwright/test';
import {readFileSync} from 'node:fs';
import {extendedPracticeLesson82} from '../src/data/extendedPracticeLesson82';
import {extendedPracticeSetResponseCount} from '../src/data/extendedPracticeTypes';

test('lesson 82 follows the verified Merzlyak §23 volume-formula route and mature contract',()=>{
  const source=readFileSync(new URL('../src/VolumeFormulaPlayer.tsx',import.meta.url),'utf8');
  const stageIds=[...source.matchAll(/^\{id:'(l82-[^']+)'/gm)].map(match=>match[1]);
  const activityIds=[...source.matchAll(/activity:\{id:'(l82-p\d+)'/g)].map(match=>match[1]);
  expect(stageIds).toHaveLength(36);expect(new Set(stageIds).size).toBe(36);
  expect(activityIds).toHaveLength(21);expect(new Set(activityIds).size).toBe(21);
  for(const marker of ['§ 23','V=abc','V=a³','V=Sh','№ 619','1080','№ 620','216','№ 624','1620','№ 628','36','№ 632','448','№ 642','№ 621','320','№ 625','1920','№ 629','5 м'])expect(source.toLocaleLowerCase('ru-RU')).toContain(marker.toLocaleLowerCase('ru-RU'));
  expect(source).toContain('не подменяет его придуманной цепочкой');
  expect(source).toContain('остаётся source-checkpoint');
  expect(extendedPracticeLesson82.tasks).toHaveLength(20);
  expect(extendedPracticeSetResponseCount(extendedPracticeLesson82)).toBe(50);
  expect(new Set(extendedPracticeLesson82.tasks.map(task=>task.id)).size).toBe(20);
});
