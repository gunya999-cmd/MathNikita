import { expect,test,type Page } from '@playwright/test';
import { lessonTenStages } from '../src/PlaneLineRayPlayer';
import { extendedPracticeLesson10 } from '../src/data/extendedPracticeLesson10';
import { lessonTenMastery } from '../src/data/lessonTenMastery';
import type { ExtendedPracticeTask } from '../src/data/extendedPracticeTypes';

const mandatoryTasks:ExtendedPracticeTask[]=[...extendedPracticeLesson10.tasks,...lessonTenMastery];
const mainActivities=lessonTenStages.flatMap((stage,stageIndex)=>stage.activity?[{stage,stageIndex,activity:stage.activity}]:[]);

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

async function solveMainActivity(page:Page,entry:(typeof mainActivities)[number]){
  await jump(page,entry.stageIndex,entry.stage.id);
  const {activity}=entry;
  if(activity.type==='choice'){
    await page.locator('.choice-grid').getByRole('button',{name:String(activity.answer),exact:true}).click();
  }else if(activity.type==='input'){
    await page.locator('.inline-answer input').fill(String(activity.answer));
  }else{
    for(const item of activity.answer as string[])await page.locator('.order-bank').getByRole('button',{name:item,exact:true}).click();
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
  await expect(page.locator('.extended-practice-header')).toContainText('18 заданий · 48 проверяемых ответов');
  await expect(page.locator('.extended-practice')).toHaveAttribute('data-practice-task','l10-p1');
});

test('lesson 10 completes every mandatory task, final reflection, and persistent reset',async({page})=>{
  await mockNarration(page,{ids:[]});
  await openLessonTen(page);
  await jump(page,22,'l10-summary');

  expect(mandatoryTasks).toHaveLength(18);
  for(const task of mandatoryTasks)await solveMandatoryTask(page,task);

  await expect(page.locator('.extended-practice.is-finished')).toContainText('Решены все 18 заданий и заполнены 48 проверяемых ответов');
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
  await page.locator('.cat-mentor-actions').getByRole('button',{name:/Подсказка/}).click();
  await expect.poll(()=>log.ids.some(id=>id==='mentor-l10-ray-hint')).toBeTruthy();
  await expect(page.locator('.cat-mentor-bubble')).toContainText('начало луча');

  await jump(page,22,'l10-summary');
  await expect(page.locator('.cat-mentor-bubble')).not.toContainText('Урок завершён');
  await expect(page.locator('.extended-practice-voice')).toContainText('Sulafat');
  await expect.poll(()=>log.ids.some(id=>id==='lesson-10-practice-l10-p1')).toBeTruthy();

  await page.locator('.practice-pythagoras-actions').getByRole('button',{name:/Подсказка/}).click();
  await expect.poll(()=>log.ids.some(id=>id==='mentor-practice-10-l10-p1-hint')).toBeTruthy();
  await expect(page.locator('.practice-pythagoras')).toContainText('тот же AI-голос Sulafat');
});
