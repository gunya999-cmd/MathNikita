import {expect,test,type Page} from '@playwright/test';

const answers:Record<string,string>={
  'l70-oral-4':'129','l70-oral-5':'48',
  'l70-531-product':'84','l70-531-dividend':'93','l70-531-check':'9<12',
  'l70-537-difference':'185','l70-537-divisors':'37,185','l70-537-filter':'b делит 185 и b>26',
  'l70-538-difference':'104','l70-538-divisors':'8,13,26,52,104','l70-538-check':'8',
  'l70-540-weeks':'52','l70-540-remainder':'2','l70-540-answer':'53',
  'l70-543-example':'6','l70-543-proof':'a=10b+r и 0≤r<10',
  'l70-544-rem3':'3a+1','l70-544-rem8':'8a+3','l70-544-rem11':'11a+7','l70-544-nonunique':'3a−2',
  'l70-547-one-rope':'поджечь оба конца одновременно'
};
async function openLesson70(page:Page){await page.goto('/');const chapterThree=page.locator('.course-chapter-group').nth(2);if(!(await chapterThree.evaluate(element=>(element as HTMLDetailsElement).open)))await chapterThree.locator('summary').click();await page.getByRole('button',{name:/Открыть урок 70:/}).click();await expect(page.locator('.lesson-opening')).toContainText('Деление с остатком: итоговое обобщение');await page.locator('.lesson-opening-start').click()}

test('lesson 70 completes all 36 stages and the verified §19 synthesis route',async({page})=>{
  test.setTimeout(120_000);await page.addInitScript(()=>localStorage.setItem('mathnikita-mentor-auto-guide','false'));await openLesson70(page);
  const visited:string[]=[];
  for(let index=0;index<36;index+=1){const stage=page.locator('.lesson-runtime:not([hidden]) .interactive-stage[data-stage-id]');await expect(stage).toBeVisible();const id=await stage.getAttribute('data-stage-id');expect(id).toBeTruthy();visited.push(id!);await expect(stage.locator('.lesson-controls')).toContainText('Этап '+String(index+1)+' из 36');const answer=answers[id!];if(answer){if(await stage.locator('.choice-grid').count())await stage.getByRole('button',{name:answer,exact:true}).click();else await stage.locator('.inline-answer input').fill(answer);await stage.locator('.check-button').click();await expect(stage.locator('.instant-feedback.good')).toBeVisible()}if(index<35)await stage.locator('.lesson-controls .primary').click()}
  expect(new Set(visited).size).toBe(36);expect(visited[0]).toBe('l70-mission');expect(visited[35]).toBe('l70-summary');expect(Object.keys(answers)).toHaveLength(21);
  await expect(page.locator('.remainder-division-synthesis-player')).toHaveAttribute('data-source-exercise-range','531,537,538,540,543,544,547');
  await expect(page.locator('.lesson-reflection')).toBeVisible();await expect(page.locator('.extended-practice[data-practice-task="l70-extra-01"]')).toBeVisible();await expect(page.locator('.extended-practice')).toHaveAttribute('data-practice-response-count','50');
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('mathnikita-lesson-70-progress-v1')??'null'));expect(saved?.stageIndex).toBe(35);expect(saved?.results?.['l70-p21']).toBe(true);
});
