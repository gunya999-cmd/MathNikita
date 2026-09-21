import { useEffect,useState } from 'react';
import type { LearnerState } from './learningEngine';
import { buildDashboardSnapshot,type DashboardSnapshot } from './studentAnalytics';
import { StudentDashboardV4 } from './StudentDashboardV4';
import { ParentDashboardV3 } from './ParentDashboardV3';

type Props={mode:'student'|'parent';state:LearnerState;onContinue?:()=>void};

function useSnapshot(){
  const[snapshot,setSnapshot]=useState<DashboardSnapshot>(()=>buildDashboardSnapshot());
  useEffect(()=>{
    const refresh=()=>setSnapshot(buildDashboardSnapshot());
    window.addEventListener('mathnikita-analytics-updated',refresh);
    window.addEventListener('storage',refresh);
    return()=>{window.removeEventListener('mathnikita-analytics-updated',refresh);window.removeEventListener('storage',refresh)};
  },[]);
  return snapshot;
}

export function LearnerDashboard({mode,state,onContinue}:Props){
  const snapshot=useSnapshot();
  return mode==='student'?<StudentDashboardV4 snapshot={snapshot} onContinue={onContinue}/>:<ParentDashboardV3 snapshot={snapshot} state={state}/>;
}
