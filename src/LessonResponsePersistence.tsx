import { useEffect, type RefObject } from 'react';

type SavedStage = { answer?: string; order?: string[] };
type SavedLesson = { version: 1; stages: Record<string, SavedStage> };

type Props = { rootRef: RefObject<HTMLElement | null>; lessonNumber: number; active: boolean };

const PREFIX = 'mathnikita-stage-responses-v1-lesson-';

function storageKey(lessonNumber: number) {
  return `${PREFIX}${lessonNumber}`;
}

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

function nativeSetInputValue(input: HTMLInputElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
  setter?.call(input, value);
  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.dispatchEvent(new Event('change', { bubbles: true }));
}

export function LessonResponsePersistence({ rootRef, lessonNumber, active }: Props) {
  useEffect(() => {
    if (!active || lessonNumber > 3) return;
    const root = rootRef.current;
    if (!root) return;
    let restoring = false;
    let restoreTimer = 0;

    const getStage = () => root.querySelector<HTMLElement>('.lesson-runtime:not([hidden]) .interactive-stage');

    const capture = (event: Event) => {
      if (restoring) return;
      const stage = getStage();
      const target = event.target as HTMLElement;
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

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<{ lessonNumber?: number }>).detail;
      if (detail?.lessonNumber && detail.lessonNumber <= 3) localStorage.removeItem(storageKey(detail.lessonNumber));
    };
    window.addEventListener('mathnikita-reset-lesson-responses', handler);
    return () => window.removeEventListener('mathnikita-reset-lesson-responses', handler);
  }, []);

  return null;
}
