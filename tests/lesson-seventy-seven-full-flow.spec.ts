import {expect,test,type Page} from '@playwright/test';

const answers:Record<string,string>={
  'l77-584-square-area':'144','l77-584-width':'8','l77-584-perimeter':'52',
  'l77-585-area':'36','l77-585-side':'6','l77-585-perimeter':'24',
  'l77-586-increase':'104','l77-587-perimeter-factor':'4','l77-587-area-factor':'16',
  'l77-dictation-1':'800','l77-dictation-2':'81','l77-dictation-3':'28','l77-dictation-4':'100',
  'l77-dictation-5':'400','l77-dictation-6':'204','l77-dictation-7':'10',
  'l77-statement-1':'да','l77-statement-2':'нет','l77-statement-3':'да','l77-statement-4':'нет',
  'l77-594-check':'25'
};
async function openLesson77(page:Page){await page.goto('/');const chapterThree=page.locator('.course-chapter-group').nth(2);if(!(await chapterThree.evaluate(element=>(element as HTMLDetailsElement).open)))await chapterThree.locator('summary').click();await expect(page.getByRole('button',{name:/Открыть урок 77:/})).toBeEnabled();await page.getByRole('button',{name:/Открыть урок 77:/}).click();await expect(page.locator('.lesson-opening')).toContainText('Площадь. Площадь прямоугольника');await page.locator('.lesson-opening-start').click()}

test('lesson 77 completes all 36 stages and exact §21 synthesis route',async({page})=>{
  test.setTimeout(170_000);await page.addInitScript(()=>localStorage.setItem('mathnikita-mentor-auto-guide','false'));await openLesson77(page);
  const visited:string[]=[];
  for(let index=0;index<36;index+=1){const stage=page.locator('.lesson-runtime:not([hidden]) .interactive-stage[data-stage-id]');await expect(stage).toBeVisible();const id=await stage.getAttribute('data-stage-id');expect(id).toBeTruthy();visited.push(id!);await expect(stage.locator('.lesson-controls')).toContainText('Этап '+String(index+1)+' из 36');const answer=answers[id!];if(answer){if(await stage.locator('.choice-grid').count())await stage.getByRole('button',{name:answer,exact:true}).click();else await stage.locator('.inline-answer input').fill(answer);await stage.locator('.check-button').click();await expect(stage.locator('.instant-feedback.good')).toBeVisible()}if(index<35)await stage.locator('.lesson-controls .primary').click()}
  expect(new Set(visited).size).toBe(36);expect(visited[0]).toBe('l77-mission');expect(visited[35]).toBe('l77-summary');expect(Object.keys(answers)).toHaveLength(21);
  await expect(page.locator('.area-synthesis-player')).toHaveAttribute('data-source-exercise-range','584,586,587,593,594,597');
  await expect(page.locator('.lesson-reflection')).toBeVisible();await expect(page.locator('.extended-practice[data-practice-task="l77-extra-01"]')).toBeVisible();await expect(page.locator('.extended-practice')).toHaveAttribute('data-practice-response-count','50');
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('mathnikita-lesson-77-progress-v1')??'null'));expect(saved?.stageIndex).toBe(35);expect(saved?.results?.['l77-p21']).toBe(true);
});
