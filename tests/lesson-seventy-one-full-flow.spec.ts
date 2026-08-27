import {expect,test,type Page} from '@playwright/test';

const answers:Record<string,string>={
  'l71-oral-1a':'50,0','l71-oral-1b':'1,60','l71-oral-2':'равенство верно, но это не корректная запись деления с остатком',
  'l71-base':'7','l71-exponent':'4','l71-reading':'три в пятой степени','l71-expand':'3·3·3·3·3',
  'l71-square':'9','l71-cube':'125','l71-first':'17','l71-order-multiply':'20','l71-order-add':'9',
  'l71-548-numeric':'4,8','l71-548-symbolic':'a,9','l71-549-simple':'9^5','l71-549-ten':'6^10',
  'l71-550-values':'27,49,625','l71-550-special':'0,121','l71-552-easy':'51,100','l71-552-order':'30','l71-560-repeat':'38,55'
};
async function openLesson71(page:Page){await page.goto('/');const chapterThree=page.locator('.course-chapter-group').nth(2);if(!(await chapterThree.evaluate(element=>(element as HTMLDetailsElement).open)))await chapterThree.locator('summary').click();await expect(page.getByRole('button',{name:/Открыть урок 71:/})).toBeEnabled();await page.getByRole('button',{name:/Открыть урок 71:/}).click();await expect(page.locator('.lesson-opening')).toContainText('Степень числа: основание, показатель, квадрат и куб');await page.locator('.lesson-opening-start').click()}

test('lesson 71 completes all 36 stages and the verified power route',async({page})=>{
  test.setTimeout(140_000);await page.addInitScript(()=>localStorage.setItem('mathnikita-mentor-auto-guide','false'));await openLesson71(page);
  const visited:string[]=[];
  for(let index=0;index<36;index+=1){const stage=page.locator('.lesson-runtime:not([hidden]) .interactive-stage[data-stage-id]');await expect(stage).toBeVisible();const id=await stage.getAttribute('data-stage-id');expect(id).toBeTruthy();visited.push(id!);await expect(stage.locator('.lesson-controls')).toContainText('Этап '+String(index+1)+' из 36');const answer=answers[id!];if(answer){if(await stage.locator('.choice-grid').count())await stage.getByRole('button',{name:answer,exact:true}).click();else await stage.locator('.inline-answer input').fill(answer);await stage.locator('.check-button').click();await expect(stage.locator('.instant-feedback.good')).toBeVisible()}if(index<35)await stage.locator('.lesson-controls .primary').click()}
  expect(new Set(visited).size).toBe(36);expect(visited[0]).toBe('l71-mission');expect(visited[35]).toBe('l71-summary');expect(Object.keys(answers)).toHaveLength(21);
  await expect(page.locator('.power-foundations-player')).toHaveAttribute('data-source-exercise-range','548,549,550,552,560');
  await expect(page.locator('.lesson-reflection')).toBeVisible();await expect(page.locator('.extended-practice[data-practice-task="l71-extra-01"]')).toBeVisible();await expect(page.locator('.extended-practice')).toHaveAttribute('data-practice-response-count','50');
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('mathnikita-lesson-71-progress-v1')??'null'));expect(saved?.stageIndex).toBe(35);expect(saved?.results?.['l71-p21']).toBe(true);
});
