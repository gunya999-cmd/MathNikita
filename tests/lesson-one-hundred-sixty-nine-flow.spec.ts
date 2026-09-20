import {expect,test,type Page} from '@playwright/test';

async function open169(page:Page){
  await page.goto('/');
  const button=page.locator('button[aria-label^="Открыть урок 169:"]');
  await expect(button).toBeEnabled();
  await button.evaluate((node:HTMLButtonElement)=>node.click());
  await expect(page.getByText('Урок 169 из 175')).toBeVisible();
  await page.locator('.lesson-opening-start').evaluate((node:HTMLButtonElement)=>node.click());
  await expect(page.locator('[aria-label="Урок 169: решение текстовых задач"]')).toBeVisible();
}
async function jump(page:Page,stageIndex:number){await page.evaluate(index=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:169,stageIndex:index}})),stageIndex)}

test('lesson 169 solves a motion model and persists progress',async({page})=>{
  await open169(page);
  await jump(page,6);
  const stage=page.locator('.interactive-stage[data-stage-id="l169-practice-01"]');
  await expect(stage.locator('input')).toHaveCount(3);
  await stage.locator('input').nth(0).fill('180.0');
  await stage.locator('input').nth(1).fill('72');
  await stage.locator('input').nth(2).fill('90,00');
  await stage.getByRole('button',{name:'Проверить'}).click();
  await expect(stage.locator('.instant-feedback.good')).toBeVisible();
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('mathnikita-lesson-169-progress-v1')??'null'));
  expect(saved?.stageIndex).toBe(6);
  expect(saved?.responses?.['l169-practice-01:a']).toBe('180.0');
  await page.reload();
  await page.locator('button[aria-label^="Открыть урок 169:"]').evaluate((node:HTMLButtonElement)=>node.click());
  await page.locator('.lesson-opening-start').evaluate((node:HTMLButtonElement)=>node.click());
  await expect(page.locator('.interactive-stage[data-stage-id="l169-practice-01"]')).toBeVisible();
});

test('lesson 169 handles meeting motion and rejects nearby value',async({page})=>{
  await open169(page);
  await jump(page,10);
  const stage=page.locator('.interactive-stage[data-stage-id="l169-practice-05"]');
  await stage.locator('input').nth(0).fill('140');
  await stage.locator('input').nth(1).fill('3.0');
  await stage.locator('input').nth(2).fill('180');
  await stage.getByRole('button',{name:'Проверить'}).click();
  await expect(stage.locator('.instant-feedback.good')).toBeVisible();
  await stage.locator('input').nth(1).fill('3.0001');
  await stage.getByRole('button',{name:'Проверить'}).click();
  await expect(stage.locator('.instant-feedback.bad')).toBeVisible();
});

test('lesson 169 solves reverse percent and reaches summary',async({page})=>{
  await open169(page);
  await jump(page,14);
  const stage=page.locator('.interactive-stage[data-stage-id="l169-practice-09"]');
  await stage.locator('input').nth(0).fill('180');
  await stage.locator('input').nth(1).fill('126,0');
  await stage.locator('input').nth(2).fill('18');
  await stage.getByRole('button',{name:'Проверить'}).click();
  await expect(stage.locator('.instant-feedback.good')).toBeVisible();
  await jump(page,26);
  await expect(page.locator('.interactive-stage[data-stage-id="l169-summary"]')).toContainText('20 задач · 50 ответов');
});
