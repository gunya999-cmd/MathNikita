import {expect,test} from '@playwright/test';

async function openLesson105(page:import('@playwright/test').Page){
  await page.goto('/');const button=page.locator('button[aria-label^="Открыть урок 105:"]');await expect(button).toBeEnabled();await button.evaluate((node:HTMLButtonElement)=>node.click());
  await expect(page.getByText('Урок 105 из 175')).toBeVisible();await expect(page.getByText('Урок 105 · глава 4 · § 29 · 4 из 5')).toBeVisible();await page.locator('.lesson-opening-start').click();
}
async function jump(page:import('@playwright/test').Page,index:number){await page.evaluate(stageIndex=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:105,stageIndex}})),index)}
async function solve(stage:import('@playwright/test').Locator,values:string[]){const inputs=stage.locator('input');for(const [index,value] of values.entries())await inputs.nth(index).fill(value);await stage.locator('.check-button').click();await expect(stage.locator('.instant-feedback.good')).toBeVisible()}

test('lesson 105 opens, solves exact §29 sources and reaches summary',async({page})=>{
  await openLesson105(page);const stage=page.locator('.interactive-stage[data-stage-id]').first();await expect(stage).toContainText('Сложное выражение');
  await jump(page,8);await expect(stage).toContainText('№ 778(9–10)');await solve(stage,['21','2 11/14']);
  await jump(page,9);await expect(stage).toContainText('№ 781(2)');await solve(stage,['4']);
  await jump(page,10);await expect(stage).toContainText('№ 789');await solve(stage,['57,58,59','4,5,6,7']);
  await jump(page,28);await expect(stage).toContainText('Урок 105 завершён');
});
