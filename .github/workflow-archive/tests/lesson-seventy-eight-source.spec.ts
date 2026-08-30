import {expect,test} from '@playwright/test';
import {readFileSync} from 'node:fs';
import {extendedPracticeLesson78} from '../src/data/extendedPracticeLesson78';
import {extendedPracticeSetResponseCount} from '../src/data/extendedPracticeTypes';

test('lesson 78 follows the verified Merzlyak §22 first-lesson route and mature contract',()=>{
  const source=readFileSync(new URL('../src/RectangularParallelepipedPlayer.tsx',import.meta.url),'utf8');
  const stageIds=[...source.matchAll(/^\{id:'(l78-[^']+)'/gm)].map(match=>match[1]);
  const activityIds=[...source.matchAll(/activity:\{id:'(l78-p\d+)'/g)].map(match=>match[1]);
  expect(stageIds).toHaveLength(36);expect(new Set(stageIds).size).toBe(36);
  expect(activityIds).toHaveLength(21);expect(new Set(activityIds).size).toBe(21);
  for(const marker of ['Устно № 1','Устно № 2','§ 22','№ 598','№ 599','№ 602','№ 612','№ 600, 601, 603','6 граней','12 рёбер','8 вершин','длиной, шириной и высотой','2(ab+bc+ac)','Диктант 19'])expect(source).toContain(marker);
  expect(source).toContain('№ 598 · работа с рисунком 169');
  expect(source).toContain('не перерисовывает его приблизительно');
  expect(source).toContain('№ 612 · source checkpoint');
  expect(source).toContain('не восстановлено надёжно');
  expect(extendedPracticeLesson78.tasks).toHaveLength(20);
  expect(extendedPracticeSetResponseCount(extendedPracticeLesson78)).toBe(50);
  expect(new Set(extendedPracticeLesson78.tasks.map(task=>task.id)).size).toBe(20);
});
