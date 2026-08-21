import {expect,test,type Page} from '@playwright/test';

test.use({viewport:{width:1024,height:1366},userAgent:'Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1'});

async function openLesson55(page:Page){
  await page.goto('/');
  const chapterThree=page.locator('.course-chapter-group').nth(2);
  if(!(await chapterThree.evaluate(element=>(element as HTMLDetailsElement).open)))await chapterThree.locator('summary').click();
  const lesson55=page.getByRole('button',{name:/Открыть урок 55:/});
  const lesson56=page.locator('.course-lesson-grid > button').nth(55);
  const lesson57=page.locator('.course-lesson-grid > button').nth(56);
  const lesson58=page.locator('.course-lesson-grid > button').nth(57);
  await expect(lesson55).toBeEnabled();await expect(lesson55).toHaveClass(/is-interactive/);await expect(lesson56).toBeEnabled();await expect(lesson57).toBeEnabled();await expect(lesson58).toBeDisabled();
  await lesson55.click();await page.locator('.lesson-opening-start').click();
}
async function jump(page:Page,index:number,id:string){await page.evaluate(({index})=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:55,stageIndex:index}})),{index});await expect(page.locator('[data-stage-id="'+id+'"]')).toBeVisible()}

test('lesson 55 keeps the round-number lab, retry gate, persistence and 50-response practice stable on iPad',async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('mathnikita-mentor-auto-guide','false'));
  await openLesson55(page);
  const player=page.locator('.multiplication-practice-player');
  await expect(player).toHaveAttribute('data-source-reference',/§ 16/);
  await expect(player).toHaveAttribute('data-source-exercise-range','385-392');
  await expect(page.locator('[data-stage-id="l55-mission"] .lesson-controls')).toContainText('Этап 1 из 36');

  await jump(page,14,'l55-zero-lab');
  const lab=page.locator('[data-round-lab="interactive"]');
  await expect(lab).toHaveAttribute('data-zeros-a','1');await expect(lab).toHaveAttribute('data-zeros-b','1');await expect(lab).toHaveAttribute('data-product','11200');
  await lab.getByLabel('Нули первого множителя').press('ArrowRight');await lab.getByLabel('Нули второго множителя').press('ArrowRight');
  await expect(lab).toHaveAttribute('data-zeros-a','2');await expect(lab).toHaveAttribute('data-zeros-b','2');await expect(lab).toHaveAttribute('data-total-zeros','4');await expect(lab).toHaveAttribute('data-product','1120000');

  await jump(page,4,'l55-neighbor-plus');const retry=page.locator('[data-stage-id="l55-neighbor-plus"]');
  for(let attempt=0;attempt<2;attempt+=1){await retry.locator('.inline-answer input').fill('55');await retry.locator('.check-button').click();await expect(retry.locator('.instant-feedback.bad')).toBeVisible()}
  await expect(retry.locator('.lesson-controls .primary')).toBeEnabled();await expect(retry.locator('.instant-feedback.bad')).toContainText('Можно перейти дальше');
  await retry.locator('.inline-answer input').fill('56');await expect(retry.locator('.instant-feedback')).toHaveCount(0);await expect(retry.locator('.lesson-controls .primary')).toBeEnabled();
  await retry.locator('.check-button').click();await expect(retry.locator('.instant-feedback.good')).toBeVisible();
  await retry.locator('.inline-answer input').fill('55');await expect(retry.locator('.instant-feedback')).toHaveCount(0);
  await expect.poll(async()=>page.evaluate(()=>JSON.parse(localStorage.getItem('mathnikita-lesson-55-progress-v1')??'null')?.results?.['l55-p2'])).toBe(false);
  await retry.locator('.inline-answer input').fill('56');await retry.locator('.check-button').click();await retry.locator('.lesson-controls .primary').click();
  await page.getByRole('button',{name:/Все уроки/}).click();const chapterThree=page.locator('.course-chapter-group').nth(2);if(!(await chapterThree.evaluate(element=>(element as HTMLDetailsElement).open)))await chapterThree.locator('summary').click();await page.getByRole('button',{name:/Открыть урок 55:/}).click();await page.locator('.lesson-opening-start').click();
  await expect(page.locator('[data-stage-id="l55-neighbor-minus"]')).toBeVisible();

  await jump(page,35,'l55-summary');await expect(page.locator('.lesson-reflection')).toBeVisible();await expect(page.locator('.extended-practice[data-practice-task="l55-extra-01"]')).toBeVisible();await expect(page.locator('.extended-practice')).toHaveAttribute('data-practice-response-count','50');await expect(page.locator('.practice-pythagoras-actions button')).toHaveCount(4);
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);expect(overflow).toBeLessThanOrEqual(2);
});
