import {expect,test,type Page} from '@playwright/test';

const answers:Record<string,string>={
  'l65-plan-choice':'288:4',
  'l65-division-check':'52',
  'l65-factor':'41',
  'l65-dividend':'888',
  'l65-divisor':'24',
  'l65-461-answer':'888',
  'l65-estimate':'888',
  'l65-483-day':'72',
  'l65-483-one':'24',
  'l65-483-seven':'168',
  'l65-483-check':'288',
  'l65-units-choice':'страниц у трёх операторов за день',
  'l65-expression-a':'21',
  'l65-expression-b':'116',
  'l65-equation-mixed':'84',
  'l65-501-sum':'264',
  'l65-501-ratio':'3',
  'l65-equation-transfer':'56',
  'l65-error-choice':'72 страницы/день для трёх операторов',
  'l65-519-green':'4',
  'l65-519-total':'22'
};

async function openLesson65(page:Page){
  await page.goto('/');
  const chapterThree=page.locator('.course-chapter-group').nth(2);
  if(!(await chapterThree.evaluate(element=>(element as HTMLDetailsElement).open)))await chapterThree.locator('summary').click();
  await page.getByRole('button',{name:/Открыть урок 65:/}).click();
  await expect(page.locator('.lesson-opening')).toContainText('Деление: комплексное закрепление');
  await page.locator('.lesson-opening-start').click();
}

test('lesson 65 completes all 36 stages and the official mixed-division route',async({page})=>{
  test.setTimeout(120_000);
  await page.addInitScript(()=>localStorage.setItem('mathnikita-mentor-auto-guide','false'));
  await openLesson65(page);
  const visited:string[]=[];
  for(let index=0;index<36;index+=1){
    const stage=page.locator('.lesson-runtime:not([hidden]) .interactive-stage[data-stage-id]');
    await expect(stage).toBeVisible();
    const id=await stage.getAttribute('data-stage-id');expect(id).toBeTruthy();visited.push(id!);
    await expect(stage.locator('.lesson-controls')).toContainText('Этап '+String(index+1)+' из 36');
    const answer=answers[id!];
    if(answer){
      if(await stage.locator('.choice-grid').count())await stage.getByRole('button',{name:answer,exact:true}).click();
      else await stage.locator('.inline-answer input').fill(answer);
      await stage.locator('.check-button').click();await expect(stage.locator('.instant-feedback.good')).toBeVisible();
    }
    if(index<35)await stage.locator('.lesson-controls .primary').click();
  }
  expect(new Set(visited).size).toBe(36);expect(visited[0]).toBe('l65-mission');expect(visited[35]).toBe('l65-summary');expect(Object.keys(answers)).toHaveLength(21);
  await expect(page.locator('.division-mixed-practice-player')).toHaveAttribute('data-source-exercise-range','461,483,491,499,501,512,519');
  await expect(page.locator('.lesson-reflection')).toBeVisible();
  await expect(page.locator('.extended-practice[data-practice-task="l65-extra-01"]')).toBeVisible();
  await expect(page.locator('.extended-practice')).toHaveAttribute('data-practice-response-count','50');
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('mathnikita-lesson-65-progress-v1')??'null'));
  expect(saved?.stageIndex).toBe(35);expect(saved?.results?.['l65-p21']).toBe(true);
});
