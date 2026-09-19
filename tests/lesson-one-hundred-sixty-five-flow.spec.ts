import {expect,test,type Page} from '@playwright/test';

async function open165(page:Page){
  await page.goto('/');
  const button=page.locator('button[aria-label^="Открыть урок 165:"]');
  await expect(button).toBeEnabled();
  await button.evaluate((node:HTMLButtonElement)=>node.click());
  await expect(page.getByText('Урок 165 из 175')).toBeVisible();
  await page.locator('.lesson-opening-start').evaluate((node:HTMLButtonElement)=>node.click());
  await expect(page.locator('[aria-label="Урок 165: площади и объёмы"]')).toBeVisible();
}
async function jump(page:Page,stageIndex:number){await page.evaluate(index=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:165,stageIndex:index}})),stageIndex)}

test('lesson 165 solves rectangle area and persists progress',async({page})=>{
  await open165(page);
  await jump(page,6);
  const stage=page.locator('.interactive-stage[data-stage-id="l165-practice-01"]');
  await expect(stage.locator('input')).toHaveCount(3);
  await stage.locator('input').nth(0).fill('84.0');
  await stage.locator('input').nth(1).fill('38');
  await stage.locator('input').nth(2).fill('84,00');
  await stage.getByRole('button',{name:'Проверить'}).click();
  await expect(stage.locator('.instant-feedback.good')).toBeVisible();
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('mathnikita-lesson-165-progress-v1')??'null'));
  expect(saved?.stageIndex).toBe(6);
  expect(saved?.responses?.['l165-practice-01:a']).toBe('84.0');
  await page.reload();
  await page.locator('button[aria-label^="Открыть урок 165:"]').evaluate((node:HTMLButtonElement)=>node.click());
  await page.locator('.lesson-opening-start').evaluate((node:HTMLButtonElement)=>node.click());
  await expect(page.locator('.interactive-stage[data-stage-id="l165-practice-01"]')).toBeVisible();
});

test('lesson 165 accepts exact cube decimals and rejects a nearby volume',async({page})=>{
  await open165(page);
  await jump(page,13);
  const stage=page.locator('.interactive-stage[data-stage-id="l165-practice-08"]');
  await stage.locator('input').nth(0).fill('20,250');
  await stage.locator('input').nth(1).fill('91.1250');
  await stage.locator('input').nth(2).fill('121.500');
  await stage.getByRole('button',{name:'Проверить'}).click();
  await expect(stage.locator('.instant-feedback.good')).toBeVisible();
  await stage.locator('input').nth(1).fill('91.125001');
  await stage.getByRole('button',{name:'Проверить'}).click();
  await expect(stage.locator('.instant-feedback.bad')).toBeVisible();
});

test('lesson 165 checks volume scaling and reaches summary',async({page})=>{
  await open165(page);
  await jump(page,17);
  const stage=page.locator('.interactive-stage[data-stage-id="l165-practice-12"]');
  await stage.locator('input').nth(0).fill('8');
  await stage.locator('input').nth(1).fill('40.0');
  await stage.getByRole('button',{name:'Проверить'}).click();
  await expect(stage.locator('.instant-feedback.good')).toBeVisible();
  await jump(page,26);
  await expect(page.locator('.interactive-stage[data-stage-id="l165-summary"]')).toContainText('20 задач · 50 ответов · §§21–23');
});
