import {expect,test,type Page} from '@playwright/test';

async function open168(page:Page){
  await page.goto('/');
  const button=page.locator('button[aria-label^="Открыть урок 168:"]');
  await expect(button).toBeEnabled();
  await button.evaluate((node:HTMLButtonElement)=>node.click());
  await expect(page.getByText('Урок 168 из 175')).toBeVisible();
  await page.locator('.lesson-opening-start').evaluate((node:HTMLButtonElement)=>node.click());
  await expect(page.locator('[aria-label="Урок 168: продвинутые комбинаторные задачи"]')).toBeVisible();
}
async function jump(page:Page,stageIndex:number){await page.evaluate(index=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:168,stageIndex:index}})),stageIndex)}

test('lesson 168 handles a forbidden combination and persists progress',async({page})=>{
  await open168(page);
  await jump(page,6);
  const stage=page.locator('.interactive-stage[data-stage-id="l168-practice-01"]');
  await expect(stage.locator('input')).toHaveCount(3);
  await stage.locator('input').nth(0).fill('20.0');
  await stage.locator('input').nth(1).fill('1');
  await stage.locator('input').nth(2).fill('19,00');
  await stage.getByRole('button',{name:'Проверить'}).click();
  await expect(stage.locator('.instant-feedback.good')).toBeVisible();
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('mathnikita-lesson-168-progress-v1')??'null'));
  expect(saved?.stageIndex).toBe(6);
  expect(saved?.responses?.['l168-practice-01:c']).toBe('19,00');
  await page.reload();
  await page.locator('button[aria-label^="Открыть урок 168:"]').evaluate((node:HTMLButtonElement)=>node.click());
  await page.locator('.lesson-opening-start').evaluate((node:HTMLButtonElement)=>node.click());
  await expect(page.locator('.interactive-stage[data-stage-id="l168-practice-01"]')).toBeVisible();
});

test('lesson 168 splits even numbers into cases and rejects nearby value',async({page})=>{
  await open168(page);
  await jump(page,9);
  const stage=page.locator('.interactive-stage[data-stage-id="l168-practice-04"]');
  await stage.locator('input').nth(0).fill('12');
  await stage.locator('input').nth(1).fill('18.0');
  await stage.locator('input').nth(2).fill('30,00');
  await stage.getByRole('button',{name:'Проверить'}).click();
  await expect(stage.locator('.instant-feedback.good')).toBeVisible();
  await stage.locator('input').nth(2).fill('30.0001');
  await stage.getByRole('button',{name:'Проверить'}).click();
  await expect(stage.locator('.instant-feedback.bad')).toBeVisible();
});

test('lesson 168 uses complement counting then reaches summary',async({page})=>{
  await open168(page);
  await jump(page,12);
  const stage=page.locator('.interactive-stage[data-stage-id="l168-practice-07"]');
  await stage.locator('input').nth(0).fill('10000');
  await stage.locator('input').nth(1).fill('6561');
  await stage.locator('input').nth(2).fill('3439.0');
  await stage.getByRole('button',{name:'Проверить'}).click();
  await expect(stage.locator('.instant-feedback.good')).toBeVisible();
  await jump(page,26);
  await expect(page.locator('.interactive-stage[data-stage-id="l168-summary"]')).toContainText('20 задач · 50 ответов · второй урок §24');
});
