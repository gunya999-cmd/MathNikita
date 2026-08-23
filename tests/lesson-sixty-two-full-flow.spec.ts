import {expect,test,type Page} from '@playwright/test';

const answers:Record<string,string>={
  'l62-component-check':'18',
  'l62-452-1':'3425000',
  'l62-452-2':'34250',
  'l62-452-3':'3425',
  'l62-452-4':'320',
  'l62-452-5':'32',
  'l62-452-6':'13500',
  'l62-455-1':'4648',
  'l62-455-2':'343',
  'l62-456-1':'3196',
  'l62-456-2':'173',
  'l62-check-343':'304·52=15808',
  'l62-estimate-choice':'135',
  'l62-465':'58',
  'l62-466':'Да',
  'l62-468':'17',
  'l62-470':'18',
  'l62-unknown-dividend':'1200',
  'l62-unknown-divisor':'7',
  'l62-zero-rule':'84:0 не определено',
  'l62-challenge':'35'
};

async function openLesson62(page:Page){
  await page.goto('/');
  const chapterThree=page.locator('.course-chapter-group').nth(2);
  if(!(await chapterThree.evaluate(element=>(element as HTMLDetailsElement).open)))await chapterThree.locator('summary').click();
  await page.getByRole('button',{name:/Открыть урок 62:/}).click();
  await expect(page.locator('.lesson-opening')).toContainText('Деление: вычисления и задачи');
  await page.locator('.lesson-opening-start').click();
}

test('lesson 62 completes all 36 stages and the official division reinforcement route',async({page})=>{
  test.setTimeout(120_000);
  await page.addInitScript(()=>localStorage.setItem('mathnikita-mentor-auto-guide','false'));
  await openLesson62(page);
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
  expect(new Set(visited).size).toBe(36);expect(visited[0]).toBe('l62-mission');expect(visited[35]).toBe('l62-summary');expect(Object.keys(answers)).toHaveLength(21);
  await expect(page.locator('.division-reinforcement-player')).toHaveAttribute('data-source-exercise-range','452-470');
  await expect(page.locator('.lesson-reflection')).toBeVisible();
  await expect(page.locator('.extended-practice[data-practice-task="l62-extra-01"]')).toBeVisible();
  await expect(page.locator('.extended-practice')).toHaveAttribute('data-practice-response-count','50');
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('mathnikita-lesson-62-progress-v1')??'null'));
  expect(saved?.stageIndex).toBe(35);expect(saved?.results?.['l62-p21']).toBe(true);
});
