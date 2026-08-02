import { useEffect, useMemo, useState } from 'react';
import { ExtendedPracticeLab } from './ExtendedPracticeLab';
import { formatActiveLessonTime,loadLessonTiming } from './lessonTiming';
import './lessonReflection.css';

export type LessonReflectionProps = {
  lessonNumber: number;
  lessonTitle: string;
  openingQuestion: string;
  goals: string[];
  onReviewOpening: () => void;
};

type CompletionRecord={completedAt:string;activeSeconds:number};

export function LessonReflection({ lessonNumber, lessonTitle, openingQuestion, goals, onReviewOpening }: LessonReflectionProps) {
  const storageKey = `mathnikita:reflection:${lessonNumber}`;
  const completionKey = `mathnikita:lesson-complete:${lessonNumber}`;
  const [response, setResponse] = useState('');
  const [saved, setSaved] = useState(false);
  const [practiceComplete, setPracticeComplete] = useState(false);
  const [completedActiveSeconds,setCompletedActiveSeconds]=useState<number|null>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem(storageKey) ?? '';
    const rawCompletion=window.localStorage.getItem(completionKey);
    let completion:CompletionRecord|null=null;
    try{completion=rawCompletion?JSON.parse(rawCompletion) as CompletionRecord:null}catch{/* legacy or corrupted completion */}
    setResponse(stored);
    setSaved(Boolean(stored&&rawCompletion));
    setCompletedActiveSeconds(completion?.activeSeconds??null);
    setPracticeComplete(false);
  }, [storageKey, completionKey]);

  useEffect(()=>{
    const reset=(event:Event)=>{
      const detail=(event as CustomEvent<{lessonNumber?:number}>).detail;
      if(detail?.lessonNumber!==lessonNumber)return;
      window.localStorage.removeItem(storageKey);
      window.localStorage.removeItem(completionKey);
      setResponse('');
      setSaved(false);
      setPracticeComplete(false);
      setCompletedActiveSeconds(null);
    };
    window.addEventListener('mathnikita-lesson-reset',reset);
    return()=>window.removeEventListener('mathnikita-lesson-reset',reset);
  },[lessonNumber,storageKey,completionKey]);

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
    const completedAt=new Date().toISOString();
    const activeSeconds=Math.round(loadLessonTiming(lessonNumber).activeSeconds);
    const completion:CompletionRecord={completedAt,activeSeconds};
    window.localStorage.setItem(storageKey, value);
    window.localStorage.setItem(completionKey,JSON.stringify(completion));
    setCompletedActiveSeconds(activeSeconds);
    setSaved(true);
    window.dispatchEvent(new CustomEvent('mathnikita-lesson-completed',{detail:{lessonNumber,...completion}}));
  }

  function restartMandatoryPractice(){
    window.localStorage.removeItem(completionKey);
    setPracticeComplete(false);
    setSaved(false);
    setCompletedActiveSeconds(null);
  }

  return (
    <section className="lesson-reflection" aria-labelledby="lesson-reflection-title" data-lesson-completion-gate={lessonNumber}>
      <div className="reflection-heading">
        <span>Финиш урока</span>
        <h2 id="lesson-reflection-title">Обязательная практика</h2>
        <p>{lessonTitle}</p>
      </div>

      <div className="reflection-completion-gate" role="status">
        <b>Основная часть пройдена. Урок ещё не завершён.</b>
        Чтобы урок считался завершённым, нужно выполнить всю обязательную практику и затем своими словами объяснить главный вывод темы.
      </div>

      <ExtendedPracticeLab lessonNumber={lessonNumber} onComplete={() => setPracticeComplete(true)} onRestart={restartMandatoryPractice} />

      {!practiceComplete ? (
        <p className="reflection-practice-lock" aria-live="polite">
          Итог урока откроется только после выполнения всех обязательных заданий.
        </p>
      ) : null}

      <div className="reflection-final-step" hidden={!practiceComplete}>
        <div className="reflection-heading">
          <span>Последний шаг</span>
          <h2>Теперь объясни главный вывод</h2>
          <p>Сформулируй, что ты понял после основной и обязательной практики.</p>
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
          <button type="button" className="reflection-save" onClick={saveReflection} disabled={!response.trim()||!practiceComplete}>
            {saved ? 'Урок завершён ✓' : 'Завершить урок'}
          </button>
        </div>

        <p className={`reflection-note ${saved?'is-complete':''}`} aria-live="polite">
          {saved ? `Урок завершён ✓ Фактическое активное время: ${formatActiveLessonTime(completedActiveSeconds??0)}.` : 'Урок получит статус «завершён» только после сохранения этого ответа. Фактическое активное время будет записано автоматически.'}
        </p>
      </div>
    </section>
  );
}
