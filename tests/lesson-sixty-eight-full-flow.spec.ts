import {expect,test,type Page} from '@playwright/test';

const answers:Record<string,string>={
  'l68-warmup':'47=5·9+2',
  'l68-521-1':'8,2',
  'l68-521-2':'24,16',
  'l68-521-3':'11,21',
  'l68-521-4':'22,24',
  'l68-521-check':'24',
  'l68-521-hard':'43,14',
  'l68-523-ten-31':'1',
  'l68-523-ten-1596':'6',
  'l68-523-ten-240750':'0',
  'l68-523-five-86':'1',
  'l68-523-five-235':'0',
  'l68-525-seven':'0,1,2,3,4,5,6',
  'l68-525-thirteen':'12',
  'l68-525-twentyfour':'23',
  'l68-527-count':'5',
  'l68-527-money':'50',
  'l68-527-check':'700=130·5+50',
  'l68-repeat-a':'30',
  'l68-repeat-b':'0,5',
  'l68-error':'29=6·4+5'
};

async function openLesson68(page:Page){
  await page.goto('/');
  const chapterThree=page.locator('.course-chapter-group').nth(2);
  if(!(await chapterThree.evaluate(element=>(element as HTMLDetailsElement).open)))await chapterThree.locator('summary').click();
  await page.getByRole('button',{name:/Открыть урок 68:/}).click();
  await expect(page.locator('.lesson-opening')).toContainText('Деление с остатком: смысл и правило');
  await page.locator('.lesson-opening-start').click();
}

test('lesson 68 completes all 36 stages and the verified §19 route',async({page})=>{
  test.setTimeout(120_000);
  await page.addInitScript(()=>localStorage.setItem('mathnikita-mentor-auto-guide','false'));
  await openLesson68(page);
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
  expect(new Set(visited).size).toBe(36);expect(visited[0]).toBe('l68-mission');expect(visited[35]).toBe('l68-summary');expect(Object.keys(answers)).toHaveLength(21);
  await expect(page.locator('.remainder-division-player')).toHaveAttribute('data-source-exercise-range','521,523,525,527,545');
  await expect(page.locator('.lesson-reflection')).toBeVisible();
  await expect(page.locator('.extended-practice[data-practice-task="l68-extra-01"]')).toBeVisible();
  await expect(page.locator('.extended-practice')).toHaveAttribute('data-practice-response-count','50');
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('mathnikita-lesson-68-progress-v1')??'null'));
  expect(saved?.stageIndex).toBe(35);expect(saved?.results?.['l68-p21']).toBe(true);
});
