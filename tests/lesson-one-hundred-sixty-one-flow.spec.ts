import {expect,test,type Page} from '@playwright/test';

async function open161(page:Page){
  await page.goto('/');
  const button=page.locator('button[aria-label^="Открыть урок 161:"]');
  await expect(button).toBeEnabled();
  await button.evaluate((node:HTMLButtonElement)=>node.click());
  await expect(page.getByText('Урок 161 из 175')).toBeVisible();
  await page.locator('.lesson-opening-start').evaluate((node:HTMLButtonElement)=>node.click());
  await expect(page.locator('[aria-label="Урок 161: умножение и деление десятичных дробей"]')).toBeVisible();
}
async function jump(page:Page,stageIndex:number){await page.evaluate(index=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:161,stageIndex:index}})),stageIndex)}

test('lesson 161 accepts equivalent decimal notation and persists progress',async({page})=>{
  await open161(page);
  await jump(page,6);
  const stage=page.locator('.interactive-stage[data-stage-id="l161-practice-01"]');
  await expect(stage.locator('input')).toHaveCount(3);
  await stage.locator('input').nth(0).fill('900,0');
  await stage.locator('input').nth(1).fill('2');
  await stage.locator('input').nth(2).fill('9.000');
  await stage.getByRole('button',{name:'Проверить'}).click();
  await expect(stage.locator('.instant-feedback.good')).toBeVisible();
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('mathnikita-lesson-161-progress-v1')??'null'));
  expect(saved?.stageIndex).toBe(6);
  expect(saved?.responses?.['l161-practice-01:c']).toBe('9.000');
  await page.reload();
  await page.locator('button[aria-label^="Открыть урок 161:"]').evaluate((node:HTMLButtonElement)=>node.click());
  await page.locator('.lesson-opening-start').evaluate((node:HTMLButtonElement)=>node.click());
  await expect(page.locator('.interactive-stage[data-stage-id="l161-practice-01"]')).toBeVisible();
});

test('lesson 161 checks decimal division exactly and rejects nearby value',async({page})=>{
  await open161(page);
  await jump(page,9);
  const stage=page.locator('.interactive-stage[data-stage-id="l161-practice-04"]');
  await stage.locator('input').nth(0).fill('12,0');
  await stage.locator('input').nth(1).fill('7.20');
  await stage.getByRole('button',{name:'Проверить'}).click();
  await expect(stage.locator('.instant-feedback.good')).toBeVisible();
  await stage.locator('input').nth(0).fill('12.000001');
  await stage.getByRole('button',{name:'Проверить'}).click();
  await expect(stage.locator('.instant-feedback.bad')).toBeVisible();
});

test('lesson 161 completes final chain and reaches summary',async({page})=>{
  await open161(page);
  await jump(page,25);
  const stage=page.locator('.interactive-stage[data-stage-id="l161-practice-20"]');
  await stage.locator('input').nth(0).fill('12');
  await stage.locator('input').nth(1).fill('15,0');
  await stage.locator('input').nth(2).fill('12.50');
  await stage.getByRole('button',{name:'Проверить'}).click();
  await expect(stage.locator('.instant-feedback.good')).toBeVisible();
  await jump(page,26);
  await expect(page.locator('.interactive-stage[data-stage-id="l161-summary"]')).toContainText('20 задач · 50 ответов · умножение и деление десятичных дробей');
});
