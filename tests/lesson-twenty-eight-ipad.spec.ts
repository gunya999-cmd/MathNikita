import { expect,test,type Page } from '@playwright/test';

type Answer={type:'choice';value:string}|{type:'input';value:string};
const answers:Record<string,Answer>={
  'l28-round':{type:'input',value:'6500'},
  'l28-practice1':{type:'input',value:'1000'},
  'l28-practice2':{type:'input',value:'4000'},
  'l28-practice3':{type:'choice',value:'700 110'},
  'l28-practice4':{type:'choice',value:'Ответ подозрителен: ожидаем около 40 000'},
  'l28-practice5':{type:'input',value:'8073'},
  'l28-practice6':{type:'choice',value:'От 40 000 до 41 000'},
  'l28-mistake':{type:'choice',value:'801'},
  'l28-quiz1':{type:'input',value:'500'},
  'l28-quiz2':{type:'input',value:'3000'},
  'l28-quiz3':{type:'choice',value:'100'},
  'l28-quiz4':{type:'choice',value:'Неверно: ожидаем около 20 000'},
  'l28-quiz5':{type:'input',value:'4218'},
  'l28-challenge':{type:'choice',value:'Больше 8 000'},
};

async function openLesson(page:Page){
  await page.goto('/');
  await expect(page.locator('.course-lesson-grid > button.is-interactive')).toHaveCount(27);
  await expect(page.locator('.course-lesson-grid > button.is-control-ready')).toHaveCount(1);
  await expect(page.locator('.course-lesson-grid > button:not([disabled])')).toHaveCount(28);
  const chapterTwo=page.locator('.course-chapter-group').nth(1);
  const isOpen=await chapterTwo.evaluate(element=>(element as HTMLDetailsElement).open);
  if(!isOpen)await chapterTwo.locator('summary').click();
  const lesson=page.getByRole('button',{name:/Открыть урок 28:/});
  await expect(lesson).toBeVisible();
  await lesson.click();
  await expect(page.getByRole('heading',{name:'Прикидка суммы и разности'}).first()).toBeVisible();
  await page.locator('.lesson-opening-start').click();
  await expect(page.locator('[data-stage-id="l28-mission"]')).toBeVisible();
  await expect(page.locator('.cat-mentor-collapsed,.cat-mentor-panel')).toBeVisible();
}

async function answerStage(page:Page,answer:Answer){
  const stage=page.locator('.lesson-runtime:not([hidden]) .interactive-stage');
  if(answer.type==='input')await stage.locator('.inline-answer input').fill(answer.value);
  else await stage.getByRole('button',{name:answer.value,exact:true}).click();
  await stage.locator('.check-button').click();
  await expect(stage.locator('.instant-feedback.good')).toBeVisible();
}

test('lesson 28 completes estimation with full scores and mandatory practice on iPad WebKit',async({page})=>{
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
    if(stageId==='l28-summary')break;
    const next=page.locator('.lesson-controls .primary');
    await expect(next).toBeEnabled();
    await next.click();
    await expect(stage).not.toHaveAttribute('data-stage-id',stageId!);
  }
  await expect(page.locator('[data-stage-id="l28-summary"]')).toBeVisible();
  expect(visited.size).toBe(23);
  expect(Object.keys(answers).every(id=>visited.has(id))).toBe(true);
  const summary=page.locator('.summary-card');
  await expect(summary).toContainText('5/5');
  await expect(summary).toContainText('6/6');
  await expect(summary).toContainText('Основная часть готова');
  await expect(page.getByText(/Обязательная практика/).first()).toBeVisible();
  await expect(page.getByText(/20 задан/).first()).toBeVisible();
});

test('lesson 28 preserves an unfinished answer across direct stage navigation',async({page})=>{
  await openLesson(page);
  await page.evaluate(()=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:28,stageIndex:4}})));
  const input=page.locator('[data-stage-id="l28-practice1"] .inline-answer input');
  await expect(input).toBeVisible();
  await input.fill('1000');
  await page.evaluate(()=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:28,stageIndex:5}})));
  await expect(page.locator('[data-stage-id="l28-practice2"]')).toBeVisible();
  await page.evaluate(()=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:28,stageIndex:4}})));
  await expect(page.locator('[data-stage-id="l28-practice1"] .inline-answer input')).toHaveValue('1000');
});

test('lesson 28 invalidates a correct result after editing the answer',async({page})=>{
  await openLesson(page);
  await page.evaluate(()=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:28,stageIndex:4}})));
  const stage=page.locator('[data-stage-id="l28-practice1"]');
  const input=stage.locator('.inline-answer input');
  const next=page.locator('.lesson-controls .primary');
  await input.fill('1000');
  await stage.locator('.check-button').click();
  await expect(stage.locator('.instant-feedback.good')).toBeVisible();
  await expect(next).toBeEnabled();
  await input.fill('1001');
  await expect(stage.locator('.instant-feedback.good')).toHaveCount(0);
  await expect(next).toBeDisabled();
});