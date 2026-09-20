import {expect,test,type Page} from '@playwright/test';

async function open174(page:Page){
  await page.goto('/');
  const button=page.locator('button[aria-label^="Открыть урок 174:"]');
  await expect(button).toBeEnabled();
  await button.evaluate((node:HTMLButtonElement)=>node.click());
  await expect(page.getByText('Урок 174 из 175')).toBeVisible();
  await page.locator('.lesson-opening-start').evaluate((node:HTMLButtonElement)=>node.click());
  await expect(page.locator('[aria-label="Урок 174: генеральная репетиция итоговой контрольной"]')).toBeVisible();
}
async function jump(page:Page,stageIndex:number){await page.evaluate(index=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:174,stageIndex:index}})),stageIndex)}

test('lesson 174 solves first rehearsal task and persists progress',async({page})=>{
  await open174(page);
  await jump(page,6);
  const stage=page.locator('.interactive-stage[data-stage-id="l174-practice-01"]');
  await expect(stage.locator('input')).toHaveCount(3);
  await stage.locator('input').nth(0).fill('13791');
  await stage.locator('input').nth(1).fill('7342');
  await stage.locator('input').nth(2).fill('5040');
  await stage.getByRole('button',{name:'Проверить'}).click();
  await expect(stage.locator('.instant-feedback.good')).toBeVisible();
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('mathnikita-lesson-174-progress-v1')??'null'));
  expect(saved?.stageIndex).toBe(6);
  expect(saved?.responses?.['l174-practice-01:c']).toBe('5040');
  await page.reload();
  await page.locator('button[aria-label^="Открыть урок 174:"]').evaluate((node:HTMLButtonElement)=>node.click());
  await page.locator('.lesson-opening-start').evaluate((node:HTMLButtonElement)=>node.click());
  await expect(page.locator('.interactive-stage[data-stage-id="l174-practice-01"]')).toBeVisible();
});

test('lesson 174 wrong answer reveals no algorithm or topic label',async({page})=>{
  await open174(page);
  await jump(page,12);
  const stage=page.locator('.interactive-stage[data-stage-id="l174-practice-07"]');
  await stage.locator('input').nth(0).fill('98');
  await stage.locator('input').nth(1).fill('240');
  await stage.locator('input').nth(2).fill('15');
  await stage.getByRole('button',{name:'Проверить'}).click();
  const bad=stage.locator('.instant-feedback.bad');
  await expect(bad).toBeVisible();
  await expect(bad).toContainText('Алгоритм не показывается');
  await expect(stage).not.toContainText('Область:');
});

test('lesson 174 summary calculates readiness score',async({page})=>{
  await open174(page);
  await jump(page,6);
  const stage=page.locator('.interactive-stage[data-stage-id="l174-practice-01"]');
  await stage.locator('input').nth(0).fill('13791');
  await stage.locator('input').nth(1).fill('7342');
  await stage.locator('input').nth(2).fill('5040');
  await jump(page,26);
  const summary=page.locator('.interactive-stage[data-stage-id="l174-summary"]');
  await expect(summary).toContainText('Результат: 3 из 50 · 6%');
  await expect(summary.locator('[data-readiness]')).toContainText('Нужно закрыть пробелы');
  await expect(summary.locator('[data-domain]')).toHaveCount(8);
});
