import {expect,test,type Page} from '@playwright/test';

async function open167(page:Page){
  await page.goto('/');
  const button=page.locator('button[aria-label^="Открыть урок 167:"]');
  await expect(button).toBeEnabled();
  await button.evaluate((node:HTMLButtonElement)=>node.click());
  await expect(page.getByText('Урок 167 из 175')).toBeVisible();
  await page.locator('.lesson-opening-start').evaluate((node:HTMLButtonElement)=>node.click());
  await expect(page.locator('[aria-label="Урок 167: комбинаторные задачи"]')).toBeVisible();
}
async function jump(page:Page,stageIndex:number){await page.evaluate(index=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:167,stageIndex:index}})),stageIndex)}

test('lesson 167 applies multiplication principle and persists progress',async({page})=>{
  await open167(page);
  await jump(page,6);
  const stage=page.locator('.interactive-stage[data-stage-id="l167-practice-01"]');
  await expect(stage.locator('input')).toHaveCount(3);
  await stage.locator('input').nth(0).fill('3');
  await stage.locator('input').nth(1).fill('4.0');
  await stage.locator('input').nth(2).fill('12');
  await stage.getByRole('button',{name:'Проверить'}).click();
  await expect(stage.locator('.instant-feedback.good')).toBeVisible();
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('mathnikita-lesson-167-progress-v1')??'null'));
  expect(saved?.stageIndex).toBe(6);
  expect(saved?.responses?.['l167-practice-01:b']).toBe('4.0');
  await page.reload();
  await page.locator('button[aria-label^="Открыть урок 167:"]').evaluate((node:HTMLButtonElement)=>node.click());
  await page.locator('.lesson-opening-start').evaluate((node:HTMLButtonElement)=>node.click());
  await expect(page.locator('.interactive-stage[data-stage-id="l167-practice-01"]')).toBeVisible();
});

test('lesson 167 handles no-repeat counting and rejects nearby answer',async({page})=>{
  await open167(page);
  await jump(page,8);
  const stage=page.locator('.interactive-stage[data-stage-id="l167-practice-03"]');
  await stage.locator('input').nth(0).fill('4');
  await stage.locator('input').nth(1).fill('3.0');
  await stage.locator('input').nth(2).fill('24,00');
  await stage.getByRole('button',{name:'Проверить'}).click();
  await expect(stage.locator('.instant-feedback.good')).toBeVisible();
  await stage.locator('input').nth(2).fill('24.0001');
  await stage.getByRole('button',{name:'Проверить'}).click();
  await expect(stage.locator('.instant-feedback.bad')).toBeVisible();
});

test('lesson 167 handles forbidden case and reaches summary',async({page})=>{
  await open167(page);
  await jump(page,25);
  const stage=page.locator('.interactive-stage[data-stage-id="l167-practice-20"]');
  await stage.locator('input').nth(0).fill('12');
  await stage.locator('input').nth(1).fill('11.0');
  await stage.getByRole('button',{name:'Проверить'}).click();
  await expect(stage.locator('.instant-feedback.good')).toBeVisible();
  await jump(page,26);
  await expect(page.locator('.interactive-stage[data-stage-id="l167-summary"]')).toContainText('20 задач · 50 ответов · §24');
});
