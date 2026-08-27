import {expect,test,type Page} from '@playwright/test';

const answers:Record<string,string>={
  'l72-oral-3':'7','l72-oral-4':'6','l72-oral-5':'12,8','l72-order-check':'(8+7)²',
  'l72-554-1':'8','l72-554-2':'900','l72-554-3':'240','l72-554-4':'36000',
  'l72-554-5':'6','l72-554-6':'1','l72-554-7':'14','l72-554-8':'13',
  'l72-556-a':'3²,3³','l72-556-b':'3⁵,3⁴',
  'l72-558-1':'189','l72-558-2':'32','l72-558-3':'16','l72-558-4':'2',
  'l72-560-3':'16','l72-560-4':'7','l72-562':'172'
};
async function openLesson72(page:Page){await page.goto('/');const chapterThree=page.locator('.course-chapter-group').nth(2);if(!(await chapterThree.evaluate(element=>(element as HTMLDetailsElement).open)))await chapterThree.locator('summary').click();await expect(page.getByRole('button',{name:/Открыть урок 72:/})).toBeEnabled();await page.getByRole('button',{name:/Открыть урок 72:/}).click();await expect(page.locator('.lesson-opening')).toContainText('Степень числа: закрепление и порядок действий');await page.locator('.lesson-opening-start').click()}

test('lesson 72 completes all 36 stages and the verified reinforcement route',async({page})=>{
  test.setTimeout(140_000);await page.addInitScript(()=>localStorage.setItem('mathnikita-mentor-auto-guide','false'));await openLesson72(page);
  const visited:string[]=[];
  for(let index=0;index<36;index+=1){const stage=page.locator('.lesson-runtime:not([hidden]) .interactive-stage[data-stage-id]');await expect(stage).toBeVisible();const id=await stage.getAttribute('data-stage-id');expect(id).toBeTruthy();visited.push(id!);await expect(stage.locator('.lesson-controls')).toContainText('Этап '+String(index+1)+' из 36');const answer=answers[id!];if(answer){if(await stage.locator('.choice-grid').count())await stage.getByRole('button',{name:answer,exact:true}).click();else await stage.locator('.inline-answer input').fill(answer);await stage.locator('.check-button').click();await expect(stage.locator('.instant-feedback.good')).toBeVisible()}if(index<35)await stage.locator('.lesson-controls .primary').click()}
  expect(new Set(visited).size).toBe(36);expect(visited[0]).toBe('l72-mission');expect(visited[35]).toBe('l72-summary');expect(Object.keys(answers)).toHaveLength(21);
  await expect(page.locator('.power-reinforcement-player')).toHaveAttribute('data-source-exercise-range','554,556,558,560,562');
  await expect(page.locator('.lesson-reflection')).toBeVisible();await expect(page.locator('.extended-practice[data-practice-task="l72-extra-01"]')).toBeVisible();await expect(page.locator('.extended-practice')).toHaveAttribute('data-practice-response-count','50');
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('mathnikita-lesson-72-progress-v1')??'null'));expect(saved?.stageIndex).toBe(35);expect(saved?.results?.['l72-p21']).toBe(true);
});
