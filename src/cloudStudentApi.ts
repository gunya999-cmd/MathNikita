export type CloudStudentIdentity={id:string;name:string;code:string};
export type CloudAuthResponse={ok:true;student:CloudStudentIdentity;token:string;revision:number;entries:Record<string,string>;recoveryCode?:string;resumed?:boolean};
export type CloudSnapshotResponse={ok:true;student:CloudStudentIdentity;revision:number;entries:Record<string,string>};
export type CloudSyncResponse={ok:true;revision:number;updatedAt:string};
export type CloudConflictResponse={error:'revision_conflict';revision:number;entries:Record<string,string>};

type ApiErrorPayload={error?:string;retryAfterSeconds?:number;[key:string]:unknown};

export class CloudStudentApiError extends Error{
  status:number;
  payload:ApiErrorPayload;
  constructor(status:number,payload:ApiErrorPayload){super(typeof payload.error==='string'?payload.error:`Cloud request failed (${status})`);this.name='CloudStudentApiError';this.status=status;this.payload=payload}
}

async function requestJson<T>(path:string,init:RequestInit={},timeoutMs=10_000):Promise<T>{
  const controller=new AbortController();const timer=window.setTimeout(()=>controller.abort(),timeoutMs);
  try{
    const response=await fetch(path,{...init,signal:controller.signal,headers:{'content-type':'application/json',...(init.headers??{})}});
    const text=await response.text();let payload:ApiErrorPayload={};
    try{payload=text?JSON.parse(text) as ApiErrorPayload:{}}catch{payload={error:response.ok?'Cloud API returned invalid JSON':'Облачное хранилище пока недоступно.'}}
    if(!response.ok)throw new CloudStudentApiError(response.status,payload);
    return payload as T;
  }catch(error){
    if(error instanceof CloudStudentApiError)throw error;
    if(error instanceof DOMException&&error.name==='AbortError')throw new Error('Облако не ответило вовремя. Локальный прогресс сохранён.');
    throw new Error('Нет связи с облачным хранилищем. Локальный прогресс сохранён.');
  }finally{window.clearTimeout(timer)}
}

export async function cloudStatus(){return requestJson<{ok:true;configured:boolean}>('/api/cloud/status',{method:'GET'},4_000)}

export async function registerCloudStudent(input:{studentId:string;name:string;pin:string;entries:Record<string,string>}){
  return requestJson<CloudAuthResponse>('/api/cloud/register',{method:'POST',body:JSON.stringify(input)});
}

export async function loginCloudStudent(code:string,pin:string){
  return requestJson<CloudAuthResponse>('/api/cloud/login',{method:'POST',body:JSON.stringify({code,pin})});
}

export async function recoverCloudStudent(code:string,recoveryCode:string,newPin:string){
  return requestJson<CloudAuthResponse>('/api/cloud/recover',{method:'POST',body:JSON.stringify({code,recoveryCode,newPin})});
}

export async function fetchCloudSnapshot(token:string){
  return requestJson<CloudSnapshotResponse>('/api/cloud/snapshot',{method:'GET',headers:{authorization:`Bearer ${token}`}});
}

export async function pushCloudChanges(token:string,baseRevision:number,changes:Record<string,string|null>){
  try{return await requestJson<CloudSyncResponse>('/api/cloud/sync',{method:'POST',headers:{authorization:`Bearer ${token}`},body:JSON.stringify({baseRevision,changes})})}
  catch(error){if(error instanceof CloudStudentApiError&&error.status===409&&error.payload.error==='revision_conflict')return error.payload as CloudConflictResponse;throw error}
}
