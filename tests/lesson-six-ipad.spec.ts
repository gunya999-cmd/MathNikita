import { expect,test,type Page } from '@playwright/test';

type Answer={type:'choice';value:string}|{type:'input';value:string}|{type:'order';values:string[]};

const answers:Record<string,Answer>={
  'l6-unique':{type:'choice',value:'ровно один'},
  'l6-name':{type:'choice',value:'AB и BA'},
  'l6-unit':{type:'choice',value:'подсчитать, сколько единичных отрезков в нём помещается'},
  'l6-units':{type:'choice',value:'PK = 17 мм'},
  'l6-endpoints':{type:'choice',value:'M и N'},
  'l6-whole':{type:'input',value:'15'},
  'l6-part':{type:'input',value:'11'},
  'l6-convert':{type:'choice',value:'48 мм'},
  'l6-equal':{type:'choice',value:'они совпадают при наложении'},
  'l6-build-order':{type:'order',values:['Отметить точку A','Совместить нулевую отметку линейки с A','На отметке 6 см 3 мм поставить точку B','Соединить A и B по линейке']},
  'l6-ruler-shift':{type:'input',value:'5'},
  'l6-quiz1':{type:'choice',value:'1'},
  'l6-quiz2':{type:'input',value:'13'},
  'l6-quiz3':{type:'input',value:'8'},
  'l6-quiz4':{type:'choice',value:'54 мм'},
  'l6-quiz5':{type:'choice',value:'да'},
  'l6-challenge':{type:'input',value:'55'},
};

async function clickCss(page:Page,selector:string){
  const clicked=await page.evaluate(selector=>{
    const element=document.querySelector<HTMLElement>(selector);
    if(!element)return false;
    element.click();
    return true;
  },selector);
  expect(clicked,`Expected ${selector} to be clickable`).toBe(true);
}

async function clickActiveButtonByText(page:Page,selector:string,text:string){
  const clicked=await page.evaluate(({selector,text})=>{
    const root=document.querySelector<HTMLElement>('.lesson-runtime:not([hidden]) .interactive-stage');
    if(!root)return false;
    const element=Array.from(root.querySelectorAll<HTMLButtonElement>(selector)).find(button=>button.textContent?.trim()===text);
    if(!element)return false;
    element.click();
    return true;
  },{selector,text});
  expect(clicked,`Expected active-stage button ${text}`).toBe(true);
}

async function fillActiveInput(page:Page,value:string){
  const changed=await page.evaluate(value=>{
    const root=document.querySelector<HTMLElement>('.lesson-runtime:not([hidden]) .interactive-stage');
    const input=root?.querySelector<HTMLInputElement>('.inline-answer input');
    if(!input)return false;
    const setter=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value')?.set;
    setter?.call(input,value);
    input.dispatchEvent(new Event('input',{bubbles:true}));
    input.dispatchEvent(new Event('change',{bubbles:true}));
    return true;
  },value);
  expect(changed,'Expected active-stage input').toBe(true);
}

async function clickNext(page:Page){
  const clicked=await page.evaluate(()=>{
    const runtime=document.querySelector<HTMLElement>('.lesson-runtime:not([hidden])');
    const button=runtime?.querySelector<HTMLButtonElement>('.lesson-controls .primary');
    if(!button||button.disabled)return false;
    button.click();
    return true;
  });
  expect(clicked,'Expected active lesson next button').toBe(true);
}

async function waitForMeasuredDuration(page:Page){
  await expect.poll(
    ()=>page.evaluate(()=>document.querySelector<HTMLElement>('[data-opening-duration] strong')?.textContent?.trim()??''),
    {timeout:5_000},
  ).toBe('измеряется');
}

async function openLessonSix(page:Page){
  console.log('[l6-ipad] open: goto');
  await page.goto('/',{waitUntil:'domcontentloaded',timeout:10_000});

  console.log('[l6-ipad] open: catalog lesson 6');
  const opened=await page.evaluate(()=>{
    const buttons=Array.from(document.querySelectorAll<HTMLButtonElement>('.course-lesson-grid > button.is-interactive'));
    const button=buttons[5];
    if(!button)return false;
    button.click();
    return true;
  });
  expect(opened).toBe(true);
  await expect(page.getByRole('heading',{name:'Отрезок. Длина отрезка'}).first()).toBeVisible({timeout:5_000});
  await waitForMeasuredDuration(page);

  console.log('[l6-ipad] open: start lesson');
  await clickCss(page,'.lesson-opening-start');
  await expect(page.locator('[data-stage-id="l6-story"]')).toBeVisible({timeout:5_000});
  await expect(page.locator('.cat-mentor-collapsed')).toBeVisible({timeout:5_000});
  await expect.poll(()=>page.evaluate(()=>document.querySelector<HTMLElement>('.lesson-runtime:not([hidden]) .lesson-duration')?.textContent?.trim()??''),{timeout:5_000}).toBe('Время измеряется');
  console.log('[l6-ipad] open: ready');
}

async function answerStage(page:Page,stageId:string,answer:Answer){
  console.log(`[l6-ipad] answer ${stageId}: ${answer.type}`);
  const stage=page.locator('.lesson-runtime:not([hidden]) .interactive-stage');
  if(answer.type==='input'){
    await fillActiveInput(page,answer.value);
    await expect(stage.locator('.inline-answer input')).toHaveValue(answer.value,{timeout:3_000});
  }else if(answer.type==='choice'){
    await clickActiveButtonByText(page,'.choice-grid button',answer.value);
  }else{
    for(let index=0;index<answer.values.length;index+=1){
      await clickActiveButtonByText(page,'.order-bank button',answer.values[index]);
      await expect(stage.locator('.order-result button')).toHaveCount(index+1,{timeout:3_000});
    }
  }
  await clickCss(page,'.lesson-runtime:not([hidden]) .interactive-stage .check-button');
  await expect(stage.locator('.instant-feedback.good')).toBeVisible({timeout:4_000});
  console.log(`[l6-ipad] answer ${stageId}: correct`);
}

test('lesson 6 completes every main stage and reaches only the completion gate on iPad WebKit',async({page})=>{
  test.setTimeout(90_000);
  await openLessonSix(page);
  const visited=new Set<string>();

  for(let step=0;step<24;step+=1){
    const stage=page.locator('.lesson-runtime:not([hidden]) .interactive-stage');
    const stageId=await stage.getAttribute('data-stage-id');
    expect(stageId,`Stage ${step+1} must have data-stage-id`).toBeTruthy();
    console.log(`[l6-ipad] stage ${step+1}/24: ${stageId}`);
    visited.add(stageId!);

    if(await stage.locator('.activity-area').count()){
      const answer=answers[stageId!];
      expect(answer,`Missing automated answer for ${stageId}`).toBeTruthy();
      await answerStage(page,stageId!,answer);
    }

    if(stageId==='l6-summary')break;
    await expect(page.locator('.lesson-runtime:not([hidden]) .lesson-controls .primary')).toBeEnabled({timeout:3_000});
    await clickNext(page);
    await expect(stage).not.toHaveAttribute('data-stage-id',stageId!,{timeout:4_000});
    console.log(`[l6-ipad] next after ${stageId}: ok`);
  }

  console.log('[l6-ipad] summary audit');
  await expect(page.locator('[data-stage-id="l6-summary"]')).toBeVisible({timeout:5_000});
  expect(visited.size).toBe(24);
  expect(visited.has('l6-distance-model')).toBe(true);
  expect(Object.keys(answers).every(stageId=>visited.has(stageId))).toBe(true);
  const summary=page.locator('.summary-card');
  await expect(summary).toContainText('5/5');
  await expect(summary).toContainText('6/6');
  await expect(summary).toContainText('Основная часть ✓');
  await expect(summary).not.toContainText('Завершён');
  await expect(page.locator('.reflection-completion-gate')).toContainText('Урок ещё не завершён');
  await expect(page.locator('.extended-practice-header')).toContainText('20 заданий · 50 проверяемых ответов');
  await expect(page.locator('.lesson-page-navigator-toggle')).toContainText('Страница 24/24');
  expect(await page.evaluate(()=>localStorage.getItem('mathnikita:lesson-complete:6'))).toBeNull();
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(2);
  console.log('[l6-ipad] summary audit: green');
});

test('lesson 6 keeps an answer after direct page navigation',async({page})=>{
  test.setTimeout(45_000);
  await openLessonSix(page);
  console.log('[l6-state] jump to endpoints');
  await page.evaluate(()=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:6,stageIndex:10}})));
  const endpoints=page.locator('[data-stage-id="l6-endpoints"]');
  await expect(endpoints).toBeVisible({timeout:4_000});
  await clickActiveButtonByText(page,'.choice-grid button','M и N');
  await expect(endpoints.locator('.choice-grid button.selected')).toHaveText('M и N',{timeout:4_000});

  console.log('[l6-state] jump away');
  await page.evaluate(()=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:6,stageIndex:11}})));
  await expect(page.locator('[data-stage-id="l6-whole"]')).toBeVisible({timeout:4_000});

  console.log('[l6-state] jump back');
  await page.evaluate(()=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:6,stageIndex:10}})));
  await expect(page.locator('[data-stage-id="l6-endpoints"] .choice-grid button.selected')).toHaveText('M и N',{timeout:4_000});
  console.log('[l6-state] persistence: green');
});

test('lesson 6 v3 ignores stale v1 main and practice completion',async({page})=>{
  test.setTimeout(45_000);
  await page.addInitScript(()=>{
    localStorage.setItem('mathnikita-lesson-6-progress-v1',JSON.stringify({version:1,stageIndex:22,responses:{},orders:{},checked:{},results:{}}));
    localStorage.setItem('mathnikita:extended-practice:6:v1','18');
    localStorage.setItem('mathnikita:lesson-complete:6',JSON.stringify({completedAt:'2026-01-01T00:00:00.000Z',activeSeconds:1}));
    localStorage.setItem('mathnikita:reflection:6','старый ответ');
    localStorage.setItem('mathnikita:lesson-timing:6:v1',JSON.stringify({version:1,activeSeconds:999,sessions:9,updatedAt:'2026-01-01T00:00:00.000Z'}));
  });
  console.log('[l6-migration] opening revised lesson');
  await openLessonSix(page);
  expect(await page.evaluate(()=>localStorage.getItem('mathnikita-lesson-6-progress-v2'))).not.toBeNull();
  expect(await page.evaluate(()=>localStorage.getItem('mathnikita:extended-practice:6:v1'))).toBeNull();
  expect(await page.evaluate(()=>localStorage.getItem('mathnikita:extended-practice:6:v2'))).toBeNull();
  expect(await page.evaluate(()=>localStorage.getItem('mathnikita:extended-practice:6:v3'))).toBeNull();
  expect(await page.evaluate(()=>localStorage.getItem('mathnikita:lesson-complete:6'))).toBeNull();
  expect(await page.evaluate(()=>localStorage.getItem('mathnikita:reflection:6'))).toBeNull();
  const timing=await page.evaluate(()=>JSON.parse(localStorage.getItem('mathnikita:lesson-timing:6:v1')??'null') as {activeSeconds?:number}|null);
  expect(timing?.activeSeconds??0).toBeLessThan(10);
  await expect(page.locator('[data-stage-id="l6-story"]')).toBeVisible({timeout:4_000});
  console.log('[l6-migration] stale state cleared: green');
});

test('lesson 6 v3 preserves all 18 completed v2 tasks but relocks final completion',async({page})=>{
  test.setTimeout(45_000);
  await page.addInitScript(()=>{
    localStorage.setItem('mathnikita:lesson-6-revision-v2-migrated','1');
    localStorage.setItem('mathnikita:extended-practice:6:v2','18');
    localStorage.setItem('mathnikita:lesson-complete:6',JSON.stringify({completedAt:'2026-08-01T12:00:00.000Z',activeSeconds:900}));
    localStorage.setItem('mathnikita:reflection:6','старый итоговый ответ');
  });
  await page.goto('/',{waitUntil:'domcontentloaded',timeout:10_000});
  expect(await page.evaluate(()=>localStorage.getItem('mathnikita:extended-practice:6:v3'))).toBe('18');
  expect(await page.evaluate(()=>localStorage.getItem('mathnikita:extended-practice:6:v2'))).toBeNull();
  expect(await page.evaluate(()=>localStorage.getItem('mathnikita:lesson-complete:6'))).toBeNull();
  expect(await page.evaluate(()=>localStorage.getItem('mathnikita:reflection:6'))).toBeNull();
  expect(await page.evaluate(()=>localStorage.getItem('mathnikita:lesson-6-practice-v3-migrated'))).toBe('1');
});
