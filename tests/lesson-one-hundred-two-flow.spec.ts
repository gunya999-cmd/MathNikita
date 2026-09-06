import {expect,test} from '@playwright/test';

async function openLesson102(page:import('@playwright/test').Page){
  await page.goto('/');const button=page.locator('button[aria-label^="Открыть урок 102:"]');await expect(button).toBeEnabled();await button.evaluate((node:HTMLButtonElement)=>node.click());
  await expect(page.getByText('Урок 102 из 175')).toBeVisible();await expect(page.getByText('Урок 102 · глава 4 · § 29 · 1 из 5')).toBeVisible();await page.locator('.lesson-opening-start').click();
}
async function jump(page:import('@playwright/test').Page,index:number){await page.evaluate(stageIndex=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:102,stageIndex}})),index)}

async function solve(stage:import('@playwright/test').Locator,values:string[]){const inputs=stage.locator('input');for(const [index,value] of values.entries())await inputs.nth(index).fill(value);await stage.locator('.check-button').click();await expect(stage.locator('.instant-feedback.good')).toBeVisible()}

test('lesson 102 opens, solves exact §29 sources and reaches summary',async({page})=>{
  await openLesson102(page);const stage=page.locator('.interactive-stage[data-stage-id]').first();await expect(stage).toContainText('Смешанное число');
  await jump(page,8);await expect(stage).toContainText('№ 770');await solve(stage,['2 3/5','1 7/11','3 1/12','2 22/23','6 7/12','4 11/18']);
  await jump(page,9);await expect(stage).toContainText('№ 772');await solve(stage,['3 1/2','2 1/4','3 1/8','5 10/20','32 7/10','10 2/81']);
  await jump(page,10);await expect(stage).toContainText('№ 774');await solve(stage,['19/4','105/11','60/17','77/6','1349/100','131/16']);
  await jump(page,28);await expect(stage).toContainText('Урок 102 завершён');
});
