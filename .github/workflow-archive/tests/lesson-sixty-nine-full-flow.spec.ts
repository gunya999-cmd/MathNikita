import {expect,test,type Page} from '@playwright/test';

const answers:Record<string,string>={
  'l69-warmup':'38=7·5+3',
  'l69-528-q':'8','l69-528-r':'2','l69-528-answer':'9','l69-528-rule':'когда r>0',
  'l69-530-a':'45','l69-530-r':'5','l69-530-q':'9','l69-530-b':'9',
  'l69-533-q':'10','l69-533-r':'2','l69-533-equality':'82=8·10+2',
  'l69-535-1':'6','l69-535-2':'1','l69-535-3':'2','l69-535-pattern':'11',
  'l69-541-month':'октябрь','l69-541-weekday':'среда',
  'l69-542-answer':'q=0, r=a','l69-546-length':'15','l69-546-width':'12'
};
async function openLesson69(page:Page){await page.goto('/');const chapterThree=page.locator('.course-chapter-group').nth(2);if(!(await chapterThree.evaluate(element=>(element as HTMLDetailsElement).open)))await chapterThree.locator('summary').click();await page.getByRole('button',{name:/Открыть урок 69:/}).click();await expect(page.locator('.lesson-opening')).toContainText('Деление с остатком: задачи и закономерности');await page.locator('.lesson-opening-start').click()}

test('lesson 69 completes all 36 stages and the verified reinforcement route',async({page})=>{
  test.setTimeout(120_000);await page.addInitScript(()=>localStorage.setItem('mathnikita-mentor-auto-guide','false'));await openLesson69(page);
  const visited:string[]=[];
  for(let index=0;index<36;index+=1){const stage=page.locator('.lesson-runtime:not([hidden]) .interactive-stage[data-stage-id]');await expect(stage).toBeVisible();const id=await stage.getAttribute('data-stage-id');expect(id).toBeTruthy();visited.push(id!);await expect(stage.locator('.lesson-controls')).toContainText('Этап '+String(index+1)+' из 36');const answer=answers[id!];if(answer){if(await stage.locator('.choice-grid').count())await stage.getByRole('button',{name:answer,exact:true}).click();else await stage.locator('.inline-answer input').fill(answer);await stage.locator('.check-button').click();await expect(stage.locator('.instant-feedback.good')).toBeVisible()}if(index<35)await stage.locator('.lesson-controls .primary').click()}
  expect(new Set(visited).size).toBe(36);expect(visited[0]).toBe('l69-mission');expect(visited[35]).toBe('l69-summary');expect(Object.keys(answers)).toHaveLength(21);
  await expect(page.locator('.remainder-reinforcement-player')).toHaveAttribute('data-source-exercise-range','528,530,533,535,541,542,546');
  await expect(page.locator('.lesson-reflection')).toBeVisible();await expect(page.locator('.extended-practice[data-practice-task="l69-extra-01"]')).toBeVisible();await expect(page.locator('.extended-practice')).toHaveAttribute('data-practice-response-count','50');
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('mathnikita-lesson-69-progress-v1')??'null'));expect(saved?.stageIndex).toBe(35);expect(saved?.results?.['l69-p21']).toBe(true);
});
