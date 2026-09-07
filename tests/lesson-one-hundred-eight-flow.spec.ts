import {expect,test} from '@playwright/test';
async function jump(page:import('@playwright/test').Page,stageIndex:number){await page.evaluate(index=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:108,stageIndex:index}})),stageIndex)}

test('lesson 108 completes exact control work 6 variant 1 and fixes primary score',async({page})=>{
  await page.goto('/');
  await page.locator('button[aria-label^="Открыть урок 108:"]').evaluate((node:HTMLButtonElement)=>node.click());
  await expect(page.getByText('Урок 108 из 175')).toBeVisible();
  await expect(page.getByText('Контрольная работа № 6: обыкновенные дроби')).toBeVisible();
  await page.locator('.lesson-opening-start').click();
  const answers=[['<','<','>','>'],['9/14','3 9/14','9/17','1 2/3'],['16'],['81'],['3 1/2','4 3/8'],['нет'],['18,19,20,21'],['2,3,4,5,6']];
  for(let task=0;task<answers.length;task+=1){await jump(page,task+1);const inputs=page.locator('.interactive-stage[data-stage-id] input');await expect(inputs).toHaveCount(answers[task].length);for(let index=0;index<answers[task].length;index+=1)await inputs.nth(index).fill(answers[task][index]);}
  await jump(page,9);const submit=page.getByRole('button',{name:'Сдать работу'});await expect(submit).toBeEnabled();await submit.click();
  await expect(page.locator('[data-stage-id="l108-summary"]')).toBeVisible();
  await expect(page.getByText('Первичный результат: 15/15 · оценка 5')).toBeVisible();
  await expect(page.getByText('Все ответы верны.')).toBeVisible();
  await expect.poll(async()=>await page.evaluate(()=>Boolean(localStorage.getItem('mathnikita:lesson-complete:108')))).toBe(true);
});
