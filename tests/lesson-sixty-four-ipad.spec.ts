import {expect,test,type Page} from '@playwright/test';

async function openLesson64(page:Page){
  await page.goto('/');
  const chapterThree=page.locator('.course-chapter-group').nth(2);
  if(!(await chapterThree.evaluate(element=>(element as HTMLDetailsElement).open)))await chapterThree.locator('summary').click();
  const lessons=page.locator('.course-lesson-grid > button');
  await expect(lessons.nth(63)).toContainText('Деление: решение уравнений');
  await expect(lessons.nth(63)).toBeEnabled();
  await page.getByRole('button',{name:/Открыть урок 64:/}).click();
  await expect(page.locator('.lesson-opening')).toContainText('Деление: решение уравнений');
  await page.locator('.lesson-opening-start').click();
}
async function jump(page:Page,stageIndex:number){await page.evaluate(stageIndex=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:64,stageIndex}})),stageIndex)}
async function noHorizontalOverflow(page:Page){return page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+2)}

test('lesson 64 is usable on iPad, preserves retry state and reaches 50-response practice',async({page})=>{
  test.setTimeout(90_000);
  await page.addInitScript(()=>localStorage.setItem('mathnikita-mentor-auto-guide','false'));
  await openLesson64(page);
  const stage=page.locator('.lesson-runtime:not([hidden]) .interactive-stage[data-stage-id]');
  await expect(stage).toHaveAttribute('data-stage-id','l64-mission');
  await expect(stage.locator('.lesson-controls')).toContainText('Этап 1 из 36');
  expect(await noHorizontalOverflow(page)).toBeTruthy();

  await jump(page,4);
  await expect(stage).toHaveAttribute('data-stage-id','l64-example-factor-root');
  const input=stage.locator('.inline-answer input');
  for(const wrong of ['6','8']){await input.fill(wrong);await stage.locator('.check-button').click();await expect(stage.locator('.instant-feedback.bad')).toBeVisible()}
  await expect(stage.locator('.lesson-controls .primary')).toBeEnabled();
  await input.fill('7');await stage.locator('.check-button').click();await expect(stage.locator('.instant-feedback.good')).toBeVisible();
  const beforeReload=await page.evaluate(()=>JSON.parse(localStorage.getItem('mathnikita-lesson-64-progress-v1')??'null'));
  expect(beforeReload?.results?.['l64-p2']).toBe(true);

  await page.reload();
  await expect(page.getByRole('button',{name:/Открыть урок 64:/})).toBeVisible();
  await page.getByRole('button',{name:/Открыть урок 64:/}).click();await page.locator('.lesson-opening-start').click();
  await expect(page.locator('.lesson-runtime:not([hidden]) .interactive-stage')).toHaveAttribute('data-stage-id','l64-example-factor-root');

  await jump(page,35);
  await expect(page.locator('.lesson-runtime:not([hidden]) .interactive-stage')).toHaveAttribute('data-stage-id','l64-summary');
  await expect(page.locator('.lesson-reflection')).toBeVisible();
  await expect(page.locator('.extended-practice')).toHaveAttribute('data-practice-response-count','50');
  await expect(page.locator('.extended-practice[data-practice-task="l64-extra-01"]')).toBeVisible();
  await expect(page.locator('.practice-pythagoras-actions button')).toHaveCount(4);
  expect(await noHorizontalOverflow(page)).toBeTruthy();
});
