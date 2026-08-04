import { expect,test,type Page } from '@playwright/test';

type Answer={type:'choice';value:string}|{type:'input';value:string}|{type:'order';values:string[]};
const answers:Record<string,Answer>={
  'l23-warmup':{type:'input',value:'1000'},
  'l23-practice1':{type:'input',value:'2000'},
  'l23-property-check':{type:'choice',value:'Оба свойства'},
  'l23-practice2':{type:'input',value:'795'},
  'l23-practice3':{type:'input',value:'6000'},
  'l23-practice4':{type:'choice',value:'500 + x'},
  'l23-practice5':{type:'input',value:'32450'},
  'l23-error':{type:'choice',value:'Сочетательное'},
  'l23-time':{type:'input',value:'4 ч 23 мин'},
  'l23-practice6':{type:'order',values:['Прочитать вопрос и выделить известные величины','Найти величину, заданную через другую','Записать все величины, которые входят в итог','Выбрать удобный порядок сложения','Проверить вычисления и записать ответ с единицами']},
  'l23-quiz1':{type:'input',value:'1148'},
  'l23-quiz2':{type:'choice',value:'(a + b) + c = a + (b + c)'},
  'l23-quiz3':{type:'choice',value:'1 000 + a'},
  'l23-quiz4':{type:'input',value:'6600'},
  'l23-quiz5':{type:'input',value:'6 ч 20 мин'},
  'l23-challenge':{type:'input',value:'1250'},
};

async function openLesson(page:Page){
  await page.goto('/');
  await expect(page.locator('.course-lesson-grid > button.is-interactive')).toHaveCount(22);
  await expect(page.locator('.course-lesson-grid > button:not([disabled])')).toHaveCount(23);
  const chapterTwo=page.locator('.course-chapter-group').nth(1);
  const isOpen=await chapterTwo.evaluate(element=>(element as HTMLDetailsElement).open);
  if(!isOpen)await chapterTwo.locator('summary').click();
  const lesson=page.getByRole('button',{name:/Открыть урок 23:/});
  await expect(lesson).toBeVisible();
  await lesson.click();
  await expect(page.getByRole('heading',{name:'Сложение и свойства — закрепление'}).first()).toBeVisible();
  await page.locator('.lesson-opening-start').click();
  await expect(page.locator('[data-stage-id="l23-mission"]')).toBeVisible();
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

test('lesson 23 completes every reinforcement exercise with full scores on iPad WebKit',async({page})=>{
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
    if(stageId==='l23-summary')break;
    const next=page.locator('.lesson-controls .primary');
    await expect(next).toBeEnabled();
    await next.click();
    await expect(stage).not.toHaveAttribute('data-stage-id',stageId!);
  }
  await expect(page.locator('[data-stage-id="l23-summary"]')).toBeVisible();
  expect(visited.size).toBe(23);
  expect(Object.keys(answers).every(id=>visited.has(id))).toBe(true);
  const summary=page.locator('.summary-card');
  await expect(summary).toContainText('5/5');
  await expect(summary).toContainText('6/6');
  await expect(summary).toContainText('Завершён');
  await expect(page.locator('.lesson-page-navigator-toggle')).toContainText('Страница 23/23');
});

test('lesson 23 keeps an unfinished answer after direct page navigation',async({page})=>{
  await openLesson(page);
  await page.evaluate(()=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:23,stageIndex:3}})));
  const input=page.locator('[data-stage-id="l23-practice1"] .inline-answer input');
  await expect(input).toBeVisible();
  await input.fill('2000');
  await page.evaluate(()=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:23,stageIndex:5}})));
  await expect(page.locator('[data-stage-id="l23-practice2"]')).toBeVisible();
  await page.evaluate(()=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:23,stageIndex:3}})));
  await expect(page.locator('[data-stage-id="l23-practice1"] .inline-answer input')).toHaveValue('2000');
});