import {expect,test} from '@playwright/test';
async function openLesson103(page:import('@playwright/test').Page){await page.goto('/');const button=page.locator('button[aria-label^="Открыть урок 103:"]');await expect(button).toBeEnabled();await button.evaluate((node:HTMLButtonElement)=>node.click());await expect(page.getByText('Урок 103 из 175')).toBeVisible();await expect(page.getByText('Урок 103 · глава 4 · § 29 · 2 из 5')).toBeVisible();await page.locator('.lesson-opening-start').click()}
async function jump(page:import('@playwright/test').Page,index:number){await page.evaluate(stageIndex=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:103,stageIndex}})),index)}
async function solve(stage:import('@playwright/test').Locator,values:string[]){const inputs=stage.locator('input');for(const [index,value] of values.entries())await inputs.nth(index).fill(value);await stage.locator('.check-button').click();await expect(stage.locator('.instant-feedback.good')).toBeVisible()}

test('lesson 103 opens, solves exact §29 sources and reaches summary',async({page})=>{
  await openLesson103(page);const stage=page.locator('.interactive-stage[data-stage-id]').first();await expect(stage).toContainText('Считаем по частям');
  await jump(page,8);await expect(stage).toContainText('№ 776');await solve(stage,['5 14/93','13 36/41','7 4/38','19 4/10']);
  await jump(page,9);await expect(stage).toContainText('№ 778(1–5)');await solve(stage,['10','22 10/27','7/19','4 9/15','5/11']);
  await jump(page,10);await expect(stage).toContainText('№ 783');await solve(stage,['10/16','6/16']);
  await jump(page,28);await expect(stage).toContainText('Урок 103 завершён');
});
