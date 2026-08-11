import assert from 'node:assert/strict';
import {chromium,webkit} from '@playwright/test';

const BASE='https://mathnikita.gunya999.workers.dev';
const EXPECTED=process.env.EXPECTED_SHA||'';
const RUN=process.env.GITHUB_RUN_ID||String(Date.now());
const code='MN-NABUQA4';
const pin='7392';
const markerKey='mathnikita:qa-live-marker';
const markerSynced=`lesson33-${RUN}`;

async function jsonFetch(path,init={}){
  const response=await fetch(`${BASE}${path}`,init);
  const text=await response.text();
  let body={};try{body=JSON.parse(text)}catch{}
  if(!response.ok)throw new Error(`${path} -> ${response.status}: ${text}`);
  return body;
}
function headers(extra={}){return{'content-type':'application/json',...extra}}

const version=await jsonFetch('/api/version');
assert.equal(version.gitSha,EXPECTED,'production git SHA must equal final main');
assert.ok(version.workerVersion?.id,'worker version id missing');
assert.ok(version.workerVersion?.timestamp,'worker timestamp missing');
console.log(`production version OK: ${version.gitSha} / ${version.workerVersion.id}`);

const cloudStatus=await jsonFetch('/api/cloud/status');
assert.equal(cloudStatus.configured,true,'production cloud must be configured');
console.log('cloud status OK');

const narrationResponse=await fetch(`${BASE}/api/narration-status`);
assert.equal(narrationResponse.ok,true,'narration status endpoint failed');
const narration=await narrationResponse.json();
assert.equal(Boolean(narration.studioConfigured),true,'studio narration is not configured');
console.log(`narration status OK: ${narration.provider||'provider'} / ${narration.voice||'voice'}`);

const logged=await jsonFetch('/api/cloud/login',{method:'POST',headers:headers(),body:JSON.stringify({code,pin})});
assert.ok(logged.token,'cloud login token missing');
assert.ok(Number.isInteger(logged.revision),'cloud login revision missing');
const synced=await jsonFetch('/api/cloud/sync',{method:'POST',headers:headers({authorization:`Bearer ${logged.token}`}),body:JSON.stringify({baseRevision:logged.revision,changes:{[markerKey]:markerSynced}})});
assert.ok(Number.isInteger(synced.revision),'sync revision missing');
const snapshot=await jsonFetch('/api/cloud/snapshot',{headers:{authorization:`Bearer ${logged.token}`}});
assert.equal(snapshot.entries?.[markerKey],markerSynced,'snapshot did not contain latest synced value');
console.log(`existing production smoke profile login + sync OK: revision ${snapshot.revision}`);

async function installVoiceHarness(page){
  await page.addInitScript(()=>{
    const audit={events:[]};
    const blobIds=new WeakMap();
    const nativeFetch=window.fetch.bind(window);
    const nativeCreateObjectURL=URL.createObjectURL.bind(URL);
    window.fetch=async(input,init)=>{
      const url=typeof input==='string'?input:input instanceof URL?input.href:input.url;
      let narrationId='';
      if(url.includes('/api/narration')&&!url.includes('/api/narration-status')){
        let rawBody=init?.body;
        if(rawBody==null&&input instanceof Request){try{rawBody=await input.clone().text()}catch{}}
        if(typeof rawBody==='string'){try{narrationId=JSON.parse(rawBody)?.id??''}catch{}}
        if(narrationId)audit.events.push({kind:'request',id:narrationId});
      }
      const response=await nativeFetch(input,init);
      if(!narrationId)return response;
      return new Proxy(response,{get(target,property){
        if(property==='blob')return async()=>{const blob=await target.blob();blobIds.set(blob,narrationId);return blob};
        const value=Reflect.get(target,property,target);return typeof value==='function'?value.bind(target):value;
      }});
    };
    URL.createObjectURL=(blob)=>{
      if(blob instanceof Blob){const id=blobIds.get(blob);if(id)return`blob:qa-live/${encodeURIComponent(id)}`}
      return nativeCreateObjectURL(blob);
    };
    class MockAudio{
      constructor(source=''){this.src=source;this.preload='';this.playbackRate=1;this.currentTime=0;this.onended=null;this.onerror=null;this.timer=null;this.started=false}
      id(){const prefix='blob:qa-live/';return this.src.startsWith(prefix)?decodeURIComponent(this.src.slice(prefix.length)):this.src}
      pause(){if(this.started)audit.events.push({kind:'pause',id:this.id()});this.started=false;if(this.timer!==null){clearTimeout(this.timer);this.timer=null}}
      play(){this.pause();this.started=true;audit.events.push({kind:'play',id:this.id()});this.timer=setTimeout(()=>{this.timer=null;this.started=false;this.onended?.()},5000);return Promise.resolve()}
    }
    Object.defineProperty(window,'Audio',{configurable:true,writable:true,value:MockAudio});
    window.__qaVoiceAudit=audit;
    localStorage.setItem('mathnikita-voice-settings-v4',JSON.stringify({engine:'studio',rate:.94}));
    localStorage.setItem('mathnikita-mentor-auto-guide','false');
  });
  await page.route('**/api/narration-status',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,studioConfigured:true,provider:'production-smoke',voice:'Sulafat'})}));
  await page.route('**/api/narration',route=>route.fulfill({status:200,contentType:'audio/wav',body:Buffer.from('RIFF-production-live-smoke')}));
}

async function loginThroughUi(page){
  await page.goto(BASE,{waitUntil:'domcontentloaded'});
  const existingButton=page.getByRole('button',{name:/Уже есть код ученика/});
  await existingButton.waitFor({state:'visible',timeout:20000});
  await existingButton.click();
  await page.getByLabel('Код ученика').fill(code);
  await page.getByLabel('PIN облачного профиля').fill(pin);
  await page.getByRole('button',{name:'Войти и загрузить прогресс'}).click();
  await page.getByRole('button',{name:/Сменить ученика/}).waitFor({state:'visible',timeout:20000});
  const marker=await page.evaluate(key=>localStorage.getItem(key),markerKey);
  assert.equal(marker,markerSynced,'UI cloud login did not restore latest synced marker');
}

async function checkCatalog(page){
  await page.getByText('Полностью готовы 33 интерактивных урока.').waitFor({state:'visible',timeout:20000});
  assert.equal(await page.locator('.course-lesson-grid > button').count(),175,'catalog must contain 175 lessons');
  const chapterTwo=page.locator('.course-chapter-group').nth(1);
  if(!(await chapterTwo.evaluate(el=>el.open)))await chapterTwo.locator('summary').click();
  const lesson33=page.getByRole('button',{name:/Открыть урок 33:/});
  assert.equal(await lesson33.isEnabled(),true,'lesson 33 must be enabled in production');
  assert.equal(await lesson33.evaluate(el=>el.classList.contains('is-control-ready')),true,'lesson 33 must be a control-ready lesson');
  assert.equal(await page.locator('.course-lesson-grid > button').nth(33).isDisabled(),true,'lesson 34 must remain locked');
  return lesson33;
}

async function chromiumHardSmoke(){
  const browser=await chromium.launch({headless:true});
  const context=await browser.newContext({viewport:{width:1440,height:1000}});
  const page=await context.newPage();
  await installVoiceHarness(page);
  await loginThroughUi(page);
  await page.evaluate(()=>{localStorage.setItem('mathnikita-voice-settings-v4',JSON.stringify({engine:'studio',rate:.94}));localStorage.setItem('mathnikita-mentor-auto-guide','false')});
  await page.reload({waitUntil:'domcontentloaded'});
  const lesson33=await checkCatalog(page);
  await lesson33.click();
  await page.locator('.lesson-opening-start').click();
  await page.locator('[data-stage-id="l33-rules"]').waitFor({state:'visible',timeout:20000});
  assert.equal(await page.locator('.cat-mentor').count(),0,'control work must not expose CatMentor');
  assert.equal(await page.locator('.progressive-hint-coach').count(),0,'control work must not expose hint coach');
  assert.equal(await page.locator('.extended-practice').count(),0,'control work must not render extended practice');
  const oldId='lesson-33-stage-l33-rules';
  await page.waitForFunction(id=>window.__qaVoiceAudit?.events?.some(event=>event.kind==='request'&&event.id===id),oldId,{timeout:15000});
  await page.waitForFunction(id=>window.__qaVoiceAudit?.events?.some(event=>event.kind==='play'&&event.id===id),oldId,{timeout:15000});
  await page.evaluate(()=>{window.__qaVoiceAudit.events=[]});
  await page.locator('.lesson-controls button:not([disabled])').last().click();
  const immediate=await page.evaluate(()=>window.__qaVoiceAudit.events);
  assert.ok(immediate.some(event=>event.kind==='pause'&&event.id===oldId),'old control narration did not pause synchronously on stage change');
  await page.locator('[data-stage-id="l33-task1"]').waitFor({state:'visible',timeout:10000});
  await page.waitForFunction(()=>window.__qaVoiceAudit?.events?.some(event=>event.kind==='play'&&event.id==='lesson-33-stage-l33-task1'),null,{timeout:15000});
  console.log('Chromium live catalog + lesson33 control mode + voice interruption OK');
  await browser.close();
}

async function webkitHardSmoke(){
  const browser=await webkit.launch({headless:true});
  const context=await browser.newContext({viewport:{width:1024,height:1366},userAgent:'Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1'});
  const page=await context.newPage();
  await loginThroughUi(page);
  const lesson33=await checkCatalog(page);
  let overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
  assert.ok(overflow<=2,`iPad catalog horizontal overflow: ${overflow}`);
  await lesson33.click();
  await page.locator('.lesson-opening-start').click();
  await page.locator('[data-stage-id="l33-rules"]').waitFor({state:'visible',timeout:20000});
  assert.equal(await page.locator('.cat-mentor').count(),0,'iPad control work must not expose CatMentor');
  assert.equal(await page.locator('.progressive-hint-coach').count(),0,'iPad control work must not expose hint coach');
  overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
  assert.ok(overflow<=2,`iPad lesson33 horizontal overflow: ${overflow}`);
  console.log('WebKit/iPad live cloud restore + lesson33 control layout OK');
  await browser.close();
}

await chromiumHardSmoke();
await webkitHardSmoke();
console.log('PRODUCTION LIVE HARD SMOKE: SUCCESS');
