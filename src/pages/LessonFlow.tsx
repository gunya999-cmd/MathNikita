import { useMemo, useState } from 'react';
import { Button } from '../components/Button';
import { getEliteLessonContent, sourceLabel } from '../data/eliteLessonContent';
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
  const elite = useMemo(() => getEliteLessonContent(lesson), [lesson]);
  const lessonId = makeLessonId(program.grade, lesson.order);
  const [mastery, setMastery] = useState<LessonMasteryState>(() => loadLessonMastery(lessonId));
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const stage = mastery.stage;
  const primarySkill = lesson.skills[0] ?? lesson.title;
  const expected = [lesson.title, primarySkill, ...lesson.skills, ...elite.keywords];

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
      <div className="eyebrow">Элитный урок · SG/CN/RU/US/HU · {program.label}</div>
      <h2>Урок {lesson.order}: {lesson.title}</h2>
      <p className="muted">Сначала обучение, затем закрепление, затем контрольная. Если есть ошибка, система возвращает к разбору и объясняет слабое место.</p>

      <div className="source-chips">
        {elite.sourceBlend.map((source) => <span key={source}>{sourceLabel(source)}</span>)}
      </div>

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
        <div className="lesson-block elite-lesson-block">
          <h3>1. Обучение</h3>
          <p><strong>Тема:</strong> {lesson.title}</p>
          <p><strong>Цель:</strong> {lesson.objective}</p>
          <p><strong>Модуль:</strong> {lesson.moduleTitle} — {lesson.moduleFocus}</p>

          <div className="teaching-card">
            <div className="eyebrow">Объяснение учителя</div>
            <h4>Сначала понимаем смысл</h4>
            <p>{elite.teaching.teacherOpening}</p>
            <p>{elite.teaching.conceptExplanation}</p>
            <div className="hint-box"><strong>Мысленная модель:</strong> {elite.teaching.mentalModel}</div>
          </div>

          <div className="worked-example">
            <div className="eyebrow">Пошаговый пример</div>
            <h4>{elite.teaching.workedExample.problem}</h4>
            <ol>
              {elite.teaching.workedExample.steps.map((step) => <li key={step}>{step}</li>)}
            </ol>
            <div className="success-box"><strong>Ответ:</strong> {elite.teaching.workedExample.answer}</div>
            <p><strong>Почему это работает:</strong> {elite.teaching.workedExample.whyItWorks}</p>
          </div>

          <div className="guided-questions">
            <div className="eyebrow">Вопросы сильного учителя</div>
            {elite.teaching.guidedQuestions.map((question) => <span key={question}>{question}</span>)}
          </div>

          <div className="example-box">{elite.bigIdea}</div>
          <div className="elite-grid">
            <article><strong>SG структура</strong><span>{elite.learn.concreteModel}</span></article>
            <article><strong>US Exeter/AoPS</strong><span>{elite.learn.discoveryPrompt}</span></article>
            <article><strong>RU доказательность</strong><span>{elite.learn.proofHabit}</span></article>
            <article><strong>CN/HU глубина</strong><span>{elite.learn.olympiadBridge}</span></article>
          </div>
          <p><strong>Формальное правило:</strong> {elite.learn.formalRule}</p>
          <div className="success-box"><strong>Что ученик должен вынести:</strong> {elite.teaching.studentTakeaway}</div>
          <Button onClick={startPractice}>Перейти к закреплению</Button>
        </div>
      )}

      {stage === 'practice' && (
        <div className="lesson-block">
          <h3>2. Закрепление</h3>
          <p>{elite.practice.base}</p>
          <p>{elite.practice.nonStandard}</p>
          <label className="question compact">
            <span>{elite.practice.proofOrExplain}</span>
            <input value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder="Напиши тему, навык или объяснение" />
          </label>
          <Button onClick={() => submit('practice')}>Проверить закрепление</Button>
        </div>
      )}

      {stage === 'test' && (
        <div className="lesson-block">
          <h3>3. Контрольная</h3>
          <p>{elite.control.quickCheck}</p>
          <p>{elite.control.transferProblem}</p>
          <label className="question compact">
            <span>Ответь без подсказки: тема + главный навык + короткое объяснение.</span>
            <input value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder="Ответ без подсказки" />
          </label>
          <div className="criteria-list">
            {elite.control.masteryCriteria.map((criterion) => <span key={criterion}>{criterion}</span>)}
          </div>
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
          <div className="elite-grid">
            {elite.commonMistakes.map((mistake) => <article key={mistake}><strong>Типичная ошибка</strong><span>{mistake}</span></article>)}
          </div>
          <div className="criteria-list">
            {elite.aiRemediation.map((step) => <span key={step}>{step}</span>)}
          </div>
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
