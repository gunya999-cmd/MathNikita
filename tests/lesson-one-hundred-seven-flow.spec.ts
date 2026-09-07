import {expect,test} from '@playwright/test';

async function openLesson107(page:import('@playwright/test').Page){
  await page.goto('/');const button=page.locator('button[aria-label^="Открыть урок 107:"]');await expect(button).toBeEnabled();await button.evaluate((node:HTMLButtonElement)=>node.click());
  await expect(page.getByText('Урок 107 из 175')).toBeVisible();await expect(page.getByText('Урок 107 · глава 4 · повторение перед контрольной № 6')).toBeVisible();await page.locator('.lesson-opening-start').click();
}
async function jump(page:import('@playwright/test').Page,index:number){await page.evaluate(stageIndex=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:107,stageIndex}})),index)}
async function solve(stage:import('@playwright/test').Locator,values:string[]){const inputs=stage.locator('input');for(const [index,value] of values.entries())await inputs.nth(index).fill(value);await stage.locator('.check-button').click();await expect(stage.locator('.instant-feedback.good')).toBeVisible()}

test('lesson 107 opens, samples every chapter 4 paragraph and reaches summary',async({page})=>{
  await openLesson107(page);const stage=page.locator('.interactive-stage[data-stage-id]').first();await expect(stage).toContainText('карту всей главы');
  await jump(page,8);await expect(stage).toContainText('Диагностика · § 25');await solve(stage,['7','12','правильная']);
  await jump(page,11);await expect(stage).toContainText('Диагностика · § 26');await solve(stage,['<','>','>']);
  await jump(page,13);await expect(stage).toContainText('Диагностика · § 27');await solve(stage,['12/15','5/17','12']);
  await jump(page,15);await expect(stage).toContainText('Диагностика · § 28');await solve(stage,['17/5','3 2/5','2']);
  await jump(page,17);await expect(stage).toContainText('Диагностика · § 29');await solve(stage,['4 5/6','6 1/4','38/5']);
  await jump(page,28);await expect(stage).toContainText('Урок 107 завершён');
});
