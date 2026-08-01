import { useMemo, useState } from 'react';
import { skillLabels, type CourseTask } from './data/course';
import { totalLessons, yearPlan } from './data/yearPlan';
import { LessonCourseShell } from './LessonCourseShell';
import './focusLearning.css';
import {
  advanceAfterCorrect,
  averageMastery,
  currentLesson,
  getCurrentTask,
  loadLearnerState,
  recordAttempt,
  saveLearnerState,
  weakSkills,
  type LearnerState,
} from './learningEngine';

type Screen = 'learn' | 'course' | 'map' | 'progress' | 'parent';
type Feedback = 'idle' | 'correct' | 'wrong';

const islands = [
  ['🏘️', 'Натуральные числа', 20],
  ['🏰', 'Сложение и вычитание натуральных чисел', 33],
  ['⚙️', 'Умножение и деление натуральных чисел', 37],
  ['🍰', 'Обыкновенные дроби', 18],
  ['🔬', 'Десятичные дроби', 48],
  ['🏆', 'Итоговое повторение', 19],
] as const;

function normalize(value: string) {
  return value.trim().toLowerCase().replace(',', '.').replace(/\s+/g, '');
}

function persist(next: LearnerState, setter: (state: LearnerState) => void) {
  saveLearnerState(next);
  setter(next);
}

function answerChoices(task: CourseTask): string[] | null {
  const numeric = Number(task.answer.replace(',', '.'));
  if (!Number.isFinite(numeric)) return null;
  const delta = Math.max(1, Math.round(Math.abs(numeric) * 0.08));
  return Array.from(new Set([numeric - delta, numeric + 1, numeric, numeric + delta + 1])).sort((a, b) => a - b).map(String);
}

export function App() {
  const [screen, setScreen] = useState<Screen>('course');
  const [state, setState] = useState<LearnerState>(loadLearnerState);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<Feedback>('idle');
  const [attemptsOnTask, setAttemptsOnTask] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [routeBuilt, setRouteBuilt] = useState(false);

  const task = getCurrentTask(state);
  const lesson = currentLesson(state);
  const weak = useMemo(() => weakSkills(state), [state]);
  const mastery = averageMastery(state);
  const isDiagnostic = !state.diagnosticDone;
  const choices = isDiagnostic ? answerChoices(task) : null;
  const completedLessons = Math.min(state.completedSessions, totalLessons);
  const currentYearLesson = Math.min(state.currentLessonIndex + 1, totalLessons);
  const yearProgress = Math.round((completedLessons / totalLessons) * 100);
  const sessionProgress = Math.round(((state.currentTaskIndex + (feedback === 'correct' ? 1 : 0)) / state.currentSessionTaskIds.length) * 100);

  function resetTaskUi() {
    setAnswer('');
    setFeedback('idle');
    setAttemptsOnTask(0);
    setShowHint(false);
  }

  function checkAnswer(value = answer) {
    if (!value.trim() || feedback === 'correct') return;
    const correct = normalize(value) === normalize(task.answer);
    const next = recordAttempt(state, task, { correct, firstTry: attemptsOnTask === 0, usedHint: showHint });
    persist(next, setState);
    setAnswer(value);
    setAttemptsOnTask(count => count + 1);
    if (correct) setFeedback('correct');
    else { setFeedback('wrong'); setShowHint(true); }
  }

  function continueLearning() {
    const finishingDiagnostic = isDiagnostic && state.currentTaskIndex === state.currentSessionTaskIds.length - 1;
    const next = advanceAfterCorrect(state);
    persist(next, setState);
    resetTaskUi();
    if (finishingDiagnostic) setRouteBuilt(true);
  }

  function resetCourse() {
    localStorage.removeItem('math-course-state-v3');
    window.location.reload();
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={() => setScreen('course')}><span>Σ</span><div>MathNikita<small>полный курс математики · 5 класс</small></div></button>
        <nav>
          <button className={screen === 'course' ? 'active' : ''} onClick={() => setScreen('course')}>Уроки</button>
          <button className={screen === 'learn' ? 'active' : ''} onClick={() => setScreen('learn')}>Диагностика</button>
          <button className={screen === 'map' ? 'active' : ''} onClick={() => setScreen('map')}>Карта знаний</button>
          <button className={screen === 'progress' ? 'active' : ''} onClick={() => setScreen('progress')}>Прогресс</button>
          <button className={screen === 'parent' ? 'active' : ''} onClick={() => setScreen('parent')}>Родителям</button>
        </nav>
        <div className="xp-pill">⭐ <b>{state.xp}</b> XP</div>
      </header>

      {screen === 'course' && <LessonCourseShell />}

      {screen === 'learn' && <main className="learn-page">
        <section className="year-status">
          <div><span>Учебный год</span><b>{completedLessons} из {totalLessons} уроков</b><small>Осталось {totalLessons - completedLessons}</small></div>
          <div className="year-bar"><i style={{ width: `${yearProgress}%` }} /></div>
          <button onClick={() => setScreen('course')}>Открыть уроки</button>
        </section>

        <section className="product-hero">
          <div className="hero-copy"><span>{isDiagnostic ? 'Первое знакомство' : `Сегодня · урок ${currentYearLesson}`}</span><h1>{isDiagnostic ? 'Привет! Я кот Пифагор' : lesson.title}</h1><p>{isDiagnostic ? 'За 8 коротких заданий я пойму, что ты уже умеешь, и построю личный маршрут.' : `${lesson.unit}. ${lesson.goal}`}</p></div>
          <div className="hero-mascot" aria-label="Кот Пифагор"><div className="cat-emoji">😺</div><b>π</b></div>
          <div className="route-strip">{state.currentSessionTaskIds.map((id, index) => <span key={`${id}-${index}`} className={index < state.currentTaskIndex ? 'done' : index === state.currentTaskIndex ? 'current' : ''}>{index + 1}<small>{index === state.currentTaskIndex ? task.kind : 'этап'}</small></span>)}</div>
          <div className="hero-note">{isDiagnostic ? `Диагностика ${state.currentTaskIndex + 1} из ${state.currentSessionTaskIds.length}` : `${yearPlan[currentYearLesson - 1]?.paragraph} · ${sessionProgress}% урока`}</div>
        </section>

        <div className="learning-grid">
          <section className="task-card"><div className="task-meta"><span>{skillLabels[task.skill]}</span><b>{state.currentTaskIndex + 1} / {state.currentSessionTaskIds.length}</b></div><div className="task-main"><div className="phase-tag">{task.title}</div><h2>{task.prompt}</h2>{choices ? <div className="choice-grid">{choices.map(choice => <button key={choice} className={answer === choice ? 'selected' : ''} onClick={() => { setAnswer(choice); checkAnswer(choice); }}>{choice}</button>)}</div> : <div className="answer-box"><input value={answer} onChange={e => setAnswer(e.target.value)} onKeyDown={e => e.key === 'Enter' && checkAnswer()} placeholder="Введи ответ" autoFocus/><button onClick={() => checkAnswer()}>Проверить</button></div>}{showHint && feedback !== 'correct' && <div className="hint-box"><b>Подсказка от Пифагора</b><span>{task.hint}</span></div>}{feedback === 'wrong' && <div className="feedback bad"><b>Почти. Попробуем ещё раз</b><span>Ошибка учтена — позже появится короткое повторение.</span></div>}{feedback === 'correct' && <div className="feedback good"><b>{attemptsOnTask === 1 ? 'Верно с первой попытки!' : 'Верно!'}</b><span>{task.explanation}</span><button onClick={continueLearning}>{state.currentTaskIndex === state.currentSessionTaskIds.length - 1 ? (isDiagnostic ? 'Построить маршрут' : 'Завершить урок') : 'Дальше →'}</button></div>}</div></section>
          <aside className="mission-column"><article className="profile-card"><div className="mini-cat">😸</div><div><b>Кот Пифагор</b><span>помощник по математике</span></div><div className="energy"><span>Энергия</span><b>10 / 10</b><i /></div></article><article className="goal-card"><span>Сегодняшняя цель</span><b>{isDiagnostic ? 'Пройти диагностику' : `Завершить урок ${currentYearLesson}`}</b><small>{sessionProgress}% выполнено</small><div className="mini-bar"><i style={{ width: `${sessionProgress}%` }} /></div></article></aside>
        </div>
      </main>}

      {screen === 'map' && <main className="dashboard"><header><span>Карта знаний</span><h1>Курс математики 5 класса</h1><p>175 уроков по I варианту планирования Мерзляка.</p></header><div className="world-grid">{islands.map(([icon,title,count],i)=><article key={title}><i>{icon}</i><h3>{title}</h3><p>{count} уроков</p><b>{i===0?'20 уроков готовы':i===1?'1 урок готов':'В разработке'}</b></article>)}</div></main>}

      {screen === 'progress' && <main className="dashboard"><header><span>Личный кабинет</span><h1>Прогресс ученика</h1><p>Темп, сильные стороны и темы для повторения.</p></header><div className="score-row"><article><span>Год</span><b>{yearProgress}%</b><small>{completedLessons} из {totalLessons}</small></article><article><span>Освоение</span><b>{mastery}%</b><small>Средний уровень навыков</small></article><article><span>Текущий урок</span><b>{currentYearLesson}</b><small>{yearPlan[currentYearLesson - 1]?.title}</small></article></div><div className="skills-grid">{Object.entries(state.skills).map(([id,skill])=><article key={id}><div><b>{skillLabels[id as keyof typeof skillLabels]}</b><strong>{skill.mastery}%</strong></div><div className="bar"><i style={{width:`${skill.mastery}%`}}/></div><small>{skill.needsReview?'Нужно повторить':'Продвигаемся хорошо'}</small></article>)}</div></main>}

      {screen === 'parent' && <main className="dashboard"><header><span>Для родителей</span><h1>Учебный маршрут</h1><p>Курс идёт по школьной программе, повторение добавляется автоматически.</p></header><div className="parent-grid"><article><h3>Готовый контент</h3><p>Полностью готов 21 интерактивный урок. В каталоге уже отражён точный годовой план из 175 уроков.</p></article><article><h3>Пробелы</h3><p>{weak.length?`Обнаружено навыков для повторения: ${weak.length}`:'Выраженных пробелов нет.'}</p></article><article><h3>Олимпиадная линия</h3><p>В каждом готовом уроке есть отдельная нестандартная задача.</p></article><article><h3>Управление</h3><button className="danger-button" onClick={resetCourse}>Сбросить прогресс</button></article></div></main>}

      {routeBuilt && <div className="route-modal"><div><span>🎉</span><h2>Маршрут построен!</h2><p>Начинаем с урока №1.</p><button onClick={() => { setRouteBuilt(false); setScreen('course'); }}>Открыть первый урок</button></div></div>}
    </div>
  );
}
