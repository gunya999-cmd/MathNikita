import { expect,test,type Page } from '@playwright/test';
type Answer={type:'choice';value:string}|{type:'input';value:string}|{type:'order';values:string[]};
const answers:Record<string,Answer>={
  'l16-diagnostic':{type:'choice',value:'У числа 10 032 больше цифр'},
  'l16-practice1':{type:'input',value:'<'},
  'l16-practice2':{type:'input',value:'<'},
  'l16-practice3':{type:'choice',value:'257 меньше 263'},
  'l16-practice4':{type:'input',value:'4<5<6'},
  'l16-practice5':{type:'order',values:['479','591','701','846','894']},
  'l16-practice6':{type:'input',value:'679,680,681,682,683'},
  'l16-error-check':{type:'choice',value:'326 < 362: сотни равны, а в десятках 2 < 6'},
  'l16-quiz1':{type:'input',value:'>'},
  'l16-quiz2':{type:'input',value:'>'},
  'l16-quiz3':{type:'input',value:'2516<3939'},
  'l16-quiz4':{type:'order',values:['731','724','693','658','639']},
  'l16-quiz5':{type:'input',value:'0'},
  'l16-challenge':{type:'input',value:'13'},
  'l16-transfer':{type:'choice',value:'101 200 > 98 750: первое число шестизначное, второе пятизначное'},
};
async function openLesson(page:Page){await page.goto('/');const lessons=page.locator('.course-lesson-grid > button.is-interactive');await expect(lessons).toHaveCount(23);await lessons.nth(15).click();await expect(page.locator('.lesson-opening-start')).toBeVisible();await page.locator('.lesson-opening-start').click();await expect(page.locator('[data-stage-id="l16-mission"]')).toBeVisible()}
async function answerStage(page:Page,answer:Answer){const stage=page.locator('.lesson-runtime:not([hidden]) .interactive-stage');if(answer.type==='input')await stage.locator('.inline-answer input').fill(answer.value);else if(answer.type==='choice')await stage.getByRole('button',{name:answer.value,exact:true}).click();else for(const value of answer.values)await stage.locator('.order-bank').getByRole('button',{name:value,exact:true}).click();await stage.locator('.check-button').click();await expect(stage.locator('.instant-feedback.good')).toBeVisible()}
test('lesson 16 completes every main exercise and opens mandatory practice on iPad WebKit',async({page})=>{test.setTimeout(180_000);await openLesson(page);const visited=new Set<string>();for(let step=0;step<25;step+=1){const stage=page.locator('.lesson-runtime:not([hidden]) .interactive-stage');const stageId=await stage.getAttribute('data-stage-id');expect(stageId,`Stage ${step+1} must have data-stage-id`).toBeTruthy();visited.add(stageId!);const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);expect(overflow,`Horizontal overflow at ${stageId}`).toBeLessThanOrEqual(2);if(await stage.locator('.activity-area').count()){const answer=answers[stageId!];expect(answer,`Missing automated answer for ${stageId}`).toBeTruthy();await answerStage(page,answer)}if(stageId==='l16-summary')break;const next=page.locator('.lesson-controls .primary');await expect(next).toBeEnabled();await next.click();await expect(stage).not.toHaveAttribute('data-stage-id',stageId!)}await expect(page.locator('[data-stage-id="l16-summary"]')).toBeVisible();expect(visited.size).toBe(25);expect(Object.keys(answers).every(id=>visited.has(id))).toBe(true);const summary=page.locator('.summary-card');await expect(summary).toContainText('5/5');await expect(summary).toContainText('6/6');await expect(summary).toContainText('Основная часть ✓');await expect(page.locator('[data-lesson-completion-gate="16"]')).toContainText('Урок ещё не завершён')});
test('lesson 16 keeps an answer after direct page navigation',async({page})=>{await openLesson(page);await page.evaluate(()=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:16,stageIndex:3}})));const stage=page.locator('[data-stage-id="l16-practice1"]');await expect(stage).toBeVisible();await stage.locator('.inline-answer input').fill('<');await page.evaluate(()=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:16,stageIndex:4}})));await page.evaluate(()=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:16,stageIndex:3}})));await expect(page.locator('[data-stage-id="l16-practice1"] .inline-answer input')).toHaveValue('<')});