import {expect,test} from '@playwright/test';
import {readFileSync} from 'node:fs';
import {extendedPracticeLesson88} from '../src/data/extendedPracticeLesson88';
import {extendedPracticeSetResponseCount} from '../src/data/extendedPracticeTypes';

test('lesson 88 follows exact chapter-three self-check and mature review contract',()=>{
  const source=readFileSync(new URL('../src/ChapterThreeReviewPlayer.tsx',import.meta.url),'utf8');
  const stageIds=[...source.matchAll(/^\{id:'(l88-[^']+)'/gm)].map(match=>match[1]);
  const activityIds=[...source.matchAll(/activity:\{id:'(l88-p\d+)'/g)].map(match=>match[1]);
  expect(stageIds).toHaveLength(36);expect(new Set(stageIds).size).toBe(36);
  expect(activityIds).toHaveLength(21);expect(new Set(activityIds).size).toBe(21);
  for(const marker of ['повторение главы 3','Проверьте себя» №3','Итоги главы 3','ВААГБГББВВБА','1 га','(x−28)·16=1632','156m','2(5+x)=10+2x','7x+x−5x=132','96','18 км','квартира №173','800 плиток','120000 см³','375 м','2·2·2=8'])expect(source.toLocaleLowerCase('ru-RU')).toContain(marker.toLocaleLowerCase('ru-RU'));
  expect(source).toContain('Отдельной технологической карты для уроков 88–89');
  expect(source).toContain('Урок 89');
  expect(extendedPracticeLesson88.tasks).toHaveLength(20);
  expect(extendedPracticeSetResponseCount(extendedPracticeLesson88)).toBe(50);
  expect(new Set(extendedPracticeLesson88.tasks.map(task=>task.id)).size).toBe(20);
});
