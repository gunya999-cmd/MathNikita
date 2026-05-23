import { useMemo, useState } from 'react';
import { Button } from '../components/Button';
import { getLearningProgram } from '../data/learningProgram';
import {
  loadLessonMastery,
  makeLessonId,
  nextLessonStageLabel,
  recordLessonAttempt,
  saveLessonMastery,
  type LessonMasteryState,
} from '../data/lessonMastery';

export function LessonFlow({ grade, onMastered }: { grade: string; onMastered: () => void }) {
  const program = useMemo(() => getLearningProgram(grade), [grade]);
  const lessons = program.modules.flatMap((module) => module.lessons.map((lesson) => ({ ...lesson, moduleTitle: module.title, moduleFocus: module.focus })));
  const firstUnfinished = lessons[Math.min(program.totalExercises, lessons.length) - lessons.length] ?? lessons[0];
  const [lessonOrder, setLessonOrder] = useState(firstUnfinished?.order ?? 1);
  const lesson = lessons.find((item) => item.order === lessonOrder) ?? lessons[0];
  const lessonId = makeLessonId(program.grade, lesson.order);
  const [mastery, setMastery] = useState<LessonMasteryState>(() => loadLessonMastery(lessonId));
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const stage = mastery.stage;
  const primarySkill = lesson.skills[0] ?? lesson.title;
  const expected = [lesson.title, primarySkill, ...lesson.skills];

  function chooseLesson(order: number) {
    const nextLesson = lessons.find((item) => item.order === order) ?? lesson;
    const nextId = makeLessonId(program.grade, nextLesson.order);
    setLessonOrder(order);
    setMastery(loadLessonMastery(nextId));
    setAnswer('');
    setFeedback('');
  }

  function startPractice() {
    const next = { ...mastery, stage: 'practice' as const };
    saveLessonMastery(next);
    setMastery(next);
    setAnswer('');
    setFeedback('');
  }

  function retryAfterReview() {
    const next = { ...mastery, stage: 'learn' as const };
    saveLessonMastery(next);
    setMastery(next);
    setAnswer('');
    setFeedback('');
  }

  function submit(phase: 'practice' | 'test') {
    const result = recordLessonAttempt(mastery, { answer, expected, skill: primarySkill, phase });
    saveLessonMastery(result.nextState);
    setMastery(result.nextState);
    setFeedback(result.feedback);
    setAnswer('');
    if (result.nextState.stage === 'mastered') onMastered();
  }

  return (
    <section className="panel wide lesson-flow">
      <div className="eyebrow">Урок с AI-контролем усвоения · {program.label}</div>
      <h2>Урок {lesson.order}: {lesson.title}</h2>
      <p className="muted">Сначала обучение, затем закрепление, затем контрольная. Если есть ошибка, система возвращает к разбору и объясняет слабое место.</p>

      <div className="tab-row">
        {lessons.map((item) => (
          <button className={item.order === lesson.order ? 'tab active' : 'tab'} key={item.order} onClick={() => chooseLesson(item.order)}>
            {item.order}
          </button>
        ))}
      </div>

      <div className="mastery-status">
        <div><strong>{nextLessonStageLabel(stage)}</strong><span>текущий этап</span></div>
        <div><strong>{mastery.practiceCorrect}</strong><span>закрепление</span></div>
        <div><strong>{mastery.testCorrect}/2</strong><span>контрольная</span></div>
        <div><strong>{mastery.weakSkills.length}</strong><span>слабые места</span></div>
      </div>

      {stage === 'learn' && (
        <div className="lesson-block">
          <h3>1. Обучение</h3>
          <p><strong>Тема:</strong> {lesson.title}</p>
          <p><strong>Цель:</strong> {lesson.objective}</p>
          <p><strong>Модуль:</strong> {lesson.moduleTitle} — {lesson.moduleFocus}</p>
          <div className="example-box">Главная идея: {primarySkill}. Ученик должен уметь объяснить тему своими словами, а не просто угадать ответ.</div>
          <Button onClick={startPractice}>Перейти к закреплению</Button>
        </div>
      )}

      {stage === 'practice' && (
        <div className="lesson-block">
          <h3>2. Закрепление</h3>
          <p>Сформулируй главную идею урока или ключевой навык. Можно своими словами.</p>
          <label className="question compact">
            <span>Что тренирует урок «{lesson.title}»?</span>
            <input value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder="Напиши тему или навык" />
          </label>
          <Button onClick={() => submit('practice')}>Проверить закрепление</Button>
        </div>
      )}

      {stage === 'test' && (
        <div className="lesson-block">
          <h3>3. Контрольная</h3>
          <p>Контрольная засчитывается, когда ученик дважды уверенно распознаёт тему/навык без подсказки.</p>
          <label className="question compact">
            <span>Контрольный вопрос: назови тему урока и главный навык.</span>
            <input value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder="Ответ без подсказки" />
          </label>
          <Button onClick={() => submit('test')}>Проверить контрольную</Button>
        </div>
      )}

      {stage === 'review' && (
        <div className="lesson-block">
          <h3>Разбор ошибок</h3>
          <p>AI-логика нашла слабое место. Перед новой попыткой нужно вернуться к объяснению.</p>
          {mastery.mistakes.slice(-3).map((mistake) => (
            <div className="hint-box" key={`${mistake.createdAt}-${mistake.type}`}>
              <strong>{mistake.type}</strong>: {mistake.explanation}
            </div>
          ))}
          <Button onClick={retryAfterReview}>Повторить объяснение</Button>
        </div>
      )}

      {stage === 'mastered' && (
        <div className="success-box">
          <strong>Урок усвоен.</strong> Можно переходить к следующей теме.
        </div>
      )}

      {feedback && <div className={stage === 'review' ? 'hint-box' : 'success-box'}>{feedback}</div>}
    </section>
  );
}
