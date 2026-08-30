import {expect,test,type Page} from '@playwright/test';

const answers:Record<string,string>={
  'l60-430-value':'13200',
  'l60-431-value':'149600',
  'l60-substitution-choice':'Собрать 8·125=1000',
  'l60-432-a':'36000',
  'l60-432-b':'74700',
  'l60-433-a':'18000',
  'l60-433-b':'11600',
  'l60-434-like':'1356',
  'l60-435-like':'3088',
  'l60-lab-conclusion':'Оба маршрута дают одно значение',
  'l60-436':'9000',
  'l60-437':'2700',
  'l60-438-a':'870',
  'l60-439-a':'6600',
  'l60-439-b':'10000',
  'l60-440':'139 км 808 м',
  'l60-441':'2 ч 50 мин',
  'l60-442':'24',
  'l60-443':'45',
  'l60-444':'5 и 9',
  'l60-445':'Автомобиль дешевле на 720 руб.'
};

async function openLesson60(page:Page){
  await page.goto('/');
  const chapterThree=page.locator('.course-chapter-group').nth(2);
  if(!(await chapterThree.evaluate(element=>(element as HTMLDetailsElement).open)))await chapterThree.locator('summary').click();
  await page.getByRole('button',{name:/Открыть урок 60:/}).click();
  await expect(page.locator('.lesson-opening')).toContainText('Стратегии свойств умножения');
  await page.locator('.lesson-opening-start').click();
}

test('lesson 60 completes all 36 stages and the full strategy route for exercises 430-446',async({page})=>{
  test.setTimeout(120_000);
  await page.addInitScript(()=>localStorage.setItem('mathnikita-mentor-auto-guide','false'));
  await openLesson60(page);
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
  expect(new Set(visited).size).toBe(36);expect(visited[0]).toBe('l60-mission');expect(visited[35]).toBe('l60-summary');expect(Object.keys(answers)).toHaveLength(21);
  await expect(page.locator('.multiplication-strategies-player')).toHaveAttribute('data-source-exercise-range','430-446');
  await expect(page.locator('.lesson-reflection')).toBeVisible();
  await expect(page.locator('.extended-practice[data-practice-task="l60-extra-01"]')).toBeVisible();
  await expect(page.locator('.extended-practice')).toHaveAttribute('data-practice-response-count','50');
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('mathnikita-lesson-60-progress-v1')??'null'));
  expect(saved?.stageIndex).toBe(35);expect(saved?.results?.['l60-p21']).toBe(true);
});
