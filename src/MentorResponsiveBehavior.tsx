import { useEffect, type RefObject } from 'react';

type Props = {
  rootRef: RefObject<HTMLElement | null>;
  lessonNumber: number;
  mode: 'opening' | 'lesson';
};

export function MentorResponsiveBehavior({ rootRef, lessonNumber, mode }: Props) {
  useEffect(()=>{
    if(![4,5,6].includes(lessonNumber)||mode!=='opening')return;
    const root=rootRef.current;
    if(!root)return;
    const normalizeDuration=()=>{
      const durationBlock=root.querySelector<HTMLElement>('.opening-screen:not([hidden]) .lesson-opening-plan > div');
      const label=durationBlock?.querySelector<HTMLElement>('span');
      const value=durationBlock?.querySelector<HTMLElement>('strong');
      if(label)label.textContent='Время урока';
      if(value)value.textContent='измеряется';
    };
    normalizeDuration();
    const observer=new MutationObserver(normalizeDuration);
    observer.observe(root,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['hidden']});
    return()=>observer.disconnect();
  },[rootRef,lessonNumber,mode]);

  useEffect(() => {
    if (!window.matchMedia('(max-width: 1279px)').matches) return;
    const timer = window.setTimeout(() => {
      const root = rootRef.current;
      const closeButton = root?.querySelector<HTMLButtonElement>('.cat-mentor-panel > header > button');
      closeButton?.click();
    }, 120);
    return () => window.clearTimeout(timer);
  }, [rootRef, lessonNumber, mode]);

  return null;
}
