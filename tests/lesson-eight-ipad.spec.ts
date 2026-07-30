import { expect,test,type Page } from '@playwright/test';

type Answer={type:'choice';value:string}|{type:'input';value:string}|{type:'order';values:string[]};
const answers:Record<string,Answer>={
  'l8-recognize':{type:'choice',value:'AB, BC, CD соединены последовательно'},
  'l8-links':{type:'input',value:'4'},
  'l8-length-guided':{type:'input',value:'32'},
  'l8-closed-check':{type:'choice',value:'её концы совпадают'},
  'l8-practice1':{type:'input',value:'71'},
  'l8-practice2':{type:'input',value:'16'},
  'l8-practice3':{type:'choice',value:'расстояния равны'},
  'l8-practice4':{type:'choice',value:'13 − 5 − 5'},
  'l8-practice5':{type:'input',value:'48'},
  'l8-practice6':{type:'order',values:['Назвать все звенья ломаной','Привести длины к одной единице','Сложить длины всех звеньев','Записать ответ с единицей измерения']},
  'l8-quiz1':{type:'input',value:'20'},
  'l8-quiz2':{type:'choice',value:'4'},
  'l8-quiz3':{type:'choice',value:'её концы совпадают'},
  'l8-quiz4':{type:'input',value:'75'},
  'l8-quiz5':{type:'input',value:'11'},
  'l8-challenge':{type:'order',values:['Получить 8 см как 13 − 5','Получить 3 см как 8 − 5','Получить 2 см как 5 − 3','Получить 1 см как 3 − 2']},
};
async function openLessonEight(page:Page){
  await page.goto('/');
  const lessons=page.locator('.course-lesson-grid > button.is-interactive');
  await expect(lessons).toHaveCount(11);
  await lessons.nth(7).click();
  await expect(page.getByRole('heading',{name:'Ломаная'}).first()).toBeVisible();
  await page.locator('.lesson-opening-start').click();
  await expect(page.locator('[data-stage-id="l8-story"]')).toBeVisible();
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
test('lesson 8 completes every exercise and produces full scores on iPad WebKit',async({page})=>{
  test.setTimeout(180_000);await openLessonEight(page);const visited=new Set<string>();
  for(let step=0;step<23;step+=1){const stage=page.locator('.lesson-runtime:not([hidden]) .interactive-stage');const stageId=await stage.getAttribute('data-stage-id');expect(stageId,`Stage ${step+1} must have data-stage-id`).toBeTruthy();visited.add(stageId!);const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);expect(overflow,`Horizontal overflow at ${stageId}`).toBeLessThanOrEqual(2);if(await stage.locator('.activity-area').count()){const answer=answers[stageId!];expect(answer,`Missing automated answer for ${stageId}`).toBeTruthy();await answerStage(page,answer)}if(stageId==='l8-summary')break;const next=page.locator('.lesson-controls .primary');await expect(next).toBeEnabled();await next.click();await expect(stage).not.toHaveAttribute('data-stage-id',stageId!)}
  await expect(page.locator('[data-stage-id="l8-summary"]')).toBeVisible();expect(visited.size).toBe(23);expect(Object.keys(answers).every(id=>visited.has(id))).toBe(true);const summary=page.locator('.summary-card');await expect(summary).toContainText('5/5');await expect(summary).toContainText('6/6');await expect(summary).toContainText('Завершён');await expect(page.locator('.lesson-page-navigator-toggle')).toContainText('Страница 23/23');
});
test('lesson 8 keeps an answer after direct page navigation',async({page})=>{await openLessonEight(page);await page.evaluate(()=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:8,stageIndex:9}})));const stage=page.locator('[data-stage-id="l8-practice1"]');await expect(stage).toBeVisible();await stage.locator('.inline-answer input').fill('71');await page.evaluate(()=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:8,stageIndex:10}})));await expect(page.locator('[data-stage-id="l8-practice2"]')).toBeVisible();await page.evaluate(()=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:8,stageIndex:9}})));await expect(page.locator('[data-stage-id="l8-practice1"] .inline-answer input')).toHaveValue('71');});