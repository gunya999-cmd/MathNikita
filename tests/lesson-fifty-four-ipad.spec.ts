import {expect,test,type Page} from '@playwright/test';

test.use({viewport:{width:1024,height:1366},userAgent:'Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1'});

async function openLesson54(page:Page){
  await page.goto('/');
  const chapterThree=page.locator('.course-chapter-group').nth(2);
  if(!(await chapterThree.evaluate(element=>(element as HTMLDetailsElement).open)))await chapterThree.locator('summary').click();
  const lesson54=page.getByRole('button',{name:/Открыть урок 54:/});
  const lesson55=page.locator('.course-lesson-grid > button').nth(54);
  const lesson56=page.locator('.course-lesson-grid > button').nth(55);
  const lesson57=page.locator('.course-lesson-grid > button').nth(56);
  const lesson58=page.locator('.course-lesson-grid > button').nth(57);
  const lesson59=page.locator('.course-lesson-grid > button').nth(58);
  const lesson60=page.locator('.course-lesson-grid > button').nth(59);const lesson61=page.locator('.course-lesson-grid > button').nth(60);
  await expect(lesson54).toBeEnabled();await expect(lesson54).toHaveClass(/is-interactive/);await expect(lesson55).toBeEnabled();await expect(lesson56).toBeEnabled();await expect(lesson57).toBeEnabled();await expect(lesson58).toBeEnabled();await expect(lesson59).toBeEnabled();await expect(lesson60).toBeEnabled();await expect(lesson61).toBeDisabled();
  await lesson54.click();await page.locator('.lesson-opening-start').click();
}
async function jump(page:Page,index:number,id:string){await page.evaluate(({index})=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:54,stageIndex:index}})),{index});await expect(page.locator('[data-stage-id="'+id+'"]')).toBeVisible()}

test('lesson 54 keeps the array proof, retry gate, persistence and 50-response practice stable on iPad',async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('mathnikita-mentor-auto-guide','false'));
  await openLesson54(page);
  const player=page.locator('.multiplication-meaning-player');
  await expect(player).toHaveAttribute('data-source-reference',/§ 16/);
  await expect(player).toHaveAttribute('data-source-exercise-range','384-419');
  await expect(page.locator('[data-stage-id="l54-mission"] .lesson-controls')).toContainText('Этап 1 из 36');

  await jump(page,16,'l54-array-explorer');
  const explorer=page.locator('[data-array-model="interactive"]');
  await expect(explorer).toHaveAttribute('data-rows','3');await expect(explorer).toHaveAttribute('data-columns','4');await expect(explorer).toHaveAttribute('data-total','12');
  await explorer.getByLabel('Количество строк').press('ArrowRight');await explorer.getByLabel('Количество строк').press('ArrowRight');
  await explorer.getByLabel('Количество точек в строке').press('ArrowRight');await explorer.getByLabel('Количество точек в строке').press('ArrowRight');
  await expect(explorer).toHaveAttribute('data-rows','5');await expect(explorer).toHaveAttribute('data-columns','6');await expect(explorer).toHaveAttribute('data-total','30');
  await explorer.getByRole('button',{name:'Поменять множители местами'}).click();
  await expect(explorer).toHaveAttribute('data-rows','6');await expect(explorer).toHaveAttribute('data-columns','5');await expect(explorer).toHaveAttribute('data-total','30');await expect(explorer).toHaveAttribute('data-swapped','true');

  await jump(page,2,'l54-sum-product');const retry=page.locator('[data-stage-id="l54-sum-product"]');
  for(let attempt=0;attempt<2;attempt+=1){await retry.locator('.inline-answer input').fill('4·7');await retry.locator('.check-button').click();await expect(retry.locator('.instant-feedback.bad')).toBeVisible()}
  await expect(retry.locator('.lesson-controls .primary')).toBeEnabled();await expect(retry.locator('.instant-feedback.bad')).toContainText('Можно перейти дальше');
  await retry.locator('.inline-answer input').fill('7·4');await expect(retry.locator('.instant-feedback')).toHaveCount(0);await expect(retry.locator('.lesson-controls .primary')).toBeEnabled();
  await retry.locator('.check-button').click();await expect(retry.locator('.instant-feedback.good')).toBeVisible();
  await retry.locator('.inline-answer input').fill('4·7');await expect(retry.locator('.instant-feedback')).toHaveCount(0);
  await expect.poll(async()=>page.evaluate(()=>JSON.parse(localStorage.getItem('mathnikita-lesson-54-progress-v1')??'null')?.results?.['l54-p1'])).toBe(false);
  await retry.locator('.inline-answer input').fill('7·4');await retry.locator('.check-button').click();await retry.locator('.lesson-controls .primary').click();
  await page.getByRole('button',{name:/Все уроки/}).click();const chapterThree=page.locator('.course-chapter-group').nth(2);if(!(await chapterThree.evaluate(element=>(element as HTMLDetailsElement).open)))await chapterThree.locator('summary').click();await page.getByRole('button',{name:/Открыть урок 54:/}).click();await page.locator('.lesson-opening-start').click();
  await expect(page.locator('[data-stage-id="l54-product-sum"]')).toBeVisible();

  await jump(page,35,'l54-summary');await expect(page.locator('.lesson-reflection')).toBeVisible();await expect(page.locator('.extended-practice[data-practice-task="l54-extra-01"]')).toBeVisible();await expect(page.locator('.extended-practice')).toHaveAttribute('data-practice-response-count','50');await expect(page.locator('.practice-pythagoras-actions button')).toHaveCount(4);
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);expect(overflow).toBeLessThanOrEqual(2);
});
