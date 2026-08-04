import { expect,test,type Page } from '@playwright/test';

type NarrationRequest={id:string;text:string;version:string};
type RuntimeAudit={audioPlays:number};

async function installAudit(page:Page){
  await page.addInitScript(()=>{
    const audit:RuntimeAudit={audioPlays:0};
    class MockAudio{
      src='';preload='';playbackRate=1;currentTime=0;onended:(()=>void)|null=null;onerror:(()=>void)|null=null;timer:number|null=null;
      constructor(source=''){this.src=source}
      pause(){if(this.timer!==null){window.clearTimeout(this.timer);this.timer=null}}
      play(){this.pause();audit.audioPlays+=1;this.timer=window.setTimeout(()=>{this.timer=null;this.onended?.()},35);return Promise.resolve()}
    }
    Object.defineProperty(window,'Audio',{configurable:true,writable:true,value:MockAudio});
    (window as unknown as {__hardRuntimeAudit:RuntimeAudit}).__hardRuntimeAudit=audit;
    localStorage.setItem('mathnikita-voice-settings-v4',JSON.stringify({engine:'studio',rate:.94}));
    localStorage.setItem('mathnikita-mentor-auto-guide','false');
  });
}

async function routeNarration(page:Page,requests:NarrationRequest[]){
  await page.route('**/api/narration-status',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,studioConfigured:true,provider:'gemini',voice:'Sulafat'})}));
  await page.route('**/api/narration',async route=>{
    requests.push(route.request().postDataJSON() as NarrationRequest);
    await new Promise(resolve=>setTimeout(resolve,8));
    await route.fulfill({status:200,contentType:'audio/wav',body:'RIFF-hard-runtime-audit'});
  });
}

async function openLesson(page:Page,lessonNumber:number){
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await page.getByRole('button',{name:new RegExp(`Открыть урок ${lessonNumber}:`)}).click();
  await page.locator('.lesson-opening-start').click();
  await expect(page.locator('.lesson-runtime:not([hidden]) .interactive-stage[data-stage-id]')).toBeVisible();
}

async function totalStages(page:Page){
  const text=await page.locator('.lesson-runtime:not([hidden]) .stage-counter').innerText();
  const match=text.match(/Этап\s+\d+\s+из\s+(\d+)/i);
  if(!match)throw new Error(`Cannot read stage count from ${text}`);
  return Number(match[1]);
}

async function audioPlayCount(page:Page){
  return page.evaluate(()=>(window as unknown as {__hardRuntimeAudit:RuntimeAudit}).__hardRuntimeAudit.audioPlays);
}

const mentorActions=[
  {label:'↻ Объясни иначе',suffix:'different'},
  {label:'▣ Дай пример',suffix:'example'},
  {label:'✦ Подсказка',suffix:'hint'},
  {label:'? Почему так?',suffix:'why'},
] as const;

for(let lessonNumber=6;lessonNumber<=16;lessonNumber+=1){
  test(`lesson ${lessonNumber} has stable stages and all four Pythagoras actions really speak`,async({page})=>{
    test.setTimeout(180_000);
    const requests:NarrationRequest[]=[];
    const pageErrors:string[]=[];
    page.on('pageerror',error=>pageErrors.push(error.message));
    await installAudit(page);
    await routeNarration(page,requests);
    await openLesson(page,lessonNumber);

    const total=await totalStages(page);
    expect(total).toBeGreaterThan(0);
    const stageIds=new Set<string>();
    for(let stageIndex=0;stageIndex<total;stageIndex+=1){
      await page.evaluate(({lessonNumber,stageIndex})=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber,stageIndex}})),{lessonNumber,stageIndex});
      await expect(page.locator('.lesson-runtime:not([hidden]) .stage-counter')).toContainText(`Этап ${stageIndex+1} из ${total}`);
      const stage=page.locator('.lesson-runtime:not([hidden]) .interactive-stage[data-stage-id]');
      await expect(stage).toBeVisible();
      const stageId=await stage.getAttribute('data-stage-id');
      expect(stageId,`Lesson ${lessonNumber}, stage ${stageIndex+1} has no data-stage-id`).toBeTruthy();
      stageIds.add(stageId!);
    }
    expect(stageIds.size,`Lesson ${lessonNumber} reuses a stage id`).toBe(total);
    expect(pageErrors,`Runtime exception while traversing lesson ${lessonNumber}: ${pageErrors.join(' | ')}`).toEqual([]);

    await page.evaluate(()=>window.dispatchEvent(new CustomEvent('mathnikita-stop-narration')));
    await expect(page.locator('.extended-practice')).toBeVisible();
    await expect(page.locator('.reflection-completion-gate')).toContainText('Урок ещё не завершён');
    const taskId=await page.locator('.extended-practice[data-practice-task]').getAttribute('data-practice-task');
    expect(taskId).toBeTruthy();
    await expect(page.locator('.practice-pythagoras-actions button')).toHaveCount(4);
    await page.waitForTimeout(250);
    await page.evaluate(()=>window.dispatchEvent(new CustomEvent('mathnikita-stop-narration')));
    await page.waitForTimeout(60);

    for(const action of mentorActions){
      const before=await audioPlayCount(page);
      await page.locator('.practice-pythagoras-actions').getByRole('button',{name:action.label,exact:true}).click();
      await expect(page.locator('.practice-pythagoras-message')).not.toBeEmpty();
      await expect.poll(()=>audioPlayCount(page),{timeout:8_000,message:`Lesson ${lessonNumber}: ${action.label} did not reach Audio.play()`}).toBeGreaterThan(before);
      const expectedId=`mentor-practice-${lessonNumber}-${taskId}-${action.suffix}`;
      await expect.poll(()=>requests.some(item=>item.id===expectedId),{timeout:8_000,message:`Lesson ${lessonNumber}: no Sulafat request ${expectedId}`}).toBeTruthy();
      const request=requests.find(item=>item.id===expectedId)!;
      expect(request.version).toBe('ru-teacher-gemini-sulafat-v2');
      expect(request.text.trim().length).toBeGreaterThan(20);
      await page.waitForTimeout(80);
    }

    expect(pageErrors,`Runtime exception after Pythagoras actions in lesson ${lessonNumber}: ${pageErrors.join(' | ')}`).toEqual([]);
  });
}
