import {expect,test,type Page} from '@playwright/test';

const answers:Record<string,string>={
  'l81-oral2-count':'8','l81-equal-property':'да','l81-additive-property':'да','l81-unit-cube-edge':'единичному отрезку','l81-cubic-centimeter':'1','l81-liter':'1','l81-figure-a':'5','l81-figure-b':'5','l81-figure-c':'18','l81-figure-d':'9','l81-617-length':'10','l81-617-area':'100','l81-617-volume':'1000','l81-617-meter-length':'100','l81-617-meter-area':'10000','l81-617-meter-volume':'1000000','l81-622-seven':'7000','l81-622-mixed-mm':'12243','l81-622-four-m3':'4000','l81-622-cm-to-dm':'44','l81-623-eight':'8000'
};
async function openLesson81(page:Page){await page.goto('/');const chapterThree=page.locator('.course-chapter-group').nth(2);if(!(await chapterThree.evaluate(element=>(element as HTMLDetailsElement).open)))await chapterThree.locator('summary').click();await expect(page.getByRole('button',{name:/Открыть урок 81:/})).toBeEnabled();await page.getByRole('button',{name:/Открыть урок 81:/}).click();await expect(page.locator('.lesson-opening')).toContainText('Объём фигуры');await page.locator('.lesson-opening-start').click()}

test('lesson 81 completes all 36 stages and exact volume route',async({page})=>{
  test.setTimeout(170_000);await page.addInitScript(()=>localStorage.setItem('mathnikita-mentor-auto-guide','false'));await openLesson81(page);
  const visited:string[]=[];
  for(let index=0;index<36;index+=1){const stage=page.locator('.lesson-runtime:not([hidden]) .interactive-stage[data-stage-id]');await expect(stage).toBeVisible();const id=await stage.getAttribute('data-stage-id');expect(id).toBeTruthy();visited.push(id!);await expect(stage.locator('.lesson-controls')).toContainText('Этап '+String(index+1)+' из 36');const answer=answers[id!];if(answer){if(await stage.locator('.choice-grid').count())await stage.getByRole('button',{name:answer,exact:true}).click();else await stage.locator('.inline-answer input').fill(answer);await stage.locator('.check-button').click();await expect(stage.locator('.instant-feedback.good')).toBeVisible()}if(index<35)await stage.locator('.lesson-controls .primary').click()}
  expect(new Set(visited).size).toBe(36);expect(visited[0]).toBe('l81-mission');expect(visited[35]).toBe('l81-summary');expect(Object.keys(answers)).toHaveLength(21);
  await expect(page.locator('.volume-figure-player')).toHaveAttribute('data-source-exercise-range','617,618,622,643');
  await expect(page.locator('.lesson-reflection')).toBeVisible();await expect(page.locator('.extended-practice[data-practice-task="l81-extra-01"]')).toBeVisible();await expect(page.locator('.extended-practice')).toHaveAttribute('data-practice-response-count','50');
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('mathnikita-lesson-81-progress-v1')??'null'));expect(saved?.stageIndex).toBe(35);expect(saved?.results?.['l81-p21']).toBe(true);
});
