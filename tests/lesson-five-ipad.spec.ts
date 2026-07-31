import { expect, test, type Page } from '@playwright/test';

type Answer =
  | { type:'choice'; value:string }
  | { type:'input'; value:string }
  | { type:'order'; values:string[] };

const answers:Record<string,Answer> = {
  'l5-diagnostic': { type:'choice', value:'12 005 040' },
  'l5-decimal-step': { type:'choice', value:'100 000' },
  'l5-zero-check': { type:'choice', value:'305 007' },
  'l5-read': { type:'choice', value:'сорок восемь миллиардов семь миллионов пять тысяч девяносто' },
  'l5-write': { type:'input', value:'6030400002' },
  'l5-address': { type:'choice', value:'7 сотен миллионов' },
  'l5-expand': { type:'choice', value:'4 000 000 000 + 80 000 000 + 700 000 + 6 000 + 20 + 5' },
  'l5-compose': { type:'input', value:'9020000406' },
  'l5-digit-build': { type:'input', value:'4' },
  'l5-full-thousands': { type:'input', value:'7034' },
  'l5-page-count': { type:'input', value:'408' },
  'l5-algorithm': { type:'order', values:['Разделить запись справа по три цифры','Назвать классы слева направо','Проверить нули и разряды','При необходимости разложить на слагаемые'] },
  'l5-quiz1': { type:'choice', value:'пять миллионов шестьдесят тысяч четыре' },
  'l5-quiz2': { type:'input', value:'7008042009' },
  'l5-quiz3': { type:'choice', value:'3 сотни тысяч' },
  'l5-quiz4': { type:'choice', value:'70 000 000 + 40 000 + 6' },
  'l5-quiz5': { type:'input', value:'912' },
  'l5-challenge': { type:'input', value:'704' },
};

async function openLessonFive(page:Page){
  await page.goto('/');
  const lessons=page.locator('.course-lesson-grid > button.is-interactive');
  await expect(lessons).toHaveCount(15);
  await lessons.nth(4).click();
  await expect(page.getByRole('heading',{name:'Десятичная запись: обобщение'})).toBeVisible();
  await page.locator('.lesson-opening-start').click();
  await expect(page.locator('[data-stage-id="l5-story"]')).toBeVisible();
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

test('lesson 5 completes every stage and produces full scores on iPad WebKit',async({page})=>{
  test.setTimeout(180_000);
  await openLessonFive(page);
  const visited=new Set<string>();
  for(let step=0;step<24;step+=1){
    const stage=page.locator('.lesson-runtime:not([hidden]) .interactive-stage');
    const stageId=await stage.getAttribute('data-stage-id');
    expect(stageId,`Stage ${step+1} must have data-stage-id`).toBeTruthy();
    visited.add(stageId!);
    if(await stage.locator('.activity-area').count()){const answer=answers[stageId!];expect(answer,`Missing automated answer for ${stageId}`).toBeTruthy();await answerStage(page,answer)}
    if(stageId==='l5-summary')break;
    const next=page.locator('.lesson-controls .primary');await expect(next).toBeEnabled();await next.click();await expect(stage).not.toHaveAttribute('data-stage-id',stageId!);
  }
  await expect(page.locator('[data-stage-id="l5-summary"]')).toBeVisible();expect(visited.size).toBe(24);expect(Object.keys(answers).every(stageId=>visited.has(stageId))).toBe(true);
  const summary=page.locator('.summary-card');await expect(summary).toContainText('5/5');await expect(summary).toContainText('6/6');await expect(summary).toContainText('Завершён');await expect(page.locator('.lesson-page-navigator-toggle')).toContainText('Страница 24/24');
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);expect(overflow).toBeLessThanOrEqual(2);
});

test('lesson 5 keeps a selected answer after direct page navigation',async({page})=>{
  await openLessonFive(page);
  await page.evaluate(()=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:5,stageIndex:7}})));
  const reading=page.locator('[data-stage-id="l5-read"]');await expect(reading).toBeVisible();await reading.getByRole('button',{name:'сорок восемь миллиардов семь миллионов пять тысяч девяносто',exact:true}).click();
  await page.evaluate(()=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:5,stageIndex:8}})));await expect(page.locator('[data-stage-id="l5-write"]')).toBeVisible();await page.evaluate(()=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:5,stageIndex:7}})));
  await expect(page.locator('[data-stage-id="l5-read"] .choice-grid button.selected')).toContainText('сорок восемь миллиардов');
});
