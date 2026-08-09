import { expect,test,type Page } from '@playwright/test';

test.use({viewport:{width:1024,height:1366},userAgent:'Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1'});

async function openLesson32(page:Page){
  await page.goto('/');
  const chapterTwo=page.locator('.course-chapter-group').nth(1);
  if(!(await chapterTwo.evaluate(element=>(element as HTMLDetailsElement).open)))await chapterTwo.locator('summary').click();
  const lesson32=page.getByRole('button',{name:/Открыть урок 32:/});
  const lesson33=page.locator('.course-lesson-grid > button').nth(32);
  await expect(lesson32).toBeVisible();
  await expect(lesson32).toBeEnabled();
  await expect(lesson33).toBeDisabled();
  await lesson32.click();
  await expect(page.locator('.lesson-opening')).toBeVisible();
  await page.locator('.lesson-opening-start').click();
}

async function nextStage(page:Page,currentId:string,nextId:string){
  const stage=page.locator(`.lesson-runtime:not([hidden]) .interactive-stage[data-stage-id="${currentId}"]`);
  await expect(stage).toBeVisible();
  await stage.locator('.lesson-controls button').last().click();
  await expect(page.locator(`.lesson-runtime:not([hidden]) .interactive-stage[data-stage-id="${nextId}"]`)).toBeVisible();
}

test('lesson 32 handles formulas, persistence and single 20-task completion gate',async({page})=>{
  await openLesson32(page);
  await expect(page.locator('[data-stage-id="l32-mission"]')).toBeVisible();
  await nextStage(page,'l32-mission','l32-meaning');
  await nextStage(page,'l32-meaning','l32-recognize');

  const recognize=page.locator('[data-stage-id="l32-recognize"]');
  await recognize.getByRole('button',{name:'P = 4a',exact:true}).click();
  await recognize.locator('.check-button').click();
  await expect(recognize.locator('.instant-feedback.good')).toBeVisible();
  await recognize.locator('.lesson-controls button').last().click();
  await expect(page.locator('[data-stage-id="l32-square-model"]')).toBeVisible();

  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('mathnikita-lesson-32-progress-v1')??'null'));
  expect(saved?.stageIndex).toBe(3);
  expect(saved?.results?.['l32-a1']).toBe(true);

  await page.getByRole('button',{name:/Все уроки/}).click();
  const lesson32=page.getByRole('button',{name:/Открыть урок 32:/});
  await lesson32.click();
  await page.locator('.lesson-opening-start').click();
  await expect(page.locator('[data-stage-id="l32-square-model"]')).toBeVisible();

  await page.getByRole('button',{name:/Все уроки/}).click();
  await page.evaluate(()=>localStorage.setItem('mathnikita-lesson-32-progress-v1',JSON.stringify({version:1,stageIndex:27,responses:{},checked:{},results:{}})));
  await lesson32.click();
  await page.locator('.lesson-opening-start').click();
  await expect(page.locator('[data-stage-id="l32-summary"]')).toBeVisible();
  await expect(page.locator('.lesson-reflection')).toBeVisible();
  await expect(page.locator('.extended-practice')).toHaveCount(1);
  await expect(page.locator('.extended-practice[data-practice-task="l32-extra-01"]')).toBeVisible();

  const practice=page.locator('.extended-practice');
  await practice.getByRole('button',{name:'P = 4a',exact:true}).click();
  await practice.locator('.extended-practice-check').click();
  await expect(practice.locator('.extended-practice-feedback.is-correct')).toBeVisible();

  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(2);
});
