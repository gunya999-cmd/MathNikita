import { expect,test,type Page } from '@playwright/test';

type Answer={type:'choice';value:string}|{type:'input';value:string}|{type:'order';values:string[]};
const answers:Record<string,Answer>={
  'l14-recall':{type:'choice',value:'Начало, число 0, единичный отрезок и направление'},
  'l14-practice1':{type:'input',value:'6'},
  'l14-practice2':{type:'input',value:'42'},
  'l14-guided':{type:'input',value:'6'},
  'l14-practice3':{type:'input',value:'6'},
  'l14-practice4':{type:'input',value:'40'},
  'l14-practice5':{type:'choice',value:'12'},
  'l14-practice6':{type:'order',values:['Провести луч и обозначить начало O','Подписать под началом число 0','Выбрать координатный шаг 6','Отложить равные промежутки вправо','Отметить B (18), C (30) и D (42)','Проверить число шагов до каждой точки']},
  'l14-error-check':{type:'choice',value:'Последний шаг должен привести к 24, а не к 25'},
  'l14-quiz1':{type:'input',value:'63'},
  'l14-quiz2':{type:'input',value:'6'},
  'l14-quiz3':{type:'choice',value:'Обе записи M (5) могут быть верными'},
  'l14-quiz4':{type:'input',value:'30'},
  'l14-quiz5':{type:'input',value:'12'},
  'l14-challenge':{type:'input',value:'42'},
};
async function openLesson(page:Page){
  await page.goto('/');
  const lessons=page.locator('.course-lesson-grid > button.is-interactive');
  await expect(lessons).toHaveCount(20);
  await lessons.nth(13).click();
  await expect(page.locator('.lesson-opening-start')).toBeVisible();
  await page.locator('.lesson-opening-start').click();
  await expect(page.locator('[data-stage-id="l14-mission"]')).toBeVisible();
}
async function answerStage(page:Page,answer:Answer){
  const stage=page.locator('.lesson-runtime:not([hidden]) .interactive-stage');
  if(answer.type==='input')await stage.locator('.inline-answer input').fill(answer.value);
  else if(answer.type==='choice')await stage.getByRole('button',{name:answer.value,exact:true}).click();
  else for(const value of answer.values)await stage.locator('.order-bank').getByRole('button',{name:value,exact:true}).click();
  await stage.locator('.check-button').click();
  await expect(stage.locator('.instant-feedback.good')).toBeVisible();
}
test('lesson 14 completes every exercise and produces full scores on iPad WebKit',async({page})=>{
  test.setTimeout(180_000);await openLesson(page);const visited=new Set<string>();
  for(let step=0;step<23;step+=1){
    const stage=page.locator('.lesson-runtime:not([hidden]) .interactive-stage');
    const stageId=await stage.getAttribute('data-stage-id');
    expect(stageId,`Stage ${step+1} must have data-stage-id`).toBeTruthy();visited.add(stageId!);
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
    expect(overflow,`Horizontal overflow at ${stageId}`).toBeLessThanOrEqual(2);
    if(await stage.locator('.activity-area').count()){const answer=answers[stageId!];expect(answer,`Missing automated answer for ${stageId}`).toBeTruthy();await answerStage(page,answer)}
    if(stageId==='l14-summary')break;
    const next=page.locator('.lesson-controls .primary');await expect(next).toBeEnabled();await next.click();await expect(stage).not.toHaveAttribute('data-stage-id',stageId!);
  }
  await expect(page.locator('[data-stage-id="l14-summary"]')).toBeVisible();expect(visited.size).toBe(23);
  const summary=page.locator('.summary-card');await expect(summary).toContainText('5/5');await expect(summary).toContainText('6/6');await expect(summary).toContainText('Завершён');
});
test('lesson 14 keeps an answer after direct page navigation',async({page})=>{
  await openLesson(page);await page.evaluate(()=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:14,stageIndex:3}})));
  const stage=page.locator('[data-stage-id="l14-practice1"]');await expect(stage).toBeVisible();await stage.locator('.inline-answer input').fill('6');
  await page.evaluate(()=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:14,stageIndex:4}})));
  await page.evaluate(()=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:14,stageIndex:3}})));
  await expect(page.locator('[data-stage-id="l14-practice1"] .inline-answer input')).toHaveValue('6');
});
