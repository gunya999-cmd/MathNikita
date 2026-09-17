import {expect,test,type Page} from '@playwright/test';

async function open157(page:Page){
  await page.goto('/');
  const button=page.locator('button[aria-label^="Открыть урок 157:"]');
  await expect(button).toBeEnabled();
  await button.evaluate((node:HTMLButtonElement)=>node.click());
  await expect(page.getByText('Урок 157 из 175')).toBeVisible();
  await page.locator('.lesson-opening-start').evaluate((node:HTMLButtonElement)=>node.click());
  await expect(page.locator('[aria-label="Урок 157: итоговое повторение натуральных чисел"]')).toBeVisible();
}
async function jump(page:Page,stageIndex:number){await page.evaluate(index=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:157,stageIndex:index}})),stageIndex)}

test('lesson 157 opens first practice task and persists exact progress',async({page})=>{
  await open157(page);
  await jump(page,6);
  const stage=page.locator('.interactive-stage[data-stage-id="l157-practice-01"]');
  await expect(stage).toBeVisible();
  await expect(stage.locator('input')).toHaveCount(3);
  await stage.locator('input').nth(0).fill('0679143.0');
  await stage.locator('input').nth(1).fill('286327');
  await stage.locator('input').nth(2).fill('482735');
  await stage.getByRole('button',{name:'Проверить'}).click();
  await expect(stage.locator('.instant-feedback.good')).toBeVisible();
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('mathnikita-lesson-157-progress-v1')??'null'));
  expect(saved?.stageIndex).toBe(6);
  expect(saved?.responses?.['l157-practice-01:a']).toBe('0679143.0');
  await page.reload();
  await page.locator('button[aria-label^="Открыть урок 157:"]').evaluate((node:HTMLButtonElement)=>node.click());
  await page.locator('.lesson-opening-start').evaluate((node:HTMLButtonElement)=>node.click());
  await expect(page.locator('.interactive-stage[data-stage-id="l157-practice-01"]')).toBeVisible();
});

test('lesson 157 rejects close but incorrect natural-number answer',async({page})=>{
  await open157(page);
  await jump(page,6);
  const stage=page.locator('.interactive-stage[data-stage-id="l157-practice-01"]');
  await stage.locator('input').nth(0).fill('679143.0000001');
  await stage.locator('input').nth(1).fill('286327');
  await stage.locator('input').nth(2).fill('482735');
  await stage.getByRole('button',{name:'Проверить'}).click();
  await expect(stage.locator('.instant-feedback.bad')).toBeVisible();
});

test('lesson 157 exposes exact source anchors and summary',async({page})=>{
  await open157(page);
  await jump(page,7);
  await expect(page.locator('.interactive-stage[data-stage-id="l157-practice-02"]')).toContainText('(327·84+207673):47');
  await jump(page,8);
  await expect(page.locator('.interactive-stage[data-stage-id="l157-practice-03"]')).toContainText('(924·93+30271):29');
  await jump(page,26);
  await expect(page.locator('.interactive-stage[data-stage-id="l157-summary"]')).toContainText('20 задач · 50 ответов · натуральные числа');
});
