import {expect,test,type Page} from '@playwright/test';

type VoiceEvent={kind:'request'|'play';id:string};

async function installAudioAudit(page:Page){
  await page.addInitScript(()=>{
    const events:VoiceEvent[]=[];
    const blobIds=new WeakMap<Blob,string>();
    const nativeFetch=window.fetch.bind(window);
    const nativeCreateObjectURL=URL.createObjectURL.bind(URL);
    window.fetch=async(input:RequestInfo|URL,init?:RequestInit)=>{
      const url=typeof input==='string'?input:input instanceof URL?input.href:input.url;
      let id='';
      if(url.includes('/api/narration')){
        let body=init?.body;
        if(body==null&&input instanceof Request){try{body=await input.clone().text()}catch{}}
        if(typeof body==='string'){try{id=(JSON.parse(body) as {id?:string}).id??''}catch{}}
        if(id)events.push({kind:'request',id});
      }
      const response=await nativeFetch(input,init);
      if(!id)return response;
      return new Proxy(response,{get(target,property){
        if(property==='blob')return async()=>{const blob=await target.blob();blobIds.set(blob,id);return blob};
        const value=Reflect.get(target,property,target);return typeof value==='function'?value.bind(target):value;
      }});
    };
    URL.createObjectURL=(blob:Blob|MediaSource)=>{
      if(blob instanceof Blob){const id=blobIds.get(blob);if(id)return`blob:priority/${encodeURIComponent(id)}`}
      return nativeCreateObjectURL(blob);
    };
    class MockAudio{
      src='';preload='';playbackRate=1;currentTime=0;onended:(()=>void)|null=null;onerror:(()=>void)|null=null;
      constructor(source=''){this.src=source}
      id(){const prefix='blob:priority/';return this.src.startsWith(prefix)?decodeURIComponent(this.src.slice(prefix.length)):this.src}
      pause(){}
      play(){events.push({kind:'play',id:this.id()});window.setTimeout(()=>this.onended?.(),650);return Promise.resolve()}
    }
    Object.defineProperty(window,'Audio',{configurable:true,writable:true,value:MockAudio});
    (window as unknown as {__voicePriorityEvents:VoiceEvent[]}).__voicePriorityEvents=events;
    localStorage.setItem('mathnikita-voice-settings-v4',JSON.stringify({engine:'studio',rate:.94}));
    localStorage.setItem('mathnikita-mentor-auto-guide','false');
  });
}

async function events(page:Page){return page.evaluate(()=>(window as unknown as {__voicePriorityEvents:VoiceEvent[]}).__voicePriorityEvents)}

test('current lesson narration outranks mentor warmup and mentor speculation stays bounded',async({page})=>{
  test.setTimeout(60_000);
  await installAudioAudit(page);
  await page.route('**/api/narration-status',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,studioConfigured:true,provider:'gemini',voice:'Sulafat'})}));
  await page.route('**/api/narration',async route=>{
    const body=route.request().postDataJSON() as {id?:string};
    const id=body.id??'';
    if(id.startsWith('mentor-'))await new Promise(resolve=>setTimeout(resolve,80));
    await route.fulfill({status:200,contentType:'audio/wav',body:'RIFF-priority-test'});
  });

  await page.goto('/',{waitUntil:'domcontentloaded'});
  await page.getByRole('button',{name:/Открыть урок 6:/}).click();
  await page.locator('.lesson-opening-start').click();
  await expect(page.locator('[data-stage-id="l6-story"]')).toBeVisible();

  await expect.poll(async()=>{const list=await events(page);return list.some(event=>event.kind==='play'&&event.id==='lesson-06-stage-l6-story')},{timeout:10_000}).toBeTruthy();
  const firstStagePlay=(await events(page)).findIndex(event=>event.kind==='play'&&event.id==='lesson-06-stage-l6-story');
  const requestsBeforeStagePlay=(await events(page)).slice(0,firstStagePlay).filter(event=>event.kind==='request');
  expect(requestsBeforeStagePlay.some(event=>event.id.startsWith('mentor-l6-intro-')),'current-scene mentor warmup must not reach TTS before current stage plays').toBeFalsy();

  await page.waitForTimeout(1_400);
  const mentorIds=Array.from(new Set((await events(page)).filter(event=>event.kind==='request'&&event.id.startsWith('mentor-l6-intro-')).map(event=>event.id)));
  expect(mentorIds.every(id=>/(?:-hint|-welcome)$/.test(id)),`unexpected current-scene speculative mentor ids: ${mentorIds.join(', ')}`).toBeTruthy();
  expect(mentorIds.length,'current-scene mentor background warmup must stay bounded').toBeLessThanOrEqual(2);
});
