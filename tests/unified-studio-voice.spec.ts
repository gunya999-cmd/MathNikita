import { expect,test,type Locator,type Page } from '@playwright/test';

type NarrationRequest={id:string;text:string;version:string};

async function domClick(locator:Locator){
  await expect(locator).toBeVisible();
  await locator.evaluate((element:HTMLElement)=>element.click());
}

async function installAudioAudit(page:Page){
  await page.addInitScript(()=>{
    const audit={systemSpeech:0,audioPlays:[] as string[]};
    const voice={name:'Milena Enhanced',lang:'ru-RU',voiceURI:'ru-enhanced',localService:true,default:true};
    class MockUtterance{lang='';voice:typeof voice|null=null;rate=1;pitch=1;volume=1;onend:(()=>void)|null=null;onerror:(()=>void)|null=null;constructor(public text=''){} }
    const synthesis={getVoices:()=>[voice],speak:()=>{audit.systemSpeech+=1},cancel:()=>undefined,pause:()=>undefined,resume:()=>undefined,addEventListener:()=>undefined,removeEventListener:()=>undefined,get speaking(){return false},get pending(){return false},get paused(){return false}};
    class MockAudio{
      src='';preload='';playbackRate=1;currentTime=0;onended:(()=>void)|null=null;onerror:(()=>void)|null=null;
      constructor(source=''){this.src=source}
      pause(){}
      play(){audit.audioPlays.push(this.src);window.setTimeout(()=>this.onended?.(),20);return Promise.resolve()}
    }
    Object.defineProperty(window,'SpeechSynthesisUtterance',{configurable:true,writable:true,value:MockUtterance});
    Object.defineProperty(window,'speechSynthesis',{configurable:true,value:synthesis});
    Object.defineProperty(window,'Audio',{configurable:true,writable:true,value:MockAudio});
    (window as unknown as {__studioAudit:typeof audit}).__studioAudit=audit;
    localStorage.removeItem('mathnikita-voice-settings-v4');
    localStorage.setItem('mathnikita-voice-settings-v3',JSON.stringify({engine:'system',voiceURI:'ru-enhanced',rate:.94}));
  });
}

test('legacy devices migrate to one server AI voice for narrator and Pythagoras',async({page})=>{
  const requests:NarrationRequest[]=[];
  await installAudioAudit(page);
  await page.route('**/api/narration-status',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,studioConfigured:true,model:'gpt-4o-mini-tts',voice:'marin',version:'ru-teacher-marin-v1'})}));
  await page.route('**/api/narration',async route=>{
    requests.push(route.request().postDataJSON() as NarrationRequest);
    await route.fulfill({status:200,contentType:'audio/mpeg',body:'ID3-mock-audio'});
  });

  await page.goto('/');
  await domClick(page.getByRole('button',{name:/Открыть урок 5:/}));
  await expect(page.locator('.voice-ai-disclosure')).toHaveText('AI-голос');
  const narrator=page.locator('.voice-narrator > button').first();
  await expect(narrator).toContainText('Слушать · AI');
  await expect.poll(async()=>page.evaluate(()=>JSON.parse(localStorage.getItem('mathnikita-voice-settings-v4')??'{}').engine)).toBe('studio');

  await expect.poll(()=>requests.some(item=>item.id==='lesson-05-opening')).toBe(true);
  const openingRequest=requests.find(item=>item.id==='lesson-05-opening')!;
  expect(openingRequest.version).toBe('ru-teacher-marin-v1');
  expect(openingRequest.text).toContain('Десятичная запись');
  expect(openingRequest.text).toMatch(/[А-Яа-яЁё]/);

  await domClick(narrator);
  await expect.poll(async()=>page.evaluate(()=>(window as unknown as {__studioAudit:{audioPlays:string[]}}).__studioAudit.audioPlays.length)).toBeGreaterThanOrEqual(1);

  const mentor=page.locator('.cat-mentor-speak');
  await domClick(mentor);
  await expect.poll(()=>requests.some(item=>item.id==='mentor-opening-5-welcome')).toBe(true);

  await domClick(page.locator('.lesson-opening-start'));
  await expect(page.locator('[data-stage-id="l5-story"]')).toBeVisible();
  await expect.poll(()=>requests.some(item=>item.id==='lesson-05-stage-l5-story')).toBe(true);
  await domClick(page.locator('.voice-narrator > button').first());

  const audit=await page.evaluate(()=>(window as unknown as {__studioAudit:{systemSpeech:number;audioPlays:string[]}}).__studioAudit);
  expect(audit.systemSpeech).toBe(0);
  expect(audit.audioPlays.length).toBeGreaterThanOrEqual(3);
});
