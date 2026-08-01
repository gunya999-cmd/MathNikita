import { expect,test } from '@playwright/test';

test('lesson 5 is not complete before mandatory mastery practice and reflection',async({page})=>{
  await page.goto('/');
  await page.evaluate(()=>{
    localStorage.setItem('mathnikita-selected-lesson','5');
    localStorage.setItem('mathnikita-lesson-5-progress-v1',JSON.stringify({
      version:1,
      stageIndex:23,
      responses:{},
      orders:{},
      checked:{},
      results:{
        'l5-p1':true,'l5-p2':true,'l5-p3':true,'l5-p4':true,'l5-p5':true,'l5-p6':true,
        'l5-q1':true,'l5-q2':true,'l5-q3':true,'l5-q4':true,'l5-q5':true,
      },
      completedAt:new Date().toISOString(),
    }));
    localStorage.setItem('mathnikita:extended-practice:5:v1','19');
    localStorage.removeItem('mathnikita:reflection:5');
    localStorage.removeItem('mathnikita:lesson-complete:5');
  });

  await page.reload();
  await page.getByRole('button',{name:/Открыть урок 5:/}).click();
  await page.locator('.lesson-opening-start').click();

  await expect(page.locator('.lesson-runtime:not([hidden]) .lesson-duration')).toHaveText('Фактическое время измеряется');
  const summary=page.locator('[data-stage-id="l5-summary"] .summary-card');
  await expect(summary).toContainText('Основная часть ✓');
  await expect(summary).not.toContainText('Завершён');
  await expect(page.locator('[data-lesson-completion-gate="5"]')).toContainText('Урок ещё не завершён');
  await expect(page.locator('[data-practice-task="l5-master-10"]')).toBeVisible();
  await expect(page.locator('.reflection-final-step')).toBeHidden();
  expect(await page.evaluate(()=>localStorage.getItem('mathnikita:lesson-complete:5'))).toBeNull();

  const task=page.locator('[data-practice-task="l5-master-10"]');
  await task.getByLabel('Следующее натуральное число').fill('10 000 000');
  await task.getByLabel('На сколько следующее натуральное число больше предыдущего?').fill('1');
  await task.getByLabel('Самое маленькое натуральное число').fill('1');
  await task.getByLabel('Существует ли наибольшее натуральное число?').fill('нет');
  await task.getByRole('button',{name:'Проверить'}).click();
  await expect(task.locator('.extended-practice-feedback.is-correct')).toBeVisible();
  await task.getByRole('button',{name:'Завершить практику'}).click();

  await expect(page.locator('.extended-practice.is-finished')).toContainText('20 заданий');
  await expect(page.locator('.extended-practice.is-finished')).toContainText('50 проверяемых ответов');
  const finalStep=page.locator('.reflection-final-step');
  await expect(finalStep).toBeVisible();
  await finalStep.locator('textarea').fill('Многозначное число нужно читать и записывать по классам. Нули сохраняют разряды, а натуральный ряд начинается с 1, идёт с шагом 1 и не имеет последнего числа.');
  await finalStep.getByRole('button',{name:'Завершить урок'}).click();
  await expect(finalStep).toContainText('Урок завершён ✓');
  expect(await page.evaluate(()=>Boolean(localStorage.getItem('mathnikita:lesson-complete:5')))).toBe(true);
});
