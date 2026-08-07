import { expect,test,type Page } from '@playwright/test';

type Answer={type:'choice';value:string}|{type:'input';value:string}|{type:'order';values:string[]};
const answers:Record<string,Answer>={
  'l24-warmup':{type:'input',value:'1079'},
  'l24-practice1':{type:'input',value:'2944043'},
  'l24-property':{type:'choice',value:'Сочетательное'},
  'l24-practice2':{type:'input',value:'2000'},
  'l24-practice3':{type:'order',values:['Просмотреть все слагаемые','Найти удобные пары или группы','При необходимости переставить слагаемые','Сгруппировать выбранные слагаемые','Вычислить и проверить сумму']},
  'l24-practice4':{type:'choice',value:'1 000 + m'},
  'l24-practice5':{type:'input',value:'9000'},
  'l24-error':{type:'choice',value:'Здесь применено сочетательное свойство'},
  'l24-practice6':{type:'input',value:'39000'},
  'l24-quiz1':{type:'input',value:'500000'},
  'l24-quiz2':{type:'choice',value:'a + b = b + a'},
  'l24-quiz3':{type:'input',value:'900'},
  'l24-quiz4':{type:'input',value:'11000'},
  'l24-quiz5':{type:'input',value:'7 ч 30 мин'},
  'l24-challenge':{type:'input',value:'1180'},
};

async function openLesson(page:Page){
  await page.goto('/');
  await expect(page.locator('.course-lesson-grid > button.is-interactive')).toHaveCount(23);
  await expect(page.locator('.course-lesson-grid > button.is-control-ready')).toHaveCount(1);
  await expect(page.locator('.course-lesson-grid > button:not([disabled])')).toHaveCount(24);
  const chapterTwo=page.locator('.course-chapter-group').nth(1);
  const isOpen=await chapterTwo.evaluate(element=>(element as HTMLDetailsElement).open);
  if(!isOpen)await chapterTwo.locator('summary').click();
  const lesson=page.getByRole('button',{name:/Открыть урок 24:/});
  await expect(lesson).toBeVisible();
  await lesson.click();
  await expect(page.getByRole('heading',{name:'Сложение натуральных чисел — итог § 7'}).first()).toBeVisible();
  await page.locator('.lesson-opening-start').click();
  await expect(page.locator('[data-stage-id="l24-mission"]')).toBeVisible();
  await expect(page.locator('.cat-mentor-collapsed,.cat-mentor-panel')).toBeVisible();
}

async function answerStage(page:Page,answer:Answer){
  const stage=page.locator('.lesson-runtime:not([hidden]) .interactive-stage');
  if(answer.type==='input')await stage.locator('.inline-answer input').fill(answer.value);
  else if(answer.type==='choice')await stage.getByRole('button',{name:answer.value,exact:true}).click();
  else for(const value of answer.values)await stage.locator('.order-bank').getByRole('button',{name:value,exact:true}).click();
  await stage.locator('.check-button').click();
  await expect(stage.locator('.instant-feedback.good')).toBeVisible();
}

test('lesson 24 completes the full §7 synthesis with full scores on iPad WebKit',async({page})=>{
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
    if(stageId==='l24-summary')break;
    const next=page.locator('.lesson-controls .primary');
    await expect(next).toBeEnabled();
    await next.click();
    await expect(stage).not.toHaveAttribute('data-stage-id',stageId!);
  }
  await expect(page.locator('[data-stage-id="l24-summary"]')).toBeVisible();
  expect(visited.size).toBe(23);
  expect(Object.keys(answers).every(id=>visited.has(id))).toBe(true);
  const summary=page.locator('.summary-card');
  await expect(summary).toContainText('5/5');
  await expect(summary).toContainText('6/6');
  await expect(summary).toContainText('Основная часть готова');
  await expect(page.locator('.lesson-page-navigator-toggle')).toContainText('Страница 23/23');
  await expect(page.getByRole('heading',{name:'Обязательная практика'})).toBeVisible();
  await expect(page.getByText(/20 задан/).first()).toBeVisible();
});

test('lesson 24 keeps an unfinished answer after direct page navigation',async({page})=>{
  await openLesson(page);
  await page.evaluate(()=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:24,stageIndex:3}})));
  const input=page.locator('[data-stage-id="l24-practice1"] .inline-answer input');
  await expect(input).toBeVisible();
  await input.fill('2944043');
  await page.evaluate(()=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:24,stageIndex:5}})));
  await expect(page.locator('[data-stage-id="l24-practice2"]')).toBeVisible();
  await page.evaluate(()=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:24,stageIndex:3}})));
  await expect(page.locator('[data-stage-id="l24-practice1"] .inline-answer input')).toHaveValue('2944043');
});
