import {expect,test} from '@playwright/test';
import {readFileSync} from 'node:fs';
import {extendedPracticeLesson74} from '../src/data/extendedPracticeLesson74';
import {extendedPracticeSetResponseCount} from '../src/data/extendedPracticeTypes';

test('lesson 74 keeps the verified Merzlyak §21 route and mature lesson contract',()=>{
  const source=readFileSync(new URL('../src/AreaFoundationsPlayer.tsx',import.meta.url),'utf8');
  const stageIds=[...source.matchAll(/^\{id:'(l74-[^']+)'/gm)].map(match=>match[1]);
  const activityIds=[...source.matchAll(/activity:\{id:'(l74-p\d+)'/g)].map(match=>match[1]);
  expect(stageIds).toHaveLength(36);expect(new Set(stageIds).size).toBe(36);
  expect(activityIds).toHaveLength(21);expect(new Set(activityIds).size).toBe(21);
  for(const marker of ['§ 21','№ 564','№ 565','№ 566','№ 567','№ 569','№ 571','№ 572','S=ab','S=a²','единичн','равновелик'])expect(source).toContain(marker);
  expect(source).toContain('№ 595 · source checkpoint');
  expect(source).toContain('№ 596(1) · source checkpoint');
  expect(source).toContain('не подменяет её придуманным заданием');
  expect(source).toContain('не заменяем похожей задачей из другого пособия');
  expect(extendedPracticeLesson74.tasks).toHaveLength(20);
  expect(extendedPracticeSetResponseCount(extendedPracticeLesson74)).toBe(50);
  expect(new Set(extendedPracticeLesson74.tasks.map(task=>task.id)).size).toBe(20);
});
