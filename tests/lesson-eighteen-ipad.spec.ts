import { expect,test,type Page } from '@playwright/test';

type Answer={type:'choice'|'input';value:string};
const answers:Record<string,Answer>={
  'l18-diagnostic':{type:'choice',value:'Сравнить количество цифр, затем разряды слева направо'},
  'l18-practice1':{type:'input',value:'>'},
  'l18-practice2':{type:'input',value:'<'},
  'l18-practice3':{type:'choice',value:'a < b'},
  'l18-practice4':{type:'input',value:'15,16,17'},
  'l18-practice5':{type:'input',value:'735'},
  'l18-practice6':{type:'input',value:'3107'},
  'l18-transfer':{type:'choice',value:'2 км 85 м < 2 122 м'},
  'l18-error-check':{type:'choice',value:'6 ц > 598 кг, потому что 6 ц = 600 кг'},
  'l18-quiz1':{type:'input',value:'>'},
  'l18-quiz2':{type:'input',value:'10000'},
  'l18-quiz3':{type:'input',value:'4'},
  'l18-quiz4':{type:'choice',value:'7 ц 32 кг > 723 кг'},
  'l18-quiz5':{type:'input',value:'0,1,2'},
  'l18-challenge':{type:'input',value:'5007'},
};

async function openLesson(page:Page){
  await page.goto('/');
  const lessons=page.locator('.course-lesson-grid > button.is-interactive');
  await expect(lessons).toHaveCount(22);
  await lessons.nth(17).click();
  await expect(page.locator('.lesson-opening-start')).toBeVisible();
  await page.locator('.lesson-opening-start').click();
  await expect(page.locator('[data-stage-id="l18-mission"]')).toBeVisible();
}

async function answerStage(page:Page,answer:Answer){
  const stage=page.locator('.lesson-runtime:not([hidden]) .interactive-stage');
  if(answer.type==='input')await stage.locator('.inline-answer input').fill(answer.value);
  else await stage.getByRole('button',{name:answer.value,exact:true}).click();
  await stage.locator('.check-button').click();
  await expect(stage.locator('.instant-feedback.good')).toBeVisible();
}

test('lesson 18 completes every exercise and produces full scores on iPad WebKit',async({page})=>{
  test.setTimeout(180_000);
  await openLesson(page);
  const visited=new Set<string>();
  for(let step=0;step<24;step+=1){
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
    if(stageId==='l18-summary')break;
    const next=page.locator('.lesson-controls .primary');
    await expect(next).toBeEnabled();
    await next.click();
    await expect(stage).not.toHaveAttribute('data-stage-id',stageId!);
  }
  await expect(page.locator('[data-stage-id="l18-summary"]')).toBeVisible();
  expect(visited.size).toBe(24);
  expect(Object.keys(answers).every(id=>visited.has(id))).toBe(true);
  const summary=page.locator('.summary-card');
  await expect(summary).toContainText('5/5');
  await expect(summary).toContainText('6/6');
  await expect(summary).toContainText('Завершён');
  await expect(page.locator('.lesson-page-navigator-toggle')).toContainText('Страница 24/24');
});

test('lesson 18 keeps an answer after direct page navigation',async({page})=>{
  await openLesson(page);
  await page.evaluate(()=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:18,stageIndex:3}})));
  const stage=page.locator('[data-stage-id="l18-practice1"]');
  await expect(stage).toBeVisible();
  await stage.locator('.inline-answer input').fill('>');
  await page.evaluate(()=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:18,stageIndex:4}})));
  await page.evaluate(()=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:18,stageIndex:3}})));
  await expect(page.locator('[data-stage-id="l18-practice1"] .inline-answer input')).toHaveValue('>');
});
