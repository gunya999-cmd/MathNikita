import {expect,test} from '@playwright/test';

test('lesson 93 opens and completes exact source task №692 without leaking answers',async({page})=>{
  await page.goto('/');
  const open=page.locator('button[aria-label^="Открыть урок 93:"]');
  await expect(open).toHaveCount(1);
  await open.evaluate((node:HTMLButtonElement)=>node.click());
  await expect(page.locator('.lesson-mode-toolbar')).toContainText('Урок 93 из 175');
  await expect(page.locator('.lesson-mode-toolbar')).toContainText('Нахождение целого');
  await expect(page.locator('.opening-screen')).toContainText('числитель');
  await page.locator('.lesson-opening-start').click();
  await expect(page.locator('.interactive-stage[data-stage-id="l93-mission"]')).toBeVisible();

  await page.evaluate(()=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:93,stageIndex:8}})));
  const sourceStage=page.locator('.interactive-stage[data-stage-id="l93-practice-01"]');
  await expect(sourceStage).toBeVisible();
  await expect(sourceStage).toContainText('равны 90');
  await expect(sourceStage.locator('.instant-feedback')).toHaveCount(0);
  const inputs=sourceStage.locator('input');
  await expect(inputs).toHaveCount(6);
  for(let index=0;index<6;index+=1)await expect(inputs.nth(index)).toHaveAttribute('placeholder','Введите ответ');

  for(const [index,value] of ['8.10','225','405','300','108','95'].entries())await inputs.nth(index).fill(value);
  await sourceStage.locator('.check-button').click();
  await expect(sourceStage.locator('.instant-feedback.bad')).toBeVisible();
  await expect(sourceStage.locator('.instant-feedback.good')).toHaveCount(0);

  await inputs.nth(0).fill('810');
  await sourceStage.locator('.check-button').click();
  await expect(sourceStage.locator('.instant-feedback.good')).toBeVisible();
  await expect(sourceStage.locator('.instant-feedback.good')).toContainText('810, 225, 405, 300, 108 и 95');
});

test('lesson 93 exposes all 20 mandatory practice stages and final summary',async({page})=>{
  await page.goto('/');
  await page.locator('button[aria-label^="Открыть урок 93:"]').evaluate((node:HTMLButtonElement)=>node.click());
  await page.locator('.lesson-opening-start').click();
  for(let index=1;index<=20;index+=1){
    const stageIndex=7+index;
    await page.evaluate(({stageIndex})=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:93,stageIndex}})),{stageIndex});
    await expect(page.locator(`.interactive-stage[data-stage-id="l93-practice-${String(index).padStart(2,'0')}"]`)).toBeVisible();
  }
  await page.evaluate(()=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:93,stageIndex:29}})));
  await expect(page.locator('.interactive-stage[data-stage-id="l93-summary"]')).toBeVisible();
  await expect(page.locator('.interactive-stage[data-stage-id="l93-summary"]')).toContainText('20 задач и ровно 50 проверяемых ответов');
});