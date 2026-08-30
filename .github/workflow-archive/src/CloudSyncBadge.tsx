import {useEffect,useState} from 'react';
import {subscribeCloudSyncStatus,type CloudSyncStatus} from './cloudStudentSync';
import type {StudentProfile} from './studentProfiles';

export function CloudSyncBadge({profile}:{profile:StudentProfile}){
  const [status,setStatus]=useState<CloudSyncStatus>(()=>profile.cloud?{phase:'syncing',label:'Проверяю облако…',at:new Date().toISOString()}:{phase:'local',label:'Только на устройстве',at:new Date().toISOString()});
  useEffect(()=>subscribeCloudSyncStatus(setStatus),[]);
  const icon=status.phase==='syncing'?'↻':status.phase==='saved'?'✓':status.phase==='offline'?'◌':status.phase==='local'?'○':'!';
  return <div className="xp-pill" title={profile.cloud?.studentCode??'Локальный профиль'} aria-label={`Облако: ${status.label}`}>{icon} <b>{status.label}</b></div>;
}
