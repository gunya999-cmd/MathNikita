import {expect,test,type Page} from '@playwright/test';

const answers:Record<string,string>={
  'l61-share-basic':'4',
  'l61-groups-basic':'4 пакета',
  'l61-447-a':'425',
  'l61-447-b':'243',
  'l61-448-product':'4608',
  'l61-448-quotient':'48',
  'l61-missing-factor':'9',
  'l61-name-dividend':'84',
  'l61-table-relation':'7',
  'l61-exactness-check':'Нет: ни одно натуральное n не даёт 6·n=35',
  'l61-zero-dividend':'0',
  'l61-divide-one':'84',
  'l61-divide-self':'1',
  'l61-zero-divisor':'Делить на ноль нельзя',
  'l61-check-52':'52',
  'l61-lab-conclusion':'Оба смысла дают одно частное и одну проверку c·b=a',
  'l61-450-1':'43',
  'l61-451-3':'505',
  'l61-452-5':'32',
  'l61-453-6':'3109',
  'l61-error-hunt':'0:0=0'
};

async function openLesson61(page:Page){
  await page.goto('/');
  const chapterThree=page.locator('.course-chapter-group').nth(2);
  if(!(await chapterThree.evaluate(element=>(element as HTMLDetailsElement).open)))await chapterThree.locator('summary').click();
  await page.getByRole('button',{name:/Открыть урок 61:/}).click();
  await expect(page.locator('.lesson-opening')).toContainText('Смысл деления');
  await page.locator('.lesson-opening-start').click();
}

test('lesson 61 completes all 36 stages and the first division route for exercises 447-453',async({page})=>{
  test.setTimeout(120_000);
  await page.addInitScript(()=>localStorage.setItem('mathnikita-mentor-auto-guide','false'));
  await openLesson61(page);
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
  expect(new Set(visited).size).toBe(36);expect(visited[0]).toBe('l61-mission');expect(visited[35]).toBe('l61-summary');expect(Object.keys(answers)).toHaveLength(21);
  await expect(page.locator('.division-meaning-player')).toHaveAttribute('data-source-exercise-range','447-453');
  await expect(page.locator('.lesson-reflection')).toBeVisible();
  await expect(page.locator('.extended-practice[data-practice-task="l61-extra-01"]')).toBeVisible();
  await expect(page.locator('.extended-practice')).toHaveAttribute('data-practice-response-count','50');
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('mathnikita-lesson-61-progress-v1')??'null'));
  expect(saved?.stageIndex).toBe(35);expect(saved?.results?.['l61-p21']).toBe(true);
});
