import {expect,test} from '@playwright/test';

async function openLesson98(page:import('@playwright/test').Page){
  await page.goto('/');
  const button=page.locator('button[aria-label^="Открыть урок 98:"]');
  await expect(button).toBeEnabled();
  await button.evaluate((node:HTMLButtonElement)=>node.click());
  await expect(page.getByText('Урок 98 из 175')).toBeVisible();
  await expect(page.getByText('Урок 98 · глава 4 · § 26 · 3 из 3')).toBeVisible();
  await page.locator('.lesson-opening-start').click();
}
async function jump(page:import('@playwright/test').Page,index:number){await page.evaluate(stageIndex=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:98,stageIndex}})),index)}

test('lesson 98 opens, reaches exact source tasks and validates mandatory practice',async({page})=>{
  await openLesson98(page);
  const stage=page.locator('.interactive-stage[data-stage-id]').first();
  await expect(stage).toContainText('Финал параграфа');
  await jump(page,8);await expect(stage).toContainText('№ 724 (7–12)');
  await jump(page,9);await expect(stage).toContainText('№ 737');
  const input=stage.locator('input').first();await input.fill('1,2,3,4,5,6,7,8');await stage.locator('.check-button').click();await expect(stage.locator('.instant-feedback.good')).toBeVisible();
  await jump(page,10);await expect(stage).toContainText('№ 739');
  const fields=stage.locator('input');await fields.nth(0).fill('8,9');await fields.nth(1).fill('10,11,12');await stage.locator('.check-button').click();await expect(stage.locator('.instant-feedback.good')).toBeVisible();
  await fields.nth(1).fill('10,11');await stage.locator('.check-button').click();await expect(stage.locator('.instant-feedback.bad')).toBeVisible();
  await jump(page,28);await expect(stage).toContainText('§ 26 завершён');
});
