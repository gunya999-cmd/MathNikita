import {expect,test,type Page} from '@playwright/test';

test.use({viewport:{width:1024,height:1366},userAgent:'Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1'});

async function openLesson57(page:Page){
  await page.goto('/');const chapterThree=page.locator('.course-chapter-group').nth(2);if(!(await chapterThree.evaluate(element=>(element as HTMLDetailsElement).open)))await chapterThree.locator('summary').click();
  const lesson57=page.getByRole('button',{name:/Открыть урок 57:/});const lesson58=page.locator('.course-lesson-grid > button').nth(57);const lesson59=page.locator('.course-lesson-grid > button').nth(58);const lesson60=page.locator('.course-lesson-grid > button').nth(59);const lesson61=page.locator('.course-lesson-grid > button').nth(60);
  await expect(lesson57).toBeEnabled();await expect(lesson57).toHaveClass(/is-interactive/);await expect(lesson58).toBeEnabled();await expect(lesson59).toBeEnabled();await expect(lesson60).toBeEnabled();await expect(lesson61).toBeEnabled();
  await lesson57.click();await page.locator('.lesson-opening-start').click();
}
async function jump(page:Page,index:number,id:string){await page.evaluate(({index})=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:57,stageIndex:index}})),{index});await expect(page.locator('[data-stage-id="'+id+'"]')).toBeVisible()}

test('lesson 57 keeps the motion lab, retry gate, persistence and 50-response practice stable on iPad',async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('mathnikita-mentor-auto-guide','false'));await openLesson57(page);
  const player=page.locator('.multiplication-mastery-player');await expect(player).toHaveAttribute('data-source-reference',/§ 16/);await expect(player).toHaveAttribute('data-source-exercise-range','399-419');await expect(page.locator('[data-stage-id="l57-mission"] .lesson-controls')).toContainText('Этап 1 из 36');
  await jump(page,10,'l57-motion-lab');const lab=page.locator('[data-motion-lab="interactive"]');await expect(lab).toHaveAttribute('data-mode','same');await expect(lab).toHaveAttribute('data-relative-speed','8');await expect(lab).toHaveAttribute('data-distance','40');
  await lab.getByRole('button',{name:/Одно направление/}).click();await expect(lab).toHaveAttribute('data-mode','opposite');await expect(lab).toHaveAttribute('data-relative-speed','64');await expect(lab).toHaveAttribute('data-distance','320');
  await lab.getByLabel('Время движения').press('ArrowRight');await expect(lab).toHaveAttribute('data-distance','384');
  await jump(page,3,'l57-expression-inner');const retry=page.locator('[data-stage-id="l57-expression-inner"]');
  for(let attempt=0;attempt<2;attempt+=1){await retry.locator('.inline-answer input').fill('900');await retry.locator('.check-button').click();await expect(retry.locator('.instant-feedback.bad')).toBeVisible()}
  await expect(retry.locator('.lesson-controls .primary')).toBeEnabled();await expect(retry.locator('.instant-feedback.bad')).toContainText('Можно перейти дальше');
  await retry.locator('.inline-answer input').fill('892');await expect(retry.locator('.instant-feedback')).toHaveCount(0);await retry.locator('.check-button').click();await expect(retry.locator('.instant-feedback.good')).toBeVisible();
  await retry.locator('.inline-answer input').fill('900');await expect.poll(async()=>page.evaluate(()=>JSON.parse(localStorage.getItem('mathnikita-lesson-57-progress-v1')??'null')?.results?.['l57-p1'])).toBe(false);
  await retry.locator('.inline-answer input').fill('892');await retry.locator('.check-button').click();await retry.locator('.lesson-controls .primary').click();
  await page.getByRole('button',{name:/Все уроки/}).click();const chapterThree=page.locator('.course-chapter-group').nth(2);if(!(await chapterThree.evaluate(element=>(element as HTMLDetailsElement).open)))await chapterThree.locator('summary').click();await page.getByRole('button',{name:/Открыть урок 57:/}).click();await page.locator('.lesson-opening-start').click();await expect(page.locator('[data-stage-id="l57-expression-first-branch"]')).toBeVisible();
  await jump(page,35,'l57-summary');await expect(page.locator('.lesson-reflection')).toBeVisible();await expect(page.locator('.extended-practice[data-practice-task="l57-extra-01"]')).toBeVisible();await expect(page.locator('.extended-practice')).toHaveAttribute('data-practice-response-count','50');await expect(page.locator('.practice-pythagoras-actions button')).toHaveCount(4);
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);expect(overflow).toBeLessThanOrEqual(2);
});
