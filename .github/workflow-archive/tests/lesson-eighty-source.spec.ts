import {expect,test} from '@playwright/test';
import {readFileSync} from 'node:fs';
import {extendedPracticeLesson80} from '../src/data/extendedPracticeLesson80';
import {extendedPracticeSetResponseCount} from '../src/data/extendedPracticeTypes';

test('lesson 80 follows the verified Merzlyak §22 pyramid route and mature contract',()=>{
  const source=readFileSync(new URL('../src/PyramidPlayer.tsx',import.meta.url),'utf8');
  const stageIds=[...source.matchAll(/^\{id:'(l80-[^']+)'/gm)].map(match=>match[1]);
  const activityIds=[...source.matchAll(/activity:\{id:'(l80-p\d+)'/g)].map(match=>match[1]);
  expect(stageIds).toHaveLength(36);expect(new Set(stageIds).size).toBe(36);
  expect(activityIds).toHaveLength(21);expect(new Set(activityIds).size).toBe(21);
  for(const marker of ['Устно № 5','Устно № 6','§ 22','№ 604','№ 614','вопрос 14','вопрос 15','вопрос 16','вопрос 17','вопрос 18','основание','боковые грани','боковые рёбра','развёртка','правильным тетраэдром','многогранник','ABC','MABC','42'])expect(source.toLocaleLowerCase('ru-RU')).toContain(marker.toLocaleLowerCase('ru-RU'));
  expect(source).toContain('буквенные обозначения исходного рисунка 172 учебника');
  expect(extendedPracticeLesson80.tasks).toHaveLength(20);
  expect(extendedPracticeSetResponseCount(extendedPracticeLesson80)).toBe(50);
  expect(new Set(extendedPracticeLesson80.tasks.map(task=>task.id)).size).toBe(20);
});
