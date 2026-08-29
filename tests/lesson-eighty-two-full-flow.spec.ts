import {expect,test,type Page} from '@playwright/test';

const answers:Record<string,string>={
  'l82-layer-count':'30','l82-layer-number':'4','l82-example-volume':'120','l82-abc-check':'V = abc','l82-units-check':'да',
  'l82-619-base':'180','l82-619-volume':'1080','l82-620-volume':'216','l82-vsh-check':'V = Sh','l82-inverse-example':'6',
  'l82-624-length':'18','l82-624-height':'6','l82-624-volume':'1620','l82-628-area':'36','l82-632-volume':'64','l82-632-mass':'448',
  'l82-dict-mixed':'600','l82-dict-cubes':'189','l82-question5':'V=abc','l82-question6':'V=a3','l82-question7':'V=Sh'
};
async function openLesson82(page:Page){await page.goto('/');const chapterThree=page.locator('.course-chapter-group').nth(2);if(!(await chapterThree.evaluate(element=>(element as HTMLDetailsElement).open)))await chapterThree.locator('summary').click();await expect(page.getByRole('button',{name:/Открыть урок 82:/})).toBeEnabled();await page.getByRole('button',{name:/Открыть урок 82:/}).click();await expect(page.locator('.lesson-opening')).toContainText('Объём прямоугольного параллелепипеда');await page.locator('.lesson-opening-start').click()}

test('lesson 82 completes all 36 stages and exact volume-formula route',async({page})=>{
  test.setTimeout(180_000);await page.addInitScript(()=>localStorage.setItem('mathnikita-mentor-auto-guide','false'));await openLesson82(page);
  const visited:string[]=[];
  for(let index=0;index<36;index+=1){const stage=page.locator('.lesson-runtime:not([hidden]) .interactive-stage[data-stage-id]');await expect(stage).toBeVisible();const id=await stage.getAttribute('data-stage-id');expect(id).toBeTruthy();visited.push(id!);await expect(stage.locator('.lesson-controls')).toContainText('Этап '+String(index+1)+' из 36');const answer=answers[id!];if(answer){if(await stage.locator('.choice-grid').count())await stage.getByRole('button',{name:answer,exact:true}).click();else await stage.locator('.inline-answer input').fill(answer);await stage.locator('.check-button').click();await expect(stage.locator('.instant-feedback.good')).toBeVisible()}if(index<35)await stage.locator('.lesson-controls .primary').click()}
  expect(new Set(visited).size).toBe(36);expect(visited[0]).toBe('l82-mission');expect(visited[35]).toBe('l82-summary');expect(Object.keys(answers)).toHaveLength(21);
  await expect(page.locator('.volume-formula-player')).toHaveAttribute('data-source-exercise-range','619,620,624,628,632,642');
  await expect(page.locator('.lesson-reflection')).toBeVisible();await expect(page.locator('.extended-practice[data-practice-task="l82-extra-01"]')).toBeVisible();await expect(page.locator('.extended-practice')).toHaveAttribute('data-practice-response-count','50');
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('mathnikita-lesson-82-progress-v1')??'null'));expect(saved?.stageIndex).toBe(35);expect(saved?.results?.['l82-p21']).toBe(true);
});
