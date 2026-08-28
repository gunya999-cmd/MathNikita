import {expect,test,type Page} from '@playwright/test';

const answers:Record<string,string>={
  'l80-oral5-kg':'600','l80-oral5-boxes':'50','l80-oral6-large':'36','l80-oral6-small':'4','l80-oral6-ratio':'9',
  'l80-surface-check':'треугольниками','l80-apex-term':'вершина пирамиды','l80-base-role':'число сторон основания','l80-lateral-shape':'треугольник',
  'l80-base-edges':'стороны основания','l80-lateral-edges':'стороны боковых граней, не принадлежащие основанию',
  'l80-triangular-name':'треугольная','l80-quadrangular-name':'четырёхугольная','l80-pentagonal-name':'пятиугольная',
  'l80-triangular-faces':'4','l80-any-base':'да','l80-net-pieces':'5','l80-tetra-count':'4','l80-tetra-shape':'равносторонних треугольников',
  'l80-604-base':'ABC','l80-614-train':'42'
};
async function openLesson80(page:Page){await page.goto('/');const chapterThree=page.locator('.course-chapter-group').nth(2);if(!(await chapterThree.evaluate(element=>(element as HTMLDetailsElement).open)))await chapterThree.locator('summary').click();await expect(page.getByRole('button',{name:/Открыть урок 80:/})).toBeEnabled();await page.getByRole('button',{name:/Открыть урок 80:/}).click();await expect(page.locator('.lesson-opening')).toContainText('Пирамида');await page.locator('.lesson-opening-start').click()}

test('lesson 80 completes all 36 stages and exact pyramid route',async({page})=>{
  test.setTimeout(170_000);await page.addInitScript(()=>localStorage.setItem('mathnikita-mentor-auto-guide','false'));await openLesson80(page);
  const visited:string[]=[];
  for(let index=0;index<36;index+=1){const stage=page.locator('.lesson-runtime:not([hidden]) .interactive-stage[data-stage-id]');await expect(stage).toBeVisible();const id=await stage.getAttribute('data-stage-id');expect(id).toBeTruthy();visited.push(id!);await expect(stage.locator('.lesson-controls')).toContainText('Этап '+String(index+1)+' из 36');const answer=answers[id!];if(answer){if(await stage.locator('.choice-grid').count())await stage.getByRole('button',{name:answer,exact:true}).click();else await stage.locator('.inline-answer input').fill(answer);await stage.locator('.check-button').click();await expect(stage.locator('.instant-feedback.good')).toBeVisible()}if(index<35)await stage.locator('.lesson-controls .primary').click()}
  expect(new Set(visited).size).toBe(36);expect(visited[0]).toBe('l80-mission');expect(visited[35]).toBe('l80-summary');expect(Object.keys(answers)).toHaveLength(21);
  await expect(page.locator('.pyramid-player')).toHaveAttribute('data-source-exercise-range','604,614');
  await expect(page.locator('.lesson-reflection')).toBeVisible();await expect(page.locator('.extended-practice[data-practice-task="l80-extra-01"]')).toBeVisible();await expect(page.locator('.extended-practice')).toHaveAttribute('data-practice-response-count','50');
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('mathnikita-lesson-80-progress-v1')??'null'));expect(saved?.stageIndex).toBe(35);expect(saved?.results?.['l80-p21']).toBe(true);
});
