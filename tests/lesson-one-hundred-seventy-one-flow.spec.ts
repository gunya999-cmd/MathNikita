import {expect,test,type Page} from '@playwright/test';

async function open171(page:Page){
  await page.goto('/');
  const button=page.locator('button[aria-label^="Открыть урок 171:"]');
  await expect(button).toBeEnabled();
  await button.evaluate((node:HTMLButtonElement)=>node.click());
  await expect(page.getByText('Урок 171 из 175')).toBeVisible();
  await page.locator('.lesson-opening-start').evaluate((node:HTMLButtonElement)=>node.click());
  await expect(page.locator('[aria-label="Урок 171: итоговый тренажёр текстовых задач"]')).toBeVisible();
}
async function jump(page:Page,stageIndex:number){await page.evaluate(index=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:171,stageIndex:index}})),stageIndex)}

test('lesson 171 solves route with stop and persists progress',async({page})=>{
  await open171(page);
  await jump(page,6);
  const stage=page.locator('.interactive-stage[data-stage-id="l171-practice-01"]');
  await expect(stage.locator('input')).toHaveCount(3);
  await stage.locator('input').nth(0).fill('80');
  await stage.locator('input').nth(1).fill('1,500');
  await stage.locator('input').nth(2).fill('3.25');
  await stage.getByRole('button',{name:'Проверить'}).click();
  await expect(stage.locator('.instant-feedback.good')).toBeVisible();
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('mathnikita-lesson-171-progress-v1')??'null'));
  expect(saved?.stageIndex).toBe(6);
  expect(saved?.responses?.['l171-practice-01:c']).toBe('3.25');
  await page.reload();
  await page.locator('button[aria-label^="Открыть урок 171:"]').evaluate((node:HTMLButtonElement)=>node.click());
  await page.locator('.lesson-opening-start').evaluate((node:HTMLButtonElement)=>node.click());
  await expect(page.locator('.interactive-stage[data-stage-id="l171-practice-01"]')).toBeVisible();
});

test('lesson 171 solves reverse two-change price and rejects nearby value',async({page})=>{
  await open171(page);
  await jump(page,9);
  const stage=page.locator('.interactive-stage[data-stage-id="l171-practice-04"]');
  await stage.locator('input').nth(0).fill('1000');
  await stage.locator('input').nth(1).fill('1200');
  await stage.locator('input').nth(2).fill('900');
  await stage.getByRole('button',{name:'Проверить'}).click();
  await expect(stage.locator('.instant-feedback.good')).toBeVisible();
  await stage.locator('input').nth(0).fill('1000.01');
  await stage.getByRole('button',{name:'Проверить'}).click();
  await expect(stage.locator('.instant-feedback.bad')).toBeVisible();
});

test('lesson 171 handles reverse route and reaches summary',async({page})=>{
  await open171(page);
  await jump(page,15);
  const stage=page.locator('.interactive-stage[data-stage-id="l171-practice-10"]');
  await stage.locator('input').nth(0).fill('400');
  await stage.locator('input').nth(1).fill('160,0');
  await stage.locator('input').nth(2).fill('250');
  await stage.getByRole('button',{name:'Проверить'}).click();
  await expect(stage.locator('.instant-feedback.good')).toBeVisible();
  await jump(page,26);
  await expect(page.locator('.interactive-stage[data-stage-id="l171-summary"]')).toContainText('20 задач · 50 ответов');
});
