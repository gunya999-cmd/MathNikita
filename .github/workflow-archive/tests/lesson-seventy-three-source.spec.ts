import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {expect,test} from '@playwright/test';

test('lesson 73 preserves control work 4 variant 1 exactly',()=>{
  const source=readFileSync(resolve(process.cwd(),'src/ControlWorkFourPlayer.tsx'),'utf8');
  const evaluatedFields=source.match(/\{id:'l73-[^']+',number:'/g)??[];
  const stages=source.match(/\{id:'l73-(?:rules|task\d|submit|summary)'/g)??[];
  expect(evaluatedFields).toHaveLength(13);
  expect(new Set(evaluatedFields).size).toBe(13);
  expect(stages).toHaveLength(10);
  expect(new Set(stages).size).toBe(10);
  expect(source).toContain('Контрольная работа № 4');
  expect(source).toContain('вариант 1');
  expect(source).toContain('Умножение и деление натуральных чисел. Свойства умножения');
  for(const fragment of [
    '36 · 2418','175 · 204','1456 : 28','177 000 : 120',
    '(326 · 48 − 9 587) : 29','x · 14 = 364','324 : x = 9','19x − 12x = 126',
    '25 · 79 · 4','43 · 89 + 89 · 57','7 кг конфет и 9 кг печенья','1 200 р.',
    '56 км/ч','64 км/ч','через 6 ч','от 19 до 35 включительно'
  ])expect(source).toContain(fragment);
  for(const answer of ["answer:'87048'","answer:'35700'","answer:'52'","answer:'1475'","answer:'209'","answer:'26'","answer:'36'","answer:'18'","answer:'7900'","answer:'8900'","answer:'40'","answer:'48'","answer:'5'"])expect(source).toContain(answer);
  expect(source).toContain('data-control-field-count={fields.length}');
  expect(source).toContain("const KEY='mathnikita-lesson-73-control-v1'");
  expect(source).toContain('submittedResponses');
  expect(source).not.toContain('ExtendedPractice');
});
