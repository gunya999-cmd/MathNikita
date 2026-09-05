import {expect,test} from '@playwright/test';

async function jump(page:import('@playwright/test').Page,stageIndex:number){await page.evaluate(index=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:96,stageIndex:index}})),stageIndex)}

test('lesson 96 opens and completes exact source task 719',async({page})=>{
  await page.goto('/');
  const open=page.locator('button[aria-label^="Открыть урок 96:"]');
  await expect(open).toHaveCount(1);
  await open.evaluate((node:HTMLButtonElement)=>node.click());
  await expect(page.locator('.lesson-mode-toolbar')).toContainText('Урок 96 из 175');
  await expect(page.locator('.opening-screen')).toContainText('Правильные и неправильные дроби');
  await page.locator('.lesson-opening-start').click();
  await expect(page.locator('.interactive-stage[data-stage-id="l96-whole"]')).toBeVisible();
  await jump(page,8);
  const task=page.locator('.interactive-stage[data-stage-id="l96-practice-01"]');
  await expect(task).toContainText('знаменателем 8');
  const inputs=task.locator('input');
  await expect(inputs).toHaveCount(7);
  for(const [index,value] of ['1/8','2/8','3/8','4/8','5/8','6/8','7/8'].entries())await inputs.nth(index).fill(value);
  await task.locator('.check-button').click();
  await expect(task.locator('.instant-feedback.good')).toBeVisible();
});

test('lesson 96 keeps 8/8 in the improper-fraction source set',async({page})=>{
  await page.goto('/');
  await page.locator('button[aria-label^="Открыть урок 96:"]').evaluate((node:HTMLButtonElement)=>node.click());
  await page.locator('.lesson-opening-start').click();
  await jump(page,9);
  const task=page.locator('.interactive-stage[data-stage-id="l96-practice-02"]');
  const inputs=task.locator('input');
  await expect(inputs).toHaveCount(8);
  for(const [index,value] of ['8/1','8/2','8/3','8/4','8/5','8/6','8/7','8/8'].entries())await inputs.nth(index).fill(value);
  await task.locator('.check-button').click();
  await expect(task.locator('.instant-feedback.good')).toBeVisible();
});

test('lesson 96 exposes all practice stages and summary while lesson 97 stays locked',async({page})=>{
  await page.goto('/');
  await expect(page.locator('button[aria-label^="Урок 97 в разработке"]')).toHaveCount(1);
  await page.locator('button[aria-label^="Открыть урок 96:"]').evaluate((node:HTMLButtonElement)=>node.click());
  await page.locator('.lesson-opening-start').click();
  for(let index=1;index<=20;index+=1){await jump(page,7+index);await expect(page.locator(`.interactive-stage[data-stage-id="l96-practice-${String(index).padStart(2,'0')}"]`)).toBeVisible()}
  await jump(page,28);
  const summary=page.locator('.interactive-stage[data-stage-id="l96-summary"]');
  await expect(summary).toBeVisible();
  await expect(summary).toContainText('20 задач');
  await expect(summary).toContainText('50 ответов');
});
