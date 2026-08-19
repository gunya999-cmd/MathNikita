import {expect,test,type Page} from '@playwright/test';

test.use({viewport:{width:1024,height:1366},userAgent:'Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1'});

async function openLesson51(page:Page){
  await page.goto('/');
  const chapterTwo=page.locator('.course-chapter-group').nth(1);
  if(!(await chapterTwo.evaluate(element=>(element as HTMLDetailsElement).open)))await chapterTwo.locator('summary').click();
  const lesson51=page.getByRole('button',{name:/Открыть урок 51:/});
  const lesson52=page.locator('.course-lesson-grid > button').nth(51);
  await expect(lesson51).toBeEnabled();await expect(lesson52).toBeDisabled();
  await lesson51.click();await page.locator('.lesson-opening-start').click();
}
async function jump(page:Page,index:number,id:string){await page.evaluate(({index})=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:51,stageIndex:index}})),{index});await expect(page.locator(`[data-stage-id="${id}"]`)).toBeVisible()}

test('lesson 51 keeps exact source figures, retry gates and persistence stable on iPad',async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('mathnikita-mentor-auto-guide','false'));
  await openLesson51(page);
  await expect(page.locator('[data-stage-id="l51-mission"] .lesson-controls')).toContainText('Этап 1 из 36');

  await jump(page,2,'l51-source375-model');
  const source375=page.locator('[data-source-exercise="№375"]');
  await expect(source375).toHaveAttribute('data-piece-count','4');await expect(source375).toHaveAttribute('data-result-shape','square');

  await jump(page,5,'l51-source376-model');
  const figure221=page.locator('[data-source-figure="221"]');
  await expect(figure221).toHaveAttribute('data-original-width','8');await expect(figure221).toHaveAttribute('data-original-height','4');await expect(figure221).toHaveAttribute('data-piece-count','4');

  await jump(page,9,'l51-source377-model');
  const figure222=page.locator('[data-source-figure="222"]');
  await expect(figure222).toHaveAttribute('data-piece-types','triangle|quadrilateral');await expect(figure222).toHaveAttribute('data-result-shape','triangle');

  await jump(page,12,'l51-source378-model');
  const figure223=page.locator('[data-source-figure="223"]');
  await expect(figure223).toHaveAttribute('data-cut-segments','3|2|3');await expect(figure223).toHaveAttribute('data-result-width','9');await expect(figure223).toHaveAttribute('data-result-height','4');

  await jump(page,17,'l51-workbook161-model');
  await expect(page.locator('[data-source-exercise="РТ №161"]')).toHaveAttribute('data-source-item-count','8');
  await jump(page,20,'l51-workbook162-model');
  const park=page.locator('[data-source-exercise="РТ №162"]');await expect(park).toHaveAttribute('data-lake-perimeter','120');await expect(park).toHaveAttribute('data-garden-perimeter','200');await expect(park).toHaveAttribute('data-playground-perimeter','160');
  await jump(page,24,'l51-workbook165-model');
  const dots=page.locator('[data-source-exercise="РТ №165"]');await expect(dots).toHaveAttribute('data-grid-count','3');await expect(dots).toHaveAttribute('data-dots-per-grid','4');await expect(dots.locator('circle')).toHaveCount(12);
  await jump(page,26,'l51-workbook166-model');
  const diagonal=page.locator('[data-source-exercise="РТ №166"]');await expect(diagonal).toHaveAttribute('data-diagonal-vector','4|2');await expect(diagonal).toHaveAttribute('data-missing-vertices','3|5;5|1');
  await jump(page,28,'l51-source379-model');
  const intersection=page.locator('[data-source-exercise="№379"]');await expect(intersection).toHaveAttribute('data-ray-intersects-segment','true');await expect(intersection).toHaveAttribute('data-line-intersects-segment','false');

  await jump(page,3,'l51-source375-pieces');const retry=page.locator('[data-stage-id="l51-source375-pieces"]');
  for(let attempt=0;attempt<2;attempt+=1){await retry.locator('.inline-answer input').fill('3');await retry.locator('.check-button').click();await expect(retry.locator('.instant-feedback.bad')).toBeVisible()}
  await expect(retry.locator('.lesson-controls .primary')).toBeEnabled();await expect(retry.locator('.instant-feedback.bad')).toContainText('Можно перейти дальше');

  await jump(page,23,'l51-workbook162-playground');const playground=page.locator('[data-stage-id="l51-workbook162-playground"]');
  await playground.locator('.inline-answer input').fill('160');await playground.locator('.check-button').click();await expect(playground.locator('.instant-feedback.good')).toBeVisible();
  await playground.locator('.inline-answer input').fill('161');await expect(playground.locator('.instant-feedback')).toHaveCount(0);await expect(playground.locator('.lesson-controls .primary')).toBeDisabled();
  await expect.poll(async()=>page.evaluate(()=>JSON.parse(localStorage.getItem('mathnikita-lesson-51-progress-v1')??'null')?.results?.['l51-p15'])).toBe(false);
  await playground.locator('.inline-answer input').fill('160');await playground.locator('.check-button').click();await playground.locator('.lesson-controls .primary').click();
  await page.getByRole('button',{name:/Все уроки/}).click();await page.getByRole('button',{name:/Открыть урок 51:/}).click();await page.locator('.lesson-opening-start').click();
  await expect(page.locator('[data-stage-id="l51-workbook165-model"]')).toBeVisible();const collapsed=page.locator('.cat-mentor-collapsed');await expect(collapsed).toBeVisible();await collapsed.click();await expect(page.locator('.cat-mentor-actions button')).toHaveCount(4);

  await jump(page,35,'l51-summary');await expect(page.locator('.lesson-reflection')).toBeVisible();await expect(page.locator('.extended-practice[data-practice-task="l51-extra-01"]')).toBeVisible();await expect(page.locator('.practice-pythagoras-actions button')).toHaveCount(4);
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);expect(overflow).toBeLessThanOrEqual(2);
});
