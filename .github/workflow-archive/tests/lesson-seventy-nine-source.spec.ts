import {expect,test} from '@playwright/test';
import {readFileSync} from 'node:fs';
import {extendedPracticeLesson79} from '../src/data/extendedPracticeLesson79';
import {extendedPracticeSetResponseCount} from '../src/data/extendedPracticeTypes';

test('lesson 79 follows the verified Merzlyak §22 second-lesson route and mature contract',()=>{
  const source=readFileSync(new URL('../src/ParallelepipedNetsPlayer.tsx',import.meta.url),'utf8');
  const stageIds=[...source.matchAll(/^\{id:'(l79-[^']+)'/gm)].map(match=>match[1]);
  const activityIds=[...source.matchAll(/activity:\{id:'(l79-p\d+)'/g)].map(match=>match[1]);
  expect(stageIds).toHaveLength(36);expect(new Set(stageIds).size).toBe(36);
  expect(activityIds).toHaveLength(21);expect(new Set(activityIds).size).toBe(21);
  for(const marker of ['Устно № 3','Устно № 4','§ 22','№ 608','№ 610','№ 606','№ 613','№ 607, 609','№ 616','развёртк','многогранник','Sпов=2(ab+bc+ac)','4800','864','242'])expect(source.toLocaleLowerCase('ru-RU')).toContain(marker.toLocaleLowerCase('ru-RU'));
  expect(source).toContain('не подменяет рисунок 174 приблизительной копией');
  expect(source).toContain('без подмены авторского решения');
  expect(extendedPracticeLesson79.tasks).toHaveLength(20);
  expect(extendedPracticeSetResponseCount(extendedPracticeLesson79)).toBe(50);
  expect(new Set(extendedPracticeLesson79.tasks.map(task=>task.id)).size).toBe(20);
});
