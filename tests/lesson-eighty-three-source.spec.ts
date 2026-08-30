import {expect,test} from '@playwright/test';
import {readFileSync} from 'node:fs';
import {extendedPracticeLesson83} from '../src/data/extendedPracticeLesson83';
import {extendedPracticeSetResponseCount} from '../src/data/extendedPracticeTypes';

test('lesson 83 follows the verified Merzlyak §23 reinforcement route and mature contract',()=>{
  const source=readFileSync(new URL('../src/VolumeReinforcementPlayer.tsx',import.meta.url),'utf8');
  const stageIds=[...source.matchAll(/^\{id:'(l83-[^']+)'/gm)].map(match=>match[1]);
  const activityIds=[...source.matchAll(/activity:\{id:'(l83-p\d+)'/g)].map(match=>match[1]);
  expect(stageIds).toHaveLength(36);expect(new Set(stageIds).size).toBe(36);
  expect(activityIds).toHaveLength(21);expect(new Set(activityIds).size).toBe(21);
  for(const marker of ['Устно №4','20+30−10+80−70=50','№626','560','112','5 см','№630','13 500','№633','72','300','№634','216','№644','№627','12 см','№631','7456','№643(3,4)'])expect(source.toLocaleLowerCase('ru-RU')).toContain(marker.toLocaleLowerCase('ru-RU'));
  expect(source).toContain('не придумывает форму фигуры');
  expect(source).toContain('не реконструируем');
  expect(extendedPracticeLesson83.tasks).toHaveLength(20);
  expect(extendedPracticeSetResponseCount(extendedPracticeLesson83)).toBe(50);
  expect(new Set(extendedPracticeLesson83.tasks.map(task=>task.id)).size).toBe(20);
});
