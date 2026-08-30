import {expect,test,type Page} from '@playwright/test';

test.use({viewport:{width:1024,height:1366},userAgent:'Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1'});

async function openLesson39(page:Page){
  await page.goto('/');
  const chapterTwo=page.locator('.course-chapter-group').nth(1);
  if(!(await chapterTwo.evaluate(element=>(element as HTMLDetailsElement).open)))await chapterTwo.locator('summary').click();
  const lesson39=page.getByRole('button',{name:/Открыть урок 39:/});
  const lesson40=page.locator('.course-lesson-grid > button').nth(39);
  await expect(lesson39).toBeVisible();await expect(lesson39).toBeEnabled();await expect(lesson40).toBeEnabled();
  await lesson39.click();await expect(page.locator('.lesson-opening')).toContainText('Виды углов. Измерение углов');await page.locator('.lesson-opening-start').click();
}

async function nextStage(page:Page,currentId:string,nextId:string){
  const stage=page.locator(`.lesson-runtime:not([hidden]) .interactive-stage[data-stage-id="${currentId}"]`);await expect(stage).toBeVisible();await stage.locator('.lesson-controls button').last().click();await expect(page.locator(`.lesson-runtime:not([hidden]) .interactive-stage[data-stage-id="${nextId}"]`)).toBeVisible();
}

test('lesson 39 keeps protractor flow, persistence, summary and mandatory practice stable on iPad',async({page})=>{
  await openLesson39(page);
  await expect(page.locator('[data-stage-id="l39-mission"]')).toBeVisible();
  await expect(page.locator('.lesson-runtime:not([hidden]) .lesson-controls')).toContainText('Этап 1 из 35');
  await expect(page.locator('.lesson-runtime:not([hidden]) .angle-diagram svg')).toBeVisible();
  await nextStage(page,'l39-mission','l39-straight-model');
  await nextStage(page,'l39-straight-model','l39-practice1');
  const practice1=page.locator('[data-stage-id="l39-practice1"]');
  await practice1.getByRole('button',{name:'Два противоположных луча с общим началом',exact:true}).click();await practice1.locator('.check-button').click();await expect(practice1.locator('.instant-feedback.good')).toBeVisible();await practice1.locator('.lesson-controls button').last().click();
  await expect(page.locator('[data-stage-id="l39-degree-model"]')).toBeVisible();
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('mathnikita-lesson-39-progress-v1')??'null'));
  expect(saved?.stageIndex).toBe(3);expect(saved?.results?.['l39-p1']).toBe(true);
  await page.getByRole('button',{name:/Все уроки/}).click();await page.getByRole('button',{name:/Открыть урок 39:/}).click();await page.locator('.lesson-opening-start').click();await expect(page.locator('[data-stage-id="l39-degree-model"]')).toBeVisible();
  await page.evaluate(()=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:39,stageIndex:34}})));
  await expect(page.locator('[data-stage-id="l39-summary"]')).toBeVisible();await expect(page.locator('.lesson-reflection')).toHaveCount(1);await expect(page.locator('.extended-practice')).toHaveCount(1);await expect(page.locator('.extended-practice[data-practice-task="l39-extra-01"]')).toBeVisible();
  const practice=page.locator('.extended-practice');await practice.getByRole('button',{name:'Угол, стороны которого — противоположные лучи',exact:true}).click();await practice.locator('.extended-practice-check').click();await expect(practice.locator('.extended-practice-feedback.is-correct')).toBeVisible();
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);expect(overflow).toBeLessThanOrEqual(2);
});