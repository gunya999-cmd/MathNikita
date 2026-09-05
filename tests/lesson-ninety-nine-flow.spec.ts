import {expect,test} from '@playwright/test';

async function openLesson99(page:import('@playwright/test').Page){
  await page.goto('/');const button=page.locator('button[aria-label^="Открыть урок 99:"]');await expect(button).toBeEnabled();await button.evaluate((node:HTMLButtonElement)=>node.click());
  await expect(page.getByText('Урок 99 из 175')).toBeVisible();await expect(page.getByText('Урок 99 · глава 4 · § 27 · 1 из 2')).toBeVisible();await page.locator('.lesson-opening-start').click();
}
async function jump(page:import('@playwright/test').Page,index:number){await page.evaluate(stageIndex=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:99,stageIndex}})),index)}

test('lesson 99 opens, reaches exact sources and validates fraction answers',async({page})=>{
  await openLesson99(page);const stage=page.locator('.interactive-stage[data-stage-id]').first();await expect(stage).toContainText('Одинаковый знаменатель');
  await jump(page,8);await expect(stage).toContainText('№ 744');const a=stage.locator('input');for(const [index,value] of ['11/19','3/13','1/25','11/39'].entries())await a.nth(index).fill(value);await stage.locator('.check-button').click();await expect(stage.locator('.instant-feedback.good')).toBeVisible();
  await jump(page,9);await expect(stage).toContainText('№ 746');const eq=stage.locator('input');await eq.nth(0).fill('2/10');await eq.nth(1).fill('14/32');await stage.locator('.check-button').click();await expect(stage.locator('.instant-feedback.good')).toBeVisible();
  await jump(page,10);await expect(stage).toContainText('№ 748');const cargo=stage.locator('input').first();await cargo.fill('13/19');await stage.locator('.check-button').click();await expect(stage.locator('.instant-feedback.bad')).toBeVisible();await cargo.fill('14/19');await stage.locator('.check-button').click();await expect(stage.locator('.instant-feedback.good')).toBeVisible();
  await jump(page,28);await expect(stage).toContainText('Урок 99 завершён');
});
