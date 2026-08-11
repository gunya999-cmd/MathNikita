// Final certification trigger: rerun the whole matrix after removing the tablet mentor auto-collapse race.
import {expect,test,type Page} from '@playwright/test';

type AuditEvent={kind:'request'|'play'|'pause';id:string};
type AuditState={events:AuditEvent[]};

async function installVoiceAudit(page:Page){
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
        if(typeof rawBody==='string'){
          try{narrationId=(JSON.parse(rawBody) as {id?:string}).id??''}catch{}
        }
        if(narrationId)audit.events.push({kind:'request',id:narrationId});
      }
      const response=await nativeFetch(input,init);
      if(!narrationId)return response;
      return new Proxy(response,{get(target,property){
        if(property==='blob')return async()=>{const blob=await target.blob();blobIds.set(blob,narrationId);return blob};
        const value=Reflect.get(target,property,target);
        return typeof value==='function'?value.bind(target):value;
      }});
    };

    URL.createObjectURL=(blob:Blob|MediaSource)=>{
      if(blob instanceof Blob){const id=blobIds.get(blob);if(id)return`blob:cert-voice/${encodeURIComponent(id)}`}
      return nativeCreateObjectURL(blob);
    };

    class MockAudio{
      src='';preload='';playbackRate=1;currentTime=0;onended:(()=>void)|null=null;onerror:(()=>void)|null=null;
      private timer:number|null=null;private started=false;
      constructor(source=''){this.src=source}
      id(){const prefix='blob:cert-voice/';return this.src.startsWith(prefix)?decodeURIComponent(this.src.slice(prefix.length)):this.src}
      pause(){if(this.started)audit.events.push({kind:'pause',id:this.id()});this.started=false;if(this.timer!==null){window.clearTimeout(this.timer);this.timer=null}}
      play(){this.pause();this.started=true;audit.events.push({kind:'play',id:this.id()});this.timer=window.setTimeout(()=>{this.timer=null;this.started=false;this.onended?.()},5000);return Promise.resolve()}
    }

    Object.defineProperty(window,'Audio',{configurable:true,writable:true,value:MockAudio});
    (window as unknown as {__lessonCertVoiceAudit:AuditState}).__lessonCertVoiceAudit=audit;
    localStorage.setItem('mathnikita-voice-settings-v4',JSON.stringify({engine:'studio',rate:.94}));
    localStorage.setItem('mathnikita-mentor-auto-guide','false');
  });
}

async function routeNarration(page:Page){
  await page.route('**/api/narration-status',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,studioConfigured:true,provider:'gemini',voice:'Sulafat'})}));
  await page.route('**/api/narration',route=>route.fulfill({status:200,contentType:'audio/wav',body:'RIFF-certification-voice'}));
}

async function events(page:Page){return page.evaluate(()=>(window as unknown as {__lessonCertVoiceAudit:AuditState}).__lessonCertVoiceAudit.events)}
async function clearEvents(page:Page){await page.evaluate(()=>{(window as unknown as {__lessonCertVoiceAudit:AuditState}).__lessonCertVoiceAudit.events=[]})}

async function openLesson(page:Page,lessonNumber:number){
  await page.goto('/',{waitUntil:'domcontentloaded'});
  const chapterTwo=page.locator('.course-chapter-group').nth(1);
  if(!(await chapterTwo.evaluate(element=>(element as HTMLDetailsElement).open)))await chapterTwo.locator('summary').click();
  const button=page.getByRole('button',{name:new RegExp(`Открыть урок ${lessonNumber}:`)});
  await expect(button,`Lesson ${lessonNumber} must be enabled in the catalog`).toBeEnabled();
  await button.click();
  await expect(page.locator('.lesson-opening')).toBeVisible();
  await clearEvents(page);
  await page.locator('.lesson-opening-start').click();
  await expect(page.locator('.lesson-runtime:not([hidden]) .interactive-stage[data-stage-id]')).toBeVisible();
}

for(let lessonNumber=23;lessonNumber<=33;lessonNumber+=1){
  test(`lesson ${lessonNumber} stops old Sulafat and starts the new stage immediately`,async({page})=>{
    test.setTimeout(90_000);
    const pageErrors:string[]=[];
    page.on('pageerror',error=>pageErrors.push(error.message));
    await installVoiceAudit(page);
    await routeNarration(page);
    await openLesson(page,lessonNumber);

    if(lessonNumber===33){
      await expect(page.locator('.cat-mentor')).toHaveCount(0);
      await expect(page.locator('.progressive-hint-coach')).toHaveCount(0);
      await expect(page.locator('.extended-practice')).toHaveCount(0);
    }

    const stage=page.locator('.lesson-runtime:not([hidden]) .interactive-stage[data-stage-id]');
    const oldStageId=await stage.getAttribute('data-stage-id');
    expect(oldStageId,`Lesson ${lessonNumber} first stage must have an id`).toBeTruthy();
    const prefix=`lesson-${String(lessonNumber).padStart(2,'0')}-stage-`;

    await expect.poll(async()=>{
      const audit=await events(page);
      return audit.findLast(event=>event.kind==='play'&&event.id.startsWith(prefix))?.id??'';
    },{timeout:12_000,message:`Lesson ${lessonNumber}: initial Sulafat narration never played`}).not.toBe('');
    const before=await events(page);
    const oldNarrationId=before.findLast(event=>event.kind==='play'&&event.id.startsWith(prefix))?.id;
    expect(oldNarrationId).toBeTruthy();

    await clearEvents(page);
    const nextButton=page.locator('.lesson-runtime:not([hidden]) .lesson-controls button:not([disabled])').last();
    await expect(nextButton,`Lesson ${lessonNumber}: no enabled forward navigation on first stage`).toHaveCount(1);
    await nextButton.dispatchEvent('click');

    const immediate=await events(page);
    expect(immediate.some(event=>event.kind==='pause'&&event.id===oldNarrationId),`Lesson ${lessonNumber}: previous audio survived the stage transition`).toBeTruthy();
    await expect(stage,`Lesson ${lessonNumber}: stage did not advance`).not.toHaveAttribute('data-stage-id',oldStageId!);

    await expect.poll(async()=>{
      const audit=await events(page);
      return audit.some(event=>event.kind==='play'&&event.id.startsWith(prefix)&&event.id!==oldNarrationId);
    },{timeout:12_000,message:`Lesson ${lessonNumber}: next Sulafat narration never started`}).toBeTruthy();

    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
    expect(overflow,`Lesson ${lessonNumber}: horizontal overflow`).toBeLessThanOrEqual(2);
    expect(pageErrors,`Lesson ${lessonNumber}: uncaught browser errors`).toEqual([]);
  });
}
