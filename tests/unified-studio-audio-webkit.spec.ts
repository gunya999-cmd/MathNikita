import { expect,test } from '@playwright/test';

test('iPad WebKit plays asynchronously fetched studio audio without falling back to device speech',async({page,request})=>{
  test.setTimeout(45_000);
  await page.addInitScript(()=>{
    const audit={systemSpeech:0};
    const voice={name:'Milena Enhanced',lang:'ru-RU',voiceURI:'ru-enhanced',localService:true,default:true};
    class MockUtterance{lang='';voice:typeof voice|null=null;rate=1;pitch=1;volume=1;onend:(()=>void)|null=null;onerror:(()=>void)|null=null;constructor(public text=''){} }
    const synthesis={getVoices:()=>[voice],speak:()=>{audit.systemSpeech+=1},cancel:()=>undefined,pause:()=>undefined,resume:()=>undefined,addEventListener:()=>undefined,removeEventListener:()=>undefined,get speaking(){return false},get pending(){return false},get paused(){return false}};
    Object.defineProperty(window,'SpeechSynthesisUtterance',{configurable:true,writable:true,value:MockUtterance});
    Object.defineProperty(window,'speechSynthesis',{configurable:true,value:synthesis});
    (window as unknown as {__realAudioAudit:typeof audit}).__realAudioAudit=audit;
    localStorage.setItem('mathnikita-voice-settings-v4',JSON.stringify({engine:'studio',voiceURI:'ru-enhanced',rate:.94}));
  });

  // Load the known-good MP3 before installing the narration route. Fetching a fixture
  // from inside a route handler can deadlock WebKit's request pipeline.
  const fixture=await request.get('http://127.0.0.1:4173/audio/neural/irina/lesson-01-opening.mp3');
  expect(fixture.ok()).toBe(true);
  const mp3=await fixture.body();
  let narrationRequests=0;

  await page.route('**/api/narration-status',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,studioConfigured:true,model:'gpt-4o-mini-tts',voice:'marin',version:'ru-teacher-marin-v1'})}));
  await page.route('**/api/narration',async route=>{
    narrationRequests+=1;
    // Deliberately delay the response: this reproduces real server TTS latency.
    await new Promise(resolve=>setTimeout(resolve,180));
    await route.fulfill({status:200,contentType:'audio/mpeg',body:mp3});
  });

  await page.goto('/');
  const lessonButton=page.getByRole('button',{name:/Открыть урок 5:/});
  await expect(lessonButton).toBeVisible();
  // Opening the lesson is not the media gesture under test; use a DOM click so this
  // setup action cannot consume WebKit's click/navigation bookkeeping.
  await lessonButton.evaluate((button:HTMLButtonElement)=>button.click());
  await expect(page.locator('.lesson-opening-start')).toBeVisible();

  // This click remains a real Playwright user gesture. Studio audio only passes this
  // test if WebKit accepts playback after the asynchronous narration response arrives.
  const narrator=page.locator('.voice-narrator > button').first();
  await narrator.click();
  await expect.poll(()=>narrationRequests,{timeout:5_000}).toBe(1);
  await page.waitForTimeout(900);

  const systemSpeech=await page.evaluate(()=>(window as unknown as {__realAudioAudit:{systemSpeech:number}}).__realAudioAudit.systemSpeech);
  expect(systemSpeech).toBe(0);
});
