import {expect,test,type Page} from '@playwright/test';

test.use({viewport:{width:1024,height:1366},userAgent:'Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1'});

async function openLesson59(page:Page){
  await page.goto('/');const chapterThree=page.locator('.course-chapter-group').nth(2);if(!(await chapterThree.evaluate(element=>(element as HTMLDetailsElement).open)))await chapterThree.locator('summary').click();
  const lesson59=page.getByRole('button',{name:/Открыть урок 59:/});const lesson60=page.locator('.course-lesson-grid > button').nth(59);const lesson61=page.locator('.course-lesson-grid > button').nth(60);const lesson62=page.locator('.course-lesson-grid > button').nth(61);
  await expect(lesson59).toBeEnabled();await expect(lesson59).toHaveClass(/is-interactive/);await expect(lesson60).toBeEnabled();await expect(lesson61).toBeEnabled();await expect(lesson62).toBeDisabled();
  await lesson59.click();await page.locator('.lesson-opening-start').click();
}
async function jump(page:Page,index:number,id:string){await page.evaluate(({index})=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:59,stageIndex:index}})),{index});await expect(page.locator('[data-stage-id="'+id+'"]')).toBeVisible()}

test('lesson 59 keeps the distribution lab, retry gate, persistence and 50-response practice stable on iPad',async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('mathnikita-mentor-auto-guide','false'));await openLesson59(page);
  const player=page.locator('.distributive-multiplication-player');await expect(player).toHaveAttribute('data-source-reference',/§ 17/);await expect(player).toHaveAttribute('data-source-exercise-range','424-429');await expect(page.locator('[data-stage-id="l59-mission"] .lesson-controls')).toContainText('Этап 1 из 36');
  await jump(page,13,'l59-distributive-lab');const lab=page.locator('[data-distributive-lab="interactive"]');await expect(lab).toHaveAttribute('data-operation','sum');await expect(lab).toHaveAttribute('data-whole-value','138');await expect(lab).toHaveAttribute('data-parts-value','138');await expect(lab).toHaveAttribute('data-equal','true');
  await lab.getByRole('button',{name:/Сложение: b\+c/}).click();await expect(lab).toHaveAttribute('data-operation','difference');await expect(lab).toHaveAttribute('data-whole-value','102');await expect(lab).toHaveAttribute('data-parts-value','102');
  await lab.getByLabel('Добавляемая или вычитаемая часть c').press('ArrowRight');await expect(lab).toHaveAttribute('data-whole-value','96');await expect(lab).toHaveAttribute('data-parts-value','96');
  await jump(page,2,'l59-whole-route');const retry=page.locator('[data-stage-id="l59-whole-route"]');
  for(let attempt=0;attempt<2;attempt+=1){await retry.locator('.inline-answer input').fill('139');await retry.locator('.check-button').click();await expect(retry.locator('.instant-feedback.bad')).toBeVisible()}
  await expect(retry.locator('.lesson-controls .primary')).toBeEnabled();await expect(retry.locator('.instant-feedback.bad')).toContainText('Можно перейти дальше');
  await retry.locator('.inline-answer input').fill('138');await expect(retry.locator('.instant-feedback')).toHaveCount(0);await retry.locator('.check-button').click();await expect(retry.locator('.instant-feedback.good')).toBeVisible();
  await retry.locator('.inline-answer input').fill('139');await expect.poll(async()=>page.evaluate(()=>JSON.parse(localStorage.getItem('mathnikita-lesson-59-progress-v1')??'null')?.results?.['l59-p1'])).toBe(false);
  await retry.locator('.inline-answer input').fill('138');await retry.locator('.check-button').click();await retry.locator('.lesson-controls .primary').click();
  await page.getByRole('button',{name:/Все уроки/}).click();const chapterThree=page.locator('.course-chapter-group').nth(2);if(!(await chapterThree.evaluate(element=>(element as HTMLDetailsElement).open)))await chapterThree.locator('summary').click();await page.getByRole('button',{name:/Открыть урок 59:/}).click();await page.locator('.lesson-opening-start').click();await expect(page.locator('[data-stage-id="l59-parts-route"]')).toBeVisible();
  await jump(page,35,'l59-summary');await expect(page.locator('.lesson-reflection')).toBeVisible();await expect(page.locator('.extended-practice[data-practice-task="l59-extra-01"]')).toBeVisible();await expect(page.locator('.extended-practice')).toHaveAttribute('data-practice-response-count','50');await expect(page.locator('.practice-pythagoras-actions button')).toHaveCount(4);
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);expect(overflow).toBeLessThanOrEqual(2);
});
