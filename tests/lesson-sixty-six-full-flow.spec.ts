import {expect,test,type Page} from '@playwright/test';

const answers:Record<string,string>={
  'l66-warmup':'52·18=936',
  'l66-461-answer':'2044',
  'l66-estimate':'2 044',
  'l66-485-bags':'13',
  'l66-485-unit':'4',
  'l66-485-red':'24',
  'l66-485-yellow':'28',
  'l66-485-check':'52',
  'l66-factor':'42',
  'l66-dividend':'420',
  'l66-divisor':'36',
  'l66-rule-say':'неизвестный делитель = делимое : частное',
  'l66-493-train':'32',
  'l66-493-check':'21',
  'l66-503-answer':'128',
  'l66-group-transfer':'36',
  'l66-505-a':'84',
  'l66-505-b':'42',
  'l66-505-c':'120',
  'l66-505-sanity':'246',
  'l66-final-train':'72'
};

async function openLesson66(page:Page){
  await page.goto('/');
  const chapterThree=page.locator('.course-chapter-group').nth(2);
  if(!(await chapterThree.evaluate(element=>(element as HTMLDetailsElement).open)))await chapterThree.locator('summary').click();
  await page.getByRole('button',{name:/Открыть урок 66:/}).click();
  await expect(page.locator('.lesson-opening')).toContainText('Деление: уравнения и составные задачи');
  await page.locator('.lesson-opening-start').click();
}

test('lesson 66 completes all 36 stages and the official reinforcement route',async({page})=>{
  test.setTimeout(120_000);
  await page.addInitScript(()=>localStorage.setItem('mathnikita-mentor-auto-guide','false'));
  await openLesson66(page);
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
  expect(new Set(visited).size).toBe(36);expect(visited[0]).toBe('l66-mission');expect(visited[35]).toBe('l66-summary');expect(Object.keys(answers)).toHaveLength(21);
  await expect(page.locator('.division-reinforcement-two-player')).toHaveAttribute('data-source-exercise-range','461,485,493,503,505,513,515,520');
  await expect(page.locator('.lesson-reflection')).toBeVisible();
  await expect(page.locator('.extended-practice[data-practice-task="l66-extra-01"]')).toBeVisible();
  await expect(page.locator('.extended-practice')).toHaveAttribute('data-practice-response-count','50');
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('mathnikita-lesson-66-progress-v1')??'null'));
  expect(saved?.stageIndex).toBe(35);expect(saved?.results?.['l66-p21']).toBe(true);
});
