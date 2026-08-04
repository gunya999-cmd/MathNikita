import { expect,test,type Page } from '@playwright/test';
import { extendedPracticeSetResponseCount,type ExtendedPracticeTask } from '../src/data/extendedPracticeTypes';
import { extendedPracticeByLesson } from '../src/data/extendedPracticeData';
import { answerMandatoryPractice,clickCatMentorAction } from './strictAuditUiHelpers';

const mandatoryPractice=extendedPracticeByLesson[9];
const mandatoryTasks:ExtendedPracticeTask[]=mandatoryPractice.tasks;
const mandatoryResponseCount=extendedPracticeSetResponseCount(mandatoryPractice);

type NarrationLog={ids:string[]};

async function mockNarration(page:Page,log:NarrationLog){
  await page.route('**/api/narration-status',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,studioConfigured:true,voice:'Sulafat'})}));
  await page.route('**/api/narration',route=>{
    try{const payload=JSON.parse(route.request().postData()??'{}') as {id?:string};if(payload.id)log.ids.push(payload.id)}catch{/* keep mock resilient */}
    return route.fulfill({status:200,contentType:'audio/wav',body:'RIFF0000WAVEfmt '});
  });
}

async function openLessonNine(page:Page){
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await page.getByRole('button',{name:/Открыть урок 9:/}).click();
  await page.locator('.lesson-opening-start').click();
  await expect(page.locator('[data-stage-id="l9-story"]')).toBeVisible();
}

async function jump(page:Page,stageIndex:number,stageId:string){
  await page.evaluate(({stageIndex})=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:9,stageIndex}})),{stageIndex});
  await expect(page.locator(`[data-stage-id="${stageId}"]`)).toBeVisible();
}

async function solveMandatoryTask(page:Page,task:ExtendedPracticeTask){
  await answerMandatoryPractice(page.locator('.extended-practice'),task);
}

test('lesson 9 definitions, equal pairs, source tasks and diagrams are mathematically correct',async({page})=>{
  await mockNarration(page,{ids:[]});
  await openLessonNine(page);

  await jump(page,1,'l9-map');
  await expect(page.locator('.stage-copy')).toContainText('соседние звенья имеют общий конец и не лежат на одной прямой');

  await jump(page,2,'l9-diagnostic');
  await expect(page.locator('.activity-area')).toContainText('соседние звенья не лежат на одной прямой');

  await jump(page,7,'l9-units');
  await page.locator('.choice-grid').getByRole('button',{name:'только AB = NP',exact:true}).click();
  await page.locator('.check-button').click();
  await expect(page.locator('.instant-feedback.bad')).toBeVisible();
  await page.locator('.choice-grid').getByRole('button',{name:'AB = NP и MK = ST',exact:true}).click();
  await page.locator('.check-button').click();
  await expect(page.locator('.instant-feedback.good')).toContainText('одновременно MK = ST');

  await jump(page,9,'l9-practice2');
  await expect(page.locator('.l7-chain-model > span')).toHaveText(['A','B','C','D']);
  await expect(page.locator('.l7-chain-model strong')).toContainText('AC = AB + BC');
  const task71=page.locator('.inline-answer input');
  await task71.fill('16');
  await page.locator('.check-button').click();
  await expect(page.locator('.instant-feedback.bad')).toBeVisible();
  await task71.fill('12');
  await page.locator('.check-button').click();
  await expect(page.locator('.instant-feedback.good')).toContainText('AB = AC − BC = 8 − 2 = 6 см');
  await expect(page.locator('.instant-feedback.good')).toContainText('AD = AB + BD = 6 + 6 = 12 см');

  const mentorBubble=page.locator('.cat-mentor-bubble');
  await clickCatMentorAction(page,/Дай пример/);
  await expect(mentorBubble).toContainText(/AB = AC − BC = 8 − 2 = 6 см\. Затем AD = AB \+ BD = 6 \+ 6 = 12 см\./);

  await jump(page,20,'l9-challenge');
  await expect(page.locator('.polyline-ruler strong')).toContainText('3 = 13 − 5 − 5');
  await expect(page.locator('.polyline-ruler strong')).toContainText('2 = 15 − 13');
  await expect(page.locator('.polyline-ruler strong')).toContainText('1 = 16 − 15');
  const orderBank=page.locator('.order-bank button');
  await expect(orderBank.first()).toHaveText('Получить 1 см как 16 − 15');
});

test('lesson 9 ignores stale wrong v1 lesson and practice progress and does not falsely complete at summary',async({page})=>{
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await page.evaluate(()=>{
    localStorage.setItem('mathnikita-lesson-9-progress-v1',JSON.stringify({version:1,stageIndex:9,responses:{'l9-p2':'16'},orders:{},checked:{'l9-p2':true},results:{'l9-p2':true},completedAt:new Date().toISOString()}));
    localStorage.setItem('mathnikita:extended-practice:9:v1','18');
  });
  await page.reload({waitUntil:'domcontentloaded'});
  await page.getByRole('button',{name:/Открыть урок 9:/}).click();
  await page.locator('.lesson-opening-start').click();
  await expect(page.locator('[data-stage-id="l9-story"]')).toBeVisible();

  await jump(page,22,'l9-summary');
  await expect(page.locator('.summary-card')).toContainText('Основная часть ✓');
  await expect(page.locator('.summary-card')).toContainText('дальше — обязательная практика');
  await expect(page.locator('.reflection-completion-gate')).toContainText('Урок ещё не завершён');
  await expect(page.locator('.extended-practice-header')).toContainText(`${mandatoryTasks.length} заданий · ${mandatoryResponseCount} проверяемых ответов`);
  await expect(page.locator('.extended-practice')).toHaveAttribute('data-practice-task','l9-p1');
});

test('lesson 9 completes every mandatory task, final reflection, and persistent reset',async({page})=>{
  await mockNarration(page,{ids:[]});
  await openLessonNine(page);
  await jump(page,22,'l9-summary');

  expect(mandatoryTasks).toHaveLength(20);
  for(const task of mandatoryTasks)await solveMandatoryTask(page,task);

  await expect(page.locator('.extended-practice.is-finished')).toContainText(`Решены все ${mandatoryTasks.length} заданий и заполнены ${mandatoryResponseCount} проверяемых ответов`);
  const finalStep=page.locator('.reflection-final-step');
  await expect(finalStep).toBeVisible();
  await finalStep.locator('textarea').fill('Для отрезка я сначала определяю целое и части, а для ломаной — все звенья и повороты. Перед вычислением привожу длины к одной единице и только потом выбираю действие.');
  await finalStep.getByRole('button',{name:'Завершить урок'}).click();
  await expect(finalStep).toContainText('Урок завершён ✓');
  const completionBeforeReset=await page.evaluate(()=>localStorage.getItem('mathnikita:lesson-complete:9'));
  expect(completionBeforeReset).not.toBeNull();

  await page.getByRole('button',{name:'Начать заново'}).click();
  await expect(page.locator('[data-stage-id="l9-story"]')).toBeVisible();
  let persisted=await page.evaluate(()=>({
    completion:localStorage.getItem('mathnikita:lesson-complete:9'),
    reflection:localStorage.getItem('mathnikita:reflection:9'),
    practice:localStorage.getItem('mathnikita:extended-practice:9:v2'),
  }));
  expect(persisted.completion).toBeNull();
  expect(persisted.reflection).toBeNull();
  expect(persisted.practice).toBe('0');

  await page.reload({waitUntil:'domcontentloaded'});
  await page.getByRole('button',{name:/Открыть урок 9:/}).click();
  await page.locator('.lesson-opening-start').click();
  await jump(page,22,'l9-summary');
  await expect(page.locator('.extended-practice')).toHaveAttribute('data-practice-task',mandatoryTasks[0].id);
  persisted=await page.evaluate(()=>({completion:localStorage.getItem('mathnikita:lesson-complete:9'),reflection:localStorage.getItem('mathnikita:reflection:9'),practice:localStorage.getItem('mathnikita:extended-practice:9:v2')}));
  expect(persisted.completion).toBeNull();
  expect(persisted.reflection).toBeNull();
  expect(persisted.practice).toBe('0');
});

test('lesson 9 prepares Sulafat narration for lesson, mandatory practice and both Pythagoras layers',async({page})=>{
  const log:NarrationLog={ids:[]};
  await mockNarration(page,log);
  await openLessonNine(page);

  await expect.poll(()=>log.ids.some(id=>id==='lesson-09-stage-l9-story')).toBeTruthy();

  await jump(page,9,'l9-practice2');
  await clickCatMentorAction(page,/Подсказка/);
  await expect.poll(()=>log.ids.some(id=>id==='mentor-l9-task71-hint')).toBeTruthy();
  await expect(page.locator('.cat-mentor-bubble')).toContainText('вычти BC из AC');

  await jump(page,22,'l9-summary');
  await expect(page.locator('.extended-practice-voice')).toContainText('Sulafat');
  await expect.poll(()=>log.ids.some(id=>id==='lesson-09-practice-l9-p1')).toBeTruthy();

  await page.locator('.practice-pythagoras-actions').getByRole('button',{name:/Подсказка/}).click();
  await expect.poll(()=>log.ids.some(id=>id==='mentor-practice-9-l9-p1-hint')).toBeTruthy();
  await expect(page.locator('.practice-pythagoras')).toContainText('Sulafat');
});