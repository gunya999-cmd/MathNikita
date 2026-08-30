import { expect,test,type Page } from '@playwright/test';

test.use({viewport:{width:1024,height:1366},userAgent:'Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1'});

const correctResponses:Record<string,string>={
  'l33-1a':'7802','l33-1b':'45403','l33-2a':'5232','l33-2b':'22054','l33-3a':'600','l33-3b':'500',
  'l33-4a':'6 000','l33-4b':'4 000','l33-5a':'60','l33-5b':'500','l33-6a':'200','l33-6b':'44',
  'l33-7a':'575','l33-7b':'235','l33-8a':'48','l33-8b':'30','l33-9a':'60','l33-9b':'9','l33-10a':'5050','l33-10b':'c = 7n + 20',
};

async function openLesson33(page:Page){
  await page.goto('/');
  const chapterTwo=page.locator('.course-chapter-group').nth(1);
  if(!(await chapterTwo.evaluate(element=>(element as HTMLDetailsElement).open)))await chapterTwo.locator('summary').click();
  const lesson33=page.getByRole('button',{name:/Открыть урок 33:/});
  await expect(lesson33).toBeVisible();
  await expect(lesson33).toBeEnabled();
  await expect(lesson33).toHaveClass(/is-control-ready/);
  await lesson33.click();
  await expect(page.locator('.lesson-opening')).toBeVisible();
  await page.locator('.lesson-opening-start').click();
}

async function seedControl(page:Page,responses:Record<string,string>,stageIndex=11){
  await page.evaluate(({responses,stageIndex})=>localStorage.setItem('mathnikita-lesson-33-control-v1',JSON.stringify({version:1,stageIndex,responses,submitted:false,correctionFieldIds:[]})),{responses,stageIndex});
}

test('lesson 33 persists work, submits 20/20 and stays a dedicated control',async({page})=>{
  await openLesson33(page);
  await expect(page.locator('[data-stage-id="l33-rules"]')).toBeVisible();
  await expect(page.getByText('Этап 1 из 13')).toBeVisible();
  await page.locator('.lesson-controls button').last().click();
  const firstTask=page.locator('[data-stage-id="l33-task1"]');
  await expect(firstTask).toBeVisible();
  const inputs=firstTask.locator('input');
  await inputs.nth(0).fill('7802');
  await inputs.nth(1).fill('45403');
  await page.locator('.lesson-controls button').last().click();
  await expect(page.locator('[data-stage-id="l33-task2"]')).toBeVisible();
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('mathnikita-lesson-33-control-v1')??'null'));
  expect(saved?.stageIndex).toBe(2);
  expect(saved?.responses?.['l33-1a']).toBe('7802');

  await page.getByRole('button',{name:/Все уроки/}).click();
  await seedControl(page,correctResponses);
  await page.getByRole('button',{name:/Открыть урок 33:/}).click();
  await page.locator('.lesson-opening-start').click();
  await expect(page.locator('[data-stage-id="l33-submit"]')).toBeVisible();
  await expect(page.getByText('20/20')).toBeVisible();
  await page.getByRole('button',{name:'Сдать контрольную работу'}).click();
  await expect(page.locator('[data-stage-id="l33-summary"]')).toBeVisible();
  await expect(page.locator('.control-score strong')).toHaveText('20/20');
  await expect(page.getByText('Оценка: 5')).toBeVisible();
  await expect(page.getByText('20 из 20 — все навыки подтверждены ✓')).toBeVisible();
  await expect(page.locator('.lesson-reflection')).toHaveCount(0);
  await expect(page.locator('.extended-practice')).toHaveCount(0);
  const completion=await page.evaluate(()=>JSON.parse(localStorage.getItem('mathnikita:lesson-complete:33')??'null'));
  expect(completion?.completedAt).toBeTruthy();
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(2);
});

test('lesson 33 correction fixes only wrong fields without rewriting primary score',async({page})=>{
  await page.goto('/');
  await seedControl(page,{...correctResponses,'l33-1a':'0'});
  await openLesson33(page);
  await expect(page.locator('[data-stage-id="l33-submit"]')).toBeVisible();
  await page.getByRole('button',{name:'Сдать контрольную работу'}).click();
  await expect(page.locator('.control-score strong')).toHaveText('19/20');
  await page.getByRole('button',{name:'Исправить только ошибки'}).click();
  const correction=page.locator('[data-stage-id="l33-task1"]');
  await expect(correction).toBeVisible();
  await expect(correction.locator('input').nth(1)).toBeDisabled();
  await correction.locator('input').nth(0).fill('7802');
  await expect(page.getByText('Исправлено ✓')).toBeVisible();
  await page.getByRole('button',{name:'Завершить коррекцию ✓'}).click();
  await expect(page.locator('.control-score strong')).toHaveText('19/20');
  await expect(page.getByText('Коррекция завершена ✓')).toBeVisible();
});
