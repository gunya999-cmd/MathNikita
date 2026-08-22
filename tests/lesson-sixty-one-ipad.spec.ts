import {expect,test,type Page} from '@playwright/test';

test.use({viewport:{width:1024,height:1366},userAgent:'Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1'});

async function openLesson61(page:Page){
  await page.goto('/');const chapterThree=page.locator('.course-chapter-group').nth(2);if(!(await chapterThree.evaluate(element=>(element as HTMLDetailsElement).open)))await chapterThree.locator('summary').click();
  const lesson61=page.getByRole('button',{name:/Открыть урок 61:/});const lesson62=page.locator('.course-lesson-grid > button').nth(61);
  await expect(lesson61).toBeEnabled();await expect(lesson61).toHaveClass(/is-interactive/);await expect(lesson62).toBeDisabled();
  await lesson61.click();await page.locator('.lesson-opening-start').click();
}
async function jump(page:Page,index:number,id:string){await page.evaluate(({index})=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:61,stageIndex:index}})),{index});await expect(page.locator('[data-stage-id="'+id+'"]')).toBeVisible()}

test('lesson 61 keeps its division lab, retry gate, persistence and 50-response practice stable on iPad',async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('mathnikita-mentor-auto-guide','false'));await openLesson61(page);
  const player=page.locator('.division-meaning-player');await expect(player).toHaveAttribute('data-source-reference',/§ 18/);await expect(player).toHaveAttribute('data-source-exercise-range','447-453');await expect(page.locator('[data-stage-id="l61-mission"] .lesson-controls')).toContainText('Этап 1 из 36');
  await jump(page,2,'l61-division-lab');const lab=page.locator('[data-division-lab="interactive"]');await expect(lab).toHaveAttribute('data-plan-id','twenty-four-six');await expect(lab).toHaveAttribute('data-dividend','24');await expect(lab).toHaveAttribute('data-divisor','6');await expect(lab).toHaveAttribute('data-quotient','4');await expect(lab).toHaveAttribute('data-check-product','24');await expect(lab).toHaveAttribute('data-equal-models','true');
  await lab.getByRole('button',{name:'72 предмета ÷ 8',exact:true}).click();await expect(lab).toHaveAttribute('data-plan-id','seventy-two-eight');await expect(lab).toHaveAttribute('data-share-groups','8');await expect(lab).toHaveAttribute('data-share-size','9');await expect(lab).toHaveAttribute('data-group-size','8');await expect(lab).toHaveAttribute('data-group-count','9');await expect(lab).toHaveAttribute('data-check-product','72');
  await jump(page,3,'l61-share-basic');const retry=page.locator('[data-stage-id="l61-share-basic"]');
  for(let attempt=0;attempt<2;attempt+=1){await retry.locator('.inline-answer input').fill('5');await retry.locator('.check-button').click();await expect(retry.locator('.instant-feedback.bad')).toBeVisible()}
  await expect(retry.locator('.lesson-controls .primary')).toBeEnabled();await expect(retry.locator('.instant-feedback.bad')).toContainText('Можно перейти дальше');
  await retry.locator('.inline-answer input').fill('4');await expect(retry.locator('.instant-feedback')).toHaveCount(0);await retry.locator('.check-button').click();await expect(retry.locator('.instant-feedback.good')).toBeVisible();
  await retry.locator('.inline-answer input').fill('5');await expect.poll(async()=>page.evaluate(()=>JSON.parse(localStorage.getItem('mathnikita-lesson-61-progress-v1')??'null')?.results?.['l61-p1'])).toBe(false);
  await retry.locator('.inline-answer input').fill('4');await retry.locator('.check-button').click();await retry.locator('.lesson-controls .primary').click();
  await page.getByRole('button',{name:/Все уроки/}).click();const chapterThree=page.locator('.course-chapter-group').nth(2);if(!(await chapterThree.evaluate(element=>(element as HTMLDetailsElement).open)))await chapterThree.locator('summary').click();await page.getByRole('button',{name:/Открыть урок 61:/}).click();await page.locator('.lesson-opening-start').click();await expect(page.locator('[data-stage-id="l61-groups-basic"]')).toBeVisible();
  await jump(page,35,'l61-summary');await expect(page.locator('.lesson-reflection')).toBeVisible();await expect(page.locator('.extended-practice[data-practice-task="l61-extra-01"]')).toBeVisible();await expect(page.locator('.extended-practice')).toHaveAttribute('data-practice-response-count','50');await expect(page.locator('.practice-pythagoras-actions button')).toHaveCount(4);
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);expect(overflow).toBeLessThanOrEqual(2);
});
