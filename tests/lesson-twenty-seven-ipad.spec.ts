import { expect,test,type Page } from '@playwright/test';

type Answer={type:'choice';value:string}|{type:'input';value:string};
const answers:Record<string,Answer>={
  'l27-map':{type:'choice',value:'7 849'},
  'l27-practice1':{type:'input',value:'7849'},
  'l27-practice2':{type:'input',value:'23285'},
  'l27-practice3':{type:'input',value:'5569'},
  'l27-practice4':{type:'input',value:'13525'},
  'l27-practice5':{type:'input',value:'2455'},
  'l27-practice6':{type:'input',value:'432542'},
  'l27-error':{type:'choice',value:'Сложить 51 237 и 18 765'},
  'l27-quiz1':{type:'input',value:'1'},
  'l27-quiz2':{type:'input',value:'37150'},
  'l27-quiz3':{type:'input',value:'61405'},
  'l27-quiz4':{type:'input',value:'427'},
  'l27-quiz5':{type:'choice',value:'44 541 + 28 459 = 73 000'},
  'l27-challenge':{type:'input',value:'33570'},
};

async function openLesson(page:Page){
  await page.goto('/');
  await expect(page.locator('.course-lesson-grid > button.is-control-ready')).toHaveCount(2);
  const chapterTwo=page.locator('.course-chapter-group').nth(1);
  const isOpen=await chapterTwo.evaluate(element=>(element as HTMLDetailsElement).open);
  if(!isOpen)await chapterTwo.locator('summary').click();
  const lesson=page.getByRole('button',{name:/Открыть урок 27:/});
  await expect(lesson).toBeVisible();
  await lesson.click();
  await expect(page.getByRole('heading',{name:'Вычитание натуральных чисел — обобщение'}).first()).toBeVisible();
  await page.locator('.lesson-opening-start').click();
  await expect(page.locator('[data-stage-id="l27-mission"]')).toBeVisible();
  await expect(page.locator('.cat-mentor-collapsed,.cat-mentor-panel')).toBeVisible();
}

async function answerStage(page:Page,answer:Answer){
  const stage=page.locator('.lesson-runtime:not([hidden]) .interactive-stage');
  if(answer.type==='input')await stage.locator('.inline-answer input').fill(answer.value);
  else await stage.getByRole('button',{name:answer.value,exact:true}).click();
  await stage.locator('.check-button').click();
  await expect(stage.locator('.instant-feedback.good')).toBeVisible();
}

test('lesson 27 completes the §8 generalization lesson with full scores on iPad WebKit',async({page})=>{
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
    if(stageId==='l27-summary')break;
    const next=page.locator('.lesson-controls .primary');
    await expect(next).toBeEnabled();
    await next.click();
    await expect(stage).not.toHaveAttribute('data-stage-id',stageId!);
  }
  await expect(page.locator('[data-stage-id="l27-summary"]')).toBeVisible();
  expect(visited.size).toBe(24);
  expect(Object.keys(answers).every(id=>visited.has(id))).toBe(true);
  const summary=page.locator('.summary-card');
  await expect(summary).toContainText('5/5');
  await expect(summary).toContainText('6/6');
  await expect(summary).toContainText('Основная часть готова');
  await expect(page.locator('.lesson-page-navigator-toggle')).toContainText('Страница 24/24');
  await expect(page.getByRole('heading',{name:'Обязательная практика'})).toBeVisible();
  await expect(page.getByText(/20 задан/).first()).toBeVisible();
});

test('lesson 27 keeps an unfinished answer after direct page navigation',async({page})=>{
  await openLesson(page);
  await page.evaluate(()=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:27,stageIndex:5}})));
  const input=page.locator('[data-stage-id="l27-practice2"] .inline-answer input');
  await expect(input).toBeVisible();
  await input.fill('23285');
  await page.evaluate(()=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:27,stageIndex:7}})));
  await expect(page.locator('[data-stage-id="l27-practice3"]')).toBeVisible();
  await page.evaluate(()=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:27,stageIndex:5}})));
  await expect(page.locator('[data-stage-id="l27-practice2"] .inline-answer input')).toHaveValue('23285');
});

test('lesson 27 invalidates a previously correct answer after the learner edits it',async({page})=>{
  await openLesson(page);
  await page.evaluate(()=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:27,stageIndex:5}})));
  const stage=page.locator('[data-stage-id="l27-practice2"]');
  const input=stage.locator('.inline-answer input');
  const next=page.locator('.lesson-controls .primary');
  await input.fill('23285');
  await stage.locator('.check-button').click();
  await expect(stage.locator('.instant-feedback.good')).toBeVisible();
  await expect(next).toBeEnabled();
  await input.fill('23286');
  await expect(stage.locator('.instant-feedback.good')).toHaveCount(0);
  await expect(next).toBeDisabled();
});