import { expect,test,type Page } from '@playwright/test';

type NarrationRequest={id:string;text:string;version:string};

async function installVoiceAudit(page:Page){
  await page.addInitScript(()=>{
    const audit={played:[] as string[],audioPlays:0};
    class MockAudio{
      src='';preload='';playbackRate=1;currentTime=0;onended:(()=>void)|null=null;onerror:(()=>void)|null=null;
      constructor(source=''){this.src=source}
      pause(){}
      play(){audit.audioPlays+=1;window.setTimeout(()=>this.onended?.(),12);return Promise.resolve()}
    }
    Object.defineProperty(window,'Audio',{configurable:true,writable:true,value:MockAudio});
    window.addEventListener('mathnikita-audio-played',event=>{
      const detail=(event as CustomEvent<{source?:string;narrationId?:string}>).detail;
      if(detail?.source==='narrator'&&detail.narrationId)audit.played.push(detail.narrationId);
    });
    (window as unknown as {__everyStageVoiceAudit:typeof audit}).__everyStageVoiceAudit=audit;
    localStorage.setItem('mathnikita-voice-settings-v4',JSON.stringify({engine:'studio',rate:.94}));
    localStorage.setItem('mathnikita-mentor-auto-guide','false');
  });
}

async function routeNarration(page:Page,requests:NarrationRequest[]){
  await page.route('**/api/narration-status',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,studioConfigured:true,provider:'gemini',voice:'Sulafat'})}));
  await page.route('**/api/narration',async route=>{
    requests.push(route.request().postDataJSON() as NarrationRequest);
    await new Promise(resolve=>setTimeout(resolve,8));
    await route.fulfill({status:200,contentType:'audio/wav',body:'RIFF-every-stage-voice'});
  });
}

async function openLesson(page:Page,lessonNumber:number){
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await page.getByRole('button',{name:new RegExp(`Открыть урок ${lessonNumber}:`)}).click();
  await page.locator('.lesson-opening-start').click();
  await expect(page.locator('.lesson-runtime:not([hidden]) .interactive-stage[data-stage-id]')).toBeVisible();
}

async function stageCount(page:Page){
  const text=await page.locator('.lesson-runtime:not([hidden]) .stage-counter').innerText();
  const match=text.match(/Этап\s+\d+\s+из\s+(\d+)/i);
  if(!match)throw new Error(`Cannot read stage count from: ${text}`);
  return Number(match[1]);
}

async function playedIds(page:Page){
  return page.evaluate(()=>(window as unknown as {__everyStageVoiceAudit:{played:string[]}}).__everyStageVoiceAudit.played);
}

for(let lessonNumber=6;lessonNumber<=16;lessonNumber+=1){
  test(`lesson ${lessonNumber} actually plays Sulafat on every main stage`,async({page})=>{
    test.setTimeout(120_000);
    const requests:NarrationRequest[]=[];
    await installVoiceAudit(page);
    await routeNarration(page,requests);
    await openLesson(page,lessonNumber);

    const total=await stageCount(page);
    expect(total).toBeGreaterThan(0);
    const seenStageIds=new Set<string>();

    for(let stageIndex=0;stageIndex<total;stageIndex+=1){
      await page.evaluate(({lessonNumber,stageIndex})=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber,stageIndex}})),{lessonNumber,stageIndex});
      await expect(page.locator('.lesson-runtime:not([hidden]) .stage-counter')).toContainText(`Этап ${stageIndex+1} из ${total}`,{timeout:5_000});
      const scope=page.locator('.lesson-runtime:not([hidden]) .interactive-stage[data-stage-id]');
      await expect(scope).toBeVisible({timeout:5_000});
      const stageId=await scope.getAttribute('data-stage-id');
      expect(stageId,`Missing data-stage-id in lesson ${lessonNumber}, stage ${stageIndex+1}`).toBeTruthy();
      seenStageIds.add(stageId!);

      const expectedId=`lesson-${String(lessonNumber).padStart(2,'0')}-stage-${stageId}`;
      await expect.poll(()=>requests.some(item=>item.id===expectedId),{timeout:6_000,message:`No Sulafat request for lesson ${lessonNumber}, stage ${stageId}`}).toBeTruthy();
      const narration=requests.find(item=>item.id===expectedId)!;
      expect(narration.version).toBe('ru-teacher-gemini-sulafat-v2');
      expect(narration.text.trim().length,`Empty narration text for lesson ${lessonNumber}, stage ${stageId}`).toBeGreaterThan(15);

      const title=await scope.locator('.stage-copy h2').first().textContent().catch(()=>null);
      if(title?.trim())expect(narration.text).toContain(title.trim());

      await expect.poll(async()=>(await playedIds(page)).includes(expectedId),{timeout:6_000,message:`Sulafat was generated but Audio.play() never succeeded for lesson ${lessonNumber}, stage ${stageId}`}).toBeTruthy();
    }

    expect(seenStageIds.size,`Lesson ${lessonNumber} did not expose a unique stage id for every stage`).toBe(total);
  });
}
