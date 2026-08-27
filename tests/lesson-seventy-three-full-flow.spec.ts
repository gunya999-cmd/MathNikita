import {expect,test,type Page} from '@playwright/test';

const answers:Record<string,string>={
  'l73-1a':'87048','l73-1b':'35700','l73-1c':'52','l73-1d':'1475','l73-2':'209',
  'l73-3a':'26','l73-3b':'36','l73-3c':'18','l73-4a':'7900','l73-4b':'8900',
  'l73-5':'40','l73-6':'48','l73-7':'5'
};

async function openLesson73(page:Page){
  await page.goto('/');
  const chapterThree=page.locator('.course-chapter-group').nth(2);
  if(!(await chapterThree.evaluate(element=>(element as HTMLDetailsElement).open)))await chapterThree.locator('summary').click();
  await expect(page.getByRole('button',{name:/Открыть урок 73:/})).toBeEnabled();
  await page.getByRole('button',{name:/Открыть урок 73:/}).click();
  await page.locator('.lesson-opening-start').click();
  await expect(page.locator('.control-work-page[data-control-work="4"]')).toBeVisible();
}

async function fillStage(page:Page){
  const stage=page.locator('.lesson-runtime:not([hidden]) .control-stage[data-stage-id]');
  const fields=stage.locator('[data-control-field]');
  for(let index=0;index<await fields.count();index+=1){
    const field=fields.nth(index);const id=await field.getAttribute('data-control-field');
    expect(id).toBeTruthy();await field.locator('input').fill(answers[id!]!);
  }
}

test('lesson 73 completes exact control work 4 variant 1 and persists 13/13',async({page})=>{
  test.setTimeout(90_000);
  await openLesson73(page);
  await expect(page.locator('.cat-mentor')).toHaveCount(0);
  await expect(page.locator('.cat-mentor-actions')).toHaveCount(0);
  await expect(page.locator('.practice-pythagoras-actions')).toHaveCount(0);
  await expect(page.locator('.control-work-page')).toHaveAttribute('data-control-field-count','13');
  const stage=page.locator('.lesson-runtime:not([hidden]) .control-stage[data-stage-id]');
  await expect(stage).toHaveAttribute('data-stage-id','l73-rules');
  await page.locator('.lesson-controls .primary').click();
  for(let task=1;task<=7;task+=1){
    await expect(stage).toHaveAttribute('data-stage-id',`l73-task${task}`);
    await fillStage(page);
    await page.locator('.lesson-controls .primary').click();
  }
  await expect(stage).toHaveAttribute('data-stage-id','l73-submit');
  await expect(page.locator('.control-submit-card')).toContainText('13/13');
  await page.getByRole('button',{name:'Сдать контрольную работу'}).click();
  await expect(stage).toHaveAttribute('data-stage-id','l73-summary');
  await expect(page.locator('.control-score')).toContainText('13/13');
  await expect(page.locator('.control-score')).toContainText('Оценка: 5');
  await expect(page.locator('.control-correction-card')).toContainText('13 из 13');
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('mathnikita-lesson-73-control-v1')??'null'));
  expect(saved?.submitted).toBe(true);expect(saved?.stageIndex).toBe(9);expect(Object.keys(saved?.submittedResponses??{})).toHaveLength(13);
  const complete=await page.evaluate(()=>JSON.parse(localStorage.getItem('mathnikita:lesson-complete:73')??'null'));
  expect(complete?.completedAt).toBeTruthy();
  await page.reload();
  await page.getByRole('button',{name:/Открыть урок 73:/}).click();await page.locator('.lesson-opening-start').click();
  await expect(page.locator('.lesson-runtime:not([hidden]) .control-stage')).toHaveAttribute('data-stage-id','l73-summary');
  await expect(page.locator('.control-score')).toContainText('13/13');
});
