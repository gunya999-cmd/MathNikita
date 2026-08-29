import { expect,test,type Locator } from '@playwright/test';

async function domClick(locator:Locator){
  await expect(locator).toBeVisible();
  await locator.evaluate((element:HTMLElement)=>element.click());
}

test('lesson 4 is not complete before mandatory mastery practice and reflection',async({page})=>{
  await page.goto('/');
  await page.evaluate(()=>{
    localStorage.setItem('mathnikita-selected-lesson','4');
    localStorage.setItem('mathnikita-lesson-4-progress-v1',JSON.stringify({
      version:1,
      stageIndex:21,
      responses:{},
      orders:{},
      checked:{},
      results:{
        'l4-p1':true,'l4-p2':true,'l4-p3':true,'l4-p4':true,'l4-p5':true,'l4-p6':true,
        'l4-q1':true,'l4-q2':true,'l4-q3':true,'l4-q4':true,'l4-q5':true,
      },
      completedAt:new Date().toISOString(),
    }));
    localStorage.setItem('mathnikita:extended-practice:4:v1','19');
    localStorage.removeItem('mathnikita:reflection:4');
    localStorage.removeItem('mathnikita:lesson-complete:4');
  });

  await page.reload();
  await domClick(page.getByRole('button',{name:/Открыть урок 4:/}));
  await domClick(page.locator('.lesson-opening-start'));

  const summary=page.locator('[data-stage-id="l4-summary"] .summary-card');
  await expect(summary).toContainText('Основная часть ✓');
  await expect(summary).not.toContainText('Завершён');
  await expect(page.locator('[data-lesson-completion-gate="4"]')).toContainText('Урок ещё не завершён');
  await expect(page.locator('[data-practice-task="l4-extra-20"]')).toBeVisible();
  await expect(page.locator('.reflection-final-step')).toBeHidden();
  expect(await page.evaluate(()=>localStorage.getItem('mathnikita:lesson-complete:4'))).toBeNull();

  const task=page.locator('[data-practice-task="l4-extra-20"]');
  await task.getByLabel('Запиши число').fill('9 407 305');
  await task.getByLabel('Цифра десятков тысяч').fill('0');
  await task.getByLabel('Значение цифры 4').fill('400 000');
  await task.getByLabel('Количество полных тысяч').fill('9 407');
  await task.getByLabel('Разрядная сумма').fill('9 000 000 + 400 000 + 7 000 + 300 + 5');
  await domClick(task.getByRole('button',{name:'Проверить'}));
  await expect(task.locator('.extended-practice-feedback.is-correct')).toBeVisible();
  await domClick(task.getByRole('button',{name:'Завершить практику'}));

  await expect(page.locator('.extended-practice.is-finished')).toContainText('20 заданий');
  await expect(page.locator('.extended-practice.is-finished')).toContainText('50 проверяемых ответов');
  const finalStep=page.locator('.reflection-final-step');
  await expect(finalStep).toBeVisible();
  await finalStep.locator('textarea').fill('Значение цифры зависит от её разряда. Классы и нули помогают точно читать, записывать и разбирать многозначные числа.');
  await domClick(finalStep.getByRole('button',{name:'Завершить урок'}));
  await expect(finalStep).toContainText('Урок завершён ✓');
  expect(await page.evaluate(()=>Boolean(localStorage.getItem('mathnikita:lesson-complete:4')))).toBe(true);
});
