import {expect,test,type Page} from '@playwright/test';

const answers:Record<string,string>={
  'l75-574-12ha':'1200','l75-574-6ha28a':'628','l75-574-32400':'324','l75-574-123800':'1238',
  'l75-574-2km':'21405','l75-574-4km':'47216','l75-574-5a':'500','l75-574-17a':'1700','l75-574-8ha':'80000',
  'l75-574-5ha72a':'57200','l75-574-530a':'5 га 30 а','l75-574-1204a':'12 га 4 а','l75-574-16300':'1 га 63 а','l75-574-85200':'8 га 52 а',
  'l75-576-area':'5600','l75-576-width':'70','l75-576-perimeter':'300','l75-589-proof':'площади равны',
  'l75-dictation-1':'800','l75-dictation-2':'81','l75-dictation-3':'28'
};
async function openLesson75(page:Page){await page.goto('/');const chapterThree=page.locator('.course-chapter-group').nth(2);if(!(await chapterThree.evaluate(element=>(element as HTMLDetailsElement).open)))await chapterThree.locator('summary').click();await expect(page.getByRole('button',{name:/Открыть урок 75:/})).toBeEnabled();await page.getByRole('button',{name:/Открыть урок 75:/}).click();await expect(page.locator('.lesson-opening')).toContainText('Площадь. Площадь прямоугольника');await page.locator('.lesson-opening-start').click()}

test('lesson 75 completes all 36 stages and exact §21 reinforcement route',async({page})=>{
  test.setTimeout(160_000);await page.addInitScript(()=>localStorage.setItem('mathnikita-mentor-auto-guide','false'));await openLesson75(page);
  const visited:string[]=[];
  for(let index=0;index<36;index+=1){const stage=page.locator('.lesson-runtime:not([hidden]) .interactive-stage[data-stage-id]');await expect(stage).toBeVisible();const id=await stage.getAttribute('data-stage-id');expect(id).toBeTruthy();visited.push(id!);await expect(stage.locator('.lesson-controls')).toContainText('Этап '+String(index+1)+' из 36');const answer=answers[id!];if(answer){if(await stage.locator('.choice-grid').count())await stage.getByRole('button',{name:answer,exact:true}).click();else await stage.locator('.inline-answer input').fill(answer);await stage.locator('.check-button').click();await expect(stage.locator('.instant-feedback.good')).toBeVisible()}if(index<35)await stage.locator('.lesson-controls .primary').click()}
  expect(new Set(visited).size).toBe(36);expect(visited[0]).toBe('l75-mission');expect(visited[35]).toBe('l75-summary');expect(Object.keys(answers)).toHaveLength(21);
  await expect(page.locator('.area-reinforcement-player')).toHaveAttribute('data-source-exercise-range','574,576,578,589,596(2)');
  await expect(page.locator('.lesson-reflection')).toBeVisible();await expect(page.locator('.extended-practice[data-practice-task="l75-extra-01"]')).toBeVisible();await expect(page.locator('.extended-practice')).toHaveAttribute('data-practice-response-count','50');
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('mathnikita-lesson-75-progress-v1')??'null'));expect(saved?.stageIndex).toBe(35);expect(saved?.results?.['l75-p21']).toBe(true);
});
