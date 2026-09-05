import {expect,test} from '@playwright/test';

async function openLesson100(page:import('@playwright/test').Page){
  await page.goto('/');const button=page.locator('button[aria-label^="Открыть урок 100:"]');await expect(button).toBeEnabled();await button.evaluate((node:HTMLButtonElement)=>node.click());
  await expect(page.getByText('Урок 100 из 175')).toBeVisible();await expect(page.getByText('Урок 100 · глава 4 · § 27 · 2 из 2')).toBeVisible();await page.locator('.lesson-opening-start').click();
}
async function jump(page:import('@playwright/test').Page,index:number){await page.evaluate(stageIndex=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:100,stageIndex}})),index)}

test('lesson 100 opens, solves exact §27 sources and reaches summary',async({page})=>{
  await openLesson100(page);const stage=page.locator('.interactive-stage[data-stage-id]').first();await expect(stage).toContainText('Сначала модель');
  await jump(page,8);await expect(stage).toContainText('№ 750');const t=stage.locator('input');await t.nth(0).fill('18/50');await t.nth(1).fill('41/50');await stage.locator('.check-button').click();await expect(stage.locator('.instant-feedback.good')).toBeVisible();
  await jump(page,9);await expect(stage).toContainText('№ 752');const eq=stage.locator('input');for(const [index,value] of ['42','5/42','12/17','11/43'].entries())await eq.nth(index).fill(value);await stage.locator('.check-button').click();await expect(stage.locator('.instant-feedback.good')).toBeVisible();
  await jump(page,10);await expect(stage).toContainText('№ 754');const road=stage.locator('input');await road.nth(0).fill('15/23');await road.nth(1).fill('60');await stage.locator('.check-button').click();await expect(stage.locator('.instant-feedback.good')).toBeVisible();
  await jump(page,11);await expect(stage).toContainText('№ 757');const balls=stage.locator('input');await balls.nth(0).fill('7');await balls.nth(1).fill('12');await stage.locator('.check-button').click();await expect(stage.locator('.instant-feedback.good')).toBeVisible();
  await jump(page,28);await expect(stage).toContainText('Урок 100 завершён');
});
