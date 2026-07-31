import { expect,test,type Page } from '@playwright/test';

type Answer={type:'choice';value:string}|{type:'input';value:string}|{type:'order';values:string[]};
const answers:Record<string,Answer>={
  'l15-diagnostic':{type:'choice',value:'Найти начало и 0, проверить равные промежутки, постоянный шаг и координаты точек'},
  'l15-practice1':{type:'input',value:'6'},
  'l15-practice2':{type:'input',value:'7'},
  'l15-practice3':{type:'input',value:'235,236,237,238'},
  'l15-practice4':{type:'input',value:'4'},
  'l15-practice5':{type:'choice',value:'B (54)'},
  'l15-practice6':{type:'order',values:['Найти начало отсчёта и число 0','Определить координатный шаг','Посчитать равные промежутки до каждой точки','Сопоставить число шагов с координатой','Исправить найденные несоответствия','Записать окончательный ответ']},
  'l15-error-check':{type:'choice',value:'22 на 21'},
  'l15-quiz1':{type:'input',value:'8'},
  'l15-quiz2':{type:'input',value:'84'},
  'l15-quiz3':{type:'choice',value:'0, 5, 10, 15, 20'},
  'l15-quiz4':{type:'input',value:'4'},
  'l15-quiz5':{type:'input',value:'44'},
  'l15-challenge':{type:'input',value:'37'},
  'l15-transfer':{type:'choice',value:'Да, шаг равен 15'},
};
async function openLesson(page:Page){
  await page.goto('/');
  const lessons=page.locator('.course-lesson-grid > button.is-interactive');
  await expect(lessons).toHaveCount(15);
  await lessons.nth(14).click();
  await expect(page.locator('.lesson-opening-start')).toBeVisible();
  await page.locator('.lesson-opening-start').click();
  await expect(page.locator('[data-stage-id="l15-mission"]')).toBeVisible();
}
async function answerStage(page:Page,answer:Answer){
  const stage=page.locator('.lesson-runtime:not([hidden]) .interactive-stage');
  if(answer.type==='input')await stage.locator('.inline-answer input').fill(answer.value);
  else if(answer.type==='choice')await stage.getByRole('button',{name:answer.value,exact:true}).click();
  else for(const value of answer.values)await stage.locator('.order-bank').getByRole('button',{name:value,exact:true}).click();
  await stage.locator('.check-button').click();
  await expect(stage.locator('.instant-feedback.good')).toBeVisible();
}
test('lesson 15 completes every exercise and produces full scores on iPad WebKit',async({page})=>{
  test.setTimeout(180_000);await openLesson(page);const visited=new Set<string>();
  for(let step=0;step<23;step+=1){
    const stage=page.locator('.lesson-runtime:not([hidden]) .interactive-stage');
    const stageId=await stage.getAttribute('data-stage-id');
    expect(stageId,`Stage ${step+1} must have data-stage-id`).toBeTruthy();visited.add(stageId!);
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
    expect(overflow,`Horizontal overflow at ${stageId}`).toBeLessThanOrEqual(2);
    if(await stage.locator('.activity-area').count()){const answer=answers[stageId!];expect(answer,`Missing automated answer for ${stageId}`).toBeTruthy();await answerStage(page,answer)}
    if(stageId==='l15-summary')break;
    const next=page.locator('.lesson-controls .primary');await expect(next).toBeEnabled();await next.click();await expect(stage).not.toHaveAttribute('data-stage-id',stageId!);
  }
  await expect(page.locator('[data-stage-id="l15-summary"]')).toBeVisible();expect(visited.size).toBe(23);expect(Object.keys(answers).every(id=>visited.has(id))).toBe(true);
  const summary=page.locator('.summary-card');await expect(summary).toContainText('5/5');await expect(summary).toContainText('6/6');await expect(summary).toContainText('Завершён');
});
test('lesson 15 keeps an answer after direct page navigation',async({page})=>{
  await openLesson(page);await page.evaluate(()=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:15,stageIndex:3}})));
  const stage=page.locator('[data-stage-id="l15-practice1"]');await expect(stage).toBeVisible();await stage.locator('.inline-answer input').fill('6');
  await page.evaluate(()=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:15,stageIndex:4}})));
  await page.evaluate(()=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:15,stageIndex:3}})));
  await expect(page.locator('[data-stage-id="l15-practice1"] .inline-answer input')).toHaveValue('6');
});
