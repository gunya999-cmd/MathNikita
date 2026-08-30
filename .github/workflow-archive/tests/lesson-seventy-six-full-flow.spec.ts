import {expect,test,type Page} from '@playwright/test';

const answers:Record<string,string>={
  'l76-oral-unit-rate':'15','l76-oral-answer':'120',
  'l76-580-area':'200000','l76-580-ha':'20','l76-580-seed':'5200','l76-580-enough':'нет','l76-580-shortage':'200',
  'l76-581-length':'450','l76-581-wall':'135000','l76-581-tile':'225','l76-581-needed':'600','l76-581-available':'600','l76-581-conclusion':'ровно хватит',
  'l76-583-area':'18','l76-583-paint':'3240','l76-583-enough':'нет','l76-583-shortage':'240',
  'l76-590-pair':'3','l76-590-max':'3','l76-590-best':'2×6 и 6×2','l76-592-conclusion':'равны'
};
async function openLesson76(page:Page){await page.goto('/');const chapterThree=page.locator('.course-chapter-group').nth(2);if(!(await chapterThree.evaluate(element=>(element as HTMLDetailsElement).open)))await chapterThree.locator('summary').click();await expect(page.getByRole('button',{name:/Открыть урок 76:/})).toBeEnabled();await page.getByRole('button',{name:/Открыть урок 76:/}).click();await expect(page.locator('.lesson-opening')).toContainText('Площадь. Площадь прямоугольника');await page.locator('.lesson-opening-start').click()}

test('lesson 76 completes all 36 stages and exact §21 applied-practice route',async({page})=>{
  test.setTimeout(170_000);await page.addInitScript(()=>localStorage.setItem('mathnikita-mentor-auto-guide','false'));await openLesson76(page);
  const visited:string[]=[];
  for(let index=0;index<36;index+=1){const stage=page.locator('.lesson-runtime:not([hidden]) .interactive-stage[data-stage-id]');await expect(stage).toBeVisible();const id=await stage.getAttribute('data-stage-id');expect(id).toBeTruthy();visited.push(id!);await expect(stage.locator('.lesson-controls')).toContainText('Этап '+String(index+1)+' из 36');const answer=answers[id!];if(answer){if(await stage.locator('.choice-grid').count())await stage.getByRole('button',{name:answer,exact:true}).click();else await stage.locator('.inline-answer input').fill(answer);await stage.locator('.check-button').click();await expect(stage.locator('.instant-feedback.good')).toBeVisible()}if(index<35)await stage.getByRole('button',{name:'Дальше →',exact:true}).click()}
  expect(new Set(visited).size).toBe(36);expect(visited[0]).toBe('l76-mission');expect(visited[35]).toBe('l76-summary');expect(Object.keys(answers)).toHaveLength(21);
  await expect(page.locator('.area-applied-practice-player')).toHaveAttribute('data-source-exercise-range','580,581,583,590,592');
  await expect(page.locator('.lesson-reflection')).toBeVisible();await expect(page.locator('.extended-practice[data-practice-task="l76-extra-01"]')).toBeVisible();await expect(page.locator('.extended-practice')).toHaveAttribute('data-practice-response-count','50');
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('mathnikita-lesson-76-progress-v1')??'null'));expect(saved?.stageIndex).toBe(35);expect(saved?.results?.['l76-p21']).toBe(true);
});
