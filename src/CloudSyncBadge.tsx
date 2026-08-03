import {useEffect,useState} from 'react';
import {subscribeCloudSyncStatus,type CloudSyncStatus} from './cloudStudentSync';
import type {StudentProfile} from './studentProfiles';

export function CloudSyncBadge({profile}:{profile:StudentProfile}){
  const [status,setStatus]=useState<CloudSyncStatus>(()=>profile.cloud?{phase:'syncing',label:'Проверяю облако…',at:new Date().toISOString()}:{phase:'local',label:'Только на устройстве',at:new Date().toISOString()});
  useEffect(()=>subscribeCloudSyncStatus(setStatus),[]);
  return <div className={`cloud-sync-badge ${status.phase}`} title={profile.cloud?.studentCode??'Локальный профиль'}><span>{status.phase==='syncing'?'↻':status.phase==='saved'?'✓':status.phase==='offline'?'◌':status.phase==='local'?'○':'!'}</span><b>{status.label}</b></div>;
}
