import { expect,test,type Page } from '@playwright/test';

type Answer={type:'choice';value:string}|{type:'input';value:string}|{type:'order';values:string[]};
const answers:Record<string,Answer>={
  'l9-diagnostic':{type:'choice',value:'Когда они соединены последовательно и соседние звенья не лежат на одной прямой'},
  'l9-segment-part':{type:'input',value:'23'},
  'l9-polyline-length':{type:'input',value:'32'},
  'l9-units':{type:'choice',value:'AB = NP и MK = ST'},
  'l9-practice1':{type:'input',value:'71'},
  'l9-practice2':{type:'input',value:'12'},
  'l9-practice3':{type:'choice',value:'равны'},
  'l9-practice4':{type:'choice',value:'504 мм'},
  'l9-practice5':{type:'input',value:'48'},
  'l9-practice6':{type:'order',values:['Определить фигуру и порядок точек','Выделить известные и искомые длины','Привести величины к одной единице','Выбрать сложение, вычитание или построение','Проверить ответ и подписать единицу']},
  'l9-quiz1':{type:'input',value:'40'},
  'l9-quiz2':{type:'input',value:'21'},
  'l9-quiz3':{type:'input',value:'36'},
  'l9-quiz4':{type:'input',value:'64'},
  'l9-quiz5':{type:'choice',value:'её концы совпадают'},
  'l9-challenge':{type:'order',values:['Получить 8 см как 13 − 5','Получить 3 см как 13 − 5 − 5','Получить 2 см как 15 − 13','Получить 1 см как 16 − 15']},
};

async function openLessonNine(page:Page){
  await page.goto('/');
  const lessons=page.locator('.course-lesson-grid > button.is-interactive');
  await expect(lessons).toHaveCount(25);
  await lessons.nth(8).click();
  await expect(page.getByRole('heading',{name:'Отрезок. Длина отрезка. Ломаная — обобщение'}).first()).toBeVisible();
  await page.locator('.lesson-opening-start').click();
  await expect(page.locator('[data-stage-id="l9-story"]')).toBeVisible();
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

test('lesson 9 completes every main exercise and opens mandatory practice on iPad WebKit',async({page})=>{
  test.setTimeout(180_000);await openLessonNine(page);const visited=new Set<string>();
  for(let step=0;step<23;step+=1){const stage=page.locator('.lesson-runtime:not([hidden]) .interactive-stage');const stageId=await stage.getAttribute('data-stage-id');expect(stageId,`Stage ${step+1} must have data-stage-id`).toBeTruthy();visited.add(stageId!);const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);expect(overflow,`Horizontal overflow at ${stageId}`).toBeLessThanOrEqual(2);if(await stage.locator('.activity-area').count()){const answer=answers[stageId!];expect(answer,`Missing automated answer for ${stageId}`).toBeTruthy();await answerStage(page,answer)}if(stageId==='l9-summary')break;const next=page.locator('.lesson-controls .primary');await expect(next).toBeEnabled();await next.click();await expect(stage).not.toHaveAttribute('data-stage-id',stageId!)}
  await expect(page.locator('[data-stage-id="l9-summary"]')).toBeVisible();expect(visited.size).toBe(23);expect(Object.keys(answers).every(id=>visited.has(id))).toBe(true);const summary=page.locator('.summary-card');await expect(summary).toContainText('5/5');await expect(summary).toContainText('6/6');await expect(summary).toContainText('Основная часть ✓');await expect(page.locator('[data-lesson-completion-gate="9"]')).toContainText('Урок ещё не завершён');await expect(page.locator('.lesson-page-navigator-toggle')).toContainText('Страница 23/23');
});

test('lesson 9 keeps an answer after direct page navigation',async({page})=>{await openLessonNine(page);await page.evaluate(()=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:9,stageIndex:8}})));const stage=page.locator('[data-stage-id="l9-practice1"]');await expect(stage).toBeVisible();await stage.locator('.inline-answer input').fill('71');await page.evaluate(()=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:9,stageIndex:9}})));await expect(page.locator('[data-stage-id="l9-practice2"]')).toBeVisible();await page.evaluate(()=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:9,stageIndex:8}})));await expect(page.locator('[data-stage-id="l9-practice1"] .inline-answer input')).toHaveValue('71');});