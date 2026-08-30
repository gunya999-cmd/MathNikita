const STAGE_NARRATION_ATTR='data-mathnikita-stage-narration';
export const STAGE_NARRATION_STATE_EVENT='mathnikita-stage-narration-state';

type StageNarrationStateDetail={active:boolean;narrationId?:string};

export function isStageNarrationActive(){
  return typeof document!=='undefined'&&document.documentElement.getAttribute(STAGE_NARRATION_ATTR)==='active';
}

export function setStageNarrationActive(active:boolean,narrationId=''){
  if(typeof document!=='undefined'){
    if(active)document.documentElement.setAttribute(STAGE_NARRATION_ATTR,'active');
    else document.documentElement.removeAttribute(STAGE_NARRATION_ATTR);
  }
  if(typeof window!=='undefined')window.dispatchEvent(new CustomEvent<StageNarrationStateDetail>(STAGE_NARRATION_STATE_EVENT,{detail:{active,narrationId}}));
}

export function runWhenStageNarrationIdle(callback:()=>void){
  if(typeof window==='undefined'||!isStageNarrationActive()){callback();return()=>{}};
  let cancelled=false;
  const handler=(event:Event)=>{
    const detail=(event as CustomEvent<StageNarrationStateDetail>).detail;
    if(cancelled||detail?.active)return;
    cancelled=true;
    window.removeEventListener(STAGE_NARRATION_STATE_EVENT,handler);
    callback();
  };
  window.addEventListener(STAGE_NARRATION_STATE_EVENT,handler);
  return()=>{cancelled=true;window.removeEventListener(STAGE_NARRATION_STATE_EVENT,handler)};
}
