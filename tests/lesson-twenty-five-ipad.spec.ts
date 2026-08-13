import { expect,test,type Page } from '@playwright/test';

type Answer={type:'choice';value:string}|{type:'input';value:string};
const answers:Record<string,Answer>={
  'l25-warmup':{type:'input',value:'12'},
  'l25-terms':{type:'choice',value:'Вычитаемое'},
  'l25-practice1':{type:'input',value:'1796'},
  'l25-practice2':{type:'input',value:'2224'},
  'l25-practice3':{type:'input',value:'4328'},
  'l25-practice4':{type:'input',value:'22154'},
  'l25-practice5':{type:'choice',value:'3 476 + 1 784 = 5 260'},
  'l25-practice6':{type:'input',value:'7720'},
  'l25-error':{type:'choice',value:'Сложить 3 738 и 2 738'},
  'l25-quiz1':{type:'input',value:'336'},
  'l25-quiz2':{type:'choice',value:'Уменьшаемое'},
  'l25-quiz3':{type:'input',value:'3144'},
  'l25-quiz4':{type:'input',value:'4685'},
  'l25-quiz5':{type:'choice',value:'a − 0 = a'},
  'l25-challenge':{type:'input',value:'2'},
};

async function openLesson(page:Page){
  await page.goto('/');
  await expect(page.locator('.course-lesson-grid > button.is-interactive')).toHaveCount(37);
  await expect(page.locator('.course-lesson-grid > button.is-control-ready')).toHaveCount(2);
  await expect(page.locator('.course-lesson-grid > button:not([disabled])')).toHaveCount(39);
  const chapterTwo=page.locator('.course-chapter-group').nth(1);
  const isOpen=await chapterTwo.evaluate(element=>(element as HTMLDetailsElement).open);
  if(!isOpen)await chapterTwo.locator('summary').click();
  const lesson=page.getByRole('button',{name:/Открыть урок 25:/});
  await expect(lesson).toBeVisible();
  await lesson.click();
  await expect(page.getByRole('heading',{name:'Вычитание натуральных чисел'}).first()).toBeVisible();
  await page.locator('.lesson-opening-start').click();
  await expect(page.locator('[data-stage-id="l25-mission"]')).toBeVisible();
  await expect(page.locator('.cat-mentor-collapsed,.cat-mentor-panel')).toBeVisible();
}

async function answerStage(page:Page,answer:Answer){
  const stage=page.locator('.lesson-runtime:not([hidden]) .interactive-stage');
  if(answer.type==='input')await stage.locator('.inline-answer input').fill(answer.value);
  else await stage.getByRole('button',{name:answer.value,exact:true}).click();
  await stage.locator('.check-button').click();
  await expect(stage.locator('.instant-feedback.good')).toBeVisible();
}

test('lesson 25 completes the first §8 subtraction lesson with full scores on iPad WebKit',async({page})=>{
  test.setTimeout(180_000);
  await openLesson(page);
  const visited=new Set<string>();
  for(let step=0;step<25;step+=1){
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
    if(stageId==='l25-summary')break;
    const next=page.locator('.lesson-controls .primary');
    await expect(next).toBeEnabled();
    await next.click();
    await expect(stage).not.toHaveAttribute('data-stage-id',stageId!);
  }
  await expect(page.locator('[data-stage-id="l25-summary"]')).toBeVisible();
  expect(visited.size).toBe(25);
  expect(Object.keys(answers).every(id=>visited.has(id))).toBe(true);
  const summary=page.locator('.summary-card');
  await expect(summary).toContainText('5/5');
  await expect(summary).toContainText('6/6');
  await expect(summary).toContainText('Основная часть готова');
  await expect(page.locator('.lesson-page-navigator-toggle')).toContainText('Страница 25/25');
  await expect(page.getByRole('heading',{name:'Обязательная практика'})).toBeVisible();
  await expect(page.getByText(/20 задан/).first()).toBeVisible();
});

test('lesson 25 keeps an unfinished answer after direct page navigation',async({page})=>{
  await openLesson(page);
  await page.evaluate(()=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:25,stageIndex:7}})));
  const input=page.locator('[data-stage-id="l25-practice2"] .inline-answer input');
  await expect(input).toBeVisible();
  await input.fill('2224');
  await page.evaluate(()=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:25,stageIndex:9}})));
  await expect(page.locator('[data-stage-id="l25-practice3"]')).toBeVisible();
  await page.evaluate(()=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:25,stageIndex:7}})));
  await expect(page.locator('[data-stage-id="l25-practice2"] .inline-answer input')).toHaveValue('2224');
});

test('lesson 25 invalidates a previously correct answer after the learner edits it',async({page})=>{
  await openLesson(page);
  await page.evaluate(()=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:25,stageIndex:7}})));
  const stage=page.locator('[data-stage-id="l25-practice2"]');
  const input=stage.locator('.inline-answer input');
  const next=page.locator('.lesson-controls .primary');
  await input.fill('2224');
  await stage.locator('.check-button').click();
  await expect(stage.locator('.instant-feedback.good')).toBeVisible();
  await expect(next).toBeEnabled();
  await input.fill('2225');
  await expect(stage.locator('.instant-feedback.good')).toHaveCount(0);
  await expect(next).toBeDisabled();
});
