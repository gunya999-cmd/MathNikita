import {expect,test} from '@playwright/test';
import {readFileSync} from 'node:fs';
import {extendedPracticeLesson85} from '../src/data/extendedPracticeLesson85';
import {extendedPracticeSetResponseCount} from '../src/data/extendedPracticeTypes';

test('lesson 85 follows the verified Merzlyak §24 first-lesson route and mature contract',()=>{
  const source=readFileSync(new URL('../src/CombinatoricsIntroPlayer.tsx',import.meta.url),'utf8');
  const stageIds=[...source.matchAll(/^\{id:'(l85-[^']+)'/gm)].map(match=>match[1]);
  const activityIds=[...source.matchAll(/activity:\{id:'(l85-p\d+)'/g)].map(match=>match[1]);
  expect(stageIds).toHaveLength(36);expect(new Set(stageIds).size).toBe(36);
  expect(activityIds).toHaveLength(21);expect(new Set(activityIds).size).toBe(21);
  for(const marker of ['§24','дерево возможных вариантов','№645','11, 12, 13, 21, 22, 23, 31, 32, 33','№647','15, 24, 33, 42, 51, 60','№649','9 двузначных','№650','102, 120, 201, 210','№669(1,2)','№646','40, 44, 47, 49, 70, 74, 77, 79, 90, 94, 97, 99','№648','17, 26, 35, 44, 53, 62, 71, 80','№668','20 способов'])expect(source.toLocaleLowerCase('ru-RU')).toContain(marker.toLocaleLowerCase('ru-RU'));
  expect(source).toContain('Вопросы 1–2 · source checkpoint');
  expect(source).toContain('не выдаём реконструкцию за текст учебника');
  expect(source).toContain('Следующий урок 86');
  expect(extendedPracticeLesson85.tasks).toHaveLength(20);
  expect(extendedPracticeSetResponseCount(extendedPracticeLesson85)).toBe(50);
  expect(new Set(extendedPracticeLesson85.tasks.map(task=>task.id)).size).toBe(20);
});