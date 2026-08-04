import { expect,test,type Page } from '@playwright/test';
import { extendedPracticeSetResponseCount,type ExtendedPracticeTask } from '../src/data/extendedPracticeTypes';
import { extendedPracticeByLesson } from '../src/data/extendedPracticeData';
import { answerMandatoryPractice,clickCatMentorAction } from './strictAuditUiHelpers';

const mandatoryPractice=extendedPracticeByLesson[10];
const mandatoryTasks:ExtendedPracticeTask[]=mandatoryPractice.tasks;
const mandatoryResponseCount=extendedPracticeSetResponseCount(mandatoryPractice);

type MainActivity={stageIndex:number;stageId:string;type:'choice'|'input'|'order';answer:string|string[]};
const mainActivities:MainActivity[]=[
  {stageIndex:2,stageId:'l10-plane-check',type:'choice',answer:'поверхность стола'},
  {stageIndex:5,stageId:'l10-one-line-check',type:'input',answer:'1'},
  {stageIndex:7,stageId:'l10-name-check',type:'choice',answer:'AB, BA или m'},
  {stageIndex:9,stageId:'l10-ray-check',type:'choice',answer:'OA'},
  {stageIndex:10,stageId:'l10-practice1',type:'choice',answer:'прямая'},
  {stageIndex:11,stageId:'l10-practice2',type:'input',answer:'2'},
  {stageIndex:12,stageId:'l10-practice3',type:'choice',answer:'KP'},
  {stageIndex:13,stageId:'l10-practice4',type:'choice',answer:'OA и OB'},
  {stageIndex:14,stageId:'l10-practice5',type:'order',answer:['Отметить две различные точки A и B','Приложить линейку к точкам A и B','Провести линию через обе точки','Продолжить изображение в обе стороны']},
  {stageIndex:15,stageId:'l10-practice6',type:'choice',answer:'тонкий луч света, идущий от источника в одном направлении'},
  {stageIndex:16,stageId:'l10-quiz1',type:'choice',answer:'плоскость бесконечна'},
  {stageIndex:17,stageId:'l10-quiz2',type:'input',answer:'1'},
  {stageIndex:18,stageId:'l10-quiz3',type:'input',answer:'0'},
  {stageIndex:19,stageId:'l10-quiz4',type:'choice',answer:'O'},
  {stageIndex:20,stageId:'l10-quiz5',type:'input',answer:'2'},
  {stageIndex:21,stageId:'l10-challenge',type:'input',answer:'3'},
];

type NarrationLog={ids:string[]};

async function mockNarration(page:Page,log:NarrationLog){
  await page.route('**/api/narration-status',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,studioConfigured:true,voice:'Sulafat'})}));
  await page.route('**/api/narration',route=>{
    try{const payload=JSON.parse(route.request().postData()??'{}') as {id?:string};if(payload.id)log.ids.push(payload.id)}catch{/* keep mock resilient */}
    return route.fulfill({status:200,contentType:'audio/wav',body:'RIFF0000WAVEfmt '});
  });
}

async function openLessonTen(page:Page){
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await page.getByRole('button',{name:/Открыть урок 10:/}).click();
  await page.locator('.lesson-opening-start').click();
  await expect(page.locator('[data-stage-id="l10-story"]')).toBeVisible();
}

async function jump(page:Page,stageIndex:number,stageId:string){
  await page.evaluate(({stageIndex})=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:10,stageIndex}})),{stageIndex});
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
  await answerMandatoryPractice(page.locator('.extended-practice'),task);
}

test('lesson 10 definitions, diagrams and every main interactive task are correct',async({page})=>{
  await mockNarration(page,{ids:[]});
  await openLessonTen(page);

  await jump(page,4,'l10-one-line');
  await expect(page.locator('.stage-copy')).toContainText('две различные точки');
  await expect(page.locator('.theory-note')).toContainText('только одна прямая');

  await jump(page,11,'l10-practice2');
  await expect(page.locator('.ray-model-m')).toContainText('M');
  await expect(page.locator('.ray-model-m')).toContainText('луч');

  await jump(page,12,'l10-practice3');
  await expect(page.locator('.ray-model-kp')).toContainText('K → P');
  await expect(page.locator('.activity-area')).toContainText('Как обозначить этот луч');

  await jump(page,14,'l10-practice5');
  await expect(page.locator('.order-bank button').first()).toHaveText('Продолжить изображение в обе стороны');
  await expect(page.locator('.order-bank button').first()).not.toHaveText('Отметить две различные точки A и B');

  expect(mainActivities).toHaveLength(16);
  for(const entry of mainActivities)await solveMainActivity(page,entry);

  await jump(page,22,'l10-summary');
  await expect(page.locator('.summary-card')).toContainText('Основная часть ✓');
  await expect(page.locator('.summary-card')).toContainText('дальше — обязательная практика');
  await expect(page.locator('.reflection-completion-gate')).toContainText('Урок ещё не завершён');
});

test('lesson 10 ignores stale v1 lesson and practice completion state',async({page})=>{
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await page.evaluate(()=>{
    localStorage.setItem('mathnikita-lesson-10-progress-v1',JSON.stringify({version:1,stageIndex:22,responses:{},orders:{},checked:{},results:{},completedAt:new Date().toISOString()}));
    localStorage.setItem('mathnikita:extended-practice:10:v1','18');
  });
  await page.reload({waitUntil:'domcontentloaded'});
  await page.getByRole('button',{name:/Открыть урок 10:/}).click();
  await page.locator('.lesson-opening-start').click();
  await expect(page.locator('[data-stage-id="l10-story"]')).toBeVisible();

  await jump(page,22,'l10-summary');
  await expect(page.locator('.summary-card')).toContainText('Основная часть ✓');
  await expect(page.locator('.extended-practice-header')).toContainText(`${mandatoryTasks.length} заданий · ${mandatoryResponseCount} проверяемых ответов`);
  await expect(page.locator('.extended-practice')).toHaveAttribute('data-practice-task','l10-p1');
});

test('lesson 10 completes every mandatory task, final reflection, and persistent reset',async({page})=>{
  await mockNarration(page,{ids:[]});
  await openLessonTen(page);
  await jump(page,22,'l10-summary');

  expect(mandatoryTasks).toHaveLength(20);
  for(const task of mandatoryTasks)await solveMandatoryTask(page,task);

  await expect(page.locator('.extended-practice.is-finished')).toContainText(`Решены все ${mandatoryTasks.length} заданий и заполнены ${mandatoryResponseCount} проверяемых ответов`);
  const finalStep=page.locator('.reflection-final-step');
  await expect(finalStep).toBeVisible();
  await finalStep.locator('textarea').fill('Плоскость бесконечна. Прямая продолжается в обе стороны и не имеет концов, а луч имеет начало и продолжается только в одном направлении. Через две различные точки проходит ровно одна прямая, а в названии луча первая буква обозначает его начало.');
  await finalStep.getByRole('button',{name:'Завершить урок'}).click();
  await expect(finalStep).toContainText('Урок завершён ✓');
  expect(await page.evaluate(()=>localStorage.getItem('mathnikita:lesson-complete:10'))).not.toBeNull();

  await page.getByRole('button',{name:'Начать заново'}).click();
  await expect(page.locator('[data-stage-id="l10-story"]')).toBeVisible();
  let persisted=await page.evaluate(()=>({
    completion:localStorage.getItem('mathnikita:lesson-complete:10'),
    reflection:localStorage.getItem('mathnikita:reflection:10'),
    practice:localStorage.getItem('mathnikita:extended-practice:10:v2'),
  }));
  expect(persisted.completion).toBeNull();
  expect(persisted.reflection).toBeNull();
  expect(persisted.practice).toBe('0');

  await page.reload({waitUntil:'domcontentloaded'});
  await page.getByRole('button',{name:/Открыть урок 10:/}).click();
  await page.locator('.lesson-opening-start').click();
  await jump(page,22,'l10-summary');
  await expect(page.locator('.extended-practice')).toHaveAttribute('data-practice-task',mandatoryTasks[0].id);
  persisted=await page.evaluate(()=>({completion:localStorage.getItem('mathnikita:lesson-complete:10'),reflection:localStorage.getItem('mathnikita:reflection:10'),practice:localStorage.getItem('mathnikita:extended-practice:10:v2')}));
  expect(persisted.completion).toBeNull();
  expect(persisted.reflection).toBeNull();
  expect(persisted.practice).toBe('0');
});

test('lesson 10 prepares Sulafat narration for lesson, mandatory practice and both Pythagoras layers',async({page})=>{
  const log:NarrationLog={ids:[]};
  await mockNarration(page,log);
  await openLessonTen(page);

  await expect.poll(()=>log.ids.some(id=>id==='lesson-10-stage-l10-story')).toBeTruthy();

  await jump(page,12,'l10-practice3');
  await clickCatMentorAction(page,/Подсказка/);
  await expect.poll(()=>log.ids.some(id=>id==='mentor-l10-ray-hint')).toBeTruthy();
  await expect(page.locator('.cat-mentor-bubble')).toContainText('начало луча');

  await jump(page,22,'l10-summary');
  await expect(page.locator('.cat-mentor-bubble')).not.toContainText('Урок завершён');
  await expect(page.locator('.extended-practice-voice')).toContainText('Sulafat');
  await expect.poll(()=>log.ids.some(id=>id==='lesson-10-practice-l10-p1')).toBeTruthy();

  await page.locator('.practice-pythagoras-actions').getByRole('button',{name:/Подсказка/}).click();
  await expect.poll(()=>log.ids.some(id=>id==='mentor-practice-10-l10-p1-hint')).toBeTruthy();
  await expect(page.locator('.practice-pythagoras')).toContainText('Sulafat');
});
