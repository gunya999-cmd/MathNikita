import {expect,test} from '@playwright/test';

test('lesson 92 opens and completes exact source task №684 without leaking answers',async({page})=>{
  await page.goto('/');
  const open=page.locator('button[aria-label^="Открыть урок 92:"]');
  await expect(open).toHaveCount(1);
  await open.evaluate((node:HTMLButtonElement)=>node.click());
  await expect(page.locator('.lesson-mode-toolbar')).toContainText('Урок 92 из 175');
  await expect(page.locator('.lesson-mode-toolbar')).toContainText('Нахождение дроби от числа');
  await expect(page.locator('.opening-screen')).toContainText('знаменатель');
  await page.locator('.lesson-opening-start').click();
  await expect(page.locator('.interactive-stage[data-stage-id="l92-mission"]')).toBeVisible();

  await page.evaluate(()=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:92,stageIndex:8}})));
  const sourceStage=page.locator('.interactive-stage[data-stage-id="l92-practice-01"]');
  await expect(sourceStage).toBeVisible();
  await expect(sourceStage).toContainText('числа 36');
  await expect(sourceStage.locator('.instant-feedback')).toHaveCount(0);
  const inputs=sourceStage.locator('input');
  await expect(inputs).toHaveCount(6);
  for(const [index,value] of ['12','27','30','16','15','22'].entries())await inputs.nth(index).fill(value);
  await sourceStage.locator('.check-button').click();
  await expect(sourceStage.locator('.instant-feedback.good')).toBeVisible();
  await expect(sourceStage.locator('.instant-feedback.good')).toContainText('12, 27, 30, 16, 15 и 22');
});

test('lesson 92 exposes all 20 mandatory practice stages and final summary',async({page})=>{
  await page.goto('/');
  await page.locator('button[aria-label^="Открыть урок 92:"]').evaluate((node:HTMLButtonElement)=>node.click());
  await page.locator('.lesson-opening-start').click();
  for(let index=1;index<=20;index+=1){
    const stageIndex=7+index;
    await page.evaluate(({stageIndex})=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:92,stageIndex}})),{stageIndex});
    await expect(page.locator(`.interactive-stage[data-stage-id="l92-practice-${String(index).padStart(2,'0')}"]`)).toBeVisible();
  }
  await page.evaluate(()=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:92,stageIndex:29}})));
  await expect(page.locator('.interactive-stage[data-stage-id="l92-summary"]')).toBeVisible();
  await expect(page.locator('.interactive-stage[data-stage-id="l92-summary"]')).toContainText('20 задач и ровно 50 проверяемых ответов');
});
