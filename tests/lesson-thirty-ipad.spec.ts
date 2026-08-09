import { expect,test,type Page } from '@playwright/test';

test.use({viewport:{width:1024,height:1366},userAgent:'Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1'});

async function openLesson30(page:Page){
  await page.goto('/');
  const chapterTwo=page.locator('.course-chapter-group').nth(1);
  const isOpen=await chapterTwo.evaluate(element=>(element as HTMLDetailsElement).open);
  if(!isOpen)await chapterTwo.locator('summary').click();
  const lesson30=page.getByRole('button',{name:/Открыть урок 30:/});
  const lesson31=page.locator('.course-lesson-grid > button').nth(30);
  await expect(lesson30).toBeVisible();
  await expect(lesson30).toBeEnabled();
  await expect(lesson31).toBeDisabled();
  await lesson30.click();
  await expect(page.locator('.lesson-opening')).toBeVisible();
  await page.locator('.lesson-opening-start').click();
}

async function nextStage(page:Page,currentId:string,nextId:string){
  const stage=page.locator(`.lesson-runtime:not([hidden]) .interactive-stage[data-stage-id="${currentId}"]`);
  await expect(stage).toBeVisible();
  await stage.locator('.lesson-controls button').last().click();
  await expect(page.locator(`.lesson-runtime:not([hidden]) .interactive-stage[data-stage-id="${nextId}"]`)).toBeVisible();
}

test('lesson 30 opens, checks choices, persists stage and exposes one 20-task completion practice',async({page})=>{
  await openLesson30(page);
  await expect(page.locator('[data-stage-id="l30-mission"]')).toBeVisible();
  await nextStage(page,'l30-mission','l30-number-expression');
  await nextStage(page,'l30-number-expression','l30-number-choice');

  const choiceStage=page.locator('[data-stage-id="l30-number-choice"]');
  await choiceStage.getByRole('button',{name:'(27 + 16) · 5',exact:true}).click();
  await choiceStage.locator('.check-button').click();
  await expect(choiceStage.locator('.instant-feedback.good')).toBeVisible();
  await choiceStage.locator('.lesson-controls button').last().click();
  await expect(page.locator('[data-stage-id="l30-value"]')).toBeVisible();

  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('mathnikita-lesson-30-progress-v1')??'null'));
  expect(saved?.stageIndex).toBe(3);
  expect(saved?.results?.['l30-a1']).toBe(true);

  await page.getByRole('button',{name:/Все уроки/}).click();
  const lesson30=page.getByRole('button',{name:/Открыть урок 30:/});
  await expect(lesson30).toBeVisible();
  await lesson30.click();
  await page.locator('.lesson-opening-start').click();
  await expect(page.locator('[data-stage-id="l30-value"]')).toBeVisible();

  await page.getByRole('button',{name:/Все уроки/}).click();
  await page.evaluate(()=>localStorage.setItem('mathnikita-lesson-30-progress-v1',JSON.stringify({version:1,stageIndex:27,responses:{},checked:{},results:{}})));
  await expect(lesson30).toBeVisible();
  await lesson30.click();
  await page.locator('.lesson-opening-start').click();
  await expect(page.locator('[data-stage-id="l30-summary"]')).toBeVisible();
  const reflection=page.locator('.lesson-reflection');
  await expect(reflection).toBeVisible();
  await expect(reflection.locator('.extended-practice[data-practice-task="l30-extra-01"]')).toBeVisible();
  await expect(page.locator('.extended-practice')).toHaveCount(1);

  const practice=reflection.locator('.extended-practice');
  await practice.getByRole('button',{name:'(27 + 16) · 5',exact:true}).click();
  await practice.locator('.extended-practice-check').click();
  await expect(practice.locator('.extended-practice-feedback.is-correct')).toBeVisible();

  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(2);
});
