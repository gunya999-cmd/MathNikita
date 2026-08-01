import { expect,test,type Page } from '@playwright/test';

type Answer={type:'choice';value:string}|{type:'input';value:string}|{type:'order';values:string[]};
const answers:Record<string,Answer>={
  'l10-plane-check':{type:'choice',value:'поверхность стола'},
  'l10-one-line-check':{type:'input',value:'1'},
  'l10-name-check':{type:'choice',value:'AB, BA или m'},
  'l10-ray-check':{type:'choice',value:'OA'},
  'l10-practice1':{type:'choice',value:'прямая'},
  'l10-practice2':{type:'input',value:'2'},
  'l10-practice3':{type:'choice',value:'KP'},
  'l10-practice4':{type:'choice',value:'OA и OB'},
  'l10-practice5':{type:'order',values:['Отметить две различные точки A и B','Приложить линейку к точкам A и B','Провести линию через обе точки','Продолжить изображение в обе стороны']},
  'l10-practice6':{type:'choice',value:'луч фонаря, выходящий из источника в одном направлении'},
  'l10-quiz1':{type:'choice',value:'плоскость бесконечна'},
  'l10-quiz2':{type:'input',value:'1'},
  'l10-quiz3':{type:'input',value:'0'},
  'l10-quiz4':{type:'choice',value:'O'},
  'l10-quiz5':{type:'input',value:'2'},
  'l10-challenge':{type:'input',value:'3'},
};

async function openLessonTen(page:Page){
  await page.goto('/');
  const lessons=page.locator('.course-lesson-grid > button.is-interactive');
  await expect(lessons).toHaveCount(18);
  await lessons.nth(9).click();
  await expect(page.getByRole('heading',{name:'Плоскость. Прямая. Луч'}).first()).toBeVisible();
  await page.locator('.lesson-opening-start').click();
  await expect(page.locator('[data-stage-id="l10-story"]')).toBeVisible();
  await expect(page.locator('.cat-mentor-collapsed')).toBeVisible();
}

async function answerStage(page:Page,answer:Answer){
  const stage=page.locator('.lesson-runtime:not([hidden]) .interactive-stage');
  if(answer.type==='input')await stage.locator('.inline-answer input').fill(answer.value);
  else if(answer.type==='choice')await stage.getByRole('button',{name:answer.value,exact:true}).click();
  else for(const value of answer.values)await stage.locator('.order-bank').getByRole('button',{name:value,exact:true}).click();
  await stage.locator('.check-button').click();
  await expect(stage.locator('.instant-feedback.good')).toBeVisible();
}

test('lesson 10 completes every exercise and produces full scores on iPad WebKit',async({page})=>{
  test.setTimeout(180_000);await openLessonTen(page);const visited=new Set<string>();
  for(let step=0;step<23;step+=1){
    const stage=page.locator('.lesson-runtime:not([hidden]) .interactive-stage');
    const stageId=await stage.getAttribute('data-stage-id');
    expect(stageId,`Stage ${step+1} must have data-stage-id`).toBeTruthy();
    visited.add(stageId!);
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
    expect(overflow,`Horizontal overflow at ${stageId}`).toBeLessThanOrEqual(2);
    if(await stage.locator('.activity-area').count()){
      const answer=answers[stageId!];
      expect(answer,`Missing automated answer for ${stageId}`).toBeTruthy();
      await answerStage(page,answer);
    }
    if(stageId==='l10-summary')break;
    const next=page.locator('.lesson-controls .primary');
    await expect(next).toBeEnabled();
    await next.click();
    await expect(stage).not.toHaveAttribute('data-stage-id',stageId!);
  }
  await expect(page.locator('[data-stage-id="l10-summary"]')).toBeVisible();
  expect(visited.size).toBe(23);
  expect(Object.keys(answers).every(id=>visited.has(id))).toBe(true);
  const summary=page.locator('.summary-card');
  await expect(summary).toContainText('5/5');
  await expect(summary).toContainText('6/6');
  await expect(summary).toContainText('Завершён');
  await expect(page.locator('.lesson-page-navigator-toggle')).toContainText('Страница 23/23');
});

test('lesson 10 keeps an answer after direct page navigation',async({page})=>{
  await openLessonTen(page);
  await page.evaluate(()=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:10,stageIndex:10}})));
  const stage=page.locator('[data-stage-id="l10-practice1"]');
  await expect(stage).toBeVisible();
  await stage.getByRole('button',{name:'прямая',exact:true}).click();
  await page.evaluate(()=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:10,stageIndex:11}})));
  await expect(page.locator('[data-stage-id="l10-practice2"]')).toBeVisible();
  await page.evaluate(()=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:10,stageIndex:10}})));
  await expect(page.locator('[data-stage-id="l10-practice1"] .choice-grid button.selected')).toHaveText('прямая');
});