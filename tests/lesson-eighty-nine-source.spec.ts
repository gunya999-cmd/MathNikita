import {expect,test} from '@playwright/test';
import {readFileSync} from 'node:fs';
import {extendedPracticeLesson89} from '../src/data/extendedPracticeLesson89';
import {extendedPracticeSetResponseCount} from '../src/data/extendedPracticeTypes';

test('lesson 89 follows the official chapter-three repetition slot and control-work-5 skill map',()=>{
  const source=readFileSync(new URL('../src/ChapterThreeCorrectionPlayer.tsx',import.meta.url),'utf8');
  const stageIds=[...source.matchAll(/^\{id:'(l89-[^']+)'/gm)].map(match=>match[1]);
  const activityIds=[...source.matchAll(/activity:\{id:'(l89-p\d+)'/g)].map(match=>match[1]);
  expect(stageIds).toHaveLength(36);expect(new Set(stageIds).size).toBe(36);
  expect(activityIds).toHaveLength(21);expect(new Set(activityIds).size).toBe(21);
  for(const marker of ['уроки 88–89','контрольной №5','деление с остатком','563','17·33+2','S=ab','768','V=a³','6a²','125','150','V=abc','3200','a=bq+r','109','1 га=10 000 м²','80000','1200','0, 3 и 7','307, 370, 703, 730','4(a+b+c)','132','33','9','следующий урок 90'])expect(source.toLocaleLowerCase('ru-RU')).toContain(marker.toLocaleLowerCase('ru-RU'));
  expect(source).toContain('тренировочные числа');
  expect(source).toContain('отличаются от контрольной');
  expect(extendedPracticeLesson89.tasks).toHaveLength(20);
  expect(extendedPracticeSetResponseCount(extendedPracticeLesson89)).toBe(50);
  expect(new Set(extendedPracticeLesson89.tasks.map(task=>task.id)).size).toBe(20);
});
