import {expect,test,type Page} from '@playwright/test';

type AuditEvent={kind:'request'|'play'|'pause';id:string};type AuditState={events:AuditEvent[]};

async function installVoiceAudit(page:Page){
  await page.addInitScript(()=>{
    const audit:AuditState={events:[]};const blobIds=new WeakMap<Blob,string>();const nativeFetch=window.fetch.bind(window);const nativeCreateObjectURL=URL.createObjectURL.bind(URL);
    window.fetch=async(input:RequestInfo|URL,init?:RequestInit)=>{const url=typeof input==='string'?input:input instanceof URL?input.href:input.url;let narrationId='';if(url.includes('/api/narration')){let rawBody=init?.body;if(rawBody==null&&input instanceof Request){try{rawBody=await input.clone().text()}catch{}}if(typeof rawBody==='string'){try{narrationId=(JSON.parse(rawBody) as {id?:string}).id??''}catch{}}if(narrationId)audit.events.push({kind:'request',id:narrationId})}const response=await nativeFetch(input,init);if(!narrationId)return response;return new Proxy(response,{get(target,property){if(property==='blob')return async()=>{const blob=await target.blob();blobIds.set(blob,narrationId);return blob};const value=Reflect.get(target,property,target);return typeof value==='function'?value.bind(target):value}})};
    URL.createObjectURL=(blob:Blob|MediaSource)=>{if(blob instanceof Blob){const id=blobIds.get(blob);if(id)return`blob:l53-voice/${encodeURIComponent(id)}`}return nativeCreateObjectURL(blob)};
    class MockAudio{src='';preload='';playbackRate=1;currentTime=0;onended:(()=>void)|null=null;onerror:(()=>void)|null=null;private timer:number|null=null;private started=false;constructor(source=''){this.src=source}id(){const prefix='blob:l53-voice/';return this.src.startsWith(prefix)?decodeURIComponent(this.src.slice(prefix.length)):this.src}pause(){if(this.started)audit.events.push({kind:'pause',id:this.id()});this.started=false;if(this.timer!==null){window.clearTimeout(this.timer);this.timer=null}}play(){this.pause();this.started=true;audit.events.push({kind:'play',id:this.id()});this.timer=window.setTimeout(()=>{this.timer=null;this.started=false;this.onended?.()},5000);return Promise.resolve()}}
    Object.defineProperty(window,'Audio',{configurable:true,writable:true,value:MockAudio});(window as unknown as {__l53Voice:AuditState}).__l53Voice=audit;localStorage.setItem('mathnikita-voice-settings-v4',JSON.stringify({engine:'studio',rate:.94}));localStorage.setItem('mathnikita-mentor-auto-guide','false');
  });
}
async function events(page:Page){return page.evaluate(()=>(window as unknown as {__l53Voice:AuditState}).__l53Voice.events)}

test('lesson 53 immediately stops stale Sulafat and narrates the next control stage',async({page})=>{
  test.setTimeout(90_000);await installVoiceAudit(page);
  await page.route('**/api/narration-status',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,studioConfigured:true,provider:'gemini',voice:'Sulafat'})}));
  await page.route('**/api/narration',route=>route.fulfill({status:200,contentType:'audio/wav',body:'RIFF-lesson53'}));
  await page.goto('/');const chapterTwo=page.locator('.course-chapter-group').nth(1);if(!(await chapterTwo.evaluate(element=>(element as HTMLDetailsElement).open)))await chapterTwo.locator('summary').click();await page.getByRole('button',{name:/Открыть урок 53:/}).click();await page.locator('.lesson-opening-start').click();
  const stage=page.locator('.lesson-runtime:not([hidden]) .interactive-stage[data-stage-id]');await expect(stage).toHaveAttribute('data-stage-id','l53-rules');const oldId='lesson-53-stage-l53-rules';const nextId='lesson-53-stage-l53-task1';
  await expect.poll(async()=>{const audit=await events(page);return audit.some(event=>event.kind==='play'&&event.id===oldId)},{timeout:12_000}).toBeTruthy();await page.evaluate(()=>{(window as unknown as {__l53Voice:AuditState}).__l53Voice.events=[]});
  await page.locator('.lesson-controls .primary').dispatchEvent('click');const immediate=await events(page);expect(immediate.some(event=>event.kind==='pause'&&event.id===oldId)).toBeTruthy();await expect(stage).toHaveAttribute('data-stage-id','l53-task1');
  await expect.poll(async()=>{const audit=await events(page);return audit.some(event=>event.kind==='play'&&event.id===nextId)},{timeout:12_000}).toBeTruthy();await expect(page.locator('.cat-mentor,.progressive-hint-coach,.instant-feedback')).toHaveCount(0);
});
