import {expect,test,type Page} from '@playwright/test';

async function open162(page:Page){
  await page.goto('/');
  const button=page.locator('button[aria-label^="Открыть урок 162:"]');
  await expect(button).toBeEnabled();
  await button.evaluate((node:HTMLButtonElement)=>node.click());
  await expect(page.getByText('Урок 162 из 175')).toBeVisible();
  await page.locator('.lesson-opening-start').evaluate((node:HTMLButtonElement)=>node.click());
  await expect(page.locator('[aria-label="Урок 162: проценты от числа и число по его процентам"]')).toBeVisible();
}
async function jump(page:Page,stageIndex:number){await page.evaluate(index=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:162,stageIndex:index}})),stageIndex)}

test('lesson 162 accepts equivalent decimal notation and persists progress',async({page})=>{
  await open162(page);
  await jump(page,6);
  const stage=page.locator('.interactive-stage[data-stage-id="l162-practice-01"]');
  await expect(stage.locator('input')).toHaveCount(3);
  await stage.locator('input').nth(0).fill('0,2500');
  await stage.locator('input').nth(1).fill('60.0');
  await stage.locator('input').nth(2).fill('180');
  await stage.getByRole('button',{name:'Проверить'}).click();
  await expect(stage.locator('.instant-feedback.good')).toBeVisible();
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('mathnikita-lesson-162-progress-v1')??'null'));
  expect(saved?.stageIndex).toBe(6);
  expect(saved?.responses?.['l162-practice-01:a']).toBe('0,2500');
  await page.reload();
  await page.locator('button[aria-label^="Открыть урок 162:"]').evaluate((node:HTMLButtonElement)=>node.click());
  await page.locator('.lesson-opening-start').evaluate((node:HTMLButtonElement)=>node.click());
  await expect(page.locator('.interactive-stage[data-stage-id="l162-practice-01"]')).toBeVisible();
});

test('lesson 162 solves inverse percent exactly and rejects nearby value',async({page})=>{
  await open162(page);
  await jump(page,16);
  const stage=page.locator('.interactive-stage[data-stage-id="l162-practice-11"]');
  await stage.locator('input').nth(0).fill('240,0');
  await stage.locator('input').nth(1).fill('96');
  await stage.getByRole('button',{name:'Проверить'}).click();
  await expect(stage.locator('.instant-feedback.good')).toBeVisible();
  await stage.locator('input').nth(0).fill('240.000001');
  await stage.getByRole('button',{name:'Проверить'}).click();
  await expect(stage.locator('.instant-feedback.bad')).toBeVisible();
});

test('lesson 162 uses the remainder as the new 100 percent base and reaches summary',async({page})=>{
  await open162(page);
  await jump(page,25);
  const stage=page.locator('.interactive-stage[data-stage-id="l162-practice-20"]');
  await stage.locator('input').nth(0).fill('240');
  await stage.locator('input').nth(1).fill('204,0');
  await stage.getByRole('button',{name:'Проверить'}).click();
  await expect(stage.locator('.instant-feedback.good')).toBeVisible();
  await jump(page,26);
  await expect(page.locator('.interactive-stage[data-stage-id="l162-summary"]')).toContainText('20 задач · 50 ответов · проценты от числа и число по процентам');
});
