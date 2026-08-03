import { expect,test,type Page } from '@playwright/test';
import { extendedPracticeLesson11 } from '../src/data/extendedPracticeLesson11';
import { lessonElevenMastery } from '../src/data/lessonElevenMastery';
import type { ExtendedPracticeTask } from '../src/data/extendedPracticeTypes';

const mandatoryTasks:ExtendedPracticeTask[]=[...extendedPracticeLesson11.tasks,...lessonElevenMastery];

type MainActivity={stageIndex:number;stageId:string;type:'choice'|'input'|'order';answer:string|string[]};
const mainActivities:MainActivity[]=[
  {stageIndex:2,stageId:'l11-diagnostic',type:'choice',answer:'MK'},
  {stageIndex:7,stageId:'l11-practice1',type:'choice',answer:'дать им общее начало и направить в разные стороны'},
  {stageIndex:8,stageId:'l11-practice2',type:'choice',answer:'точка пересечения может лежать на прямой TF по другую сторону от T, чем F'},
  {stageIndex:9,stageId:'l11-practice3',type:'input',answer:'200'},
  {stageIndex:10,stageId:'l11-practice4',type:'choice',answer:'8 см или 56 см; два решения'},
  {stageIndex:11,stageId:'l11-practice5',type:'choice',answer:'CE, EC, CD, DC, ED, DE'},
  {stageIndex:12,stageId:'l11-practice6',type:'order',answer:['Прочитать условие и назвать требуемые фигуры','Определить начала и направления лучей','Провести базовые прямые и отметить точки','Проверить все требуемые пересечения и непересечения','Сверить готовый чертёж со всеми условиями']},
  {stageIndex:14,stageId:'l11-quiz1',type:'choice',answer:'луч'},
  {stageIndex:15,stageId:'l11-quiz2',type:'input',answer:'1'},
  {stageIndex:16,stageId:'l11-quiz3',type:'input',answer:'8'},
  {stageIndex:17,stageId:'l11-quiz4',type:'choice',answer:'EC и ED'},
  {stageIndex:18,stageId:'l11-quiz5',type:'choice',answer:'точка, отрезок или луч'},
  {stageIndex:19,stageId:'l11-challenge',type:'choice',answer:'7 и 4'},
];

type NarrationLog={ids:string[]};

async function mockNarration(page:Page,log:NarrationLog){
  await page.route('**/api/narration-status',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,studioConfigured:true,voice:'Sulafat'})}));
  await page.route('**/api/narration',route=>{
    try{const payload=JSON.parse(route.request().postData()??'{}') as {id?:string};if(payload.id)log.ids.push(payload.id)}catch{/* keep mock resilient */}
    return route.fulfill({status:200,contentType:'audio/wav',body:'RIFF0000WAVEfmt '});
  });
}

async function openLessonEleven(page:Page){
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await page.getByRole('button',{name:/Открыть урок 11:/}).click();
  await page.locator('.lesson-opening-start').click();
  await expect(page.locator('[data-stage-id="l11-story"]')).toBeVisible();
}

async function jump(page:Page,stageIndex:number,stageId:string){
  await page.evaluate(({stageIndex})=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:11,stageIndex}})),{stageIndex});
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

test('lesson 11 source tasks, diagrams and every main interactive task are correct',async({page})=>{
  await mockNarration(page,{ids:[]});
  await openLessonEleven(page);

  await jump(page,2,'l11-diagnostic');
  await expect(page.locator('.l11-ray-name-model')).toContainText('M');
  await expect(page.locator('.l11-ray-name-model')).toContainText('K');
  await expect(page.locator('.l11-ray-name-model')).toContainText('луч MK');

  await jump(page,8,'l11-practice2');
  await expect(page.locator('.l11-intersection-model')).toContainText('M');
  await expect(page.locator('.l11-intersection-model')).toContainText('K');
  await expect(page.locator('.l11-intersection-model')).toContainText('T');
  await expect(page.locator('.l11-intersection-model')).toContainText('F');
  await expect(page.locator('.l11-intersection-model')).toContainText('не лучу TF');

  await jump(page,10,'l11-practice4');
  await expect(page.locator('.l11-distance-cases')).toContainText('32 − 24 = 8 см');
  await expect(page.locator('.l11-distance-cases')).toContainText('24 + 32 = 56 см');
  await page.locator('.choice-grid').getByRole('button',{name:'8 см; одно решение',exact:true}).click();
  await page.locator('.check-button').click();
  await expect(page.locator('.instant-feedback.bad')).toBeVisible();
  await page.locator('.choice-grid').getByRole('button',{name:'8 см или 56 см; два решения',exact:true}).click();
  await page.locator('.check-button').click();
  await expect(page.locator('.instant-feedback.good')).toContainText('32 + 24 = 56 см');

  await jump(page,11,'l11-practice5');
  await expect(page.locator('.l11-ced-model')).toContainText('C');
  await expect(page.locator('.l11-ced-model')).toContainText('E');
  await expect(page.locator('.l11-ced-model')).toContainText('D');
  await expect(page.locator('.l11-ced-model')).toContainText('CE, EC, CD, DC, ED, DE');

  await jump(page,12,'l11-practice6');
  await expect(page.locator('.order-bank button').first()).toHaveText('Проверить все требуемые пересечения и непересечения');
  await expect(page.locator('.order-bank button').first()).not.toHaveText('Прочитать условие и назвать требуемые фигуры');

  await jump(page,19,'l11-challenge');
  await expect(page.locator('.l11-three-lines-model')).toContainText('максимум: 7 частей');
  await expect(page.locator('.l11-three-lines-model')).toContainText('минимум: 4 части');
  await expect(page.locator('.l11-three-lines-model .maximum i')).toHaveCount(3);
  await expect(page.locator('.l11-three-lines-model .minimum i')).toHaveCount(3);

  expect(mainActivities).toHaveLength(13);
  for(const entry of mainActivities)await solveMainActivity(page,entry);

  await jump(page,21,'l11-summary');
  await expect(page.locator('.summary-card')).toContainText('Основная часть ✓');
  await expect(page.locator('.summary-card')).toContainText('дальше — обязательная практика');
  await expect(page.locator('.reflection-completion-gate')).toContainText('Урок ещё не завершён');
});

test('lesson 11 ignores stale v1 lesson and practice completion state',async({page})=>{
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await page.evaluate(()=>{
    localStorage.setItem('mathnikita-lesson-11-progress-v1',JSON.stringify({version:1,stageIndex:21,responses:{},orders:{},checked:{},results:{},completedAt:new Date().toISOString()}));
    localStorage.setItem('mathnikita:extended-practice:11:v1','18');
  });
  await page.reload({waitUntil:'domcontentloaded'});
  await page.getByRole('button',{name:/Открыть урок 11:/}).click();
  await page.locator('.lesson-opening-start').click();
  await expect(page.locator('[data-stage-id="l11-story"]')).toBeVisible();

  await jump(page,21,'l11-summary');
  await expect(page.locator('.summary-card')).toContainText('Основная часть ✓');
  await expect(page.locator('.extended-practice-header')).toContainText('18 заданий · 48 проверяемых ответов');
  await expect(page.locator('.extended-practice')).toHaveAttribute('data-practice-task','l11-p1');
});

test('lesson 11 completes every mandatory task, final reflection, and persistent reset',async({page})=>{
  await mockNarration(page,{ids:[]});
  await openLessonEleven(page);
  await jump(page,21,'l11-summary');

  expect(mandatoryTasks).toHaveLength(18);
  for(const task of mandatoryTasks)await solveMandatoryTask(page,task);

  await expect(page.locator('.extended-practice.is-finished')).toContainText('Решены все 18 заданий и заполнены 48 проверяемых ответов');
  const finalStep=page.locator('.reflection-final-step');
  await expect(finalStep).toBeVisible();
  await finalStep.locator('textarea').fill('Я сначала определяю начало и направление каждого луча, затем проверяю порядок точек и только потом пересечения. В № 99 обязательно рассматриваю два расположения точек, а в № 102 сравниваю пересекающиеся и параллельные прямые.');
  await finalStep.getByRole('button',{name:'Завершить урок'}).click();
  await expect(finalStep).toContainText('Урок завершён ✓');
  expect(await page.evaluate(()=>localStorage.getItem('mathnikita:lesson-complete:11'))).not.toBeNull();

  await page.getByRole('button',{name:'Начать заново'}).click();
  await expect(page.locator('[data-stage-id="l11-story"]')).toBeVisible();
  let persisted=await page.evaluate(()=>({
    completion:localStorage.getItem('mathnikita:lesson-complete:11'),
    reflection:localStorage.getItem('mathnikita:reflection:11'),
    practice:localStorage.getItem('mathnikita:extended-practice:11:v2'),
  }));
  expect(persisted.completion).toBeNull();
  expect(persisted.reflection).toBeNull();
  expect(persisted.practice).toBe('0');

  await page.reload({waitUntil:'domcontentloaded'});
  await page.getByRole('button',{name:/Открыть урок 11:/}).click();
  await page.locator('.lesson-opening-start').click();
  await jump(page,21,'l11-summary');
  await expect(page.locator('.extended-practice')).toHaveAttribute('data-practice-task',mandatoryTasks[0].id);
  persisted=await page.evaluate(()=>({completion:localStorage.getItem('mathnikita:lesson-complete:11'),reflection:localStorage.getItem('mathnikita:reflection:11'),practice:localStorage.getItem('mathnikita:extended-practice:11:v2')}));
  expect(persisted.completion).toBeNull();
  expect(persisted.reflection).toBeNull();
  expect(persisted.practice).toBe('0');
});

test('lesson 11 prepares Sulafat narration for lesson, mandatory practice and both Pythagoras layers',async({page})=>{
  const log:NarrationLog={ids:[]};
  await mockNarration(page,log);
  await openLessonEleven(page);

  await expect.poll(()=>log.ids.some(id=>id==='lesson-11-stage-l11-story')).toBeTruthy();

  await jump(page,10,'l11-practice4');
  await page.locator('.cat-mentor-actions').getByRole('button',{name:/Подсказка/}).click();
  await expect.poll(()=>log.ids.some(id=>id==='mentor-l11-task99-hint')).toBeTruthy();
  await expect(page.locator('.cat-mentor-bubble')).toContainText('два рисунка');

  await jump(page,21,'l11-summary');
  await expect(page.locator('.cat-mentor-bubble')).not.toContainText('Урок завершён');
  await expect(page.locator('.extended-practice-voice')).toContainText('Sulafat');
  await expect.poll(()=>log.ids.some(id=>id==='lesson-11-practice-l11-p1')).toBeTruthy();

  await page.locator('.practice-pythagoras-actions').getByRole('button',{name:/Подсказка/}).click();
  await expect.poll(()=>log.ids.some(id=>id==='mentor-practice-11-l11-p1-hint')).toBeTruthy();
  await expect(page.locator('.practice-pythagoras')).toContainText('тот же AI-голос Sulafat');
});
