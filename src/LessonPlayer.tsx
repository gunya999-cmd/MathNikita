import { useMemo, useState } from 'react';
import { allRichLessons, type LessonBlockKind } from './data/richLessonContent';
import './lessonPlayer.css';

const labels: Record<LessonBlockKind, string> = {
  motivation: 'Зачем это нужно',
  explanation: 'Объяснение',
  guided: 'Решаем вместе',
  practice: 'Закрепление',
  mistakes: 'Типичная ошибка',
  checkpoint: 'Проверка понимания',
  thinking: 'Подумай',
  olympiad: 'Задача со звёздочкой',
  summary: 'Итог урока',
};

const icons: Record<LessonBlockKind, string> = {
  motivation: '🎯', explanation: '📖', guided: '🤝', practice: '✍️', mistakes: '🔎',
  checkpoint: '✅', thinking: '🧠', olympiad: '⭐', summary: '🏁',
};

export function LessonPlayer() {
  const [lessonNumber, setLessonNumber] = useState(1);
  const [blockIndex, setBlockIndex] = useState(0);
  const [revealedAnswers, setRevealedAnswers] = useState(false);
  const lesson = useMemo(() => allRichLessons.find(item => item.lessonNumber === lessonNumber) ?? allRichLessons[0], [lessonNumber]);
  const block = lesson.blocks[blockIndex];
  const progress = Math.round(((blockIndex + 1) / lesson.blocks.length) * 100);

  function selectLesson(next: number) {
    setLessonNumber(next);
    setBlockIndex(0);
    setRevealedAnswers(false);
  }

  function move(delta: number) {
    setBlockIndex(index => Math.min(Math.max(index + delta, 0), lesson.blocks.length - 1));
    setRevealedAnswers(false);
  }

  return (
    <main className="lesson-player-page">
      <aside className="lesson-catalog">
        <div className="catalog-head"><span>Курс 5 класса</span><b>90 уроков готовы</b></div>
        <div className="lesson-list">
          {allRichLessons.map(item => (
            <button key={item.lessonNumber} className={item.lessonNumber === lessonNumber ? 'active' : ''} onClick={() => selectLesson(item.lessonNumber)}>
              <span>{item.lessonNumber}</span><div><b>{item.title}</b><small>{item.durationMinutes} минут</small></div>
            </button>
          ))}
        </div>
      </aside>

      <section className="lesson-workspace">
        <header className="lesson-header">
          <div><span>Урок {lesson.lessonNumber} из 175</span><h1>{lesson.title}</h1><p>{lesson.goal}</p></div>
          <div className="lesson-duration">≈ {lesson.durationMinutes} мин</div>
        </header>

        <div className="lesson-progress"><i style={{ width: `${progress}%` }} /></div>
        <nav className="lesson-steps" aria-label="Этапы урока">
          {lesson.blocks.map((item, index) => (
            <button key={`${item.kind}-${index}`} className={index === blockIndex ? 'active' : index < blockIndex ? 'done' : ''} onClick={() => { setBlockIndex(index); setRevealedAnswers(false); }}>
              <span>{index < blockIndex ? '✓' : icons[item.kind]}</span><small>{labels[item.kind]}</small>
            </button>
          ))}
        </nav>

        <article className={`lesson-block block-${block.kind}`}>
          <div className="block-kicker">{icons[block.kind]} {labels[block.kind]}</div>
          <h2>{block.title}</h2>
          <p className="block-text">{block.text}</p>

          {block.items?.length ? <ol className="lesson-items">{block.items.map((item, index) => <li key={index}>{item}</li>)}</ol> : null}

          {block.kind === 'checkpoint' && block.answers?.length ? (
            <div className="answer-reveal">
              <button onClick={() => setRevealedAnswers(value => !value)}>{revealedAnswers ? 'Скрыть ответы' : 'Проверить ответы'}</button>
              {revealedAnswers && <ol>{block.answers.map((answer, index) => <li key={index}><b>{index + 1}.</b> {answer}</li>)}</ol>}
            </div>
          ) : null}

          {block.kind === 'olympiad' && <div className="olympiad-note">Не спеши. Попробуй найти идею, а не только ответ.</div>}
        </article>

        <footer className="lesson-controls">
          <button onClick={() => move(-1)} disabled={blockIndex === 0}>← Назад</button>
          <span>{blockIndex + 1} из {lesson.blocks.length}</span>
          {blockIndex < lesson.blocks.length - 1 ? (
            <button className="primary" onClick={() => move(1)}>Продолжить →</button>
          ) : (
            <button className="primary" onClick={() => selectLesson(Math.min(lessonNumber + 1, allRichLessons.length))}>Следующий урок →</button>
          )}
        </footer>
      </section>
    </main>
  );
}
