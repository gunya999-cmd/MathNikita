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

function normalize(value: string) {
  return value.trim().toLowerCase().replace(',', '.').replace(/\s+/g, '');
}

function persist(next: LearnerState, setter: (state: LearnerState) => void) {
  saveLearnerState(next);
  setter(next);
}

export function App() {
  const [screen, setScreen] = useState<Screen>('learn');
  const [state, setState] = useState<LearnerState>(loadLearnerState);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<Feedback>('idle');
  const [attemptsOnTask, setAttemptsOnTask] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [celebrate, setCelebrate] = useState(false);

  const task = getCurrentTask(state);
  const lesson = currentLesson(state);
  const mastery = averageMastery(state);
  const weak = useMemo(() => weakSkills(state), [state]);
  const isDiagnostic = !state.diagnosticDone;
  const currentYearLesson = Math.min(state.currentLessonIndex + 1, totalLessons);
  const completedLessons = Math.min(state.completedSessions, totalLessons);
  const yearProgress = Math.round((completedLessons / totalLessons) * 100);
  const remainingLessons = Math.max(totalLessons - completedLessons, 0);
  const progressInSession = Math.round(((state.currentTaskIndex + (feedback === 'correct' ? 1 : 0)) / state.currentSessionTaskIds.length) * 100);

  function resetTaskUi() {
    setAnswer('');
    setFeedback('idle');
    setAttemptsOnTask(0);
    setShowHint(false);
  }

  function checkAnswer() {
    if (!answer.trim() || feedback === 'correct') return;
    const correct = normalize(answer) === normalize(task.answer);
    const firstTry = attemptsOnTask === 0;
    const next = recordAttempt(state, task, { correct, firstTry, usedHint: showHint });
    persist(next, setState);
    setAttemptsOnTask(value => value + 1);
    if (correct) {
      setFeedback('correct');
      setCelebrate(true);
      window.setTimeout(() => setCelebrate(false), 900);
    } else {
      setFeedback('wrong');
      setShowHint(true);
    }
  }

  function continueLearning() {
    const next = advanceAfterCorrect(state);
    persist(next, setState);
    resetTaskUi();
  }

  function resetCourse() {
    localStorage.removeItem('math-course-state-v3');
    window.location.reload();
  }

  const sessionTitle = isDiagnostic ? 'Привет! Я кот Пифагор' : `Урок ${currentYearLesson} · ${lesson.title}`;
  const sessionSubtitle = isDiagnostic
    ? 'Ответь на 8 коротких заданий — я определю сильные стороны, найду пробелы и построю твой маршрут на учебный год.'
    : `${yearPlan[currentYearLesson - 1]?.paragraph ?? ''} · ${lesson.goal}`;

  return (
    <div className="app-shell">
      {celebrate && <Celebration firstTry={attemptsOnTask === 1} />}
      <header className="topbar">
        <button className="brand" onClick={() => setScreen('learn')}><span>Σ</span><div>MathNikita<small>математика с котом Пифагором</small></div></button>
        <nav>
          <button className={screen === 'learn' ? 'active' : ''} onClick={() => setScreen('learn')}>★ Сегодня</button>
          <button className={screen === 'map' ? 'active' : ''} onClick={() => setScreen('map')}>🗺 Карта знаний</button>
          <button className={screen === 'progress' ? 'active' : ''} onClick={() => setScreen('progress')}>▥ Прогресс</button>
          <button className={screen === 'parent' ? 'active' : ''} onClick={() => setScreen('parent')}>👥 Для родителя</button>
        </nav>
        <div className="xp-pill"><b>★ {state.xp}</b><span>XP</span></div>
      </header>

      {screen === 'learn' && (
        <main className="learn-page">
          <section className="year-status">
            <div><span>Учебный год</span><b>{completedLessons} из {totalLessons} уроков пройдено</b><small>Осталось: {remainingLessons}</small></div>
            <div className="year-bar"><i style={{ width: `${yearProgress}%` }} /></div>
            <button onClick={() => setScreen('map')}>Открыть карту 🗺</button>
          </section>

          <section className="today-card product-hero">
            <div className="hero-copy">
              <span>{isDiagnostic ? 'Первый запуск' : `Сегодня · урок ${currentYearLesson} из ${totalLessons}`}</span>
              <h1>{sessionTitle}</h1>
              <p>{sessionSubtitle}</p>
            </div>
            <div className="hero-cat"><CatGuide mood={feedback === 'wrong' ? 'thinking' : feedback === 'correct' ? 'happy' : 'ready'} /><b>π</b></div>
            <div className="route-strip" aria-label="Этапы занятия">
              {state.currentSessionTaskIds.map((id, index) => (
                <span key={`${id}-${index}`} className={index < state.currentTaskIndex ? 'done' : index === state.currentTaskIndex ? 'current' : ''}>
                  {index + 1}<small>{index === state.currentTaskIndex ? kindLabel(task) : 'этап'}</small>
                </span>
              ))}
            </div>
            <div className="hero-note">{isDiagnostic ? 'Пройди диагностику — и я соберу индивидуальный маршрут.' : 'Сегодняшний маршрут уже собран. Просто двигайся шаг за шагом.'}</div>
          </section>

          {state.lastSessionSummary && state.currentTaskIndex === 0 && (
            <section className="session-summary">
              <div><span>Предыдущее занятие</span><b>{state.lastSessionSummary.correct} верных ответов</b></div>
              <div><span>Коррекция</span><b>{state.lastSessionSummary.reviewsAdded.length ? `Повторяем: ${state.lastSessionSummary.reviewsAdded.join(', ')}` : 'Повторение не требуется'}</b></div>
              <div><span>Темп</span><b>{state.lastSessionSummary.accelerated ? 'Ускоренный маршрут' : 'Обычный маршрут'}</b></div>
            </section>
          )}

          <div className="learning-grid">
            <section className="task-card">
              <div className="task-meta"><span>{isDiagnostic ? `Диагностика ${state.currentTaskIndex + 1}/${state.currentSessionTaskIds.length}` : skillLabels[task.skill]}</span><b>{task.title}</b></div>
              <div className="task-main">
                <div className={`phase-tag kind-${task.kind}`}>{skillLabels[task.skill]}</div>
                <h2>{task.prompt}</h2>
                {task.visual && <Visual type={task.visual} />}
                <div className="answer-box">
                  <input value={answer} onChange={event => { setAnswer(event.target.value); if (feedback !== 'correct') setFeedback('idle'); }} placeholder="Введи ответ" onKeyDown={event => event.key === 'Enter' && checkAnswer()} autoFocus />
                  <button onClick={checkAnswer}>Проверить ответ 🐾</button>
                </div>
                {!showHint && feedback !== 'correct' && <button className="hint-trigger" onClick={() => setShowHint(true)}>💡 Нужна подсказка</button>}
                {showHint && feedback !== 'correct' && <div className="hint-box"><b>Подсказка Пифагора</b><span>{task.hint}</span></div>}
                {feedback === 'wrong' && <div className="feedback bad"><b>Почти! Попробуем ещё раз</b><span>Я отметил этот навык и при необходимости добавлю короткое повторение.</span></div>}
                {feedback === 'correct' && <div className="feedback good"><b>{attemptsOnTask === 1 ? 'Верно с первой попытки!' : 'Верно!'}</b><span>{task.explanation}</span><button onClick={continueLearning}>{state.currentTaskIndex === state.currentSessionTaskIds.length - 1 ? isDiagnostic ? 'Построить мой маршрут' : 'Завершить урок' : 'Продолжить →'}</button></div>}
              </div>
            </section>

            <aside className="mission-column">
              <article className="profile-card"><CatGuide mood={feedback === 'wrong' ? 'thinking' : feedback === 'correct' ? 'happy' : 'ready'} compact /><div><b>Кот Пифагор</b><span>Твой помощник и друг</span></div><p>{guideText(task, feedback, attemptsOnTask)}</p><div className="energy"><span>❤️ Энергия</span><b>10 из 10</b><i /></div></article>
              <article className="goal-card"><span>🎯 Сегодняшняя цель</span><b>{isDiagnostic ? 'Пройти диагностику' : `Завершить урок ${currentYearLesson}`}</b><small>{state.currentTaskIndex} из {state.currentSessionTaskIds.length} заданий</small><div className="mini-bar"><i style={{ width: `${progressInSession}%` }} /></div></article>
              <article className="streak-card"><span>🔥 Серия успеха</span><b>1 день</b><small>Продолжай в том же духе!</small></article>
              <article className="route-card"><span>🗺 Твой маршрут</span><b>{isDiagnostic ? 'Появится после диагностики' : 'Корректируется автоматически'}</b><small>Слабые места превращаются в короткие повторения, а сильные темы проходят быстрее.</small></article>
            </aside>
          </div>

          <MapPreview completed={completedLessons} onOpen={() => setScreen('map')} />
        </main>
      )}

      {screen === 'map' && <KnowledgeMap current={currentYearLesson} completed={completedLessons} onBack={() => setScreen('learn')} />}

      {screen === 'progress' && (
        <main className="dashboard">
          <header><span>Личный кабинет ученика</span><h1>Прогресс учебного года</h1><p>Здесь видно, сколько пройдено, какие навыки устойчивы и что приложение назначило на повторение.</p></header>
          <div className="score-row">
            <article><span>Учебный год</span><b>{yearProgress}%</b><small>{completedLessons} из {totalLessons} уроков</small></article>
            <article><span>Освоение навыков</span><b>{mastery}%</b><small>Средний уровень по всем направлениям</small></article>
            <article><span>Текущий урок</span><b>{currentYearLesson}</b><small>{yearPlan[currentYearLesson - 1]?.title}</small></article>
          </div>
          <div className="skills-grid">{Object.entries(state.skills).map(([id, skill]) => <article key={id}><div><b>{skillLabels[id as keyof typeof skillLabels]}</b><strong>{skill.mastery}%</strong></div><div className="bar"><i style={{ width: `${skill.mastery}%` }} /></div><small>{skill.needsReview ? 'Назначено повторение' : skill.streak >= 3 ? 'Навык устойчив' : 'Продолжаем наблюдение'}</small></article>)}</div>
        </main>
      )}

      {screen === 'parent' && (
        <main className="dashboard">
          <header><span>Родительский обзор</span><h1>Учебный маршрут</h1><p>Курс следует по школьной последовательности, а сложность и повторение регулируются автоматически.</p></header>
          <div className="parent-grid">
            <article><h3>Текущий урок</h3><p>{isDiagnostic ? 'Идёт стартовая диагностика.' : `${yearPlan[currentYearLesson - 1]?.paragraph}: ${lesson.title}.`}</p><ul><li><span>Урок</span><b>{currentYearLesson} / {totalLessons}</b></li><li><span>Заданий сегодня</span><b>{state.currentSessionTaskIds.length}</b></li><li><span>Учебный год</span><b>{yearProgress}%</b></li></ul></article>
            <article><h3>Пробелы и повторение</h3>{weak.length ? <ul>{weak.map(([id, skill]) => <li key={id}><span>{skillLabels[id]}</span><b>{skill.mastery}%</b></li>)}</ul> : <p>Выраженных пробелов пока не обнаружено.</p>}</article>
            <article><h3>Игровая система</h3><p>Кот Пифагор продвигается по карте вместе с ребёнком, открывает районы математического мира и коллекцию идей.</p></article>
            <article><h3>Олимпиадная линия</h3><p>В каждом уроке есть обязательная нестандартная задача: перебор, обратный ход, оценка, чётность, графы или инварианты.</p></article>
            <article><h3>Техническое управление</h3><p>Прогресс пока хранится на этом устройстве.</p><button className="danger-button" onClick={resetCourse}>Сбросить весь прогресс</button></article>
          </div>
        </main>
      )}
    </div>
  );
}

function MapPreview({ completed, onOpen }: { completed:number; onOpen:() => void }) {
  const districts = [
    ['🏘','Натуральные числа','20'],['🏰','Сложение и вычитание','33'],['⚙️','Умножение и деление','37'],['🍰','Дроби','18'],['🔬','Десятичные дроби','48'],['🏛','Итоговая башня','19'],
  ];
  return <section className="map-preview"><header><div><b>Карта знаний</b><span>Путешествие по математическому миру</span></div><button onClick={onOpen}>Перейти на карту 🗺</button></header><div className="island-row">{districts.map(([icon,title,count],index) => { const from = [0,20,53,90,108,156][index]; const done = Math.max(0, Math.min(Number(count), completed - from)); return <article key={title} className={done > 0 ? 'lit' : ''}><i>{icon}</i><b>{title}</b><small>{done} / {count}</small></article>; })}</div></section>;
}

function KnowledgeMap({ current, completed, onBack }: { current:number; completed:number; onBack:() => void }) {
  return <main className="map-page">
    <header className="map-hero"><div><span>Живая карта знаний</span><h1>Путешествие кота Пифагора</h1><p>Каждый завершённый урок зажигает новую точку математического мира.</p></div><CatGuide mood="ready" /><button onClick={onBack}>Вернуться к уроку</button></header>
    <div className="map-road">
      {yearPlan.map((item, index) => {
        const status = item.number <= completed ? 'done' : item.number === current ? 'current' : 'locked';
        return <article className={`map-stop ${status}`} key={item.number} style={{ '--delay': `${Math.min(index,30) * 30}ms` } as React.CSSProperties}>
          <div className="map-node">{status === 'done' ? '✓' : status === 'current' ? '🐈' : item.number}</div>
          <div><span>{item.paragraph} · урок {item.number}</span><h3>{item.title}</h3><p>{item.unit}</p></div>
          <b>{status === 'done' ? 'Пройдено' : status === 'current' ? 'Сегодня' : 'Впереди'}</b>
        </article>;
      })}
    </div>
  </main>;
}

function CatGuide({ mood, compact = false }: { mood:'ready'|'thinking'|'happy'; compact?:boolean }) {
  return <div className={`cat-guide ${mood} ${compact ? 'compact' : ''}`} aria-label="Кот Пифагор"><div className="cat-ear left"/><div className="cat-ear right"/><div className="cat-face"><i/><i/><span>{mood === 'happy' ? 'ᴗ' : mood === 'thinking' ? '︿' : 'ω'}</span></div><div className="cat-tail"/></div>;
}

function kindLabel(task: CourseTask) {
  const labels: Record<CourseTask['kind'], string> = { diagnostic:'тест', explain:'идея', practice:'практика', challenge:'олимпиада', review:'повтор', checkpoint:'контроль' };
  return labels[task.kind];
}

function guideText(task: CourseTask, feedback: Feedback, attempts: number) {
  if (feedback === 'wrong') return 'Не спеши. Ошибка — это подсказка, какой шаг стоит повторить.';
  if (feedback === 'correct' && attempts === 1) return 'Мяу! С первой попытки — можно двигаться быстрее.';
  if (task.kind === 'challenge') return 'Здесь важна красивая идея, а не скорость.';
  if (task.kind === 'review') return 'Это короткое повторение появилось из-за предыдущих ошибок.';
  if (task.kind === 'checkpoint') return 'Контроль покажет, сохранился ли навык.';
  return 'Решай спокойно. Я веду тебя по следующему шагу курса.';
}

function Celebration({ firstTry }: { firstTry:boolean }) {
  return <div className="celebration"><i>🐾</i><i>★</i><i>π</i><i>△</i><b>{firstTry ? '+12 XP · отлично!' : '+7 XP'}</b></div>;
}

function Visual({ type }: { type: NonNullable<CourseTask['visual']> }) {
  if (type === 'pairs') return <div className="visual pairs"><span>37</span><i>+</i><span>63</span><b>100</b><span>28</span><i>+</i><span>72</span><b>100</b></div>;
  if (type === 'segments') return <div className="visual segments">{[1,2,3,4,5].map(n => <i key={n}/>)}</div>;
  if (type === 'fraction') return <div className="visual fraction">{[1,2,3,4,5,6,7,8].map(n => <i key={n} className={n <= 4 ? 'filled' : ''}/>)}</div>;
  if (type === 'parity') return <div className="visual parity"><span>2</span><span>4</span><span>6</span><span>8</span></div>;
  return <div className="visual numberline"><i>0</i><i>1</i><i>2</i><i>3</i><i>4</i><i>5</i></div>;
}
