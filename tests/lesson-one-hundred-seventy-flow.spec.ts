import {expect,test,type Page} from '@playwright/test';

async function open170(page:Page){
  await page.goto('/');
  const button=page.locator('button[aria-label^="Открыть урок 170:"]');
  await expect(button).toBeEnabled();
  await button.evaluate((node:HTMLButtonElement)=>node.click());
  await expect(page.getByText('Урок 170 из 175')).toBeVisible();
  await page.locator('.lesson-opening-start').evaluate((node:HTMLButtonElement)=>node.click());
  await expect(page.locator('[aria-label="Урок 170: составные текстовые задачи"]')).toBeVisible();
}
async function jump(page:Page,stageIndex:number){await page.evaluate(index=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:170,stageIndex:index}})),stageIndex)}

test('lesson 170 solves a two-stage route and persists progress',async({page})=>{
  await open170(page);
  await jump(page,6);
  const stage=page.locator('.interactive-stage[data-stage-id="l170-practice-01"]');
  await expect(stage.locator('input')).toHaveCount(3);
  await stage.locator('input').nth(0).fill('90.0');
  await stage.locator('input').nth(1).fill('180');
  await stage.locator('input').nth(2).fill('270,00');
  await stage.getByRole('button',{name:'Проверить'}).click();
  await expect(stage.locator('.instant-feedback.good')).toBeVisible();
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('mathnikita-lesson-170-progress-v1')??'null'));
  expect(saved?.stageIndex).toBe(6);
  expect(saved?.responses?.['l170-practice-01:a']).toBe('90.0');
  await page.reload();
  await page.locator('button[aria-label^="Открыть урок 170:"]').evaluate((node:HTMLButtonElement)=>node.click());
  await page.locator('.lesson-opening-start').evaluate((node:HTMLButtonElement)=>node.click());
  await expect(page.locator('.interactive-stage[data-stage-id="l170-practice-01"]')).toBeVisible();
});

test('lesson 170 handles delayed-start meeting and rejects nearby value',async({page})=>{
  await open170(page);
  await jump(page,9);
  const stage=page.locator('.interactive-stage[data-stage-id="l170-practice-04"]');
  await stage.locator('input').nth(0).fill('360');
  await stage.locator('input').nth(1).fill('2,4');
  await stage.locator('input').nth(2).fill('204');
  await stage.getByRole('button',{name:'Проверить'}).click();
  await expect(stage.locator('.instant-feedback.good')).toBeVisible();
  await stage.locator('input').nth(1).fill('2.4001');
  await stage.getByRole('button',{name:'Проверить'}).click();
  await expect(stage.locator('.instant-feedback.bad')).toBeVisible();
});

test('lesson 170 applies a percentage to the remaining quantity and reaches summary',async({page})=>{
  await open170(page);
  await jump(page,11);
  const stage=page.locator('.interactive-stage[data-stage-id="l170-practice-06"]');
  await stage.locator('input').nth(0).fill('200');
  await stage.locator('input').nth(1).fill('60,0');
  await stage.locator('input').nth(2).fill('240');
  await stage.getByRole('button',{name:'Проверить'}).click();
  await expect(stage.locator('.instant-feedback.good')).toBeVisible();
  await jump(page,26);
  await expect(page.locator('.interactive-stage[data-stage-id="l170-summary"]')).toContainText('20 задач · 50 ответов');
});
