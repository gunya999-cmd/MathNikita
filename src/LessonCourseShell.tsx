import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { allRichLessons } from './data/richLessonContent';
import { LessonPlayer } from './LessonPlayer';
import { LessonOpening, buildGenericOpening, lessonOneOpening } from './LessonOpening';
import { LessonReflection } from './LessonReflection';

export function LessonCourseShell() {
  const [selectedLesson, setSelectedLesson] = useState(1);
  const [showOpening, setShowOpening] = useState(true);
  const [showReflection, setShowReflection] = useState(false);
  const shellRef = useRef<HTMLDivElement>(null);

  const lesson = allRichLessons.find(item => item.lessonNumber === selectedLesson) ?? allRichLessons[0];
  const opening = selectedLesson === 1 ? lessonOneOpening : buildGenericOpening(lesson);

  useEffect(() => {
    const root = shellRef.current;
    if (!root) return;

    const updateReflectionVisibility = () => {
      const reachedSummary = Boolean(root.querySelector('.stage-summary, .block-summary'));
      setShowReflection(!showOpening && reachedSummary);
    };

    updateReflectionVisibility();
    const observer = new MutationObserver(updateReflectionVisibility);
    observer.observe(root, { subtree: true, childList: true, attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, [showOpening, selectedLesson]);

  function handleCourseClick(event: MouseEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement;
    const lessonButton = target.closest('.lesson-list button');
    if (!lessonButton) return;

    const numberText = lessonButton.querySelector(':scope > span')?.textContent;
    const lessonNumber = Number(numberText);
    if (!Number.isFinite(lessonNumber)) return;

    setSelectedLesson(lessonNumber);
    setShowReflection(false);
    setShowOpening(true);
  }

  return (
    <div ref={shellRef} className={`lesson-course-shell ${showOpening ? 'is-opening' : 'is-learning'}`} onClickCapture={handleCourseClick}>
      <div className="opening-screen" hidden={!showOpening}>
        <LessonOpening data={opening} onStart={() => setShowOpening(false)} />
      </div>

      <div className="lesson-runtime" hidden={showOpening}>
        <LessonPlayer />
      </div>

      {!showOpening && showReflection ? (
        <LessonReflection
          key={selectedLesson}
          lessonNumber={selectedLesson}
          lessonTitle={lesson.title}
          openingQuestion={opening.question}
          goals={opening.goals}
          onReviewOpening={() => {
            setShowReflection(false);
            setShowOpening(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      ) : null}
    </div>
  );
}
