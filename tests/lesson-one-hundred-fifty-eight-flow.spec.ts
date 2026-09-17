import {expect,test,type Page} from '@playwright/test';

async function open158(page:Page){
  await page.goto('/');
  const button=page.locator('button[aria-label^="Открыть урок 158:"]');
  await expect(button).toBeEnabled();
  await button.evaluate((node:HTMLButtonElement)=>node.click());
  await expect(page.getByText('Урок 158 из 175')).toBeVisible();
  await page.locator('.lesson-opening-start').evaluate((node:HTMLButtonElement)=>node.click());
  await expect(page.locator('[aria-label="Урок 158: умножение и деление натуральных чисел"]')).toBeVisible();
}
async function jump(page:Page,stageIndex:number){await page.evaluate(index=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:158,stageIndex:index}})),stageIndex)}

test('lesson 158 opens first practice task and persists exact progress',async({page})=>{
  await open158(page);
  await jump(page,6);
  const stage=page.locator('.interactive-stage[data-stage-id="l158-practice-01"]');
  await expect(stage).toBeVisible();
  await expect(stage.locator('input')).toHaveCount(3);
  await stage.locator('input').nth(0).fill('087600.0');
  await stage.locator('input').nth(1).fill('3066');
  await stage.locator('input').nth(2).fill('90666');
  await stage.getByRole('button',{name:'Проверить'}).click();
  await expect(stage.locator('.instant-feedback.good')).toBeVisible();
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('mathnikita-lesson-158-progress-v1')??'null'));
  expect(saved?.stageIndex).toBe(6);
  expect(saved?.responses?.['l158-practice-01:a']).toBe('087600.0');
  await page.reload();
  await page.locator('button[aria-label^="Открыть урок 158:"]').evaluate((node:HTMLButtonElement)=>node.click());
  await page.locator('.lesson-opening-start').evaluate((node:HTMLButtonElement)=>node.click());
  await expect(page.locator('.interactive-stage[data-stage-id="l158-practice-01"]')).toBeVisible();
});

test('lesson 158 rejects close but incorrect multiplication answer',async({page})=>{
  await open158(page);
  await jump(page,6);
  const stage=page.locator('.interactive-stage[data-stage-id="l158-practice-01"]');
  await stage.locator('input').nth(0).fill('87600.0000001');
  await stage.locator('input').nth(1).fill('3066');
  await stage.locator('input').nth(2).fill('90666');
  await stage.getByRole('button',{name:'Проверить'}).click();
  await expect(stage.locator('.instant-feedback.bad')).toBeVisible();
});

test('lesson 158 exposes exact source anchors and summary',async({page})=>{
  await open158(page);
  await jump(page,7);
  await expect(page.locator('.interactive-stage[data-stage-id="l158-practice-02"]')).toContainText('(216·28−463680:92):(86·64−4496)');
  await jump(page,8);
  await expect(page.locator('.interactive-stage[data-stage-id="l158-practice-03"]')).toContainText('(1004·19−75110:37):(408·435−177479)');
  await jump(page,26);
  await expect(page.locator('.interactive-stage[data-stage-id="l158-summary"]')).toContainText('20 задач · 50 ответов · умножение и деление');
});
