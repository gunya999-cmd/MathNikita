import { useEffect, useMemo, useState } from 'react';
import { skillLabels, type CourseTask } from './data/course';
import { totalLessons, yearPlan } from './data/yearPlan';
import { LessonCourseShell } from './LessonCourseShell';
import { LearnerDashboard } from './LearnerDashboard';
import { StudentAccountGate } from './StudentAccountGate';
import { CloudSyncBadge } from './CloudSyncBadge';
import { CLOUD_RECONCILED_EVENT, startStudentCloudSync, syncStudentCloudNow } from './cloudStudentSync';
import { backupStudentProfileOnPageHide, getAuthenticatedStudentProfile, switchStudentProfile } from './studentProfiles';
import './focusLearning.css';
import {
  advanceAfterCorrect,
  currentLesson,
  getCurrentTask,
  loadLearnerState,
  recordAttempt,
  saveLearnerState,
  type LearnerState,
} from './learningEngine';

type Screen = 'learn' | 'course' | 'map' | 'progress' | 'parent';
type Feedback = 'idle' | 'correct' | 'wrong';

const PROFILE_E2E_BYPASS = import.meta.env.VITE_E2E_BYPASS_PROFILE === '1';

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
  const profile = PROFILE_E2E_BYPASS ? null : getAuthenticatedStudentProfile();
  const [screen, setScreen] = useState<Screen>('course');
  const [state, setState] = useState<LearnerState>(loadLearnerState);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<Feedback>('idle');
  const [attemptsOnTask, setAttemptsOnTask] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [routeBuilt, setRouteBuilt] = useState(false);
  const [switchingStudent, setSwitchingStudent] = useState(false);

  useEffect(() => {
    if (PROFILE_E2E_BYPASS || !profile) return;
    const stopCloud=startStudentCloudSync(profile.id);
    const backup = () => { backupStudentProfileOnPageHide(); if(profile.cloud) void syncStudentCloudNow(profile.id); };
    const onVisibility = () => { if (document.visibilityState === 'hidden') backup(); };
    const onStorage = () => {
      if (!getAuthenticatedStudentProfile()) window.location.reload();
    };
    const onCloudReconciled=()=>window.location.reload();
    window.addEventListener('pagehide', backup);
    window.addEventListener('storage', onStorage);
    window.addEventListener(CLOUD_RECONCILED_EVENT,onCloudReconciled);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      stopCloud();
      window.removeEventListener('pagehide', backup);
      window.removeEventListener('storage', onStorage);
      window.removeEventListener(CLOUD_RECONCILED_EVENT,onCloudReconciled);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [profile?.id]);

  const task = getCurrentTask(state);
  const lesson = currentLesson(state);
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

  async function changeStudent() {
    if (switchingStudent) return;
    setSwitchingStudent(true);
    backupStudentProfileOnPageHide();
    try {
      if (profile?.cloud) await syncStudentCloudNow(profile.id);
    } finally {
      switchStudentProfile();
      window.location.reload();
    }
  }

  if (!PROFILE_E2E_BYPASS && !profile) return <StudentAccountGate />;

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={() => setScreen('course')}><span>Σ</span><div>MathNikita<small>полный курс математики · 5 класс</small></div></button>
        <nav>
          <button className={screen === 'course' ? 'active' : ''} onClick={() => setScreen('course')}>Уроки</button>
          <button className={screen === 'learn' ? 'active' : ''} onClick={() => setScreen('learn')}>Диагностика</button>
          <button className={screen === 'map' ? 'active' : ''} onClick={() => setScreen('map')}>Карта знаний</button>
          <button className={screen === 'progress' ? 'active' : ''} onClick={() => setScreen('progress')}>Кабинет</button>
          <button className={screen === 'parent' ? 'active' : ''} onClick={() => setScreen('parent')}>Родителям</button>
        </nav>
        <div className="topbar-profile-actions">
          <div className="xp-pill">⭐ <b>{state.xp}</b> XP</div>
          {profile&&<CloudSyncBadge profile={profile}/>}          
          {profile && <button className="student-profile-pill" onClick={() => { void changeStudent(); }} disabled={switchingStudent} aria-label={`Сменить ученика. Сейчас ${profile.name}`}><span>{profile.avatar}</span><div><b>{profile.name}</b><small>{switchingStudent?'Сохраняю…':profile.cloud?.studentCode??'Сменить ученика'}</small></div></button>}
        </div>
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

      {screen === 'map' && <main className="dashboard"><header><span>Карта знаний</span><h1>Курс математики 5 класса</h1><p>175 уроков по I варианту планирования Мерзляка.</p></header><div className="world-grid">{islands.map(([icon,title,count],i)=><article key={title}><i>{icon}</i><h3>{title}</h3><p>{count} уроков</p><b>{i===0?'20 уроков готовы':i===1?'18 уроков готовы':'В разработке'}</b></article>)}</div></main>}

      {screen === 'progress' && <LearnerDashboard mode="student" state={state} onContinue={() => setScreen('course')}/>}      
      {screen === 'parent' && <LearnerDashboard mode="parent" state={state}/>}      

      {routeBuilt && <div className="route-modal"><div><span>🎉</span><h2>Маршрут построен!</h2><p>Начинаем с урока №1.</p><button onClick={() => { setRouteBuilt(false); setScreen('course'); }}>Открыть первый урок</button></div></div>}
    </div>
  );
}
