import {expect,test,type Page} from '@playwright/test';

async function open160(page:Page){
  await page.goto('/');
  const button=page.locator('button[aria-label^="Открыть урок 160:"]');
  await expect(button).toBeEnabled();
  await button.evaluate((node:HTMLButtonElement)=>node.click());
  await expect(page.getByText('Урок 160 из 175')).toBeVisible();
  await page.locator('.lesson-opening-start').evaluate((node:HTMLButtonElement)=>node.click());
  await expect(page.locator('[aria-label="Урок 160: сложение и вычитание десятичных дробей"]')).toBeVisible();
}
async function jump(page:Page,stageIndex:number){await page.evaluate(index=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:160,stageIndex:index}})),stageIndex)}

test('lesson 160 accepts comma dot and trailing zeros and persists progress',async({page})=>{
  await open160(page);
  await jump(page,6);
  const stage=page.locator('.interactive-stage[data-stage-id="l160-practice-01"]');
  await expect(stage.locator('input')).toHaveCount(3);
  await stage.locator('input').nth(0).fill('12,700');
  await stage.locator('input').nth(1).fill('3.450');
  await stage.locator('input').nth(2).fill('16,1500');
  await stage.getByRole('button',{name:'Проверить'}).click();
  await expect(stage.locator('.instant-feedback.good')).toBeVisible();
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('mathnikita-lesson-160-progress-v1')??'null'));
  expect(saved?.stageIndex).toBe(6);
  expect(saved?.responses?.['l160-practice-01:c']).toBe('16,1500');
  await page.reload();
  await page.locator('button[aria-label^="Открыть урок 160:"]').evaluate((node:HTMLButtonElement)=>node.click());
  await page.locator('.lesson-opening-start').evaluate((node:HTMLButtonElement)=>node.click());
  await expect(page.locator('.interactive-stage[data-stage-id="l160-practice-01"]')).toBeVisible();
});

test('lesson 160 rejects fraction syntax and nearby decimal values',async({page})=>{
  await open160(page);
  await jump(page,6);
  const stage=page.locator('.interactive-stage[data-stage-id="l160-practice-01"]');
  await stage.locator('input').nth(0).fill('127/10');
  await stage.locator('input').nth(1).fill('3.45');
  await stage.locator('input').nth(2).fill('16.15');
  await stage.getByRole('button',{name:'Проверить'}).click();
  await expect(stage.locator('.instant-feedback.bad')).toBeVisible();
  await stage.locator('input').nth(0).fill('12.700001');
  await stage.getByRole('button',{name:'Проверить'}).click();
  await expect(stage.locator('.instant-feedback.bad')).toBeVisible();
});

test('lesson 160 solves final decimal chain and reaches summary',async({page})=>{
  await open160(page);
  await jump(page,25);
  const stage=page.locator('.interactive-stage[data-stage-id="l160-practice-20"]');
  await stage.locator('input').nth(0).fill('25,400');
  await stage.locator('input').nth(1).fill('50.0');
  await stage.locator('input').nth(2).fill('52.0050');
  await stage.getByRole('button',{name:'Проверить'}).click();
  await expect(stage.locator('.instant-feedback.good')).toBeVisible();
  await jump(page,26);
  await expect(page.locator('.interactive-stage[data-stage-id="l160-summary"]')).toContainText('20 задач · 50 ответов · сложение и вычитание десятичных дробей');
});
