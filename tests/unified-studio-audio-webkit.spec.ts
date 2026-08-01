import { expect,test } from '@playwright/test';

test('iPad WebKit plays asynchronously fetched studio audio without falling back to device speech',async({page})=>{
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

  await page.route('**/api/narration-status',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,studioConfigured:true,model:'gpt-4o-mini-tts',voice:'marin',version:'ru-teacher-marin-v1'})}));
  await page.route('**/api/narration',async route=>{
    // Deliberately delay the response: this reproduces the real server-TTS path where
    // playback starts after the original click handler has already awaited network I/O.
    await new Promise(resolve=>setTimeout(resolve,180));
    const fixture=await page.request.get('/audio/neural/irina/lesson-01-opening.mp3');
    await route.fulfill({status:200,contentType:'audio/mpeg',body:await fixture.body()});
  });

  await page.goto('/');
  await page.getByRole('button',{name:/Открыть урок 5:/}).click();
  const narrator=page.locator('.voice-narrator > button').first();
  await narrator.click();

  // If WebKit rejects delayed HTMLAudio.play(), VoiceNarrator falls back to speechSynthesis.
  // A real successful media start therefore means the fallback counter stays at zero.
  await page.waitForTimeout(900);
  const systemSpeech=await page.evaluate(()=>(window as unknown as {__realAudioAudit:{systemSpeech:number}}).__realAudioAudit.systemSpeech);
  expect(systemSpeech).toBe(0);
});
