import { expect,test,type Page } from '@playwright/test';
import { extendedPracticeLesson15 } from '../src/data/extendedPracticeLesson15';
import { lessonFifteenMastery } from '../src/data/lessonFifteenMastery';
import type { ExtendedPracticeTask } from '../src/data/extendedPracticeTypes';

const mandatoryTasks:ExtendedPracticeTask[]=[...extendedPracticeLesson15.tasks,...lessonFifteenMastery];

type MainActivity={stageIndex:number;stageId:string;type:'choice'|'input';answer:string};
const mainActivities:MainActivity[]=[
  {stageIndex:1,stageId:'l15-diagnostic',type:'choice',answer:'Единичный отрезок соответствует изменению координаты на 1'},
  {stageIndex:3,stageId:'l15-practice1',type:'input',answer:'3,6,9,12,15'},
  {stageIndex:4,stageId:'l15-practice2',type:'input',answer:'5 мм'},
  {stageIndex:6,stageId:'l15-guided',type:'input',answer:'10,90,50,140,190,125'},
  {stageIndex:8,stageId:'l15-practice3',type:'input',answer:'10,80,70,130,180,155'},
  {stageIndex:10,stageId:'l15-practice4',type:'input',answer:'27,6,15,21'},
  {stageIndex:12,stageId:'l15-practice5',type:'input',answer:'3,11'},
  {stageIndex:14,stageId:'l15-practice6',type:'input',answer:'55,268'},
  {stageIndex:16,stageId:'l15-quiz1',type:'input',answer:'3'},
  {stageIndex:17,stageId:'l15-quiz2',type:'input',answer:'125'},
  {stageIndex:18,stageId:'l15-quiz3',type:'input',answer:'11'},
  {stageIndex:19,stageId:'l15-quiz4',type:'input',answer:'0,14'},
  {stageIndex:20,stageId:'l15-quiz5',type:'input',answer:'74'},
  {stageIndex:21,stageId:'l15-challenge',type:'input',answer:'8,5 см'},
  {stageIndex:22,stageId:'l15-transfer',type:'choice',answer:'Крупное деление 0→3 содержит три единичных отрезка'},
];

type NarrationLog={ids:string[]};

async function mockNarration(page:Page,log:NarrationLog){
  await page.route('**/api/narration-status',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,studioConfigured:true,voice:'Sulafat'})}));
  await page.route('**/api/narration',route=>{
    try{const payload=JSON.parse(route.request().postData()??'{}') as {id?:string};if(payload.id)log.ids.push(payload.id)}catch{/* keep mock resilient */}
    return route.fulfill({status:200,contentType:'audio/wav',body:'RIFF0000WAVEfmt '});
  });
}

async function openLessonFifteen(page:Page){
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await page.getByRole('button',{name:/Открыть урок 15:/}).click();
  await page.locator('.lesson-opening-start').click();
  await expect(page.locator('[data-stage-id="l15-mission"]')).toBeVisible();
}

async function jump(page:Page,stageIndex:number,stageId:string){
  await page.evaluate(({stageIndex})=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:15,stageIndex}})),{stageIndex});
  await expect(page.locator(`[data-stage-id="${stageId}"]`)).toBeVisible();
}

async function solveMainActivity(page:Page,entry:MainActivity){
  await jump(page,entry.stageIndex,entry.stageId);
  if(entry.type==='choice')await page.locator('.choice-grid').getByRole('button',{name:entry.answer,exact:true}).click();
  else await page.locator('.inline-answer input').fill(entry.answer);
  await page.locator('.check-button').click();
  await expect(page.locator('.instant-feedback.good')).toBeVisible();
}

async function solveMandatoryTask(page:Page,task:ExtendedPracticeTask){
  const practice=page.locator('.extended-practice');
  await expect(practice).toHaveAttribute('data-practice-task',task.id);
  if(task.type==='choice'){
    await practice.locator('.extended-practice-options').getByRole('button',{name:task.answer,exact:true}).click();
  }else if(task.type==='multi-input'){
    const inputs=practice.locator('.extended-practice-multi input');
    await expect(inputs).toHaveCount(task.fields.length);
    for(let index=0;index<task.fields.length;index++)await inputs.nth(index).fill(task.fields[index].answers[0]);
  }else{
    await practice.locator('.extended-practice-input input').fill(task.answers[0]);
  }
  await practice.locator('.extended-practice-check').click();
  await expect(practice.locator('.extended-practice-feedback.is-correct')).toBeVisible();
  await practice.locator('.extended-practice-next').click();
}

test('lesson 15 covers source tasks 126-134, exact semantics, visuals and all main interactions',async({page})=>{
  await mockNarration(page,{ids:[]});
  await openLessonFifteen(page);

  await jump(page,2,'l15-task126');
  await expect(page.locator('.l15-scale126-model')).toContainText('№126 · 9 см ↔ координаты 0…18');
  await expect(page.locator('.l15-major-scale span')).toHaveCount(7);
  await expect(page.locator('.l15-scale126-model')).toContainText('Большой интервал = +3 координаты');
  await expect(page.locator('.l15-scale126-model')).toContainText('Единичный отрезок = 5 мм');

  await jump(page,4,'l15-practice2');
  await page.locator('.inline-answer input').fill('15 мм');
  await page.locator('.check-button').click();
  await expect(page.locator('.instant-feedback.bad')).toBeVisible();
  await page.locator('.inline-answer input').fill('5 мм');
  await page.locator('.check-button').click();
  await expect(page.locator('.instant-feedback.good')).toContainText('90 : 18 = 5 мм');

  await jump(page,5,'l15-task127');
  await expect(page.locator('.l15-read-model')).toContainText('№127 · рисунок 57');
  await expect(page.locator('.l15-point-grid div')).toHaveCount(6);
  await expect(page.locator('.l15-read-model')).toContainText('125');

  await jump(page,7,'l15-task128');
  await expect(page.locator('.l15-read-model')).toContainText('№128 · рисунок 58');
  await expect(page.locator('.l15-point-grid .focus')).toContainText('155');

  await jump(page,9,'l15-plot');
  await expect(page.locator('.l15-plot-model')).toContainText('C(2) · D(8) · B(12)');
  await expect(page.locator('.l15-plot-model')).toContainText('1 клетка = 3 координатные единицы');

  await jump(page,11,'l15-distance');
  await expect(page.locator('.l15-distance-model')).toContainText('B(5), d=6');
  await expect(page.locator('.l15-distance-model')).toContainText('только 11');
  await expect(page.locator('.l15-distance-model')).toContainText('0 и 14');

  await jump(page,13,'l15-arrows');
  await expect(page.locator('.l15-arrow-model')).toContainText('46 → +9 → 55');
  await expect(page.locator('.l15-arrow-model')).toContainText('293 → −25 → 268');
  await expect(page.locator('.l15-arrow-model')).toContainText('74 → +8 → 82');
  await expect(page.locator('.l15-arrow-model')).toContainText('424 → −16 → 408');

  expect(mainActivities).toHaveLength(15);
  for(const entry of mainActivities)await solveMainActivity(page,entry);

  await jump(page,24,'l15-summary');
  await expect(page.locator('.summary-card')).toContainText('Основная часть ✓');
  await expect(page.locator('.summary-card')).toContainText('дальше — обязательная практика и финальное объяснение');
  await expect(page.locator('.reflection-completion-gate')).toContainText('Урок ещё не завершён');
});

test('lesson 15 migrates stale v1 lesson, practice, completion, reflection and old timing payload',async({page})=>{
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await page.evaluate(()=>{
    localStorage.removeItem('mathnikita:lesson-15-revision-v2-migrated');
    localStorage.setItem('mathnikita-lesson-15-progress-v1',JSON.stringify({version:1,stageIndex:24,responses:{},orders:{},checked:{},results:{},completedAt:new Date().toISOString()}));
    localStorage.setItem('mathnikita:extended-practice:15:v1','18');
    localStorage.setItem('mathnikita:extended-practice:15:v1:draft',JSON.stringify({taskId:'old'}));
    localStorage.setItem('mathnikita:lesson-complete:15',new Date().toISOString());
    localStorage.setItem('mathnikita:reflection:15',JSON.stringify({saved:true,text:'old reflection'}));
    localStorage.setItem('mathnikita:lesson-timing:15:v1',JSON.stringify({activeMs:123,legacy:true}));
  });
  await page.reload({waitUntil:'domcontentloaded'});
  await page.getByRole('button',{name:/Открыть урок 15:/}).click();
  await page.locator('.lesson-opening-start').click();
  await expect(page.locator('[data-stage-id="l15-mission"]')).toBeVisible();

  const migrated=await page.evaluate(()=>({
    marker:localStorage.getItem('mathnikita:lesson-15-revision-v2-migrated'),
    legacyLesson:localStorage.getItem('mathnikita-lesson-15-progress-v1'),
    legacyPractice:localStorage.getItem('mathnikita:extended-practice:15:v1'),
    legacyDraft:localStorage.getItem('mathnikita:extended-practice:15:v1:draft'),
    completion:localStorage.getItem('mathnikita:lesson-complete:15'),
    reflection:localStorage.getItem('mathnikita:reflection:15'),
    timing:localStorage.getItem('mathnikita:lesson-timing:15:v1'),
  }));
  expect(migrated.marker).toBe('1');
  expect(migrated.legacyLesson).toBeNull();
  expect(migrated.legacyPractice).toBeNull();
  expect(migrated.legacyDraft).toBeNull();
  expect(migrated.completion).toBeNull();
  expect(migrated.reflection).toBeNull();
  if(migrated.timing){
    const fresh=JSON.parse(migrated.timing) as {activeMs?:number;legacy?:boolean};
    expect(fresh.activeMs).not.toBe(123);
    expect(fresh.legacy).not.toBe(true);
  }

  await jump(page,24,'l15-summary');
  const summary=page.locator('.summary-card');
  await expect(summary).toContainText('0/5');
  await expect(summary).toContainText('0/6');
  await expect(summary).toContainText('Повторить');
  await expect(summary).not.toContainText('Основная часть ✓');
  await expect(page.locator('.reflection-completion-gate')).toContainText('Урок ещё не завершён');
  await expect(page.locator('.extended-practice-header')).toContainText('18 заданий · 48 проверяемых ответов');
  await expect(page.locator('.extended-practice')).toHaveAttribute('data-practice-task','l15-extra-1');
});

test('lesson 15 completes all mandatory work, final reflection, and persistent reset',async({page})=>{
  await mockNarration(page,{ids:[]});
  await openLessonFifteen(page);
  await jump(page,24,'l15-summary');

  expect(mandatoryTasks).toHaveLength(18);
  for(const task of mandatoryTasks)await solveMandatoryTask(page,task);

  await expect(page.locator('.extended-practice.is-finished')).toContainText('Решены все 18 заданий и заполнены 48 проверяемых ответов');
  const finalStep=page.locator('.reflection-final-step');
  await expect(finalStep).toBeVisible();
  await finalStep.locator('textarea').fill('Я различаю единичный отрезок, крупное деление и физическую длину рисунка. Умею читать и ставить точки, искать x плюс-минус расстояние и восстанавливать начало или конец стрелки.');
  await finalStep.getByRole('button',{name:'Завершить урок'}).click();
  await expect(finalStep).toContainText('Урок завершён ✓');
  expect(await page.evaluate(()=>localStorage.getItem('mathnikita:lesson-complete:15'))).not.toBeNull();

  await page.getByRole('button',{name:'Начать заново'}).click();
  await expect(page.locator('[data-stage-id="l15-mission"]')).toBeVisible();
  let persisted=await page.evaluate(()=>({
    completion:localStorage.getItem('mathnikita:lesson-complete:15'),
    reflection:localStorage.getItem('mathnikita:reflection:15'),
    practice:localStorage.getItem('mathnikita:extended-practice:15:v2'),
  }));
  expect(persisted.completion).toBeNull();
  expect(persisted.reflection).toBeNull();
  expect(persisted.practice).toBe('0');

  await page.reload({waitUntil:'domcontentloaded'});
  await page.getByRole('button',{name:/Открыть урок 15:/}).click();
  await page.locator('.lesson-opening-start').click();
  await jump(page,24,'l15-summary');
  await expect(page.locator('.extended-practice')).toHaveAttribute('data-practice-task',mandatoryTasks[0].id);
  persisted=await page.evaluate(()=>({completion:localStorage.getItem('mathnikita:lesson-complete:15'),reflection:localStorage.getItem('mathnikita:reflection:15'),practice:localStorage.getItem('mathnikita:extended-practice:15:v2')}));
  expect(persisted.completion).toBeNull();
  expect(persisted.reflection).toBeNull();
  expect(persisted.practice).toBe('0');
});

test('lesson 15 uses Sulafat for lesson, mandatory practice and both Pythagoras layers',async({page})=>{
  const log:NarrationLog={ids:[]};
  await mockNarration(page,log);
  await openLessonFifteen(page);

  await expect.poll(()=>log.ids.some(id=>id==='lesson-15-stage-l15-mission')).toBeTruthy();

  await jump(page,2,'l15-task126');
  await page.locator('.cat-mentor-actions').getByRole('button',{name:/Подсказка/}).click();
  await expect.poll(()=>log.ids.some(id=>id==='mentor-l15-scale-hint')).toBeTruthy();
  await expect(page.locator('.cat-mentor-bubble')).toContainText('90 миллиметров на 18');

  await jump(page,24,'l15-summary');
  await expect(page.locator('.cat-mentor-bubble')).not.toContainText('Урок завершён');
  await expect(page.locator('.extended-practice-voice')).toContainText('Sulafat');
  await expect.poll(()=>log.ids.some(id=>id==='lesson-15-practice-l15-extra-1')).toBeTruthy();

  await page.locator('.practice-pythagoras-actions').getByRole('button',{name:/Подсказка/}).click();
  await expect.poll(()=>log.ids.some(id=>id==='mentor-practice-15-l15-extra-1-hint')).toBeTruthy();
  await expect(page.locator('.practice-pythagoras')).toContainText('тот же AI-голос Sulafat');
});
