import { useEffect, useRef, useState, type KeyboardEvent, type MouseEvent } from 'react';
import { allRichLessons } from './data/richLessonContent';
import { CourseCatalog } from './CourseCatalog';
import { LessonPlayer } from './LessonPlayer';
import { LessonOpening, buildGenericOpening, lessonOneOpening } from './LessonOpening';
import { LessonReflection } from './LessonReflection';
import { ProgressiveHintCoach, type ProgressiveHintState } from './ProgressiveHintCoach';

type CourseMode = 'catalog' | 'opening' | 'lesson';

const emptyHintState: ProgressiveHintState = {
  prompt: '',
  stageTitle: '',
  activityType: '',
  attempts: 0,
  revealedLevel: 0,
  fullExplanation: '',
  mountNode: null,
};

function loadSelectedLesson() {
  const saved = Number(localStorage.getItem('mathnikita-selected-lesson'));
  return Number.isFinite(saved) && saved > 0 ? saved : 1;
}

export function LessonCourseShell() {
  const [selectedLesson, setSelectedLesson] = useState(loadSelectedLesson);
  const [mode, setMode] = useState<CourseMode>('catalog');
  const [showReflection, setShowReflection] = useState(false);
  const [hintState, setHintState] = useState<ProgressiveHintState>(emptyHintState);
  const shellRef = useRef<HTMLDivElement>(null);
  const feedbackTimerRef = useRef<number | null>(null);

  const lesson = allRichLessons.find(item => item.lessonNumber === selectedLesson) ?? allRichLessons[0];
  const opening = selectedLesson === 1 ? lessonOneOpening : buildGenericOpening(lesson);
  const showOpening = mode === 'opening';

  function clearHints() {
    setHintState(emptyHintState);
  }

  function openLesson(lessonNumber: number) {
    setSelectedLesson(lessonNumber);
    localStorage.setItem('mathnikita-selected-lesson', String(lessonNumber));
    setShowReflection(false);
    clearHints();
    setMode('opening');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function returnToCatalog() {
    setMode('catalog');
    setShowReflection(false);
    clearHints();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function scheduleFeedbackAssessment() {
    if (feedbackTimerRef.current !== null) window.clearTimeout(feedbackTimerRef.current);
    feedbackTimerRef.current = window.setTimeout(() => {
      const root = shellRef.current;
      if (!root) return;

      const goodFeedback = root.querySelector<HTMLElement>('.instant-feedback.good');
      if (goodFeedback) {
        clearHints();
        return;
      }

      const badFeedback = root.querySelector<HTMLElement>('.instant-feedback.bad');
      const stageNode = root.querySelector<HTMLElement>('.interactive-stage');
      if (!badFeedback || !stageNode) return;

      const prompt = stageNode.querySelector<HTMLElement>('.activity-area h3')?.textContent?.trim() ?? 'Текущее задание';
      const stageTitle = stageNode.querySelector<HTMLElement>('.stage-copy h2')?.textContent?.trim() ?? 'Задание';
      const fullExplanation = badFeedback.querySelector<HTMLElement>('span')?.textContent?.trim() ?? 'Вернись к правилу урока и проверь каждый шаг.';
      const activityType = stageNode.querySelector('.order-bank')
        ? 'order'
        : stageNode.querySelector('.inline-answer input')
          ? 'input'
          : stageNode.querySelector('.compare-board')
            ? 'compare'
            : stageNode.querySelector('.number-line')
              ? 'number-line'
              : 'choice';

      setHintState(previous => {
        const sameTask = previous.prompt === prompt && previous.stageTitle === stageTitle;
        const attempts = sameTask ? previous.attempts + 1 : 1;
        const automaticLevel = Math.min(attempts, 3);

        return {
          prompt,
          stageTitle,
          activityType,
          attempts,
          revealedLevel: sameTask ? Math.max(previous.revealedLevel, automaticLevel) : automaticLevel,
          fullExplanation,
          mountNode: stageNode,
        };
      });
    }, 80);
  }

  useEffect(() => {
    const root = shellRef.current;
    if (!root || mode !== 'lesson') return;

    const updateReflectionVisibility = () => {
      const reachedSummary = Boolean(root.querySelector('.stage-summary, .block-summary'));
      setShowReflection(reachedSummary);
    };

    updateReflectionVisibility();
    const observer = new MutationObserver(updateReflectionVisibility);
    observer.observe(root, { subtree: true, childList: true, attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, [mode, selectedLesson]);

  useEffect(() => {
    clearHints();
    return () => {
      if (feedbackTimerRef.current !== null) window.clearTimeout(feedbackTimerRef.current);
    };
  }, [mode, selectedLesson]);

  function handleCourseClick(event: MouseEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement;
    if (target.closest('.check-button')) scheduleFeedbackAssessment();
    if (target.closest('.lesson-controls button')) clearHints();
  }

  function handleCourseKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement;
    if (event.key === 'Enter' && target.closest('.inline-answer input')) scheduleFeedbackAssessment();
  }

  if (mode === 'catalog') {
    return <CourseCatalog selectedLesson={selectedLesson} onOpenLesson={openLesson} />;
  }

  return (
    <div
      ref={shellRef}
      className={`lesson-course-shell ${showOpening ? 'is-opening' : 'is-learning'}`}
      onClickCapture={handleCourseClick}
      onKeyDownCapture={handleCourseKeyDown}
    >
      <div className="lesson-mode-toolbar">
        <button type="button" onClick={returnToCatalog}>← Все уроки</button>
        <div>
          <span>Урок {selectedLesson} из {allRichLessons.length}</span>
          <b>{lesson.title}</b>
        </div>
        {mode === 'lesson' ? <button type="button" onClick={() => setMode('opening')}>Вступление</button> : <span />}
      </div>

      <div className="opening-screen" hidden={!showOpening}>
        <LessonOpening data={opening} onStart={() => setMode('lesson')} />
      </div>

      <div className="lesson-runtime" hidden={mode !== 'lesson'}>
        <LessonPlayer key={selectedLesson} lessonNumber={selectedLesson} />
      </div>

      <ProgressiveHintCoach
        state={hintState}
        onRevealNext={() => setHintState(previous => ({ ...previous, revealedLevel: Math.min(previous.revealedLevel + 1, 4) }))}
      />

      {mode === 'lesson' && showReflection ? (
        <LessonReflection
          key={selectedLesson}
          lessonNumber={selectedLesson}
          lessonTitle={lesson.title}
          openingQuestion={opening.question}
          goals={opening.goals}
          onReviewOpening={() => {
            setShowReflection(false);
            setMode('opening');
            clearHints();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      ) : null}
    </div>
  );
}
