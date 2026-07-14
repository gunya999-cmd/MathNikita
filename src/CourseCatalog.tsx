import { useMemo, useState } from 'react';
import { allRichLessons } from './data/richLessonContent';
import './courseCatalog.css';
import './focusCourseNavigation.css';

type CourseCatalogProps = {
  selectedLesson: number;
  onOpenLesson: (lessonNumber: number) => void;
};

const readyLessonNumbers = new Set([1, 2]);

export function CourseCatalog({ selectedLesson, onOpenLesson }: CourseCatalogProps) {
  const [query, setQuery] = useState('');

  const filteredLessons = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return allRichLessons;

    return allRichLessons.filter(lesson =>
      String(lesson.lessonNumber).includes(normalized)
      || lesson.title.toLowerCase().includes(normalized)
      || lesson.goal.toLowerCase().includes(normalized),
    );
  }, [query]);

  const currentLesson = allRichLessons.find(lesson => lesson.lessonNumber === selectedLesson) ?? allRichLessons[0];

  return (
    <main className="course-catalog-page">
      <section className="course-catalog-hero">
        <div>
          <span>Математика · 5 класс</span>
          <h1>Программа курса</h1>
          <p>Открываются только уроки, прошедшие методическую и техническую проверку. Остальные темы видны в программе, но не подменяются черновыми конспектами.</p>
        </div>
        <div className="course-resume-card">
          <small>Продолжить</small>
          <b>Урок {currentLesson.lessonNumber}</b>
          <strong>{currentLesson.title}</strong>
          <button type="button" onClick={() => onOpenLesson(currentLesson.lessonNumber)}>Открыть вступление →</button>
        </div>
      </section>

      <section className="course-catalog-toolbar" aria-label="Поиск урока">
        <div>
          <b>{allRichLessons.length} уроков в программе</b>
          <span>Готовы два интерактивных урока. Следующий откроется только после работы с источниками и проверки.</span>
        </div>
        <label>
          <span className="sr-only">Найти урок</span>
          <input
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder="Найти тему или номер урока"
          />
        </label>
      </section>

      <section className="course-lesson-grid" aria-label="Список уроков">
        {filteredLessons.map(lesson => {
          const isReady = readyLessonNumbers.has(lesson.lessonNumber);
          const isSelected = lesson.lessonNumber === selectedLesson;

          return (
            <button
              key={lesson.lessonNumber}
              type="button"
              className={`${isReady ? 'is-interactive' : 'is-locked'} ${isSelected ? 'is-selected' : ''}`}
              onClick={() => isReady && onOpenLesson(lesson.lessonNumber)}
              disabled={!isReady}
              aria-label={isReady ? `Открыть урок ${lesson.lessonNumber}: ${lesson.title}` : `Урок ${lesson.lessonNumber} в разработке`}
            >
              <span>{lesson.lessonNumber}</span>
              <div>
                <small>{isReady ? 'Интерактивный урок · по источникам' : 'В разработке'}</small>
                <b>{lesson.title}</b>
                <p>{lesson.goal}</p>
              </div>
              <i aria-hidden="true">{isReady ? '→' : '🔒'}</i>
            </button>
          );
        })}
      </section>

      {!filteredLessons.length ? <div className="course-empty-search">По такому запросу уроков не найдено.</div> : null}
    </main>
  );
}
