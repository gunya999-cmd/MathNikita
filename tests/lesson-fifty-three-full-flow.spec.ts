import {expect,test,type Page} from '@playwright/test';

const correctResponses:Record<string,string>={
  'l53-1a':'∠MKC, ∠CKA','l53-1b':'42|32','l53-2a':'44','l53-2b':'52','l53-3':'52',
  'l53-4a':'91','l53-4b':'33','l53-5':'102','l53-6':'68',
};

async function openLesson53(page:Page){
  await page.goto('/');
  const chapterTwo=page.locator('.course-chapter-group').nth(1);
  if(!(await chapterTwo.evaluate(element=>(element as HTMLDetailsElement).open)))await chapterTwo.locator('summary').click();
  await page.getByRole('button',{name:/Открыть урок 53:/}).click();
  await expect(page.locator('.lesson-opening')).toContainText('Уравнение. Угол. Многоугольники');
  await page.locator('.lesson-opening-start').click();
}

async function seedControl(page:Page,responses:Record<string,string>,stageIndex=7){
  await page.evaluate(({responses,stageIndex})=>localStorage.setItem('mathnikita-lesson-53-control-v1',JSON.stringify({version:1,stageIndex,responses,rayAngle:32,rayTouched:true,submitted:false,correctionFieldIds:[]})),{responses,stageIndex});
}

test('lesson 53 completes the exact six-task source variant and submits 9/9',async({page})=>{
  await openLesson53(page);
  const control=page.locator('[data-control-work="3"]');
  await expect(control).toHaveAttribute('data-source-reference',/вариант 1 · страница 274/);
  await expect(page.locator('[data-stage-id="l53-rules"]')).toContainText('6 заданий · 9 оцениваемых ответов');
  await expect(page.locator('.control-page-jump button')).toHaveCount(9);
  await expect(page.locator('.cat-mentor,.progressive-hint-coach,.instant-feedback')).toHaveCount(0);

  await page.locator('.lesson-controls .primary').click();
  const task1=page.locator('[data-stage-id="l53-task1"]');
  await expect(task1).toContainText('градусная мера которого равна 74°');
  const construction=task1.locator('[data-source-control="3-1"]');
  await construction.getByRole('slider',{name:'Положение луча KC'}).press('ArrowRight');
  await expect(construction).toHaveAttribute('data-angle-mkc','42');
  await expect(construction).toHaveAttribute('data-angle-cka','32');
  await task1.locator('#l53-1a').fill('∠MKC, ∠CKA');
  await task1.locator('#l53-1b-mkc').fill('42');
  await task1.locator('#l53-1b-cka').fill('32');
  await page.locator('.lesson-controls .primary').click();

  const task2=page.locator('[data-stage-id="l53-task2"]');
  await expect(task2).toContainText('x + 37 = 81');
  await task2.locator('#l53-2a').fill('44');await task2.locator('#l53-2b').fill('52');await page.locator('.lesson-controls .primary').click();
  const task3=page.locator('[data-stage-id="l53-task3"]');
  await expect(task3).toContainText('в 4 раза короче');await expect(task3.locator('[data-triangle-condition]')).toHaveAttribute('data-triangle-condition','24|quarter|plus16');
  await task3.locator('#l53-3').fill('52');await page.locator('.lesson-controls .primary').click();
  const task4=page.locator('[data-stage-id="l53-task4"]');
  await task4.locator('#l53-4a').fill('91');await task4.locator('#l53-4b').fill('33');await page.locator('.lesson-controls .primary').click();
  const task5=page.locator('[data-stage-id="l53-task5"]');
  const figure21=task5.locator('[data-source-figure="21"]');
  await expect(figure21).toHaveAttribute('data-angle-abe','154');await expect(figure21).toHaveAttribute('data-angle-dbc','128');await expect(figure21).toHaveAttribute('data-angle-dbe','102');
  await task5.locator('#l53-5').fill('102');await page.locator('.lesson-controls .primary').click();
  const task6=page.locator('[data-stage-id="l53-task6"]');
  await expect(task6).toContainText('52 − (a − x) = 24');await task6.locator('#l53-6').fill('68');await page.locator('.lesson-controls .primary').click();

  const submit=page.locator('[data-stage-id="l53-submit"]');
  await expect(submit).toContainText('9/9');await submit.getByRole('button',{name:'Сдать контрольную работу'}).click();
  await expect(page.locator('[data-stage-id="l53-summary"] .control-score strong')).toHaveText('9/9');
  await expect(page.getByText('Оценка: 5')).toBeVisible();
  await expect(page.getByText('9 из 9 — все умения подтверждены ✓')).toBeVisible();
  await expect(page.locator('.control-review-list section')).toHaveCount(9);
  await expect(page.locator('.lesson-reflection,.extended-practice,.cat-mentor,.progressive-hint-coach')).toHaveCount(0);
  const completion=await page.evaluate(()=>JSON.parse(localStorage.getItem('mathnikita:lesson-complete:53')??'null'));
  expect(completion?.completedAt).toBeTruthy();expect(typeof completion?.activeSeconds).toBe('number');
});

test('lesson 53 correction unlocks only mistakes and preserves the primary score',async({page})=>{
  await page.goto('/');await seedControl(page,{...correctResponses,'l53-2a':'0'});
  const chapterTwo=page.locator('.course-chapter-group').nth(1);if(!(await chapterTwo.evaluate(element=>(element as HTMLDetailsElement).open)))await chapterTwo.locator('summary').click();
  await page.getByRole('button',{name:/Открыть урок 53:/}).click();await page.locator('.lesson-opening-start').click();
  await expect(page.locator('[data-stage-id="l53-submit"]')).toBeVisible();await page.getByRole('button',{name:'Сдать контрольную работу'}).click();
  await expect(page.locator('.control-score strong')).toHaveText('8/9');await page.getByRole('button',{name:'Исправить только ошибки'}).click();
  const correction=page.locator('[data-stage-id="l53-task2"]');await expect(correction).toBeVisible();await expect(correction.locator('#l53-2b')).toBeDisabled();
  await correction.locator('#l53-2a').fill('44');await expect(correction.getByText('Исправлено ✓')).toBeVisible();
  await page.getByRole('button',{name:'Завершить коррекцию ✓'}).click();
  await expect(page.locator('.control-score strong')).toHaveText('8/9');await expect(page.getByText('Коррекция завершена ✓')).toBeVisible();
});
