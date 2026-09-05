import {expect,test} from '@playwright/test';

async function jump(page:import('@playwright/test').Page,stageIndex:number){await page.evaluate(index=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:97,stageIndex:index}})),stageIndex)}

test('lesson 97 opens and completes exact source task 724 first half',async({page})=>{
  await page.goto('/');
  const open=page.locator('button[aria-label^="Открыть урок 97:"]');
  await expect(open).toHaveCount(1);
  await open.evaluate((node:HTMLButtonElement)=>node.click());
  await expect(page.locator('.lesson-mode-toolbar')).toContainText('Урок 97 из 175');
  await expect(page.locator('.opening-screen')).toContainText('Сравнение и упорядочивание дробей');
  await page.locator('.lesson-opening-start').click();
  await expect(page.locator('.interactive-stage[data-stage-id="l97-rule-choice"]')).toBeVisible();
  await jump(page,8);
  const task=page.locator('.interactive-stage[data-stage-id="l97-practice-01"]');
  const inputs=task.locator('input');
  await expect(inputs).toHaveCount(6);
  for(const [index,value] of ['>','<','<','>','<','<'].entries())await inputs.nth(index).fill(value);
  await task.locator('.check-button').click();
  await expect(task.locator('.instant-feedback.good')).toBeVisible();
});

test('lesson 97 completes exact ordering task 726',async({page})=>{
  await page.goto('/');
  await page.locator('button[aria-label^="Открыть урок 97:"]').evaluate((node:HTMLButtonElement)=>node.click());
  await page.locator('.lesson-opening-start').click();
  await jump(page,9);
  const task=page.locator('.interactive-stage[data-stage-id="l97-practice-02"]');
  const inputs=task.locator('input');
  await expect(inputs).toHaveCount(6);
  for(const [index,value] of ['1/20','3/20','6/20','7/20','9/20','17/20'].entries())await inputs.nth(index).fill(value);
  await task.locator('.check-button').click();
  await expect(task.locator('.instant-feedback.good')).toBeVisible();
});

test('lesson 97 exposes 20 practice stages and keeps lesson 98 locked',async({page})=>{
  await page.goto('/');
  await expect(page.locator('button[aria-label^="Урок 98 в разработке"]')).toHaveCount(1);
  await page.locator('button[aria-label^="Открыть урок 97:"]').evaluate((node:HTMLButtonElement)=>node.click());
  await page.locator('.lesson-opening-start').click();
  for(let index=1;index<=20;index+=1){await jump(page,7+index);await expect(page.locator(`.interactive-stage[data-stage-id="l97-practice-${String(index).padStart(2,'0')}"]`)).toBeVisible()}
  await jump(page,28);
  const summary=page.locator('.interactive-stage[data-stage-id="l97-summary"]');
  await expect(summary).toBeVisible();
  await expect(summary).toContainText('20 задач');
  await expect(summary).toContainText('50 ответов');
});
