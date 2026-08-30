import {expect,test,type Page} from '@playwright/test';

const answers:Record<string,string>={
  'l59-whole-route':'138',
  'l59-parts-route':'138',
  'l59-property-choice':'a·(b+c)=a·b+a·c',
  'l59-subtraction-route':'182',
  'l59-subtraction-formula-choice':'a·b−a·c',
  'l59-factor-choice':'632',
  'l59-424-a':'31800',
  'l59-424-b':'276',
  'l59-lab-conclusion':'Полные значения a·(b±c) и a·b±a·c равны',
  'l59-424-c':'471500',
  'l59-424-d':'0',
  'l59-425-a':'63200',
  'l59-425-b':'49',
  'l59-425-c':'7540',
  'l59-425-d':'3700',
  'l59-426-a':'2a+10',
  'l59-426-b':'56-8x',
  'l59-426-c':'12x+12y',
  'l59-427-a':'4a+8',
  'l59-427-c':'9p-9q',
  'l59-428-a':'14a'
};

async function openLesson59(page:Page){
  await page.goto('/');
  const chapterThree=page.locator('.course-chapter-group').nth(2);
  if(!(await chapterThree.evaluate(element=>(element as HTMLDetailsElement).open)))await chapterThree.locator('summary').click();
  await page.getByRole('button',{name:/Открыть урок 59:/}).click();
  await expect(page.locator('.lesson-opening')).toContainText('Распределительное свойство умножения');
  await page.locator('.lesson-opening-start').click();
}

test('lesson 59 completes all 36 stages and the full distributive-property route',async({page})=>{
  test.setTimeout(120_000);
  await page.addInitScript(()=>localStorage.setItem('mathnikita-mentor-auto-guide','false'));
  await openLesson59(page);
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
  expect(new Set(visited).size).toBe(36);expect(visited[0]).toBe('l59-mission');expect(visited[35]).toBe('l59-summary');expect(Object.keys(answers)).toHaveLength(21);
  await expect(page.locator('.distributive-multiplication-player')).toHaveAttribute('data-source-exercise-range','424-429');
  await expect(page.locator('.lesson-reflection')).toBeVisible();
  await expect(page.locator('.extended-practice[data-practice-task="l59-extra-01"]')).toBeVisible();
  await expect(page.locator('.extended-practice')).toHaveAttribute('data-practice-response-count','50');
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('mathnikita-lesson-59-progress-v1')??'null'));
  expect(saved?.stageIndex).toBe(35);expect(saved?.results?.['l59-p21']).toBe(true);
});
