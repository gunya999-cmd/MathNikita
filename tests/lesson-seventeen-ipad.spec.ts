import { expect,test,type Page } from '@playwright/test';

type Answer={type:'choice';value:string}|{type:'input';value:string}|{type:'order';values:string[]};
const answers:Record<string,Answer>={
  'l17-recall':{type:'choice',value:'Найти первую различающуюся цифру слева'},
  'l17-diagnostic':{type:'choice',value:'4 < 9'},
  'l17-practice1':{type:'choice',value:'B'},
  'l17-practice2':{type:'input',value:'<'},
  'l17-practice3':{type:'choice',value:'205 < c < 211'},
  'l17-practice4':{type:'input',value:'0,1,2'},
  'l17-practice5':{type:'input',value:'498'},
  'l17-practice6':{type:'order',values:['Сравнить координаты точек','Определить меньшее и большее число','Поместить меньшую координату левее','Поместить большую координату правее','Проверить результат неравенством']},
  'l17-error-check':{type:'choice',value:'68 < 73'},
  'l17-transfer':{type:'choice',value:'6 ц > 598 кг'},
  'l17-quiz1':{type:'choice',value:'m < n'},
  'l17-quiz2':{type:'input',value:'>'},
  'l17-quiz3':{type:'input',value:'5'},
  'l17-quiz4':{type:'input',value:'7,8,9'},
  'l17-quiz5':{type:'input',value:'3999'},
  'l17-challenge':{type:'input',value:'5'},
};

async function openLesson(page:Page){
  await page.goto('/');
  const lessons=page.locator('.course-lesson-grid > button.is-interactive');
  await expect(lessons).toHaveCount(24);
  await lessons.nth(16).click();
  await expect(page.locator('.lesson-opening-start')).toBeVisible();
  await page.locator('.lesson-opening-start').click();
  await expect(page.locator('[data-stage-id="l17-mission"]')).toBeVisible();
}

async function answerStage(page:Page,answer:Answer){
  const stage=page.locator('.lesson-runtime:not([hidden]) .interactive-stage');
  if(answer.type==='input')await stage.locator('.inline-answer input').fill(answer.value);
  else if(answer.type==='choice')await stage.getByRole('button',{name:answer.value,exact:true}).click();
  else for(const value of answer.values)await stage.locator('.order-bank').getByRole('button',{name:value,exact:true}).click();
  await stage.locator('.check-button').click();
  await expect(stage.locator('.instant-feedback.good')).toBeVisible();
}

test('lesson 17 completes every exercise and produces full scores on iPad WebKit',async({page})=>{
  test.setTimeout(180_000);
  await openLesson(page);
  const visited=new Set<string>();
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
    if(stageId==='l17-summary')break;
    const next=page.locator('.lesson-controls .primary');
    await expect(next).toBeEnabled();
    await next.click();
    await expect(stage).not.toHaveAttribute('data-stage-id',stageId!);
  }
  await expect(page.locator('[data-stage-id="l17-summary"]')).toBeVisible();
  expect(visited.size).toBe(23);
  expect(Object.keys(answers).every(id=>visited.has(id))).toBe(true);
  const summary=page.locator('.summary-card');
  await expect(summary).toContainText('5/5');
  await expect(summary).toContainText('6/6');
  await expect(summary).toContainText('Завершён');
  await expect(page.locator('.lesson-page-navigator-toggle')).toContainText('Страница 23/23');
});

test('lesson 17 keeps an answer after direct page navigation',async({page})=>{
  await openLesson(page);
  await page.evaluate(()=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:17,stageIndex:5}})));
  const stage=page.locator('[data-stage-id="l17-practice1"]');
  await expect(stage).toBeVisible();
  await stage.getByRole('button',{name:'B',exact:true}).click();
  await page.evaluate(()=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:17,stageIndex:6}})));
  await page.evaluate(()=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:17,stageIndex:5}})));
  await expect(page.locator('[data-stage-id="l17-practice1"] button.selected')).toHaveText('B');
});
