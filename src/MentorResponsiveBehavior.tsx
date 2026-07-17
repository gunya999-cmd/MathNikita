import { useEffect, type RefObject } from 'react';

type Props = {
  rootRef: RefObject<HTMLElement | null>;
  lessonNumber: number;
  mode: 'opening' | 'lesson';
};

export function MentorResponsiveBehavior({ rootRef, lessonNumber, mode }: Props) {
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
