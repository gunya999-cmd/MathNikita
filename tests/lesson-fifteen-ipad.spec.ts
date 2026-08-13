import { expect,test,type Page } from '@playwright/test';
type Answer={type:'choice';value:string}|{type:'input';value:string};
const answers:Record<string,Answer>={
  'l15-diagnostic':{type:'choice',value:'Единичный отрезок соответствует изменению координаты на 1'},
  'l15-practice1':{type:'input',value:'3,6,9,12,15'},
  'l15-practice2':{type:'input',value:'5 мм'},
  'l15-guided':{type:'input',value:'10,90,50,140,190,125'},
  'l15-practice3':{type:'input',value:'10,80,70,130,180,155'},
  'l15-practice4':{type:'input',value:'27,6,15,21'},
  'l15-practice5':{type:'input',value:'3,11'},
  'l15-practice6':{type:'input',value:'55,268'},
  'l15-quiz1':{type:'input',value:'3'},
  'l15-quiz2':{type:'input',value:'125'},
  'l15-quiz3':{type:'input',value:'11'},
  'l15-quiz4':{type:'input',value:'0,14'},
  'l15-quiz5':{type:'input',value:'74'},
  'l15-challenge':{type:'input',value:'8,5 см'},
  'l15-transfer':{type:'choice',value:'Крупное деление 0→3 содержит три единичных отрезка'},
};
async function openLesson(page:Page){await page.goto('/');const lessons=page.locator('.course-lesson-grid > button.is-interactive');await expect(lessons).toHaveCount(37);await lessons.nth(14).click();await expect(page.locator('.lesson-opening-start')).toBeVisible();await page.locator('.lesson-opening-start').click();await expect(page.locator('[data-stage-id="l15-mission"]')).toBeVisible()}
async function answerStage(page:Page,answer:Answer){const stage=page.locator('.lesson-runtime:not([hidden]) .interactive-stage');if(answer.type==='input')await stage.locator('.inline-answer input').fill(answer.value);else await stage.getByRole('button',{name:answer.value,exact:true}).click();await stage.locator('.check-button').click();await expect(stage.locator('.instant-feedback.good')).toBeVisible()}
test('lesson 15 completes every main exercise and opens mandatory practice on iPad WebKit',async({page})=>{test.setTimeout(180_000);await openLesson(page);const visited=new Set<string>();for(let step=0;step<25;step+=1){const stage=page.locator('.lesson-runtime:not([hidden]) .interactive-stage');const stageId=await stage.getAttribute('data-stage-id');expect(stageId,`Stage ${step+1} must have data-stage-id`).toBeTruthy();visited.add(stageId!);const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);expect(overflow,`Horizontal overflow at ${stageId}`).toBeLessThanOrEqual(2);if(await stage.locator('.activity-area').count()){const answer=answers[stageId!];expect(answer,`Missing automated answer for ${stageId}`).toBeTruthy();await answerStage(page,answer)}if(stageId==='l15-summary')break;const next=page.locator('.lesson-controls .primary');await expect(next).toBeEnabled();await next.click();await expect(stage).not.toHaveAttribute('data-stage-id',stageId!)}await expect(page.locator('[data-stage-id="l15-summary"]')).toBeVisible();expect(visited.size).toBe(25);expect(Object.keys(answers).every(id=>visited.has(id))).toBe(true);const summary=page.locator('.summary-card');await expect(summary).toContainText('5/5');await expect(summary).toContainText('6/6');await expect(summary).toContainText('Основная часть ✓');await expect(page.locator('[data-lesson-completion-gate="15"]')).toContainText('Урок ещё не завершён')});
test('lesson 15 keeps an answer after direct page navigation',async({page})=>{await openLesson(page);await page.evaluate(()=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:15,stageIndex:3}})));const stage=page.locator('[data-stage-id="l15-practice1"]');await expect(stage).toBeVisible();await stage.locator('.inline-answer input').fill('3,6,9,12,15');await page.evaluate(()=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:15,stageIndex:4}})));await page.evaluate(()=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:15,stageIndex:3}})));await expect(page.locator('[data-stage-id="l15-practice1"] .inline-answer input')).toHaveValue('3,6,9,12,15')});