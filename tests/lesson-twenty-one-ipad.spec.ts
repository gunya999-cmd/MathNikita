import { expect,test,type Page } from '@playwright/test';

type Answer={type:'choice';value:string}|{type:'input';value:string}|{type:'order';values:string[]};
const answers:Record<string,Answer>={
  'l21-recall':{type:'input',value:'15'},
  'l21-diagnostic':{type:'choice',value:'4 208 и 731'},
  'l21-practice1':{type:'input',value:'4939'},
  'l21-practice2':{type:'input',value:'43685'},
  'l21-practice3':{type:'input',value:'11425'},
  'l21-practice4':{type:'input',value:'56308'},
  'l21-practice5':{type:'input',value:'51115'},
  'l21-error-check':{type:'choice',value:'33 191'},
  'l21-practice6':{type:'order',values:['Записать одинаковые разряды друг под другом','Начать сложение с единиц','Записать цифру результата данного разряда','Перенести лишний десяток в следующий разряд, если он появился','После последнего разряда проверить запись и величину ответа']},
  'l21-transfer':{type:'input',value:'25125'},
  'l21-quiz1':{type:'choice',value:'Слагаемыми'},
  'l21-quiz2':{type:'input',value:'637290'},
  'l21-quiz3':{type:'input',value:'10025'},
  'l21-quiz4':{type:'input',value:'83407'},
  'l21-quiz5':{type:'input',value:'1100'},
  'l21-challenge':{type:'input',value:'5'},
};

async function openLesson(page:Page){
  await page.goto('/');
  await expect(page.locator('.course-lesson-grid > button:not([disabled])')).toHaveCount(23);
  const chapterTwo=page.locator('.course-chapter-group').nth(1);
  await chapterTwo.locator('summary').click();
  const lesson=chapterTwo.getByRole('button',{name:/Открыть урок 21:/});
  await expect(lesson).toBeVisible();
  await expect(lesson).toBeEnabled();
  await lesson.click();
  await expect(page.getByRole('heading',{name:'Сложение натуральных чисел'}).first()).toBeVisible();
  await page.locator('.lesson-opening-start').click();
  await expect(page.locator('[data-stage-id="l21-mission"]')).toBeVisible();
  await expect(page.locator('.cat-mentor-collapsed')).toBeVisible();
}

async function answerStage(page:Page,answer:Answer){
  const stage=page.locator('.lesson-runtime:not([hidden]) .interactive-stage');
  if(answer.type==='input')await stage.locator('.inline-answer input').fill(answer.value);
  else if(answer.type==='choice')await stage.getByRole('button',{name:answer.value,exact:true}).click();
  else for(const value of answer.values)await stage.locator('.order-bank').getByRole('button',{name:value,exact:true}).click();
  await stage.locator('.check-button').click();
  await expect(stage.locator('.instant-feedback.good')).toBeVisible();
}

test('lesson 21 completes every addition exercise with full scores on iPad WebKit',async({page})=>{
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
    if(stageId==='l21-summary')break;
    const next=page.locator('.lesson-controls .primary');
    await expect(next).toBeEnabled();
    await next.click();
    await expect(stage).not.toHaveAttribute('data-stage-id',stageId!);
  }
  await expect(page.locator('[data-stage-id="l21-summary"]')).toBeVisible();
  expect(visited.size).toBe(25);
  expect(Object.keys(answers).every(id=>visited.has(id))).toBe(true);
  const summary=page.locator('.summary-card');
  await expect(summary).toContainText('5/5');
  await expect(summary).toContainText('6/6');
  await expect(summary).toContainText('Завершён');
  await expect(page.locator('.lesson-page-navigator-toggle')).toContainText('Страница 25/25');
});

test('lesson 21 keeps an unfinished answer after direct page navigation',async({page})=>{
  await openLesson(page);
  await page.evaluate(()=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:21,stageIndex:5}})));
  const input=page.locator('[data-stage-id="l21-practice1"] .inline-answer input');
  await expect(input).toBeVisible();
  await input.fill('4939');
  await page.evaluate(()=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:21,stageIndex:6}})));
  await expect(page.locator('[data-stage-id="l21-carry"]')).toBeVisible();
  await page.evaluate(()=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:21,stageIndex:5}})));
  await expect(page.locator('[data-stage-id="l21-practice1"] .inline-answer input')).toHaveValue('4939');
});
