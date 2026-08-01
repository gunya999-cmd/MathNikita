import { useEffect, type RefObject } from 'react';
import { extendedPracticeStorageKey } from './extendedPracticeEngine';
import { loadLessonTiming,resetLessonTiming,saveLessonTiming } from './lessonTiming';

type SavedStage = { answer?: string; order?: string[] };
type SavedLesson = { version: 1; stages: Record<string, SavedStage> };
type Props = { rootRef: RefObject<HTMLElement | null>; lessonNumber: number; active: boolean };

const PREFIX = 'mathnikita-stage-responses-v1-lesson-';
const storageKey = (lessonNumber: number) => `${PREFIX}${lessonNumber}`;

function load(lessonNumber: number): SavedLesson {
  try {
    const parsed = JSON.parse(localStorage.getItem(storageKey(lessonNumber)) ?? 'null') as SavedLesson | null;
    return parsed?.version === 1 && parsed.stages ? parsed : { version: 1, stages: {} };
  } catch {
    return { version: 1, stages: {} };
  }
}

function save(lessonNumber: number, stageId: string, next: SavedStage) {
  const lesson = load(lessonNumber);
  lesson.stages[stageId] = { ...lesson.stages[stageId], ...next };
  localStorage.setItem(storageKey(lessonNumber), JSON.stringify(lesson));
}

function clearLessonCompletionState(lessonNumber:number){
  const practiceKey=extendedPracticeStorageKey(lessonNumber);
  localStorage.removeItem(practiceKey);
  localStorage.removeItem(`${practiceKey}:draft`);
  localStorage.removeItem(`mathnikita:reflection:${lessonNumber}`);
  localStorage.removeItem(`mathnikita:lesson-complete:${lessonNumber}`);
}

function nativeSetInputValue(input: HTMLInputElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
  setter?.call(input, value);
  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.dispatchEvent(new Event('change', { bubbles: true }));
}

export function LessonResponsePersistence({ rootRef, lessonNumber, active }: Props) {
  useEffect(()=>{
    if(!active)return;
    const root=rootRef.current;
    let timing=loadLessonTiming(lessonNumber);
    timing={...timing,sessions:timing.sessions+1,updatedAt:new Date().toISOString()};
    saveLessonTiming(lessonNumber,timing);
    let activeSeconds=timing.activeSeconds;
    let unsavedSeconds=0;
    let lastTick=performance.now();

    const flush=()=>{
      saveLessonTiming(lessonNumber,{
        version:1,
        activeSeconds,
        sessions:timing.sessions,
        updatedAt:new Date().toISOString(),
      });
      unsavedSeconds=0;
    };
    const tick=()=>{
      const now=performance.now();
      const delta=Math.min(Math.max((now-lastTick)/1000,0),2);
      lastTick=now;
      if(document.visibilityState!=='visible')return;
      activeSeconds+=delta;
      unsavedSeconds+=delta;
      if(unsavedSeconds>=5)flush();
    };
    const handleRestart=(event:Event)=>{
      const target=event.target as HTMLElement;
      const resetButton=target.closest<HTMLButtonElement>('.stage-counter button');
      if(!resetButton?.textContent?.includes('Начать заново'))return;
      clearLessonCompletionState(lessonNumber);
      resetLessonTiming(lessonNumber);
      activeSeconds=0;
      unsavedSeconds=0;
      lastTick=performance.now();
      timing={version:1,activeSeconds:0,sessions:1,updatedAt:new Date().toISOString()};
      saveLessonTiming(lessonNumber,timing);
      window.dispatchEvent(new CustomEvent('mathnikita-lesson-reset',{detail:{lessonNumber}}));
    };
    const timer=window.setInterval(tick,1000);
    const visibility=()=>{tick();lastTick=performance.now()};
    document.addEventListener('visibilitychange',visibility);
    root?.addEventListener('click',handleRestart,true);
    return()=>{
      tick();
      flush();
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange',visibility);
      root?.removeEventListener('click',handleRestart,true);
    };
  },[rootRef,lessonNumber,active]);

  useEffect(()=>{
    if(!active||lessonNumber!==5)return;
    const root=rootRef.current;
    if(!root)return;
    const normalizeLegacyLessonFive=()=>{
      const runtime=root.querySelector<HTMLElement>('.lesson-runtime:not([hidden])');
      if(!runtime)return;
      const duration=runtime.querySelector<HTMLElement>('.lesson-duration');
      if(duration&&duration.textContent!=='Фактическое время измеряется')duration.textContent='Фактическое время измеряется';
      const summary=runtime.querySelector<HTMLElement>('.summary-card');
      if(!summary)return;
      const blocks=Array.from(summary.querySelectorAll<HTMLElement>(':scope > div'));
      const status=blocks[2];
      const statusValue=status?.querySelector<HTMLElement>('b');
      const statusNote=status?.querySelector<HTMLElement>('small');
      if(statusValue&&statusValue.textContent==='Завершён')statusValue.textContent='Основная часть ✓';
      if(statusValue?.textContent==='Основная часть ✓'&&statusNote&&statusNote.textContent!=='обязательная практика впереди')statusNote.textContent='обязательная практика впереди';
      const progressLabel=runtime.querySelector<HTMLElement>('.lesson-controls > span');
      if(progressLabel?.textContent?.trim()==='100% урока')progressLabel.textContent='Основная часть пройдена';
    };
    normalizeLegacyLessonFive();
    const observer=new MutationObserver(normalizeLegacyLessonFive);
    observer.observe(root,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['hidden','data-stage-id']});
    return()=>observer.disconnect();
  },[rootRef,lessonNumber,active]);

  useEffect(() => {
    if (!active || lessonNumber > 3) return;
    const root = rootRef.current;
    if (!root) return;
    let restoring = false;
    let restoreTimer = 0;
    const getStage = () => root.querySelector<HTMLElement>('.lesson-runtime:not([hidden]) .interactive-stage');

    const capture = (event: Event) => {
      if (restoring) return;
      const target = event.target as HTMLElement;
      const resetButton = target.closest<HTMLButtonElement>('.stage-counter button');
      if (resetButton?.textContent?.includes('Начать заново')) {
        localStorage.removeItem(storageKey(lessonNumber));
        return;
      }
      const stage = getStage();
      if (!stage || !stage.contains(target)) return;
      const stageId = stage.dataset.stageId;
      if (!stageId) return;
      if (target instanceof HTMLInputElement) {
        save(lessonNumber, stageId, { answer: target.value });
        return;
      }
      const choice = target.closest<HTMLButtonElement>('.choice-grid button, .compare-board button, .number-line button');
      if (choice) {
        save(lessonNumber, stageId, { answer: choice.textContent?.trim() ?? '' });
        return;
      }
      const orderResult = target.closest<HTMLButtonElement>('.order-result button');
      const orderBank = target.closest<HTMLButtonElement>('.order-bank button');
      if (orderResult || orderBank) {
        window.setTimeout(() => {
          const current = getStage();
          if (!current || current.dataset.stageId !== stageId) return;
          const order = Array.from(current.querySelectorAll<HTMLButtonElement>('.order-result button'))
            .map(button => button.textContent?.replace(/^\d+\.\s*/, '').trim() ?? '')
            .filter(Boolean);
          save(lessonNumber, stageId, { order });
        }, 0);
      }
    };

    const restore = () => {
      window.clearTimeout(restoreTimer);
      restoreTimer = window.setTimeout(() => {
        const stage = getStage();
        const stageId = stage?.dataset.stageId;
        if (!stage || !stageId) return;
        const saved = load(lessonNumber).stages[stageId];
        if (!saved) return;
        restoring = true;
        try {
          const input = stage.querySelector<HTMLInputElement>('.inline-answer input');
          if (input && saved.answer !== undefined && input.value !== saved.answer) nativeSetInputValue(input, saved.answer);
          if (!input && saved.answer) {
            const buttons = Array.from(stage.querySelectorAll<HTMLButtonElement>('.choice-grid button, .compare-board button, .number-line button'));
            const selected = buttons.find(button => button.textContent?.trim() === saved.answer);
            if (selected && !selected.classList.contains('selected')) selected.click();
          }
          if (saved.order?.length) {
            const currentOrder = Array.from(stage.querySelectorAll<HTMLButtonElement>('.order-result button'))
              .map(button => button.textContent?.replace(/^\d+\.\s*/, '').trim() ?? '');
            if (currentOrder.length === 0) {
              for (const item of saved.order) {
                const button = Array.from(stage.querySelectorAll<HTMLButtonElement>('.order-bank button'))
                  .find(candidate => candidate.textContent?.trim() === item && !candidate.disabled);
                button?.click();
              }
            }
          }
        } finally {
          window.setTimeout(() => { restoring = false; }, 0);
        }
      }, 45);
    };

    root.addEventListener('input', capture, true);
    root.addEventListener('click', capture, true);
    const observer = new MutationObserver(restore);
    observer.observe(root, { subtree: true, childList: true, attributes: true, attributeFilter: ['data-stage-id', 'hidden'] });
    restore();
    return () => {
      window.clearTimeout(restoreTimer);
      observer.disconnect();
      root.removeEventListener('input', capture, true);
      root.removeEventListener('click', capture, true);
    };
  }, [rootRef, lessonNumber, active]);

  return null;
}
