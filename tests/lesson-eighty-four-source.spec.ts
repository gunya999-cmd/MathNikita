import {expect,test} from '@playwright/test';
import {readFileSync} from 'node:fs';
import {extendedPracticeLesson84} from '../src/data/extendedPracticeLesson84';
import {extendedPracticeSetResponseCount} from '../src/data/extendedPracticeTypes';

test('lesson 84 follows the verified Merzlyak §23 synthesis route and mature contract',()=>{
  const source=readFileSync(new URL('../src/VolumeSynthesisPlayer.tsx',import.meta.url),'utf8');
  const stageIds=[...source.matchAll(/^\{id:'(l84-[^']+)'/gm)].map(match=>match[1]);
  const activityIds=[...source.matchAll(/activity:\{id:'(l84-p\d+)'/g)].map(match=>match[1]);
  expect(stageIds).toHaveLength(36);expect(new Set(stageIds).size).toBe(36);
  expect(activityIds).toHaveLength(21);expect(new Set(activityIds).size).toBe(21);
  for(const marker of ['Устно №3','56 см','№635','16 раз','64 раза','№636','40 раз','2 раза','№638','1 000 000 000','10 см','№639','3+3+3−2=7','20 см³','№640','288','252','18','2 дня','№637','№643(5,6)'])expect(source.toLocaleLowerCase('ru-RU')).toContain(marker.toLocaleLowerCase('ru-RU'));
  expect(source).toContain('не подменяет их похожими задачами');
  expect(source).toContain('не придумываем замену');
  expect(source).toContain('§23 полностью завершён');
  expect(source).toContain('Урок 85');
  expect(extendedPracticeLesson84.tasks).toHaveLength(20);
  expect(extendedPracticeSetResponseCount(extendedPracticeLesson84)).toBe(50);
  expect(new Set(extendedPracticeLesson84.tasks.map(task=>task.id)).size).toBe(20);
});
