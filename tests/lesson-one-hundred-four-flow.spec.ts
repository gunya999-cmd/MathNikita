import {expect,test} from '@playwright/test';

async function openLesson104(page:import('@playwright/test').Page){
  await page.goto('/');const button=page.locator('button[aria-label^="Открыть урок 104:"]');await expect(button).toBeEnabled();await button.evaluate((node:HTMLButtonElement)=>node.click());
  await expect(page.getByText('Урок 104 из 175')).toBeVisible();await expect(page.getByText('Урок 104 · глава 4 · § 29 · 3 из 5')).toBeVisible();await page.locator('.lesson-opening-start').click();
}
async function jump(page:import('@playwright/test').Page,index:number){await page.evaluate(stageIndex=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:104,stageIndex}})),index)}
async function solve(stage:import('@playwright/test').Locator,values:string[]){const inputs=stage.locator('input');for(const [index,value] of values.entries())await inputs.nth(index).fill(value);await stage.locator('.check-button').click();await expect(stage.locator('.instant-feedback.good')).toBeVisible()}

test('lesson 104 opens, solves exact §29 sources and reaches summary',async({page})=>{
  await openLesson104(page);const stage=page.locator('.interactive-stage[data-stage-id]').first();await expect(stage).toContainText('Заём единицы');
  await jump(page,8);await expect(stage).toContainText('№ 778(6–8)');await solve(stage,['9 8/13','10 5/9','5 11/16']);
  await jump(page,9);await expect(stage).toContainText('№ 781(1)');await solve(stage,['1 23/30']);
  await jump(page,10);await expect(stage).toContainText('№ 787(1)');await solve(stage,['15','20']);
  await jump(page,28);await expect(stage).toContainText('Урок 104 завершён');
});
