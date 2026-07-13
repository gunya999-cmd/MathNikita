import { useState, type MouseEvent } from 'react';
import { allRichLessons } from './data/richLessonContent';
import { LessonPlayer } from './LessonPlayer';
import { LessonOpening, buildGenericOpening, lessonOneOpening } from './LessonOpening';

export function LessonCourseShell() {
  const [selectedLesson, setSelectedLesson] = useState(1);
  const [showOpening, setShowOpening] = useState(true);

  const lesson = allRichLessons.find(item => item.lessonNumber === selectedLesson) ?? allRichLessons[0];
  const opening = selectedLesson === 1 ? lessonOneOpening : buildGenericOpening(lesson);

  function handleCourseClick(event: MouseEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement;
    const lessonButton = target.closest('.lesson-list button');
    if (!lessonButton) return;

    const numberText = lessonButton.querySelector(':scope > span')?.textContent;
    const lessonNumber = Number(numberText);
    if (!Number.isFinite(lessonNumber)) return;

    setSelectedLesson(lessonNumber);
    setShowOpening(true);
  }

  return (
    <div className={`lesson-course-shell ${showOpening ? 'is-opening' : ''}`} onClickCapture={handleCourseClick}>
      {showOpening ? <LessonOpening data={opening} onStart={() => setShowOpening(false)} /> : null}
      <LessonPlayer />
    </div>
  );
}
