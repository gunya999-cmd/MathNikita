import {expect,test} from '@playwright/test';
import {readFileSync} from 'node:fs';
import {extendedPracticeLesson81} from '../src/data/extendedPracticeLesson81';
import {extendedPracticeSetResponseCount} from '../src/data/extendedPracticeTypes';

test('lesson 81 follows the verified Merzlyak §23 volume route and mature contract',()=>{
  const source=readFileSync(new URL('../src/VolumeFigurePlayer.tsx',import.meta.url),'utf8');
  const stageIds=[...source.matchAll(/^\{id:'(l81-[^']+)'/gm)].map(match=>match[1]);
  const activityIds=[...source.matchAll(/activity:\{id:'(l81-p\d+)'/g)].map(match=>match[1]);
  expect(stageIds).toHaveLength(36);expect(new Set(stageIds).size).toBe(36);
  expect(activityIds).toHaveLength(21);expect(new Set(activityIds).size).toBe(21);
  for(const marker of ['Устно № 2','§ 23','№ 617','№ 618','№ 622','№ 643','единичный куб','1 л = 1 дм³','5','18','9'])expect(source.toLocaleLowerCase('ru-RU')).toContain(marker.toLocaleLowerCase('ru-RU'));
  expect(source).toContain('приложение не придумывает форму фигур');
  expect(source).toContain('Номер сохранён в маршруте без выдуманного текста');
  expect(source).toContain('Формула V=abc');
  expect(source).toContain('не используется как новое правило внутри урока 81');
  expect(extendedPracticeLesson81.tasks).toHaveLength(20);
  expect(extendedPracticeSetResponseCount(extendedPracticeLesson81)).toBe(50);
  expect(new Set(extendedPracticeLesson81.tasks.map(task=>task.id)).size).toBe(20);
});
