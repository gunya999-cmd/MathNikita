import {expect,test,type Page} from '@playwright/test';

async function open172(page:Page){
  await page.goto('/');
  const button=page.locator('button[aria-label^="Открыть урок 172:"]');
  await expect(button).toBeEnabled();
  await button.evaluate((node:HTMLButtonElement)=>node.click());
  await expect(page.getByText('Урок 172 из 175')).toBeVisible();
  await page.locator('.lesson-opening-start').evaluate((node:HTMLButtonElement)=>node.click());
  await expect(page.locator('[aria-label="Урок 172: выражения, формулы и уравнения"]')).toBeVisible();
}
async function jump(page:Page,stageIndex:number){await page.evaluate(index=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:172,stageIndex:index}})),stageIndex)}

test('lesson 172 solves formulas task and persists progress',async({page})=>{
  await open172(page);
  await jump(page,8);
  const stage=page.locator('.interactive-stage[data-stage-id="l172-practice-03"]');
  await expect(stage.locator('input')).toHaveCount(3);
  await stage.locator('input').nth(0).fill('26');
  await stage.locator('input').nth(1).fill('52.0');
  await stage.locator('input').nth(2).fill('138,75');
  await stage.getByRole('button',{name:'Проверить'}).click();
  await expect(stage.locator('.instant-feedback.good')).toBeVisible();
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('mathnikita-lesson-172-progress-v1')??'null'));
  expect(saved?.stageIndex).toBe(8);
  expect(saved?.responses?.['l172-practice-03:c']).toBe('138,75');
  await page.reload();
  await page.locator('button[aria-label^="Открыть урок 172:"]').evaluate((node:HTMLButtonElement)=>node.click());
  await page.locator('.lesson-opening-start').evaluate((node:HTMLButtonElement)=>node.click());
  await expect(page.locator('.interactive-stage[data-stage-id="l172-practice-03"]')).toBeVisible();
});

test('lesson 172 solves equation and rejects nearby root',async({page})=>{
  await open172(page);
  await jump(page,11);
  const stage=page.locator('.interactive-stage[data-stage-id="l172-practice-06"]');
  await stage.locator('input').nth(0).fill('75');
  await stage.locator('input').nth(1).fill('25');
  await stage.locator('input').nth(2).fill('93');
  await stage.getByRole('button',{name:'Проверить'}).click();
  await expect(stage.locator('.instant-feedback.good')).toBeVisible();
  await stage.locator('input').nth(1).fill('25.01');
  await stage.getByRole('button',{name:'Проверить'}).click();
  await expect(stage.locator('.instant-feedback.bad')).toBeVisible();
});

test('lesson 172 solves inverse perimeter formula and reaches summary',async({page})=>{
  await open172(page);
  await jump(page,22);
  const stage=page.locator('.interactive-stage[data-stage-id="l172-practice-17"]');
  await stage.locator('input').nth(0).fill('16');
  await stage.locator('input').nth(1).fill('336');
  await stage.getByRole('button',{name:'Проверить'}).click();
  await expect(stage.locator('.instant-feedback.good')).toBeVisible();
  await jump(page,26);
  await expect(page.locator('.interactive-stage[data-stage-id="l172-summary"]')).toContainText('20 задач · 50 ответов');
});
