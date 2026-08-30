import { expect,test,type Page } from '@playwright/test';
import { extendedPracticeSetResponseCount,type ExtendedPracticeTask } from '../src/data/extendedPracticeTypes';
import { extendedPracticeByLesson } from '../src/data/extendedPracticeData';
import { answerMandatoryPractice,clickCatMentorAction } from './strictAuditUiHelpers';

const mandatoryPractice=extendedPracticeByLesson[13];
const mandatoryTasks:ExtendedPracticeTask[]=mandatoryPractice.tasks;
const mandatoryResponseCount=extendedPracticeSetResponseCount(mandatoryPractice);
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
  await page.route('**/api/narration',route=>{try{const p=JSON.parse(route.request().postData()??'{}') as {id?:string};if(p.id)log.ids.push(p.id)}catch{}return route.fulfill({status:200,contentType:'audio/wav',body:'RIFF0000WAVEfmt '})});
}
async function openLesson(page:Page){await page.goto('/',{waitUntil:'domcontentloaded'});await page.getByRole('button',{name:/Открыть урок 13:/}).click();await page.locator('.lesson-opening-start').click();await expect(page.locator('[data-stage-id="l13-story"]')).toBeVisible()}
async function jump(page:Page,stageIndex:number,stageId:string){await page.evaluate(({stageIndex})=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:13,stageIndex}})),{stageIndex});await expect(page.locator(`[data-stage-id="${stageId}"]`)).toBeVisible()}
async function solveMain(page:Page,e:MainActivity){await jump(page,e.stageIndex,e.stageId);if(e.type==='choice')await page.locator('.choice-grid').getByRole('button',{name:String(e.answer),exact:true}).click();else if(e.type==='input')await page.locator('.inline-answer input').fill(String(e.answer));else for(const item of e.answer as string[])await page.locator('.order-bank').getByRole('button',{name:item,exact:true}).click();await page.locator('.check-button').click();await expect(page.locator('.instant-feedback.good')).toBeVisible()}
async function solveMandatory(page:Page,task:ExtendedPracticeTask){await answerMandatoryPractice(page.locator('.extended-practice'),task)}

test('lesson 13 scale math, visuals and all 14 main activities are correct',async({page})=>{
  await mockNarration(page,{ids:[]});await openLesson(page);
  await jump(page,2,'l13-diagnostic');
  await expect(page.locator('.l13-division-model')).toContainText('6 равных промежутков');
  await expect(page.locator('.l13-division-model .interval-strip span')).toHaveCount(7);
  await page.locator('.inline-answer input').fill('6');await page.locator('.check-button').click();await expect(page.locator('.instant-feedback.bad')).toBeVisible();
  await page.locator('.inline-answer input').fill('5');await page.locator('.check-button').click();await expect(page.locator('.instant-feedback.good')).toContainText('30 : 6 = 5');
  await jump(page,4,'l13-practice1');await expect(page.locator('.l13-speed-model')).toContainText('цена деления = 10 км/ч');
  await jump(page,5,'l13-practice2');await expect(page.locator('.l13-reading-model .active')).toHaveText('90');
  await jump(page,8,'l13-coordinate');await expect(page.locator('.l13-point-model')).toContainText('семь единичных шагов от O');
  await jump(page,10,'l13-practice4');await expect(page.locator('.l13-move-model')).toContainText('C(7) → +4');
  await jump(page,11,'l13-practice5');await expect(page.locator('.l13-move-model')).toContainText('B(12) → −5');
  await jump(page,12,'l13-practice6');await expect(page.locator('.order-bank button').first()).toHaveText('Откладывать равные отрезки вправо');
  await jump(page,13,'l13-control');await expect(page.locator('.theory-note')).toContainText('ровно через четыре выбранных единичных отрезка');
  await jump(page,19,'l13-challenge');await expect(page.locator('.l13-robot-model')).toContainText('цель 10');
  expect(mainActivities).toHaveLength(14);for(const e of mainActivities)await solveMain(page,e);
  await jump(page,21,'l13-summary');await expect(page.locator('.summary-card')).toContainText('Основная часть ✓');await expect(page.locator('.summary-card')).toContainText('дальше — обязательная практика');await expect(page.locator('.reflection-completion-gate')).toContainText('Урок ещё не завершён');
});

test('lesson 13 migrates stale v1 state without blocking fresh analytics timing',async({page})=>{
  await page.goto('/',{waitUntil:'domcontentloaded'});await page.evaluate(()=>{localStorage.removeItem('mathnikita:lesson-13-revision-v2-migrated');localStorage.setItem('mathnikita-lesson-13-progress-v1',JSON.stringify({version:1,stageIndex:21,completedAt:new Date().toISOString()}));localStorage.setItem('mathnikita:extended-practice:13:v1','18');localStorage.setItem('mathnikita:extended-practice:13:v1:draft',JSON.stringify({taskId:'old'}));localStorage.setItem('mathnikita:lesson-complete:13',new Date().toISOString());localStorage.setItem('mathnikita:reflection:13',JSON.stringify({saved:true,text:'old'}));localStorage.setItem('mathnikita:lesson-timing:13:v1',JSON.stringify({activeMs:123}))});
  await page.reload({waitUntil:'domcontentloaded'});await page.getByRole('button',{name:/Открыть урок 13:/}).click();await page.locator('.lesson-opening-start').click();await expect(page.locator('[data-stage-id="l13-story"]')).toBeVisible();
  const m=await page.evaluate(()=>({marker:localStorage.getItem('mathnikita:lesson-13-revision-v2-migrated'),legacyLesson:localStorage.getItem('mathnikita-lesson-13-progress-v1'),legacyPractice:localStorage.getItem('mathnikita:extended-practice:13:v1'),legacyDraft:localStorage.getItem('mathnikita:extended-practice:13:v1:draft'),completion:localStorage.getItem('mathnikita:lesson-complete:13'),reflection:localStorage.getItem('mathnikita:reflection:13'),timing:localStorage.getItem('mathnikita:lesson-timing:13:v1')}));
  expect(m.marker).toBe('1');expect(m.legacyLesson).toBeNull();expect(m.legacyPractice).toBeNull();expect(m.legacyDraft).toBeNull();expect(m.completion).toBeNull();expect(m.reflection).toBeNull();expect(m.timing).not.toBeNull();expect(m.timing).not.toContain('activeMs');expect(JSON.parse(m.timing!)).toMatchObject({version:1});
  await jump(page,21,'l13-summary');const s=page.locator('.summary-card');await expect(s).toContainText('0/5');await expect(s).toContainText('0/6');await expect(s).toContainText('Повторить');await expect(page.locator('.extended-practice-header')).toContainText(`${mandatoryTasks.length} заданий · ${mandatoryResponseCount} проверяемых ответов`);await expect(page.locator('.extended-practice')).toHaveAttribute('data-practice-task','l13-extra-1');
});

test('lesson 13 completes all 20 mandatory cards, reflection and persistent reset',async({page})=>{
  await mockNarration(page,{ids:[]});await openLesson(page);await jump(page,21,'l13-summary');expect(mandatoryTasks).toHaveLength(20);for(const task of mandatoryTasks)await solveMandatory(page,task);
  await expect(page.locator('.extended-practice.is-finished')).toContainText(`Решены все ${mandatoryTasks.length} заданий и заполнены ${mandatoryResponseCount} проверяемых ответов`);const final=page.locator('.reflection-final-step');await final.locator('textarea').fill('Для шкалы считаю промежутки и цену деления, а на координатном луче начинаю с O(0), единичного отрезка и направления.');await final.getByRole('button',{name:'Завершить урок'}).click();await expect(final).toContainText('Урок завершён ✓');expect(await page.evaluate(()=>localStorage.getItem('mathnikita:lesson-complete:13'))).not.toBeNull();
  await page.getByRole('button',{name:'Начать заново'}).click();await expect(page.locator('[data-stage-id="l13-story"]')).toBeVisible();let p=await page.evaluate(()=>({completion:localStorage.getItem('mathnikita:lesson-complete:13'),reflection:localStorage.getItem('mathnikita:reflection:13'),practice:localStorage.getItem('mathnikita:extended-practice:13:v2')}));expect(p.completion).toBeNull();expect(p.reflection).toBeNull();expect(p.practice).toBe('0');
  await page.reload({waitUntil:'domcontentloaded'});await page.getByRole('button',{name:/Открыть урок 13:/}).click();await page.locator('.lesson-opening-start').click();await jump(page,21,'l13-summary');await expect(page.locator('.extended-practice')).toHaveAttribute('data-practice-task',mandatoryTasks[0].id);p=await page.evaluate(()=>({completion:localStorage.getItem('mathnikita:lesson-complete:13'),reflection:localStorage.getItem('mathnikita:reflection:13'),practice:localStorage.getItem('mathnikita:extended-practice:13:v2')}));expect(p.completion).toBeNull();expect(p.reflection).toBeNull();expect(p.practice).toBe('0');
});

test('lesson 13 uses Sulafat in core, mandatory practice and both Pythagoras layers',async({page})=>{
  const log:NarrationLog={ids:[]};await mockNarration(page,log);await openLesson(page);await expect.poll(()=>log.ids.some(id=>id==='lesson-13-stage-l13-story')).toBeTruthy();
  await jump(page,2,'l13-diagnostic');await clickCatMentorAction(page,/Подсказка/);await expect.poll(()=>log.ids.some(id=>id==='mentor-l13-scale-hint')).toBeTruthy();await expect(page.locator('.cat-mentor-bubble')).toContainText('разность подписанных значений');
  await jump(page,21,'l13-summary');await expect(page.locator('.cat-mentor-bubble')).not.toContainText('Урок завершён');await expect(page.locator('.extended-practice-voice')).toContainText('Sulafat');await expect.poll(()=>log.ids.some(id=>id==='lesson-13-practice-l13-extra-1')).toBeTruthy();
  await page.locator('.practice-pythagoras-actions').getByRole('button',{name:/Подсказка/}).click();await expect.poll(()=>log.ids.some(id=>id==='mentor-practice-13-l13-extra-1-hint')).toBeTruthy();await expect(page.locator('.practice-pythagoras > small')).toContainText('Sulafat');
});