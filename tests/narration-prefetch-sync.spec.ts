import {expect,test,type Page} from '@playwright/test';

type AuditEvent={kind:'request'|'foreground'|'play';id:string};
type AuditState={events:AuditEvent[]};

async function installNarrationAudit(page:Page){
  await page.addInitScript(()=>{
    const audit:AuditState={events:[]};
    const blobIds=new WeakMap<Blob,string>();
    const nativeFetch=window.fetch.bind(window);
    const nativeCreateObjectURL=URL.createObjectURL.bind(URL);
    window.addEventListener('mathnikita-audio-request',event=>{
      const detail=(event as CustomEvent<{source?:string;narrationId?:string}>).detail;
      if(detail?.source==='narrator'&&detail.narrationId)audit.events.push({kind:'foreground',id:detail.narrationId});
    });
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
      if(blob instanceof Blob){const id=blobIds.get(blob);if(id)return'blob:narration-prefetch/'+encodeURIComponent(id)}
      return nativeCreateObjectURL(blob);
    };
    class MockAudio{
      src='';preload='';playbackRate=1;currentTime=0;onended:(()=>void)|null=null;onerror:(()=>void)|null=null;
      constructor(source=''){this.src=source}
      id(){const prefix='blob:narration-prefetch/';return this.src.startsWith(prefix)?decodeURIComponent(this.src.slice(prefix.length)):this.src}
      pause(){}
      play(){audit.events.push({kind:'play',id:this.id()});return Promise.resolve()}
    }
    Object.defineProperty(window,'Audio',{configurable:true,writable:true,value:MockAudio});
    (window as unknown as {__narrationPrefetchAudit:AuditState}).__narrationPrefetchAudit=audit;
    localStorage.setItem('mathnikita-voice-settings-v4',JSON.stringify({engine:'studio',rate:.94}));
    localStorage.setItem('mathnikita-mentor-auto-guide','false');
  });
}

async function auditEvents(page:Page){return page.evaluate(()=>(window as unknown as {__narrationPrefetchAudit:AuditState}).__narrationPrefetchAudit.events)}

test('slow stage narration is prefetched before foreground playback and reuses one request',async({page})=>{
  test.setTimeout(90000);
  await installNarrationAudit(page);
  await page.route('**/api/narration-status',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,studioConfigured:true,provider:'gemini',voice:'Sulafat'})}));
  await page.route('**/api/narration',async route=>{await new Promise(resolve=>setTimeout(resolve,300));await route.fulfill({status:200,contentType:'audio/wav',body:'RIFF-prefetch-sync'})});
  await page.goto('/');
  const chapterThree=page.locator('.course-chapter-group').nth(2);if(!(await chapterThree.evaluate(element=>(element as HTMLDetailsElement).open)))await chapterThree.locator('summary').click();
  await page.getByRole('button',{name:/Открыть урок 79:/}).click();
  await page.locator('.lesson-opening-start').click();
  const stage=page.locator('.lesson-runtime:not([hidden]) .interactive-stage[data-stage-id]');
  await expect(stage).toHaveAttribute('data-stage-id','l79-mission');
  const stageId='lesson-79-stage-l79-mission';
  await expect.poll(async()=>{const events=await auditEvents(page);return events.some(event=>event.kind==='play'&&event.id===stageId)},{timeout:12000}).toBeTruthy();
  const events=await auditEvents(page);const relevant=events.filter(event=>event.id===stageId);
  expect(relevant.filter(event=>event.kind==='request')).toHaveLength(1);
  const requestIndex=relevant.findIndex(event=>event.kind==='request');const foregroundIndex=relevant.findIndex(event=>event.kind==='foreground');const playIndex=relevant.findIndex(event=>event.kind==='play');
  expect(requestIndex).toBeGreaterThanOrEqual(0);expect(foregroundIndex).toBeGreaterThan(requestIndex);expect(playIndex).toBeGreaterThan(foregroundIndex);
});