import {expect,test,type Page} from '@playwright/test';

test.use({viewport:{width:1024,height:1366},userAgent:'Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1'});

async function openLesson29(page:Page){
  await page.goto('/');
  const chapterTwo=page.locator('.course-chapter-group').nth(1);
  if(!(await chapterTwo.evaluate(element=>(element as HTMLDetailsElement).open)))await chapterTwo.locator('summary').click();
  const lesson29=page.getByRole('button',{name:/Открыть урок 29:/});
  const lesson30=page.locator('.course-lesson-grid > button').nth(29);
  await expect(lesson29).toBeVisible();
  await expect(lesson29).toBeEnabled();
  await expect(lesson30).toBeDisabled();
  await lesson29.click();
  await expect(page.getByText('Текстовые задачи на сложение и вычитание')).toBeVisible();
  await page.locator('.lesson-opening-start').click();
}

test('lesson 29 handles word problems, persistence, direct summary jump and single practice gate',async({page})=>{
  await openLesson29(page);
  await expect(page.locator('[data-stage-id="l29-model"]')).toBeVisible();
  await page.locator('[data-stage-id="l29-model"] .lesson-controls button').last().click();

  const example=page.locator('[data-stage-id="l29-example-add"]');
  await expect(example).toBeVisible();
  await example.locator('input').fill('1625');
  await example.locator('.check-button').click();
  await expect(example.locator('.instant-feedback.good')).toBeVisible();
  await example.locator('.lesson-controls button').last().click();
  await expect(page.locator('[data-stage-id="l29-remainder"]')).toBeVisible();

  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('mathnikita-lesson-29-progress-v1')??'null'));
  expect(saved?.stageIndex).toBe(2);
  expect(saved?.results?.['l29-example-add']).toBe(true);

  await page.getByRole('button',{name:/Все уроки/}).click();
  const lesson29=page.getByRole('button',{name:/Открыть урок 29:/});
  await lesson29.click();
  await page.locator('.lesson-opening-start').click();
  await expect(page.locator('[data-stage-id="l29-remainder"]')).toBeVisible();

  await page.evaluate(()=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:29,stageIndex:22}})));
  await expect(page.locator('[data-stage-id="l29-summary"]')).toBeVisible();
  await expect(page.locator('.lesson-reflection')).toBeVisible();
  await expect(page.locator('.extended-practice')).toHaveCount(1);
  await expect(page.locator('.extended-practice[data-practice-task="l29-01"]')).toBeVisible();

  const practice=page.locator('.extended-practice');
  await practice.locator('.extended-practice-input input').fill('3130');
  await practice.locator('.extended-practice-check').click();
  await expect(practice.locator('.extended-practice-feedback.is-correct')).toBeVisible();

  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(2);
});
