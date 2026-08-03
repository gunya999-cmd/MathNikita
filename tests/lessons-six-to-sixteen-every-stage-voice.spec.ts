import { expect,test,type Page } from '@playwright/test';
import { lessonSixStages } from '../src/SegmentLengthPlayer';
import { lessonSevenStages } from '../src/SegmentLengthPracticePlayer';
import { lessonEightStages } from '../src/PolylineLessonPlayer';
import { lessonNineStages } from '../src/GeometrySummaryPlayer';
import { lessonTenStages } from '../src/PlaneLineRayPlayer';
import { lessonElevenStages } from '../src/PlaneLineRayPracticePlayer';
import { lessonTwelveStages } from '../src/PlaneLineRaySummaryPlayer';
import { lessonThirteenStages } from '../src/ScaleCoordinateRayPlayer';
import { lessonFourteenStages } from '../src/ScaleCoordinateRayPracticePlayer';
import { lessonFifteenStages } from '../src/ScaleCoordinateRaySummaryPlayer';
import { lessonSixteenStages } from '../src/NaturalNumberComparisonPlayer';

type NarrationRequest={id:string;text:string;version:string};
type StageRef={id:string};

const stagesByLesson:Record<number,StageRef[]>={
  6:lessonSixStages,
  7:lessonSevenStages,
  8:lessonEightStages,
  9:lessonNineStages,
  10:lessonTenStages,
  11:lessonElevenStages,
  12:lessonTwelveStages,
  13:lessonThirteenStages,
  14:lessonFourteenStages,
  15:lessonFifteenStages,
  16:lessonSixteenStages,
};

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

async function playedIds(page:Page){
  return page.evaluate(()=>(window as unknown as {__everyStageVoiceAudit:{played:string[]}}).__everyStageVoiceAudit.played);
}

for(const lessonNumber of Object.keys(stagesByLesson).map(Number)){
  test(`lesson ${lessonNumber} actually plays Sulafat on every main stage`,async({page})=>{
    test.setTimeout(120_000);
    const requests:NarrationRequest[]=[];
    await installVoiceAudit(page);
    await routeNarration(page,requests);
    await openLesson(page,lessonNumber);

    const stages=stagesByLesson[lessonNumber];
    expect(stages.length).toBeGreaterThan(0);

    for(let stageIndex=0;stageIndex<stages.length;stageIndex+=1){
      const stage=stages[stageIndex];
      await page.evaluate(({lessonNumber,stageIndex})=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber,stageIndex}})),{lessonNumber,stageIndex});
      const scope=page.locator(`.lesson-runtime:not([hidden]) .interactive-stage[data-stage-id="${stage.id}"]`);
      await expect(scope).toBeVisible({timeout:5_000});

      const expectedId=`lesson-${String(lessonNumber).padStart(2,'0')}-stage-${stage.id}`;
      await expect.poll(()=>requests.some(item=>item.id===expectedId),{timeout:6_000,message:`No Sulafat request for lesson ${lessonNumber}, stage ${stage.id}`}).toBeTruthy();
      const narration=requests.find(item=>item.id===expectedId)!;
      expect(narration.version).toBe('ru-teacher-gemini-sulafat-v2');
      expect(narration.text.trim().length,`Empty narration text for lesson ${lessonNumber}, stage ${stage.id}`).toBeGreaterThan(15);

      const title=await scope.locator('.stage-copy h2').first().textContent().catch(()=>null);
      if(title?.trim())expect(narration.text).toContain(title.trim());

      await expect.poll(async()=>(await playedIds(page)).includes(expectedId),{timeout:6_000,message:`Sulafat was generated but Audio.play() never succeeded for lesson ${lessonNumber}, stage ${stage.id}`}).toBeTruthy();
    }
  });
}
