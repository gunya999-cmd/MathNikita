import {expect,test,type Page} from '@playwright/test';

const answers:Record<string,string>={
  'l63-plan-check':'Скорость сближения',
  'l63-454-total':'98',
  'l63-454-second':'52',
  'l63-472-ilya-time':'8',
  'l63-472-distance':'72',
  'l63-472-alesha-time':'6',
  'l63-472-speed':'12',
  'l63-474-first-path':'232',
  'l63-474-second-path':'256',
  'l63-474-speed':'64',
  'l63-474-alt':'6',
  'l63-476-relative':'2',
  'l63-476-time':'6',
  'l63-478-speed':'84',
  'l63-478-distance':'588',
  'l63-480-speed':'48',
  'l63-480-time':'25',
  'l63-480-leave':'7:55',
  'l63-check-choice':'588:7=84',
  'l63-error-choice':'Нужно прийти на 10 минут раньше',
  'l63-challenge':'5'
};

async function openLesson63(page:Page){
  await page.goto('/');
  const chapterThree=page.locator('.course-chapter-group').nth(2);
  if(!(await chapterThree.evaluate(element=>(element as HTMLDetailsElement).open)))await chapterThree.locator('summary').click();
  await page.getByRole('button',{name:/Открыть урок 63:/}).click();
  await expect(page.locator('.lesson-opening')).toContainText('текстовые задачи арифметическим способом');
  await page.locator('.lesson-opening-start').click();
}

test('lesson 63 completes all 36 stages and the official arithmetic text-problem route',async({page})=>{
  test.setTimeout(120_000);
  await page.addInitScript(()=>localStorage.setItem('mathnikita-mentor-auto-guide','false'));
  await openLesson63(page);
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
  expect(new Set(visited).size).toBe(36);expect(visited[0]).toBe('l63-mission');expect(visited[35]).toBe('l63-summary');expect(Object.keys(answers)).toHaveLength(21);
  await expect(page.locator('.division-text-problems-player')).toHaveAttribute('data-source-exercise-range','454,472-480');
  await expect(page.locator('.lesson-reflection')).toBeVisible();
  await expect(page.locator('.extended-practice[data-practice-task="l63-extra-01"]')).toBeVisible();
  await expect(page.locator('.extended-practice')).toHaveAttribute('data-practice-response-count','50');
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('mathnikita-lesson-63-progress-v1')??'null'));
  expect(saved?.stageIndex).toBe(35);expect(saved?.results?.['l63-p21']).toBe(true);
});
