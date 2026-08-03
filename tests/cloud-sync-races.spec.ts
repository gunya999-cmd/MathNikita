import {expect,test,type Page, type Route} from '@playwright/test';

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
  await expect(page.getByLabel(/Облако: Прогресс сохранён/)).toBeVisible();
}

async function waitForReconcileReload(page:Page,promise:Promise<void>){
  const reload=page.waitForEvent('load');
  await promise;
  await reload;
  await expect(page.getByRole('button',{name:/Сменить ученика\. Сейчас Никита/})).toBeVisible();
}

function applyServerChanges(entries:Record<string,string>,changes:Record<string,string|null>){
  Object.entries(changes).forEach(([key,value])=>{if(value===null)delete entries[key];else entries[key]=value});
}

async function fulfillSync(route:Route,revision:number){
  await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,revision,updatedAt:new Date().toISOString()})});
}

test('edit made while a successful push is in flight is sent in a follow-up sync',async({page})=>{
  await seedLinkedProfile(page);
  let serverRevision=1;const serverEntries:Record<string,string>={'mathnikita:race-marker':'v1'};
  await page.route('**/api/cloud/snapshot',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,student:{id:'race-student-123',name:'Никита',code:'MN-RACE123'},revision:serverRevision,entries:serverEntries})}));
  let firstStartedResolve!:()=>void;const firstStarted=new Promise<void>(resolve=>firstStartedResolve=resolve);
  let releaseFirst!:()=>void;const firstRelease=new Promise<void>(resolve=>releaseFirst=resolve);
  let secondChanges:Record<string,string|null>|null=null;let secondResolve!:()=>void;const secondSeen=new Promise<void>(resolve=>secondResolve=resolve);
  let firstBase=-1;let targetStarted=false;
  await page.route('**/api/cloud/sync',async route=>{
    const body=route.request().postDataJSON() as {baseRevision:number;changes:Record<string,string|null>};const marker=body.changes['mathnikita:race-marker'];
    if(marker==='v2'&&!targetStarted){targetStarted=true;firstBase=body.baseRevision;firstStartedResolve();await firstRelease;applyServerChanges(serverEntries,body.changes);serverRevision=body.baseRevision+1;await fulfillSync(route,serverRevision);return}
    if(marker==='v3'&&targetStarted){expect(body.baseRevision).toBe(firstBase+1);secondChanges=body.changes;applyServerChanges(serverEntries,body.changes);serverRevision=body.baseRevision+1;await fulfillSync(route,serverRevision);secondResolve();return}
    applyServerChanges(serverEntries,body.changes);serverRevision=body.baseRevision+1;await fulfillSync(route,serverRevision);
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
  let serverRevision=1;let serverEntries:Record<string,string>={'mathnikita:race-marker':'v1'};
  await page.route('**/api/cloud/snapshot',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,student:{id:'race-student-123',name:'Никита',code:'MN-RACE123'},revision:serverRevision,entries:serverEntries})}));
  let firstStartedResolve!:()=>void;const firstStarted=new Promise<void>(resolve=>firstStartedResolve=resolve);
  let releaseConflict!:()=>void;const conflictRelease=new Promise<void>(resolve=>releaseConflict=resolve);
  let retryChanges:Record<string,string|null>|null=null;let retryResolve!:()=>void;const retrySeen=new Promise<void>(resolve=>retryResolve=resolve);
  let conflictRevision=-1;let targetStarted=false;
  await page.route('**/api/cloud/sync',async route=>{
    const body=route.request().postDataJSON() as {baseRevision:number;changes:Record<string,string|null>};const marker=body.changes['mathnikita:race-marker'];
    if(marker==='v2'&&!targetStarted){targetStarted=true;firstStartedResolve();await conflictRelease;conflictRevision=body.baseRevision+1;serverRevision=conflictRevision;serverEntries={...serverEntries,'mathnikita:race-marker':'remote-v2','mathnikita:remote-only':'kept'};await route.fulfill({status:409,contentType:'application/json',body:JSON.stringify({error:'revision_conflict',revision:serverRevision,entries:serverEntries})});return}
    if(targetStarted&&marker==='v3'){retryChanges=body.changes;expect(body.baseRevision).toBe(conflictRevision);applyServerChanges(serverEntries,body.changes);serverRevision=body.baseRevision+1;await fulfillSync(route,serverRevision);retryResolve();return}
    applyServerChanges(serverEntries,body.changes);serverRevision=body.baseRevision+1;await fulfillSync(route,serverRevision);
  });
  await openLinkedApp(page);
  await page.evaluate(()=>{localStorage.setItem('mathnikita:race-marker','v2');window.dispatchEvent(new Event('online'))});
  await firstStarted;
  await page.evaluate(()=>localStorage.setItem('mathnikita:race-marker','v3'));
  const reloaded=waitForReconcileReload(page,retrySeen);
  releaseConflict();
  await reloaded;
  expect(retryChanges?.['mathnikita:race-marker']).toBe('v3');
  expect(await page.evaluate(()=>localStorage.getItem('mathnikita:race-marker'))).toBe('v3');
  expect(await page.evaluate(()=>localStorage.getItem('mathnikita:remote-only'))).toBe('kept');
});

test('edit made while a clean remote pull is in flight is merged and then uploaded',async({page})=>{
  await seedLinkedProfile(page);
  let serverRevision=1;let serverEntries:Record<string,string>={'mathnikita:race-marker':'v1'};
  let holdPull=false;let pullStartedResolve!:()=>void;const pullStarted=new Promise<void>(resolve=>pullStartedResolve=resolve);
  let releasePull!:()=>void;const pullRelease=new Promise<void>(resolve=>releasePull=resolve);
  let remoteRevision=-1;
  await page.route('**/api/cloud/snapshot',async route=>{
    if(!holdPull){await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,student:{id:'race-student-123',name:'Никита',code:'MN-RACE123'},revision:serverRevision,entries:serverEntries})});return}
    holdPull=false;pullStartedResolve();await pullRelease;remoteRevision=serverRevision+1;serverRevision=remoteRevision;serverEntries={...serverEntries,'mathnikita:race-marker':'remote-v2','mathnikita:remote-only':'kept'};
    await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,student:{id:'race-student-123',name:'Никита',code:'MN-RACE123'},revision:serverRevision,entries:serverEntries})});
  });
  let pushedChanges:Record<string,string|null>|null=null;let pushResolve!:()=>void;const pushSeen=new Promise<void>(resolve=>pushResolve=resolve);
  await page.route('**/api/cloud/sync',async route=>{
    const body=route.request().postDataJSON() as {baseRevision:number;changes:Record<string,string|null>};
    if(remoteRevision>=0&&body.changes['mathnikita:race-marker']==='local-v2'){pushedChanges=body.changes;expect(body.baseRevision).toBe(remoteRevision);applyServerChanges(serverEntries,body.changes);serverRevision=body.baseRevision+1;await fulfillSync(route,serverRevision);pushResolve();return}
    applyServerChanges(serverEntries,body.changes);serverRevision=body.baseRevision+1;await fulfillSync(route,serverRevision);
  });
  await openLinkedApp(page);
  holdPull=true;
  await page.evaluate(()=>window.dispatchEvent(new Event('online')));
  await pullStarted;
  await page.evaluate(()=>localStorage.setItem('mathnikita:race-marker','local-v2'));
  const reloaded=waitForReconcileReload(page,pushSeen);
  releasePull();
  await reloaded;
  expect(pushedChanges?.['mathnikita:race-marker']).toBe('local-v2');
  expect(await page.evaluate(()=>localStorage.getItem('mathnikita:race-marker'))).toBe('local-v2');
  expect(await page.evaluate(()=>localStorage.getItem('mathnikita:remote-only'))).toBe('kept');
});
