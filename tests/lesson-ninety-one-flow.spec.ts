import {expect,test} from '@playwright/test';

test('lesson 91 opens from catalog and completes exact source task without leaking answer',async({page})=>{
  await page.goto('/');
  const open=page.locator('button[aria-label^="Открыть урок 91:"]');
  await expect(open).toHaveCount(1);
  await open.evaluate((node:HTMLButtonElement)=>node.click());
  await expect(page.locator('.lesson-mode-toolbar')).toContainText('Урок 91 из 175');
  await expect(page.locator('.lesson-mode-toolbar')).toContainText('Обыкновенная дробь');
  await expect(page.locator('.opening-screen')).toContainText('часть целого');
  await page.locator('.lesson-opening-start').click();
  await expect(page.locator('.interactive-stage[data-stage-id="l91-mission"]')).toBeVisible();

  await page.evaluate(()=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:91,stageIndex:9}})));
  const sourceStage=page.locator('.interactive-stage[data-stage-id="l91-practice-01"]');
  await expect(sourceStage).toBeVisible();
  await expect(sourceStage).toContainText('32 ученика');
  await expect(sourceStage).toContainText('Семеро получили оценку «5»');
  await expect(sourceStage.locator('.instant-feedback')).toHaveCount(0);

  const inputs=sourceStage.locator('input');
  await expect(inputs).toHaveCount(3);
  await inputs.nth(0).fill('7');
  await inputs.nth(1).fill('32');
  await inputs.nth(2).fill('7/32');
  await sourceStage.locator('.check-button').click();
  await expect(sourceStage.locator('.instant-feedback.good')).toBeVisible();
  await expect(sourceStage.locator('.instant-feedback.good')).toContainText('семь тридцать вторых');
});

test('lesson 91 keeps 20 mandatory practice stages and final summary reachable',async({page})=>{
  await page.goto('/');
  const open=page.locator('button[aria-label^="Открыть урок 91:"]');
  await open.evaluate((node:HTMLButtonElement)=>node.click());
  await page.locator('.lesson-opening-start').click();
  for(let index=1;index<=20;index+=1){
    const stageIndex=8+index;
    await page.evaluate(({stageIndex})=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:91,stageIndex}})),{stageIndex});
    await expect(page.locator(`.interactive-stage[data-stage-id="l91-practice-${String(index).padStart(2,'0')}"]`)).toBeVisible();
  }
  await page.evaluate(()=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:91,stageIndex:30}})));
  await expect(page.locator('.interactive-stage[data-stage-id="l91-summary"]')).toBeVisible();
  await expect(page.locator('.interactive-stage[data-stage-id="l91-summary"]')).toContainText('20 задач и ровно 50 проверяемых ответов');
});
