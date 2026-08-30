import { useState } from 'react';
import { Button } from '../components/Button';
import { getGradeCurriculum, getAllGradeOptions } from '../data/curriculum';
import { getNextLesson } from '../data/diagnostic';
import { getActiveLearningModule, getLearningProgram, getProgramProgress } from '../data/learningProgram';
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
  onTraining,
  onProfileChange,
}: {
  profile: StudentProfile;
  summary: DiagnosticSummary | null;
  onDiagnostic: () => void;
  onChat: () => void;
  onPractice: () => void;
  onTraining: () => void;
  onProfileChange: (profile: StudentProfile) => void;
}) {
  const curriculum = getGradeCurriculum(profile.grade);
  const program = getLearningProgram(profile.grade);
  const progress = getProgramProgress(profile.solvedTasks, program);
  const activeModule = getActiveLearningModule(program, profile.solvedTasks);
  const nextLesson = getNextLesson(summary, profile.grade);
  const lesson = getLessonForWeakTopic(summary?.weak[0], profile.grade);
  const [practiceAnswer, setPracticeAnswer] = useState('');
  const [practiceChecked, setPracticeChecked] = useState(false);
  const practiceCorrect = normalizeAnswer(practiceAnswer) === normalizeAnswer(lesson.answer);

  function changeGrade(grade: string) {
    onProfileChange({ ...profile, grade });
    setPracticeAnswer('');
    setPracticeChecked(false);
  }

  return (
    <section className="grid-page">
      <div className="panel lesson-card">
        <div className="eyebrow">Урок дня для {profile.name} · {curriculum.label}</div>
        <h2>{nextLesson}</h2>
        <p>{summary ? `Последняя диагностика: ${summary.score}% — ${summary.level}.` : 'Сначала пройди короткую диагностику, и я подберу урок под твой уровень и класс.'}</p>

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
            <Button variant="secondary" onClick={onTraining}>Адаптивная тренировка</Button>
          </div>
          {practiceChecked && (
            <div className={practiceCorrect ? 'success-box' : 'error'}>
              {practiceCorrect ? 'Верно. Можно двигаться дальше.' : `Почти. Правильный ответ: ${lesson.answer}`}
            </div>
          )}
        </div>

        <div className="program-panel">
          <div className="program-header">
            <div>
              <div className="eyebrow">Программа класса · 20 уроков</div>
              <h3>{activeModule.order}. {activeModule.title}</h3>
              <p className="muted">Текущий модуль: {activeModule.focus}</p>
            </div>
            <strong>{progress.percent}%</strong>
          </div>
          <div className="progress-track"><div style={{ width: `${progress.percent}%` }} /></div>
          <div className="module-grid">
            {program.modules.map((module) => {
              const isActive = module.id === activeModule.id;
              const isDone = module.order <= progress.completedModules;
              return (
                <article className={isActive ? 'module-card active' : isDone ? 'module-card done' : 'module-card'} key={module.id}>
                  <span>{module.order}</span>
                  <h4>{module.title}</h4>
                  <p>{module.lessons.map((item) => `Урок ${item.order}`).join(' · ')}</p>
                </article>
              );
            })}
          </div>
          <div className="lesson-roadmap-list">
            {activeModule.lessons.map((item) => (
              <article key={item.order}>
                <strong>Урок {item.order}</strong>
                <span>{item.title}</span>
                <p>{item.objective}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="hero-actions">
          <Button variant="secondary" onClick={onDiagnostic}>{summary ? 'Обновить диагностику' : 'Пройти диагностику'}</Button>
        </div>
      </div>
      <div className="panel stats">
        <h3>Программа обучения</h3>
        <label className="question compact">
          <span>Класс</span>
          <select value={curriculum.id} onChange={(event) => changeGrade(`${event.target.value} класс`)}>
            {getAllGradeOptions().map((grade) => <option key={grade.id} value={grade.id}>{grade.label}</option>)}
          </select>
        </label>
        <div><strong>{curriculum.stage}</strong><span>{curriculum.focus}</span></div>
        <div><strong>{progress.completedModules}/{progress.totalModules}</strong><span>модулей программы</span></div>
        <div><strong>{program.totalLessons}</strong><span>уроков в классе</span></div>
        <div><strong>{progress.completedExercises}/{progress.totalExercises}</strong><span>уроков/упражнений пройдено</span></div>
        <div><strong>{program.totalSkills}</strong><span>навыков в этом классе</span></div>
        <div><strong>{summary ? `${summary.score}%` : '—'}</strong><span>результат диагностики</span></div>
        <div><strong>{profile.solvedTasks}</strong><span>решённых шагов и задач</span></div>
        <div><strong>{profile.streakDays}</strong><span>дней подряд</span></div>
        <div><strong>{profile.correctAnswers}/{profile.wrongAnswers}</strong><span>правильно / ошибок</span></div>
      </div>
    </section>
  );
}
