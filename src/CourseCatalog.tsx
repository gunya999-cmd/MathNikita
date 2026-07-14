import { useMemo, useState } from 'react';
import { allRichLessons } from './data/richLessonContent';
import './courseCatalog.css';

type CourseCatalogProps = {
  selectedLesson: number;
  onOpenLesson: (lessonNumber: number) => void;
};

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
          <p>Выбери тему здесь. После начала урока каталог исчезнет, чтобы на экране осталась только текущая задача.</p>
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
          <b>{allRichLessons.length} уроков</b>
          <span>Первый урок — интерактивный эталон. Остальные пока доступны как учебные конспекты.</span>
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
          const isInteractive = lesson.lessonNumber === 1;
          const isSelected = lesson.lessonNumber === selectedLesson;

          return (
            <button
              key={lesson.lessonNumber}
              type="button"
              className={`${isInteractive ? 'is-interactive' : ''} ${isSelected ? 'is-selected' : ''}`}
              onClick={() => onOpenLesson(lesson.lessonNumber)}
            >
              <span>{lesson.lessonNumber}</span>
              <div>
                <small>{isInteractive ? 'Интерактивный урок' : 'Конспект курса'}</small>
                <b>{lesson.title}</b>
                <p>{lesson.goal}</p>
              </div>
              <i aria-hidden="true">→</i>
            </button>
          );
        })}
      </section>

      {!filteredLessons.length ? <div className="course-empty-search">По такому запросу уроков не найдено.</div> : null}
    </main>
  );
}
