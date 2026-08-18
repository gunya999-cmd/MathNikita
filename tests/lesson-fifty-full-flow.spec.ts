import {expect,test,type Page} from '@playwright/test';

const answers:Record<string,string>={
  'l50-workbook158-half':'10','l50-workbook158-side':'4','l50-source366-side':'32','l50-source366-perimeter':'80','l50-source367-square':'48','l50-source367-side':'16','l50-source368-rectangle':'112','l50-source368-square':'28',
  'l50-source369-a':'14','l50-source369-b':'13','l50-source369-b-layers':'1 + 4 + 4 + 4 = 13','l50-source370-length':'20','l50-source370-square':'5','l50-source370-pentagon':'4','l50-source370-triangle':'Нет, 20 не делится на 3','l50-workbook159':'Только 18 см × 14 см',
  'l50-source371-sides':'19 и 28','l50-workbook164':'18','l50-source372-perimeters':'10 и 14','l50-source372-count':'2','l50-source373-dimensions':'4 см × 2 см','l50-source373-square-perimeter':'8','l50-source374-method':'Провести обе диагонали квадрата'
};

async function openLesson50(page:Page){
  await page.goto('/');
  const chapterTwo=page.locator('.course-chapter-group').nth(1);
  if(!(await chapterTwo.evaluate(element=>(element as HTMLDetailsElement).open)))await chapterTwo.locator('summary').click();
  await page.getByRole('button',{name:/Открыть урок 50:/}).click();
  await expect(page.locator('.lesson-opening')).toContainText('Периметр, квадраты и разрезания');
  await page.locator('.lesson-opening-start').click();
}

test('lesson 50 completes all 36 source-grounded stages and reaches mandatory practice',async({page})=>{
  test.setTimeout(120_000);
  await page.addInitScript(()=>localStorage.setItem('mathnikita-mentor-auto-guide','false'));
  await openLesson50(page);
  const visited:string[]=[];
  for(let index=0;index<36;index+=1){
    const stage=page.locator('.lesson-runtime:not([hidden]) .interactive-stage[data-stage-id]');
    await expect(stage).toBeVisible();
    const id=await stage.getAttribute('data-stage-id');
    expect(id).toBeTruthy();
    visited.push(id!);
    await expect(stage.locator('.lesson-controls')).toContainText(`Этап ${index+1} из 36`);
    const answer=answers[id!];
    if(answer){
      if(await stage.locator('.choice-grid').count())await stage.getByRole('button',{name:answer,exact:true}).click();
      else await stage.locator('.inline-answer input').fill(answer);
      await stage.locator('.check-button').click();
      await expect(stage.locator('.instant-feedback.good')).toBeVisible();
    }
    if(index<35)await stage.locator('.lesson-controls .primary').click();
  }
  expect(new Set(visited).size).toBe(36);
  expect(visited[0]).toBe('l50-mission');
  expect(visited[35]).toBe('l50-summary');
  expect(Object.keys(answers)).toHaveLength(23);
  await expect(page.locator('.lesson-reflection')).toBeVisible();
  await expect(page.locator('.extended-practice[data-practice-task="l50-extra-01"]')).toBeVisible();
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('mathnikita-lesson-50-progress-v1')??'null'));
  expect(saved?.stageIndex).toBe(35);
  expect(saved?.results?.['l50-p23']).toBe(true);
});
