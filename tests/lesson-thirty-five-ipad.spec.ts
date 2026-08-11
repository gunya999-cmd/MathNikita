import { expect,test,type Page } from '@playwright/test';

test.use({viewport:{width:1024,height:1366},userAgent:'Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1'});

async function openLesson35(page:Page){
  await page.goto('/');
  const chapterTwo=page.locator('.course-chapter-group').nth(1);
  if(!(await chapterTwo.evaluate(element=>(element as HTMLDetailsElement).open)))await chapterTwo.locator('summary').click();
  const lesson35=page.getByRole('button',{name:/Открыть урок 35:/});
  const lesson36=page.locator('.course-lesson-grid > button').nth(35);
  await expect(lesson35).toBeVisible();
  await expect(lesson35).toBeEnabled();
  await expect(lesson36).toBeDisabled();
  await lesson35.click();
  await expect(page.locator('.lesson-opening')).toContainText('Уравнения: сначала упростить, потом найти неизвестное');
  await page.locator('.lesson-opening-start').click();
}

async function nextStage(page:Page,currentId:string,nextId:string){
  const stage=page.locator(`.lesson-runtime:not([hidden]) .interactive-stage[data-stage-id="${currentId}"]`);
  await expect(stage).toBeVisible();
  await stage.locator('.lesson-controls button').last().click();
  await expect(page.locator(`.lesson-runtime:not([hidden]) .interactive-stage[data-stage-id="${nextId}"]`)).toBeVisible();
}

test('lesson 35 deepens equation solving, persists progress and exposes one 20-task practice gate',async({page})=>{
  await openLesson35(page);
  await expect(page.locator('[data-stage-id="l35-mission"]')).toBeVisible();
  await expect(page.locator('.lesson-runtime:not([hidden]) .lesson-controls')).toContainText('Этап 1 из 28');
  await nextStage(page,'l35-mission','l35-recap');
  await nextStage(page,'l35-recap','l35-known-side');
  await nextStage(page,'l35-known-side','l35-practice1');

  const practice1=page.locator('[data-stage-id="l35-practice1"]');
  await practice1.locator('input').fill('40');
  await practice1.locator('.check-button').click();
  await expect(practice1.locator('.instant-feedback.good')).toBeVisible();
  await practice1.locator('.lesson-controls button').last().click();
  await expect(page.locator('[data-stage-id="l35-minuend-model"]')).toBeVisible();

  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('mathnikita-lesson-35-progress-v1')??'null'));
  expect(saved?.stageIndex).toBe(4);
  expect(saved?.results?.['l35-p1']).toBe(true);

  await page.getByRole('button',{name:/Все уроки/}).click();
  await page.getByRole('button',{name:/Открыть урок 35:/}).click();
  await page.locator('.lesson-opening-start').click();
  await expect(page.locator('[data-stage-id="l35-minuend-model"]')).toBeVisible();

  await page.evaluate(()=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:35,stageIndex:27}})));
  await expect(page.locator('[data-stage-id="l35-summary"]')).toBeVisible();
  await expect(page.locator('.lesson-reflection')).toHaveCount(1);
  await expect(page.locator('.extended-practice')).toHaveCount(1);
  await expect(page.locator('.extended-practice[data-practice-task="l35-extra-01"]')).toBeVisible();

  const practice=page.locator('.extended-practice');
  await practice.locator('.extended-practice-input input').fill('40');
  await practice.locator('.extended-practice-check').click();
  await expect(practice.locator('.extended-practice-feedback.is-correct')).toBeVisible();

  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(2);
});
