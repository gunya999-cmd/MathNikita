import {expect,test,type Page} from '@playwright/test';

const answers:Record<string,string>={
  'l73-1a':'87048','l73-1b':'35700','l73-1c':'52','l73-1d':'1475','l73-2':'209',
  'l73-3a':'26','l73-3b':'36','l73-3c':'18','l73-4a':'7900','l73-4b':'8900',
  'l73-5':'40','l73-6':'48','l73-7':'4'
};
async function noHorizontalOverflow(page:Page){return page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+2)}
async function openLesson73(page:Page){await page.goto('/');const chapterThree=page.locator('.course-chapter-group').nth(2);if(!(await chapterThree.evaluate(element=>(element as HTMLDetailsElement).open)))await chapterThree.locator('summary').click();const lessons=page.locator('.course-lesson-grid > button');await expect(lessons.nth(72)).toBeEnabled();await expect(lessons.nth(72)).toHaveClass(/is-control-ready/);await expect(lessons.nth(73)).toBeDisabled();await page.getByRole('button',{name:/Открыть урок 73:/}).click();await page.locator('.lesson-opening-start').click()}
async function fillCurrent(page:Page){const stage=page.locator('.lesson-runtime:not([hidden]) .control-stage');const fields=stage.locator('[data-control-field]');for(let i=0;i<await fields.count();i+=1){const field=fields.nth(i);const id=await field.getAttribute('data-control-field');await field.locator('input').fill(answers[id!]!)}}

test('lesson 73 works on iPad and correction never rewrites the primary score',async({page})=>{
  test.setTimeout(90_000);await openLesson73(page);expect(await noHorizontalOverflow(page)).toBeTruthy();
  const stage=page.locator('.lesson-runtime:not([hidden]) .control-stage[data-stage-id]');
  await page.locator('.lesson-controls .primary').click();
  for(let task=1;task<=7;task+=1){await expect(stage).toHaveAttribute('data-stage-id',`l73-task${task}`);await fillCurrent(page);await page.locator('.lesson-controls .primary').click();expect(await noHorizontalOverflow(page)).toBeTruthy()}
  await page.getByRole('button',{name:'Сдать контрольную работу'}).click();
  await expect(stage).toHaveAttribute('data-stage-id','l73-summary');
  await expect(page.locator('.control-score')).toContainText('12/13');
  await expect(page.locator('.control-review-list .wrong')).toHaveCount(1);
  await page.getByRole('button',{name:'Исправить только ошибки'}).click();
  await expect(stage).toHaveAttribute('data-stage-id','l73-task7');
  await expect(stage.locator('[data-control-field="l73-7"] input')).toBeEnabled();
  await expect(stage.locator('[data-control-field]:not([data-control-field="l73-7"])')).toHaveCount(0);
  await stage.locator('[data-control-field="l73-7"] input').fill('5');
  await expect(stage.locator('.control-answer.correct')).toContainText('Исправлено');
  await page.getByRole('button',{name:'Завершить коррекцию ✓'}).click();
  await expect(stage).toHaveAttribute('data-stage-id','l73-summary');
  await expect(page.locator('.control-score')).toContainText('12/13');
  await expect(page.locator('.control-correction-card')).toContainText('Коррекция завершена');
  await expect(page.locator('.control-review-list')).toContainText('После коррекции: 5');
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('mathnikita-lesson-73-control-v1')??'null'));
  expect(saved?.submittedResponses?.['l73-7']).toBe('4');expect(saved?.responses?.['l73-7']).toBe('5');expect(saved?.correctionCompletedAt).toBeTruthy();
  expect(await noHorizontalOverflow(page)).toBeTruthy();
});
