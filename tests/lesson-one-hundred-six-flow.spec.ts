import {expect,test} from '@playwright/test';

async function openLesson106(page:import('@playwright/test').Page){
  await page.goto('/');const button=page.locator('button[aria-label^="Открыть урок 106:"]');await expect(button).toBeEnabled();await button.evaluate((node:HTMLButtonElement)=>node.click());
  await expect(page.getByText('Урок 106 из 175')).toBeVisible();await expect(page.getByText('Урок 106 · глава 4 · § 29 · 5 из 5')).toBeVisible();await page.locator('.lesson-opening-start').click();
}
async function jump(page:import('@playwright/test').Page,index:number){await page.evaluate(stageIndex=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:106,stageIndex}})),index)}
async function solve(stage:import('@playwright/test').Locator,values:string[]){const inputs=stage.locator('input');for(const [index,value] of values.entries())await inputs.nth(index).fill(value);await stage.locator('.check-button').click();await expect(stage.locator('.instant-feedback.good')).toBeVisible()}

test('lesson 106 opens, solves exact §29 synthesis sources and reaches summary',async({page})=>{
  await openLesson106(page);const stage=page.locator('.interactive-stage[data-stage-id]').first();await expect(stage).toContainText('Собери весь параграф');
  await jump(page,8);await expect(stage).toContainText('№ 784');await solve(stage,['15/13','1 2/13','ошибся']);
  await jump(page,9);await expect(stage).toContainText('№ 788');await solve(stage,['8,9,10','9,10,11']);
  await jump(page,10);await expect(stage).toContainText('№ 790');await solve(stage,['11,12,13,14,15,16,17,18,19,20','1']);
  await jump(page,28);await expect(stage).toContainText('Урок 106 завершён');
});
