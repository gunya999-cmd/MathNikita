import {expect,test,type Page} from '@playwright/test';

function fingerprint(value:string){let hash=2166136261;for(let index=0;index<value.length;index+=1){hash^=value.charCodeAt(index);hash=Math.imul(hash,16777619)}return`${value.length}:${(hash>>>0).toString(16)}`}

async function seedLinkedProfile(page:Page,marker='v1',revision=1){
  await page.addInitScript(({marker,revision,fingerprintValue})=>{
    const id='race-student-123';const now=new Date().toISOString();
    localStorage.setItem('mathnikita:accounts:registry:v1',JSON.stringify({version:1,profiles:[{id,name:'Никита',avatar:'🐱',pinSalt:'salt',pinHash:'hash',createdAt:now,lastUsedAt:now,cloud:{studentCode:'MN-RACE123',token:'race-token-12345678901234567890',revision,linkedAt:now,lastSyncedAt:now}}]}));
    localStorage.setItem('mathnikita:accounts:workspace-owner:v1',id);
    localStorage.setItem(`mathnikita:accounts:profile-data:${id}:v1`,JSON.stringify({version:1,updatedAt:now,storage:{'mathnikita:race-marker':marker}}));
    localStorage.setItem(`mathnikita:accounts:cloud-baseline:${id}:v1`,JSON.stringify({version:1,fingerprints:{'mathnikita:race-marker':fingerprintValue}}));
    localStorage.setItem('mathnikita:race-marker',marker);
    sessionStorage.setItem('mathnikita:accounts:session:v1',id);
  },{marker,revision,fingerprintValue:fingerprint(marker)});
}

async function openLinkedApp(page:Page){
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await expect(page.getByRole('button',{name:/Сменить ученика\. Сейчас Никита/})).toBeVisible();
}

test('edit made while a successful push is in flight is sent in a follow-up sync',async({page})=>{
  await seedLinkedProfile(page);
  await page.route('**/api/cloud/snapshot',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,student:{id:'race-student-123',name:'Никита',code:'MN-RACE123'},revision:1,entries:{'mathnikita:race-marker':'v1'}})}));
  let firstStartedResolve!:()=>void;const firstStarted=new Promise<void>(resolve=>firstStartedResolve=resolve);
  let releaseFirst!:()=>void;const firstRelease=new Promise<void>(resolve=>releaseFirst=resolve);
  let requestCount=0;let secondChanges:Record<string,string|null>|null=null;let secondResolve!:()=>void;const secondSeen=new Promise<void>(resolve=>secondResolve=resolve);
  await page.route('**/api/cloud/sync',async route=>{
    requestCount+=1;const body=route.request().postDataJSON() as {baseRevision:number;changes:Record<string,string|null>};
    if(requestCount===1){expect(body.changes['mathnikita:race-marker']).toBe('v2');firstStartedResolve();await firstRelease;await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,revision:2,updatedAt:new Date().toISOString()})});return}
    secondChanges=body.changes;await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,revision:3,updatedAt:new Date().toISOString()})});secondResolve();
  });
  await openLinkedApp(page);
  await page.evaluate(()=>{localStorage.setItem('mathnikita:race-marker','v2');window.dispatchEvent(new Event('online'))});
  await firstStarted;
  await page.evaluate(()=>localStorage.setItem('mathnikita:race-marker','v3'));
  releaseFirst();
  await secondSeen;
  expect(secondChanges?.['mathnikita:race-marker']).toBe('v3');
  expect(await page.evaluate(()=>localStorage.getItem('mathnikita:race-marker'))).toBe('v3');
});

test('edit made while a 409 conflict is in flight survives reconciliation',async({page})=>{
  await seedLinkedProfile(page);
  await page.route('**/api/cloud/snapshot',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,student:{id:'race-student-123',name:'Никита',code:'MN-RACE123'},revision:1,entries:{'mathnikita:race-marker':'v1'}})}));
  let firstStartedResolve!:()=>void;const firstStarted=new Promise<void>(resolve=>firstStartedResolve=resolve);
  let releaseConflict!:()=>void;const conflictRelease=new Promise<void>(resolve=>releaseConflict=resolve);
  let requestCount=0;let retryChanges:Record<string,string|null>|null=null;let retryResolve!:()=>void;const retrySeen=new Promise<void>(resolve=>retryResolve=resolve);
  await page.route('**/api/cloud/sync',async route=>{
    requestCount+=1;const body=route.request().postDataJSON() as {baseRevision:number;changes:Record<string,string|null>};
    if(requestCount===1){expect(body.changes['mathnikita:race-marker']).toBe('v2');firstStartedResolve();await conflictRelease;await route.fulfill({status:409,contentType:'application/json',body:JSON.stringify({error:'revision_conflict',revision:2,entries:{'mathnikita:race-marker':'remote-v2','mathnikita:remote-only':'kept'}})});return}
    retryChanges=body.changes;expect(body.baseRevision).toBe(2);await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,revision:3,updatedAt:new Date().toISOString()})});retryResolve();
  });
  await openLinkedApp(page);
  await page.evaluate(()=>{localStorage.setItem('mathnikita:race-marker','v2');window.dispatchEvent(new Event('online'))});
  await firstStarted;
  await page.evaluate(()=>localStorage.setItem('mathnikita:race-marker','v3'));
  releaseConflict();
  await retrySeen;
  expect(retryChanges?.['mathnikita:race-marker']).toBe('v3');
  await expect.poll(()=>page.evaluate(()=>localStorage.getItem('mathnikita:race-marker'))).toBe('v3');
  expect(await page.evaluate(()=>localStorage.getItem('mathnikita:remote-only'))).toBe('kept');
});

test('edit made while a clean remote pull is in flight is merged and then uploaded',async({page})=>{
  await seedLinkedProfile(page);
  let pullStartedResolve!:()=>void;const pullStarted=new Promise<void>(resolve=>pullStartedResolve=resolve);
  let releasePull!:()=>void;const pullRelease=new Promise<void>(resolve=>releasePull=resolve);
  await page.route('**/api/cloud/snapshot',async route=>{pullStartedResolve();await pullRelease;await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,student:{id:'race-student-123',name:'Никита',code:'MN-RACE123'},revision:2,entries:{'mathnikita:race-marker':'remote-v2','mathnikita:remote-only':'kept'}})})});
  let pushedChanges:Record<string,string|null>|null=null;let pushResolve!:()=>void;const pushSeen=new Promise<void>(resolve=>pushResolve=resolve);
  await page.route('**/api/cloud/sync',async route=>{const body=route.request().postDataJSON() as {baseRevision:number;changes:Record<string,string|null>};pushedChanges=body.changes;expect(body.baseRevision).toBe(2);await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,revision:3,updatedAt:new Date().toISOString()})});pushResolve()});
  await openLinkedApp(page);
  await pullStarted;
  await page.evaluate(()=>localStorage.setItem('mathnikita:race-marker','local-v2'));
  releasePull();
  await pushSeen;
  expect(pushedChanges?.['mathnikita:race-marker']).toBe('local-v2');
  await expect.poll(()=>page.evaluate(()=>localStorage.getItem('mathnikita:race-marker'))).toBe('local-v2');
  expect(await page.evaluate(()=>localStorage.getItem('mathnikita:remote-only'))).toBe('kept');
});
