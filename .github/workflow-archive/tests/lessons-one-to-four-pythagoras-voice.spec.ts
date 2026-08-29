import {expect,test,type Page} from '@playwright/test';

type NarrationRequest={id:string;text:string;version:string};
type Audit={playedIds:string[]};

async function installAudit(page:Page){
  await page.addInitScript(()=>{
    const audit:Audit={playedIds:[]};
    const blobNarrationIds=new WeakMap<Blob,string>();
    const nativeFetch=window.fetch.bind(window);
    const nativeCreateObjectURL=URL.createObjectURL.bind(URL);
    let objectUrlSequence=0;

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
      return new Proxy(response,{
        get(target,property){
          if(property==='blob')return async()=>{const blob=await target.blob();blobNarrationIds.set(blob,narrationId);return blob};
          const value=Reflect.get(target,property,target);return typeof value==='function'?value.bind(target):value;
        },
      });
    };

    URL.createObjectURL=(blob:Blob|MediaSource)=>{
      if(blob instanceof Blob){
        const narrationId=blobNarrationIds.get(blob);
        if(narrationId)return`blob:mathnikita-pythagoras-audit/${encodeURIComponent(narrationId)}/${++objectUrlSequence}`;
      }
      return nativeCreateObjectURL(blob);
    };

    class MockAudio{
      src='';preload='';playbackRate=1;currentTime=0;onended:(()=>void)|null=null;onerror:(()=>void)|null=null;timer:number|null=null;
      constructor(source=''){this.src=source}
      pause(){if(this.timer!==null){window.clearTimeout(this.timer);this.timer=null}}
      play(){
        this.pause();
        const prefix='blob:mathnikita-pythagoras-audit/';
        if(this.src.startsWith(prefix))audit.playedIds.push(decodeURIComponent(this.src.slice(prefix.length).split('/')[0]));
        else audit.playedIds.push(this.src);
        this.timer=window.setTimeout(()=>{this.timer=null;this.onended?.()},30);
        return Promise.resolve();
      }
    }
    Object.defineProperty(window,'Audio',{configurable:true,writable:true,value:MockAudio});
    (window as unknown as {__pythagorasAudit:Audit}).__pythagorasAudit=audit;
    localStorage.setItem('mathnikita-voice-settings-v4',JSON.stringify({engine:'studio',rate:.94}));
    localStorage.setItem('mathnikita-mentor-auto-guide','false');
  });
}

async function routeNarration(page:Page,requests:NarrationRequest[]){
  await page.route('**/api/narration-status',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,studioConfigured:true,provider:'gemini',voice:'Sulafat'})}));
  await page.route('**/api/narration',async route=>{
    requests.push(route.request().postDataJSON() as NarrationRequest);
    await new Promise(resolve=>setTimeout(resolve,8));
    await route.fulfill({status:200,contentType:'audio/wav',body:'RIFF-pythagoras-1-4'});
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

async function playedCount(page:Page,id:string){
  return page.evaluate(id=>(window as unknown as {__pythagorasAudit:Audit}).__pythagorasAudit.playedIds.filter(item=>item===id).length,id);
}

const actions=[
  {label:'↻ Объясни иначе',suffix:'different'},
  {label:'▣ Дай пример',suffix:'example'},
  {label:'✦ Подсказка',suffix:'hint'},
  {label:'? Почему так?',suffix:'why'},
] as const;

for(let lessonNumber=1;lessonNumber<=4;lessonNumber+=1){
  test(`lesson ${lessonNumber} mandatory practice Pythagoras plays all four actions through Sulafat`,async({page})=>{
    test.setTimeout(120_000);
    const requests:NarrationRequest[]=[];
    const pageErrors:string[]=[];
    page.on('pageerror',error=>pageErrors.push(error.message));
    await installAudit(page);
    await routeNarration(page,requests);
    await openLesson(page,lessonNumber);

    const total=await totalStages(page);
    await page.evaluate(({lessonNumber,stageIndex})=>window.dispatchEvent(new CustomEvent('mathnikita-go-to-stage',{detail:{lessonNumber,stageIndex}})),{lessonNumber,stageIndex:total-1});
    await expect(page.locator('.lesson-runtime:not([hidden]) .stage-counter')).toContainText(`Этап ${total} из ${total}`,{timeout:6_000});
    await expect(page.locator('.lesson-reflection .extended-practice[data-practice-task]')).toBeVisible({timeout:6_000});

    const task=page.locator('.lesson-reflection .extended-practice[data-practice-task]');
    const taskId=await task.getAttribute('data-practice-task');
    expect(taskId).toBeTruthy();

    // ExtendedPracticeLab schedules the first task's automatic narration shortly after
    // the summary becomes active. Wait for that real Audio.play() and for its UI to
    // return to idle before exercising Pythagoras, otherwise the later auto audio-request
    // can legitimately stop the first mentor action and make this audit racey.
    const practiceNarrationId=`lesson-${String(lessonNumber).padStart(2,'0')}-practice-${taskId}`;
    await expect.poll(()=>requests.some(item=>item.id===practiceNarrationId),{timeout:8_000,message:`Lesson ${lessonNumber}: mandatory-practice auto narration was not requested`}).toBeTruthy();
    await expect.poll(()=>playedCount(page,practiceNarrationId),{timeout:8_000,message:`Lesson ${lessonNumber}: mandatory-practice auto narration never reached Audio.play()`}).toBeGreaterThan(0);
    await expect(task.locator('.extended-practice-voice button')).toHaveText('▶ Озвучить задание',{timeout:8_000});
    await page.evaluate(()=>window.dispatchEvent(new CustomEvent('mathnikita-stop-narration')));

    const pythagoras=task.locator('.practice-pythagoras');
    await expect(pythagoras).toBeVisible();
    await expect(pythagoras.locator('.practice-pythagoras-actions button')).toHaveCount(4);

    for(const action of actions){
      const expectedId=`mentor-practice-${lessonNumber}-${taskId}-${action.suffix}`;
      const before=await playedCount(page,expectedId);
      await pythagoras.getByRole('button',{name:action.label,exact:true}).click();
      await expect(pythagoras.locator('.practice-pythagoras-message')).not.toBeEmpty();
      await expect.poll(()=>requests.some(item=>item.id===expectedId),{timeout:8_000,message:`Lesson ${lessonNumber}: no Sulafat request for ${action.label}`}).toBeTruthy();
      await expect.poll(()=>playedCount(page,expectedId),{timeout:8_000,message:`Lesson ${lessonNumber}: Audio.play() did not run for ${action.label}`}).toBeGreaterThan(before);
      const request=requests.find(item=>item.id===expectedId)!;
      expect(request.version).toBe('ru-teacher-gemini-sulafat-v2');
      expect(request.text.trim().length).toBeGreaterThan(20);
      await expect(pythagoras.getByRole('button',{name:'Озвучить подсказку Пифагора'})).toBeVisible({timeout:8_000});
    }

    expect(pageErrors,`Runtime exception in lesson ${lessonNumber}: ${pageErrors.join(' | ')}`).toEqual([]);
  });
}
