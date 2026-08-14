import { expect,test,type Page } from '@playwright/test';

test.use({viewport:{width:1024,height:1366},userAgent:'Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1'});

async function openLesson36(page:Page){
  await page.goto('/');
  const chapterTwo=page.locator('.course-chapter-group').nth(1);
  if(!(await chapterTwo.evaluate(element=>(element as HTMLDetailsElement).open)))await chapterTwo.locator('summary').click();
  const lesson36=page.getByRole('button',{name:/Открыть урок 36:/});
  await expect(lesson36).toBeVisible();
  await expect(lesson36).toBeEnabled();
  await lesson36.click();
  await expect(page.locator('.lesson-opening')).toContainText('Уравнение: итоговая мастерская');
  await page.locator('.lesson-opening-start').click();
}

async function nextStage(page:Page,currentId:string,nextId:string){
  const stage=page.locator(`.lesson-runtime:not([hidden]) .interactive-stage[data-stage-id="${currentId}"]`);
  await expect(stage).toBeVisible();
  await stage.locator('.lesson-controls button').last().click();
  await expect(page.locator(`.lesson-runtime:not([hidden]) .interactive-stage[data-stage-id="${nextId}"]`)).toBeVisible();
}

test('lesson 36 closes equation mastery, persists progress and exposes one 20-task practice gate',async({page})=>{
  await openLesson36(page);
  await expect(page.locator('[data-stage-id="l36-mission"]')).toBeVisible();
  await expect(page.locator('.lesson-runtime:not([hidden]) .lesson-controls')).toContainText('Этап 1 из 30');
  await nextStage(page,'l36-mission','l36-map');
  await nextStage(page,'l36-map','l36-mixed-model');
  await nextStage(page,'l36-mixed-model','l36-practice1');

  const practice1=page.locator('[data-stage-id="l36-practice1"]');
  await practice1.locator('input').fill('35');
  await practice1.locator('.check-button').click();
  await expect(practice1.locator('.instant-feedback.good')).toBeVisible();
  await practice1.locator('.lesson-controls button').last().click();
  await expect(page.locator('[data-stage-id="l36-practice2"]')).toBeVisible();

  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('mathnikita-lesson-36-progress-v1')??'null'));
  expect(saved?.stageIndex).toBe(4);
  expect(saved?.results?.['l36-p1']).toBe(true);

  await page.getByRole('button',{name:/Все уроки/}).click();
  await page.getByRole('button',{name:/Открыть урок 36:/}).click();
  await page.locator('.lesson-opening-start').click();
  await expect(page.locator('[data-stage-id="l36-practice2"]')).toBeVisible();

  await page.evaluate(()=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:36,stageIndex:29}})));
  await expect(page.locator('[data-stage-id="l36-summary"]')).toBeVisible();
  await expect(page.locator('.lesson-reflection')).toHaveCount(1);
  await expect(page.locator('.extended-practice')).toHaveCount(1);
  await expect(page.locator('.extended-practice[data-practice-task="l36-extra-01"]')).toBeVisible();

  const practice=page.locator('.extended-practice');
  await practice.locator('.extended-practice-input input').fill('53');
  await practice.locator('.extended-practice-check').click();
  await expect(practice.locator('.extended-practice-feedback.is-correct')).toBeVisible();

  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(2);
});
