import { expect,test,type Page } from '@playwright/test';
import { extendedPracticeLesson12 } from '../src/data/extendedPracticeLesson12';
import { lessonTwelveMastery } from '../src/data/lessonTwelveMastery';
import type { ExtendedPracticeTask } from '../src/data/extendedPracticeTypes';

const mandatoryTasks:ExtendedPracticeTask[]=[...extendedPracticeLesson12.tasks,...lessonTwelveMastery];

type MainActivity={stageIndex:number;stageId:string;type:'choice'|'input'|'order';answer:string|string[]};
const mainActivities:MainActivity[]=[
  {stageIndex:2,stageId:'l12-diagnostic',type:'choice',answer:'луч'},
  {stageIndex:6,stageId:'l12-practice1',type:'input',answer:'1'},
  {stageIndex:7,stageId:'l12-practice2',type:'choice',answer:'точка X лежит на прямой TF по другую сторону от T, чем F'},
  {stageIndex:8,stageId:'l12-practice3',type:'input',answer:'14'},
  {stageIndex:9,stageId:'l12-practice4',type:'choice',answer:'7 см или 43 см'},
  {stageIndex:10,stageId:'l12-practice5',type:'choice',answer:'точка, отрезок или луч'},
  {stageIndex:11,stageId:'l12-practice6',type:'order',answer:['Назвать все фигуры','Определить начала и концы','Проверить направления лучей','Отметить пересечения и общие части','Сверить вывод с условием']},
  {stageIndex:13,stageId:'l12-quiz1',type:'choice',answer:'плоскость бесконечна'},
  {stageIndex:14,stageId:'l12-quiz2',type:'choice',answer:'AB и BA обозначают одну и ту же прямую'},
  {stageIndex:15,stageId:'l12-quiz3',type:'input',answer:'10'},
  {stageIndex:16,stageId:'l12-quiz4',type:'choice',answer:'P'},
  {stageIndex:17,stageId:'l12-quiz5',type:'choice',answer:'точки могут лежать по одну или по разные стороны от исходной точки'},
  {stageIndex:18,stageId:'l12-challenge',type:'choice',answer:'7 и 4'},
];

type NarrationLog={ids:string[]};

async function mockNarration(page:Page,log:NarrationLog){
  await page.route('**/api/narration-status',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,studioConfigured:true,voice:'Sulafat'})}));
  await page.route('**/api/narration',route=>{
    try{const payload=JSON.parse(route.request().postData()??'{}') as {id?:string};if(payload.id)log.ids.push(payload.id)}catch{/* keep mock resilient */}
    return route.fulfill({status:200,contentType:'audio/wav',body:'RIFF0000WAVEfmt '});
  });
}

async function openLessonTwelve(page:Page){
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await page.getByRole('button',{name:/Открыть урок 12:/}).click();
  await page.locator('.lesson-opening-start').click();
  await expect(page.locator('[data-stage-id="l12-story"]')).toBeVisible();
}

async function jump(page:Page,stageIndex:number,stageId:string){
  await page.evaluate(({stageIndex})=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:12,stageIndex}})),{stageIndex});
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

test('lesson 12 source properties, visual models and every main interactive task are correct',async({page})=>{
  await mockNarration(page,{ids:[]});
  await openLessonTwelve(page);

  await jump(page,1,'l12-map');
  await expect(page.locator('.l12-figure-map')).toContainText('Плоскость');
  await expect(page.locator('.l12-figure-map')).toContainText('бесконечна');
  await expect(page.locator('.l12-figure-map')).toContainText('Прямая');
  await expect(page.locator('.l12-figure-map')).toContainText('Луч');
  await expect(page.locator('.l12-figure-map')).toContainText('Отрезок');

  await jump(page,7,'l12-practice2');
  await expect(page.locator('.l12-intersection-model')).toContainText('X принадлежит прямой TF, но не лучу TF');
  await expect(page.locator('.l12-intersection-model')).toContainText('T');
  await expect(page.locator('.l12-intersection-model')).toContainText('F');
  await expect(page.locator('.l12-intersection-model')).toContainText('M');
  await expect(page.locator('.l12-intersection-model')).toContainText('K');

  await jump(page,9,'l12-practice4');
  await expect(page.locator('.l12-distance-cases')).toContainText('25 − 18 = 7 см');
  await expect(page.locator('.l12-distance-cases')).toContainText('18 + 25 = 43 см');
  await page.locator('.choice-grid').getByRole('button',{name:'только 7 см',exact:true}).click();
  await page.locator('.check-button').click();
  await expect(page.locator('.instant-feedback.bad')).toBeVisible();
  await page.locator('.choice-grid').getByRole('button',{name:'7 см или 43 см',exact:true}).click();
  await page.locator('.check-button').click();
  await expect(page.locator('.instant-feedback.good')).toContainText('25 + 18 = 43 см');

  await jump(page,10,'l12-practice5');
  await expect(page.locator('.l12-common-part-model')).toContainText('Точка');
  await expect(page.locator('.l12-common-part-model')).toContainText('Отрезок');
  await expect(page.locator('.l12-common-part-model')).toContainText('Луч');

  await jump(page,11,'l12-practice6');
  await expect(page.locator('.order-bank button').first()).toHaveText('Проверить направления лучей');
  await expect(page.locator('.order-bank button').first()).not.toHaveText('Назвать все фигуры');

  await jump(page,18,'l12-challenge');
  await expect(page.locator('.l12-three-lines-model')).toContainText('7 частей');
  await expect(page.locator('.l12-three-lines-model')).toContainText('4 части');
  await expect(page.locator('.l12-three-lines-model .maximum i')).toHaveCount(3);
  await expect(page.locator('.l12-three-lines-model .minimum i')).toHaveCount(3);

  expect(mainActivities).toHaveLength(13);
  for(const entry of mainActivities)await solveMainActivity(page,entry);

  await jump(page,20,'l12-summary');
  await expect(page.locator('.summary-card')).toContainText('Основная часть ✓');
  await expect(page.locator('.summary-card')).toContainText('дальше — обязательная практика');
  await expect(page.locator('.reflection-completion-gate')).toContainText('Урок ещё не завершён');
});

test('lesson 12 migrates stale v1 lesson, practice, completion and reflection state',async({page})=>{
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await page.evaluate(()=>{
    localStorage.removeItem('mathnikita:lesson-12-revision-v2-migrated');
    localStorage.setItem('mathnikita-lesson-12-progress-v1',JSON.stringify({version:1,stageIndex:20,responses:{},orders:{},checked:{},results:{},completedAt:new Date().toISOString()}));
    localStorage.setItem('mathnikita:extended-practice:12:v1','18');
    localStorage.setItem('mathnikita:extended-practice:12:v1:draft',JSON.stringify({taskId:'old'}));
    localStorage.setItem('mathnikita:lesson-complete:12',new Date().toISOString());
    localStorage.setItem('mathnikita:reflection:12',JSON.stringify({saved:true,text:'old reflection'}));
  });
  await page.reload({waitUntil:'domcontentloaded'});
  await page.getByRole('button',{name:/Открыть урок 12:/}).click();
  await page.locator('.lesson-opening-start').click();
  await expect(page.locator('[data-stage-id="l12-story"]')).toBeVisible();

  const migrated=await page.evaluate(()=>({
    marker:localStorage.getItem('mathnikita:lesson-12-revision-v2-migrated'),
    legacyLesson:localStorage.getItem('mathnikita-lesson-12-progress-v1'),
    legacyPractice:localStorage.getItem('mathnikita:extended-practice:12:v1'),
    legacyDraft:localStorage.getItem('mathnikita:extended-practice:12:v1:draft'),
    completion:localStorage.getItem('mathnikita:lesson-complete:12'),
    reflection:localStorage.getItem('mathnikita:reflection:12'),
  }));
  expect(migrated.marker).toBe('1');
  expect(migrated.legacyLesson).toBeNull();
  expect(migrated.legacyPractice).toBeNull();
  expect(migrated.legacyDraft).toBeNull();
  expect(migrated.completion).toBeNull();
  expect(migrated.reflection).toBeNull();

  await jump(page,20,'l12-summary');
  const summary=page.locator('.summary-card');
  await expect(summary).toContainText('0/5');
  await expect(summary).toContainText('0/6');
  await expect(summary).toContainText('Повторить');
  await expect(summary).not.toContainText('Основная часть ✓');
  await expect(page.locator('.reflection-completion-gate')).toContainText('Урок ещё не завершён');
  await expect(page.locator('.extended-practice-header')).toContainText('18 заданий · 48 проверяемых ответов');
  await expect(page.locator('.extended-practice')).toHaveAttribute('data-practice-task','l12-p1');
});

test('lesson 12 completes all mandatory work, final reflection, and persistent reset',async({page})=>{
  await mockNarration(page,{ids:[]});
  await openLessonTwelve(page);
  await jump(page,20,'l12-summary');

  expect(mandatoryTasks).toHaveLength(18);
  for(const task of mandatoryTasks)await solveMandatoryTask(page,task);

  await expect(page.locator('.extended-practice.is-finished')).toContainText('Решены все 18 заданий и заполнены 48 проверяемых ответов');
  const finalStep=page.locator('.reflection-final-step');
  await expect(finalStep).toBeVisible();
  await finalStep.locator('textarea').fill('Я различаю фигуры по границам, у луча сначала отмечаю начало и направление, а в задачах на три точки проверяю два расположения. Для трёх прямых помню крайние случаи 7 и 4 части.');
  await finalStep.getByRole('button',{name:'Завершить урок'}).click();
  await expect(finalStep).toContainText('Урок завершён ✓');
  expect(await page.evaluate(()=>localStorage.getItem('mathnikita:lesson-complete:12'))).not.toBeNull();

  await page.getByRole('button',{name:'Начать заново'}).click();
  await expect(page.locator('[data-stage-id="l12-story"]')).toBeVisible();
  let persisted=await page.evaluate(()=>({
    completion:localStorage.getItem('mathnikita:lesson-complete:12'),
    reflection:localStorage.getItem('mathnikita:reflection:12'),
    practice:localStorage.getItem('mathnikita:extended-practice:12:v2'),
  }));
  expect(persisted.completion).toBeNull();
  expect(persisted.reflection).toBeNull();
  expect(persisted.practice).toBe('0');

  await page.reload({waitUntil:'domcontentloaded'});
  await page.getByRole('button',{name:/Открыть урок 12:/}).click();
  await page.locator('.lesson-opening-start').click();
  await jump(page,20,'l12-summary');
  await expect(page.locator('.extended-practice')).toHaveAttribute('data-practice-task',mandatoryTasks[0].id);
  persisted=await page.evaluate(()=>({completion:localStorage.getItem('mathnikita:lesson-complete:12'),reflection:localStorage.getItem('mathnikita:reflection:12'),practice:localStorage.getItem('mathnikita:extended-practice:12:v2')}));
  expect(persisted.completion).toBeNull();
  expect(persisted.reflection).toBeNull();
  expect(persisted.practice).toBe('0');
});

test('lesson 12 uses Sulafat for lesson, mandatory practice and both Pythagoras layers',async({page})=>{
  const log:NarrationLog={ids:[]};
  await mockNarration(page,log);
  await openLessonTwelve(page);

  await expect.poll(()=>log.ids.some(id=>id==='lesson-12-stage-l12-story')).toBeTruthy();

  await jump(page,7,'l12-practice2');
  await page.locator('.cat-mentor-actions').getByRole('button',{name:/Подсказка/}).click();
  await expect.poll(()=>log.ids.some(id=>id==='mentor-l12-intersections-hint')).toBeTruthy();
  await expect(page.locator('.cat-mentor-bubble')).toContainText('противоположную F');

  await jump(page,20,'l12-summary');
  await expect(page.locator('.cat-mentor-bubble')).not.toContainText('Урок завершён');
  await expect(page.locator('.extended-practice-voice')).toContainText('Sulafat');
  await expect.poll(()=>log.ids.some(id=>id==='lesson-12-practice-l12-p1')).toBeTruthy();

  await page.locator('.practice-pythagoras-actions').getByRole('button',{name:/Подсказка/}).click();
  await expect.poll(()=>log.ids.some(id=>id==='mentor-practice-12-l12-p1-hint')).toBeTruthy();
  await expect(page.locator('.practice-pythagoras')).toContainText('тот же AI-голос Sulafat');
});
