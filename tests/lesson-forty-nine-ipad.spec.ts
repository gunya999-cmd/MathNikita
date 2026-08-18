import {expect,test,type Page} from '@playwright/test';

test.use({viewport:{width:1024,height:1366},userAgent:'Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1'});

async function openLesson49(page:Page){
  await page.goto('/');
  const chapterTwo=page.locator('.course-chapter-group').nth(1);
  if(!(await chapterTwo.evaluate(element=>(element as HTMLDetailsElement).open)))await chapterTwo.locator('summary').click();
  const lesson49=page.getByRole('button',{name:/Открыть урок 49:/});
  const lesson50=page.locator('.course-lesson-grid > button').nth(49);
  const lesson51=page.locator('.course-lesson-grid > button').nth(50);
  await expect(lesson49).toBeEnabled();
  await expect(lesson50).toBeEnabled();
  await expect(lesson51).toBeDisabled();
  await lesson49.click();
  await page.locator('.lesson-opening-start').click();
}

async function jump(page:Page,index:number,id:string){
  await page.evaluate(({index})=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:49,stageIndex:index}})),{index});
  await expect(page.locator(`[data-stage-id="${id}"]`)).toBeVisible();
}

test('lesson 49 keeps exact rectangle geometry, symmetry, retry gates and persistence stable on iPad',async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('mathnikita-mentor-auto-guide','false'));
  await openLesson49(page);
  await expect(page.locator('[data-stage-id="l49-mission"] .lesson-controls')).toContainText('Этап 1 из 36');

  await jump(page,4,'l49-right-markers');
  const rightAngles=page.locator('[data-stage-id="l49-right-markers"] .rectangle-symmetry-diagram');
  await expect(rightAngles).toHaveAttribute('data-right-angle-count','4');
  await expect(rightAngles.locator('[data-right-angle-marker]')).toHaveCount(4);

  await jump(page,6,'l49-opposite-properties');
  const opposite=page.locator('[data-stage-id="l49-opposite-properties"] .rectangle-symmetry-diagram');
  await expect(opposite).toHaveAttribute('data-width-value','8 см');
  await expect(opposite).toHaveAttribute('data-height-value','5 см');
  await expect(opposite).toHaveAttribute('data-opposite-side-pairs','AB=CD|BC=AD');
  await expect(opposite.locator('[data-equal-side-mark="horizontal"]')).toHaveCount(2);
  await expect(opposite.locator('[data-equal-side-mark="vertical"]')).toHaveCount(2);

  await jump(page,25,'l49-rectangle-axis-vertical');
  const vertical=page.locator('[data-stage-id="l49-rectangle-axis-vertical"] .rectangle-symmetry-diagram');
  await expect(vertical).toHaveAttribute('data-axis-kind','vertical');
  await expect(vertical).toHaveAttribute('data-axis-count','1');
  await expect(vertical.locator('[data-symmetry-axis]')).toHaveCount(1);

  await jump(page,27,'l49-diagonal-gate');
  const rejected=page.locator('[data-stage-id="l49-diagonal-gate"] .rectangle-symmetry-diagram');
  await expect(rejected).toHaveAttribute('data-axis-count','0');
  await expect(rejected).toHaveAttribute('data-theoretical-axis-count','2');
  await expect(rejected.locator('[data-invalid-axis]')).toHaveCount(2);
  await expect(rejected.locator('[data-axis-rejected="true"]')).toHaveCount(1);

  await jump(page,28,'l49-square-axes');
  const square=page.locator('[data-stage-id="l49-square-axes"] .rectangle-symmetry-diagram');
  await expect(square).toHaveAttribute('data-shape','square');
  await expect(square).toHaveAttribute('data-axis-count','4');
  await expect(square.locator('[data-symmetry-axis]')).toHaveCount(4);

  await jump(page,31,'l49-source364-polygons');
  const polygons=page.locator('[data-stage-id="l49-source364-polygons"] [data-polygon-axis-count]');
  await expect(polygons).toHaveCount(3);
  await expect(polygons.nth(0)).toHaveAttribute('data-polygon-axis-count','2');
  await expect(polygons.nth(1)).toHaveAttribute('data-polygon-axis-count','1');
  await expect(polygons.nth(2)).toHaveAttribute('data-polygon-axis-count','6');

  await jump(page,1,'l49-quad-recall');
  const retry=page.locator('[data-stage-id="l49-quad-recall"]');
  for(let attempt=0;attempt<2;attempt+=1){
    await retry.getByRole('button',{name:'Треугольник',exact:true}).click();
    await retry.locator('.check-button').click();
    await expect(retry.locator('.instant-feedback.bad')).toBeVisible();
  }
  await expect(retry.locator('.lesson-controls .primary')).toBeEnabled();
  await expect(retry.locator('.instant-feedback.bad')).toContainText('Можно перейти дальше');

  await jump(page,20,'l49-source361-rectangle');
  const textbook=page.locator('[data-stage-id="l49-source361-rectangle"]');
  await textbook.locator('.inline-answer input').fill('130 см');
  await textbook.locator('.check-button').click();
  await expect(textbook.locator('.instant-feedback.good')).toBeVisible();
  await textbook.locator('.inline-answer input').fill('131');
  await expect(textbook.locator('.instant-feedback')).toHaveCount(0);
  await expect(textbook.locator('.lesson-controls .primary')).toBeDisabled();
  await expect.poll(async()=>page.evaluate(()=>JSON.parse(localStorage.getItem('mathnikita-lesson-49-progress-v1')??'null')?.results?.['l49-p13'])).toBe(false);
  await textbook.locator('.inline-answer input').fill('130');
  await textbook.locator('.check-button').click();
  await expect(textbook.locator('.instant-feedback.good')).toBeVisible();
  await textbook.locator('.lesson-controls .primary').click();

  await page.getByRole('button',{name:/Все уроки/}).click();
  await page.getByRole('button',{name:/Открыть урок 49:/}).click();
  await page.locator('.lesson-opening-start').click();
  await expect(page.locator('[data-stage-id="l49-source361-square"]')).toBeVisible();
  const collapsed=page.locator('.cat-mentor-collapsed');
  await expect(collapsed).toBeVisible();
  await collapsed.click();
  await expect(page.locator('.cat-mentor-actions button')).toHaveCount(4);

  await jump(page,35,'l49-summary');
  await expect(page.locator('.lesson-reflection')).toBeVisible();
  await expect(page.locator('.extended-practice[data-practice-task="l49-extra-01"]')).toBeVisible();
  await expect(page.locator('.practice-pythagoras-actions button')).toHaveCount(4);
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(2);
});
