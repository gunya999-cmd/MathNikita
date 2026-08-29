import { expect,test,type Page } from '@playwright/test';

type Answer={type:'choice'|'input';value:string};
const answers:Record<string,Answer>={
  'l19-natural':{type:'input',value:'8099'},
  'l19-digits':{type:'choice',value:'7'},
  'l19-segment':{type:'input',value:'41'},
  'l19-line':{type:'choice',value:'1'},
  'l19-scale':{type:'input',value:'48'},
  'l19-compare':{type:'choice',value:'5 ц 18 кг > 507 кг'},
  'l19-q1':{type:'choice',value:'7 099'},
  'l19-q2':{type:'input',value:'46'},
  'l19-q3':{type:'choice',value:'8'},
  'l19-q4':{type:'input',value:'3040500'},
  'l19-q5':{type:'input',value:'46'},
  'l19-q6':{type:'choice',value:'E'},
  'l19-q7':{type:'input',value:'7'},
  'l19-q8':{type:'choice',value:'75'},
  'l19-q9':{type:'choice',value:'9'},
  'l19-q10':{type:'input',value:'17'},
  'l19-q11':{type:'input',value:'10'},
  'l19-q12':{type:'choice',value:'<'},
  'l19-challenge':{type:'input',value:'6820'},
};

async function openLesson(page:Page){
  await page.goto('/');
  const lessons=page.locator('.course-lesson-grid > button.is-interactive');
  
  await lessons.nth(18).click();
  await expect(page.locator('.lesson-opening-start')).toBeVisible();
  await page.locator('.lesson-opening-start').click();
  await expect(page.locator('[data-stage-id="l19-mission"]')).toBeVisible();
}

async function answerStage(page:Page,answer:Answer){
  const stage=page.locator('.lesson-runtime:not([hidden]) .interactive-stage');
  if(answer.type==='input')await stage.locator('.inline-answer input').fill(answer.value);
  else await stage.getByRole('button',{name:answer.value,exact:true}).click();
  await stage.locator('.check-button').click();
  await expect(stage.locator('.instant-feedback.good')).toBeVisible();
}

test('lesson 19 completes chapter-one rehearsal with full scores on iPad WebKit',async({page})=>{
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
    if(stageId==='l19-summary')break;
    const next=page.locator('.lesson-controls .primary');
    await expect(next).toBeEnabled();
    await next.click();
    await expect(stage).not.toHaveAttribute('data-stage-id',stageId!);
  }
  await expect(page.locator('[data-stage-id="l19-summary"]')).toBeVisible();
  expect(visited.size).toBe(24);
  expect(Object.keys(answers).every(id=>visited.has(id))).toBe(true);
  const summary=page.locator('.summary-card');
  await expect(summary).toContainText('12/12');
  await expect(summary).toContainText('6/6');
  await expect(summary).toContainText('Готов');
  await expect(page.locator('.lesson-page-navigator-toggle')).toContainText('Страница 24/24');
});

test('lesson 19 keeps an answer after direct page navigation',async({page})=>{
  await openLesson(page);
  await page.evaluate(()=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:19,stageIndex:2}})));
  const stage=page.locator('[data-stage-id="l19-natural"]');
  await expect(stage).toBeVisible();
  await stage.locator('.inline-answer input').fill('8099');
  await page.evaluate(()=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:19,stageIndex:3}})));
  await page.evaluate(()=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:19,stageIndex:2}})));
  await expect(page.locator('[data-stage-id="l19-natural"] .inline-answer input')).toHaveValue('8099');
});