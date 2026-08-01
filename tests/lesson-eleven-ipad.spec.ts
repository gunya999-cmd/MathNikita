import { expect,test,type Page } from '@playwright/test';

type Answer={type:'choice';value:string}|{type:'input';value:string}|{type:'order';values:string[]};
const answers:Record<string,Answer>={
  'l11-diagnostic':{type:'choice',value:'MK'},
  'l11-practice1':{type:'choice',value:'дать им общее начало и направить в разные стороны'},
  'l11-practice2':{type:'choice',value:'точка пересечения может лежать на прямой TF по другую сторону от T, чем F'},
  'l11-practice3':{type:'input',value:'200'},
  'l11-practice4':{type:'choice',value:'8 см или 56 см; два решения'},
  'l11-practice5':{type:'choice',value:'CE, EC, CD, DC, ED, DE'},
  'l11-practice6':{type:'order',values:['Прочитать условие и назвать требуемые фигуры','Определить начала и направления лучей','Провести базовые прямые и отметить точки','Проверить все требуемые пересечения и непересечения','Сверить готовый чертёж со всеми условиями']},
  'l11-quiz1':{type:'choice',value:'луч'},
  'l11-quiz2':{type:'input',value:'1'},
  'l11-quiz3':{type:'input',value:'8'},
  'l11-quiz4':{type:'choice',value:'EC и ED'},
  'l11-quiz5':{type:'choice',value:'точка, отрезок или луч'},
  'l11-challenge':{type:'choice',value:'7 и 4'},
};

async function openLessonEleven(page:Page){
  await page.goto('/');
  const readyLessons=page.locator('.course-lesson-grid > button:not([disabled])');
  await expect(readyLessons).toHaveCount(18);
  await readyLessons.nth(10).click();
  await expect(page.getByRole('heading',{name:'Плоскость. Прямая. Луч — закрепление'}).first()).toBeVisible();
  await page.locator('.lesson-opening-start').click();
  await expect(page.locator('[data-stage-id="l11-story"]')).toBeVisible();
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

test('lesson 11 completes every exercise and produces full scores on iPad WebKit',async({page})=>{
  test.setTimeout(180_000);await openLessonEleven(page);const visited=new Set<string>();
  for(let step=0;step<22;step+=1){
    const stage=page.locator('.lesson-runtime:not([hidden]) .interactive-stage');
    const stageId=await stage.getAttribute('data-stage-id');
    expect(stageId,`Stage ${step+1} must have data-stage-id`).toBeTruthy();visited.add(stageId!);
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
    expect(overflow,`Horizontal overflow at ${stageId}`).toBeLessThanOrEqual(2);
    if(await stage.locator('.activity-area').count()){const answer=answers[stageId!];expect(answer,`Missing automated answer for ${stageId}`).toBeTruthy();await answerStage(page,answer)}
    if(stageId==='l11-summary')break;
    const next=page.locator('.lesson-controls .primary');await expect(next).toBeEnabled();await next.click();await expect(stage).not.toHaveAttribute('data-stage-id',stageId!);
  }
  await expect(page.locator('[data-stage-id="l11-summary"]')).toBeVisible();expect(visited.size).toBe(22);expect(Object.keys(answers).every(id=>visited.has(id))).toBe(true);
  const summary=page.locator('.summary-card');await expect(summary).toContainText('5/5');await expect(summary).toContainText('6/6');await expect(summary).toContainText('Завершён');await expect(page.locator('.lesson-page-navigator-toggle')).toContainText('Страница 22/22');
});

test('lesson 11 keeps an answer after direct page navigation',async({page})=>{
  await openLessonEleven(page);
  await page.evaluate(()=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:11,stageIndex:7}})));
  const stage=page.locator('[data-stage-id="l11-practice1"]');await expect(stage).toBeVisible();
  await stage.getByRole('button',{name:'дать им общее начало и направить в разные стороны',exact:true}).click();
  await page.evaluate(()=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:11,stageIndex:8}})));
  await expect(page.locator('[data-stage-id="l11-practice2"]')).toBeVisible();
  await page.evaluate(()=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:11,stageIndex:7}})));
  await expect(page.locator('[data-stage-id="l11-practice1"] .choice-grid button.selected')).toContainText('дать им общее начало');
});