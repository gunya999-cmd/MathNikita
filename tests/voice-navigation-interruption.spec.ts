import {expect,test,type Page} from '@playwright/test';
import {extendedPracticeByLesson} from '../src/data/extendedPracticeData';
import type {ExtendedPracticeTask} from '../src/data/extendedPracticeTypes';
import {practiceNarrationId} from '../src/practiceNarration';

type AuditEvent={kind:'request'|'play'|'pause';id:string};
type AuditState={events:AuditEvent[]};

function safeToken(value:string){return value.toLowerCase().replace(/[^a-z0-9-]+/g,'-').replace(/^-+|-+$/g,'').slice(0,80)}

async function installAudit(page:Page){
  await page.addInitScript(()=>{
    const audit:AuditState={events:[]};
    const blobIds=new WeakMap<Blob,string>();
    const nativeFetch=window.fetch.bind(window);
    const nativeCreateObjectURL=URL.createObjectURL.bind(URL);
    window.fetch=async(input:RequestInfo|URL,init?:RequestInit)=>{
      const url=typeof input==='string'?input:input instanceof URL?input.href:input.url;
      let narrationId='';
      if(url.includes('/api/narration')){
        let rawBody=init?.body;
        if(rawBody==null&&input instanceof Request){try{rawBody=await input.clone().text()}catch{}}
        if(typeof rawBody==='string'){try{narrationId=(JSON.parse(rawBody) as {id?:string}).id??''}catch{}}
        if(narrationId)audit.events.push({kind:'request',id:narrationId});
      }
      const response=await nativeFetch(input,init);
      if(!narrationId)return response;
      return new Proxy(response,{get(target,property){
        if(property==='blob')return async()=>{const blob=await target.blob();blobIds.set(blob,narrationId);return blob};
        const value=Reflect.get(target,property,target);return typeof value==='function'?value.bind(target):value;
      }});
    };
    URL.createObjectURL=(blob:Blob|MediaSource)=>{
      if(blob instanceof Blob){const id=blobIds.get(blob);if(id)return`blob:voice-interrupt/${encodeURIComponent(id)}`}
      return nativeCreateObjectURL(blob);
    };
    class MockAudio{
      src='';preload='';playbackRate=1;currentTime=0;onended:(()=>void)|null=null;onerror:(()=>void)|null=null;timer:number|null=null;started=false;
      constructor(source=''){this.src=source}
      id(){const prefix='blob:voice-interrupt/';return this.src.startsWith(prefix)?decodeURIComponent(this.src.slice(prefix.length)):this.src}
      pause(){if(this.started)audit.events.push({kind:'pause',id:this.id()});this.started=false;if(this.timer!==null){window.clearTimeout(this.timer);this.timer=null}}
      play(){this.pause();this.started=true;audit.events.push({kind:'play',id:this.id()});const duration=this.id().endsWith('-summary')?70:5000;this.timer=window.setTimeout(()=>{this.timer=null;this.started=false;this.onended?.()},duration);return Promise.resolve()}
    }
    Object.defineProperty(window,'Audio',{configurable:true,writable:true,value:MockAudio});
    (window as unknown as {__voiceInterruptAudit:AuditState}).__voiceInterruptAudit=audit;
    localStorage.setItem('mathnikita-voice-settings-v4',JSON.stringify({engine:'studio',rate:.94}));
    localStorage.setItem('mathnikita-mentor-auto-guide','false');
  });
}

async function routeNarration(page:Page,slowId=''){
  await page.route('**/api/narration-status',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,studioConfigured:true,provider:'gemini',voice:'Sulafat'})}));
  await page.route('**/api/narration',async route=>{
    const body=route.request().postDataJSON() as {id?:string};
    await new Promise(resolve=>setTimeout(resolve,body.id===slowId?350:5));
    await route.fulfill({status:200,contentType:'audio/wav',body:'RIFF-voice-interruption'});
  });
}

async function audit(page:Page){return page.evaluate(()=>(window as unknown as {__voiceInterruptAudit:AuditState}).__voiceInterruptAudit.events)}
async function clearAudit(page:Page){await page.evaluate(()=>{(window as unknown as {__voiceInterruptAudit:AuditState}).__voiceInterruptAudit.events=[]})}
async function waitForEvent(page:Page,kind:AuditEvent['kind'],id:string){await expect.poll(async()=>{const events=await audit(page);return events.some(event=>event.kind===kind&&event.id===id)},{timeout:10_000}).toBeTruthy()}

async function openLesson(page:Page,lessonNumber:number){
  await page.goto('/',{waitUntil:'domcontentloaded'});
  if(lessonNumber>=21){const chapterTwo=page.locator('.course-chapter-group').nth(1);if(!(await chapterTwo.evaluate(element=>(element as HTMLDetailsElement).open)))await chapterTwo.locator('summary').click()}
  await page.getByRole('button',{name:new RegExp(`Открыть урок ${lessonNumber}:`)}).click();
  await page.locator('.lesson-opening-start').click();
  await expect(page.locator('.lesson-runtime:not([hidden]) .interactive-stage[data-stage-id]')).toBeVisible();
}

async function solveTask(page:Page,task:ExtendedPracticeTask){
  if(task.type==='choice')await page.locator('.extended-practice-options').getByRole('button',{name:task.answer,exact:true}).click();
  else if(task.type==='multi-input')for(let index=0;index<task.fields.length;index+=1)await page.locator('.extended-practice-multi input').nth(index).fill(task.fields[index].answers[0]);
  else await page.locator('.extended-practice-input input').fill(task.answers[0]);
  await page.locator('.extended-practice-check').click();
  await expect(page.locator('.extended-practice-feedback.is-correct')).toBeVisible();
}

for(const lessonNumber of [20,22]){
  test(`lesson ${lessonNumber} pauses old stage synchronously before learner moves on`,async({page})=>{
    test.setTimeout(90_000);
    await installAudit(page);await routeNarration(page);await openLesson(page,lessonNumber);
    const oldStage=await page.locator('.lesson-runtime:not([hidden]) .interactive-stage[data-stage-id]').getAttribute('data-stage-id');
    expect(oldStage).toBeTruthy();
    const oldId=`lesson-${String(lessonNumber).padStart(2,'0')}-stage-${oldStage}`;
    await waitForEvent(page,'play',oldId);
    await clearAudit(page);
    await page.locator('.lesson-controls .primary').dispatchEvent('click');
    const immediate=await audit(page);
    expect(immediate.some(event=>event.kind==='pause'&&event.id===oldId),`Lesson ${lessonNumber}: old narration was still alive after navigation click`).toBeTruthy();
    await expect(page.locator('.lesson-runtime:not([hidden]) .interactive-stage[data-stage-id]')).not.toHaveAttribute('data-stage-id',oldStage!);
    const nextStage=await page.locator('.lesson-runtime:not([hidden]) .interactive-stage[data-stage-id]').getAttribute('data-stage-id');
    expect(nextStage).toBeTruthy();
    await waitForEvent(page,'play',`lesson-${String(lessonNumber).padStart(2,'0')}-stage-${nextStage}`);
  });
}

test('late Sulafat response from an abandoned stage never starts playing',async({page})=>{
  test.setTimeout(90_000);
  const lessonNumber=22;const staleId='lesson-22-stage-l22-mission';
  await installAudit(page);await routeNarration(page,staleId);await openLesson(page,lessonNumber);
  await waitForEvent(page,'request',staleId);
  await page.locator('.lesson-controls .primary').dispatchEvent('click');
  await expect(page.locator('.lesson-runtime:not([hidden]) .interactive-stage[data-stage-id]')).toHaveAttribute('data-stage-id','l22-recall');
  await waitForEvent(page,'play','lesson-22-stage-l22-recall');
  await page.waitForTimeout(450);
  const events=await audit(page);
  expect(events.some(event=>event.kind==='play'&&event.id===staleId),'Stale stage audio started after learner had already left it').toBeFalsy();
});

test('Pythagoras is cut off immediately and the next mandatory task becomes the only voice',async({page})=>{
  test.setTimeout(120_000);
  const lessonNumber=6;const practice=extendedPracticeByLesson[lessonNumber];const first=practice.tasks[0];const second=practice.tasks[1];
  await installAudit(page);await routeNarration(page);await openLesson(page,lessonNumber);
  const counter=await page.locator('.lesson-runtime:not([hidden]) .stage-counter').innerText();const total=Number(counter.match(/из\s+(\d+)/i)?.[1]);expect(total).toBeGreaterThan(1);
  await page.evaluate(({lessonNumber,stageIndex})=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber,stageIndex}})),{lessonNumber,stageIndex:total-1});
  await expect(page.locator('.extended-practice[data-practice-task]')).toHaveAttribute('data-practice-task',first.id);
  await waitForEvent(page,'play',practiceNarrationId(lessonNumber,first));
  await page.getByRole('button',{name:'✦ Подсказка'}).click();
  const mentorId=`mentor-practice-${lessonNumber}-${safeToken(first.id)}-hint`;
  await waitForEvent(page,'play',mentorId);
  await solveTask(page,first);
  await clearAudit(page);
  await page.locator('.extended-practice-next').dispatchEvent('click');
  const immediate=await audit(page);
  expect(immediate.some(event=>event.kind==='pause'&&event.id===mentorId),'Pythagoras continued speaking after Next task was clicked').toBeTruthy();
  await expect(page.locator('.extended-practice[data-practice-task]')).toHaveAttribute('data-practice-task',second.id);
  await waitForEvent(page,'play',practiceNarrationId(lessonNumber,second));
  const finalEvents=await audit(page);
  const nextPlayIndex=finalEvents.findIndex(event=>event.kind==='play'&&event.id===practiceNarrationId(lessonNumber,second));
  expect(nextPlayIndex).toBeGreaterThanOrEqual(0);
  expect(finalEvents.slice(nextPlayIndex+1).some(event=>event.kind==='play'&&event.id===mentorId),'Old Pythagoras audio resumed after next task began').toBeFalsy();
});
