import {expect,test,type Page} from '@playwright/test';

const answers:Record<string,string>={
  'l79-oral3-a':'2a+2b','l79-oral3-b':'15-5b','l79-oral3-c':'42mn+48mp',
  'l79-oral4-side':'4','l79-oral4-perimeter':'22',
  'l79-faces-count':'6','l79-edges-count':'12','l79-vertices-count':'8',
  'l79-608-width':'15','l79-608-length':'60','l79-608-surface':'4800',
  'l79-610-width':'9','l79-610-height':'10','l79-610-surface':'864','l79-610-cube-edge':'12',
  'l79-net-sequence':'начертить → вырезать → согнуть → склеить','l79-polyhedron-choice':'из многоугольников',
  'l79-606-rectangles':'6','l79-606-pairs':'3','l79-606-area':'242','l79-613':'9'
};
async function openLesson79(page:Page){await page.goto('/');const chapterThree=page.locator('.course-chapter-group').nth(2);if(!(await chapterThree.evaluate(element=>(element as HTMLDetailsElement).open)))await chapterThree.locator('summary').click();await expect(page.getByRole('button',{name:/Открыть урок 79:/})).toBeEnabled();await page.getByRole('button',{name:/Открыть урок 79:/}).click();await expect(page.locator('.lesson-opening')).toContainText('развёртка и многогранник');await page.locator('.lesson-opening-start').click()}

test('lesson 79 completes all 36 stages and exact second §22 route',async({page})=>{
  test.setTimeout(170_000);await page.addInitScript(()=>localStorage.setItem('mathnikita-mentor-auto-guide','false'));await openLesson79(page);
  const visited:string[]=[];
  for(let index=0;index<36;index+=1){const stage=page.locator('.lesson-runtime:not([hidden]) .interactive-stage[data-stage-id]');await expect(stage).toBeVisible();const id=await stage.getAttribute('data-stage-id');expect(id).toBeTruthy();visited.push(id!);await expect(stage.locator('.lesson-controls')).toContainText('Этап '+String(index+1)+' из 36');const answer=answers[id!];if(answer){if(await stage.locator('.choice-grid').count())await stage.getByRole('button',{name:answer,exact:true}).click();else await stage.locator('.inline-answer input').fill(answer);await stage.locator('.check-button').click();await expect(stage.locator('.instant-feedback.good')).toBeVisible()}if(index<35)await stage.locator('.lesson-controls .primary').click()}
  expect(new Set(visited).size).toBe(36);expect(visited[0]).toBe('l79-mission');expect(visited[35]).toBe('l79-summary');expect(Object.keys(answers)).toHaveLength(21);
  await expect(page.locator('.parallelepiped-nets-player')).toHaveAttribute('data-source-exercise-range','606,608,610,613');
  await expect(page.locator('.lesson-reflection')).toBeVisible();await expect(page.locator('.extended-practice[data-practice-task="l79-extra-01"]')).toBeVisible();await expect(page.locator('.extended-practice')).toHaveAttribute('data-practice-response-count','50');
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('mathnikita-lesson-79-progress-v1')??'null'));expect(saved?.stageIndex).toBe(35);expect(saved?.results?.['l79-p21']).toBe(true);
});
