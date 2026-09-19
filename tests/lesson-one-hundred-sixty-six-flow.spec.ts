import {expect,test,type Page} from '@playwright/test';

async function open166(page:Page){
  await page.goto('/');
  const button=page.locator('button[aria-label^="Открыть урок 166:"]');
  await expect(button).toBeEnabled();
  await button.evaluate((node:HTMLButtonElement)=>node.click());
  await expect(page.getByText('Урок 166 из 175')).toBeVisible();
  await page.locator('.lesson-opening-start').evaluate((node:HTMLButtonElement)=>node.click());
  await expect(page.locator('[aria-label="Урок 166: измерение и построение углов"]')).toBeVisible();
}
async function jump(page:Page,stageIndex:number){await page.evaluate(index=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:166,stageIndex:index}})),stageIndex)}

test('lesson 166 classifies angles and persists progress',async({page})=>{
  await open166(page);
  await jump(page,6);
  const stage=page.locator('.interactive-stage[data-stage-id="l166-practice-01"]');
  await expect(stage.locator('input')).toHaveCount(3);
  await stage.locator('input').nth(0).fill('2');
  await stage.locator('input').nth(1).fill('1.0');
  await stage.locator('input').nth(2).fill('1');
  await stage.getByRole('button',{name:'Проверить'}).click();
  await expect(stage.locator('.instant-feedback.good')).toBeVisible();
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('mathnikita-lesson-166-progress-v1')??'null'));
  expect(saved?.stageIndex).toBe(6);
  expect(saved?.responses?.['l166-practice-01:b']).toBe('1.0');
  await page.reload();
  await page.locator('button[aria-label^="Открыть урок 166:"]').evaluate((node:HTMLButtonElement)=>node.click());
  await page.locator('.lesson-opening-start').evaluate((node:HTMLButtonElement)=>node.click());
  await expect(page.locator('.interactive-stage[data-stage-id="l166-practice-01"]')).toBeVisible();
});

test('lesson 166 solves composite angle exactly and rejects nearby value',async({page})=>{
  await open166(page);
  await jump(page,11);
  const stage=page.locator('.interactive-stage[data-stage-id="l166-practice-06"]');
  await stage.locator('input').nth(0).fill('89,0');
  await stage.locator('input').nth(1).fill('23');
  await stage.locator('input').nth(2).fill('89.00');
  await stage.getByRole('button',{name:'Проверить'}).click();
  await expect(stage.locator('.instant-feedback.good')).toBeVisible();
  await stage.locator('input').nth(0).fill('89.0001');
  await stage.getByRole('button',{name:'Проверить'}).click();
  await expect(stage.locator('.instant-feedback.bad')).toBeVisible();
});

test('lesson 166 uses straight angle and bisector then reaches summary',async({page})=>{
  await open166(page);
  await jump(page,12);
  const stage=page.locator('.interactive-stage[data-stage-id="l166-practice-07"]');
  await stage.locator('input').nth(0).fill('118');
  await stage.locator('input').nth(1).fill('59.0');
  await stage.locator('input').nth(2).fill('118,00');
  await stage.getByRole('button',{name:'Проверить'}).click();
  await expect(stage.locator('.instant-feedback.good')).toBeVisible();
  await jump(page,26);
  await expect(page.locator('.interactive-stage[data-stage-id="l166-summary"]')).toContainText('20 задач · 50 ответов · §§11–12');
});
