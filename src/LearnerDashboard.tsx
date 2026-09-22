import { useEffect,useState } from 'react';
import type { LearnerState } from './learningEngine';
import { buildDashboardSnapshot,type DashboardSnapshot } from './studentAnalytics';
import { StudentDashboardV4 } from './StudentDashboardV4';
import { ParentDashboardV3 } from './ParentDashboardV3';
import { PythagorasEntry } from './PythagorasEconomy';

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

function catStage(progress:number){
  if(progress>=75)return'Мастер';
  if(progress>=50)return'Знаток';
  if(progress>=25)return'Исследователь';
  if(progress>=10)return'Ученик';
  return'Котёнок';
}

export function LearnerDashboard({mode,state,onContinue}:Props){
  const snapshot=useSnapshot();
  if(mode==='parent')return <ParentDashboardV3 snapshot={snapshot} state={state}/>;
  return <>
    <StudentDashboardV4 snapshot={snapshot} state={state} onContinue={onContinue}/>
    <div className="py-floating-entry"><PythagorasEntry progress={snapshot.courseProgress} stage={catStage(snapshot.courseProgress)}/></div>
  </>;
}
