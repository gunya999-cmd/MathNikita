import {expect,test} from '@playwright/test';
import {readFileSync} from 'node:fs';
import {extendedPracticeLesson86} from '../src/data/extendedPracticeLesson86';
import {extendedPracticeSetResponseCount} from '../src/data/extendedPracticeTypes';

test('lesson 86 follows the verified Merzlyak §24 reinforcement route and mature contract',()=>{
  const source=readFileSync(new URL('../src/CombinatoricsReinforcementPlayer.tsx',import.meta.url),'utf8');
  const stageIds=[...source.matchAll(/^\{id:'(l86-[^']+)'/gm)].map(match=>match[1]);
  const activityIds=[...source.matchAll(/activity:\{id:'(l86-p\d+)'/g)].map(match=>match[1]);
  expect(stageIds).toHaveLength(36);expect(new Set(stageIds).size).toBe(36);
  expect(activityIds).toHaveLength(21);expect(new Set(activityIds).size).toBe(21);
  for(const marker of ['§ 24','№2 с.163','5·6·8=240','№3 с.163','128 м³','№651','2·2·2=8','№653','67, 68, 69, 78, 79, 89','№655','14, 23, 32, 41, 50','№656','Нечётные цифры: 1,3. Чётные: 2,4.','№658','16 кодов','№670','15 долей','13 долей','№671','1872 л','47 бидонов','№652','№654','№657'])expect(source.toLocaleLowerCase('ru-RU')).toContain(marker.toLocaleLowerCase('ru-RU'));
  expect(source).toContain('source-checkpoint');
  expect(source).toContain('не подменяет выдуманными условиями');
  expect(source).toContain('Следующий урок 87');
  expect(extendedPracticeLesson86.tasks).toHaveLength(20);
  expect(extendedPracticeSetResponseCount(extendedPracticeLesson86)).toBe(50);
  expect(new Set(extendedPracticeLesson86.tasks.map(task=>task.id)).size).toBe(20);
});