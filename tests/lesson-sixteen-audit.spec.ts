import { expect,test,type Locator,type Page } from '@playwright/test';
import { extendedPracticeLesson16 } from '../src/data/extendedPracticeLesson16';
import { lessonSixteenMastery } from '../src/data/lessonSixteenMastery';
import type { ExtendedPracticeTask } from '../src/data/extendedPracticeTypes';
import { answerMandatoryPractice,clickCatMentorAction } from './strictAuditUiHelpers';

const mandatoryTasks:ExtendedPracticeTask[]=[...extendedPracticeLesson16.tasks,...lessonSixteenMastery];

type MainActivity={stageIndex:number;stageId:string;type:'choice'|'input'|'order';answer:string|string[]};
const mainActivities:MainActivity[]=[
  {stageIndex:1,stageId:'l16-diagnostic',type:'choice',answer:'У числа 10 032 больше цифр'},
  {stageIndex:3,stageId:'l16-practice1',type:'input',answer:'<'},
  {stageIndex:5,stageId:'l16-practice2',type:'input',answer:'<'},
  {stageIndex:7,stageId:'l16-practice3',type:'choice',answer:'257 меньше 263'},
  {stageIndex:9,stageId:'l16-practice4',type:'input',answer:'4<5<6'},
  {stageIndex:11,stageId:'l16-practice5',type:'order',answer:['479','591','701','846','894']},
  {stageIndex:13,stageId:'l16-practice6',type:'input',answer:'679,680,681,682,683'},
  {stageIndex:15,stageId:'l16-error-check',type:'choice',answer:'326 < 362: сотни равны, а в десятках 2 < 6'},
  {stageIndex:16,stageId:'l16-quiz1',type:'input',answer:'>'},
  {stageIndex:17,stageId:'l16-quiz2',type:'input',answer:'>'},
  {stageIndex:18,stageId:'l16-quiz3',type:'input',answer:'2516<3939'},
  {stageIndex:19,stageId:'l16-quiz4',type:'order',answer:['731','724','693','658','639']},
  {stageIndex:20,stageId:'l16-quiz5',type:'input',answer:'0'},
  {stageIndex:21,stageId:'l16-challenge',type:'input',answer:'13'},
  {stageIndex:22,stageId:'l16-transfer',type:'choice',answer:'101 200 > 98 750: первое число шестизначное, второе пятизначное'},
];

type NarrationLog={ids:string[]};

async function mockNarration(page:Page,log:NarrationLog){
  await page.route('**/api/narration-status',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,studioConfigured:true,voice:'Sulafat'})}));
  await page.route('**/api/narration',route=>{
    try{const payload=JSON.parse(route.request().postData()??'{}') as {id?:string};if(payload.id)log.ids.push(payload.id)}catch{/* mock must stay resilient */}
    return route.fulfill({status:200,contentType:'audio/wav',body:'RIFF0000WAVEfmt '});
  });
}

async function installDeterministicScroll(page:Page){
  await page.addInitScript(()=>{
    const nativeScrollTo=window.scrollTo.bind(window);
    window.scrollTo=((first:ScrollToOptions|number,second?:number)=>{
      if(typeof first==='number'){nativeScrollTo(first,second??0);return}
      nativeScrollTo({...first,behavior:'auto'});
    }) as typeof window.scrollTo;
  });
}

async function openLessonSixteen(page:Page){
  await installDeterministicScroll(page);
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await page.getByRole('button',{name:/Открыть урок 16:/}).click();
  await page.locator('.lesson-opening-start').click();
  await expect(page.locator('[data-stage-id="l16-mission"]')).toBeVisible();
}

async function jump(page:Page,stageIndex:number,stageId:string){
  await page.evaluate(({stageIndex})=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:16,stageIndex}})),{stageIndex});
  const stage=page.locator(`[data-stage-id="${stageId}"]`);
  await expect(stage).toBeVisible();
  await page.evaluate(()=>window.scrollTo({top:0,behavior:'auto'}));
}

async function activateCheckButton(locator:Locator){
  await expect(locator).toBeVisible();
  await expect(locator).toBeEnabled();
  await locator.focus();
  await expect(locator).toBeFocused();
  await locator.press('Enter');
}

async function solveMainActivity(page:Page,entry:MainActivity){
  await jump(page,entry.stageIndex,entry.stageId);
  const stage=page.locator(`[data-stage-id="${entry.stageId}"]`);
  if(entry.type==='choice'){
    await stage.locator('.choice-grid').getByRole('button',{name:String(entry.answer),exact:true}).click();
  }else if(entry.type==='input'){
    await stage.locator('.inline-answer input').fill(String(entry.answer));
  }else{
    const result=stage.locator('.order-result button');
    while(await result.count())await result.first().click();
    for(const item of entry.answer as string[])await stage.locator('.order-bank').getByRole('button',{name:item,exact:true}).click();
  }
  await activateCheckButton(stage.locator('.check-button'));
  await expect(stage.locator('.instant-feedback.good')).toBeVisible();
}

async function solveMandatoryTask(page:Page,task:ExtendedPracticeTask){
  await answerMandatoryPractice(page.locator('.extended-practice'),task);
}

test('lesson 16 matches Merzlyak lesson-16 scope, source tasks, visuals and every core interaction',async({page})=>{
  await mockNarration(page,{ids:[]});
  await openLessonSixteen(page);

  await expect(page.locator('[data-stage-id="l16-mission"]')).toContainText('Координатный луч будет отдельным шагом на уроке 17');

  await jump(page,2,'l16-digits-model');
  await expect(page.locator('.l16-digits-model')).toContainText('597 013 617');
  await expect(page.locator('.l16-digits-model')).toContainText('9 цифр');
  await expect(page.locator('.l16-digits-model')).toContainText('99 982 475');
  await expect(page.locator('.l16-digits-model')).toContainText('8 цифр');

  await jump(page,4,'l16-same-length');
  await expect(page.locator('.l16-lexicographic-model')).toContainText('72 168');
  await expect(page.locator('.l16-lexicographic-model')).toContainText('72 170');
  await expect(page.locator('.l16-lexicographic-model')).toContainText('6 < 7');
  await expect(page.locator('.l16-lexicographic-model')).toContainText('разряд десятков');

  await jump(page,6,'l16-inequalities');
  await expect(page.locator('.l16-inequality-model')).toContainText('257 < 263');
  await expect(page.locator('.l16-inequality-model')).toContainText('8 < 12 < 20');

  await jump(page,10,'l16-sorting');
  await expect(page.locator('.l16-sorting-model')).toContainText('894 · 479 · 846 · 591 · 701');
  await expect(page.locator('.l16-sorting-model')).toContainText('479 < 591 < 701 < 846 < 894');

  await jump(page,11,'l16-practice5');
  await expect(page.locator('[data-stage-id="l16-practice5"] .order-bank button').first()).toHaveText('846');
  await expect(page.locator('[data-stage-id="l16-practice5"] .order-bank button').first()).not.toHaveText('479');

  await jump(page,12,'l16-between');
  await expect(page.locator('.l16-between-model')).toContainText('678 < x < 684');
  await expect(page.locator('.l16-between-model')).toContainText('24 315 < x < 24 316 → 0 натуральных решений');

  await jump(page,3,'l16-practice1');
  const practiceOne=page.locator('[data-stage-id="l16-practice1"]');
  await practiceOne.locator('.inline-answer input').fill('>');
  await activateCheckButton(practiceOne.locator('.check-button'));
  await expect(practiceOne.locator('.instant-feedback.bad')).toBeVisible();
  await practiceOne.locator('.inline-answer input').fill('<');
  await activateCheckButton(practiceOne.locator('.check-button'));
  await expect(practiceOne.locator('.instant-feedback.good')).toBeVisible();

  await jump(page,20,'l16-quiz5');
  const quizFive=page.locator('[data-stage-id="l16-quiz5"]');
  await quizFive.locator('.inline-answer input').fill('1');
  await activateCheckButton(quizFive.locator('.check-button'));
  await expect(quizFive.locator('.instant-feedback.bad')).toBeVisible();
  await quizFive.locator('.inline-answer input').fill('0');
  await activateCheckButton(quizFive.locator('.check-button'));
  await expect(quizFive.locator('.instant-feedback.good')).toContainText('соседние натуральные числа');

  expect(mainActivities).toHaveLength(15);
  for(const entry of mainActivities)await solveMainActivity(page,entry);

  await jump(page,24,'l16-summary');
  await expect(page.locator('.summary-card')).toContainText('Основная часть ✓');
  await expect(page.locator('.summary-card')).toContainText('дальше — обязательная практика и финальное объяснение');
  await expect(page.locator('.reflection-completion-gate')).toContainText('Урок ещё не завершён');
});

test('lesson 16 migrates stale v1 state without false completion',async({page})=>{
  await installDeterministicScroll(page);
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await page.evaluate(()=>{
    localStorage.removeItem('mathnikita:lesson-16-revision-v2-migrated');
    localStorage.setItem('mathnikita-lesson-16-progress-v1',JSON.stringify({version:1,stageIndex:24,responses:{},orders:{},checked:{},results:{},completedAt:new Date().toISOString()}));
    localStorage.setItem('mathnikita:extended-practice:16:v1','18');
    localStorage.setItem('mathnikita:extended-practice:16:v1:draft',JSON.stringify({taskId:'old'}));
    localStorage.setItem('mathnikita:lesson-complete:16',new Date().toISOString());
    localStorage.setItem('mathnikita:reflection:16',JSON.stringify({saved:true,text:'old reflection'}));
    localStorage.setItem('mathnikita:lesson-timing:16:v1',JSON.stringify({activeMs:123,legacy:true}));
  });
  await page.reload({waitUntil:'domcontentloaded'});
  await page.getByRole('button',{name:/Открыть урок 16:/}).click();
  await page.locator('.lesson-opening-start').click();
  await expect(page.locator('[data-stage-id="l16-mission"]')).toBeVisible();

  const migrated=await page.evaluate(()=>({
    marker:localStorage.getItem('mathnikita:lesson-16-revision-v2-migrated'),
    legacyLesson:localStorage.getItem('mathnikita-lesson-16-progress-v1'),
    legacyPractice:localStorage.getItem('mathnikita:extended-practice:16:v1'),
    legacyDraft:localStorage.getItem('mathnikita:extended-practice:16:v1:draft'),
    completion:localStorage.getItem('mathnikita:lesson-complete:16'),
    reflection:localStorage.getItem('mathnikita:reflection:16'),
    timing:localStorage.getItem('mathnikita:lesson-timing:16:v1'),
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

  await jump(page,24,'l16-summary');
  const summary=page.locator('.summary-card');
  await expect(summary).toContainText('0/5');
  await expect(summary).toContainText('0/6');
  await expect(summary).toContainText('Повторить');
  await expect(summary).not.toContainText('Основная часть ✓');
  await expect(page.locator('.reflection-completion-gate')).toContainText('Урок ещё не завершён');
  await expect(page.locator('.extended-practice-header')).toContainText('18 заданий · 48 проверяемых ответов');
  await expect(page.locator('.extended-practice')).toHaveAttribute('data-practice-task','l16-extra-1');
});

test('lesson 16 completes all 18 mandatory tasks, 48 responses, reflection and persistent reset',async({page})=>{
  await mockNarration(page,{ids:[]});
  await openLessonSixteen(page);
  await jump(page,24,'l16-summary');

  expect(mandatoryTasks).toHaveLength(18);
  for(const task of mandatoryTasks)await solveMandatoryTask(page,task);

  await expect(page.locator('.extended-practice.is-finished')).toContainText('Решены все 18 заданий и заполнены 48 проверяемых ответов');
  const finalStep=page.locator('.reflection-final-step');
  await expect(finalStep).toBeVisible();
  await finalStep.locator('textarea').fill('Я сначала сравниваю количество цифр, а при равенстве иду слева направо до первой различающейся цифры. Умею читать и записывать неравенства, сортировать числа и не включать строгие границы.');
  await finalStep.getByRole('button',{name:'Завершить урок'}).click();
  await expect(finalStep).toContainText('Урок завершён ✓');
  expect(await page.evaluate(()=>localStorage.getItem('mathnikita:lesson-complete:16'))).not.toBeNull();

  await page.getByRole('button',{name:'Начать заново'}).click();
  await expect(page.locator('[data-stage-id="l16-mission"]')).toBeVisible();
  let persisted=await page.evaluate(()=>({
    completion:localStorage.getItem('mathnikita:lesson-complete:16'),
    reflection:localStorage.getItem('mathnikita:reflection:16'),
    practice:localStorage.getItem('mathnikita:extended-practice:16:v2'),
  }));
  expect(persisted.completion).toBeNull();
  expect(persisted.reflection).toBeNull();
  expect(persisted.practice).toBe('0');

  await page.reload({waitUntil:'domcontentloaded'});
  await page.getByRole('button',{name:/Открыть урок 16:/}).click();
  await page.locator('.lesson-opening-start').click();
  await jump(page,24,'l16-summary');
  await expect(page.locator('.extended-practice')).toHaveAttribute('data-practice-task',mandatoryTasks[0].id);
  persisted=await page.evaluate(()=>({completion:localStorage.getItem('mathnikita:lesson-complete:16'),reflection:localStorage.getItem('mathnikita:reflection:16'),practice:localStorage.getItem('mathnikita:extended-practice:16:v2')}));
  expect(persisted.completion).toBeNull();
  expect(persisted.reflection).toBeNull();
  expect(persisted.practice).toBe('0');
});

test('lesson 16 uses Sulafat in core, mandatory practice and both Pythagoras layers',async({page})=>{
  const log:NarrationLog={ids:[]};
  await mockNarration(page,log);
  await openLessonSixteen(page);

  await expect.poll(()=>log.ids.some(id=>id==='lesson-16-stage-l16-mission')).toBeTruthy();

  await jump(page,2,'l16-digits-model');
  await clickCatMentorAction(page,/Подсказка/);
  await expect.poll(()=>log.ids.some(id=>id==='mentor-l16-digits-hint')).toBeTruthy();
  await expect(page.locator('.cat-mentor-bubble')).toContainText('Сравни количество цифр');

  await jump(page,24,'l16-summary');
  await expect(page.locator('.cat-mentor-bubble')).not.toContainText('Урок завершён');
  await expect(page.locator('.extended-practice-voice')).toContainText('Sulafat');
  await expect.poll(()=>log.ids.some(id=>id==='lesson-16-practice-l16-extra-1')).toBeTruthy();

  await page.locator('.practice-pythagoras-actions').getByRole('button',{name:/Подсказка/}).click();
  await expect.poll(()=>log.ids.some(id=>id==='mentor-practice-16-l16-extra-1-hint')).toBeTruthy();
  await expect(page.locator('.practice-pythagoras')).toContainText('Sulafat');
});