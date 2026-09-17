import {expect,test,type Page} from '@playwright/test';

async function open159(page:Page){
  await page.goto('/');
  const button=page.locator('button[aria-label^="Открыть урок 159:"]');
  await expect(button).toBeEnabled();
  await button.evaluate((node:HTMLButtonElement)=>node.click());
  await expect(page.getByText('Урок 159 из 175')).toBeVisible();
  await page.locator('.lesson-opening-start').evaluate((node:HTMLButtonElement)=>node.click());
  await expect(page.locator('[aria-label="Урок 159: обыкновенные дроби"]')).toBeVisible();
}
async function jump(page:Page,stageIndex:number){await page.evaluate(index=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:159,stageIndex:index}})),stageIndex)}

test('lesson 159 accepts equivalent fraction and persists progress',async({page})=>{
  await open159(page);
  await jump(page,6);
  const stage=page.locator('.interactive-stage[data-stage-id="l159-practice-01"]');
  await expect(stage.locator('input')).toHaveCount(3);
  await stage.locator('input').nth(0).fill('7');
  await stage.locator('input').nth(1).fill('12');
  await stage.locator('input').nth(2).fill('14/24');
  await stage.getByRole('button',{name:'Проверить'}).click();
  await expect(stage.locator('.instant-feedback.good')).toBeVisible();
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('mathnikita-lesson-159-progress-v1')??'null'));
  expect(saved?.stageIndex).toBe(6);
  expect(saved?.responses?.['l159-practice-01:c']).toBe('14/24');
  await page.reload();
  await page.locator('button[aria-label^="Открыть урок 159:"]').evaluate((node:HTMLButtonElement)=>node.click());
  await page.locator('.lesson-opening-start').evaluate((node:HTMLButtonElement)=>node.click());
  await expect(page.locator('.interactive-stage[data-stage-id="l159-practice-01"]')).toBeVisible();
});

test('lesson 159 accepts decimal equivalent but rejects nearby value',async({page})=>{
  await open159(page);
  await jump(page,21);
  const stage=page.locator('.interactive-stage[data-stage-id="l159-practice-16"]');
  await stage.locator('input').nth(0).fill('0,5');
  await stage.locator('input').nth(1).fill('11/12');
  await stage.getByRole('button',{name:'Проверить'}).click();
  await expect(stage.locator('.instant-feedback.good')).toBeVisible();
  await stage.locator('input').nth(0).fill('0.500001');
  await stage.getByRole('button',{name:'Проверить'}).click();
  await expect(stage.locator('.instant-feedback.bad')).toBeVisible();
});

test('lesson 159 handles mixed numbers and reaches summary',async({page})=>{
  await open159(page);
  await jump(page,13);
  const stage=page.locator('.interactive-stage[data-stage-id="l159-practice-08"]');
  await stage.locator('input').nth(0).fill('3');
  await stage.locator('input').nth(1).fill('5');
  await stage.locator('input').nth(2).fill('23/6');
  await stage.getByRole('button',{name:'Проверить'}).click();
  await expect(stage.locator('.instant-feedback.good')).toBeVisible();
  await jump(page,26);
  await expect(page.locator('.interactive-stage[data-stage-id="l159-summary"]')).toContainText('20 задач · 50 ответов · обыкновенные дроби');
});
