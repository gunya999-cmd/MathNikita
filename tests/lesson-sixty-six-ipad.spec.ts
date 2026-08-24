import {expect,test,type Page} from '@playwright/test';

async function openLesson66(page:Page){
  await page.goto('/');
  const chapterThree=page.locator('.course-chapter-group').nth(2);
  if(!(await chapterThree.evaluate(element=>(element as HTMLDetailsElement).open)))await chapterThree.locator('summary').click();
  const lessons=page.locator('.course-lesson-grid > button');
  await expect(lessons.nth(65)).toContainText('Деление: уравнения и составные задачи');
  await expect(lessons.nth(65)).toBeEnabled();
  await expect(lessons.nth(66)).toBeDisabled();
  await page.getByRole('button',{name:/Открыть урок 66:/}).click();
  await expect(page.locator('.lesson-opening')).toContainText('Деление: уравнения и составные задачи');
  await page.locator('.lesson-opening-start').click();
}
async function jump(page:Page,stageIndex:number){await page.evaluate(stageIndex=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:66,stageIndex}})),stageIndex)}
async function noHorizontalOverflow(page:Page){return page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+2)}

test('lesson 66 is usable on iPad, preserves retry state and reaches 50-response practice',async({page})=>{
  test.setTimeout(90_000);
  await page.addInitScript(()=>localStorage.setItem('mathnikita-mentor-auto-guide','false'));
  await openLesson66(page);
  const stage=page.locator('.lesson-runtime:not([hidden]) .interactive-stage[data-stage-id]');
  await expect(stage).toHaveAttribute('data-stage-id','l66-mission');
  await expect(stage.locator('.lesson-controls')).toContainText('Этап 1 из 36');
  expect(await noHorizontalOverflow(page)).toBeTruthy();

  await jump(page,8);
  await expect(stage).toHaveAttribute('data-stage-id','l66-485-unit');
  const input=stage.locator('.inline-answer input');
  for(const wrong of ['3','5']){await input.fill(wrong);await stage.locator('.check-button').click();await expect(stage.locator('.instant-feedback.bad')).toBeVisible()}
  await expect(stage.locator('.lesson-controls .primary')).toBeEnabled();
  await input.fill('4');await stage.locator('.check-button').click();await expect(stage.locator('.instant-feedback.good')).toBeVisible();
  const beforeReload=await page.evaluate(()=>JSON.parse(localStorage.getItem('mathnikita-lesson-66-progress-v1')??'null'));
  expect(beforeReload?.results?.['l66-p5']).toBe(true);

  await page.reload();
  await expect(page.getByRole('button',{name:/Открыть урок 66:/})).toBeVisible();
  await page.getByRole('button',{name:/Открыть урок 66:/}).click();await page.locator('.lesson-opening-start').click();
  await expect(page.locator('.lesson-runtime:not([hidden]) .interactive-stage')).toHaveAttribute('data-stage-id','l66-485-unit');

  await jump(page,35);
  await expect(page.locator('.lesson-runtime:not([hidden]) .interactive-stage')).toHaveAttribute('data-stage-id','l66-summary');
  await expect(page.locator('.lesson-reflection')).toBeVisible();
  await expect(page.locator('.extended-practice')).toHaveAttribute('data-practice-response-count','50');
  await expect(page.locator('.extended-practice[data-practice-task="l66-extra-01"]')).toBeVisible();
  await expect(page.locator('.practice-pythagoras-actions button')).toHaveCount(4);
  expect(await noHorizontalOverflow(page)).toBeTruthy();
});
