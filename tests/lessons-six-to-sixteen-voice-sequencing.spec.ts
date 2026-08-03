import { expect,test,type Page } from '@playwright/test';

type AuditEvent={kind:'request'|'played'|'ended';source?:string;narrationId?:string};
type AuditState={events:AuditEvent[]};

async function installSequencingAudit(page:Page){
  await page.addInitScript(()=>{
    const audit:AuditState={events:[]};
    class MockAudio{
      src='';preload='';playbackRate=1;currentTime=0;onended:(()=>void)|null=null;onerror:(()=>void)|null=null;timer:number|null=null;
      constructor(source=''){this.src=source}
      pause(){if(this.timer!==null){window.clearTimeout(this.timer);this.timer=null}}
      play(){this.pause();this.timer=window.setTimeout(()=>{this.timer=null;this.onended?.()},260);return Promise.resolve()}
    }
    Object.defineProperty(window,'Audio',{configurable:true,writable:true,value:MockAudio});
    window.addEventListener('mathnikita-audio-request',event=>{
      const detail=(event as CustomEvent<{source?:string}>).detail;
      audit.events.push({kind:'request',source:detail?.source});
    });
    window.addEventListener('mathnikita-audio-played',event=>{
      const detail=(event as CustomEvent<{source?:string;narrationId?:string}>).detail;
      audit.events.push({kind:'played',source:detail?.source,narrationId:detail?.narrationId});
    });
    window.addEventListener('mathnikita-audio-ended',event=>{
      const detail=(event as CustomEvent<{source?:string;narrationId?:string}>).detail;
      audit.events.push({kind:'ended',source:detail?.source,narrationId:detail?.narrationId});
    });
    (window as unknown as {__voiceSequenceAudit:AuditState}).__voiceSequenceAudit=audit;
    localStorage.setItem('mathnikita-voice-settings-v4',JSON.stringify({engine:'studio',rate:.94}));
    localStorage.setItem('mathnikita-mentor-auto-guide','true');
  });
}

async function routeNarration(page:Page){
  await page.route('**/api/narration-status',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,studioConfigured:true,provider:'gemini',voice:'Sulafat'})}));
  await page.route('**/api/narration',async route=>{
    await new Promise(resolve=>setTimeout(resolve,8));
    await route.fulfill({status:200,contentType:'audio/wav',body:'RIFF-voice-sequencing'});
  });
}

async function auditEvents(page:Page){
  return page.evaluate(()=>(window as unknown as {__voiceSequenceAudit:AuditState}).__voiceSequenceAudit.events);
}

async function clearAudit(page:Page){
  await page.evaluate(()=>{(window as unknown as {__voiceSequenceAudit:AuditState}).__voiceSequenceAudit.events=[]});
}

async function openLesson(page:Page,lessonNumber:number){
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await page.getByRole('button',{name:new RegExp(`Открыть урок ${lessonNumber}:`)}).click();
  await page.locator('.lesson-opening-start').click();
  await expect(page.locator('.lesson-runtime:not([hidden]) .interactive-stage[data-stage-id]')).toBeVisible();
}

async function currentStageId(page:Page){
  const id=await page.locator('.lesson-runtime:not([hidden]) .interactive-stage[data-stage-id]').getAttribute('data-stage-id');
  if(!id)throw new Error('Current stage has no data-stage-id');
  return id;
}

async function totalStages(page:Page){
  const text=await page.locator('.lesson-runtime:not([hidden]) .stage-counter').innerText();
  const match=text.match(/Этап\s+\d+\s+из\s+(\d+)/i);
  if(!match)throw new Error(`Cannot read stage count from ${text}`);
  return Number(match[1]);
}

function firstIndex(events:AuditEvent[],predicate:(event:AuditEvent)=>boolean){return events.findIndex(predicate)}

for(let lessonNumber=6;lessonNumber<=16;lessonNumber+=1){
  test(`lesson ${lessonNumber} lets the main stage finish before automatic mentor speech`,async({page})=>{
    test.setTimeout(90_000);
    await installSequencingAudit(page);
    await routeNarration(page);
    await openLesson(page,lessonNumber);
    const stageId=await currentStageId(page);
    const narrationId=`lesson-${String(lessonNumber).padStart(2,'0')}-stage-${stageId}`;

    await expect.poll(async()=>firstIndex(await auditEvents(page),event=>event.kind==='played'&&event.narrationId===narrationId),{timeout:8_000}).toBeGreaterThanOrEqual(0);
    await expect.poll(async()=>firstIndex(await auditEvents(page),event=>event.kind==='ended'&&event.narrationId===narrationId),{timeout:8_000,message:`Stage narration was interrupted before onended in lesson ${lessonNumber}`}).toBeGreaterThanOrEqual(0);
    await expect.poll(async()=>firstIndex(await auditEvents(page),event=>event.kind==='request'&&event.source==='mentor'),{timeout:8_000}).toBeGreaterThanOrEqual(0);

    const events=await auditEvents(page);
    const played=firstIndex(events,event=>event.kind==='played'&&event.narrationId===narrationId);
    const ended=firstIndex(events,event=>event.kind==='ended'&&event.narrationId===narrationId);
    const mentor=firstIndex(events,event=>event.kind==='request'&&event.source==='mentor');
    expect(played).toBeGreaterThanOrEqual(0);
    expect(ended).toBeGreaterThan(played);
    expect(mentor,`Automatic mentor interrupted the main narration in lesson ${lessonNumber}`).toBeGreaterThan(ended);
  });
}

test('summary finishes before mandatory practice and the toolbar listens to practice',async({page})=>{
  test.setTimeout(90_000);
  const lessonNumber=6;
  await installSequencingAudit(page);
  await routeNarration(page);
  await openLesson(page,lessonNumber);
  window;
  const total=await totalStages(page);

  await page.evaluate(()=>window.dispatchEvent(new CustomEvent('mathnikita-stop-narration')));
  await clearAudit(page);
  await page.evaluate(({lessonNumber,stageIndex})=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber,stageIndex}})),{lessonNumber,stageIndex:total-1});
  await expect(page.locator('.lesson-runtime:not([hidden]) .stage-counter')).toContainText(`Этап ${total} из ${total}`);
  const stageId=await currentStageId(page);
  expect(stageId.endsWith('-summary')).toBeTruthy();
  const summaryId=`lesson-${String(lessonNumber).padStart(2,'0')}-stage-${stageId}`;

  await expect.poll(async()=>firstIndex(await auditEvents(page),event=>event.kind==='ended'&&event.narrationId===summaryId),{timeout:8_000,message:'Summary narration did not finish completely'}).toBeGreaterThanOrEqual(0);
  await expect.poll(async()=>firstIndex(await auditEvents(page),event=>event.kind==='request'&&event.source==='practice-narrator'),{timeout:8_000}).toBeGreaterThanOrEqual(0);

  let events=await auditEvents(page);
  const summaryPlayed=firstIndex(events,event=>event.kind==='played'&&event.narrationId===summaryId);
  const summaryEnded=firstIndex(events,event=>event.kind==='ended'&&event.narrationId===summaryId);
  const practiceRequest=firstIndex(events,event=>event.kind==='request'&&event.source==='practice-narrator');
  const mentorBetween=events.findIndex((event,index)=>index>summaryEnded&&index<practiceRequest&&event.kind==='request'&&event.source==='mentor');
  expect(summaryPlayed).toBeGreaterThanOrEqual(0);
  expect(summaryEnded).toBeGreaterThan(summaryPlayed);
  expect(practiceRequest,'Mandatory practice started before summary finished').toBeGreaterThan(summaryEnded);
  expect(mentorBetween,'Automatic mentor spoke between summary and mandatory practice').toBe(-1);

  const taskId=await page.locator('.extended-practice[data-practice-task]').getAttribute('data-practice-task');
  expect(taskId).toBeTruthy();
  const practiceId=`lesson-${String(lessonNumber).padStart(2,'0')}-practice-${taskId}`;
  await clearAudit(page);
  await page.locator('.voice-narrator > button').first().click();
  await expect.poll(async()=>firstIndex(await auditEvents(page),event=>event.kind==='played'&&event.narrationId===practiceId),{timeout:8_000,message:'Global Listen button read the summary instead of current mandatory practice'}).toBeGreaterThanOrEqual(0);
  events=await auditEvents(page);
  expect(firstIndex(events,event=>event.kind==='played'&&event.narrationId===summaryId)).toBe(-1);
});
