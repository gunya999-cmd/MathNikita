import { expect,test,type Page } from '@playwright/test';

type Answer={type:'choice';value:string}|{type:'input';value:string}|{type:'order';values:string[]};
const answers:Record<string,Answer>={
  'l22-recall':{type:'input',value:'4000'},
  'l22-commutative-check':{type:'choice',value:'Переместительное'},
  'l22-associative-check':{type:'choice',value:'Сочетательное'},
  'l22-practice1':{type:'input',value:'300'},
  'l22-practice2':{type:'input',value:'1049'},
  'l22-practice3':{type:'input',value:'164'},
  'l22-practice4':{type:'choice',value:'420 + x'},
  'l22-practice5':{type:'input',value:'14 мин 25 с'},
  'l22-error':{type:'choice',value:'Слагаемые поменялись местами'},
  'l22-practice6':{type:'order',values:['Найти слагаемые, которые удобно сложить вместе','Переставить слагаемые, если это нужно','Сгруппировать удобные пары скобками','Вычислить суммы внутри удобных групп','Сложить полученные результаты']},
  'l22-transfer':{type:'input',value:'24400'},
  'l22-quiz1':{type:'choice',value:'a + b = b + a'},
  'l22-quiz2':{type:'choice',value:'(a + b) + c = a + (b + c)'},
  'l22-quiz3':{type:'input',value:'1200'},
  'l22-quiz4':{type:'input',value:'1000'},
  'l22-quiz5':{type:'input',value:'19 мин 23 с'},
  'l22-challenge':{type:'input',value:'190'},
};

async function openLesson(page:Page){
  await page.goto('/');
  await expect(page.locator('.course-lesson-grid > button:not([disabled])')).toHaveCount(24);
  await page.locator('.course-chapter-group').nth(1).locator('summary').click();
  const lesson=page.getByRole('button',{name:/Открыть урок 22:/});
  await expect(lesson).toBeVisible();
  await lesson.click();
  await expect(page.getByRole('heading',{name:'Свойства сложения'}).first()).toBeVisible();
  await page.locator('.lesson-opening-start').click();
  await expect(page.locator('[data-stage-id="l22-mission"]')).toBeVisible();
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

test('lesson 22 completes every addition-properties exercise with full scores on iPad WebKit',async({page})=>{
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
    if(stageId==='l22-summary')break;
    const next=page.locator('.lesson-controls .primary');
    await expect(next).toBeEnabled();
    await next.click();
    await expect(stage).not.toHaveAttribute('data-stage-id',stageId!);
  }
  await expect(page.locator('[data-stage-id="l22-summary"]')).toBeVisible();
  expect(visited.size).toBe(25);
  expect(Object.keys(answers).every(id=>visited.has(id))).toBe(true);
  const summary=page.locator('.summary-card');
  await expect(summary).toContainText('5/5');
  await expect(summary).toContainText('6/6');
  await expect(summary).toContainText('Завершён');
  await expect(page.locator('.lesson-page-navigator-toggle')).toContainText('Страница 25/25');
});

test('lesson 22 keeps an unfinished answer after direct page navigation',async({page})=>{
  await openLesson(page);
  await page.evaluate(()=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:22,stageIndex:7}})));
  const input=page.locator('[data-stage-id="l22-practice1"] .inline-answer input');
  await expect(input).toBeVisible();
  await input.fill('300');
  await page.evaluate(()=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:22,stageIndex:8}})));
  await expect(page.locator('[data-stage-id="l22-practice2"]')).toBeVisible();
  await page.evaluate(()=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:22,stageIndex:7}})));
  await expect(page.locator('[data-stage-id="l22-practice1"] .inline-answer input')).toHaveValue('300');
});