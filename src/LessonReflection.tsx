import { useEffect, useMemo, useState } from 'react';
import { ExtendedPracticeLab } from './ExtendedPracticeLab';
import './lessonReflection.css';

export type LessonReflectionProps = {
  lessonNumber: number;
  lessonTitle: string;
  openingQuestion: string;
  goals: string[];
  onReviewOpening: () => void;
};

export function LessonReflection({ lessonNumber, lessonTitle, openingQuestion, goals, onReviewOpening }: LessonReflectionProps) {
  const storageKey = `mathnikita:reflection:${lessonNumber}`;
  const [response, setResponse] = useState('');
  const [saved, setSaved] = useState(false);
  const [practiceComplete, setPracticeComplete] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(storageKey) ?? '';
    setResponse(stored);
    setSaved(Boolean(stored));
    setPracticeComplete(false);
  }, [storageKey]);

  const criteria = useMemo(() => {
    if (lessonNumber === 1) {
      return [
        'Свяжи натуральные числа со счётом или измерением.',
        'Объясни, что после любого натурального числа можно назвать следующее.',
        'Сделай вывод, почему последнего натурального числа не существует.',
      ];
    }
    return goals.slice(0, 3).map(goal => goal.replace(/[.!?]+$/, ''));
  }, [goals, lessonNumber]);

  function saveReflection() {
    const value = response.trim();
    if (!value || !practiceComplete) return;
    window.localStorage.setItem(storageKey, value);
    setSaved(true);
  }

  return (
    <section className="lesson-reflection" aria-labelledby="lesson-reflection-title">
      <div className="reflection-heading">
        <span>Закрепляем урок</span>
        <h2 id="lesson-reflection-title">Сначала дополнительная практика</h2>
        <p>{lessonTitle}</p>
      </div>

      <ExtendedPracticeLab lessonNumber={lessonNumber} onComplete={() => setPracticeComplete(true)} />

      {!practiceComplete ? (
        <p className="reflection-practice-lock" aria-live="polite">
          Финальное объяснение темы откроется после выполнения всех дополнительных заданий.
        </p>
      ) : null}

      <div className="reflection-final-step" hidden={!practiceComplete}>
        <div className="reflection-heading">
          <span>Замыкаем урок</span>
          <h2>Теперь ответь на главный вопрос</h2>
          <p>Сформулируй, что ты понял после основной и дополнительной практики.</p>
        </div>

        <blockquote>{openingQuestion}</blockquote>

        <label className="reflection-answer">
          <span>Объясни своими словами</span>
          <textarea
            value={response}
            onChange={event => {
              setResponse(event.target.value);
              setSaved(false);
            }}
            placeholder="Напиши 2–4 предложения. Важен ход мысли, а не идеальная формулировка."
            rows={5}
          />
        </label>

        <details className="reflection-criteria">
          <summary>Что должно быть в сильном ответе</summary>
          <ul>{criteria.map(item => <li key={item}>{item}</li>)}</ul>
        </details>

        <div className="reflection-actions">
          <button type="button" className="secondary" onClick={onReviewOpening}>Вернуться ко вступлению</button>
          <button type="button" className="reflection-save" onClick={saveReflection} disabled={!response.trim()}>
            {saved ? 'Ответ сохранён ✓' : 'Сохранить ответ'}
          </button>
        </div>

        <p className="reflection-note" aria-live="polite">
          {saved ? 'Отлично. Урок завершён практикой, проверкой и собственным объяснением.' : 'Так мы проверяем не запоминание фразы, а настоящее понимание темы.'}
        </p>
      </div>
    </section>
  );
}
