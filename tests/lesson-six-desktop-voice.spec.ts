import { expect,test,type Locator,type Page } from '@playwright/test';

type NarrationRequest={id:string;text:string;version:string};

async function domClick(locator:Locator){await expect(locator).toBeVisible({timeout:5_000});await locator.evaluate((element:HTMLElement)=>element.click())}
async function openLessonSix(page:Page){await domClick(page.getByRole('button',{name:/Открыть урок 6:/}));await domClick(page.locator('.lesson-opening-start'))}
async function installVoiceMocks(page:Page){
  await page.addInitScript(()=>{
    const audit={systemSpeech:0,audioPlays:0};
    const voice={name:'Desktop Russian',lang:'ru-RU',voiceURI:'desktop-ru',localService:true,default:true};
    class MockUtterance{lang='';voice:typeof voice|null=null;rate=1;pitch=1;volume=1;onend:(()=>void)|null=null;onerror:(()=>void)|null=null;constructor(public text=''){} }
    const synthesis={getVoices:()=>[voice],speak:()=>{audit.systemSpeech+=1},cancel:()=>undefined,pause:()=>undefined,resume:()=>undefined,addEventListener:()=>undefined,removeEventListener:()=>undefined,get speaking(){return false},get pending(){return false},get paused(){return false}};
    class MockAudio{src='';preload='';playbackRate=1;currentTime=0;onended:(()=>void)|null=null;onerror:(()=>void)|null=null;constructor(source=''){this.src=source}pause(){}play(){audit.audioPlays+=1;window.setTimeout(()=>this.onended?.(),10);return Promise.resolve()}}
    Object.defineProperty(window,'SpeechSynthesisUtterance',{configurable:true,writable:true,value:MockUtterance});
    Object.defineProperty(window,'speechSynthesis',{configurable:true,value:synthesis});
    Object.defineProperty(window,'Audio',{configurable:true,writable:true,value:MockAudio});
    (window as unknown as {__lessonSixDesktopVoiceAudit:typeof audit}).__lessonSixDesktopVoiceAudit=audit;
    localStorage.setItem('mathnikita-voice-settings-v4',JSON.stringify({engine:'studio',voiceURI:'desktop-ru',rate:.94}));
    localStorage.setItem('mathnikita-mentor-auto-guide','false');
  });
}
async function routeNarration(page:Page,requests:NarrationRequest[]){
  await page.route('**/api/narration-status',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,studioConfigured:true,provider:'gemini',model:'gemini-2.5-flash-preview-tts',fallbackModel:'gemini-2.5-pro-preview-tts',voice:'Sulafat',version:'ru-teacher-gemini-sulafat-v2',automaticSystemFallback:false})}));
  await page.route('**/api/narration',async route=>{requests.push(route.request().postDataJSON() as NarrationRequest);await new Promise(resolve=>setTimeout(resolve,70));await route.fulfill({status:200,contentType:'audio/wav',body:'RIFF-desktop-mock'})});
}
async function expectWarmAndInstant(page:Page,requests:NarrationRequest[],button:Locator,id:string){
  await expect.poll(()=>requests.filter(item=>item.id===id).length,{timeout:6_000}).toBe(1);
  const playsBefore=await page.evaluate(()=>(window as unknown as {__lessonSixDesktopVoiceAudit:{audioPlays:number}}).__lessonSixDesktopVoiceAudit.audioPlays);
  const callsBefore=requests.filter(item=>item.id===id).length;
  await domClick(button);
  await expect.poll(async()=>page.evaluate(()=>(window as unknown as {__lessonSixDesktopVoiceAudit:{audioPlays:number}}).__lessonSixDesktopVoiceAudit.audioPlays),{timeout:700}).toBeGreaterThan(playsBefore);
  await page.waitForTimeout(100);
  expect(requests.filter(item=>item.id===id).length).toBe(callsBefore);
}

test('lesson 6 desktop CatMentor warms all manual Sulafat actions before clicks',async({page})=>{
  test.setTimeout(40_000);const requests:NarrationRequest[]=[];await installVoiceMocks(page);await routeNarration(page,requests);
  await page.goto('/',{waitUntil:'domcontentloaded',timeout:10_000});await openLessonSix(page);await expect(page.locator('[data-stage-id="l6-story"]')).toBeVisible();
  const collapsed=page.locator('.cat-mentor-collapsed');if(await collapsed.isVisible().catch(()=>false))await domClick(collapsed);
  const actions=page.locator('.cat-mentor-actions');
  await expectWarmAndInstant(page,requests,actions.getByRole('button').filter({hasText:'Подсказка'}),'mentor-l6-intro-hint');
  await expectWarmAndInstant(page,requests,actions.getByRole('button').filter({hasText:'Объясни иначе'}),'mentor-l6-intro-different');
  await expectWarmAndInstant(page,requests,actions.getByRole('button').filter({hasText:'Дай пример'}),'mentor-l6-intro-example');
  await expectWarmAndInstant(page,requests,actions.getByRole('button').filter({hasText:'Почему так?'}),'mentor-l6-intro-why');
  const audit=await page.evaluate(()=>(window as unknown as {__lessonSixDesktopVoiceAudit:{systemSpeech:number}}).__lessonSixDesktopVoiceAudit);expect(audit.systemSpeech).toBe(0);
});

test('lesson 6 desktop mandatory practice warms narrator and every Pythagoras action',async({page})=>{
  test.setTimeout(45_000);const requests:NarrationRequest[]=[];await installVoiceMocks(page);
  await page.addInitScript(()=>{
    const results={'l6-a1':true,'l6-a2':true,'l6-a3':true,'l6-a4':true,'l6-a5':true,'l6-p1':true,'l6-p2':true,'l6-p3':true,'l6-p4':true,'l6-p5':true,'l6-p6':true,'l6-q1':true,'l6-q2':true,'l6-q3':true,'l6-q4':true,'l6-q5':true,'l6-star':true};
    localStorage.setItem('mathnikita-lesson-6-progress-v2',JSON.stringify({version:2,stageIndex:23,responses:{},orders:{},checked:{},results}));
    localStorage.setItem('mathnikita:lesson-6-revision-v2-migrated','1');
    localStorage.setItem('mathnikita:lesson-6-practice-v3-migrated','1');
    localStorage.setItem('mathnikita:extended-practice:6:v3','18');
    localStorage.removeItem('mathnikita:reflection:6');localStorage.removeItem('mathnikita:lesson-complete:6');
  });
  await routeNarration(page,requests);await page.goto('/',{waitUntil:'domcontentloaded',timeout:10_000});await openLessonSix(page);
  const task=page.locator('[data-practice-task="l6-source-47"]');await expect(task).toBeVisible({timeout:8_000});
  await expect.poll(()=>requests.filter(item=>item.id==='lesson-06-practice-l6-source-47').length,{timeout:6_000}).toBe(1);
  const practiceActions=task.locator('.practice-pythagoras-actions');
  await expectWarmAndInstant(page,requests,practiceActions.getByRole('button').filter({hasText:'Подсказка'}),'mentor-practice-6-l6-source-47-hint');
  await expectWarmAndInstant(page,requests,practiceActions.getByRole('button').filter({hasText:'Объясни иначе'}),'mentor-practice-6-l6-source-47-different');
  await expectWarmAndInstant(page,requests,practiceActions.getByRole('button').filter({hasText:'Дай пример'}),'mentor-practice-6-l6-source-47-example');
  await expectWarmAndInstant(page,requests,practiceActions.getByRole('button').filter({hasText:'Почему так?'}),'mentor-practice-6-l6-source-47-why');
  const narratorPlaysBefore=await page.evaluate(()=>(window as unknown as {__lessonSixDesktopVoiceAudit:{audioPlays:number}}).__lessonSixDesktopVoiceAudit.audioPlays);
  const narratorCalls=requests.filter(item=>item.id==='lesson-06-practice-l6-source-47').length;await domClick(task.locator('.extended-practice-voice button'));await expect.poll(async()=>page.evaluate(()=>(window as unknown as {__lessonSixDesktopVoiceAudit:{audioPlays:number}}).__lessonSixDesktopVoiceAudit.audioPlays),{timeout:700}).toBeGreaterThan(narratorPlaysBefore);expect(requests.filter(item=>item.id==='lesson-06-practice-l6-source-47').length).toBe(narratorCalls);
  const audit=await page.evaluate(()=>(window as unknown as {__lessonSixDesktopVoiceAudit:{systemSpeech:number}}).__lessonSixDesktopVoiceAudit);expect(audit.systemSpeech).toBe(0);
});
