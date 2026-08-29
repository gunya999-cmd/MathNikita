import {expect,test,type Page} from '@playwright/test';

const answers:Record<string,string>={
  'l58-left-route':'700',
  'l58-right-route':'700',
  'l58-property-choice':'(a·b)·c=a·(b·c)',
  'l58-legal-transform':'(6·25)·4=6·(25·4)',
  'l58-420-a':'3280',
  'l58-420-b':'43000',
  'l58-420-c':'24300',
  'l58-lab-conclusion':'Полные значения (a·b)·c и a·(b·c) равны',
  'l58-420-d':'720',
  'l58-420-e':'23600',
  'l58-420-f':'3000',
  'l58-421-a':'1700',
  'l58-421-b':'6730',
  'l58-421-c':'475000',
  'l58-421-d':'1460',
  'l58-421-e':'91600',
  'l58-421-f':'9000',
  'l58-coefficient-a':'26a',
  'l58-coefficient-y':'140y',
  'l58-coefficient-abc':'96abc',
  'l58-error-choice':'Умножение 328·5 заменили сложением 328+5'
};

async function openLesson58(page:Page){
  await page.goto('/');
  const chapterThree=page.locator('.course-chapter-group').nth(2);
  if(!(await chapterThree.evaluate(element=>(element as HTMLDetailsElement).open)))await chapterThree.locator('summary').click();
  await page.getByRole('button',{name:/Открыть урок 58:/}).click();
  await expect(page.locator('.lesson-opening')).toContainText('Сочетательное свойство умножения');
  await page.locator('.lesson-opening-start').click();
}

test('lesson 58 completes all 36 stages and the full associative-property route',async({page})=>{
  test.setTimeout(120_000);
  await page.addInitScript(()=>localStorage.setItem('mathnikita-mentor-auto-guide','false'));
  await openLesson58(page);
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
  expect(new Set(visited).size).toBe(36);expect(visited[0]).toBe('l58-mission');expect(visited[35]).toBe('l58-summary');expect(Object.keys(answers)).toHaveLength(21);
  await expect(page.locator('.associative-multiplication-player')).toHaveAttribute('data-source-exercise-range','420-423');
  await expect(page.locator('.lesson-reflection')).toBeVisible();
  await expect(page.locator('.extended-practice[data-practice-task="l58-extra-01"]')).toBeVisible();
  await expect(page.locator('.extended-practice')).toHaveAttribute('data-practice-response-count','50');
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('mathnikita-lesson-58-progress-v1')??'null'));
  expect(saved?.stageIndex).toBe(35);expect(saved?.results?.['l58-p21']).toBe(true);
});
