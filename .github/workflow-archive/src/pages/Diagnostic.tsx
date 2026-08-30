import { useMemo, useState } from 'react';
import { Button } from '../components/Button';
import { getGradeCurriculum } from '../data/curriculum';
import { getLevel } from '../data/diagnostic';
import { getDiagnosticQuestionsForGrade, normalizeAnswer } from '../data/questions';
import type { DiagnosticSummary } from '../types';

export function Diagnostic({ grade, onComplete }: { grade: string; onComplete: (summary: DiagnosticSummary) => void }) {
  const curriculum = getGradeCurriculum(grade);
  const questions = useMemo(() => getDiagnosticQuestionsForGrade(grade), [grade]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const result = useMemo(() => {
    const checked = questions.map((question) => ({
      ...question,
      correct: normalizeAnswer(answers[question.id] ?? '') === normalizeAnswer(question.answer),
    }));
    const correctCount = checked.filter((question) => question.correct).length;
    const score = Math.round((correctCount / checked.length) * 100);
    return {
      score,
      level: getLevel(score),
      strong: checked.filter((question) => question.correct).map((question) => question.skillTitle),
      weak: checked.filter((question) => !question.correct).map((question) => question.skillTitle),
    };
  }, [answers, questions]);

  function submit() {
    const summary: DiagnosticSummary = {
      score: result.score,
      level: result.level,
      strong: result.strong,
      weak: result.weak,
      completedAt: new Date().toISOString(),
    };
    onComplete(summary);
    setSubmitted(true);
  }

  return (
    <section className="panel wide">
      <h2>Диагностика уровня · {curriculum.label}</h2>
      <p className="muted">Ответь на вопросы из программы выбранного класса. Результат обновит “урок дня”.</p>
      <div className="question-list">
        {questions.map((question) => (
          <label className="question" key={question.id}>
            <span>{question.prompt}</span>
            <input
              value={answers[question.id] ?? ''}
              onChange={(event) => setAnswers((previous) => ({ ...previous, [question.id]: event.target.value }))}
              placeholder="Ответ"
            />
          </label>
        ))}
      </div>
      <Button onClick={submit}>Показать результат</Button>
      {submitted && (
        <div className="result-box">
          <h3>Результат: {result.score}% — {result.level}</h3>
          <p><strong>Сильные темы:</strong> {result.strong.join(', ') || 'пока нет'}</p>
          <p><strong>Темы для повторения:</strong> {result.weak.join(', ') || 'нет'}</p>
        </div>
      )}
    </section>
  );
}
