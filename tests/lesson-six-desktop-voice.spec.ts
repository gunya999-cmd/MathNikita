import { expect,test,type Locator,type Page } from '@playwright/test';
import { extendedPracticeByLesson } from '../src/data/extendedPracticeData';
import { practiceNarrationText } from '../src/practiceNarration';
import { studioNarrationText } from '../src/studioVoice';

type NarrationRequest={id:string;text:string;version:string};

const mainResults={'l6-a1':true,'l6-a2':true,'l6-a3':true,'l6-a4':true,'l6-a5':true,'l6-p1':true,'l6-p2':true,'l6-p3':true,'l6-p4':true,'l6-p5':true,'l6-p6':true,'l6-q1':true,'l6-q2':true,'l6-q3':true,'l6-q4':true,'l6-q5':true,'l6-star':true};
const mainPracticeStages=[
  {index:10,id:'l6-endpoints',activity:'l6-p1'},
  {index:11,id:'l6-whole',activity:'l6-p2'},
  {index:12,id:'l6-part',activity:'l6-p3'},
  {index:13,id:'l6-convert',activity:'l6-p4'},
  {index:14,id:'l6-equal',activity:'l6-p5'},
  {index:15,id:'l6-build-order',activity:'l6-p6'},
];

async function domClick(locator:Locator){await expect(locator).toBeVisible({timeout:5_000});await locator.evaluate((element:HTMLElement)=>element.click())}
async function openLessonSix(page:Page){await domClick(page.getByRole('button',{name:/Открыть урок 6:/}));await domClick(page.locator('.lesson-opening-start'))}
async function installVoiceMocks(page:Page){
  await page.addInitScript(()=>{
    const audit={systemSpeech:0,audioPlays:0};
    const voice={name:'Desktop Russian',lang:'ru-RU',voiceURI:'desktop-ru',localService:true,default:true};
    class MockUtterance{lang='';voice:typeof voice|null=null;rate=1;pitch=1;volume=1;onend:(()=>void)|null=null;onerror:(()=>void)|null=null;constructor(public text=''){} }
    const synthesis={getVoices:()=>[voice],speak:()=>{audit.systemSpeech+=1},cancel:()=>undefined,pause:()=>undefined,resume:()=>undefined,addEventListener:()=>undefined,removeEventListener:()=>undefined,get speaking(){return false},get pending(){return false},get paused(){return false}};
    class MockAudio{src='';preload='';playbackRate=1;currentTime=0;onended:(()=>void)|null=null;onerror:(()=>void)|null=null;constructor(source=''){this.src=source}pause(){}play(){audit.audioPlays+=1;window.setTimeout(()=>this.onended?.(),120);return Promise.resolve()}}
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
async function audioPlays(page:Page){return page.evaluate(()=>(window as unknown as {__lessonSixDesktopVoiceAudit:{audioPlays:number}}).__lessonSixDesktopVoiceAudit.audioPlays)}
async function expectWarmAndInstant(page:Page,requests:NarrationRequest[],button:Locator,id:string){
  await expect.poll(()=>requests.filter(item=>item.id===id).length,{timeout:6_000}).toBe(1);
  await page.waitForTimeout(150);
  const playsBefore=await audioPlays(page);const callsBefore=requests.filter(item=>item.id===id).length;
  await domClick(button);
  await expect.poll(()=>audioPlays(page),{timeout:700}).toBeGreaterThan(playsBefore);
  await page.waitForTimeout(150);
  expect(requests.filter(item=>item.id===id).length).toBe(callsBefore);
}
async function expectOnDemandThenCached(page:Page,requests:NarrationRequest[],button:Locator,id:string){
  expect(requests.filter(item=>item.id===id).length).toBe(0);
  const firstPlays=await audioPlays(page);await domClick(button);
  await expect.poll(()=>requests.filter(item=>item.id===id).length,{timeout:2_000}).toBe(1);
  await expect.poll(()=>audioPlays(page),{timeout:2_000}).toBeGreaterThan(firstPlays);
  await page.waitForTimeout(180);
  const callsAfterFirst=requests.filter(item=>item.id===id).length;const secondPlays=await audioPlays(page);await domClick(button);
  await expect.poll(()=>audioPlays(page),{timeout:700}).toBeGreaterThan(secondPlays);
  expect(requests.filter(item=>item.id===id).length).toBe(callsAfterFirst);
}
async function setMainStage(page:Page,index:number){
  await page.evaluate(({index})=>{
    localStorage.setItem('mathnikita-selected-lesson','6');
    localStorage.setItem('mathnikita-lesson-6-progress-v2',JSON.stringify({version:2,stageIndex:index,responses:{},orders:{},checked:{},results:{}}));
    localStorage.setItem('mathnikita:lesson-6-revision-v2-migrated','1');
    localStorage.setItem('mathnikita:lesson-6-practice-v3-migrated','1');
  },{index});
}
async function setMandatoryPracticeIndex(page:Page,index:number){
  await page.evaluate(({index,results})=>{
    localStorage.setItem('mathnikita-selected-lesson','6');
    localStorage.setItem('mathnikita-lesson-6-progress-v2',JSON.stringify({version:2,stageIndex:23,responses:{},orders:{},checked:{},results}));
    localStorage.setItem('mathnikita:lesson-6-revision-v2-migrated','1');
    localStorage.setItem('mathnikita:lesson-6-practice-v3-migrated','1');
    localStorage.setItem('mathnikita:extended-practice:6:v3',String(index));
    localStorage.removeItem('mathnikita:reflection:6');localStorage.removeItem('mathnikita:lesson-complete:6');
  },{index,results:mainResults});
}

test('lesson 6 desktop CatMentor warms only useful audio and caches manual actions on demand',async({page})=>{
  test.setTimeout(40_000);const requests:NarrationRequest[]=[];await installVoiceMocks(page);await routeNarration(page,requests);
  await page.goto('/',{waitUntil:'domcontentloaded',timeout:10_000});await openLessonSix(page);await expect(page.locator('[data-stage-id="l6-story"]')).toBeVisible();
  const collapsed=page.locator('.cat-mentor-collapsed');if(await collapsed.isVisible().catch(()=>false))await domClick(collapsed);
  const actions=page.locator('.cat-mentor-actions');
  await expectWarmAndInstant(page,requests,actions.getByRole('button').filter({hasText:'Подсказка'}),'mentor-l6-intro-hint');
  await expectOnDemandThenCached(page,requests,actions.getByRole('button').filter({hasText:'Объясни иначе'}),'mentor-l6-intro-different');
  await expectOnDemandThenCached(page,requests,actions.getByRole('button').filter({hasText:'Дай пример'}),'mentor-l6-intro-example');
  await expectOnDemandThenCached(page,requests,actions.getByRole('button').filter({hasText:'Почему так?'}),'mentor-l6-intro-why');
  const audit=await page.evaluate(()=>(window as unknown as {__lessonSixDesktopVoiceAudit:{systemSpeech:number}}).__lessonSixDesktopVoiceAudit);expect(audit.systemSpeech).toBe(0);
});

test('lesson 6 desktop mandatory practice warms hint only and caches on-demand Pythagoras actions',async({page})=>{
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
  await page.waitForTimeout(500);
  expect(requests.filter(item=>item.id==='mentor-practice-6-l6-source-47-status').length).toBe(0);
  const practiceActions=task.locator('.practice-pythagoras-actions');
  await expectWarmAndInstant(page,requests,practiceActions.getByRole('button').filter({hasText:'Подсказка'}),'mentor-practice-6-l6-source-47-hint');
  await expectOnDemandThenCached(page,requests,practiceActions.getByRole('button').filter({hasText:'Объясни иначе'}),'mentor-practice-6-l6-source-47-different');
  await expectOnDemandThenCached(page,requests,practiceActions.getByRole('button').filter({hasText:'Дай пример'}),'mentor-practice-6-l6-source-47-example');
  await expectOnDemandThenCached(page,requests,practiceActions.getByRole('button').filter({hasText:'Почему так?'}),'mentor-practice-6-l6-source-47-why');
  const narratorPlaysBefore=await audioPlays(page);const narratorCalls=requests.filter(item=>item.id==='lesson-06-practice-l6-source-47').length;
  const voiceButton=task.locator('.extended-practice-voice button');await expect(voiceButton).toContainText('▶ Озвучить задание',{timeout:1_500});
  await domClick(voiceButton);await expect.poll(()=>audioPlays(page),{timeout:700}).toBeGreaterThan(narratorPlaysBefore);expect(requests.filter(item=>item.id==='lesson-06-practice-l6-source-47').length).toBe(narratorCalls);
  const audit=await page.evaluate(()=>(window as unknown as {__lessonSixDesktopVoiceAudit:{systemSpeech:number}}).__lessonSixDesktopVoiceAudit);expect(audit.systemSpeech).toBe(0);
});

test('lesson 6 desktop narrates all 6 practice stages from a warmed Sulafat clip',async({page})=>{
  test.setTimeout(70_000);const requests:NarrationRequest[]=[];await installVoiceMocks(page);await routeNarration(page,requests);await page.goto('/',{waitUntil:'domcontentloaded',timeout:10_000});
  for(const stage of mainPracticeStages){
    requests.length=0;await setMainStage(page,stage.index);await page.reload({waitUntil:'domcontentloaded'});await openLessonSix(page);
    const scope=page.locator(`[data-stage-id="${stage.id}"]`);await expect(scope).toBeVisible({timeout:6_000});const id=`lesson-06-stage-${stage.id}`;
    await expect.poll(()=>requests.filter(item=>item.id===id).length,{timeout:6_000}).toBe(1);const narration=requests.find(item=>item.id===id)!;expect(narration.version).toBe('ru-teacher-gemini-sulafat-v2');expect(narration.text.length).toBeGreaterThan(25);expect(narration.text).toContain(studioNarrationText(await scope.locator('.activity-area h3').innerText()));
    await page.waitForTimeout(150);const playsBefore=await audioPlays(page);const callsBefore=requests.filter(item=>item.id===id).length;
    await domClick(page.locator('.voice-narrator > button').first());await expect.poll(()=>audioPlays(page),{timeout:700}).toBeGreaterThan(playsBefore);expect(requests.filter(item=>item.id===id).length).toBe(callsBefore);
  }
  const audit=await page.evaluate(()=>(window as unknown as {__lessonSixDesktopVoiceAudit:{systemSpeech:number}}).__lessonSixDesktopVoiceAudit);expect(audit.systemSpeech).toBe(0);
});

test('lesson 6 desktop auto-narrates all 20 mandatory practice tasks with one shared TTS request each',async({page})=>{
  test.setTimeout(110_000);const requests:NarrationRequest[]=[];const practice=extendedPracticeByLesson[6];await installVoiceMocks(page);await routeNarration(page,requests);await page.goto('/',{waitUntil:'domcontentloaded',timeout:10_000});
  for(let index=0;index<practice.tasks.length;index+=1){
    const taskData=practice.tasks[index];requests.length=0;await setMandatoryPracticeIndex(page,index);await page.reload({waitUntil:'domcontentloaded'});await openLessonSix(page);
    const task=page.locator(`[data-practice-task="${taskData.id}"]`);await expect(task).toBeVisible({timeout:7_000});const id=`lesson-06-practice-${taskData.id}`;
    await expect.poll(()=>requests.filter(item=>item.id===id).length,{timeout:6_000}).toBe(1);const narration=requests.find(item=>item.id===id)!;expect(narration.version).toBe('ru-teacher-gemini-sulafat-v2');expect(narration.text).toBe(studioNarrationText(practiceNarrationText(taskData,index,practice.tasks.length)));
    const voiceButton=task.locator('.extended-practice-voice button');
    await expect(voiceButton,`task ${taskData.id} must enter auto-speaking state`).toContainText('■ Остановить',{timeout:2_500});
    await expect(voiceButton,`task ${taskData.id} must return to replay state`).toContainText('▶ Озвучить задание',{timeout:2_500});
    const callsBefore=requests.filter(item=>item.id===id).length;const playsBefore=await audioPlays(page);
    await domClick(voiceButton);await expect.poll(()=>audioPlays(page),{timeout:1_000,message:`manual replay must start for ${taskData.id}`}).toBeGreaterThan(playsBefore);await page.waitForTimeout(150);expect(requests.filter(item=>item.id===id).length).toBe(callsBefore);
  }
  const audit=await page.evaluate(()=>(window as unknown as {__lessonSixDesktopVoiceAudit:{systemSpeech:number}}).__lessonSixDesktopVoiceAudit);expect(audit.systemSpeech).toBe(0);
});
