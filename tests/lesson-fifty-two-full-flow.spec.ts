import {expect,test,type Page} from '@playwright/test';

const answers:Record<string,string>={
  'l52-addition-check':'Переместительное и сочетательное свойства сложения',
  'l52-path-check':'288',
  'l52-formula-check':'b = 30a + 450',
  'l52-equation-check':'124',
  'l52-angle-check':'Тупой',
  'l52-composite-check':'68',
  'l52-polygon-check':'40',
  'l52-triangle-check':'24',
  'l52-rectangle-check':'36',
  'l52-test-01':'499 114',
  'l52-test-02':'9 ч 24 мин',
  'l52-test-03':'n − m = 18',
  'l52-test-04':'133',
  'l52-test-05':'Острый угол меньше тупого угла',
  'l52-test-06':'29°',
  'l52-test-07':'16 см',
  'l52-test-08':'46 см',
  'l52-test-09':'30 мин',
  'l52-test-10':'14 см',
  'l52-test-11':'При a = 0',
  'l52-test-12':'b = 30a + 450',
  'l52-error-check':'Он посчитал только полупериметр',
  'l52-readiness':'Вернуться к условию, правилу и единицам'
};

async function openLesson52(page:Page){
  await page.goto('/');
  const chapterTwo=page.locator('.course-chapter-group').nth(1);
  if(!(await chapterTwo.evaluate(element=>(element as HTMLDetailsElement).open)))await chapterTwo.locator('summary').click();
  await page.getByRole('button',{name:/Открыть урок 52:/}).click();
  await expect(page.locator('.lesson-opening')).toContainText('Глава 2: собираем знания в единую систему');
  await page.locator('.lesson-opening-start').click();
}

test('lesson 52 completes all 36 chapter-review stages and every textbook test item',async({page})=>{
  test.setTimeout(120_000);
  await page.addInitScript(()=>localStorage.setItem('mathnikita-mentor-auto-guide','false'));
  await openLesson52(page);
  const visited:string[]=[];
  for(let index=0;index<36;index+=1){
    const stage=page.locator('.lesson-runtime:not([hidden]) .interactive-stage[data-stage-id]');
    await expect(stage).toBeVisible();
    const id=await stage.getAttribute('data-stage-id');
    expect(id).toBeTruthy();visited.push(id!);
    await expect(stage.locator('.lesson-controls')).toContainText(`Этап ${index+1} из 36`);
    const answer=answers[id!];
    if(answer){
      if(await stage.locator('.choice-grid').count())await stage.getByRole('button',{name:answer,exact:true}).click();
      else await stage.locator('.inline-answer input').fill(answer);
      await stage.locator('.check-button').click();
      await expect(stage.locator('.instant-feedback.good')).toBeVisible();
    }
    if(index<35)await stage.locator('.lesson-controls .primary').click();
  }
  expect(new Set(visited).size).toBe(36);
  expect(visited[0]).toBe('l52-mission');expect(visited[35]).toBe('l52-summary');
  expect(Object.keys(answers)).toHaveLength(23);
  await expect(page.locator('.lesson-reflection')).toBeVisible();
  await expect(page.locator('.extended-practice[data-practice-task="l52-extra-01"]')).toBeVisible();
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('mathnikita-lesson-52-progress-v1')??'null'));
  expect(saved?.stageIndex).toBe(35);expect(saved?.results?.['l52-p23']).toBe(true);
});
