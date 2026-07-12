import { useMemo, useState } from 'react';
import { skillLabels, type CourseTask } from './data/course';
import { totalLessons, yearPlan } from './data/yearPlan';
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

type Screen = 'learn' | 'map' | 'progress' | 'parent';
type Feedback = 'idle' | 'correct' | 'wrong';

const islands = [
  ['🏘️', 'Натуральные числа', 20],
  ['🏰', 'Выражения', 33],
  ['⚙️', 'Умножение', 37],
  ['🍰', 'Дроби', 18],
  ['🔬', 'Десятичные дроби', 48],
  ['🏆', 'Финал года', 19],
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
  return Array.from(new Set([numeric - delta, numeric + 1, numeric, numeric + delta + 1]))
    .sort((a, b) => a - b)
    .map(String);
}

export function App() {
  const [screen, setScreen] = useState<Screen>('learn');
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
    const next = recordAttempt(state, task, {
      correct,
      firstTry: attemptsOnTask === 0,
      usedHint: showHint,
    });
    persist(next, setState);
    setAnswer(value);
    setAttemptsOnTask(count => count + 1);
    if (correct) setFeedback('correct');
    else {
      setFeedback('wrong');
      setShowHint(true);
    }
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
        <button className="brand" onClick={() => setScreen('learn')}><span>Σ</span><div>MathNikita<small>математика с котом Пифагором</small></div></button>
        <nav>
          <button className={screen === 'learn' ? 'active' : ''} onClick={() => setScreen('learn')}>Сегодня</button>
          <button className={screen === 'map' ? 'active' : ''} onClick={() => setScreen('map')}>Карта мира</button>
          <button className={screen === 'progress' ? 'active' : ''} onClick={() => setScreen('progress')}>Прогресс</button>
          <button className={screen === 'parent' ? 'active' : ''} onClick={() => setScreen('parent')}>Родителям</button>
        </nav>
        <div className="xp-pill">⭐ <b>{state.xp}</b> XP</div>
      </header>

      {screen === 'learn' && <main className="learn-page">
        <section className="year-status">
          <div><span>Учебный год</span><b>{completedLessons} из {totalLessons} уроков</b><small>Осталось {totalLessons - completedLessons}</small></div>
          <div className="year-bar"><i style={{ width: `${yearProgress}%` }} /></div>
          <button onClick={() => setScreen('map')}>Открыть карту 🗺️</button>
        </section>

        <section className="product-hero">
          <div className="hero-copy">
            <span>{isDiagnostic ? 'Первое знакомство' : `Сегодня · урок ${currentYearLesson}`}</span>
            <h1>{isDiagnostic ? 'Привет! Я кот Пифагор' : lesson.title}</h1>
            <p>{isDiagnostic ? 'За 8 коротких заданий я пойму, что ты уже умеешь, и построю личный маршрут на весь учебный год.' : `${lesson.unit}. ${lesson.goal}`}</p>
          </div>
          <div className="hero-mascot" aria-label="Кот Пифагор"><div className="cat-emoji">😺</div><b>π</b></div>
          <div className="route-strip">
            {state.currentSessionTaskIds.map((id, index) => <span key={`${id}-${index}`} className={index < state.currentTaskIndex ? 'done' : index === state.currentTaskIndex ? 'current' : ''}>{index + 1}<small>{index === state.currentTaskIndex ? task.kind : 'этап'}</small></span>)}
          </div>
          <div className="hero-note">{isDiagnostic ? `Диагностика ${state.currentTaskIndex + 1} из ${state.currentSessionTaskIds.length}` : `${yearPlan[currentYearLesson - 1]?.paragraph} · ${sessionProgress}% урока`}</div>
        </section>

        <div className="learning-grid">
          <section className="task-card">
            <div className="task-meta"><span>{skillLabels[task.skill]}</span><b>{state.currentTaskIndex + 1} / {state.currentSessionTaskIds.length}</b></div>
            <div className="task-main">
              <div className="phase-tag">{task.title}</div>
              <h2>{task.prompt}</h2>
              {choices ? <div className="choice-grid">{choices.map(choice => <button key={choice} className={answer === choice ? 'selected' : ''} onClick={() => { setAnswer(choice); checkAnswer(choice); }}>{choice}</button>)}</div> : <div className="answer-box"><input value={answer} onChange={e => setAnswer(e.target.value)} onKeyDown={e => e.key === 'Enter' && checkAnswer()} placeholder="Введи ответ" autoFocus/><button onClick={() => checkAnswer()}>Проверить</button></div>}
              {showHint && feedback !== 'correct' && <div className="hint-box"><b>Подсказка от Пифагора</b><span>{task.hint}</span></div>}
              {feedback === 'wrong' && <div className="feedback bad"><b>Почти! Попробуем ещё раз</b><span>Ошибка уже учтена — позже я дам короткое повторение по этой теме.</span></div>}
              {feedback === 'correct' && <div className="feedback good"><b>{attemptsOnTask === 1 ? 'Мяу! Верно с первой попытки!' : 'Верно!'}</b><span>{task.explanation}</span><button onClick={continueLearning}>{state.currentTaskIndex === state.currentSessionTaskIds.length - 1 ? (isDiagnostic ? 'Построить мой маршрут' : 'Завершить урок') : 'Дальше →'}</button></div>}
            </div>
          </section>

          <aside className="mission-column">
            <article className="profile-card"><div className="mini-cat">😸</div><div><b>Кот Пифагор</b><span>твой помощник и друг</span></div><div className="energy"><span>❤️ Энергия</span><b>10 / 10</b><i /></div></article>
            <article className="goal-card"><span>🎯 Сегодняшняя цель</span><b>{isDiagnostic ? 'Пройти диагностику' : `Завершить урок ${currentYearLesson}`}</b><small>{sessionProgress}% выполнено</small><div className="mini-bar"><i style={{ width: `${sessionProgress}%` }} /></div></article>
            <article className="streak-card"><span>🔥 Серия успеха</span><b>{completedLessons ? `${Math.min(completedLessons, 7)} дней` : 'Первый день'}</b><small>Каждый урок зажигает новый фонарь на карте.</small></article>
            <article className="route-card"><span>🧭 Личный маршрут</span><b>{isDiagnostic ? 'Строится сейчас' : `${mastery}% освоения`}</b><small>{weak.length ? `На повторение: ${weak.length} навыка` : 'Маршрут идёт по плану'}</small></article>
          </aside>
        </div>

        <section className="map-preview">
          <header><div><b>Карта математического мира</b><span>Пройди урок — открой новую локацию</span></div><button onClick={() => setScreen('map')}>Перейти к карте</button></header>
          <div className="island-row">{islands.map(([icon, title, count], index) => <article key={title} className={completedLessons >= islands.slice(0, index).reduce((sum, item) => sum + item[2], 0) ? 'lit' : ''}><i>{icon}</i><b>{title}</b><small>{index === 0 ? `${Math.min(completedLessons, count)} / ${count}` : `0 / ${count}`}</small></article>)}</div>
        </section>
      </main>}

      {screen === 'map' && <main className="dashboard"><header><span>Карта знаний</span><h1>Математическое королевство</h1><p>Каждый район открывается по мере прохождения уроков.</p></header><div className="world-grid">{islands.map(([icon,title,count],i)=><article key={title}><i>{icon}</i><h3>{title}</h3><p>{count} уроков</p><b>{i===0?`${Math.min(completedLessons,count)} / ${count}`:'Закрыто'}</b></article>)}</div></main>}

      {screen === 'progress' && <main className="dashboard"><header><span>Личный кабинет</span><h1>Прогресс ученика</h1><p>Здесь видно темп, сильные стороны и темы для повторения.</p></header><div className="score-row"><article><span>Год</span><b>{yearProgress}%</b><small>{completedLessons} из {totalLessons}</small></article><article><span>Освоение</span><b>{mastery}%</b><small>Средний уровень навыков</small></article><article><span>Текущий урок</span><b>{currentYearLesson}</b><small>{yearPlan[currentYearLesson - 1]?.title}</small></article></div><div className="skills-grid">{Object.entries(state.skills).map(([id,skill])=><article key={id}><div><b>{skillLabels[id as keyof typeof skillLabels]}</b><strong>{skill.mastery}%</strong></div><div className="bar"><i style={{width:`${skill.mastery}%`}}/></div><small>{skill.needsReview?'Нужно повторить':'Продвигаемся хорошо'}</small></article>)}</div></main>}

      {screen === 'parent' && <main className="dashboard"><header><span>Для родителей</span><h1>Учебный маршрут</h1><p>Курс идёт по плану учебника, а повторение добавляется автоматически.</p></header><div className="parent-grid"><article><h3>Текущий этап</h3><p>{isDiagnostic?'Стартовая диагностика':`Урок ${currentYearLesson}: ${lesson.title}`}</p></article><article><h3>Пробелы</h3><p>{weak.length?`Обнаружено навыков для повторения: ${weak.length}`:'Выраженных пробелов нет.'}</p></article><article><h3>Олимпиадная линия</h3><p>В каждый урок встроена одна нестандартная задача.</p></article><article><h3>Управление</h3><button className="danger-button" onClick={resetCourse}>Сбросить прогресс</button></article></div></main>}

      {routeBuilt && <div className="route-modal"><div><span>🎉</span><h2>Маршрут построен!</h2><p>Я определил сильные стороны и темы для повторения. Начинаем с урока №1.</p><button onClick={() => setRouteBuilt(false)}>Начать первый урок</button></div></div>}
    </div>
  );
}
