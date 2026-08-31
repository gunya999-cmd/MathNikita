import {expect,test} from '@playwright/test';
import {lessonNinetyStages} from '../src/ControlWorkFivePlayer';

test('lesson 90 keeps the exact Control work №5 variant 1 workload',()=>{
  expect(lessonNinetyStages).toHaveLength(11);
  const tasks=lessonNinetyStages.filter(stage=>stage.kind==='task');
  expect(tasks).toHaveLength(8);
  expect(tasks.reduce((sum,stage)=>sum+(stage.fieldIds?.length??0),0)).toBe(10);
  expect(tasks[0].body).toContain('478 : 15');
  expect(tasks[1].body).toContain('14 см');expect(tasks[1].body).toContain('3 раза');
  expect(tasks[2].body).toContain('куба с ребром 3 см');
  expect(tasks[3].body).toContain('18 см');expect(tasks[3].body).toContain('на 11 см больше');
  expect(tasks[4].body).toContain('делитель равен 11');expect(tasks[4].body).toContain('неполное частное — 7');expect(tasks[4].body).toContain('остаток — 6');
  expect(tasks[5].body).toContain('6 га');expect(tasks[5].body).toContain('150 м');
  expect(tasks[6].body).toContain('цифры 5, 6 и 0');expect(tasks[6].body).toContain('не могут повторяться');
  expect(tasks[7].body).toContain('116 см');expect(tasks[7].body).toContain('12 см и 11 см');
});
