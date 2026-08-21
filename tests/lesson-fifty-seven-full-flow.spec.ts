import {expect,test,type Page} from '@playwright/test';

const answers:Record<string,string>={
  'l57-expression-inner':'892',
  'l57-expression-first-branch':'246192',
  'l57-expression-second-branch':'53152',
  'l57-expression-total':'299344',
  'l57-same-direction':'40',
  'l57-opposite-direction':'1089',
  'l57-motion-choice':'В одном направлении берём разность, в противоположных — сумму',
  'l57-meeting-speed':'77',
  'l57-meeting-distance':'352',
  'l57-scale-one':'8',
  'l57-scale-both':'36',
  'l57-scale-mixed':'4',
  'l57-product-sum-choice':'1 и 2: 1·2=2 < 1+2=3',
  'l57-identity-a5':'1',
  'l57-identity-aa':'0 и 1',
  'l57-sum-product':'1, 1, 2, 4',
  'l57-expression-100':'(1·2+3)·4·5',
  'l57-error-perimeter':'112',
  'l57-error-side':'28',
  'l57-triangle-perimeter':'57',
  'l57-master-expression':'6000'
};

async function openLesson57(page:Page){
  await page.goto('/');
  const chapterThree=page.locator('.course-chapter-group').nth(2);
  if(!(await chapterThree.evaluate(element=>(element as HTMLDetailsElement).open)))await chapterThree.locator('summary').click();
  await page.getByRole('button',{name:/Открыть урок 57:/}).click();
  await expect(page.locator('.lesson-opening')).toContainText('Умножение в задачах, доказательствах и головоломках');
  await page.locator('.lesson-opening-start').click();
}

test('lesson 57 completes all 36 stages and the full multiplication-mastery route',async({page})=>{
  test.setTimeout(120_000);
  await page.addInitScript(()=>localStorage.setItem('mathnikita-mentor-auto-guide','false'));
  await openLesson57(page);
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
  expect(new Set(visited).size).toBe(36);expect(visited[0]).toBe('l57-mission');expect(visited[35]).toBe('l57-summary');expect(Object.keys(answers)).toHaveLength(21);
  await expect(page.locator('.multiplication-mastery-player')).toHaveAttribute('data-source-exercise-range','399-419');
  await expect(page.locator('.lesson-reflection')).toBeVisible();
  await expect(page.locator('.extended-practice[data-practice-task="l57-extra-01"]')).toBeVisible();
  await expect(page.locator('.extended-practice')).toHaveAttribute('data-practice-response-count','50');
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('mathnikita-lesson-57-progress-v1')??'null'));
  expect(saved?.stageIndex).toBe(35);expect(saved?.results?.['l57-p21']).toBe(true);
});
