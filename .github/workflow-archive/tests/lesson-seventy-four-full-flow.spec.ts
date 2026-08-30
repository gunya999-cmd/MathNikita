import {expect,test,type Page} from '@playwright/test';

const answers:Record<string,string>={
  'l74-oral-1a':'10','l74-oral-1b':'130','l74-unit-check':'единичные квадраты',
  'l74-564-dm':'100','l74-564-m':'10000','l74-564-km':'1000000','l74-same-units':'в одних и тех же',
  'l74-565':'112','l74-566':'49','l74-equal-area-check':'нет','l74-567-side':'22','l74-567-area':'352',
  'l74-569-half':'81','l74-569-side':'34','l74-569-area':'1598','l74-571-side':'24','l74-571-area':'576',
  'l74-572-perimeter':'48','l74-572-side':'4','l74-572-area':'80','l74-questions':'определить, сколько единичных квадратов в ней помещается'
};
async function openLesson74(page:Page){await page.goto('/');const chapterThree=page.locator('.course-chapter-group').nth(2);if(!(await chapterThree.evaluate(element=>(element as HTMLDetailsElement).open)))await chapterThree.locator('summary').click();await expect(page.getByRole('button',{name:/Открыть урок 74:/})).toBeEnabled();await page.getByRole('button',{name:/Открыть урок 74:/}).click();await expect(page.locator('.lesson-opening')).toContainText('Площадь. Площадь прямоугольника');await page.locator('.lesson-opening-start').click()}

test('lesson 74 completes all 36 stages and exact §21 route',async({page})=>{
  test.setTimeout(150_000);await page.addInitScript(()=>localStorage.setItem('mathnikita-mentor-auto-guide','false'));await openLesson74(page);
  const visited:string[]=[];
  for(let index=0;index<36;index+=1){const stage=page.locator('.lesson-runtime:not([hidden]) .interactive-stage[data-stage-id]');await expect(stage).toBeVisible();const id=await stage.getAttribute('data-stage-id');expect(id).toBeTruthy();visited.push(id!);await expect(stage.locator('.lesson-controls')).toContainText('Этап '+String(index+1)+' из 36');const answer=answers[id!];if(answer){if(await stage.locator('.choice-grid').count())await stage.getByRole('button',{name:answer,exact:true}).click();else await stage.locator('.inline-answer input').fill(answer);await stage.locator('.check-button').click();await expect(stage.locator('.instant-feedback.good')).toBeVisible()}if(index<35)await stage.locator('.lesson-controls .primary').click()}
  expect(new Set(visited).size).toBe(36);expect(visited[0]).toBe('l74-mission');expect(visited[35]).toBe('l74-summary');expect(Object.keys(answers)).toHaveLength(21);
  await expect(page.locator('.area-foundations-player')).toHaveAttribute('data-source-exercise-range','564,565,566,567,569,571,572,595');
  await expect(page.locator('.lesson-reflection')).toBeVisible();await expect(page.locator('.extended-practice[data-practice-task="l74-extra-01"]')).toBeVisible();await expect(page.locator('.extended-practice')).toHaveAttribute('data-practice-response-count','50');
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('mathnikita-lesson-74-progress-v1')??'null'));expect(saved?.stageIndex).toBe(35);expect(saved?.results?.['l74-p21']).toBe(true);
});
