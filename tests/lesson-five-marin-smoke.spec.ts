import { expect,test,type Locator,type Page } from '@playwright/test';

type NarrationRequest={id:string;text:string;version:string};

async function domClick(locator:Locator){
  await expect(locator).toBeVisible({timeout:5_000});
  await locator.evaluate((element:HTMLElement)=>element.click());
}

async function startLessonFromDom(page:Page){
  const clicked=await page.evaluate(()=>{
    const button=document.querySelector<HTMLButtonElement>('.lesson-opening-start');
    if(!button)return false;
    button.click();
    return true;
  });
  expect(clicked).toBe(true);
}

async function installStudioMocks(page:Page){
  await page.addInitScript(()=>{
    const audit={systemSpeech:0};
    const voice={name:'Milena Enhanced',lang:'ru-RU',voiceURI:'ru-enhanced',localService:true,default:true};
    class MockUtterance{lang='';voice:typeof voice|null=null;rate=1;pitch=1;volume=1;onend:(()=>void)|null=null;onerror:(()=>void)|null=null;constructor(public text=''){} }
    const synthesis={getVoices:()=>[voice],speak:()=>{audit.systemSpeech+=1},cancel:()=>undefined,pause:()=>undefined,resume:()=>undefined,addEventListener:()=>undefined,removeEventListener:()=>undefined,get speaking(){return false},get pending(){return false},get paused(){return false}};
    Object.defineProperty(window,'SpeechSynthesisUtterance',{configurable:true,writable:true,value:MockUtterance});
    Object.defineProperty(window,'speechSynthesis',{configurable:true,value:synthesis});
    (window as unknown as {__lessonFiveMarinAudit:typeof audit}).__lessonFiveMarinAudit=audit;
    localStorage.setItem('mathnikita-voice-settings-v4',JSON.stringify({engine:'studio',voiceURI:'ru-enhanced',rate:.94}));
  });
}

test('lesson 5 opening and first stage prefetch Marin on iPad WebKit',async({page})=>{
  test.setTimeout(35_000);
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

  console.log('[lesson5-marin] opening prefetch');
  const narrator=page.locator('.voice-narrator > button').first();
  await expect(narrator).toContainText('Слушать · AI',{timeout:5_000});
  await expect.poll(()=>requests.some(item=>item.id==='lesson-05-opening'),{timeout:5_000}).toBe(true);
  const opening=requests.find(item=>item.id==='lesson-05-opening')!;
  expect(opening.version).toBe('ru-teacher-marin-v1');
  expect(opening.text).toContain('Десятичная запись');

  console.log('[lesson5-marin] first stage prefetch');
  await startLessonFromDom(page);
  await expect(page.locator('[data-stage-id="l5-story"]')).toBeVisible({timeout:5_000});
  await expect.poll(()=>requests.some(item=>item.id==='lesson-05-stage-l5-story'),{timeout:5_000}).toBe(true);
  const stage=requests.find(item=>item.id==='lesson-05-stage-l5-story')!;
  expect(stage.version).toBe('ru-teacher-marin-v1');
  expect(stage.text).toMatch(/[А-Яа-яЁё]/);

  const audit=await page.evaluate(()=>(window as unknown as {__lessonFiveMarinAudit:{systemSpeech:number}}).__lessonFiveMarinAudit);
  expect(audit.systemSpeech).toBe(0);
});
