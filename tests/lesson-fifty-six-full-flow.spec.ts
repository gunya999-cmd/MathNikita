import {expect,test,type Page} from '@playwright/test';

const answers:Record<string,string>={
  'l56-units-write':'2',
  'l56-units-carry':'4',
  'l56-tens-write':'8',
  'l56-tens-carry':'2',
  'l56-product-347':'2082',
  'l56-direction-check':'Справа налево: от единиц к старшим разрядам',
  'l56-zero-units':'6',
  'l56-product-508':'3556',
  'l56-zero-error':'Вычислить 0·7+5=5',
  'l56-product-1245':'4980',
  'l56-transfer-check':'9',
  'l56-product-9006':'27018',
  'l56-product-7008':'28032',
  'l56-product-999':'8991',
  'l56-estimate-check':'От 4 000 до 6 000',
  'l56-route-river':'135',
  'l56-route-difference':'12',
  'l56-fruit-multiplication':'658',
  'l56-fruit-total':'830',
  'l56-budget-check':'Денег хватает, останется 200 р.',
  'l56-mastery-gate':'1180'
};

async function openLesson56(page:Page){
  await page.goto('/');
  const chapterThree=page.locator('.course-chapter-group').nth(2);
  if(!(await chapterThree.evaluate(element=>(element as HTMLDetailsElement).open)))await chapterThree.locator('summary').click();
  await page.getByRole('button',{name:/Открыть урок 56:/}).click();
  await expect(page.locator('.lesson-opening')).toContainText('Письменное умножение: перенос без потерь');
  await page.locator('.lesson-opening-start').click();
}

test('lesson 56 completes all 36 stages and the full written-multiplication route',async({page})=>{
  test.setTimeout(120_000);
  await page.addInitScript(()=>localStorage.setItem('mathnikita-mentor-auto-guide','false'));
  await openLesson56(page);
  const visited:string[]=[];
  for(let index=0;index<36;index+=1){
    const stage=page.locator('.lesson-runtime:not([hidden]) .interactive-stage[data-stage-id]');
    await expect(stage).toBeVisible();
    const id=await stage.getAttribute('data-stage-id');
    expect(id).toBeTruthy();visited.push(id!);
    await expect(stage.locator('.lesson-controls')).toContainText('Этап '+String(index+1)+' из 36');
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
  expect(visited[0]).toBe('l56-mission');expect(visited[35]).toBe('l56-summary');
  expect(Object.keys(answers)).toHaveLength(21);
  await expect(page.locator('.written-multiplication-player')).toHaveAttribute('data-source-exercise-range','393-398');
  await expect(page.locator('.lesson-reflection')).toBeVisible();
  await expect(page.locator('.extended-practice[data-practice-task="l56-extra-01"]')).toBeVisible();
  await expect(page.locator('.extended-practice')).toHaveAttribute('data-practice-response-count','50');
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('mathnikita-lesson-56-progress-v1')??'null'));
  expect(saved?.stageIndex).toBe(35);expect(saved?.results?.['l56-p21']).toBe(true);
});
