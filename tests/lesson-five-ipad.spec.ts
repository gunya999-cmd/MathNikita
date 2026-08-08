import { expect, test, type Locator, type Page } from '@playwright/test';

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

async function domClick(locator:Locator){
  await expect(locator).toBeVisible();
  await locator.evaluate((element:HTMLElement)=>element.click());
}

async function expectNoHorizontalOverflow(page:Page){
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(2);
}

async function openLessonFive(page:Page){
  await page.goto('/');
  const lessons=page.locator('.course-lesson-grid > button.is-interactive');
  await expect(lessons).toHaveCount(25);
  await domClick(lessons.nth(4));
  await expect(page.getByRole('heading',{name:'Десятичная запись: обобщение'})).toBeVisible();
  const openingDuration=page.locator('.opening-screen:not([hidden]) .lesson-opening-plan > div');
  await expect(openingDuration).toContainText('Время урока');
  await expect(openingDuration).toContainText('измеряется');
  await expect(openingDuration).not.toContainText('45 мин');
  await expectNoHorizontalOverflow(page);
  await domClick(page.locator('.lesson-opening-start'));
  await expect(page.locator('[data-stage-id="l5-story"]')).toBeVisible();
  await expect(page.locator('.cat-mentor-collapsed')).toBeVisible();
  await expect(page.locator('.lesson-runtime:not([hidden]) .lesson-duration')).toHaveText('Фактическое время измеряется');
}

async function answerStage(page:Page,answer:Answer){
  const stage=page.locator('.lesson-runtime:not([hidden]) .interactive-stage');
  if(answer.type==='input')await stage.locator('.inline-answer input').fill(answer.value);
  else if(answer.type==='choice')await domClick(stage.getByRole('button',{name:answer.value,exact:true}));
  else for(const value of answer.values)await domClick(stage.locator('.order-bank').getByRole('button',{name:value,exact:true}));
  await domClick(stage.locator('.check-button'));
  await expect(stage.locator('.instant-feedback.good')).toBeVisible();
}

test('lesson 5 completes every main stage but does not claim full completion before mastery',async({page})=>{
  test.setTimeout(180_000);
  await openLessonFive(page);
  const visited=new Set<string>();
  for(let step=0;step<24;step+=1){
    const stage=page.locator('.lesson-runtime:not([hidden]) .interactive-stage');
    const stageId=await stage.getAttribute('data-stage-id');
    expect(stageId,`Stage ${step+1} must have data-stage-id`).toBeTruthy();
    visited.add(stageId!);
    await expectNoHorizontalOverflow(page);
    if(await stage.locator('.activity-area').count()){const answer=answers[stageId!];expect(answer,`Missing automated answer for ${stageId}`).toBeTruthy();await answerStage(page,answer)}
    if(stageId==='l5-summary')break;
    const next=page.locator('.lesson-controls .primary');await expect(next).toBeEnabled();await domClick(next);await expect(stage).not.toHaveAttribute('data-stage-id',stageId!);
  }
  await expect(page.locator('[data-stage-id="l5-summary"]')).toBeVisible();expect(visited.size).toBe(24);expect(Object.keys(answers).every(stageId=>visited.has(stageId))).toBe(true);
  const summary=page.locator('.summary-card');
  await expect(summary).toContainText('5/5');
  await expect(summary).toContainText('6/6');
  await expect(summary).toContainText('Основная часть ✓');
  await expect(summary).not.toContainText('Завершён');
  await expect(page.locator('.lesson-controls > span')).toHaveText('Основная часть пройдена');
  await expect(page.locator('[data-lesson-completion-gate="5"]')).toContainText('Урок ещё не завершён');
  await expect(page.locator('.lesson-page-navigator-toggle')).toContainText('Страница 24/24');
  await expectNoHorizontalOverflow(page);
});

test('lesson 5 keeps a selected answer after direct page navigation',async({page})=>{
  await openLessonFive(page);
  await page.evaluate(()=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:5,stageIndex:7}})));
  const reading=page.locator('[data-stage-id="l5-read"]');await expect(reading).toBeVisible();await domClick(reading.getByRole('button',{name:'сорок восемь миллиардов семь миллионов пять тысяч девяносто',exact:true}));
  await page.evaluate(()=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:5,stageIndex:8}})));await expect(page.locator('[data-stage-id="l5-write"]')).toBeVisible();await page.evaluate(()=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:5,stageIndex:7}})));
  await expect(page.locator('[data-stage-id="l5-read"] .choice-grid button.selected')).toContainText('сорок восемь миллиардов');
  await expectNoHorizontalOverflow(page);
});
