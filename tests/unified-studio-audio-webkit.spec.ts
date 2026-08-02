import { expect,test,type Locator } from '@playwright/test';

async function domClick(locator:Locator){
  await expect(locator).toBeVisible();
  await locator.evaluate((element:HTMLElement)=>element.click());
}

test('iPad WebKit plays prefetched studio audio without falling back to device speech',async({page,request})=>{
  test.setTimeout(45_000);
  await page.addInitScript(()=>{
    const audit={systemSpeech:0,mediaPlayCalls:0,mediaPlayResolved:0,mediaPlayRejected:0};
    const voice={name:'Milena Enhanced',lang:'ru-RU',voiceURI:'ru-enhanced',localService:true,default:true};
    class MockUtterance{lang='';voice:typeof voice|null=null;rate=1;pitch=1;volume=1;onend:(()=>void)|null=null;onerror:(()=>void)|null=null;constructor(public text=''){} }
    const synthesis={getVoices:()=>[voice],speak:()=>{audit.systemSpeech+=1},cancel:()=>undefined,pause:()=>undefined,resume:()=>undefined,addEventListener:()=>undefined,removeEventListener:()=>undefined,get speaking(){return false},get pending(){return false},get paused(){return false}};
    Object.defineProperty(window,'SpeechSynthesisUtterance',{configurable:true,writable:true,value:MockUtterance});
    Object.defineProperty(window,'speechSynthesis',{configurable:true,value:synthesis});
    HTMLMediaElement.prototype.play=function(){
      audit.mediaPlayCalls+=1;
      audit.mediaPlayResolved+=1;
      window.setTimeout(()=>this.onended?.(new Event('ended')),20);
      return Promise.resolve();
    };
    (window as unknown as {__realAudioAudit:typeof audit}).__realAudioAudit=audit;
    localStorage.setItem('mathnikita-voice-settings-v4',JSON.stringify({engine:'studio',voiceURI:'ru-enhanced',rate:.94}));
  });

  const fixture=await request.get('http://127.0.0.1:4173/audio/neural/irina/lesson-01-opening.mp3');
  expect(fixture.ok()).toBe(true);
  const mp3=await fixture.body();
  let narrationRequests=0;
  let narrationFulfilled=0;

  await page.route('**/api/narration-status',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,studioConfigured:true,model:'gpt-4o-mini-tts',voice:'marin',version:'ru-teacher-marin-v1'})}));
  await page.route('**/api/narration',async route=>{
    narrationRequests+=1;
    await new Promise(resolve=>setTimeout(resolve,180));
    await route.fulfill({status:200,contentType:'audio/mpeg',body:mp3});
    narrationFulfilled+=1;
  });

  await page.goto('/');
  await domClick(page.getByRole('button',{name:/Открыть урок 5:/}));
  await expect(page.locator('.lesson-opening-start')).toBeVisible();
  const narrator=page.locator('.voice-narrator > button').first();
  await expect(narrator).toBeVisible();
  await expect(narrator).toContainText('Слушать · AI');

  await expect.poll(()=>narrationRequests,{timeout:5_000}).toBeGreaterThanOrEqual(1);
  await expect.poll(()=>narrationFulfilled,{timeout:5_000}).toBeGreaterThanOrEqual(1);

  await domClick(narrator);
  await expect.poll(async()=>page.evaluate(()=>(window as unknown as {__realAudioAudit:{mediaPlayCalls:number}}).__realAudioAudit.mediaPlayCalls),{timeout:5_000}).toBeGreaterThanOrEqual(1);
  await expect.poll(async()=>page.evaluate(()=>(window as unknown as {__realAudioAudit:{mediaPlayResolved:number}}).__realAudioAudit.mediaPlayResolved),{timeout:5_000}).toBeGreaterThanOrEqual(1);

  const audit=await page.evaluate(()=>(window as unknown as {__realAudioAudit:{systemSpeech:number;mediaPlayCalls:number;mediaPlayResolved:number;mediaPlayRejected:number}}).__realAudioAudit);
  expect(audit.systemSpeech).toBe(0);
  expect(audit.mediaPlayRejected).toBe(0);
});
