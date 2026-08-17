import {expect,test,type Page} from '@playwright/test';

const answers:Record<string,string>={
  'l47-recall-gate':'Длины сторон','l47-angle-dictation':'Тупоугольный','l47-unit-gate':'Равнобедренный','l47-passport-gate':'Прямоугольный равнобедренный','l47-independence-gate':'Треугольник равнобедренный',
  'l47-textbook344-step1':'42','l47-textbook344-step2':'21','l47-textbook344-answer':'87','l47-textbook346a':'29','l47-textbook346b':'12',
  'l47-equilateral-difference-side':'13','l47-equilateral-difference-perimeter':'39','l47-textbook348-expression':'p−22−b','l47-textbook348-value':'24','l47-inequality-gate':'Нет, потому что 2+3<6',
  'l47-textbook356a':'1677','l47-textbook356b':'194','l47-textbook356c':'917','l47-textbook356d':'4815','l47-control-passport':'Остроугольный разносторонний',
  'l47-control-third-side':'9','l47-control-type':'Равнобедренный','l47-final-gate':'14'
};

async function openLesson47(page:Page){await page.goto('/');const chapterTwo=page.locator('.course-chapter-group').nth(1);if(!(await chapterTwo.evaluate(element=>(element as HTMLDetailsElement).open)))await chapterTwo.locator('summary').click();await page.getByRole('button',{name:/Открыть урок 47:/}).click();await expect(page.locator('.lesson-opening')).toContainText('Треугольник и его виды — закрепление');await page.locator('.lesson-opening-start').click();}

test('lesson 47 completes all 36 consolidation stages and reaches mandatory practice',async({page})=>{
  test.setTimeout(120_000);await page.addInitScript(()=>localStorage.setItem('mathnikita-mentor-auto-guide','false'));await openLesson47(page);const visited:string[]=[];
  for(let index=0;index<36;index+=1){const stage=page.locator('.lesson-runtime:not([hidden]) .interactive-stage[data-stage-id]');await expect(stage).toBeVisible();const id=await stage.getAttribute('data-stage-id');expect(id).toBeTruthy();visited.push(id!);await expect(stage.locator('.lesson-controls')).toContainText(`Этап ${index+1} из 36`);const answer=answers[id!];if(answer){if(await stage.locator('.choice-grid').count())await stage.getByRole('button',{name:answer,exact:true}).click();else await stage.locator('.inline-answer input').fill(answer);await stage.locator('.check-button').click();await expect(stage.locator('.instant-feedback.good')).toBeVisible()}if(index<35)await stage.locator('.lesson-controls .primary').click()}
  expect(new Set(visited).size).toBe(36);expect(visited[0]).toBe('l47-mission');expect(visited[35]).toBe('l47-summary');await expect(page.locator('.lesson-reflection')).toBeVisible();await expect(page.locator('.extended-practice[data-practice-task="l47-extra-01"]')).toBeVisible();const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('mathnikita-lesson-47-progress-v1')??'null'));expect(saved?.stageIndex).toBe(35);expect(saved?.results?.['l47-p23']).toBe(true);
});
