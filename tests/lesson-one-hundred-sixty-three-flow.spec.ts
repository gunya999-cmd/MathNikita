import {expect,test,type Page} from '@playwright/test';

async function open163(page:Page){
  await page.goto('/');
  const button=page.locator('button[aria-label^="Открыть урок 163:"]');
  await expect(button).toBeEnabled();
  await button.evaluate((node:HTMLButtonElement)=>node.click());
  await expect(page.getByText('Урок 163 из 175')).toBeVisible();
  await page.locator('.lesson-opening-start').evaluate((node:HTMLButtonElement)=>node.click());
  await expect(page.locator('[aria-label="Урок 163: составные и обратные процентные задачи"]')).toBeVisible();
}
async function jump(page:Page,stageIndex:number){await page.evaluate(index=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:163,stageIndex:index}})),stageIndex)}

test('lesson 163 solves successive discounts and persists progress',async({page})=>{
  await open163(page);
  await jump(page,6);
  const stage=page.locator('.interactive-stage[data-stage-id="l163-practice-01"]');
  await expect(stage.locator('input')).toHaveCount(3);
  await stage.locator('input').nth(0).fill('800,0');
  await stage.locator('input').nth(1).fill('720.00');
  await stage.locator('input').nth(2).fill('28');
  await stage.getByRole('button',{name:'Проверить'}).click();
  await expect(stage.locator('.instant-feedback.good')).toBeVisible();
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('mathnikita-lesson-163-progress-v1')??'null'));
  expect(saved?.stageIndex).toBe(6);
  expect(saved?.responses?.['l163-practice-01:b']).toBe('720.00');
  await page.reload();
  await page.locator('button[aria-label^="Открыть урок 163:"]').evaluate((node:HTMLButtonElement)=>node.click());
  await page.locator('.lesson-opening-start').evaluate((node:HTMLButtonElement)=>node.click());
  await expect(page.locator('.interactive-stage[data-stage-id="l163-practice-01"]')).toBeVisible();
});

test('lesson 163 checks equal up/down percentages exactly and rejects nearby value',async({page})=>{
  await open163(page);
  await jump(page,12);
  const stage=page.locator('.interactive-stage[data-stage-id="l163-practice-07"]');
  await stage.locator('input').nth(0).fill('560');
  await stage.locator('input').nth(1).fill('492,800');
  await stage.locator('input').nth(2).fill('7.2');
  await stage.getByRole('button',{name:'Проверить'}).click();
  await expect(stage.locator('.instant-feedback.good')).toBeVisible();
  await stage.locator('input').nth(1).fill('492.800001');
  await stage.getByRole('button',{name:'Проверить'}).click();
  await expect(stage.locator('.instant-feedback.bad')).toBeVisible();
});

test('lesson 163 reverses a two-step percentage chain and reaches summary',async({page})=>{
  await open163(page);
  await jump(page,25);
  const stage=page.locator('.interactive-stage[data-stage-id="l163-practice-20"]');
  await stage.locator('input').nth(0).fill('750');
  await stage.locator('input').nth(1).fill('675.0');
  await stage.getByRole('button',{name:'Проверить'}).click();
  await expect(stage.locator('.instant-feedback.good')).toBeVisible();
  await jump(page,26);
  await expect(page.locator('.interactive-stage[data-stage-id="l163-summary"]')).toContainText('20 задач · 50 ответов · усложнённый практикум §§37–38');
});
