import {expect,test} from '@playwright/test';

async function openLesson101(page:import('@playwright/test').Page){
  await page.goto('/');const button=page.locator('button[aria-label^="Открыть урок 101:"]');await expect(button).toBeEnabled();await button.evaluate((node:HTMLButtonElement)=>node.click());
  await expect(page.getByText('Урок 101 из 175')).toBeVisible();await expect(page.getByText('Урок 101 · глава 4 · § 28 · 1 из 1')).toBeVisible();await page.locator('.lesson-opening-start').click();
}
async function jump(page:import('@playwright/test').Page,index:number){await page.evaluate(stageIndex=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:101,stageIndex}})),index)}

test('lesson 101 opens, solves exact §28 sources and reaches summary',async({page})=>{
  await openLesson101(page);const stage=page.locator('.interactive-stage[data-stage-id]').first();await expect(stage).toContainText('Дробная черта');
  await jump(page,8);await expect(stage).toContainText('№ 759');const q=stage.locator('input');for(const [index,value] of ['5/7','19/4','1/6','30/4','6/1','12/39'].entries())await q.nth(index).fill(value);await stage.locator('.check-button').click();await expect(stage.locator('.instant-feedback.good')).toBeVisible();
  await jump(page,9);await expect(stage).toContainText('№ 761');const f=stage.locator('input');for(const [index,value] of ['5:7','3:10','29:5'].entries())await f.nth(index).fill(value);await stage.locator('.check-button').click();await expect(stage.locator('.instant-feedback.good')).toBeVisible();
  await jump(page,10);await expect(stage).toContainText('№ 763');const natural=stage.locator('input');for(const [index,value] of ['12/1','60/5','276/23'].entries())await natural.nth(index).fill(value);await stage.locator('.check-button').click();await expect(stage.locator('.instant-feedback.good')).toBeVisible();
  await jump(page,11);await expect(stage).toContainText('№ 765');const eq=stage.locator('input');for(const [index,value] of ['20','15','72'].entries())await eq.nth(index).fill(value);await stage.locator('.check-button').click();await expect(stage.locator('.instant-feedback.good')).toBeVisible();
  await jump(page,28);await expect(stage).toContainText('Урок 101 завершён');
});
