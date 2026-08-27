import {expect,test,type Page} from '@playwright/test';

const answers:Record<string,string>={
  'l78-oral1-a':'1300','l78-oral1-b':'7800','l78-oral1-c':'943000',
  'l78-oral2-a':'48ab','l78-oral2-b':'180mnk','l78-oral2-c':'5600abcd',
  'l78-faces-count':'6','l78-edges-count':'12','l78-vertices-count':'8','l78-opposite-pairs':'3',
  'l78-measure-names':'длина, ширина, высота','l78-surface-check':'52','l78-cube-faces':'квадратами',
  'l78-599-edges':'80','l78-599-surface':'258','l78-602-face':'25','l78-602-surface':'150','l78-602-edges':'60',
  'l78-dictation-cube64':'4','l78-dictation-wire':'44','l78-dictation-paper':'2200'
};
async function openLesson78(page:Page){await page.goto('/');const chapterThree=page.locator('.course-chapter-group').nth(2);if(!(await chapterThree.evaluate(element=>(element as HTMLDetailsElement).open)))await chapterThree.locator('summary').click();await expect(page.getByRole('button',{name:/Открыть урок 78:/})).toBeEnabled();await page.getByRole('button',{name:/Открыть урок 78:/}).click();await expect(page.locator('.lesson-opening')).toContainText('Прямоугольный параллелепипед');await page.locator('.lesson-opening-start').click()}

test('lesson 78 completes all 36 stages and exact first §22 route',async({page})=>{
  test.setTimeout(170_000);await page.addInitScript(()=>localStorage.setItem('mathnikita-mentor-auto-guide','false'));await openLesson78(page);
  const visited:string[]=[];
  for(let index=0;index<36;index+=1){const stage=page.locator('.lesson-runtime:not([hidden]) .interactive-stage[data-stage-id]');await expect(stage).toBeVisible();const id=await stage.getAttribute('data-stage-id');expect(id).toBeTruthy();visited.push(id!);await expect(stage.locator('.lesson-controls')).toContainText('Этап '+String(index+1)+' из 36');const answer=answers[id!];if(answer){if(await stage.locator('.choice-grid').count())await stage.getByRole('button',{name:answer,exact:true}).click();else await stage.locator('.inline-answer input').fill(answer);await stage.locator('.check-button').click();await expect(stage.locator('.instant-feedback.good')).toBeVisible()}if(index<35)await stage.locator('.lesson-controls .primary').click()}
  expect(new Set(visited).size).toBe(36);expect(visited[0]).toBe('l78-mission');expect(visited[35]).toBe('l78-summary');expect(Object.keys(answers)).toHaveLength(21);
  await expect(page.locator('.rectangular-parallelepiped-player')).toHaveAttribute('data-source-exercise-range','598,599,602,612');
  await expect(page.locator('.lesson-reflection')).toBeVisible();await expect(page.locator('.extended-practice[data-practice-task="l78-extra-01"]')).toBeVisible();await expect(page.locator('.extended-practice')).toHaveAttribute('data-practice-response-count','50');
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('mathnikita-lesson-78-progress-v1')??'null'));expect(saved?.stageIndex).toBe(35);expect(saved?.results?.['l78-p21']).toBe(true);
});
