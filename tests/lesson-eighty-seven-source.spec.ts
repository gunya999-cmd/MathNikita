import {expect,test} from '@playwright/test';
import {readFileSync} from 'node:fs';
import {extendedPracticeLesson87} from '../src/data/extendedPracticeLesson87';
import {extendedPracticeSetResponseCount} from '../src/data/extendedPracticeTypes';

test('lesson 87 follows verified Merzlyak §24 synthesis route and mature contract',()=>{
  const source=readFileSync(new URL('../src/CombinatoricsSynthesisPlayer.tsx',import.meta.url),'utf8');
  const stageIds=[...source.matchAll(/^\{id:'(l87-[^']+)'/gm)].map(match=>match[1]);
  const activityIds=[...source.matchAll(/activity:\{id:'(l87-p\d+)'/g)].map(match=>match[1]);
  expect(stageIds).toHaveLength(36);expect(new Set(stageIds).size).toBe(36);
  expect(activityIds).toHaveLength(21);expect(new Set(activityIds).size).toBe(21);
  for(const marker of ['§24','№4(1) с.163','24','32','90','№659','a+b=12','6 прямоугольников','№661','6 отрезков','№663','3·2=6','№664','4·2=8','№666','авторский ответ: 6 маршрутов','№667','1+2·3·4=25','№672','source-checkpoint','№660','5 различных параллелепипедов','№662','3·3=9','№665','6 экипажей','№673','30 не делится на 4','Нет. Получаем противоречие'])expect(source.toLocaleLowerCase('ru-RU')).toContain(marker.toLocaleLowerCase('ru-RU'));
  expect(source).toContain('Рабочая тетрадь / дидактика');
  expect(source).toContain('не придумывает похожие условия');
  expect(source).toContain('урок 88');
  expect(extendedPracticeLesson87.tasks).toHaveLength(20);
  expect(extendedPracticeSetResponseCount(extendedPracticeLesson87)).toBe(50);
  expect(new Set(extendedPracticeLesson87.tasks.map(task=>task.id)).size).toBe(20);
});
