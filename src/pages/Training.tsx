import { useMemo, useState } from 'react';
import { Button } from '../components/Button';
import { normalizeAnswer } from '../data/questions';
import type { StudentProfile } from '../data/profile';
import { getNextDifficulty, getRecommendedDifficulty, getTasksByDifficulty, type PracticeTask, type TaskDifficulty } from '../data/taskBank';

function pickTask(tasks: PracticeTask[], index: number) {
  return tasks[index % tasks.length];
}

function difficultyLabel(difficulty: TaskDifficulty) {
  if (difficulty === 'easy') return 'лёгкий';
  if (difficulty === 'medium') return 'средний';
  return 'сложный';
}

export function Training({
  profile,
  onAnswer,
}: {
  profile: StudentProfile;
  onAnswer: (wasCorrect: boolean, nextDifficulty: TaskDifficulty) => void;
}) {
  const recommendedDifficulty = getRecommendedDifficulty(profile.correctAnswers, profile.wrongAnswers);
  const [difficulty, setDifficulty] = useState<TaskDifficulty>(profile.currentDifficulty || recommendedDifficulty);
  const [taskIndex, setTaskIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [checked, setChecked] = useState(false);
  const [wasCorrect, setWasCorrect] = useState(false);

  const tasks = useMemo(() => getTasksByDifficulty(difficulty), [difficulty]);
  const task = pickTask(tasks, taskIndex);
  const accuracy = profile.correctAnswers + profile.wrongAnswers > 0
    ? Math.round((profile.correctAnswers / (profile.correctAnswers + profile.wrongAnswers)) * 100)
    : 0;

  function check() {
    const correct = normalizeAnswer(answer) === normalizeAnswer(task.answer);
    const nextDifficulty = getNextDifficulty(difficulty, correct);
    setWasCorrect(correct);
    setChecked(true);
    onAnswer(correct, nextDifficulty);
  }

  function nextTask() {
    const nextDifficulty = getNextDifficulty(difficulty, wasCorrect);
    setDifficulty(nextDifficulty);
    setTaskIndex((current) => current + 1);
    setAnswer('');
    setChecked(false);
  }

  return (
    <section className="panel wide">
      <div className="eyebrow">Адаптивная тренировка</div>
      <h2>{task.topic}: {difficultyLabel(difficulty)} уровень</h2>
      <p className="muted">Задачи подстраиваются под точность ответов. Если отвечаешь уверенно — сложность растёт.</p>

      <div className="stats training-stats">
        <div><strong>{profile.correctAnswers}</strong><span>правильно</span></div>
        <div><strong>{profile.wrongAnswers}</strong><span>ошибок</span></div>
        <div><strong>{accuracy}%</strong><span>точность</span></div>
        <div><strong>{difficultyLabel(recommendedDifficulty)}</strong><span>рекомендованный уровень</span></div>
      </div>

      <div className="lesson-block">
        <label className="question compact">
          <span>{task.prompt}</span>
          <input value={answer} onChange={(event) => { setAnswer(event.target.value); setChecked(false); }} placeholder="Ответ" />
        </label>
        <div className="hero-actions">
          <Button onClick={check}>Проверить</Button>
          {checked && <Button variant="secondary" onClick={nextTask}>Следующая задача</Button>}
        </div>
        {checked && (
          <div className={wasCorrect ? 'success-box' : 'hint-box'}>
            {wasCorrect ? 'Верно.' : `Ответ: ${task.answer}.`} {task.explanation}
          </div>
        )}
      </div>
    </section>
  );
}
