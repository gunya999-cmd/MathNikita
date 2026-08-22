import {expect,test,type Page} from '@playwright/test';

test.use({viewport:{width:1024,height:1366},userAgent:'Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1'});

async function openLesson60(page:Page){
  await page.goto('/');const chapterThree=page.locator('.course-chapter-group').nth(2);if(!(await chapterThree.evaluate(element=>(element as HTMLDetailsElement).open)))await chapterThree.locator('summary').click();
  const lesson60=page.getByRole('button',{name:/Открыть урок 60:/});const lesson61=page.locator('.course-lesson-grid > button').nth(60);const lesson62=page.locator('.course-lesson-grid > button').nth(61);
  await expect(lesson60).toBeEnabled();await expect(lesson60).toHaveClass(/is-interactive/);await expect(lesson61).toBeEnabled();await expect(lesson62).toBeDisabled();
  await lesson60.click();await page.locator('.lesson-opening-start').click();
}
async function jump(page:Page,index:number,id:string){await page.evaluate(({index})=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:60,stageIndex:index}})),{index});await expect(page.locator('[data-stage-id="'+id+'"]')).toBeVisible()}

test('lesson 60 keeps its strategy lab, retry gate, persistence and 50-response practice stable on iPad',async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('mathnikita-mentor-auto-guide','false'));await openLesson60(page);
  const player=page.locator('.multiplication-strategies-player');await expect(player).toHaveAttribute('data-source-reference',/§ 17/);await expect(player).toHaveAttribute('data-source-exercise-range','430-446');await expect(page.locator('[data-stage-id="l60-mission"] .lesson-controls')).toContainText('Этап 1 из 36');
  await jump(page,12,'l60-strategy-lab');const lab=page.locator('[data-strategy-lab="interactive"]');await expect(lab).toHaveAttribute('data-plan-id','round-hundred');await expect(lab).toHaveAttribute('data-direct-value','2700');await expect(lab).toHaveAttribute('data-strategy-value','2700');await expect(lab).toHaveAttribute('data-equal','true');
  await lab.getByRole('button',{name:'Цепочка к 100',exact:true}).click();await expect(lab).toHaveAttribute('data-plan-id','double-factor');await expect(lab).toHaveAttribute('data-direct-value','6600');await expect(lab).toHaveAttribute('data-strategy-value','6600');await expect(lab).toHaveAttribute('data-awkward-before','3');await expect(lab).toHaveAttribute('data-awkward-after','0');
  await jump(page,3,'l60-430-value');const retry=page.locator('[data-stage-id="l60-430-value"]');
  for(let attempt=0;attempt<2;attempt+=1){await retry.locator('.inline-answer input').fill('13201');await retry.locator('.check-button').click();await expect(retry.locator('.instant-feedback.bad')).toBeVisible()}
  await expect(retry.locator('.lesson-controls .primary')).toBeEnabled();await expect(retry.locator('.instant-feedback.bad')).toContainText('Можно перейти дальше');
  await retry.locator('.inline-answer input').fill('13200');await expect(retry.locator('.instant-feedback')).toHaveCount(0);await retry.locator('.check-button').click();await expect(retry.locator('.instant-feedback.good')).toBeVisible();
  await retry.locator('.inline-answer input').fill('13201');await expect.poll(async()=>page.evaluate(()=>JSON.parse(localStorage.getItem('mathnikita-lesson-60-progress-v1')??'null')?.results?.['l60-p1'])).toBe(false);
  await retry.locator('.inline-answer input').fill('13200');await retry.locator('.check-button').click();await retry.locator('.lesson-controls .primary').click();
  await page.getByRole('button',{name:/Все уроки/}).click();const chapterThree=page.locator('.course-chapter-group').nth(2);if(!(await chapterThree.evaluate(element=>(element as HTMLDetailsElement).open)))await chapterThree.locator('summary').click();await page.getByRole('button',{name:/Открыть урок 60:/}).click();await page.locator('.lesson-opening-start').click();await expect(page.locator('[data-stage-id="l60-431-value"]')).toBeVisible();
  await jump(page,35,'l60-summary');await expect(page.locator('.lesson-reflection')).toBeVisible();await expect(page.locator('.extended-practice[data-practice-task="l60-extra-01"]')).toBeVisible();await expect(page.locator('.extended-practice')).toHaveAttribute('data-practice-response-count','50');await expect(page.locator('.practice-pythagoras-actions button')).toHaveCount(4);
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);expect(overflow).toBeLessThanOrEqual(2);
});
