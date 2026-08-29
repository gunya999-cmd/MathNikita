import { expect,test,type Page } from '@playwright/test';

type NarrationRequest={id:string;text:string;version:string};
type VoiceAudit={playedIds:string[];audioPlays:number;pauses:number};

async function installVoiceAudit(page:Page){
  await page.addInitScript(()=>{
    const audit:VoiceAudit={playedIds:[],audioPlays:0,pauses:0};
    const blobNarrationIds=new WeakMap<Blob,string>();
    const nativeFetch=window.fetch.bind(window);
    const nativeCreateObjectURL=URL.createObjectURL.bind(URL);
    let sequence=0;
    window.fetch=async(input:RequestInfo|URL,init?:RequestInit)=>{
      const url=typeof input==='string'?input:input instanceof URL?input.href:input.url;
      let narrationId='';
      if(url.includes('/api/narration')){
        let rawBody=init?.body;
        if(rawBody==null&&input instanceof Request){try{rawBody=await input.clone().text()}catch{}}
        if(typeof rawBody==='string'){try{narrationId=(JSON.parse(rawBody) as {id?:string}).id??''}catch{}}
      }
      const response=await nativeFetch(input,init);
      if(!narrationId)return response;
      return new Proxy(response,{get(target,property){
        if(property==='blob')return async()=>{const blob=await target.blob();blobNarrationIds.set(blob,narrationId);return blob};
        const value=Reflect.get(target,property,target);return typeof value==='function'?value.bind(target):value;
      }});
    };
    URL.createObjectURL=(blob:Blob|MediaSource)=>{
      if(blob instanceof Blob){const id=blobNarrationIds.get(blob);if(id)return`blob:l25-voice/${encodeURIComponent(id)}/${++sequence}`}
      return nativeCreateObjectURL(blob);
    };
    class MockAudio{
      src='';preload='';playbackRate=1;currentTime=0;onended:(()=>void)|null=null;onerror:(()=>void)|null=null;timer:number|null=null;
      constructor(source=''){this.src=source}
      pause(){audit.pauses+=1;if(this.timer!==null){window.clearTimeout(this.timer);this.timer=null}}
      play(){this.pause();audit.audioPlays+=1;const prefix='blob:l25-voice/';audit.playedIds.push(this.src.startsWith(prefix)?decodeURIComponent(this.src.slice(prefix.length).split('/')[0]):this.src);this.timer=window.setTimeout(()=>{this.timer=null;this.onended?.()},28);return Promise.resolve()}
    }
    Object.defineProperty(window,'Audio',{configurable:true,writable:true,value:MockAudio});
    (window as unknown as {__l25VoiceAudit:VoiceAudit}).__l25VoiceAudit=audit;
    localStorage.setItem('mathnikita-voice-settings-v4',JSON.stringify({engine:'studio',rate:.94}));
    localStorage.setItem('mathnikita-mentor-auto-guide','false');
  });
}

async function routeNarration(page:Page,requests:NarrationRequest[]){
  await page.route('**/api/narration-status',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,studioConfigured:true,provider:'gemini',voice:'Sulafat'})}));
  await page.route('**/api/narration',async route=>{requests.push(route.request().postDataJSON() as NarrationRequest);await new Promise(resolve=>setTimeout(resolve,8));await route.fulfill({status:200,contentType:'audio/wav',body:'RIFF-lesson-25-voice'})});
}

async function openLesson(page:Page){
  await page.goto('/',{waitUntil:'domcontentloaded'});
  const chapterTwo=page.locator('.course-chapter-group').nth(1);if(!(await chapterTwo.evaluate(element=>(element as HTMLDetailsElement).open)))await chapterTwo.locator('summary').click();
  await page.getByRole('button',{name:/Открыть урок 25:/}).click();
  await page.locator('.lesson-opening-start').click();
  await expect(page.locator('[data-stage-id="l25-mission"]')).toBeVisible();
}
async function played(page:Page,id:string){return page.evaluate(id=>(window as unknown as {__l25VoiceAudit:VoiceAudit}).__l25VoiceAudit.playedIds.includes(id),id)}
async function playedCount(page:Page,id:string){return page.evaluate(id=>(window as unknown as {__l25VoiceAudit:VoiceAudit}).__l25VoiceAudit.playedIds.filter(item=>item===id).length,id)}

const mentorActions=[
  {label:'↻ Объясни иначе',suffix:'different'},
  {label:'▣ Дай пример',suffix:'example'},
  {label:'✦ Подсказка',suffix:'hint'},
  {label:'? Почему так?',suffix:'why'},
] as const;

test('lesson 25 plays Sulafat on every main stage and Pythagoras in mandatory practice',async({page})=>{
  test.setTimeout(180_000);
  const requests:NarrationRequest[]=[];const pageErrors:string[]=[];page.on('pageerror',error=>pageErrors.push(error.message));
  await installVoiceAudit(page);await routeNarration(page,requests);await openLesson(page);
  const total=25;const seen=new Set<string>();
  for(let stageIndex=0;stageIndex<total;stageIndex+=1){
    await page.evaluate(stageIndex=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:25,stageIndex}})),stageIndex);
    const stage=page.locator('.lesson-runtime:not([hidden]) .interactive-stage[data-stage-id]');
    await expect(stage).toBeVisible({timeout:5_000});
    await expect(page.locator('.stage-counter')).toContainText(`Этап ${stageIndex+1} из ${total}`);
    const stageId=await stage.getAttribute('data-stage-id');expect(stageId).toBeTruthy();seen.add(stageId!);
    const expectedId=`lesson-25-stage-${stageId}`;
    await expect.poll(()=>requests.some(item=>item.id===expectedId),{timeout:6_000,message:`No Sulafat request for ${stageId}`}).toBeTruthy();
    const request=requests.find(item=>item.id===expectedId)!;expect(request.version).toBe('ru-teacher-gemini-sulafat-v2');expect(request.text.trim().length).toBeGreaterThan(15);
    await expect.poll(()=>played(page,expectedId),{timeout:6_000,message:`Audio.play did not happen for ${stageId}`}).toBeTruthy();
  }
  expect(seen.size).toBe(25);
  await expect(page.locator('[data-stage-id="l25-summary"]')).toBeVisible();
  await expect(page.locator('.extended-practice')).toBeVisible({timeout:8_000});
  const taskId=await page.locator('.extended-practice[data-practice-task]').getAttribute('data-practice-task');expect(taskId).toBeTruthy();
  await expect(page.locator('.practice-pythagoras-actions button')).toHaveCount(4);
  for(const action of mentorActions){
    const expectedId=`mentor-practice-25-${taskId}-${action.suffix}`;const before=await playedCount(page,expectedId);
    await page.locator('.practice-pythagoras-actions').getByRole('button',{name:action.label,exact:true}).click();
    await expect(page.locator('.practice-pythagoras-message')).not.toBeEmpty();
    await expect.poll(()=>playedCount(page,expectedId),{timeout:8_000}).toBeGreaterThan(before);
    await expect.poll(()=>requests.some(item=>item.id===expectedId),{timeout:8_000}).toBeTruthy();
    expect(requests.find(item=>item.id===expectedId)!.version).toBe('ru-teacher-gemini-sulafat-v2');
  }
  expect(pageErrors).toEqual([]);
});

test('lesson 25 navigation interrupts stale narration before the next stage speaks',async({page})=>{
  const requests:NarrationRequest[]=[];await installVoiceAudit(page);await routeNarration(page,requests);await openLesson(page);
  const first='lesson-25-stage-l25-mission';await expect.poll(()=>played(page,first),{timeout:6_000}).toBeTruthy();
  const pausesBefore=await page.evaluate(()=>(window as unknown as {__l25VoiceAudit:VoiceAudit}).__l25VoiceAudit.pauses);
  await page.evaluate(()=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber:25,stageIndex:1}})));
  await expect(page.locator('[data-stage-id="l25-warmup"]')).toBeVisible();
  const second='lesson-25-stage-l25-warmup';await expect.poll(()=>played(page,second),{timeout:6_000}).toBeTruthy();
  const pausesAfter=await page.evaluate(()=>(window as unknown as {__l25VoiceAudit:VoiceAudit}).__l25VoiceAudit.pauses);
  expect(pausesAfter).toBeGreaterThan(pausesBefore);
  expect(requests.some(item=>item.id===second)).toBeTruthy();
});
