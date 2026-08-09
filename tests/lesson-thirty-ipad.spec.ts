import { expect,test } from '@playwright/test';

test.use({viewport:{width:1024,height:1366},userAgent:'Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1'});

test('lesson 30 opens, checks choices, persists stage and exposes 20-task practice',async({page})=>{
  await page.goto('/');
  const lesson30=page.locator('.course-lesson-grid > button').nth(29);
  const lesson31=page.locator('.course-lesson-grid > button').nth(30);
  await expect(lesson30).toBeEnabled();
  await expect(lesson31).toBeDisabled();

  const chapterTwo=page.locator('.course-chapter-group').nth(1);
  const chapterTwoOpen=await chapterTwo.evaluate(element=>(element as HTMLDetailsElement).open);
  if(!chapterTwoOpen)await chapterTwo.locator('summary').click();
  await expect(lesson30).toBeVisible();
  await lesson30.click();
  await expect(page.getByRole('heading',{name:'Числовые и буквенные выражения. Формулы'}).first()).toBeVisible();
  await page.locator('.lesson-opening-start').click();
  await expect(page.getByRole('heading',{name:'Одна запись — много задач'})).toBeVisible();

  await page.locator('.lesson-controls button').filter({hasText:'Дальше'}).click();
  await expect(page.getByRole('heading',{name:'Что такое числовое выражение'})).toBeVisible();
  await page.locator('.lesson-controls button').filter({hasText:'Дальше'}).click();
  await expect(page.getByRole('heading',{name:'Узнай числовое выражение'})).toBeVisible();

  await page.getByRole('button',{name:'(27 + 16) · 5',exact:true}).click();
  await page.locator('.activity-area .check-button').click();
  await expect(page.locator('.instant-feedback.good')).toContainText('Верно!');
  await page.locator('.lesson-controls button').filter({hasText:'Дальше'}).click();
  await expect(page.getByRole('heading',{name:'Значение выражения'})).toBeVisible();

  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('mathnikita-lesson-30-progress-v1')??'null'));
  expect(saved.stageIndex).toBe(3);
  expect(saved.results['l30-a1']).toBe(true);

  await page.getByRole('button',{name:/Все уроки/}).click();
  await expect(lesson30).toBeVisible();
  await lesson30.click();
  await page.locator('.lesson-opening-start').click();
  await expect(page.getByRole('heading',{name:'Значение выражения'})).toBeVisible();

  await page.getByRole('button',{name:/Все уроки/}).click();
  await page.evaluate(()=>localStorage.setItem('mathnikita-lesson-30-progress-v1',JSON.stringify({version:1,stageIndex:27,responses:{},checked:{},results:{}})));
  await expect(lesson30).toBeVisible();
  await lesson30.click();
  await page.locator('.lesson-opening-start').click();
  await expect(page.getByRole('heading',{name:'Ты начал говорить на языке формул'})).toBeVisible();
  await expect(page.getByText(/Обязательная практика · 20 заданий/)).toBeVisible();
  await expect(page.locator('.extended-practice')).toHaveAttribute('data-practice-task','l30-extra-01');

  await page.locator('.extended-practice-options button').filter({hasText:'(27 + 16) · 5'}).click();
  await page.locator('.extended-practice-check').click();
  await expect(page.locator('.extended-practice-feedback.is-correct')).toContainText('Верно!');

  const noHorizontalOverflow=await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1);
  expect(noHorizontalOverflow).toBe(true);
});
