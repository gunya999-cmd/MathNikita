import {expect,test,type Page} from '@playwright/test';

async function open173(page:Page){
  await page.goto('/');
  const button=page.locator('button[aria-label^="Открыть урок 173:"]');
  await expect(button).toBeEnabled();
  await button.evaluate((node:HTMLButtonElement)=>node.click());
  await expect(page.getByText('Урок 173 из 175')).toBeVisible();
  await page.locator('.lesson-opening-start').evaluate((node:HTMLButtonElement)=>node.click());
  await expect(page.locator('[aria-label="Урок 173: итоговая диагностика курса"]')).toBeVisible();
}
async function jump(page:Page,stageIndex:number){await page.evaluate(index=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:173,stageIndex:index}})),stageIndex)}

test('lesson 173 solves natural arithmetic task and persists progress',async({page})=>{
  await open173(page);
  await jump(page,6);
  const stage=page.locator('.interactive-stage[data-stage-id="l173-practice-01"]');
  await expect(stage).toContainText('Область: Натуральные числа');
  await stage.locator('input').nth(0).fill('12313');
  await stage.locator('input').nth(1).fill('6236');
  await stage.locator('input').nth(2).fill('6000');
  await stage.getByRole('button',{name:'Проверить'}).click();
  await expect(stage.locator('.instant-feedback.good')).toBeVisible();
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('mathnikita-lesson-173-progress-v1')??'null'));
  expect(saved?.stageIndex).toBe(6);
  expect(saved?.responses?.['l173-practice-01:c']).toBe('6000');
  await page.reload();
  await page.locator('button[aria-label^="Открыть урок 173:"]').evaluate((node:HTMLButtonElement)=>node.click());
  await page.locator('.lesson-opening-start').evaluate((node:HTMLButtonElement)=>node.click());
  await expect(page.locator('.interactive-stage[data-stage-id="l173-practice-01"]')).toBeVisible();
});

test('lesson 173 accepts decimal comma and rejects nearby diagnostic answer',async({page})=>{
  await open173(page);
  await jump(page,11);
  const stage=page.locator('.interactive-stage[data-stage-id="l173-practice-06"]');
  await stage.locator('input').nth(0).fill('25,158');
  await stage.locator('input').nth(1).fill('17,325');
  await stage.locator('input').nth(2).fill('12');
  await stage.getByRole('button',{name:'Проверить'}).click();
  await expect(stage.locator('.instant-feedback.good')).toBeVisible();
  await stage.locator('input').nth(0).fill('25,159');
  await stage.getByRole('button',{name:'Проверить'}).click();
  await expect(stage.locator('.instant-feedback.bad')).toBeVisible();
});

test('lesson 173 summary builds domain score from entered answers',async({page})=>{
  await open173(page);
  await jump(page,6);
  let stage=page.locator('.interactive-stage[data-stage-id="l173-practice-01"]');
  for(const [index,value] of ['12313','6236','6000'].entries())await stage.locator('input').nth(index).fill(value);
  await jump(page,7);
  stage=page.locator('.interactive-stage[data-stage-id="l173-practice-02"]');
  await stage.locator('input').nth(0).fill('411');
  await stage.locator('input').nth(1).fill('11');
  await jump(page,26);
  const summary=page.locator('.interactive-stage[data-stage-id="l173-summary"]');
  await expect(summary).toContainText('Натуральные числа: 5 из 5');
  await expect(summary).toContainText('Обыкновенные дроби: 0 из 7');
  await expect(summary).toContainText('Выражения и уравнения: 0 из 6');
});
