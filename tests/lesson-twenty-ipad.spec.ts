import { expect,test,type Locator,type Page } from '@playwright/test';

async function openControl(page:Page){
  await page.goto('/');
  const lessons=page.locator('.course-lesson-grid > button');
  await expect(page.locator('.course-lesson-grid > button.is-interactive')).toHaveCount(38);
  await expect(page.locator('.course-lesson-grid > button.is-control-ready')).toHaveCount(2);
  await expect(page.locator('.course-lesson-grid > button:not([disabled])')).toHaveCount(40);
  await expect(lessons.nth(19)).toBeEnabled();
  await lessons.nth(19).click();
  await expect(page.getByRole('heading',{name:'Натуральные числа — контрольная работа № 1'})).toBeVisible();
  await page.locator('.lesson-opening-start').click();
  await expect(page.locator('[data-stage-id="l20-rules"]')).toBeVisible();
  await expect(page.locator('.cat-mentor-collapsed')).toHaveCount(0);
  await expect(page.locator('.progressive-hint-coach')).toHaveCount(0);
}

async function next(page:Page){const button=page.locator('.lesson-controls .primary');await expect(button).toBeEnabled();await button.click()}
async function fillInputs(stage:Locator,values:string[]){const inputs=stage.locator('.control-input');await expect(inputs).toHaveCount(values.length);for(let index=0;index<values.length;index+=1)await inputs.nth(index).fill(values[index])}
async function assertNoReveal(page:Page){await expect(page.locator('.instant-feedback.good,.instant-feedback.bad')).toHaveCount(0);await expect(page.getByText('Правильный ответ:',{exact:false})).toHaveCount(0)}

test('lesson 20 completes the full control work and reveals answers only after submission',async({page})=>{
  test.setTimeout(180_000);await openControl(page);await next(page);
  let stage=page.locator('[data-stage-id="l20-task1"]');await fillInputs(stage,['42007003019','605080005','9000042100']);await assertNoReveal(page);await next(page);
  stage=page.locator('[data-stage-id="l20-task2"]');await stage.locator('[data-control-field="l20-2a"]').getByRole('button',{name:'>',exact:true}).click();await stage.locator('[data-control-field="l20-2b"]').getByRole('button',{name:'<',exact:true}).click();await assertNoReveal(page);await next(page);
  stage=page.locator('[data-stage-id="l20-task3"]');for(const tick of [2,5,8,10])await stage.locator(`[data-control-tick="${tick}"]`).click();await expect(stage.locator('.control-ray button.selected')).toHaveCount(4);await assertNoReveal(page);await next(page);
  stage=page.locator('[data-stage-id="l20-task4"]');await fillInputs(stage,['AB, AD, DB','47']);await assertNoReveal(page);await next(page);
  stage=page.locator('[data-stage-id="l20-task5"]');await fillInputs(stage,['46']);await assertNoReveal(page);await next(page);
  stage=page.locator('[data-stage-id="l20-task6"]');await fillInputs(stage,['7,8,9','0,1,2,3,4,5']);await assertNoReveal(page);await next(page);
  stage=page.locator('[data-stage-id="l20-task7"]');await fillInputs(stage,['8']);await assertNoReveal(page);await next(page);
  stage=page.locator('[data-stage-id="l20-task8"]');await stage.locator('[data-control-field="l20-8a"]').getByRole('button',{name:'>',exact:true}).click();await stage.locator('[data-control-field="l20-8b"]').getByRole('button',{name:'>',exact:true}).click();await assertNoReveal(page);await next(page);
  await expect(page.locator('[data-stage-id="l20-submit"]')).toBeVisible();await expect(page.getByText('14/14',{exact:true})).toBeVisible();await assertNoReveal(page);await page.getByRole('button',{name:'Сдать контрольную работу'}).click();
  await expect(page.locator('[data-stage-id="l20-summary"]')).toBeVisible();await expect(page.locator('.control-score')).toContainText('Первичный результат');await expect(page.locator('.control-score')).toContainText('14/14');await expect(page.locator('.control-score')).toContainText('Оценка: 5');await expect(page.locator('.control-score')).toContainText('Сдана');await expect(page.locator('.control-review-list section.correct')).toHaveCount(14);await expect(page.locator('.control-review-list section.wrong')).toHaveCount(0);
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);expect(overflow).toBeLessThanOrEqual(2);
});

test('lesson 20 preserves an unfinished answer through direct control navigation',async({page})=>{
  await openControl(page);await page.getByRole('button',{name:/Задание 1/}).click();const first=page.locator('[data-control-field="l20-1a"] .control-input');await first.fill('42007003019');await page.getByRole('button',{name:/Задание 2/}).click();await expect(page.locator('[data-stage-id="l20-task2"]')).toBeVisible();await page.getByRole('button',{name:/Задание 1/}).click();await expect(first).toHaveValue('42007003019');await expect(page.locator('.control-work-status')).toContainText('Заполнено 1 из 14');
});