import {expect,test} from '@playwright/test';

async function jump(page:import('@playwright/test').Page,stageIndex:number){
  await page.evaluate(index=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:95,stageIndex:index}})),stageIndex);
}

test('lesson 95 opens and solves the first dependent-remainder source task',async({page})=>{
  await page.goto('/');
  const open=page.locator('button[aria-label^="Открыть урок 95:"]');
  await expect(open).toHaveCount(1);
  await open.evaluate((node:HTMLButtonElement)=>node.click());
  await expect(page.locator('.lesson-mode-toolbar')).toContainText('Урок 95 из 175');
  await expect(page.locator('.lesson-mode-toolbar')).toContainText('Итог § 25');
  await expect(page.locator('.opening-screen')).toContainText('разные дроби относятся');
  await page.locator('.lesson-opening-start').click();
  await expect(page.locator('.interactive-stage[data-stage-id="l95-mission"]')).toBeVisible();

  await jump(page,8);
  const task704=page.locator('.interactive-stage[data-stage-id="l95-practice-01"]');
  await expect(task704).toBeVisible();
  await expect(task704).toContainText('9 кг 450 г');
  const inputs=task704.locator('input');
  await expect(inputs).toHaveCount(3);
  for(const [index,value] of ['3600','5850','4050'].entries())await inputs.nth(index).fill(value);
  await task704.locator('.check-button').click();
  await expect(task704.locator('.instant-feedback.good')).toBeVisible();
});

test('lesson 95 rejects using the original whole for the second fraction',async({page})=>{
  await page.goto('/');
  await page.locator('button[aria-label^="Открыть урок 95:"]').evaluate((node:HTMLButtonElement)=>node.click());
  await page.locator('.lesson-opening-start').click();
  await jump(page,8);
  const task704=page.locator('.interactive-stage[data-stage-id="l95-practice-01"]');
  const inputs=task704.locator('input');
  await inputs.nth(0).fill('3600');
  await inputs.nth(1).fill('5850');
  await inputs.nth(2).fill('6542.307');
  await task704.locator('.check-button').click();
  await expect(task704.locator('.instant-feedback.bad')).toBeVisible();
  await expect(task704.locator('.instant-feedback.good')).toHaveCount(0);
});

test('lesson 95 exposes all 20 practice stages and final §25 summary',async({page})=>{
  await page.goto('/');
  await page.locator('button[aria-label^="Открыть урок 95:"]').evaluate((node:HTMLButtonElement)=>node.click());
  await page.locator('.lesson-opening-start').click();
  for(let index=1;index<=20;index+=1){
    await jump(page,7+index);
    await expect(page.locator(`.interactive-stage[data-stage-id="l95-practice-${String(index).padStart(2,'0')}"]`)).toBeVisible();
  }
  await jump(page,28);
  const summary=page.locator('.interactive-stage[data-stage-id="l95-summary"]');
  await expect(summary).toBeVisible();
  await expect(summary).toContainText('20 задач и ровно 50 проверяемых ответов');
  await expect(summary).toContainText('параграф 26');
});
