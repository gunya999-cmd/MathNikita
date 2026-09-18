import {expect,test,type Page} from '@playwright/test';

async function open164(page:Page){
  await page.goto('/');
  const button=page.locator('button[aria-label^="Открыть урок 164:"]');
  await expect(button).toBeEnabled();
  await button.evaluate((node:HTMLButtonElement)=>node.click());
  await expect(page.getByText('Урок 164 из 175')).toBeVisible();
  await page.locator('.lesson-opening-start').evaluate((node:HTMLButtonElement)=>node.click());
  await expect(page.locator('[aria-label="Урок 164: многоугольники и периметр"]')).toBeVisible();
}
async function jump(page:Page,stageIndex:number){await page.evaluate(index=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:164,stageIndex:index}})),stageIndex)}

test('lesson 164 solves perimeter task and persists progress',async({page})=>{
  await open164(page);
  await jump(page,6);
  const stage=page.locator('.interactive-stage[data-stage-id="l164-practice-01"]');
  await expect(stage.locator('input')).toHaveCount(3);
  await stage.locator('input').nth(0).fill('3');
  await stage.locator('input').nth(1).fill('28.0');
  await stage.locator('input').nth(2).fill('12');
  await stage.getByRole('button',{name:'Проверить'}).click();
  await expect(stage.locator('.instant-feedback.good')).toBeVisible();
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('mathnikita-lesson-164-progress-v1')??'null'));
  expect(saved?.stageIndex).toBe(6);
  expect(saved?.responses?.['l164-practice-01:b']).toBe('28.0');
  await page.reload();
  await page.locator('button[aria-label^="Открыть урок 164:"]').evaluate((node:HTMLButtonElement)=>node.click());
  await page.locator('.lesson-opening-start').evaluate((node:HTMLButtonElement)=>node.click());
  await expect(page.locator('.interactive-stage[data-stage-id="l164-practice-01"]')).toBeVisible();
});

test('lesson 164 accepts decimal side notation and rejects nearby value',async({page})=>{
  await open164(page);
  await jump(page,19);
  const stage=page.locator('.interactive-stage[data-stage-id="l164-practice-14"]');
  await stage.locator('input').nth(0).fill('5');
  await stage.locator('input').nth(1).fill('9,50');
  await stage.getByRole('button',{name:'Проверить'}).click();
  await expect(stage.locator('.instant-feedback.good')).toBeVisible();
  await stage.locator('input').nth(1).fill('9.500001');
  await stage.getByRole('button',{name:'Проверить'}).click();
  await expect(stage.locator('.instant-feedback.bad')).toBeVisible();
});

test('lesson 164 finds missing polygon side and reaches summary',async({page})=>{
  await open164(page);
  await jump(page,20);
  const stage=page.locator('.interactive-stage[data-stage-id="l164-practice-15"]');
  await stage.locator('input').nth(0).fill('50');
  await stage.locator('input').nth(1).fill('10.0');
  await stage.getByRole('button',{name:'Проверить'}).click();
  await expect(stage.locator('.instant-feedback.good')).toBeVisible();
  await jump(page,26);
  await expect(page.locator('.interactive-stage[data-stage-id="l164-summary"]')).toContainText('20 задач · 50 ответов · §10');
});
