import { expect,test,type Locator,type Page } from '@playwright/test';

type NarrationRequest={id:string;text:string;version:string};

async function domClick(locator:Locator){
  await expect(locator).toBeVisible({timeout:5_000});
  await locator.evaluate((element:HTMLElement)=>element.click());
}

async function touchTap(page:Page,locator:Locator){
  await expect(locator).toBeVisible({timeout:5_000});
  const box=await locator.boundingBox();
  expect(box).not.toBeNull();
  await page.touchscreen.tap(box!.x+box!.width/2,box!.y+box!.height/2);
}

async function installStudioMocks(page:Page){
  await page.addInitScript(()=>{
    const audit={systemSpeech:0,audioPlays:0};
    const voice={name:'Milena Enhanced',lang:'ru-RU',voiceURI:'ru-enhanced',localService:true,default:true};
    class MockUtterance{lang='';voice:typeof voice|null=null;rate=1;pitch=1;volume=1;onend:(()=>void)|null=null;onerror:(()=>void)|null=null;constructor(public text=''){} }
    const synthesis={getVoices:()=>[voice],speak:()=>{audit.systemSpeech+=1},cancel:()=>undefined,pause:()=>undefined,resume:()=>undefined,addEventListener:()=>undefined,removeEventListener:()=>undefined,get speaking(){return false},get pending(){return false},get paused(){return false}};
    class MockAudio{
      src='';preload='';playbackRate=1;currentTime=0;onended:(()=>void)|null=null;onerror:(()=>void)|null=null;
      constructor(source=''){this.src=source}
      pause(){}
      play(){audit.audioPlays+=1;window.setTimeout(()=>this.onended?.(),10);return Promise.resolve()}
    }
    Object.defineProperty(window,'SpeechSynthesisUtterance',{configurable:true,writable:true,value:MockUtterance});
    Object.defineProperty(window,'speechSynthesis',{configurable:true,value:synthesis});
    Object.defineProperty(window,'Audio',{configurable:true,writable:true,value:MockAudio});
    (window as unknown as {__lessonFiveMarinAudit:typeof audit}).__lessonFiveMarinAudit=audit;
    localStorage.setItem('mathnikita-voice-settings-v4',JSON.stringify({engine:'studio',voiceURI:'ru-enhanced',rate:.94}));
  });
}

test('lesson 5 opening and first stage use Marin on iPad WebKit',async({page})=>{
  test.setTimeout(45_000);
  const requests:NarrationRequest[]=[];
  await installStudioMocks(page);
  await page.route('**/api/narration-status',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,studioConfigured:true,model:'gpt-4o-mini-tts',voice:'marin',version:'ru-teacher-marin-v1'})}));
  await page.route('**/api/narration',async route=>{
    requests.push(route.request().postDataJSON() as NarrationRequest);
    await route.fulfill({status:200,contentType:'audio/mpeg',body:'ID3-mock-audio'});
  });

  console.log('[lesson5-marin] navigate');
  await page.goto('/',{waitUntil:'domcontentloaded',timeout:10_000});
  await domClick(page.getByRole('button',{name:/Открыть урок 5:/}));

  console.log('[lesson5-marin] opening');
  const narrator=page.locator('.voice-narrator > button').first();
  await expect(narrator).toContainText('Слушать · AI',{timeout:5_000});
  await expect.poll(()=>requests.some(item=>item.id==='lesson-05-opening'),{timeout:5_000}).toBe(true);
  const opening=requests.find(item=>item.id==='lesson-05-opening')!;
  expect(opening.version).toBe('ru-teacher-marin-v1');
  expect(opening.text).toContain('Десятичная запись');

  console.log('[lesson5-marin] play opening');
  await touchTap(page,narrator);
  await expect.poll(async()=>page.evaluate(()=>(window as unknown as {__lessonFiveMarinAudit:{audioPlays:number}}).__lessonFiveMarinAudit.audioPlays),{timeout:5_000}).toBeGreaterThan(0);

  console.log('[lesson5-marin] first stage');
  await domClick(page.locator('.lesson-opening-start'));
  await expect(page.locator('[data-stage-id="l5-story"]')).toBeVisible({timeout:5_000});
  await expect.poll(()=>requests.some(item=>item.id==='lesson-05-stage-l5-story'),{timeout:5_000}).toBe(true);

  const audit=await page.evaluate(()=>(window as unknown as {__lessonFiveMarinAudit:{systemSpeech:number;audioPlays:number}}).__lessonFiveMarinAudit);
  expect(audit.systemSpeech).toBe(0);
  expect(audit.audioPlays).toBeGreaterThan(0);
});
