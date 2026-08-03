import { expect,test,type Page } from '@playwright/test';
import { extendedPracticeLesson14 } from '../src/data/extendedPracticeLesson14';
import { lessonFourteenMastery } from '../src/data/lessonFourteenMastery';
import type { ExtendedPracticeTask } from '../src/data/extendedPracticeTypes';

const mandatoryTasks:ExtendedPracticeTask[]=[...extendedPracticeLesson14.tasks,...lessonFourteenMastery];

type MainActivity={stageIndex:number;stageId:string;type:'choice'|'input'|'order';answer:string|string[]};
const mainActivities:MainActivity[]=[
  {stageIndex:1,stageId:'l14-recall',type:'choice',answer:'Начало O с числом 0, направление и единичный отрезок'},
  {stageIndex:3,stageId:'l14-practice1',type:'input',answer:'11'},
  {stageIndex:4,stageId:'l14-practice2',type:'input',answer:'4,5,6'},
  {stageIndex:6,stageId:'l14-guided',type:'input',answer:'4'},
  {stageIndex:7,stageId:'l14-practice3',type:'input',answer:'7'},
  {stageIndex:8,stageId:'l14-practice4',type:'input',answer:'235,236,237,238'},
  {stageIndex:10,stageId:'l14-practice5',type:'choice',answer:'5 мм'},
  {stageIndex:11,stageId:'l14-practice6',type:'order',answer:['Провести луч и обозначить O(0)','Выбрать удобную физическую длину единичного отрезка','Отложить от O выбранный отрезок и обозначить E(1)','Повторять равные единичные отрезки вправо','Отметить точки 5, 6, 7 и 10','Проверить число единичных отрезков до каждой точки']},
  {stageIndex:13,stageId:'l14-error-check',type:'choice',answer:'Последняя подпись должна быть 24, а не 25'},
  {stageIndex:15,stageId:'l14-quiz1',type:'input',answer:'9'},
  {stageIndex:16,stageId:'l14-quiz2',type:'input',answer:'12'},
  {stageIndex:17,stageId:'l14-quiz3',type:'choice',answer:'Обе записи M (5) верны'},
  {stageIndex:18,stageId:'l14-quiz4',type:'input',answer:'34'},
  {stageIndex:19,stageId:'l14-quiz5',type:'input',answer:'12'},
  {stageIndex:20,stageId:'l14-challenge',type:'input',answer:'42'},
];

type NarrationLog={ids:string[]};

async function mockNarration(page:Page,log:NarrationLog){
  await page.route('**/api/narration-status',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,studioConfigured:true,voice:'Sulafat'})}));
  await page.route('**/api/narration',route=>{
    try{const payload=JSON.parse(route.request().postData()??'{}') as {id?:string};if(payload.id)log.ids.push(payload.id)}catch{/* keep mock resilient */}
    return route.fulfill({status:200,contentType:'audio/wav',body:'RIFF0000WAVEfmt '});
  });
}

async function openLessonFourteen(page:Page){
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await page.getByRole('button',{name:/Открыть урок 14:/}).click();
  await page.locator('.lesson-opening-start').click();
  await expect(page.locator('[data-stage-id="l14-mission"]')).toBeVisible();
}

async function jump(page:Page,stageIndex:number,stageId:string){
  await page.evaluate(({stageIndex})=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:14,stageIndex}})),{stageIndex});
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

test('lesson 14 source tasks, unit-segment semantics, visuals and all main interactions are correct',async({page})=>{
  await mockNarration(page,{ids:[]});
  await openLessonFourteen(page);

  await jump(page,2,'l14-bounds');
  await expect(page.locator('.l14-bounds-model')).toContainText('Строго между 8 и 18');
  await expect(page.locator('.l14-bounds-model')).toContainText('9, 10, 11, 12, 13, 14, 15, 16, 17');
  await expect(page.locator('.l14-bounds-model .boundary')).toHaveCount(2);

  await jump(page,5,'l14-source-scale');
  await expect(page.locator('.l14-source-scale')).toContainText('№125 · 8 см ↔ координаты 0…16');
  await expect(page.locator('.l14-source-scale')).toContainText('Одна большая часть = 4 координатные единицы');
  await expect(page.locator('.l14-source-scale')).toContainText('Один единичный отрезок = 5 мм');
  await expect(page.locator('.l14-major-scale span')).toHaveCount(5);

  await jump(page,9,'l14-unit-choice');
  await expect(page.locator('.l14-unit-model')).toContainText('OE = 5 мм');
  await expect(page.locator('.l14-unit-model')).toContainText('OE = 2 см');
  await expect(page.locator('.l14-unit-model')).toContainText('в обоих случаях 5');

  await jump(page,11,'l14-practice6');
  await expect(page.locator('.order-bank button').first()).toHaveText('Отметить точки 5, 6, 7 и 10');
  await expect(page.locator('.order-bank button').first()).not.toHaveText('Провести луч и обозначить O(0)');

  await jump(page,12,'l14-error-lab');
  await expect(page.locator('.l14-error-model')).toContainText('16 → 25');
  await expect(page.locator('.l14-error-model')).toContainText('+9 ✕');
  await expect(page.locator('.l14-error-model')).toContainText('16 → 24');

  await jump(page,15,'l14-quiz1');
  await page.locator('.inline-answer input').fill('63');
  await page.locator('.check-button').click();
  await expect(page.locator('.instant-feedback.bad')).toBeVisible();
  await page.locator('.inline-answer input').fill('9');
  await page.locator('.check-button').click();
  await expect(page.locator('.instant-feedback.good')).toContainText('девять единичных отрезков дают A(9)');

  await jump(page,20,'l14-challenge');
  await expect(page.locator('.l14-incomplete-model')).toContainText('6 одинаковых крупных интервалов');
  await expect(page.locator('.l14-incomplete-model .target')).toContainText('42 C');

  expect(mainActivities).toHaveLength(15);
  for(const entry of mainActivities)await solveMainActivity(page,entry);

  await jump(page,22,'l14-summary');
  await expect(page.locator('.summary-card')).toContainText('Основная часть ✓');
  await expect(page.locator('.summary-card')).toContainText('дальше — обязательная практика');
  await expect(page.locator('.reflection-completion-gate')).toContainText('Урок ещё не завершён');
});

test('lesson 14 migrates stale v1 lesson, practice, completion, reflection and old timing payload',async({page})=>{
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await page.evaluate(()=>{
    localStorage.removeItem('mathnikita:lesson-14-revision-v2-migrated');
    localStorage.setItem('mathnikita-lesson-14-progress-v1',JSON.stringify({version:1,stageIndex:22,responses:{},orders:{},checked:{},results:{},completedAt:new Date().toISOString()}));
    localStorage.setItem('mathnikita:extended-practice:14:v1','18');
    localStorage.setItem('mathnikita:extended-practice:14:v1:draft',JSON.stringify({taskId:'old'}));
    localStorage.setItem('mathnikita:lesson-complete:14',new Date().toISOString());
    localStorage.setItem('mathnikita:reflection:14',JSON.stringify({saved:true,text:'old reflection'}));
    localStorage.setItem('mathnikita:lesson-timing:14:v1',JSON.stringify({activeMs:123,legacy:true}));
  });
  await page.reload({waitUntil:'domcontentloaded'});
  await page.getByRole('button',{name:/Открыть урок 14:/}).click();
  await page.locator('.lesson-opening-start').click();
  await expect(page.locator('[data-stage-id="l14-mission"]')).toBeVisible();

  const migrated=await page.evaluate(()=>({
    marker:localStorage.getItem('mathnikita:lesson-14-revision-v2-migrated'),
    legacyLesson:localStorage.getItem('mathnikita-lesson-14-progress-v1'),
    legacyPractice:localStorage.getItem('mathnikita:extended-practice:14:v1'),
    legacyDraft:localStorage.getItem('mathnikita:extended-practice:14:v1:draft'),
    completion:localStorage.getItem('mathnikita:lesson-complete:14'),
    reflection:localStorage.getItem('mathnikita:reflection:14'),
    timing:localStorage.getItem('mathnikita:lesson-timing:14:v1'),
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

  await jump(page,22,'l14-summary');
  const summary=page.locator('.summary-card');
  await expect(summary).toContainText('0/5');
  await expect(summary).toContainText('0/6');
  await expect(summary).toContainText('Повторить');
  await expect(summary).not.toContainText('Основная часть ✓');
  await expect(page.locator('.reflection-completion-gate')).toContainText('Урок ещё не завершён');
  await expect(page.locator('.extended-practice-header')).toContainText('18 заданий · 48 проверяемых ответов');
  await expect(page.locator('.extended-practice')).toHaveAttribute('data-practice-task','l14-extra-1');
});

test('lesson 14 completes all mandatory work, final reflection, and persistent reset',async({page})=>{
  await mockNarration(page,{ids:[]});
  await openLessonFourteen(page);
  await jump(page,22,'l14-summary');

  expect(mandatoryTasks).toHaveLength(18);
  for(const task of mandatoryTasks)await solveMandatoryTask(page,task);

  await expect(page.locator('.extended-practice.is-finished')).toContainText('Решены все 18 заданий и заполнены 48 проверяемых ответов');
  const finalStep=page.locator('.reflection-final-step');
  await expect(finalStep).toBeVisible();
  await finalStep.locator('textarea').fill('Я различаю единичный отрезок и крупный интервал шкалы: единичный отрезок всегда даёт плюс одну координату, а его физическую длину можно выбирать удобной. В строгих промежутках не включаю границы.');
  await finalStep.getByRole('button',{name:'Завершить урок'}).click();
  await expect(finalStep).toContainText('Урок завершён ✓');
  expect(await page.evaluate(()=>localStorage.getItem('mathnikita:lesson-complete:14'))).not.toBeNull();

  await page.getByRole('button',{name:'Начать заново'}).click();
  await expect(page.locator('[data-stage-id="l14-mission"]')).toBeVisible();
  let persisted=await page.evaluate(()=>({
    completion:localStorage.getItem('mathnikita:lesson-complete:14'),
    reflection:localStorage.getItem('mathnikita:reflection:14'),
    practice:localStorage.getItem('mathnikita:extended-practice:14:v2'),
  }));
  expect(persisted.completion).toBeNull();
  expect(persisted.reflection).toBeNull();
  expect(persisted.practice).toBe('0');

  await page.reload({waitUntil:'domcontentloaded'});
  await page.getByRole('button',{name:/Открыть урок 14:/}).click();
  await page.locator('.lesson-opening-start').click();
  await jump(page,22,'l14-summary');
  await expect(page.locator('.extended-practice')).toHaveAttribute('data-practice-task',mandatoryTasks[0].id);
  persisted=await page.evaluate(()=>({completion:localStorage.getItem('mathnikita:lesson-complete:14'),reflection:localStorage.getItem('mathnikita:reflection:14'),practice:localStorage.getItem('mathnikita:extended-practice:14:v2')}));
  expect(persisted.completion).toBeNull();
  expect(persisted.reflection).toBeNull();
  expect(persisted.practice).toBe('0');
});

test('lesson 14 uses Sulafat for lesson, mandatory practice and both Pythagoras layers',async({page})=>{
  const log:NarrationLog={ids:[]};
  await mockNarration(page,log);
  await openLessonFourteen(page);

  await expect.poll(()=>log.ids.some(id=>id==='lesson-14-stage-l14-mission')).toBeTruthy();

  await jump(page,5,'l14-source-scale');
  await page.locator('.cat-mentor-actions').getByRole('button',{name:/Подсказка/}).click();
  await expect.poll(()=>log.ids.some(id=>id==='mentor-l14-scale-hint')).toBeTruthy();
  await expect(page.locator('.cat-mentor-bubble')).toContainText('физическую длину одного единичного отрезка');

  await jump(page,22,'l14-summary');
  await expect(page.locator('.cat-mentor-bubble')).not.toContainText('Урок завершён');
  await expect(page.locator('.extended-practice-voice')).toContainText('Sulafat');
  await expect.poll(()=>log.ids.some(id=>id==='lesson-14-practice-l14-extra-1')).toBeTruthy();

  await page.locator('.practice-pythagoras-actions').getByRole('button',{name:/Подсказка/}).click();
  await expect.poll(()=>log.ids.some(id=>id==='mentor-practice-14-l14-extra-1-hint')).toBeTruthy();
  await expect(page.locator('.practice-pythagoras')).toContainText('тот же AI-голос Sulafat');
});
