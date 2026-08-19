import {expect,test,type Page} from '@playwright/test';

test.use({viewport:{width:1024,height:1366},userAgent:'Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1'});

async function openLesson50(page:Page){
  await page.goto('/');
  const chapterTwo=page.locator('.course-chapter-group').nth(1);
  if(!(await chapterTwo.evaluate(element=>(element as HTMLDetailsElement).open)))await chapterTwo.locator('summary').click();
  const lesson50=page.getByRole('button',{name:/Открыть урок 50:/});
  const lesson51=page.locator('.course-lesson-grid > button').nth(50);
  const lesson52=page.locator('.course-lesson-grid > button').nth(51);
  await expect(lesson50).toBeEnabled();
  await expect(lesson51).toBeEnabled();
  await expect(lesson52).toBeDisabled();
  await lesson50.click();
  await page.locator('.lesson-opening-start').click();
}

async function jump(page:Page,index:number,id:string){
  await page.evaluate(({index})=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:50,stageIndex:index}})),{index});
  await expect(page.locator(`[data-stage-id="${id}"]`)).toBeVisible();
}

test('lesson 50 keeps exact figures 137-139 and 220, retry gates and persistence stable on iPad',async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('mathnikita-mentor-auto-guide','false'));
  await openLesson50(page);
  await expect(page.locator('[data-stage-id="l50-mission"] .lesson-controls')).toContainText('Этап 1 из 36');

  await jump(page,12,'l50-source369-a');
  const figure137a=page.locator('[data-stage-id="l50-source369-a"] [data-figure="137-a"]');
  await expect(figure137a).toHaveAttribute('data-total-squares','14');
  await expect(figure137a).toHaveAttribute('data-count-breakdown','9+4+1');
  await expect(figure137a.locator('[data-count-layer="3x3"]')).toHaveCount(1);

  await jump(page,14,'l50-source369-b');
  const figure137b=page.locator('[data-stage-id="l50-source369-b"] [data-figure="137-b"]');
  await expect(figure137b).toHaveAttribute('data-total-squares','13');
  await expect(figure137b).toHaveAttribute('data-count-breakdown','1+4+4+4');
  await expect(figure137b.locator('[data-count-layer]')).toHaveCount(4);

  await jump(page,16,'l50-wire-model');
  const wire=page.locator('[data-stage-id="l50-wire-model"] [data-diagram-kind="wire"]');
  await expect(wire).toHaveAttribute('data-total-length','20');
  await expect(wire.locator('[data-wire-side]')).toHaveCount(5);
  await expect(wire.locator('[data-wire-side="6"]')).toHaveCount(1);
  await expect(wire.locator('[data-wire-side="2"]')).toHaveCount(1);

  await jump(page,23,'l50-source371-model');
  const figure139=page.locator('[data-stage-id="l50-source371-model"] [data-source-figure="139"]');
  await expect(figure139).toHaveAttribute('data-smallest-square','4');
  await expect(figure139).toHaveAttribute('data-rectangle-width','28');
  await expect(figure139).toHaveAttribute('data-rectangle-height','19');
  await expect(figure139).toHaveAttribute('data-square-tile-count','9');

  await jump(page,25,'l50-workbook164');
  const workbookMosaic=page.locator('[data-stage-id="l50-workbook164"] [data-source-exercise="РТ №164"]');
  await expect(workbookMosaic).toHaveAttribute('data-shaded-square-side','8');
  await expect(workbookMosaic).toHaveAttribute('data-small-square-side','6');
  await expect(workbookMosaic).toHaveAttribute('data-largest-square','18');
  await expect(workbookMosaic).toHaveAttribute('data-square-tile-count','7');

  await jump(page,26,'l50-source372-model');
  const partitions=page.locator('[data-stage-id="l50-source372-model"] [data-source-exercise="№372"]');
  await expect(partitions).toHaveAttribute('data-solution-count','2');
  await expect(partitions).toHaveAttribute('data-result-perimeters','10|14');

  await jump(page,32,'l50-source374-model');
  const dissection=page.locator('[data-stage-id="l50-source374-model"] [data-source-figure="220"]');
  await expect(dissection).toHaveAttribute('data-cut-kind','both-diagonals');
  await expect(dissection).toHaveAttribute('data-piece-count','4');
  await expect(dissection).toHaveAttribute('data-result-square-count','2');
  await expect(dissection.locator('[data-cut-line]')).toHaveCount(2);

  await jump(page,2,'l50-workbook158-half');
  const retry=page.locator('[data-stage-id="l50-workbook158-half"]');
  for(let attempt=0;attempt<2;attempt+=1){
    await retry.locator('.inline-answer input').fill('12');
    await retry.locator('.check-button').click();
    await expect(retry.locator('.instant-feedback.bad')).toBeVisible();
  }
  await expect(retry.locator('.lesson-controls .primary')).toBeEnabled();
  await expect(retry.locator('.instant-feedback.bad')).toContainText('Можно перейти дальше');

  await jump(page,24,'l50-source371-sides');
  const source371=page.locator('[data-stage-id="l50-source371-sides"]');
  await source371.locator('.inline-answer input').fill('28,19');
  await source371.locator('.check-button').click();
  await expect(source371.locator('.instant-feedback.good')).toBeVisible();
  await source371.locator('.inline-answer input').fill('28,20');
  await expect(source371.locator('.instant-feedback')).toHaveCount(0);
  await expect(source371.locator('.lesson-controls .primary')).toBeDisabled();
  await expect.poll(async()=>page.evaluate(()=>JSON.parse(localStorage.getItem('mathnikita-lesson-50-progress-v1')??'null')?.results?.['l50-p17'])).toBe(false);
  await source371.locator('.inline-answer input').fill('19 и 28');
  await source371.locator('.check-button').click();
  await expect(source371.locator('.instant-feedback.good')).toBeVisible();
  await source371.locator('.lesson-controls .primary').click();

  await page.getByRole('button',{name:/Все уроки/}).click();
  await page.getByRole('button',{name:/Открыть урок 50:/}).click();
  await page.locator('.lesson-opening-start').click();
  await expect(page.locator('[data-stage-id="l50-workbook164"]')).toBeVisible();
  const collapsed=page.locator('.cat-mentor-collapsed');
  await expect(collapsed).toBeVisible();
  await collapsed.click();
  await expect(page.locator('.cat-mentor-actions button')).toHaveCount(4);

  await jump(page,35,'l50-summary');
  await expect(page.locator('.lesson-reflection')).toBeVisible();
  await expect(page.locator('.extended-practice[data-practice-task="l50-extra-01"]')).toBeVisible();
  await expect(page.locator('.practice-pythagoras-actions button')).toHaveCount(4);
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(2);
});
