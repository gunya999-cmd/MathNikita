import {expect,test,type Page} from '@playwright/test';

test.use({viewport:{width:1024,height:1366},userAgent:'Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1'});

async function openLesson56(page:Page){
  await page.goto('/');
  const chapterThree=page.locator('.course-chapter-group').nth(2);
  if(!(await chapterThree.evaluate(element=>(element as HTMLDetailsElement).open)))await chapterThree.locator('summary').click();
  const lesson56=page.getByRole('button',{name:/Открыть урок 56:/});
  const lesson57=page.locator('.course-lesson-grid > button').nth(56);
  const lesson58=page.locator('.course-lesson-grid > button').nth(57);
  const lesson59=page.locator('.course-lesson-grid > button').nth(58);
  const lesson60=page.locator('.course-lesson-grid > button').nth(59);const lesson61=page.locator('.course-lesson-grid > button').nth(60);const lesson62=page.locator('.course-lesson-grid > button').nth(61);
  await expect(lesson56).toBeEnabled();await expect(lesson56).toHaveClass(/is-interactive/);await expect(lesson57).toBeEnabled();await expect(lesson58).toBeEnabled();await expect(lesson59).toBeEnabled();await expect(lesson60).toBeEnabled();await expect(lesson61).toBeEnabled();await expect(lesson62).toBeDisabled();
  await lesson56.click();await page.locator('.lesson-opening-start').click();
}
async function jump(page:Page,index:number,id:string){await page.evaluate(({index})=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:56,stageIndex:index}})),{index});await expect(page.locator('[data-stage-id="'+id+'"]')).toBeVisible()}

test('lesson 56 keeps the carry lab, retry gate, persistence and 50-response practice stable on iPad',async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('mathnikita-mentor-auto-guide','false'));
  await openLesson56(page);
  const player=page.locator('.written-multiplication-player');
  await expect(player).toHaveAttribute('data-source-reference',/§ 16/);
  await expect(player).toHaveAttribute('data-source-exercise-range','393-398');
  await expect(page.locator('[data-stage-id="l56-mission"] .lesson-controls')).toContainText('Этап 1 из 36');

  await jump(page,10,'l56-carry-lab');
  const lab=page.locator('[data-carry-lab="interactive"]');
  await expect(lab).toHaveAttribute('data-step','0');await expect(lab).toHaveAttribute('data-place','единицы');await expect(lab).toHaveAttribute('data-carry','4');
  await lab.getByLabel('Шаг письменного умножения').press('ArrowRight');await lab.getByLabel('Шаг письменного умножения').press('ArrowRight');await lab.getByLabel('Шаг письменного умножения').press('ArrowRight');
  await expect(lab).toHaveAttribute('data-step','3');await expect(lab).toHaveAttribute('data-place','проверка');await expect(lab).toHaveAttribute('data-result','2082');

  await jump(page,3,'l56-units-write');const retry=page.locator('[data-stage-id="l56-units-write"]');
  for(let attempt=0;attempt<2;attempt+=1){await retry.locator('.inline-answer input').fill('3');await retry.locator('.check-button').click();await expect(retry.locator('.instant-feedback.bad')).toBeVisible()}
  await expect(retry.locator('.lesson-controls .primary')).toBeEnabled();await expect(retry.locator('.instant-feedback.bad')).toContainText('Можно перейти дальше');
  await retry.locator('.inline-answer input').fill('2');await expect(retry.locator('.instant-feedback')).toHaveCount(0);await retry.locator('.check-button').click();await expect(retry.locator('.instant-feedback.good')).toBeVisible();
  await retry.locator('.inline-answer input').fill('3');await expect(retry.locator('.instant-feedback')).toHaveCount(0);
  await expect.poll(async()=>page.evaluate(()=>JSON.parse(localStorage.getItem('mathnikita-lesson-56-progress-v1')??'null')?.results?.['l56-p1'])).toBe(false);
  await retry.locator('.inline-answer input').fill('2');await retry.locator('.check-button').click();await retry.locator('.lesson-controls .primary').click();
  await page.getByRole('button',{name:/Все уроки/}).click();const chapterThree=page.locator('.course-chapter-group').nth(2);if(!(await chapterThree.evaluate(element=>(element as HTMLDetailsElement).open)))await chapterThree.locator('summary').click();await page.getByRole('button',{name:/Открыть урок 56:/}).click();await page.locator('.lesson-opening-start').click();
  await expect(page.locator('[data-stage-id="l56-units-carry"]')).toBeVisible();

  await jump(page,35,'l56-summary');await expect(page.locator('.lesson-reflection')).toBeVisible();await expect(page.locator('.extended-practice[data-practice-task="l56-extra-01"]')).toBeVisible();await expect(page.locator('.extended-practice')).toHaveAttribute('data-practice-response-count','50');await expect(page.locator('.practice-pythagoras-actions button')).toHaveCount(4);
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);expect(overflow).toBeLessThanOrEqual(2);
});
