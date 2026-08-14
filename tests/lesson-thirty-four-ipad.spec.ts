import { expect,test,type Page } from '@playwright/test';

test.use({viewport:{width:1024,height:1366},userAgent:'Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1'});

async function openLesson34(page:Page){
  await page.goto('/');
  const chapterTwo=page.locator('.course-chapter-group').nth(1);
  if(!(await chapterTwo.evaluate(element=>(element as HTMLDetailsElement).open)))await chapterTwo.locator('summary').click();
  const lesson34=page.getByRole('button',{name:/Открыть урок 34:/});
  await expect(lesson34).toBeVisible();
  await expect(lesson34).toBeEnabled();
  await lesson34.click();
  await expect(page.locator('.lesson-opening')).toBeVisible();
  await page.locator('.lesson-opening-start').click();
}

async function nextStage(page:Page,currentId:string,nextId:string){
  const stage=page.locator(`.lesson-runtime:not([hidden]) .interactive-stage[data-stage-id="${currentId}"]`);
  await expect(stage).toBeVisible();
  await stage.locator('.lesson-controls button').last().click();
  await expect(page.locator(`.lesson-runtime:not([hidden]) .interactive-stage[data-stage-id="${nextId}"]`)).toBeVisible();
}

test('lesson 34 teaches equation roots, persists progress and exposes one mandatory practice gate',async({page})=>{
  await openLesson34(page);
  await expect(page.locator('[data-stage-id="l34-mission"]')).toBeVisible();
  await expect(page.locator('.lesson-runtime:not([hidden]) .lesson-controls')).toContainText('Этап 1 из 28');
  await nextStage(page,'l34-mission','l34-meaning');
  await nextStage(page,'l34-meaning','l34-root-check');

  const rootCheck=page.locator('[data-stage-id="l34-root-check"]');
  await rootCheck.getByRole('button',{name:'4',exact:true}).click();
  await rootCheck.locator('.check-button').click();
  await expect(rootCheck.locator('.instant-feedback.good')).toBeVisible();
  await rootCheck.locator('.lesson-controls button').last().click();
  await expect(page.locator('[data-stage-id="l34-components"]')).toBeVisible();

  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('mathnikita-lesson-34-progress-v1')??'null'));
  expect(saved?.stageIndex).toBe(3);
  expect(saved?.results?.['l34-a1']).toBe(true);

  await page.getByRole('button',{name:/Все уроки/}).click();
  const lesson34=page.getByRole('button',{name:/Открыть урок 34:/});
  await lesson34.click();
  await page.locator('.lesson-opening-start').click();
  await expect(page.locator('[data-stage-id="l34-components"]')).toBeVisible();

  await page.getByRole('button',{name:/Все уроки/}).click();
  await page.evaluate(()=>localStorage.setItem('mathnikita-lesson-34-progress-v1',JSON.stringify({version:1,stageIndex:27,responses:{},checked:{},results:{}})));
  await lesson34.click();
  await page.locator('.lesson-opening-start').click();
  await expect(page.locator('[data-stage-id="l34-summary"]')).toBeVisible();
  await expect(page.locator('.lesson-reflection')).toBeVisible();
  await expect(page.locator('.extended-practice')).toHaveCount(1);
  await expect(page.locator('.extended-practice[data-practice-task="l34-extra-01"]')).toBeVisible();

  const practice=page.locator('.extended-practice');
  await practice.getByRole('button',{name:'x + 8 = 24',exact:true}).click();
  await practice.locator('.extended-practice-check').click();
  await expect(practice.locator('.extended-practice-feedback.is-correct')).toBeVisible();

  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(2);
});