import {expect,test,type Page} from '@playwright/test';

const answers:Record<string,string>={
  'l64-rule-check':'21·16',
  'l64-example-factor-root':'7',
  'l64-example-factor-check':'84',
  'l64-example-dividend-root':'336',
  'l64-example-dividend-check':'16',
  'l64-example-divisor-root':'32',
  'l64-example-divisor-check':'18',
  'l64-457-1':'15',
  'l64-457-2':'26',
  'l64-457-3':'24',
  'l64-457-4':'32',
  'l64-457-5':'494',
  'l64-457-6':'34',
  'l64-458-1':'5',
  'l64-458-2':'6',
  'l64-458-3':'67',
  'l64-458-4':'34',
  'l64-458-5':'400',
  'l64-458-6':'12',
  'l64-459':'15',
  'l64-460':'12'
};

async function openLesson64(page:Page){
  await page.goto('/');
  const chapterThree=page.locator('.course-chapter-group').nth(2);
  if(!(await chapterThree.evaluate(element=>(element as HTMLDetailsElement).open)))await chapterThree.locator('summary').click();
  await page.getByRole('button',{name:/Открыть урок 64:/}).click();
  await expect(page.locator('.lesson-opening')).toContainText('Деление: решение уравнений');
  await page.locator('.lesson-opening-start').click();
}

test('lesson 64 completes all 36 stages and the official division-equations route',async({page})=>{
  test.setTimeout(120_000);
  await page.addInitScript(()=>localStorage.setItem('mathnikita-mentor-auto-guide','false'));
  await openLesson64(page);
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
  expect(new Set(visited).size).toBe(36);expect(visited[0]).toBe('l64-mission');expect(visited[35]).toBe('l64-summary');expect(Object.keys(answers)).toHaveLength(21);
  await expect(page.locator('.division-equations-player')).toHaveAttribute('data-source-exercise-range','457-460');
  await expect(page.locator('.lesson-reflection')).toBeVisible();
  await expect(page.locator('.extended-practice[data-practice-task="l64-extra-01"]')).toBeVisible();
  await expect(page.locator('.extended-practice')).toHaveAttribute('data-practice-response-count','50');
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('mathnikita-lesson-64-progress-v1')??'null'));
  expect(saved?.stageIndex).toBe(35);expect(saved?.results?.['l64-p21']).toBe(true);
});
