import {expect,test,type Page} from '@playwright/test';

const answers:Record<string,string>={
  'l67-warmup':'56·27=1512',
  'l67-510-1':'увеличится в 7 раз',
  'l67-510-2':'уменьшится в 4 раза',
  'l67-510-3':'увеличится в 4 раза',
  'l67-510-4':'уменьшится в 3 раза',
  'l67-510-5':'увеличится в 12 раз',
  'l67-510-6':'уменьшится в 12 раз',
  'l67-510-synthesis':'умножить оба на одно и то же ненулевое число',
  'l67-487-a':'35',
  'l67-487-b':'15',
  'l67-487-check':'50',
  'l67-497-train':'840',
  'l67-497-check':'24',
  'l67-507-a':'7',
  'l67-507-b':'35',
  'l67-507-c':'32',
  'l67-507-check':'74',
  'l67-509-train':'28',
  'l67-517-one':'2/2*2/2',
  'l67-517-five':'2+2+2/2',
  'l67-517-ten':'2+2*(2+2)'
};

async function openLesson67(page:Page){
  await page.goto('/');
  const chapterThree=page.locator('.course-chapter-group').nth(2);
  if(!(await chapterThree.evaluate(element=>(element as HTMLDetailsElement).open)))await chapterThree.locator('summary').click();
  await page.getByRole('button',{name:/Открыть урок 67:/}).click();
  await expect(page.locator('.lesson-opening')).toContainText('Деление: итоговое обобщение');
  await page.locator('.lesson-opening-start').click();
}

test('lesson 67 completes all 36 stages and the official synthesis route',async({page})=>{
  test.setTimeout(120_000);
  await page.addInitScript(()=>localStorage.setItem('mathnikita-mentor-auto-guide','false'));
  await openLesson67(page);
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
  expect(new Set(visited).size).toBe(36);expect(visited[0]).toBe('l67-mission');expect(visited[35]).toBe('l67-summary');expect(Object.keys(answers)).toHaveLength(21);
  await expect(page.locator('.division-synthesis-player')).toHaveAttribute('data-source-exercise-range','487,497,507,509,510,517');
  await expect(page.locator('.lesson-reflection')).toBeVisible();
  await expect(page.locator('.extended-practice[data-practice-task="l67-extra-01"]')).toBeVisible();
  await expect(page.locator('.extended-practice')).toHaveAttribute('data-practice-response-count','50');
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('mathnikita-lesson-67-progress-v1')??'null'));
  expect(saved?.stageIndex).toBe(35);expect(saved?.results?.['l67-p21']).toBe(true);
});
