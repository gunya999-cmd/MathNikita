import { useMemo, useState } from 'react';
import { Button } from '../components/Button';
import { getGradeCurriculum } from '../data/curriculum';
import { checkStepAnswer, getStepPracticesForGrade } from '../data/stepPractice';

export function Practice({ grade, onSolvedTask }: { grade: string; onSolvedTask: (tasksSolved?: number) => void }) {
  const practices = useMemo(() => getStepPracticesForGrade(grade), [grade]);
  const curriculum = getGradeCurriculum(grade);
  const [practiceId, setPracticeId] = useState(practices[0].id);
  const [stepIndex, setStepIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const practice = practices.find((item) => item.id === practiceId) ?? practices[0];
  const step = practice.steps[stepIndex];
  const progress = Math.round(((stepIndex + 1) / practice.steps.length) * 100);

  function choosePractice(id: string) {
    setPracticeId(id);
    setStepIndex(0);
    setAnswer('');
    setFeedback('');
  }

  function check() {
    if (checkStepAnswer(answer, step.expected)) {
      setFeedback(step.success);
      onSolvedTask(1);
      if (stepIndex < practice.steps.length - 1) {
        window.setTimeout(() => {
          setStepIndex((current) => current + 1);
          setAnswer('');
          setFeedback('');
        }, 650);
      }
      return;
    }
    setFeedback(step.hint);
  }

  return (
    <section className="panel wide">
      <div className="eyebrow">Пошаговая практика · {curriculum.label}</div>
      <h2>{practice.title}</h2>
      <p className="muted">Выбери задачу из программы класса и решай её маленькими шагами. Система подскажет, где ошибка.</p>
      <div className="tab-row">
        {practices.map((item) => (
          <button className={item.id === practice.id ? 'tab active' : 'tab'} key={item.id} onClick={() => choosePractice(item.id)}>
            {item.title}
          </button>
        ))}
      </div>
      <div className="lesson-block">
        <p><strong>Задача:</strong> {practice.problem}</p>
        <div className="progress-track"><div style={{ width: `${progress}%` }} /></div>
        <label className="question compact">
          <span>{step.prompt}</span>
          <input value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder="Введи шаг решения" />
        </label>
        <div className="hero-actions">
          <Button onClick={check}>{stepIndex === practice.steps.length - 1 ? 'Проверить финальный ответ' : 'Проверить шаг'}</Button>
        </div>
        {feedback && <div className={checkStepAnswer(answer, step.expected) ? 'success-box' : 'hint-box'}>{feedback}</div>}
      </div>
    </section>
  );
}
