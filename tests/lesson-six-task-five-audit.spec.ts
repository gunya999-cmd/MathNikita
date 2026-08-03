import { expect,test,type Page } from '@playwright/test';

const mainResults={'l6-a1':true,'l6-a2':true,'l6-a3':true,'l6-a4':true,'l6-a5':true,'l6-p1':true,'l6-p2':true,'l6-p3':true,'l6-p4':true,'l6-p5':true,'l6-p6':true,'l6-q1':true,'l6-q2':true,'l6-q3':true,'l6-q4':true,'l6-q5':true,'l6-star':true};

type RequestAudit={active:number;maxActive:number;ids:string[]};

async function prepareTaskFive(page:Page){
  await page.addInitScript(({results})=>{
    localStorage.setItem('mathnikita-selected-lesson','6');
    localStorage.setItem('mathnikita-lesson-6-progress-v2',JSON.stringify({version:2,stageIndex:23,responses:{},orders:{},checked:{},results}));
    localStorage.setItem('mathnikita:lesson-6-revision-v2-migrated','1');
    localStorage.setItem('mathnikita:lesson-6-practice-v3-migrated','1');
    localStorage.setItem('mathnikita:extended-practice:6:v3','4');
    localStorage.setItem('mathnikita-voice-settings-v4',JSON.stringify({engine:'studio',rate:.94}));
    class MockAudio{src='';preload='';playbackRate=1;currentTime=0;onended:(()=>void)|null=null;onerror:(()=>void)|null=null;constructor(source=''){this.src=source}pause(){}play(){window.setTimeout(()=>this.onended?.(),20);return Promise.resolve()}}
    Object.defineProperty(window,'Audio',{configurable:true,writable:true,value:MockAudio});
  },{results:mainResults});
}

async function openTaskFive(page:Page,audit:RequestAudit){
  await prepareTaskFive(page);
  await page.route('**/api/narration-status',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,studioConfigured:true,provider:'gemini',voice:'Sulafat'})}));
  await page.route('**/api/narration',async route=>{
    const payload=route.request().postDataJSON() as {id?:string};
    if(payload.id)audit.ids.push(payload.id);
    audit.active+=1;audit.maxActive=Math.max(audit.maxActive,audit.active);
    await new Promise(resolve=>setTimeout(resolve,180));
    audit.active-=1;
    await route.fulfill({status:200,contentType:'audio/wav',body:'RIFF-lesson-six-task-five'});
  });
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await page.getByRole('button',{name:/Открыть урок 6:/}).click();
  await page.locator('.lesson-opening-start').click();
  await expect(page.locator('[data-practice-task="l6-p5"]')).toBeVisible({timeout:8_000});
}

test('lesson 6 task 5 rejects adjacent-only answer and teaches all point pairs',async({page})=>{
  const audit:RequestAudit={active:0,maxActive:0,ids:[]};
  await openTaskFive(page,audit);
  const task=page.locator('[data-practice-task="l6-p5"]');
  await expect(task).toContainText('любые две из этих точек');

  const input=task.locator('.extended-practice-input input');
  await input.fill('3');
  await task.locator('.extended-practice-check').click();
  await expect(task.locator('.extended-practice-feedback.is-wrong')).toContainText('Не считай только соседние точки');
  await expect(task.locator('.practice-pythagoras-message')).toContainText('Не считай только соседние точки');

  await task.locator('.extended-practice-check').click();
  const mentorText=await task.locator('.practice-pythagoras-message').innerText();
  expect(mentorText.indexOf('Не считай только соседние точки')).toBeGreaterThanOrEqual(0);
  expect(mentorText.indexOf('Не считай только соседние точки')).toBeLessThan(mentorText.indexOf('Запиши решение на бумаге'));

  await input.fill('6');
  await task.locator('.extended-practice-check').click();
  await expect(task.locator('.extended-practice-feedback.is-correct')).toContainText('AB, AC, AD, BC, BD и CD');
});

test('lesson 6 practice throttles background Sulafat warmup instead of bursting TTS',async({page})=>{
  const audit:RequestAudit={active:0,maxActive:0,ids:[]};
  await openTaskFive(page,audit);
  await page.waitForTimeout(1300);
  expect(audit.ids.some(id=>id==='lesson-06-practice-l6-p5')).toBeTruthy();
  expect(audit.ids.some(id=>id==='mentor-practice-6-l6-p5-status')).toBeTruthy();
  expect(audit.maxActive).toBeLessThanOrEqual(2);
});

test('lesson 6 mentor distinguishes browser autoplay block from Sulafat outage',async({page})=>{
  const audit:RequestAudit={active:0,maxActive:0,ids:[]};
  await openTaskFive(page,audit);
  await page.evaluate(()=>{
    class BlockedAudio{src='';preload='';playbackRate=1;currentTime=0;onended:(()=>void)|null=null;onerror:(()=>void)|null=null;constructor(source=''){this.src=source}pause(){}play(){const error=new Error('play blocked');error.name='NotAllowedError';return Promise.reject(error)}}
    Object.defineProperty(window,'Audio',{configurable:true,writable:true,value:BlockedAudio});
  });
  const task=page.locator('[data-practice-task="l6-p5"]');
  await task.locator('.practice-pythagoras-head button').click();
  await expect(task.locator('.practice-pythagoras-voice-error')).toContainText('Браузер не запустил звук автоматически');
  await expect(task.locator('.practice-pythagoras-voice-error')).not.toContainText('временно недоступен');
});
