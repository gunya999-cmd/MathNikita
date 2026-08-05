import {expect,test,type Page} from '@playwright/test';

type VoiceEvent={kind:'request'|'play';id:string};

async function installAudioAudit(page:Page){
  await page.addInitScript(()=>{
    const events:VoiceEvent[]=[];const blobIds=new WeakMap<Blob,string>();const nativeFetch=window.fetch.bind(window);const nativeCreateObjectURL=URL.createObjectURL.bind(URL);
    window.fetch=async(input:RequestInfo|URL,init?:RequestInit)=>{
      const url=typeof input==='string'?input:input instanceof URL?input.href:input.url;let id='';
      if(url.includes('/api/narration')){let body=init?.body;if(body==null&&input instanceof Request){try{body=await input.clone().text()}catch{}}if(typeof body==='string'){try{id=(JSON.parse(body) as {id?:string}).id??''}catch{}}if(id)events.push({kind:'request',id})}
      const response=await nativeFetch(input,init);if(!id)return response;
      return new Proxy(response,{get(target,property){if(property==='blob')return async()=>{const blob=await target.blob();blobIds.set(blob,id);return blob};const value=Reflect.get(target,property,target);return typeof value==='function'?value.bind(target):value}});
    };
    URL.createObjectURL=(blob:Blob|MediaSource)=>{if(blob instanceof Blob){const id=blobIds.get(blob);if(id)return`blob:priority/${encodeURIComponent(id)}`}return nativeCreateObjectURL(blob)};
    class MockAudio{src='';preload='';playbackRate=1;currentTime=0;onended:(()=>void)|null=null;onerror:(()=>void)|null=null;constructor(source=''){this.src=source}id(){const prefix='blob:priority/';return this.src.startsWith(prefix)?decodeURIComponent(this.src.slice(prefix.length)):this.src}pause(){}play(){events.push({kind:'play',id:this.id()});window.setTimeout(()=>this.onended?.(),650);return Promise.resolve()}}
    Object.defineProperty(window,'Audio',{configurable:true,writable:true,value:MockAudio});(window as unknown as {__voicePriorityEvents:VoiceEvent[]}).__voicePriorityEvents=events;
    localStorage.setItem('mathnikita-voice-settings-v4',JSON.stringify({engine:'studio',rate:.94}));localStorage.setItem('mathnikita-mentor-auto-guide','false');
  });
}
async function events(page:Page){return page.evaluate(()=>(window as unknown as {__voicePriorityEvents:VoiceEvent[]}).__voicePriorityEvents)}

test('current lesson narration performs no speculative mentor TTS',async({page})=>{
  test.setTimeout(60_000);await installAudioAudit(page);
  await page.route('**/api/narration-status',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,studioConfigured:true,provider:'gemini',voice:'Sulafat'})}));
  await page.route('**/api/narration',route=>route.fulfill({status:200,contentType:'audio/wav',body:'RIFF-priority-test'}));
  await page.goto('/',{waitUntil:'domcontentloaded'});await page.getByRole('button',{name:/Открыть урок 6:/}).click();await page.locator('.lesson-opening-start').click();await expect(page.locator('[data-stage-id="l6-story"]')).toBeVisible();
  await expect.poll(async()=>{const list=await events(page);return list.some(event=>event.kind==='play'&&event.id==='lesson-06-stage-l6-story')},{timeout:10_000}).toBeTruthy();
  await page.waitForTimeout(1_000);const list=await events(page);
  expect(list.some(event=>event.kind==='request'&&event.id.startsWith('mentor-l6-intro-')),'mentor must not spend TTS quota before learner asks for it').toBeFalsy();
});

test('abandoned 429 narration is aborted before it can retry',async({page})=>{
  test.setTimeout(60_000);await installAudioAudit(page);const staleId='lesson-22-stage-l22-mission';
  await page.route('**/api/narration-status',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,studioConfigured:true,provider:'gemini',voice:'Sulafat'})}));
  await page.route('**/api/narration',route=>{const id=(route.request().postDataJSON() as {id?:string}).id??'';if(id===staleId)return route.fulfill({status:429,headers:{'retry-after':'1'},contentType:'application/json',body:'{}'});return route.fulfill({status:200,contentType:'audio/wav',body:'RIFF-priority-test'})});
  await page.goto('/',{waitUntil:'domcontentloaded'});const chapterTwo=page.locator('.course-chapter-group').nth(1);if(!(await chapterTwo.evaluate(element=>(element as HTMLDetailsElement).open)))await chapterTwo.locator('summary').click();
  await page.getByRole('button',{name:/Открыть урок 22:/}).click();await page.locator('.lesson-opening-start').click();await expect(page.locator('[data-stage-id="l22-mission"]')).toBeVisible();
  await expect.poll(async()=>{const list=await events(page);return list.filter(event=>event.kind==='request'&&event.id===staleId).length},{timeout:5_000}).toBe(1);
  await page.locator('.lesson-controls .primary').dispatchEvent('click');await expect(page.locator('[data-stage-id="l22-recall"]')).toBeVisible();
  await expect.poll(async()=>{const list=await events(page);return list.some(event=>event.kind==='play'&&event.id==='lesson-22-stage-l22-recall')},{timeout:5_000}).toBeTruthy();
  await page.waitForTimeout(2_200);const list=await events(page);expect(list.filter(event=>event.kind==='request'&&event.id===staleId).length,'stale 429 request retried after learner had left the stage').toBe(1);
});
