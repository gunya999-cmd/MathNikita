import { expect,test,type Locator,type Page } from '@playwright/test';

type NarrationRequest={id:string;text:string;version:string};

async function domClick(locator:Locator){await expect(locator).toBeVisible({timeout:5_000});await locator.evaluate((element:HTMLElement)=>element.click())}
async function installAudioMocks(page:Page){
  await page.addInitScript(()=>{
    const audit={systemSpeech:0,audioPlays:0};
    const voice={name:'Milena Enhanced',lang:'ru-RU',voiceURI:'ru-enhanced',localService:true,default:true};
    class MockUtterance{lang='';voice:typeof voice|null=null;rate=1;pitch=1;volume=1;onend:(()=>void)|null=null;onerror:(()=>void)|null=null;constructor(public text=''){} }
    const synthesis={getVoices:()=>[voice],speak:()=>{audit.systemSpeech+=1},cancel:()=>undefined,pause:()=>undefined,resume:()=>undefined,addEventListener:()=>undefined,removeEventListener:()=>undefined,get speaking(){return false},get pending(){return false},get paused(){return false}};
    class MockAudio{src='';preload='';playbackRate=1;currentTime=0;onended:(()=>void)|null=null;onerror:(()=>void)|null=null;constructor(source=''){this.src=source}pause(){}play(){audit.audioPlays+=1;window.setTimeout(()=>this.onended?.(),8);return Promise.resolve()}}
    Object.defineProperty(window,'SpeechSynthesisUtterance',{configurable:true,writable:true,value:MockUtterance});
    Object.defineProperty(window,'speechSynthesis',{configurable:true,value:synthesis});
    Object.defineProperty(window,'Audio',{configurable:true,writable:true,value:MockAudio});
    (window as unknown as {__practiceVoiceAudit:typeof audit}).__practiceVoiceAudit=audit;
    localStorage.setItem('mathnikita-voice-settings-v4',JSON.stringify({engine:'studio',voiceURI:'ru-enhanced',rate:.94}));
    localStorage.setItem('mathnikita-mentor-auto-guide','true');
  });
}
async function routeStudio(page:Page,requests:NarrationRequest[]){
  await page.route('**/api/narration-status',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,studioConfigured:true,provider:'gemini',model:'gemini-2.5-flash-preview-tts',fallbackModel:'gemini-2.5-pro-preview-tts',voice:'Sulafat',version:'ru-teacher-gemini-sulafat-v2'})}));
  await page.route('**/api/narration',async route=>{requests.push(route.request().postDataJSON() as NarrationRequest);await route.fulfill({status:200,contentType:'audio/wav',body:'RIFF-mock-practice-audio'})});
}

test('lesson 5 auto-narrates mandatory practice and Pythagoras voices contextual hints',async({page})=>{
  test.setTimeout(45_000);const requests:NarrationRequest[]=[];await installAudioMocks(page);await routeStudio(page,requests);
  await page.goto('/',{waitUntil:'domcontentloaded',timeout:10_000});
  await page.evaluate(()=>{
    localStorage.setItem('mathnikita-selected-lesson','5');
    localStorage.setItem('mathnikita-lesson-5-progress-v1',JSON.stringify({version:1,stageIndex:23,responses:{},orders:{},checked:{},results:{'l5-p1':true,'l5-p2':true,'l5-p3':true,'l5-p4':true,'l5-p5':true,'l5-p6':true,'l5-q1':true,'l5-q2':true,'l5-q3':true,'l5-q4':true,'l5-q5':true},completedAt:new Date().toISOString()}));
    localStorage.setItem('mathnikita:extended-practice:5:v2','18');
    localStorage.removeItem('mathnikita:lesson-complete:5');
    localStorage.removeItem('mathnikita:reflection:5');
  });
  await page.reload({waitUntil:'domcontentloaded'});await domClick(page.getByRole('button',{name:/Открыть урок 5:/}));await domClick(page.locator('.lesson-opening-start'));

  const task9=page.locator('[data-practice-task="l5-master-9"]');await expect(task9).toBeVisible({timeout:5_000});
  await expect(task9.locator('.extended-practice-voice')).toContainText('Автоозвучка практики · Sulafat');
  await expect(page.locator('.practice-pythagoras')).toBeVisible();await expect(page.locator('.cat-mentor-panel')).toBeHidden();
  await expect.poll(()=>requests.some(item=>item.id==='lesson-05-practice-l5-master-9'),{timeout:5_000}).toBe(true);
  await expect.poll(async()=>page.evaluate(()=>(window as unknown as {__practiceVoiceAudit:{audioPlays:number}}).__practiceVoiceAudit.audioPlays),{timeout:5_000}).toBeGreaterThan(0);

  await task9.getByLabel('Сколько километров вертолёт пролетает за 1 час?',{exact:true}).fill('180');
  await task9.getByLabel('Сколько километров он пролетит за 6 часов?',{exact:true}).fill('1080');
  await task9.getByLabel('Сколько километров он пролетит за 10 часов?',{exact:true}).fill('1800');
  await task9.getByLabel('За сколько часов он пролетит 1 440 км?',{exact:true}).fill('8');
  await domClick(task9.getByRole('button',{name:'Проверить'}));await expect(task9.locator('.extended-practice-feedback.is-correct')).toBeVisible();
  const playsBeforeNext=await page.evaluate(()=>(window as unknown as {__practiceVoiceAudit:{audioPlays:number}}).__practiceVoiceAudit.audioPlays);
  await domClick(task9.getByRole('button',{name:'Следующее задание →'}));

  const task10=page.locator('[data-practice-task="l5-master-10"]');await expect(task10).toBeVisible({timeout:5_000});
  await expect.poll(()=>requests.some(item=>item.id==='lesson-05-practice-l5-master-10'),{timeout:5_000}).toBe(true);
  await expect.poll(async()=>page.evaluate(()=>(window as unknown as {__practiceVoiceAudit:{audioPlays:number}}).__practiceVoiceAudit.audioPlays),{timeout:5_000}).toBeGreaterThan(playsBeforeNext);

  await task10.getByLabel('Следующее натуральное число',{exact:true}).fill('0');
  await task10.getByLabel('На сколько следующее натуральное число больше предыдущего?',{exact:true}).fill('0');
  await task10.getByLabel('Самое маленькое натуральное число',{exact:true}).fill('0');
  await task10.getByLabel('Существует ли наибольшее натуральное число?',{exact:true}).fill('да');
  const playsBeforeWrong=await page.evaluate(()=>(window as unknown as {__practiceVoiceAudit:{audioPlays:number}}).__practiceVoiceAudit.audioPlays);
  await domClick(task10.getByRole('button',{name:'Проверить'}));await expect(task10.locator('.extended-practice-feedback.is-wrong')).toBeVisible();
  const hint=(await task10.locator('.extended-practice-feedback.is-wrong span').textContent())?.trim()??'';expect(hint.length).toBeGreaterThan(20);
  const mentorMessage=task10.locator('.practice-pythagoras-message');await expect(mentorMessage).toContainText(hint);await expect(mentorMessage).not.toContainText('После 9 999 999 идёт 10 000 000');
  await expect.poll(()=>requests.some(item=>item.id==='mentor-practice-5-l5-master-10-status'),{timeout:5_000}).toBe(true);
  await expect.poll(async()=>page.evaluate(()=>(window as unknown as {__practiceVoiceAudit:{audioPlays:number}}).__practiceVoiceAudit.audioPlays),{timeout:5_000}).toBeGreaterThan(playsBeforeWrong);
  const audit=await page.evaluate(()=>(window as unknown as {__practiceVoiceAudit:{systemSpeech:number;audioPlays:number}}).__practiceVoiceAudit);expect(audit.systemSpeech).toBe(0);
});
