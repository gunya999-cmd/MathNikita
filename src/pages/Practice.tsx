import { useEffect, useMemo, useState } from 'react';
import { Button } from '../components/Button';
import { getGradeCurriculum } from '../data/curriculum';
import { getLearningProgram } from '../data/learningProgram';
import { checkStepAnswer, getStepPracticesForGrade } from '../data/stepPractice';

export function Practice({ grade, onSolvedTask }: { grade: string; onSolvedTask: (tasksSolved?: number) => void }) {
  const practices = useMemo(() => getStepPracticesForGrade(grade), [grade]);
  const curriculum = useMemo(() => getGradeCurriculum(grade), [grade]);
  const program = useMemo(() => getLearningProgram(grade), [grade]);
  const [moduleId, setModuleId] = useState(program.modules[0]?.id ?? '');
  const currentModule = program.modules.find((module) => module.id === moduleId) ?? program.modules[0];
  const visiblePractices = practices.filter((item) => item.id.includes(`m${currentModule?.order ?? 1}-`));
  const modulePractices = visiblePractices.length ? visiblePractices : practices;
  const [practiceId, setPracticeId] = useState(modulePractices[0].id);
  const [stepIndex, setStepIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const practice = modulePractices.find((item) => item.id === practiceId) ?? modulePractices[0];
  const step = practice.steps[stepIndex];
  const progress = Math.round(((stepIndex + 1) / practice.steps.length) * 100);

  useEffect(() => {
    const firstModule = program.modules[0]?.id ?? '';
    const firstPractice = practices[0]?.id ?? '';
    setModuleId(firstModule);
    setPracticeId(firstPractice);
    setStepIndex(0);
    setAnswer('');
    setFeedback('');
  }, [grade, practices, program]);

  function chooseModule(id: string) {
    const module = program.modules.find((item) => item.id === id);
    const firstPractice = practices.find((item) => item.id.includes(`m${module?.order ?? 1}-`)) ?? practices[0];
    setModuleId(id);
    setPracticeId(firstPractice.id);
    setStepIndex(0);
    setAnswer('');
    setFeedback('');
  }

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
      <p className="muted">Выбери модуль программы класса и решай упражнения маленькими шагами. Система подскажет, где ошибка.</p>
      <div className="module-grid practice-modules">
        {program.modules.map((module) => (
          <button className={module.id === moduleId ? 'module-card active button-card' : 'module-card button-card'} key={module.id} onClick={() => chooseModule(module.id)}>
            <span>{module.order}</span>
            <h4>{module.title}</h4>
            <p>{module.skills.slice(0, 2).join(' · ')}</p>
          </button>
        ))}
      </div>
      <div className="tab-row">
        {modulePractices.map((item) => (
          <button className={item.id === practice.id ? 'tab active' : 'tab'} key={item.id} onClick={() => choosePractice(item.id)}>
            {item.title.replace(/^\d+\.\s*/, '')}
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
