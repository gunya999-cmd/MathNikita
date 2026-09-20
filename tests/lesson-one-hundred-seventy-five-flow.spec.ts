import {expect,test,type Page} from '@playwright/test';
import {lessonOneHundredSeventyFiveProgressKey,lessonOneHundredSeventyFiveTasks} from '../src/data/lessonOneHundredSeventyFiveControl';

async function open175(page:Page){
  await page.goto('/');
  const button=page.locator('button[aria-label^="Открыть урок 175:"]');
  await expect(button).toBeEnabled();
  await button.evaluate((node:HTMLButtonElement)=>node.click());
  await expect(page.getByText('Урок 175 из 175')).toBeVisible();
  await page.locator('.lesson-opening-start').evaluate((node:HTMLButtonElement)=>node.click());
  await expect(page.locator('.final-course-control')).toBeVisible();
}
async function jump(page:Page,stageIndex:number){await page.evaluate(index=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:175,stageIndex:index}})),stageIndex)}

function correctResponses(){const responses:Record<string,string>={};for(const task of lessonOneHundredSeventyFiveTasks)for(const field of task.fields)responses[`${task.id}:${field.id}`]=field.answer;return responses}

test('lesson 175 hides correctness before final submission',async({page})=>{
  await open175(page);
  await jump(page,1);
  const stage=page.locator('.interactive-stage[data-stage-id="l175-task-01"]');
  await expect(stage.locator('input')).toHaveCount(3);
  await stage.locator('input').nth(0).fill('1');
  await expect(stage.locator('.control-correct,.control-wrong')).toHaveCount(0);
  await expect(stage.getByRole('button',{name:/Проверить/})).toHaveCount(0);
});

test('lesson 175 submits once, freezes score and marks course complete',async({page})=>{
  await open175(page);
  const responses=correctResponses();
  responses['l175-p01:a']='1';
  await page.evaluate(({key,responses})=>localStorage.setItem(key,JSON.stringify({version:1,stageIndex:21,responses,submitted:false})),{key:lessonOneHundredSeventyFiveProgressKey,responses});
  await page.reload();
  await page.locator('button[aria-label^="Открыть урок 175:"]').evaluate((node:HTMLButtonElement)=>node.click());
  await page.locator('.lesson-opening-start').evaluate((node:HTMLButtonElement)=>node.click());
  await expect(page.locator('[data-stage-id="l175-submit"]')).toBeVisible();
  await page.getByRole('button',{name:'Сдать итоговую работу'}).click();
  const summary=page.locator('[data-stage-id="l175-summary"]');
  await expect(summary).toContainText('Первичный результат: 49/50');
  await expect(summary).toContainText('Курс из 175 уроков завершён.');
  const completion=await page.evaluate(()=>JSON.parse(localStorage.getItem('mathnikita:lesson-complete:175')??'null'));
  expect(completion?.finalControl).toBe(true);
  await jump(page,1);
  const first=page.locator('[data-stage-id="l175-task-01"]');
  await expect(first.locator('input').first()).toBeDisabled();
  await expect(first.locator('.control-wrong').first()).toContainText('Ответ: 16245');
});
