import {expect,test,type Page} from '@playwright/test';
import {extendedPracticeByLesson} from '../src/data/extendedPracticeData';
import {extendedPracticeSetResponseCount,type ExtendedPracticeTask} from '../src/data/extendedPracticeTypes';
import {extendedPracticeStorageKey} from '../src/extendedPracticeEngine';
import {practiceNarrationId} from '../src/practiceNarration';

type NarrationRequest={id:string;text:string;version:string};
type VoiceAudit={playedIds:string[];audioPlays:number};

const startLesson=Number(process.env.PRACTICE_START??1);
const endLesson=Number(process.env.PRACTICE_END??27);
const specialStageCounts:Record<number,number>={18:24,20:11,33:13,34:28,35:28,36:30,37:29,38:35,39:35,40:36,41:36,42:36,46:36,47:36,48:36,49:36,50:36,51:36,52:36,53:9,54:36,55:36,56:36,57:36,58:36,59:36,60:36,61:36,62:36};

async function installVoiceAudit(page:Page){
  await page.addInitScript(()=>{
    const audit:VoiceAudit={playedIds:[],audioPlays:0};
    const blobNarrationIds=new WeakMap<Blob,string>();
    const nativeFetch=window.fetch.bind(window);
    const nativeCreateObjectURL=URL.createObjectURL.bind(URL);
    let sequence=0;
    window.fetch=async(input:RequestInfo|URL,init?:RequestInit)=>{
      const url=typeof input==='string'?input:input instanceof URL?input.href:input.url;
      let narrationId='';
      if(url.includes('/api/narration')){
        let rawBody=init?.body;
        if(rawBody==null&&input instanceof Request){try{rawBody=await input.clone().text()}catch{}}
        if(typeof rawBody==='string'){try{narrationId=(JSON.parse(rawBody) as {id?:string}).id??''}catch{}}
      }
      const response=await nativeFetch(input,init);
      if(!narrationId)return response;
      return new Proxy(response,{get(target,property){
        if(property==='blob')return async()=>{const blob=await target.blob();blobNarrationIds.set(blob,narrationId);return blob};
        const value=Reflect.get(target,property,target);return typeof value==='function'?value.bind(target):value;
      }});
    };
    URL.createObjectURL=(blob:Blob|MediaSource)=>{
      if(blob instanceof Blob){const id=blobNarrationIds.get(blob);if(id)return`blob:practice-hard/${encodeURIComponent(id)}/${++sequence}`}
      return nativeCreateObjectURL(blob);
    };
    class MockAudio{
      src='';preload='';playbackRate=1;currentTime=0;onended:(()=>void)|null=null;onerror:(()=>void)|null=null;timer:number|null=null;
      constructor(source=''){this.src=source}
      pause(){if(this.timer!==null){window.clearTimeout(this.timer);this.timer=null}}
      play(){this.pause();audit.audioPlays+=1;const prefix='blob:practice-hard/';audit.playedIds.push(this.src.startsWith(prefix)?decodeURIComponent(this.src.slice(prefix.length).split('/')[0]):this.src);this.timer=window.setTimeout(()=>{this.timer=null;this.onended?.()},24);return Promise.resolve()}
    }
    Object.defineProperty(window,'Audio',{configurable:true,writable:true,value:MockAudio});
    (window as unknown as {__practiceHardAudit:VoiceAudit}).__practiceHardAudit=audit;
    localStorage.setItem('mathnikita-voice-settings-v4',JSON.stringify({engine:'studio',rate:.94}));
    localStorage.setItem('mathnikita-mentor-auto-guide','false');
  });
}

async function routeNarration(page:Page,requests:NarrationRequest[]){
  await page.route('**/api/narration-status',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,studioConfigured:true,provider:'gemini',voice:'Sulafat'})}));
  await page.route('**/api/narration',async route=>{requests.push(route.request().postDataJSON() as NarrationRequest);await new Promise(resolve=>setTimeout(resolve,5));await route.fulfill({status:200,contentType:'audio/wav',body:'RIFF-extended-practice-hard'})});
}

async function openLesson(page:Page,lessonNumber:number){
  await page.goto('/',{waitUntil:'domcontentloaded'});
  if(lessonNumber>=54){const chapterThree=page.locator('.course-chapter-group').nth(2);if(!(await chapterThree.evaluate(element=>(element as HTMLDetailsElement).open)))await chapterThree.locator('summary').click()}
  else if(lessonNumber>=21){const chapterTwo=page.locator('.course-chapter-group').nth(1);if(!(await chapterTwo.evaluate(element=>(element as HTMLDetailsElement).open)))await chapterTwo.locator('summary').click()}
  await page.getByRole('button',{name:new RegExp(`Открыть урок ${lessonNumber}:`)}).click();
  await page.locator('.lesson-opening-start').click();
  await expect(page.locator('.lesson-runtime:not([hidden]) .interactive-stage[data-stage-id]')).toBeVisible();
}

async function jumpToSummary(page:Page,lessonNumber:number){
  let total=specialStageCounts[lessonNumber];
  if(!total){const text=await page.locator('.lesson-runtime:not([hidden]) .stage-counter').innerText();const match=text.match(/Этап\s+\d+\s+из\s+(\d+)/i);if(!match)throw new Error(`Lesson ${lessonNumber}: cannot read stage count from ${text}`);total=Number(match[1])}
  await page.evaluate(({lessonNumber,stageIndex})=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber,stageIndex}})),{lessonNumber,stageIndex:total-1});
  await expect(page.locator('.lesson-runtime:not([hidden]) .interactive-stage[data-stage-id]')).toHaveAttribute('data-stage-id',/summary$/,{timeout:8_000});
}

async function played(page:Page,id:string){return page.evaluate(id=>(window as unknown as {__practiceHardAudit:VoiceAudit}).__practiceHardAudit.playedIds.includes(id),id)}
async function noHorizontalOverflow(page:Page){return page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+2)}

async function solveTask(page:Page,task:ExtendedPracticeTask){
  if(task.type==='choice'){
    await page.locator('.extended-practice-options').getByRole('button',{name:task.answer,exact:true}).click();
  }else if(task.type==='multi-input'){
    const inputs=page.locator('.extended-practice-multi input');
    await expect(inputs).toHaveCount(task.fields.length);
    for(let index=0;index<task.fields.length;index+=1)await inputs.nth(index).fill(task.fields[index].answers[0]);
  }else{
    await page.locator('.extended-practice-input input').fill(task.answers[0]);
  }
  await page.locator('.extended-practice-check').click();
  await expect(page.locator('.extended-practice-feedback.is-correct')).toBeVisible();
}

for(let lessonNumber=startLesson;lessonNumber<=endLesson;lessonNumber+=1){
  if(lessonNumber===20||lessonNumber===33||lessonNumber===53){
    test(`lesson ${lessonNumber} remains a standalone control work without mandatory-practice reflection gate`,async({page})=>{
      await openLesson(page,lessonNumber);await jumpToSummary(page,lessonNumber);
      await expect(page.locator('.lesson-reflection')).toHaveCount(0);
      await expect(page.locator('.extended-practice')).toHaveCount(0);
    });
    continue;
  }

  test(`lesson ${lessonNumber} completes every mandatory-practice task with Sulafat, persistence and final completion`,async({page})=>{
    test.setTimeout(300_000);
    const practice=extendedPracticeByLesson[lessonNumber];
    expect(practice,`Lesson ${lessonNumber} has no mandatory-practice data`).toBeTruthy();
    expect(practice.tasks.length,`Lesson ${lessonNumber} mandatory practice is empty`).toBeGreaterThan(0);
    const responseCount=extendedPracticeSetResponseCount(practice);
    const requests:NarrationRequest[]=[];const pageErrors:string[]=[];page.on('pageerror',error=>pageErrors.push(error.message));
    await installVoiceAudit(page);await routeNarration(page,requests);await openLesson(page,lessonNumber);await jumpToSummary(page,lessonNumber);

    await expect(page.locator('.lesson-reflection')).toBeVisible();
    await expect(page.locator('.reflection-practice-lock')).toBeVisible();
    await expect(page.locator('.extended-practice')).toBeVisible();
    await expect(page.locator('.extended-practice[data-practice-response-count]')).toHaveAttribute('data-practice-response-count',String(responseCount));
    expect(await noHorizontalOverflow(page),`Lesson ${lessonNumber}: horizontal overflow at mandatory-practice start`).toBeTruthy();

    const storageKey=extendedPracticeStorageKey(lessonNumber);
    for(let index=0;index<practice.tasks.length;index+=1){
      const task=practice.tasks[index];const taskScope=page.locator('.extended-practice[data-practice-task]');
      await expect(taskScope).toHaveAttribute('data-practice-task',task.id,{timeout:8_000});
      await expect(page.locator('.extended-practice-header strong')).toHaveText(`${index+1} / ${practice.tasks.length}`);
      const narrationId=practiceNarrationId(lessonNumber,task);
      await expect.poll(()=>played(page,narrationId),{timeout:8_000,message:`Lesson ${lessonNumber} task ${task.id}: auto Sulafat never reached Audio.play()`}).toBeTruthy();
      await expect.poll(()=>requests.some(item=>item.id===narrationId),{timeout:8_000,message:`Lesson ${lessonNumber} task ${task.id}: no Sulafat request`}).toBeTruthy();
      const request=requests.find(item=>item.id===narrationId)!;expect(request.version).toBe('ru-teacher-gemini-sulafat-v2');expect(request.text.trim().length).toBeGreaterThan(15);
      expect(await noHorizontalOverflow(page),`Lesson ${lessonNumber} task ${task.id}: horizontal overflow`).toBeTruthy();

      await solveTask(page,task);
      const nextButton=page.locator('.extended-practice-next');await expect(nextButton).toBeEnabled();await nextButton.click();
      await expect.poll(()=>page.evaluate(key=>localStorage.getItem(key),storageKey),{timeout:5_000}).toBe(String(index+1));

      if(index===0&&practice.tasks.length>1){
        await page.reload({waitUntil:'domcontentloaded'});await openLesson(page,lessonNumber);await jumpToSummary(page,lessonNumber);
        await expect(page.locator('.extended-practice[data-practice-task]')).toHaveAttribute('data-practice-task',practice.tasks[1].id,{timeout:8_000});
      }
    }

    await expect(page.locator('.extended-practice.is-finished')).toBeVisible();
    await expect(page.locator('.extended-practice.is-finished')).toContainText(`Решены все ${practice.tasks.length} заданий`);
    await expect(page.locator('.reflection-practice-lock')).toHaveCount(0);
    const finalStep=page.locator('.reflection-final-step');await expect(finalStep).toBeVisible();
    await finalStep.locator('textarea').fill('Я понял главный принцип темы и могу объяснить решение своими словами. Я проверяю каждый шаг и использую правило из урока.');
    await finalStep.getByRole('button',{name:'Завершить урок'}).click();
    await expect(finalStep.getByRole('button',{name:'Урок завершён ✓'})).toBeVisible();
    const completion=await page.evaluate(key=>localStorage.getItem(key),`mathnikita:lesson-complete:${lessonNumber}`);expect(completion).toBeTruthy();
    const parsed=JSON.parse(completion!);expect(typeof parsed.completedAt).toBe('string');expect(typeof parsed.activeSeconds).toBe('number');

    await page.reload({waitUntil:'domcontentloaded'});await openLesson(page,lessonNumber);await jumpToSummary(page,lessonNumber);
    await expect(page.locator('.extended-practice.is-finished')).toBeVisible();
    await expect(page.getByRole('button',{name:'Урок завершён ✓'})).toBeVisible({timeout:8_000});
    expect(pageErrors,`Lesson ${lessonNumber} runtime errors: ${pageErrors.join(' | ')}`).toEqual([]);
  });
}