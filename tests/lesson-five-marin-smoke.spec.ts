import { expect,test,type Locator,type Page } from '@playwright/test';

type NarrationRequest={id:string;text:string;version:string};

async function domClick(locator:Locator){await expect(locator).toBeVisible({timeout:5_000});await locator.evaluate((element:HTMLElement)=>element.click())}
async function startLessonFromDom(page:Page){const clicked=await page.evaluate(()=>{const button=document.querySelector<HTMLButtonElement>('.lesson-opening-start');if(!button)return false;button.click();return true});expect(clicked).toBe(true)}
async function installStudioMocks(page:Page){
  await page.addInitScript(()=>{
    const audit={systemSpeech:0,audioPlays:0};
    const voice={name:'Milena Enhanced',lang:'ru-RU',voiceURI:'ru-enhanced',localService:true,default:true};
    class MockUtterance{lang='';voice:typeof voice|null=null;rate=1;pitch=1;volume=1;onend:(()=>void)|null=null;onerror:(()=>void)|null=null;constructor(public text=''){} }
    const synthesis={getVoices:()=>[voice],speak:()=>{audit.systemSpeech+=1},cancel:()=>undefined,pause:()=>undefined,resume:()=>undefined,addEventListener:()=>undefined,removeEventListener:()=>undefined,get speaking(){return false},get pending(){return false},get paused(){return false}};
    class MockAudio{src='';preload='';playbackRate=1;currentTime=0;onended:(()=>void)|null=null;onerror:(()=>void)|null=null;constructor(source=''){this.src=source}pause(){}play(){audit.audioPlays+=1;window.setTimeout(()=>this.onended?.(),80);return Promise.resolve()}}
    Object.defineProperty(window,'SpeechSynthesisUtterance',{configurable:true,writable:true,value:MockUtterance});
    Object.defineProperty(window,'speechSynthesis',{configurable:true,value:synthesis});
    Object.defineProperty(window,'Audio',{configurable:true,writable:true,value:MockAudio});
    (window as unknown as {__lessonFiveVoiceAudit:typeof audit}).__lessonFiveVoiceAudit=audit;
    localStorage.setItem('mathnikita-voice-settings-v4',JSON.stringify({engine:'studio',voiceURI:'ru-enhanced',rate:.94}));
    localStorage.setItem('mathnikita-mentor-auto-guide','false');
  });
}
async function routeStudioStatus(page:Page){await page.route('**/api/narration-status',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,studioConfigured:true,provider:'gemini',model:'gemini-2.5-flash-preview-tts',voice:'Sulafat',version:'ru-teacher-gemini-sulafat-v2'})}))}
async function audioPlays(page:Page){return page.evaluate(()=>(window as unknown as {__lessonFiveVoiceAudit:{audioPlays:number}}).__lessonFiveVoiceAudit.audioPlays)}
async function expectOnDemandThenCached(page:Page,requests:NarrationRequest[],button:Locator,id:string){
  expect(requests.filter(item=>item.id===id).length).toBe(0);
  const firstPlays=await audioPlays(page);await domClick(button);
  await expect.poll(()=>requests.filter(item=>item.id===id).length,{timeout:2_000}).toBe(1);
  await expect.poll(()=>audioPlays(page),{timeout:2_000}).toBeGreaterThan(firstPlays);
  await page.waitForTimeout(140);
  const calls=requests.filter(item=>item.id===id).length;const secondPlays=await audioPlays(page);await domClick(button);
  await expect.poll(()=>audioPlays(page),{timeout:700}).toBeGreaterThan(secondPlays);
  expect(requests.filter(item=>item.id===id).length).toBe(calls);
}

test('lesson 5 opening is on-demand and first stage auto-uses unified AI voice on iPad WebKit',async({page})=>{
  test.setTimeout(35_000);const requests:NarrationRequest[]=[];await installStudioMocks(page);await routeStudioStatus(page);
  await page.route('**/api/narration',async route=>{requests.push(route.request().postDataJSON() as NarrationRequest);await route.fulfill({status:200,contentType:'audio/wav',body:'RIFF-mock-audio'})});
  await page.goto('/',{waitUntil:'domcontentloaded',timeout:10_000});await domClick(page.getByRole('button',{name:/Открыть урок 5:/}));
  const narrator=page.locator('.voice-narrator > button').first();await expect(narrator).toContainText('Слушать · AI',{timeout:5_000});
  await page.waitForTimeout(400);expect(requests.some(item=>item.id==='lesson-05-opening')).toBe(false);
  await domClick(narrator);await expect.poll(()=>requests.some(item=>item.id==='lesson-05-opening'),{timeout:5_000}).toBe(true);
  const opening=requests.find(item=>item.id==='lesson-05-opening')!;expect(opening.version).toBe('ru-teacher-gemini-sulafat-v2');expect(opening.text).toContain('Десятичная запись');
  await expect(narrator).toContainText('Слушать · AI',{timeout:2_000});
  await startLessonFromDom(page);await expect(page.locator('[data-stage-id="l5-story"]')).toBeVisible({timeout:5_000});await expect.poll(()=>requests.some(item=>item.id==='lesson-05-stage-l5-story'),{timeout:5_000}).toBe(true);
  const stage=requests.find(item=>item.id==='lesson-05-stage-l5-story')!;expect(stage.version).toBe('ru-teacher-gemini-sulafat-v2');expect(stage.text).toMatch(/[А-Яа-яЁё]/);
  const audit=await page.evaluate(()=>(window as unknown as {__lessonFiveVoiceAudit:{systemSpeech:number}}).__lessonFiveVoiceAudit);expect(audit.systemSpeech).toBe(0);
});

test('lesson 5 CatMentor generates every manual Sulafat action on demand and caches it',async({page})=>{
  test.setTimeout(35_000);const requests:NarrationRequest[]=[];await installStudioMocks(page);await routeStudioStatus(page);
  await page.route('**/api/narration',async route=>{requests.push(route.request().postDataJSON() as NarrationRequest);await new Promise(resolve=>setTimeout(resolve,80));await route.fulfill({status:200,contentType:'audio/wav',body:'RIFF-mock-audio'})});
  await page.goto('/',{waitUntil:'domcontentloaded',timeout:10_000});await domClick(page.getByRole('button',{name:/Открыть урок 5:/}));await startLessonFromDom(page);await expect(page.locator('[data-stage-id="l5-story"]')).toBeVisible({timeout:5_000});
  const collapsed=page.locator('.cat-mentor-collapsed');if(await collapsed.isVisible().catch(()=>false))await domClick(collapsed);
  await page.waitForTimeout(500);expect(requests.filter(item=>item.id.startsWith('mentor-l5-intro-')).length).toBe(0);
  const actions=page.locator('.cat-mentor-actions');
  await expectOnDemandThenCached(page,requests,actions.getByRole('button',{name:/Подсказка/}),'mentor-l5-intro-hint');
  await expectOnDemandThenCached(page,requests,actions.getByRole('button',{name:/Объясни иначе/}),'mentor-l5-intro-different');
  await expectOnDemandThenCached(page,requests,actions.getByRole('button',{name:/Дай пример/}),'mentor-l5-intro-example');
  await expectOnDemandThenCached(page,requests,actions.getByRole('button',{name:/Почему так\?/}),'mentor-l5-intro-why');
  const audit=await page.evaluate(()=>(window as unknown as {__lessonFiveVoiceAudit:{systemSpeech:number}}).__lessonFiveVoiceAudit);expect(audit.systemSpeech).toBe(0);
});

test('lesson 5 never substitutes system speech when Sulafat fails',async({page})=>{
  test.setTimeout(35_000);await installStudioMocks(page);await routeStudioStatus(page);
  await page.route('**/api/narration',route=>route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({error:'temporary studio failure'})}));
  await page.goto('/',{waitUntil:'domcontentloaded',timeout:10_000});await domClick(page.getByRole('button',{name:/Открыть урок 5:/}));
  const narrator=page.locator('.voice-narrator > button').first();await domClick(narrator);await expect(narrator).toContainText('Повторить · AI',{timeout:5_000});
  let systemSpeech=await page.evaluate(()=>(window as unknown as {__lessonFiveVoiceAudit:{systemSpeech:number}}).__lessonFiveVoiceAudit.systemSpeech);expect(systemSpeech).toBe(0);
  await startLessonFromDom(page);await expect(page.locator('[data-stage-id="l5-story"]')).toBeVisible({timeout:5_000});
  const collapsed=page.locator('.cat-mentor-collapsed');if(await collapsed.isVisible().catch(()=>false))await domClick(collapsed);
  const mentor=page.locator('.cat-mentor-speak');await domClick(mentor);
  await expect(page.locator('.cat-mentor-voice-row small')).toContainText('Sulafat временно недоступен',{timeout:5_000});
  systemSpeech=await page.evaluate(()=>(window as unknown as {__lessonFiveVoiceAudit:{systemSpeech:number}}).__lessonFiveVoiceAudit.systemSpeech);expect(systemSpeech).toBe(0);
});

test('lesson 5 voice settings can always be dismissed',async({page})=>{
  await installStudioMocks(page);await routeStudioStatus(page);await page.route('**/api/narration',route=>route.fulfill({status:200,contentType:'audio/wav',body:'RIFF-mock-audio'}));
  await page.goto('/',{waitUntil:'domcontentloaded',timeout:10_000});await domClick(page.getByRole('button',{name:/Открыть урок 5:/}));
  const gear=page.locator('.voice-settings-button');const dialog=page.getByRole('dialog',{name:'Настройки голоса'});
  await domClick(gear);await expect(dialog).toBeVisible();await domClick(page.locator('.voice-settings-close'));await expect(dialog).toBeHidden();
  await domClick(gear);await expect(dialog).toBeVisible();await page.keyboard.press('Escape');await expect(dialog).toBeHidden();
  await domClick(gear);await expect(dialog).toBeVisible();
  await page.locator('.lesson-opening-copy h1').evaluate(element=>element.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,pointerType:'touch'})));
  await expect(dialog).toBeHidden();
});