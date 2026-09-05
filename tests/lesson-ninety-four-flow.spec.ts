import {expect,test} from '@playwright/test';

async function jump(page:import('@playwright/test').Page,stageIndex:number){
  await page.evaluate(index=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:94,stageIndex:index}})),stageIndex);
}

test('lesson 94 opens and completes exact source tasks without leaking answers',async({page})=>{
  await page.goto('/');
  const open=page.locator('button[aria-label^="Открыть урок 94:"]');
  await expect(open).toHaveCount(1);
  await open.evaluate((node:HTMLButtonElement)=>node.click());
  await expect(page.locator('.lesson-mode-toolbar')).toContainText('Урок 94 из 175');
  await expect(page.locator('.lesson-mode-toolbar')).toContainText('Составные задачи на дроби и остаток');
  await expect(page.locator('.opening-screen')).toContainText('остаток');
  await page.locator('.lesson-opening-start').click();
  await expect(page.locator('.interactive-stage[data-stage-id="l94-mission"]')).toBeVisible();

  await jump(page,8);
  const task701=page.locator('.interactive-stage[data-stage-id="l94-practice-01"]');
  await expect(task701).toBeVisible();
  await expect(task701).toContainText('прямого угла');
  await expect(task701.locator('.instant-feedback')).toHaveCount(0);
  const angleInputs=task701.locator('input');
  await expect(angleInputs).toHaveCount(2);
  await expect(angleInputs.nth(0)).toHaveAttribute('placeholder','Введите ответ');
  await expect(angleInputs.nth(1)).toHaveAttribute('placeholder','Введите ответ');

  await angleInputs.nth(0).fill('3.5');
  await angleInputs.nth(1).fill('75');
  await task701.locator('.check-button').click();
  await expect(task701.locator('.instant-feedback.bad')).toBeVisible();
  await expect(task701.locator('.instant-feedback.good')).toHaveCount(0);

  await angleInputs.nth(0).fill('35');
  await task701.locator('.check-button').click();
  await expect(task701.locator('.instant-feedback.good')).toBeVisible();

  await jump(page,9);
  const task703=page.locator('.interactive-stage[data-stage-id="l94-practice-02"]');
  await expect(task703).toContainText('624');
  const dayInputs=task703.locator('input');
  await expect(dayInputs).toHaveCount(4);
  for(const [index,value] of ['96','120','260','148'].entries())await dayInputs.nth(index).fill(value);
  await task703.locator('.check-button').click();
  await expect(task703.locator('.instant-feedback.good')).toBeVisible();
});

test('lesson 94 exposes all 20 mandatory practice stages and final summary',async({page})=>{
  await page.goto('/');
  await page.locator('button[aria-label^="Открыть урок 94:"]').evaluate((node:HTMLButtonElement)=>node.click());
  await page.locator('.lesson-opening-start').click();
  for(let index=1;index<=20;index+=1){
    const stageIndex=7+index;
    await jump(page,stageIndex);
    await expect(page.locator(`.interactive-stage[data-stage-id="l94-practice-${String(index).padStart(2,'0')}"]`)).toBeVisible();
  }
  await jump(page,29);
  const summary=page.locator('.interactive-stage[data-stage-id="l94-summary"]');
  await expect(summary).toBeVisible();
  await expect(summary).toContainText('20 задач и ровно 50 проверяемых ответов');
});
