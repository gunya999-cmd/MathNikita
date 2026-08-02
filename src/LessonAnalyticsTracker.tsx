import { useEffect,useRef,type RefObject } from 'react';
import { addAnalyticsTime,recordAnalyticsEvent,startAnalyticsSession,type AnalyticsArea } from './studentAnalytics';

type Props={rootRef:RefObject<HTMLElement|null>;lessonNumber:number;active:boolean};
type AttemptState={wrong:number};

function visible(node:Element|null){if(!(node instanceof HTMLElement))return false;return!node.hidden&&!node.closest('[hidden]')}
function currentArea(root:HTMLElement):AnalyticsArea{
  if(root.querySelector('.opening-screen:not([hidden])'))return'opening';
  if(root.querySelector('.lesson-reflection .extended-practice[data-practice-task]'))return'practice';
  return'main';
}
function currentTask(root:HTMLElement){
  const practice=root.querySelector<HTMLElement>('.lesson-reflection .extended-practice[data-practice-task]');
  if(practice&&visible(practice)){
    const id=practice.dataset.practiceTask??'practice';const label=practice.querySelector<HTMLElement>('h3')?.textContent?.trim()??`Практика ${id}`;return{key:`practice:${id}`,label,area:'practice' as const,scope:practice};
  }
  const stage=root.querySelector<HTMLElement>('.lesson-runtime:not([hidden]) .interactive-stage[data-stage-id]');
  if(stage&&visible(stage)){
    const id=stage.dataset.stageId??'stage';const label=stage.querySelector<HTMLElement>('.activity-area h3')?.textContent?.trim()??stage.querySelector<HTMLElement>('.stage-copy h2')?.textContent?.trim()??`Этап ${id}`;return{key:`stage:${id}`,label,area:'main' as const,scope:stage};
  }
  return null;
}
function feedbackState(scope:HTMLElement){
  const correct=scope.querySelector<HTMLElement>('.extended-practice-feedback.is-correct,.instant-feedback.good,.feedback.good,.answer-feedback.good,.is-correct[role="status"]');
  if(correct&&visible(correct))return'correct' as const;
  const wrong=scope.querySelector<HTMLElement>('.extended-practice-feedback.is-wrong,.instant-feedback.bad,.feedback.bad,.answer-feedback.bad,.is-wrong[role="alert"]');
  if(wrong&&visible(wrong))return'wrong' as const;
  return'idle' as const;
}
function isCheckAction(target:HTMLElement){
  const button=target.closest<HTMLButtonElement>('button');if(!button)return false;
  const text=button.textContent?.trim().toLowerCase()??'';
  return Boolean(button.matches('.check-button,.extended-practice-check,.practice-check,.lesson-check,.answer-check')||/проверить|готово|ответить/.test(text));
}

export function LessonAnalyticsTracker({rootRef,lessonNumber,active}:Props){
  const attemptsRef=useRef<Record<string,AttemptState>>({});
  const lastInteractionRef=useRef(Date.now());
  const pendingAssessmentRef=useRef<number|null>(null);
  useEffect(()=>{
    if(!active)return;
    const root=rootRef.current;if(!root)return;
    attemptsRef.current={};lastInteractionRef.current=Date.now();startAnalyticsSession(lessonNumber);
    let screen=0,focus=0,engaged=0;
    const touch=()=>{lastInteractionRef.current=Date.now()};
    const flush=()=>{if(screen||focus||engaged){addAnalyticsTime(lessonNumber,{screenSeconds:screen,focusSeconds:focus,activeSeconds:engaged});screen=0;focus=0;engaged=0}};
    const timer=window.setInterval(()=>{
      if(document.visibilityState==='visible'){
        screen+=1;
        if(document.hasFocus()){
          focus+=1;
          if(Date.now()-lastInteractionRef.current<60_000)engaged+=1;
        }
      }
      if(screen>=5)flush();
    },1000);
    const scheduleAssessment=()=>{
      if(pendingAssessmentRef.current!==null)window.clearTimeout(pendingAssessmentRef.current);
      pendingAssessmentRef.current=window.setTimeout(()=>{
        pendingAssessmentRef.current=null;const task=currentTask(root);if(!task)return;const state=feedbackState(task.scope);if(state==='idle')return;
        const attempt=attemptsRef.current[task.key]??{wrong:0};
        if(state==='wrong'){
          attempt.wrong+=1;attemptsRef.current[task.key]=attempt;
          recordAnalyticsEvent({lessonNumber,type:'answer_wrong',area:task.area,key:task.key,label:task.label});
          return;
        }
        recordAnalyticsEvent({lessonNumber,type:'answer_correct',area:task.area,key:task.key,label:task.label,firstTry:attempt.wrong===0,recovered:attempt.wrong>0});
        delete attemptsRef.current[task.key];
      },140);
    };
    const click=(event:Event)=>{
      touch();const target=event.target;if(!(target instanceof HTMLElement))return;
      const button=target.closest<HTMLButtonElement>('button');const text=button?.textContent?.trim()??'';const lower=text.toLowerCase();const area=currentArea(root);
      if(button&&isCheckAction(target))scheduleAssessment();
      if(button&&/подсказ/.test(lower))recordAnalyticsEvent({lessonNumber,type:'hint',area,key:currentTask(root)?.key,label:text});
      if(button&&button.closest('.cat-mentor-actions,.practice-pythagoras-actions')&&/объясни иначе|дай пример|подсказ|почему так/.test(lower))recordAnalyticsEvent({lessonNumber,type:'mentor_action',area,key:currentTask(root)?.key,label:text});
      if(button&&button.closest('.voice-narrator,.extended-practice-voice')&&/слушать|озвучить|повторить/.test(lower))recordAnalyticsEvent({lessonNumber,type:'narration',area,key:currentTask(root)?.key,label:text});
    };
    const keydown=(event:KeyboardEvent)=>{touch();if(event.key==='Enter'&&(event.target as HTMLElement)?.closest('input'))scheduleAssessment()};
    const completed=(event:Event)=>{
      const detail=(event as CustomEvent<{lessonNumber?:number}>).detail;if(detail?.lessonNumber!==lessonNumber)return;
      recordAnalyticsEvent({lessonNumber,type:'lesson_completed',area:'practice',label:'Урок завершён'});
    };
    root.addEventListener('pointerdown',touch,true);root.addEventListener('scroll',touch,true);root.addEventListener('click',click,true);root.addEventListener('keydown',keydown,true);window.addEventListener('mathnikita-lesson-completed',completed);
    return()=>{
      flush();window.clearInterval(timer);if(pendingAssessmentRef.current!==null)window.clearTimeout(pendingAssessmentRef.current);
      root.removeEventListener('pointerdown',touch,true);root.removeEventListener('scroll',touch,true);root.removeEventListener('click',click,true);root.removeEventListener('keydown',keydown,true);window.removeEventListener('mathnikita-lesson-completed',completed);
    };
  },[rootRef,lessonNumber,active]);
  return null;
}
