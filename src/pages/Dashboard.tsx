import { useState } from 'react';
import { Button } from '../components/Button';
import { getNextLesson } from '../data/diagnostic';
import { getLessonForWeakTopic } from '../data/lessons';
import { normalizeAnswer } from '../data/questions';
import type { StudentProfile } from '../data/profile';
import type { DiagnosticSummary } from '../types';

export function Dashboard({
  profile,
  summary,
  onDiagnostic,
  onChat,
  onPractice,
}: {
  profile: StudentProfile;
  summary: DiagnosticSummary | null;
  onDiagnostic: () => void;
  onChat: () => void;
  onPractice: () => void;
}) {
  const nextLesson = getNextLesson(summary);
  const lesson = getLessonForWeakTopic(summary?.weak[0]);
  const [practiceAnswer, setPracticeAnswer] = useState('');
  const [practiceChecked, setPracticeChecked] = useState(false);
  const practiceCorrect = normalizeAnswer(practiceAnswer) === normalizeAnswer(lesson.answer);

  return (
    <section className="grid-page">
      <div className="panel lesson-card">
        <div className="eyebrow">Урок дня для {profile.name}</div>
        <h2>{nextLesson}</h2>
        <p>{summary ? `Последняя диагностика: ${summary.score}% — ${summary.level}.` : 'Сначала пройди короткую диагностику, и я подберу урок под твой уровень.'}</p>

        <div className="lesson-block">
          <h3>{lesson.title}</h3>
          <p className="muted">{lesson.subtitle}</p>
          <p>{lesson.explanation}</p>
          <div className="example-box"><strong>Пример:</strong> {lesson.example}</div>
          <label className="question compact">
            <span>{lesson.practice}</span>
            <input value={practiceAnswer} onChange={(event) => { setPracticeAnswer(event.target.value); setPracticeChecked(false); }} placeholder="Ответ" />
          </label>
          <div className="hero-actions">
            <Button onClick={() => setPracticeChecked(true)}>Проверить мини-задание</Button>
            <Button variant="secondary" onClick={onChat}>Спросить в чате</Button>
            <Button variant="secondary" onClick={onPractice}>Пошаговая практика</Button>
          </div>
          {practiceChecked && (
            <div className={practiceCorrect ? 'success-box' : 'error'}>
              {practiceCorrect ? 'Верно. Можно двигаться дальше.' : `Почти. Правильный ответ: ${lesson.answer}`}
            </div>
          )}
        </div>

        <div className="hero-actions">
          <Button variant="secondary" onClick={onDiagnostic}>{summary ? 'Обновить диагностику' : 'Пройти диагностику'}</Button>
        </div>
      </div>
      <div className="panel stats">
        <h3>Прогресс</h3>
        <div><strong>{summary ? `${summary.score}%` : '—'}</strong><span>результат диагностики</span></div>
        <div><strong>{profile.solvedTasks}</strong><span>решённых шагов и задач</span></div>
        <div><strong>{profile.streakDays}</strong><span>дней подряд</span></div>
        <div><strong>{profile.grade}</strong><span>{profile.goal}</span></div>
      </div>
    </section>
  );
}
