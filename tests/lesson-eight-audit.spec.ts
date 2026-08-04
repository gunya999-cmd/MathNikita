import { expect,test,type Page } from '@playwright/test';
import { extendedPracticeLesson8 } from '../src/data/extendedPracticeLesson8';
import { buildMasteryPractice } from '../src/data/masteryPracticeGenerator';
import type { ExtendedPracticeTask } from '../src/data/extendedPracticeTypes';
import { answerMandatoryPractice,clickCatMentorAction } from './strictAuditUiHelpers';

const mandatoryTasks:ExtendedPracticeTask[]=[...extendedPracticeLesson8.tasks,...buildMasteryPractice(8)];

type NarrationLog={ids:string[]};

async function mockNarration(page:Page,log:NarrationLog){
  await page.route('**/api/narration-status',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,studioConfigured:true,voice:'Sulafat'})}));
  await page.route('**/api/narration',route=>{
    try{const payload=JSON.parse(route.request().postData()??'{}') as {id?:string};if(payload.id)log.ids.push(payload.id)}catch{/* keep mock resilient */}
    return route.fulfill({status:200,contentType:'audio/wav',body:'RIFF0000WAVEfmt '});
  });
}

async function openLessonEight(page:Page){
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await page.getByRole('button',{name:/Открыть урок 8:/}).click();
  await page.locator('.lesson-opening-start').click();
  await expect(page.locator('[data-stage-id="l8-story"]')).toBeVisible();
}

async function jump(page:Page,stageIndex:number,stageId:string){
  await page.evaluate(({stageIndex})=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:8,stageIndex}})),{stageIndex});
  await expect(page.locator(`[data-stage-id="${stageId}"]`)).toBeVisible();
}

async function solveMandatoryTask(page:Page,task:ExtendedPracticeTask){
  await answerMandatoryPractice(page.locator('.extended-practice'),task);
}

test('lesson 8 definition, source tasks and diagrams are mathematically correct',async({page})=>{
  await mockNarration(page,{ids:[]});
  await openLessonEight(page);

  await jump(page,1,'l8-definition');
  await expect(page.locator('.stage-copy')).toContainText('соседние звенья не лежат на одной прямой');

  await jump(page,2,'l8-recognize');
  await expect(page.locator('.activity-area')).toContainText('соседние звенья меняют направление');

  await jump(page,10,'l8-practice2');
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

  await clickCatMentorAction(page,/Дай пример/);
  await expect(page.locator('.cat-mentor-bubble')).toContainText('AB = AC − BC = 8 − 2 = 6');

  await jump(page,11,'l8-practice3');
  await expect(page.locator('.polyline-points-rule span')).toHaveCount(7);
  await expect(page.locator('.polyline-points-rule strong')).toContainText('10 точек → 9 промежутков');

  await jump(page,12,'l8-practice4');
  await expect(page.locator('.polyline-ruler strong')).toContainText('13 − 5 − 5');
  await page.locator('.choice-grid').getByRole('button',{name:'построить 13 см и отложить внутрь по 5 см от обоих концов',exact:true}).click();
  await page.locator('.check-button').click();
  await expect(page.locator('.instant-feedback.good')).toContainText('остаётся 13 − 5 − 5 = 3 см');

  await jump(page,18,'l8-quiz4');
  await expect(page.locator('.polyline-unit-model')).toContainText('35 мм');
  await expect(page.locator('.polyline-unit-model')).toContainText('4 см = 40 мм');
  await expect(page.locator('.polyline-unit-model')).toContainText('75 мм');

  await jump(page,19,'l8-quiz5');
  await expect(page.locator('.polyline-points-rule span')).toHaveCount(12);
  await expect(page.locator('.polyline-points-rule strong')).toContainText('12 точек → 11');

  await jump(page,20,'l8-challenge');
  await expect(page.locator('.polyline-ruler strong')).toContainText('2 = 15 − 13');
  await expect(page.locator('.polyline-ruler strong')).toContainText('1 = 16 − 15');
});

test('lesson 8 ignores stale wrong v1 progress and does not falsely complete at summary',async({page})=>{
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await page.evaluate(()=>{
    localStorage.setItem('mathnikita-lesson-8-progress-v1',JSON.stringify({version:1,stageIndex:10,responses:{'l8-p2':'16'},orders:{},checked:{'l8-p2':true},results:{'l8-p2':true},completedAt:new Date().toISOString()}));
  });
  await page.reload({waitUntil:'domcontentloaded'});
  await page.getByRole('button',{name:/Открыть урок 8:/}).click();
  await page.locator('.lesson-opening-start').click();
  await expect(page.locator('[data-stage-id="l8-story"]')).toBeVisible();

  await jump(page,22,'l8-summary');
  await expect(page.locator('.summary-card')).toContainText('Основная часть ✓');
  await expect(page.locator('.summary-card')).toContainText('дальше — обязательная практика');
  await expect(page.locator('.reflection-completion-gate')).toContainText('Урок ещё не завершён');
  await expect(page.locator('.extended-practice-header')).toContainText('18 заданий · 48 проверяемых ответов');
});

test('lesson 8 completes every mandatory task, final reflection, and persistent reset',async({page})=>{
  await mockNarration(page,{ids:[]});
  await openLessonEight(page);
  await jump(page,22,'l8-summary');

  expect(mandatoryTasks).toHaveLength(18);
  for(const task of mandatoryTasks)await solveMandatoryTask(page,task);

  await expect(page.locator('.extended-practice.is-finished')).toContainText('Решены все 18 заданий и заполнены 48 проверяемых ответов');
  const finalStep=page.locator('.reflection-final-step');
  await expect(finalStep).toBeVisible();
  await finalStep.locator('textarea').fill('Ломаная состоит из последовательно соединённых звеньев, соседние звенья меняют направление. Длина ломаной равна сумме длин всех её звеньев.');
  await finalStep.getByRole('button',{name:'Завершить урок'}).click();
  await expect(finalStep).toContainText('Урок завершён ✓');
  const completionBeforeReset=await page.evaluate(()=>localStorage.getItem('mathnikita:lesson-complete:8'));
  expect(completionBeforeReset).not.toBeNull();

  await page.getByRole('button',{name:'Начать заново'}).click();
  await expect(page.locator('[data-stage-id="l8-story"]')).toBeVisible();
  let persisted=await page.evaluate(()=>({completion:localStorage.getItem('mathnikita:lesson-complete:8'),reflection:localStorage.getItem('mathnikita:reflection:8'),practice:localStorage.getItem('mathnikita:extended-practice:8')}));
  expect(persisted.completion).toBeNull();
  expect(persisted.reflection).toBeNull();

  await page.reload({waitUntil:'domcontentloaded'});
  await page.getByRole('button',{name:/Открыть урок 8:/}).click();
  await page.locator('.lesson-opening-start').click();
  await jump(page,22,'l8-summary');
  await expect(page.locator('.extended-practice')).toHaveAttribute('data-practice-task',mandatoryTasks[0].id);
  persisted=await page.evaluate(()=>({completion:localStorage.getItem('mathnikita:lesson-complete:8'),reflection:localStorage.getItem('mathnikita:reflection:8'),practice:localStorage.getItem('mathnikita:extended-practice:8')}));
  expect(persisted.completion).toBeNull();
  expect(persisted.reflection).toBeNull();
});

test('lesson 8 prepares Sulafat narration for lesson, practice and both Pythagoras layers',async({page})=>{
  const log:NarrationLog={ids:[]};
  await mockNarration(page,log);
  await openLessonEight(page);

  await expect.poll(()=>log.ids.some(id=>id==='lesson-08-stage-l8-story')).toBeTruthy();

  await jump(page,10,'l8-practice2');
  await clickCatMentorAction(page,/Подсказка/);
  await expect.poll(()=>log.ids.some(id=>id==='mentor-l8-practice-hint')).toBeTruthy();

  await jump(page,22,'l8-summary');
  await expect(page.locator('.extended-practice-voice')).toContainText('Sulafat');
  await expect.poll(()=>log.ids.some(id=>id==='lesson-08-practice-l8-p1')).toBeTruthy();

  await page.locator('.practice-pythagoras-actions').getByRole('button',{name:/Подсказка/}).click();
  await expect.poll(()=>log.ids.some(id=>id==='mentor-practice-8-l8-p1-hint')).toBeTruthy();
  await expect(page.locator('.practice-pythagoras')).toContainText('тот же AI-голос Sulafat');
});