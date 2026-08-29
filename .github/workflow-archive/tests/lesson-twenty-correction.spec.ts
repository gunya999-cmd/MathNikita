import {expect,test} from '@playwright/test';

const originalResponses={
  'l20-1a':'42007003019','l20-1b':'605080005','l20-1c':'9000042100',
  'l20-2a':'>','l20-2b':'<','l20-3':'2,5,8,10','l20-4a':'AB,AD,DB','l20-4b':'47',
  'l20-5':'45','l20-6a':'7,8,9','l20-6b':'0,1,2,3,4,5','l20-7':'8','l20-8a':'>','l20-8b':'>',
};

test('lesson 20 corrects only failed fields and keeps the first submission score',async({page})=>{
  await page.goto('/');
  const completedAt=new Date().toISOString();
  await page.evaluate(({responses,completedAt})=>{
    localStorage.setItem('mathnikita-selected-lesson','20');
    localStorage.setItem('mathnikita-lesson-20-control-v1',JSON.stringify({version:1,stageIndex:10,responses,submitted:true,submittedResponses:responses,completedAt,correctionFieldIds:[]}));
    localStorage.setItem('mathnikita:lesson-complete:20',JSON.stringify({completedAt,activeSeconds:1800}));
  },{responses:originalResponses,completedAt});
  await page.reload();

  const lesson20=page.locator('.course-lesson-grid > button').nth(19);
  await lesson20.click();
  await page.locator('.lesson-opening-start').click();

  await expect(page.locator('[data-stage-id="l20-summary"]')).toBeVisible();
  await expect(page.locator('.control-score')).toContainText('13/14');
  await expect(page.locator('.control-review-list section.wrong')).toHaveCount(1);
  await expect(page.getByText('Ответ при сдаче: 45')).toBeVisible();
  await page.getByRole('button',{name:'Исправить только ошибки'}).click();

  await expect(page.locator('[data-stage-id="l20-task5"]')).toBeVisible();
  await expect(page.locator('.control-work-status')).toContainText('Исправлено 0 из 1');
  const target=page.locator('[data-control-field="l20-5"] .control-input');
  await expect(target).toBeEnabled();
  await target.fill('46');
  await expect(page.getByText('Исправлено ✓',{exact:true})).toBeVisible();
  await expect(page.locator('.control-work-status')).toContainText('Исправлено 1 из 1');

  const finish=page.getByRole('button',{name:'Завершить коррекцию ✓'});
  await expect(finish).toBeEnabled();
  await finish.click();

  await expect(page.locator('[data-stage-id="l20-summary"]')).toBeVisible();
  await expect(page.locator('.control-score')).toContainText('13/14');
  await expect(page.getByText('Коррекция завершена ✓')).toBeVisible();
  await expect(page.getByText('После коррекции: 46')).toBeVisible();
  await expect(page.getByText('Ответ при сдаче: 45')).toBeVisible();

  await page.reload();
  await lesson20.click();
  await page.locator('.lesson-opening-start').click();
  await expect(page.locator('[data-stage-id="l20-summary"]')).toBeVisible();
  await expect(page.locator('.control-score')).toContainText('13/14');
  await expect(page.getByText('Коррекция завершена ✓')).toBeVisible();
});
