import {fetchCloudSnapshot,loginCloudStudent,pushCloudChanges,registerCloudStudent,type CloudAuthResponse,type CloudConflictResponse} from './cloudStudentApi';
import {
  getAuthenticatedStudentProfile,
  getCloudBaseline,
  getCurrentStudentStorageSnapshot,
  getStudentProfile,
  replaceActiveStudentStorage,
  setCloudBaseline,
  updateStudentCloudLink,
  updateStudentCloudSession,
} from './studentProfiles';

export type CloudSyncPhase='local'|'syncing'|'saved'|'offline'|'needs-login'|'error';
export type CloudSyncStatus={phase:CloudSyncPhase;label:string;at:string};

export const CLOUD_RECONCILED_EVENT='mathnikita-cloud-reconciled';
const STATUS_EVENT='mathnikita-cloud-status';
const syncLocks=new Map<string,Promise<void>>();

function emit(phase:CloudSyncPhase,label:string){
  const detail:CloudSyncStatus={phase,label,at:new Date().toISOString()};
  window.dispatchEvent(new CustomEvent(STATUS_EVENT,{detail}));
  return detail;
}
function notifyReconciled(){window.dispatchEvent(new Event(CLOUD_RECONCILED_EVENT))}

function fingerprint(value:string){
  let hash=2166136261;
  for(let index=0;index<value.length;index+=1){hash^=value.charCodeAt(index);hash=Math.imul(hash,16777619)}
  return`${value.length}:${(hash>>>0).toString(16)}`;
}

export function storageFingerprints(storage:Record<string,string>){
  return Object.fromEntries(Object.entries(storage).map(([key,value])=>[key,fingerprint(value)]));
}

function computeChanges(storage:Record<string,string>,baseline:Record<string,string>){
  const changes:Record<string,string|null>={};
  const keys=new Set([...Object.keys(storage),...Object.keys(baseline)]);
  keys.forEach(key=>{
    const current=storage[key];
    if(current===undefined){if(key in baseline)changes[key]=null;return}
    if(fingerprint(current)!==baseline[key])changes[key]=current;
  });
  return changes;
}

function applyLocalChanges(remote:Record<string,string>,local:Record<string,string>,baseline:Record<string,string>){
  const merged={...remote};
  const changes=computeChanges(local,baseline);
  Object.entries(changes).forEach(([key,value])=>{if(value===null)delete merged[key];else merged[key]=value});
  return merged;
}

function baselineAfterAcceptedChanges(baseline:Record<string,string>,changes:Record<string,string|null>){
  const accepted={...baseline};
  Object.entries(changes).forEach(([key,value])=>{if(value===null)delete accepted[key];else accepted[key]=fingerprint(value)});
  return accepted;
}

function linkedAt(profileId:string){return getStudentProfile(profileId)?.cloud?.linkedAt??new Date().toISOString()}

async function reconcileRemote(profileId:string,response:{token:string;revision:number;entries:Record<string,string>;student:{code:string}},preserveLocalChanges:boolean){
  const local=getCurrentStudentStorageSnapshot();const baseline=getCloudBaseline(profileId);
  const next=preserveLocalChanges?applyLocalChanges(response.entries,local,baseline):response.entries;
  replaceActiveStudentStorage(profileId,next);
  updateStudentCloudLink(profileId,{studentCode:response.student.code,token:response.token,revision:response.revision,linkedAt:linkedAt(profileId),lastSyncedAt:new Date().toISOString()});
  setCloudBaseline(profileId,storageFingerprints(response.entries));
}

export async function connectLocalProfileToCloud(profileId:string,pin:string){
  const profile=getStudentProfile(profileId);if(!profile)throw new Error('Профиль ученика не найден.');
  const active=getAuthenticatedStudentProfile();if(active?.id!==profileId)throw new Error('Сначала войдите в этот профиль.');
  emit('syncing','Создаю облачную копию…');
  const response=await registerCloudStudent({studentId:profile.id,name:profile.name,pin,entries:getCurrentStudentStorageSnapshot()});
  await reconcileRemote(profileId,response,true);
  await syncStudentCloudNow(profileId);
  emit('saved','Прогресс сохранён в облаке');
  return{studentCode:response.student.code,recoveryCode:response.recoveryCode??'',resumed:Boolean(response.resumed)};
}

export async function refreshCloudLogin(profileId:string,pin:string){
  const profile=getStudentProfile(profileId);if(!profile?.cloud)return null;
  emit('syncing','Проверяю облачный прогресс…');
  const response=await loginCloudStudent(profile.cloud.studentCode,pin);
  await reconcileRemote(profileId,response,true);
  await syncStudentCloudNow(profileId);
  return response;
}

async function runSync(profileId:string,pullIfClean:boolean,retryConflict:boolean,followUp=true){
  const active=getAuthenticatedStudentProfile();const profile=getStudentProfile(profileId);
  if(active?.id!==profileId||!profile?.cloud)return;
  const requestLocal=getCurrentStudentStorageSnapshot();const baselineAtStart=getCloudBaseline(profileId);const changes=computeChanges(requestLocal,baselineAtStart);
  if(Object.keys(changes).length){
    emit('syncing','Синхронизация…');
    const response=await pushCloudChanges(profile.cloud.token,profile.cloud.revision,changes);
    if('error'in response){
      const conflict=response as CloudConflictResponse;
      const freshLocal=getCurrentStudentStorageSnapshot();
      const merged=applyLocalChanges(conflict.entries,freshLocal,baselineAtStart);
      replaceActiveStudentStorage(profileId,merged);
      setCloudBaseline(profileId,storageFingerprints(conflict.entries));
      updateStudentCloudSession(profileId,{revision:conflict.revision});
      if(retryConflict){await runSync(profileId,false,false,followUp);notifyReconciled();return}
      emit('error','Конфликт прогресса сохранён локально');
      notifyReconciled();
      return;
    }
    const acceptedBaseline=baselineAfterAcceptedChanges(baselineAtStart,changes);
    setCloudBaseline(profileId,acceptedBaseline);
    updateStudentCloudSession(profileId,{revision:response.revision,lastSyncedAt:response.updatedAt});
    const latestLocal=getCurrentStudentStorageSnapshot();
    const editsMadeInFlight=computeChanges(latestLocal,acceptedBaseline);
    if(followUp&&Object.keys(editsMadeInFlight).length){await runSync(profileId,false,true,false);return}
    emit('saved',Object.keys(editsMadeInFlight).length?'Есть новые изменения · сохраняю следующим шагом':'Прогресс сохранён');
    return;
  }
  if(!pullIfClean){emit('saved','Прогресс сохранён');return}
  const remote=await fetchCloudSnapshot(profile.cloud.token);
  const freshLocal=getCurrentStudentStorageSnapshot();
  const editsMadeDuringPull=computeChanges(freshLocal,baselineAtStart);
  if(remote.revision>profile.cloud.revision){
    const merged=applyLocalChanges(remote.entries,freshLocal,baselineAtStart);
    replaceActiveStudentStorage(profileId,merged);
    setCloudBaseline(profileId,storageFingerprints(remote.entries));
    updateStudentCloudSession(profileId,{revision:remote.revision,lastSyncedAt:new Date().toISOString()});
    if(followUp&&Object.keys(editsMadeDuringPull).length)await runSync(profileId,false,true,false);
    emit('saved','Получен прогресс с другого устройства');
    notifyReconciled();
    return;
  }
  updateStudentCloudSession(profileId,{revision:remote.revision,lastSyncedAt:new Date().toISOString()});
  if(followUp&&Object.keys(editsMadeDuringPull).length){await runSync(profileId,false,true,false);return}
  emit('saved','Прогресс сохранён');
}

export function syncStudentCloudNow(profileId:string,pullIfClean=false){
  const existing=syncLocks.get(profileId);if(existing)return existing;
  const promise=runSync(profileId,pullIfClean,true).catch(error=>{
    const message=error instanceof Error?error.message:'';
    if(/Unauthorized/i.test(message)){emit('needs-login','Нужно снова войти в облако');return}
    if(!navigator.onLine||/Нет связи|недоступно|вовремя/i.test(message)){emit('offline','Офлайн · прогресс на устройстве');return}
    emit('error','Не удалось синхронизировать');
  }).finally(()=>syncLocks.delete(profileId));
  syncLocks.set(profileId,promise);
  return promise;
}

export function startStudentCloudSync(profileId:string){
  const profile=getStudentProfile(profileId);
  if(!profile?.cloud){emit('local','Только на этом устройстве');return()=>{}};
  let tick=0;let stopped=false;
  const run=()=>{if(stopped)return;tick+=1;void syncStudentCloudNow(profileId,tick%10===0)};
  void syncStudentCloudNow(profileId,true);
  const interval=window.setInterval(run,3_000);
  const online=()=>void syncStudentCloudNow(profileId,true);
  window.addEventListener('online',online);
  return()=>{stopped=true;window.clearInterval(interval);window.removeEventListener('online',online)};
}

export function subscribeCloudSyncStatus(listener:(status:CloudSyncStatus)=>void){
  const handler=(event:Event)=>listener((event as CustomEvent<CloudSyncStatus>).detail);
  window.addEventListener(STATUS_EVENT,handler);
  return()=>window.removeEventListener(STATUS_EVENT,handler);
}

export function cloudReceiptFromResponse(response:CloudAuthResponse){return{studentCode:response.student.code,recoveryCode:response.recoveryCode??''}}
