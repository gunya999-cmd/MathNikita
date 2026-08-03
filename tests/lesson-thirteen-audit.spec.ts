import { expect,test,type Page } from '@playwright/test';
import { extendedPracticeLesson13 } from '../src/data/extendedPracticeLesson13';
import { lessonThirteenMastery } from '../src/data/lessonThirteenMastery';
import type { ExtendedPracticeTask } from '../src/data/extendedPracticeTypes';

const mandatoryTasks:ExtendedPracticeTask[]=[...extendedPracticeLesson13.tasks,...lessonThirteenMastery];

type MainActivity={stageIndex:number;stageId:string;type:'choice'|'input'|'order';answer:string|string[]};
const mainActivities:MainActivity[]=[
  {stageIndex:2,stageId:'l13-diagnostic',type:'input',answer:'5'},
  {stageIndex:4,stageId:'l13-practice1',type:'input',answer:'10'},
  {stageIndex:5,stageId:'l13-practice2',type:'input',answer:'90'},
  {stageIndex:8,stageId:'l13-coordinate',type:'choice',answer:'M (4)'},
  {stageIndex:9,stageId:'l13-practice3',type:'input',answer:'7'},
  {stageIndex:10,stageId:'l13-practice4',type:'input',answer:'11'},
  {stageIndex:11,stageId:'l13-practice5',type:'input',answer:'7'},
  {stageIndex:12,stageId:'l13-practice6',type:'order',answer:['Провести луч и обозначить начало O','Подписать под O число 0','Выбрать единичный отрезок OE','Откладывать равные отрезки вправо','Подписать координаты точек']},
  {stageIndex:14,stageId:'l13-quiz1',type:'input',answer:'10'},
  {stageIndex:15,stageId:'l13-quiz2',type:'choice',answer:'0'},
  {stageIndex:16,stageId:'l13-quiz3',type:'choice',answer:'единичный отрезок'},
  {stageIndex:17,stageId:'l13-quiz4',type:'input',answer:'15'},
  {stageIndex:18,stageId:'l13-quiz5',type:'input',answer:'9'},
  {stageIndex:19,stageId:'l13-challenge',type:'input',answer:'6'},
];

type NarrationLog={ids:string[]};

async function mockNarration(page:Page,log:NarrationLog){
  await page.route('**/api/narration-status',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,studioConfigured:true,voice:'Sulafat'})}));
  await page.route('**/api/narration',route=>{
    try{const payload=JSON.parse(route.request().postData()??'{}') as {id?:string};if(payload.id)log.ids.push(payload.id)}catch{/* keep mock resilient */}
    return route.fulfill({status:200,contentType:'audio/wav',body:'RIFF0000WAVEfmt '});
  });
}

async function openLessonThirteen(page:Page){
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await page.getByRole('button',{name:/Открыть урок 13:/}).click();
  await page.locator('.lesson-opening-start').click();
  await expect(page.locator('[data-stage-id="l13-story"]')).toBeVisible();
}

async function jump(page:Page,stageIndex:number,stageId:string){
  await page.evaluate(({stageIndex})=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:13,stageIndex}})),{stageIndex});
  await expect(page.locator(`[data-stage-id="${stageId}"]`)).toBeVisible();
}

async function solveMainActivity(page:Page,entry:MainActivity){
  await jump(page,entry.stageIndex,entry.stageId);
  if(entry.type==='choice'){
    await page.locator('.choice-grid').getByRole('button',{name:String(entry.answer),exact:true}).click();
  }else if(entry.type==='input'){
    await page.locator('.inline-answer input').fill(String(entry.answer));
  }else{
    for(const item of entry.answer as string[])await page.locator('.order-bank').getByRole('button',{name:item,exact:true}).click();
  }
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

test('lesson 13 scale math, visual models and every main interactive task are correct',async({page})=>{
  await mockNarration(page,{ids:[]});
  await openLessonThirteen(page);

  await jump(page,2,'l13-diagnostic');
  await expect(page.locator('.l13-division-model')).toContainText('6 равных промежутков');
  await expect(page.locator('.l13-division-model .interval-strip span')).toHaveCount(7);
  await expect(page.locator('.l13-division-model')).toContainText('30 : 6 = 5');
  await page.locator('.inline-answer input').fill('6');
  await page.locator('.check-button').click();
  await expect(page.locator('.instant-feedback.bad')).toBeVisible();
  await page.locator('.inline-answer input').fill('5');
  await page.locator('.check-button').click();
  await expect(page.locator('.instant-feedback.good')).toContainText('30 : 6 = 5');

  await jump(page,4,'l13-practice1');
  await expect(page.locator('.l13-speed-model')).toContainText('40 → 100 км/ч');
  await expect(page.locator('.l13-speed-model .interval-strip span')).toHaveCount(7);
  await expect(page.locator('.l13-speed-model')).toContainText('цена деления = 10 км/ч');

  await jump(page,5,'l13-practice2');
  await expect(page.locator('.l13-reading-model')).toContainText('60 + 3 · 10 = 90 км/ч');
  await expect(page.locator('.l13-reading-model .interval-strip .active')).toHaveText('90');

  await jump(page,8,'l13-coordinate');
  await expect(page.locator('.l13-point-model')).toContainText('семь единичных шагов от O');
  await expect(page.locator('.l13-point-model')).toContainText('A');

  await jump(page,10,'l13-practice4');
  await expect(page.locator('.l13-move-model')).toContainText('C(7) → +4');
  await expect(page.locator('.l13-move-model')).toContainText('новая');

  await jump(page,11,'l13-practice5');
  await expect(page.locator('.l13-move-model')).toContainText('B(12) → −5');

  await jump(page,12,'l13-practice6');
  await expect(page.locator('.order-bank button').first()).toHaveText('Откладывать равные отрезки вправо');
  await expect(page.locator('.order-bank button').first()).not.toHaveText('Провести луч и обозначить начало O');

  await jump(page,13,'l13-control');
  await expect(page.locator('.theory-note')).toContainText('физическая длина единичного отрезка может быть разной');
  await expect(page.locator('.theory-note')).toContainText('ровно через четыре выбранных единичных отрезка');

  await jump(page,19,'l13-challenge');
  await expect(page.locator('.l13-robot-model')).toContainText('цель 10');
  await expect(page.locator('.l13-robot-model')).toContainText('16');
  await expect(page.locator('.l13-robot-model')).toContainText('13');
  await expect(page.locator('.l13-robot-model')).toContainText('10');

  expect(mainActivities).toHaveLength(14);
  for(const entry of mainActivities)await solveMainActivity(page,entry);

  await jump(page,21,'l13-summary');
  await expect(page.locator('.summary-card')).toContainText('Основная часть ✓');
  await expect(page.locator('.summary-card')).toContainText('дальше — обязательная практика');
  await expect(page.locator('.reflection-completion-gate')).toContainText('Урок ещё не завершён');
});

test('lesson 13 migrates stale v1 lesson, practice, completion and reflection state',async({page})=>{
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await page.evaluate(()=>{
    localStorage.removeItem('mathnikita:lesson-13-revision-v2-migrated');
    localStorage.setItem('mathnikita-lesson-13-progress-v1',JSON.stringify({version:1,stageIndex:21,responses:{},orders:{},checked:{},results:{},completedAt:new Date().toISOString()}));
    localStorage.setItem('mathnikita:extended-practice:13:v1','18');
    localStorage.setItem('mathnikita:extended-practice:13:v1:draft',JSON.stringify({taskId:'old'}));
    localStorage.setItem('mathnikita:lesson-complete:13',new Date().toISOString());
    localStorage.setItem('mathnikita:reflection:13',JSON.stringify({saved:true,text:'old reflection'}));
    localStorage.setItem('mathnikita:lesson-timing:13:v1',JSON.stringify({activeMs:123}));
  });
  await page.reload({waitUntil:'domcontentloaded'});
  await page.getByRole('button',{name:/Открыть урок 13:/}).click();
  await page.locator('.lesson-opening-start').click();
  await expect(page.locator('[data-stage-id="l13-story"]')).toBeVisible();

  const migrated=await page.evaluate(()=>({
    marker:localStorage.getItem('mathnikita:lesson-13-revision-v2-migrated'),
    legacyLesson:localStorage.getItem('mathnikita-lesson-13-progress-v1'),
    legacyPractice:localStorage.getItem('mathnikita:extended-practice:13:v1'),
    legacyDraft:localStorage.getItem('mathnikita:extended-practice:13:v1:draft'),
    completion:localStorage.getItem('mathnikita:lesson-complete:13'),
    reflection:localStorage.getItem('mathnikita:reflection:13'),
    timing:localStorage.getItem('mathnikita:lesson-timing:13:v1'),
  }));
  expect(migrated.marker).toBe('1');
  expect(migrated.legacyLesson).toBeNull();
  expect(migrated.legacyPractice).toBeNull();
  expect(migrated.legacyDraft).toBeNull();
  expect(migrated.completion).toBeNull();
  expect(migrated.reflection).toBeNull();
  expect(migrated.timing).toBeNull();

  await jump(page,21,'l13-summary');
  const summary=page.locator('.summary-card');
  await expect(summary).toContainText('0/5');
  await expect(summary).toContainText('0/6');
  await expect(summary).toContainText('Повторить');
  await expect(summary).not.toContainText('Основная часть ✓');
  await expect(page.locator('.reflection-completion-gate')).toContainText('Урок ещё не завершён');
  await expect(page.locator('.extended-practice-header')).toContainText('18 заданий · 48 проверяемых ответов');
  await expect(page.locator('.extended-practice')).toHaveAttribute('data-practice-task','l13-extra-1');
});

test('lesson 13 completes all mandatory work, final reflection, and persistent reset',async({page})=>{
  await mockNarration(page,{ids:[]});
  await openLessonThirteen(page);
  await jump(page,21,'l13-summary');

  expect(mandatoryTasks).toHaveLength(18);
  for(const task of mandatoryTasks)await solveMandatoryTask(page,task);

  await expect(page.locator('.extended-practice.is-finished')).toContainText('Решены все 18 заданий и заполнены 48 проверяемых ответов');
  const finalStep=page.locator('.reflection-final-step');
  await expect(finalStep).toBeVisible();
  await finalStep.locator('textarea').fill('Для шкалы я считаю промежутки, нахожу цену деления и не забываю единицу. На координатном луче начинаю с O(0), выбираю единичный отрезок и считаю шаги вправо или влево.');
  await finalStep.getByRole('button',{name:'Завершить урок'}).click();
  await expect(finalStep).toContainText('Урок завершён ✓');
  expect(await page.evaluate(()=>localStorage.getItem('mathnikita:lesson-complete:13'))).not.toBeNull();

  await page.getByRole('button',{name:'Начать заново'}).click();
  await expect(page.locator('[data-stage-id="l13-story"]')).toBeVisible();
  let persisted=await page.evaluate(()=>({
    completion:localStorage.getItem('mathnikita:lesson-complete:13'),
    reflection:localStorage.getItem('mathnikita:reflection:13'),
    practice:localStorage.getItem('mathnikita:extended-practice:13:v2'),
  }));
  expect(persisted.completion).toBeNull();
  expect(persisted.reflection).toBeNull();
  expect(persisted.practice).toBe('0');

  await page.reload({waitUntil:'domcontentloaded'});
  await page.getByRole('button',{name:/Открыть урок 13:/}).click();
  await page.locator('.lesson-opening-start').click();
  await jump(page,21,'l13-summary');
  await expect(page.locator('.extended-practice')).toHaveAttribute('data-practice-task',mandatoryTasks[0].id);
  persisted=await page.evaluate(()=>({completion:localStorage.getItem('mathnikita:lesson-complete:13'),reflection:localStorage.getItem('mathnikita:reflection:13'),practice:localStorage.getItem('mathnikita:extended-practice:13:v2')}));
  expect(persisted.completion).toBeNull();
  expect(persisted.reflection).toBeNull();
  expect(persisted.practice).toBe('0');
});

test('lesson 13 uses Sulafat for lesson, mandatory practice and both Pythagoras layers',async({page})=>{
  const log:NarrationLog={ids:[]};
  await mockNarration(page,log);
  await openLessonThirteen(page);

  await expect.poll(()=>log.ids.some(id=>id==='lesson-13-stage-l13-story')).toBeTruthy();

  await jump(page,2,'l13-diagnostic');
  await page.locator('.cat-mentor-actions').getByRole('button',{name:/Подсказка/}).click();
  await expect.poll(()=>log.ids.some(id=>id==='mentor-l13-scale-hint')).toBeTruthy();
  await expect(page.locator('.cat-mentor-bubble')).toContainText('разность подписанных значений');

  await jump(page,21,'l13-summary');
  await expect(page.locator('.cat-mentor-bubble')).not.toContainText('Урок завершён');
  await expect(page.locator('.extended-practice-voice')).toContainText('Sulafat');
  await expect.poll(()=>log.ids.some(id=>id==='lesson-13-practice-l13-extra-1')).toBeTruthy();

  await page.locator('.practice-pythagoras-actions').getByRole('button',{name:/Подсказка/}).click();
  await expect.poll(()=>log.ids.some(id=>id==='mentor-practice-13-l13-extra-1-hint')).toBeTruthy();
  await expect(page.locator('.practice-pythagoras-voice')).toContainText('Sulafat');
});
