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

  const sessionTitle = isDiagnostic ? 'Стартовая диагностика' : `Урок ${lesson.order} · ${lesson.title}`;
  const sessionSubtitle = isDiagnostic
    ? 'Несколько коротких задач определят темп, объём повторения и стартовый уровень.'
    : `${lesson.unit} · ${yearPlan[currentYearLesson - 1]?.paragraph ?? ''}. Цель: ${lesson.goal}`;

  return (
    <div className="app-shell">
      {celebrate && <Celebration firstTry={attemptsOnTask === 1} />}
      <header className="topbar">
        <button className="brand" onClick={() => setScreen('learn')}><span>∑</span><div>Математика<small>кот учёный ведёт по курсу</small></div></button>
        <nav>
          <button className={screen === 'learn' ? 'active' : ''} onClick={() => setScreen('learn')}>Сегодня</button>
          <button className={screen === 'map' ? 'active' : ''} onClick={() => setScreen('map')}>Карта знаний</button>
          <button className={screen === 'progress' ? 'active' : ''} onClick={() => setScreen('progress')}>Прогресс</button>
          <button className={screen === 'parent' ? 'active' : ''} onClick={() => setScreen('parent')}>Для родителя</button>
        </nav>
        <div className="xp-pill"><b>{state.xp}</b><span>XP</span></div>
      </header>

      {screen === 'learn' && (
        <main className="learn-page">
          <section className="year-status">
            <div><span>Учебный год</span><b>{completedLessons} из {totalLessons} уроков</b><small>Осталось: {remainingLessons}</small></div>
            <div className="year-bar"><i style={{ width: `${yearProgress}%` }} /></div>
            <button onClick={() => setScreen('map')}>Открыть карту →</button>
          </section>

          <section className="today-card">
            <div>
              <span>{isDiagnostic ? 'Первый запуск' : `Сегодня · урок ${currentYearLesson} из ${totalLessons}`}</span>
              <h1>{sessionTitle}</h1>
              <p>{sessionSubtitle}</p>
            </div>
            <CatGuide mood={feedback === 'wrong' ? 'thinking' : feedback === 'correct' ? 'happy' : 'ready'} />
            <div className="route-strip" aria-label="Этапы занятия">
              {state.currentSessionTaskIds.map((id, index) => (
                <span key={`${id}-${index}`} className={index < state.currentTaskIndex ? 'done' : index === state.currentTaskIndex ? 'current' : ''}>
                  {index + 1}<small>{index === state.currentTaskIndex ? kindLabel(task) : 'этап'}</small>
                </span>
              ))}
            </div>
          </section>

          {state.lastSessionSummary && state.currentTaskIndex === 0 && (
            <section className="session-summary">
              <div><span>Предыдущее занятие</span><b>{state.lastSessionSummary.correct} верных ответов</b></div>
              <div><span>Коррекция</span><b>{state.lastSessionSummary.reviewsAdded.length ? `Повторяем: ${state.lastSessionSummary.reviewsAdded.join(', ')}` : 'Повторение не требуется'}</b></div>
              <div><span>Темп</span><b>{state.lastSessionSummary.accelerated ? 'Ускоренный маршрут' : 'Обычный маршрут'}</b></div>
            </section>
          )}

          <section className="task-card">
            <div className="task-meta"><span>{skillLabels[task.skill]}</span><b>{state.currentTaskIndex + 1} / {state.currentSessionTaskIds.length}</b></div>
            <div className="task-layout">
              <div className="task-main">
                <div className={`phase-tag kind-${task.kind}`}>{task.title}</div>
                <h2>{task.prompt}</h2>
                {task.visual && <Visual type={task.visual} />}
                <div className="answer-box">
                  <input value={answer} onChange={event => { setAnswer(event.target.value); if (feedback !== 'correct') setFeedback('idle'); }} placeholder="Введи ответ" onKeyDown={event => event.key === 'Enter' && checkAnswer()} autoFocus />
                  <button onClick={checkAnswer}>Проверить</button>
                </div>
                {showHint && feedback !== 'correct' && <div className="hint-box"><b>Подсказка</b><span>{task.hint}</span></div>}
                {feedback === 'wrong' && <div className="feedback bad"><b>Кот заметил слабое место</b><span>Программа учла ошибку и при необходимости добавит повторение по навыку «{skillLabels[task.skill]}».</span></div>}
                {feedback === 'correct' && <div className="feedback good"><b>{attemptsOnTask === 1 ? 'Верно с первой попытки!' : 'Верно!'}</b><span>{task.explanation}</span><button onClick={continueLearning}>{state.currentTaskIndex === state.currentSessionTaskIds.length - 1 ? isDiagnostic ? 'Построить мой курс' : 'Завершить урок' : 'Продолжить →'}</button></div>}
              </div>
              <aside>
                <div className="companion"><CatGuide mood={feedback === 'wrong' ? 'thinking' : feedback === 'correct' ? 'happy' : 'ready'} compact /><b>Кот Пифагор</b><p>{guideText(task, feedback, attemptsOnTask)}</p></div>
                <div className="session-info"><span>Урок</span><b>{progressInSession}%</b><small>Олимпиадная задача встроена в обязательный маршрут.</small></div>
                <div className="lesson-plan-mini"><span>Структура</span><b>Объяснение → практика → олимпиадная идея → контроль</b></div>
              </aside>
            </div>
          </section>
        </main>
      )}

      {screen === 'map' && <KnowledgeMap current={currentYearLesson} completed={completedLessons} onBack={() => setScreen('learn')} />}

      {screen === 'progress' && (
        <main className="dashboard">
          <header><span>Личный кабинет ученика</span><h1>Прогресс учебного года</h1><p>Видно, сколько уроков пройдено, сколько осталось и какие навыки устойчивы.</p></header>
          <div className="score-row">
            <article><span>Учебный год</span><b>{yearProgress}%</b><small>{completedLessons} из {totalLessons} уроков</small></article>
            <article><span>Осталось уроков</span><b>{remainingLessons}</b><small>Карта обновляется после каждого завершённого урока</small></article>
            <article><span>Текущий урок</span><b>{currentYearLesson}</b><small>{yearPlan[currentYearLesson - 1]?.title}</small></article>
          </div>
          <div className="skills-grid">{Object.entries(state.skills).map(([id, skill]) => <article key={id}><div><b>{skillLabels[id as keyof typeof skillLabels]}</b><strong>{skill.mastery}%</strong></div><div className="bar"><i style={{ width: `${skill.mastery}%` }} /></div><small>{skill.needsReview ? 'Назначено повторение' : skill.streak >= 3 ? 'Навык устойчив' : 'Продолжаем наблюдение'}</small></article>)}</div>
        </main>
      )}

      {screen === 'parent' && (
        <main className="dashboard">
          <header><span>Родительский обзор</span><h1>Учебный маршрут</h1><p>Курс следует по урокам и параграфам, а объём повторения регулируется автоматически.</p></header>
          <div className="parent-grid">
            <article><h3>Текущий урок</h3><p>{isDiagnostic ? 'Идёт стартовая диагностика.' : `${yearPlan[currentYearLesson - 1]?.paragraph}: ${lesson.title}.`}</p><ul><li><span>Урок</span><b>{currentYearLesson} / {totalLessons}</b></li><li><span>Заданий сегодня</span><b>{state.currentSessionTaskIds.length}</b></li><li><span>Учебный год</span><b>{yearProgress}%</b></li></ul></article>
            <article><h3>Пробелы и повторение</h3>{weak.length ? <ul>{weak.map(([id, skill]) => <li key={id}><span>{skillLabels[id]}</span><b>{skill.mastery}%</b></li>)}</ul> : <p>Выраженных пробелов пока не обнаружено.</p>}</article>
            <article><h3>Игровая система</h3><p>Кот Пифагор продвигается по карте вместе с ребёнком, открывает новые районы математического города и собирает значки математических идей.</p></article>
            <article><h3>Олимпиадная линия</h3><p>В каждом уроке есть обязательная задача на перебор, обратный ход, оценку, чётность, графы или инварианты.</p></article>
            <article><h3>Техническое управление</h3><p>Данные пока хранятся на этом устройстве.</p><button className="danger-button" onClick={resetCourse}>Сбросить весь прогресс</button></article>
          </div>
        </main>
      )}
    </div>
  );
}

function KnowledgeMap({ current, completed, onBack }: { current:number; completed:number; onBack:() => void }) {
  return <main className="map-page">
    <header className="map-hero"><div><span>Анимированная карта знаний</span><h1>Путешествие кота Пифагора</h1><p>Каждый урок — новая остановка. Пройденные темы превращаются в освещённые районы математического города.</p></div><CatGuide mood="ready" /><button onClick={onBack}>Вернуться к уроку</button></header>
    <div className="map-road">
      {yearPlan.map((item, index) => {
        const status = item.number <= completed ? 'done' : item.number === current ? 'current' : 'locked';
        return <article className={`map-stop ${status}`} key={item.number} style={{ '--delay': `${index * 35}ms` } as React.CSSProperties}>
          <div className="map-node">{status === 'done' ? '✓' : status === 'current' ? '🐈' : item.number}</div>
          <div><span>{item.paragraph} · урок {item.number}</span><h3>{item.title}</h3><p>{item.unit}</p></div>
          <b>{status === 'done' ? 'Пройдено' : status === 'current' ? 'Сегодня' : 'Впереди'}</b>
        </article>;
      })}
    </div>
  </main>;
}

function CatGuide({ mood, compact = false }: { mood:'ready'|'thinking'|'happy'; compact?:boolean }) {
  return <div className={`cat-guide ${mood} ${compact ? 'compact' : ''}`} aria-label="Кот Пифагор"><div className="cat-ear left"/><div className="cat-ear right"/><div className="cat-face"><i/><i/><span>ω</span></div><div className="cat-tail"/></div>;
}

function kindLabel(task: CourseTask) {
  const labels: Record<CourseTask['kind'], string> = { diagnostic:'тест', explain:'идея', practice:'практика', challenge:'олимпиада', review:'повтор', checkpoint:'контроль' };
  return labels[task.kind];
}

function guideText(task: CourseTask, feedback: Feedback, attempts: number) {
  if (feedback === 'wrong') return 'Не спеши. Я уже отметил, какой шаг стоит повторить.';
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
