import fs from 'node:fs';
import {expect,test,type Browser,type Page} from '@playwright/test';
import {extendedPracticeByLesson} from '../src/data/extendedPracticeData';
import type {ExtendedPracticeTask} from '../src/data/extendedPracticeTypes';
import {practiceNarrationId} from '../src/practiceNarration';

type AuditEvent={kind:'request'|'response'|'play-call'|'playing'|'play-error'|'pause';id:string;status?:number;contentType?:string;error?:string};
type MainAnswer={type:'choice';value:string}|{type:'input';value:string}|{type:'order';values:string[]};

declare global{interface Window{__prodVoiceAudit:{events:AuditEvent[]}}}

const mainAnswers:Record<string,MainAnswer>={
  'l6-unique':{type:'choice',value:'ровно один'},
  'l6-name':{type:'choice',value:'AB и BA'},
  'l6-unit':{type:'choice',value:'подсчитать, сколько единичных отрезков в нём помещается'},
  'l6-units':{type:'choice',value:'PK = 17 мм'},
  'l6-endpoints':{type:'choice',value:'M и N'},
  'l6-whole':{type:'input',value:'15'},
  'l6-part':{type:'input',value:'11'},
  'l6-convert':{type:'choice',value:'48 мм'},
  'l6-equal':{type:'choice',value:'они совпадают при наложении'},
  'l6-build-order':{type:'order',values:['Отметить точку A','Совместить нулевую отметку линейки с A','На отметке 6 см 3 мм поставить точку B','Соединить A и B по линейке']},
  'l6-ruler-shift':{type:'input',value:'5'},
  'l6-quiz1':{type:'choice',value:'1'},
  'l6-quiz2':{type:'input',value:'13'},
  'l6-quiz3':{type:'input',value:'8'},
  'l6-quiz4':{type:'choice',value:'54 мм'},
  'l6-quiz5':{type:'choice',value:'да'},
  'l6-challenge':{type:'input',value:'55'},
};

const base=process.env.BASE_URL??'https://mathnikita.gunya999.workers.dev';
const expectedSha=process.env.EXPECTED_SHA??'';
const idsFile=process.env.QA_IDS_FILE??'/tmp/qa-full-lesson6-ids.json';
const runId=process.env.GITHUB_RUN_ID??String(Date.now());
const profileName=`QA Урок 6 ${runId.slice(-6)}`;
const pin='3168';

function safeToken(value:string){return value.toLowerCase().replace(/[^a-z0-9-]+/g,'-').replace(/^-+|-+$/g,'').slice(0,80)}

async function installProductionVoiceAudit(page:Page){
  await page.addInitScript(()=>{
    const audit:{events:AuditEvent[]}={events:[]};
    const blobIds=new WeakMap<Blob,string>();
    const urlIds=new Map<string,string>();
    const nativeFetch=window.fetch.bind(window);
    const nativeCreateObjectURL=URL.createObjectURL.bind(URL);
    const nativePlay=HTMLMediaElement.prototype.play;
    const nativePause=HTMLMediaElement.prototype.pause;

    window.fetch=async(input:RequestInfo|URL,init?:RequestInit)=>{
      const url=typeof input==='string'?input:input instanceof URL?input.href:input.url;
      let narrationId='';
      if(url.includes('/api/narration')){
        let rawBody=init?.body;
        if(rawBody==null&&input instanceof Request){try{rawBody=await input.clone().text()}catch{}}
        if(typeof rawBody==='string'){try{narrationId=(JSON.parse(rawBody) as {id?:string}).id??''}catch{}}
        if(narrationId)audit.events.push({kind:'request',id:narrationId});
      }
      const response=await nativeFetch(input,init);
      if(!narrationId)return response;
      audit.events.push({kind:'response',id:narrationId,status:response.status,contentType:response.headers.get('content-type')??''});
      return new Proxy(response,{get(target,property){
        if(property==='blob')return async()=>{const blob=await target.blob();blobIds.set(blob,narrationId);return blob};
        const value=Reflect.get(target,property,target);return typeof value==='function'?value.bind(target):value;
      }});
    };

    URL.createObjectURL=(blob:Blob|MediaSource)=>{
      const url=nativeCreateObjectURL(blob);
      if(blob instanceof Blob){const id=blobIds.get(blob);if(id)urlIds.set(url,id)}
      return url;
    };

    HTMLMediaElement.prototype.play=function(){
      const id=urlIds.get(this.src)||this.src;
      audit.events.push({kind:'play-call',id});
      let result:Promise<void>;
      try{result=nativePlay.call(this)}catch(error){audit.events.push({kind:'play-error',id,error:error instanceof Error?error.message:String(error)});throw error}
      Promise.resolve(result).then(()=>audit.events.push({kind:'playing',id})).catch(error=>audit.events.push({kind:'play-error',id,error:error instanceof Error?error.message:String(error)}));
      return result;
    };
    HTMLMediaElement.prototype.pause=function(){
      const id=urlIds.get(this.src)||this.src;
      if(id)audit.events.push({kind:'pause',id});
      return nativePause.call(this);
    };

    window.__prodVoiceAudit=audit;
    localStorage.setItem('mathnikita-voice-settings-v4',JSON.stringify({engine:'studio',rate:.94}));
    localStorage.setItem('mathnikita-mentor-auto-guide','false');
  });
}

async function audit(page:Page){return page.evaluate(()=>window.__prodVoiceAudit?.events??[])}
async function clearAudit(page:Page){await page.evaluate(()=>{if(window.__prodVoiceAudit)window.__prodVoiceAudit.events=[]})}
async function waitForAudit(page:Page,kind:AuditEvent['kind'],id:string,timeout=60_000){
  await expect.poll(async()=>{const events=await audit(page);return events.some(event=>event.kind===kind&&event.id===id)},{timeout}).toBeTruthy();
}
async function assertRealAudioResponse(page:Page,id:string){
  // 429 is explicitly retryable in studioVoice. A production E2E must judge the
  // final learner-visible outcome, not fail on the first transient provider response.
  await waitForAudit(page,'playing',id,90_000);
  const events=(await audit(page)).filter(item=>item.id===id);
  const successfulAudio=events.find(item=>item.kind==='response'&&item.status===200&&/^audio\//i.test(item.contentType??''));
  expect(successfulAudio,`${id} must eventually return 200 audio/* after any retryable responses`).toBeTruthy();
  const errors=events.filter(item=>item.kind==='play-error');
  expect(errors,`${id} real Chromium media playback must not reject`).toHaveLength(0);
  const transient429s=events.filter(item=>item.kind==='response'&&item.status===429).length;
  if(transient429s)console.log(`[production-voice] ${id}: recovered after ${transient429s} transient 429 response(s)`);
}

async function createCloudProfile(page:Page){
  await page.goto(base,{waitUntil:'domcontentloaded',timeout:30_000});
  await expect(page.getByRole('heading',{name:'Создать профиль ученика'})).toBeVisible();
  await page.getByLabel('Имя ученика').fill(profileName);
  await page.getByLabel('PIN · 4 цифры').fill(pin);
  await page.getByLabel('Повтори PIN').fill(pin);
  await page.getByRole('button',{name:'Создать профиль'}).click();
  await expect(page.getByRole('heading',{name:'Прогресс теперь защищён'})).toBeVisible({timeout:30_000});
  const body=await page.locator('body').innerText();
  const code=body.match(/\bMN-[A-Z0-9]{7}\b/)?.[0];
  expect(code,'cloud student code').toBeTruthy();
  const profile=await page.evaluate(name=>{
    const registry=JSON.parse(localStorage.getItem('mathnikita:accounts:registry:v1')??'null');
    return registry?.profiles?.find((item:{name?:string})=>item.name===name)??null;
  },profileName);
  expect(profile?.id,'internal profile id').toMatch(/^[A-Za-z0-9_-]{8,80}$/);
  fs.writeFileSync(idsFile,JSON.stringify([profile.id]));
  await page.getByRole('button',{name:/Я сохранил коды/}).click();
  await expect(page.getByRole('button',{name:new RegExp(`Сменить ученика\\. Сейчас ${profileName}`)})).toBeVisible();
  await expect(page.getByLabel(/Облако: Прогресс сохранён/)).toBeVisible({timeout:30_000});
  return{code:code!,studentId:profile.id as string};
}

async function answerMainStage(page:Page,stageId:string){
  const stage=page.locator('.lesson-runtime:not([hidden]) .interactive-stage');
  if(!(await stage.locator('.activity-area').count()))return;
  const answer=mainAnswers[stageId];
  expect(answer,`canonical answer for interactive stage ${stageId}`).toBeTruthy();
  if(answer.type==='choice'){
    await stage.locator('.choice-grid').getByRole('button',{name:answer.value,exact:true}).click();
  }else if(answer.type==='input'){
    await stage.locator('.inline-answer input').fill(answer.value);
  }else{
    for(const value of answer.values)await stage.locator('.order-bank').getByRole('button',{name:value,exact:true}).click();
  }
  await stage.locator('.check-button').click();
  await expect(stage.locator('.instant-feedback.good'),`${stageId} must be solved correctly`).toBeVisible();
}

async function solvePracticeTask(page:Page,task:ExtendedPracticeTask){
  if(task.type==='choice'){
    await page.locator('.extended-practice-options').getByRole('button',{name:task.answer,exact:true}).click();
  }else if(task.type==='multi-input'){
    for(let index=0;index<task.fields.length;index+=1)await page.locator('.extended-practice-multi input').nth(index).fill(task.fields[index].answers[0]);
  }else{
    await page.locator('.extended-practice-input input').fill(task.answers[0]);
  }
  await page.locator('.extended-practice-check').click();
  await expect(page.locator('.extended-practice-feedback.is-correct'),`practice ${task.id} must be correct`).toBeVisible();
}

async function cleanDeviceLogin(browser:Browser,code:string){
  const context=await browser.newContext();
  const page=await context.newPage();
  await page.goto(base,{waitUntil:'domcontentloaded',timeout:30_000});
  await page.getByRole('button',{name:/Уже есть код ученика/}).click();
  await page.getByLabel('Код ученика').fill(code);
  await page.getByLabel('PIN облачного профиля').fill(pin);
  await page.getByRole('button',{name:'Войти и загрузить прогресс'}).click();
  await expect(page.getByRole('button',{name:new RegExp(`Сменить ученика\\. Сейчас ${profileName}`)})).toBeVisible({timeout:30_000});
  return{context,page};
}

test('production lesson 6: real voice -> 24 stages -> Pythagoras -> 20 tasks -> reflection -> cloud restore',async({page,browser})=>{
  test.setTimeout(900_000);
  const versionResponse=await fetch(`${base}/api/version`,{headers:{'cache-control':'no-cache'}});
  expect(versionResponse.ok).toBeTruthy();
  const version=await versionResponse.json() as {gitSha?:string};
  expect(version.gitSha,'test must run against exact canonical production').toBe(expectedSha);

  await installProductionVoiceAudit(page);
  const cloud=await createCloudProfile(page);

  await page.getByRole('button',{name:/Открыть урок 6:/}).click();
  await expect(page.getByRole('heading',{name:'Отрезок. Длина отрезка'}).first()).toBeVisible();
  await page.locator('.lesson-opening-start').click();
  await expect(page.locator('[data-stage-id="l6-story"]')).toBeVisible();

  const firstNarration='lesson-06-stage-l6-story';
  await assertRealAudioResponse(page,firstNarration);
  await clearAudit(page);
  await page.locator('.lesson-controls .primary').click();
  const immediate=await audit(page);
  expect(immediate.some(event=>event.kind==='pause'&&event.id===firstNarration),'old production audio must pause in the navigation click').toBeTruthy();
  await expect(page.locator('[data-stage-id="l6-segment-definition"]')).toBeVisible();
  await assertRealAudioResponse(page,'lesson-06-stage-l6-segment-definition');

  const visited=new Set<string>();
  for(let guard=0;guard<30;guard+=1){
    const stage=page.locator('.lesson-runtime:not([hidden]) .interactive-stage');
    const stageId=await stage.getAttribute('data-stage-id');
    expect(stageId).toBeTruthy();
    visited.add(stageId!);
    await answerMainStage(page,stageId!);
    if(stageId==='l6-summary')break;
    await expect(page.locator('.lesson-controls .primary')).toBeEnabled();
    await page.locator('.lesson-controls .primary').click();
    await expect(stage).not.toHaveAttribute('data-stage-id',stageId!);
  }
  expect(visited.size,'all 24 canonical lesson-6 stages must be traversed').toBe(24);
  expect(Object.keys(mainAnswers).every(stageId=>visited.has(stageId)),'all canonical interactive stages must be visited').toBeTruthy();
  await expect(page.locator('[data-stage-id="l6-summary"]')).toBeVisible();
  await expect(page.locator('.extended-practice-header')).toContainText('20 заданий');

  const practice=extendedPracticeByLesson[6];
  expect(practice.tasks).toHaveLength(20);
  const firstTask=practice.tasks[0];
  const secondTask=practice.tasks[1];
  await expect(page.locator('.extended-practice[data-practice-task]')).toHaveAttribute('data-practice-task',firstTask.id);
  await assertRealAudioResponse(page,practiceNarrationId(6,firstTask));

  await page.getByRole('button',{name:'✦ Подсказка'}).click();
  const mentorId=`mentor-practice-6-${safeToken(firstTask.id)}-hint`;
  await assertRealAudioResponse(page,mentorId);
  await solvePracticeTask(page,firstTask);
  await clearAudit(page);
  await page.locator('.extended-practice-next').click();
  const mentorHandoff=await audit(page);
  expect(mentorHandoff.some(event=>event.kind==='pause'&&event.id===mentorId),'Pythagoras must pause immediately when learner advances').toBeTruthy();
  await expect(page.locator('.extended-practice[data-practice-task]')).toHaveAttribute('data-practice-task',secondTask.id);
  await assertRealAudioResponse(page,practiceNarrationId(6,secondTask));

  for(let index=1;index<practice.tasks.length;index+=1){
    const task=practice.tasks[index];
    await expect(page.locator('.extended-practice[data-practice-task]')).toHaveAttribute('data-practice-task',task.id);
    await solvePracticeTask(page,task);
    if(index<practice.tasks.length-1)await page.locator('.extended-practice-next').click();
  }

  await expect(page.locator('.lesson-reflection')).toBeVisible({timeout:30_000});
  await page.locator('#lesson-reflection-takeaway').fill('Отрезок имеет два конца, длину можно измерять и находить целое или часть.');
  await page.getByRole('button',{name:'Завершить урок'}).click();
  await expect.poll(()=>page.evaluate(()=>localStorage.getItem('mathnikita:lesson-complete:6')),{timeout:20_000}).not.toBeNull();
  expect(await page.evaluate(()=>localStorage.getItem('mathnikita:extended-practice:6:v3'))).toBe('20');

  const localAnalytics=await page.evaluate(()=>JSON.parse(localStorage.getItem('mathnikita:student-analytics:v1')??'null'));
  expect(localAnalytics?.lessons?.['6']?.completedAt).toBeTruthy();
  expect(localAnalytics?.lessons?.['6']?.correct).toBeGreaterThanOrEqual(20);
  expect(localAnalytics?.lessons?.['6']?.activeSeconds).toBeGreaterThan(0);

  await page.getByRole('button',{name:new RegExp(`Сменить ученика\\. Сейчас ${profileName}`)}).click();
  await expect(page.getByRole('heading',{name:'Выбери свой профиль'})).toBeVisible({timeout:40_000});

  const restored=await cleanDeviceLogin(browser,cloud.code);
  try{
    const completion=await restored.page.evaluate(()=>localStorage.getItem('mathnikita:lesson-complete:6'));
    expect(completion,'lesson completion must restore from real D1 on a clean browser').not.toBeNull();
    expect(await restored.page.evaluate(()=>localStorage.getItem('mathnikita:extended-practice:6:v3'))).toBe('20');
    const analytics=await restored.page.evaluate(()=>JSON.parse(localStorage.getItem('mathnikita:student-analytics:v1')??'null'));
    expect(analytics?.lessons?.['6']?.completedAt).toBeTruthy();
    expect(analytics?.lessons?.['6']?.activeSeconds).toBeGreaterThan(0);

    await restored.page.reload({waitUntil:'domcontentloaded'});
    await expect(restored.page.getByRole('button',{name:new RegExp(`Сменить ученика\\. Сейчас ${profileName}`)})).toBeVisible();
    expect(await restored.page.evaluate(()=>localStorage.getItem('mathnikita:lesson-complete:6'))).not.toBeNull();

    await restored.page.getByRole('button',{name:'Родителям'}).click();
    await expect(restored.page.getByRole('heading',{name:'Обзор обучения'})).toBeVisible();
    await expect(restored.page.locator('.ld-parent-footer')).toContainText('Урок 6 ·');
    await expect(restored.page.locator('.ld-history article').first()).toContainText('Урок 6 ·');
  }finally{
    await restored.context.close();
  }

  console.log(`PRODUCTION FULL LESSON 6 PASS ${expectedSha}: 24 stages + real narration playback/handoff + Pythagoras + 20/20 mandatory tasks + reflection + completion + real D1 clean-device restore + parent history`);
});
