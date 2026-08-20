import {expect,test,type Page} from '@playwright/test';

const answers:Record<string,string>={
  'l54-sum-product':'7·4',
  'l54-product-sum':'5+5+5',
  'l54-order-trap':'7·4',
  'l54-factors-check':'3 и 8',
  'l54-product-name':'Значение произведения',
  'l54-one-check':'a',
  'l54-zero-check':'0',
  'l54-zero-factor':'0',
  'l54-commutative-check':'6·9',
  'l54-ex384-1':'6·8',
  'l54-ex384-2':'9·5',
  'l54-ex384-variables':'n·7',
  'l54-oral-product':'84',
  'l54-tens-check':'3400',
  'l54-operation-check':'56',
  'l54-notebook-plan':'34·12+18·16',
  'l54-notebook-answer':'696',
  'l54-error-analysis':'7·4',
  'l54-mixed-gate':'48',
  'l54-array-proof':'24',
  'l54-zero-quiz':'Хотя бы один множитель равен нулю'
};

async function openLesson54(page:Page){
  await page.goto('/');
  const chapterThree=page.locator('.course-chapter-group').nth(2);
  if(!(await chapterThree.evaluate(element=>(element as HTMLDetailsElement).open)))await chapterThree.locator('summary').click();
  await page.getByRole('button',{name:/Открыть урок 54:/}).click();
  await expect(page.locator('.lesson-opening')).toContainText('Умножение: от одинаковых слагаемых');
  await page.locator('.lesson-opening-start').click();
}

test('lesson 54 completes all 36 stages and the full §16 concept route',async({page})=>{
  test.setTimeout(120_000);
  await page.addInitScript(()=>localStorage.setItem('mathnikita-mentor-auto-guide','false'));
  await openLesson54(page);
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
  expect(visited[0]).toBe('l54-mission');expect(visited[35]).toBe('l54-summary');
  expect(Object.keys(answers)).toHaveLength(21);
  await expect(page.locator('.multiplication-meaning-player')).toHaveAttribute('data-source-exercise-range','384-419');
  await expect(page.locator('.lesson-reflection')).toBeVisible();
  await expect(page.locator('.extended-practice[data-practice-task="l54-extra-01"]')).toBeVisible();
  await expect(page.locator('.extended-practice')).toHaveAttribute('data-practice-response-count','50');
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('mathnikita-lesson-54-progress-v1')??'null'));
  expect(saved?.stageIndex).toBe(35);expect(saved?.results?.['l54-p21']).toBe(true);
});
