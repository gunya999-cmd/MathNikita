import { useMemo, useState } from 'react';
import { skillLabels, syllabus, type CourseTask } from './data/course';
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

type Screen = 'learn' | 'progress' | 'parent';

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

  const isDiagnostic = !state.diagnosticDone;
  const sessionTitle = isDiagnostic ? 'Стартовая диагностика' : `Урок ${lesson.order} · ${lesson.title}`;
  const sessionSubtitle = isDiagnostic
    ? 'Несколько коротких задач определят темп, объём повторения и стартовый уровень.'
    : `${lesson.unit}. Цель: ${lesson.goal}`;

  return (
    <div className="app-shell">
      {celebrate && <Celebration firstTry={attemptsOnTask === 1} />}

      <header className="topbar">
        <button className="brand" onClick={() => setScreen('learn')}>
          <span>∑</span>
          <div>Математика<small>личный маршрут</small></div>
        </button>
        <nav>
          <button className={screen === 'learn' ? 'active' : ''} onClick={() => setScreen('learn')}>Занятие</button>
          <button className={screen === 'progress' ? 'active' : ''} onClick={() => setScreen('progress')}>Мой прогресс</button>
          <button className={screen === 'parent' ? 'active' : ''} onClick={() => setScreen('parent')}>Для родителя</button>
        </nav>
        <div className="xp-pill"><b>{state.xp}</b><span>XP</span></div>
      </header>

      {screen === 'learn' && (
        <main className="learn-page">
          <section className="today-card">
            <div>
              <span>{isDiagnostic ? 'Первый запуск' : 'Маршрут составлен автоматически'}</span>
              <h1>{sessionTitle}</h1>
              <p>{sessionSubtitle}</p>
            </div>
            <div className="route-strip" aria-label="Этапы занятия">
              {state.currentSessionTaskIds.map((id, index) => {
                const routeTask = id === task.id ? task : undefined;
                return (
                  <span key={`${id}-${index}`} className={index < state.currentTaskIndex ? 'done' : index === state.currentTaskIndex ? 'current' : ''}>
                    {index + 1}
                    <small>{routeTask ? kindLabel(routeTask) : 'этап'}</small>
                  </span>
                );
              })}
            </div>
          </section>

          {state.lastSessionSummary && state.currentTaskIndex === 0 && (
            <section className="session-summary">
              <div><span>Предыдущее занятие</span><b>{state.lastSessionSummary.correct} верных ответов</b></div>
              <div><span>Коррекция</span><b>{state.lastSessionSummary.reviewsAdded.length ? `Повторяем: ${state.lastSessionSummary.reviewsAdded.join(', ')}` : 'Дополнительное повторение не требуется'}</b></div>
              <div><span>Темп</span><b>{state.lastSessionSummary.accelerated ? 'Ускоренный маршрут' : 'Обычный маршрут'}</b></div>
            </section>
          )}

          <section className="task-card">
            <div className="task-meta">
              <span>{skillLabels[task.skill]}</span>
              <b>{state.currentTaskIndex + 1} / {state.currentSessionTaskIds.length}</b>
            </div>
            <div className="task-layout">
              <div className="task-main">
                <div className={`phase-tag kind-${task.kind}`}>{task.title}</div>
                <h2>{task.prompt}</h2>
                {task.visual && <Visual type={task.visual} />}

                <div className="answer-box">
                  <input
                    value={answer}
                    onChange={event => { setAnswer(event.target.value); if (feedback !== 'correct') setFeedback('idle'); }}
                    placeholder="Введи ответ"
                    onKeyDown={event => event.key === 'Enter' && checkAnswer()}
                    autoFocus
                  />
                  <button onClick={checkAnswer}>Проверить</button>
                </div>

                {showHint && feedback !== 'correct' && (
                  <div className="hint-box"><b>Подсказка</b><span>{task.hint}</span></div>
                )}

                {feedback === 'wrong' && (
                  <div className="feedback bad">
                    <b>Ошибка уже учтена</b>
                    <span>Программа снизила уверенность по навыку «{skillLabels[task.skill]}» и при необходимости добавит повторение. Попробуй ещё раз.</span>
                  </div>
                )}

                {feedback === 'correct' && (
                  <div className="feedback good">
                    <b>{attemptsOnTask === 1 ? 'Верно с первой попытки!' : 'Верно!'}</b>
                    <span>{task.explanation}</span>
                    <button onClick={continueLearning}>
                      {state.currentTaskIndex === state.currentSessionTaskIds.length - 1
                        ? isDiagnostic ? 'Построить мой курс' : 'Завершить занятие'
                        : 'Продолжить →'}
                    </button>
                  </div>
                )}
              </div>

              <aside>
                <div className="companion">
                  <div className={`bot-face ${feedback}`}>⌁</div>
                  <b>Математический проводник</b>
                  <p>{guideText(task, feedback, attemptsOnTask)}</p>
                </div>
                <div className="session-info">
                  <span>Занятие</span>
                  <b>{progressInSession}%</b>
                  <small>{isDiagnostic ? 'после теста откроется первый урок' : 'олимпиадный блок обязателен и встроен в маршрут'}</small>
                </div>
                <div className="lesson-plan-mini">
                  <span>Структура</span>
                  <b>Объяснение → практика → олимпиадная идея → контроль</b>
                </div>
              </aside>
            </div>
          </section>
        </main>
      )}

      {screen === 'progress' && (
        <main className="dashboard">
          <header><span>Личный кабинет ученика</span><h1>Прогресс по навыкам</h1><p>Здесь видно не только количество верных ответов, но и устойчивость навыков.</p></header>
          <div className="score-row">
            <article><span>Общее освоение</span><b>{mastery}%</b><small>Средний уровень по семи направлениям</small></article>
            <article><span>Завершено занятий</span><b>{state.completedSessions}</b><small>Диагностика не считается обычным уроком</small></article>
            <article><span>Текущий урок</span><b>{lesson.order}</b><small>{lesson.title}</small></article>
          </div>
          <div className="skills-grid">
            {Object.entries(state.skills).map(([id, skill]) => (
              <article key={id}>
                <div><b>{skillLabels[id as keyof typeof skillLabels]}</b><strong>{skill.mastery}%</strong></div>
                <div className="bar"><i style={{ width: `${skill.mastery}%` }} /></div>
                <small>{skill.needsReview ? 'Назначено повторение' : skill.streak >= 3 ? 'Навык устойчив' : 'Продолжаем наблюдение'}</small>
              </article>
            ))}
          </div>
        </main>
      )}

      {screen === 'parent' && (
        <main className="dashboard">
          <header><span>Родительский обзор</span><h1>Что делает система</h1><p>Маршрут следует учебному плану, но автоматически регулирует объём практики и повторения.</p></header>
          <div className="parent-grid">
            <article><h3>Текущий этап</h3><p>{isDiagnostic ? 'Идёт стартовая диагностика.' : `${lesson.unit}: ${lesson.title}.`}</p><ul><li><span>Номер урока</span><b>{lesson.order}</b></li><li><span>Заданий в маршруте</span><b>{state.currentSessionTaskIds.length}</b></li><li><span>Прогресс занятия</span><b>{progressInSession}%</b></li></ul></article>
            <article><h3>Пробелы и повторение</h3>{weak.length ? <ul>{weak.map(([id, skill]) => <li key={id}><span>{skillLabels[id]}</span><b>{skill.mastery}%</b></li>)}</ul> : <p>Выраженных пробелов пока не обнаружено.</p>}</article>
            <article><h3>Как регулируется сложность</h3><p>Верный ответ с первой попытки повышает уверенность сильнее. Ошибка, подсказка или повторная попытка уменьшают прирост. При устойчивом результате часть однотипной практики пропускается.</p></article>
            <article><h3>Олимпиадная линия</h3><p>В каждом уроке есть обязательная задача на идею: перебор, обратный ход, оценку, чётность, графы или инварианты. Она не вынесена в отдельный факультатив.</p></article>
            <article><h3>Техническое управление</h3><p>Данные пока хранятся только на этом устройстве. Это безопасно для тестирования первой версии.</p><button className="danger-button" onClick={resetCourse}>Сбросить весь прогресс</button></article>
          </div>
        </main>
      )}
    </div>
  );
}

function kindLabel(task: CourseTask) {
  const labels: Record<CourseTask['kind'], string> = {
    diagnostic: 'тест', explain: 'идея', practice: 'практика', challenge: 'олимпиада', review: 'повтор', checkpoint: 'контроль',
  };
  return labels[task.kind];
}

function guideText(task: CourseTask, feedback: Feedback, attempts: number) {
  if (feedback === 'wrong') return 'Не спеши. Ошибка показывает, какой шаг надо укрепить. Подсказка уже открыта.';
  if (feedback === 'correct' && attempts === 1) return 'Отлично. Решение с первой попытки повышает темп дальнейшего курса.';
  if (task.kind === 'challenge') return 'Здесь важна идея. Попробуй объяснить себе, почему способ работает.';
  if (task.kind === 'review') return 'Это короткое повторение появилось из-за предыдущих ошибок или низкой уверенности.';
  if (task.kind === 'checkpoint') return 'Контроль показывает, сохранился ли навык после нескольких разных заданий.';
  return 'Решай спокойно. Программа сама определит, когда ускориться, а когда добавить практику.';
}

function Celebration({ firstTry }: { firstTry: boolean }) {
  return <div className="celebration"><i>✦</i><i>★</i><i>π</i><i>△</i><b>{firstTry ? '+12 XP · с первой попытки' : '+7 XP'}</b></div>;
}

function Visual({ type }: { type: NonNullable<CourseTask['visual']> }) {
  if (type === 'pairs') return <div className="visual pairs"><span>37</span><i>+</i><span>63</span><b>100</b><span>28</span><i>+</i><span>72</span><b>100</b></div>;
  if (type === 'segments') return <div className="visual segments">{[1,2,3,4,5].map(n => <i key={n} />)}</div>;
  if (type === 'fraction') return <div className="visual fraction">{[1,2,3,4,5,6,7,8].map(n => <i key={n} className={n <= 4 ? 'filled' : ''} />)}</div>;
  if (type === 'parity') return <div className="visual parity"><span>2</span><span>4</span><span>6</span><span>8</span></div>;
  return <div className="visual numberline"><i>0</i><i>1</i><i>2</i><i>3</i><i>4</i><i>5</i></div>;
}
