import { FormEvent, useEffect, useMemo, useState } from 'react';
import { diagnosticQuestions, normalizeAnswer } from './data/questions';
import { getLessonForWeakTopic } from './data/lessons';
import { defaultProfile, loadStudentProfile, markPracticeDone, saveStudentProfile, type StudentProfile } from './data/profile';
import { checkStepAnswer, stepPractices } from './data/stepPractice';
import { formatTutorResponse, getTutorResponse } from './data/tutor';
import { isSupabaseConfigured, supabase } from './lib/supabase';

type Page = 'home' | 'login' | 'dashboard' | 'diagnostic' | 'chat' | 'practice' | 'profile';
type UserState = { email: string } | null;
type DiagnosticSummary = {
  score: number;
  level: string;
  strong: string[];
  weak: string[];
  completedAt: string;
};

type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  variant?: 'primary' | 'secondary';
};

const storageKey = 'mathnikita.diagnosticSummary';

function loadDiagnosticSummary(): DiagnosticSummary | null {
  try {
    const raw = localStorage.getItem(storageKey);
    return raw ? (JSON.parse(raw) as DiagnosticSummary) : null;
  } catch {
    return null;
  }
}

function saveDiagnosticSummary(summary: DiagnosticSummary) {
  localStorage.setItem(storageKey, JSON.stringify(summary));
}

function getLevel(score: number) {
  if (score >= 85) return 'сильный уровень';
  if (score >= 60) return 'средний уровень';
  return 'нужно укрепить базу';
}

function getNextLesson(summary: DiagnosticSummary | null) {
  const firstWeak = summary?.weak[0];
  if (firstWeak) return `Повторить тему: ${firstWeak}`;
  if (summary?.score === 100) return 'Следующий уровень';
  return 'Дроби и проценты';
}

function Button({ children, onClick, type = 'button', variant = 'primary' }: ButtonProps) {
  return (
    <button className={variant === 'primary' ? 'btn btn-primary' : 'btn btn-secondary'} onClick={onClick} type={type}>
      {children}
    </button>
  );
}

export function App() {
  const [page, setPage] = useState<Page>('home');
  const [user, setUser] = useState<UserState>(null);
  const [diagnosticSummary, setDiagnosticSummary] = useState<DiagnosticSummary | null>(null);
  const [profile, setProfile] = useState<StudentProfile>(defaultProfile);

  useEffect(() => {
    setDiagnosticSummary(loadDiagnosticSummary());
    setProfile(loadStudentProfile());
  }, []);

  function completeDiagnostic(summary: DiagnosticSummary) {
    saveDiagnosticSummary(summary);
    setDiagnosticSummary(summary);
  }

  function updateProfile(nextProfile: StudentProfile) {
    saveStudentProfile(nextProfile);
    setProfile(nextProfile);
  }

  function addSolvedTask(tasksSolved = 1) {
    setProfile((current) => markPracticeDone(current, tasksSolved));
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={() => setPage('home')}>MathNikita</button>
        <nav>
          <button onClick={() => setPage('dashboard')}>Урок дня</button>
          <button onClick={() => setPage('diagnostic')}>Диагностика</button>
          <button onClick={() => setPage('practice')}>Практика</button>
          <button onClick={() => setPage('chat')}>Чат</button>
          <button onClick={() => setPage('profile')}>Профиль</button>
          <button onClick={() => setPage('login')}>{user ? user.email : 'Вход'}</button>
        </nav>
      </header>

      <main>
        {page === 'home' && <Landing onStart={() => setPage(user ? 'dashboard' : 'login')} />}
        {page === 'login' && <Login onDone={(email) => { setUser({ email }); setPage('dashboard'); }} />}
        {page === 'dashboard' && <Dashboard profile={profile} summary={diagnosticSummary} onDiagnostic={() => setPage('diagnostic')} onChat={() => setPage('chat')} onPractice={() => setPage('practice')} />}
        {page === 'diagnostic' && <Diagnostic onComplete={completeDiagnostic} />}
        {page === 'practice' && <StepPractice onSolvedTask={addSolvedTask} />}
        {page === 'chat' && <Chat summary={diagnosticSummary} />}
        {page === 'profile' && <Profile profile={profile} onSave={updateProfile} />}
      </main>
    </div>
  );
}

function Landing({ onStart }: { onStart: () => void }) {
  return (
    <section className="hero">
      <div className="eyebrow">AI репетитор по математике</div>
      <h1>Спокойный умный урок математики каждый день.</h1>
      <p>Диагностика уровня, персональный урок дня и понятные объяснения без перегруза интерфейса.</p>
      <div className="hero-actions">
        <Button onClick={onStart}>Начать обучение</Button>
        <Button variant="secondary" onClick={onStart}>Пройти диагностику</Button>
      </div>
    </section>
  );
}

function Login({ onDone }: { onDone: (email: string) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [message, setMessage] = useState('');

  async function submit(event: FormEvent) {
    event.preventDefault();
    setMessage('');

    if (!isSupabaseConfigured || !supabase) {
      onDone(email || 'demo@student.local');
      return;
    }

    const result = mode === 'login'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });

    if (result.error) {
      setMessage(result.error.message);
      return;
    }

    onDone(result.data.user?.email ?? email);
  }

  return (
    <section className="panel narrow">
      <h2>{mode === 'login' ? 'Вход' : 'Регистрация'}</h2>
      <p className="muted">Если Supabase env не настроены, приложение откроется в demo-режиме.</p>
      <form className="form" onSubmit={submit}>
        <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" type="email" />
        <input value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Пароль" type="password" />
        {message && <div className="error">{message}</div>}
        <Button type="submit">{mode === 'login' ? 'Войти' : 'Создать аккаунт'}</Button>
      </form>
      <button className="link" onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>
        {mode === 'login' ? 'Создать аккаунт' : 'У меня уже есть аккаунт'}
      </button>
    </section>
  );
}

function Dashboard({ profile, summary, onDiagnostic, onChat, onPractice }: { profile: StudentProfile; summary: DiagnosticSummary | null; onDiagnostic: () => void; onChat: () => void; onPractice: () => void }) {
  const nextLesson = getNextLesson(summary);
  const lesson = getLessonForWeakTopic(summary?.weak[0]);
  const [practiceAnswer, setPracticeAnswer] = useState('');
  const [practiceChecked, setPracticeChecked] = useState(false);
  const practiceCorrect = normalizeAnswer(practiceAnswer) === normalizeAnswer(lesson.answer);

  return (
    <section className="grid-page">
      <div className="panel lesson-card">
        <div className="eyebrow">Урок дня для {profile.name}</div>
        <h2>{nextLesson}</h2>
        <p>{summary ? `Последняя диагностика: ${summary.score}% — ${summary.level}.` : 'Сначала пройди короткую диагностику, и я подберу урок под твой уровень.'}</p>

        <div className="lesson-block">
          <h3>{lesson.title}</h3>
          <p className="muted">{lesson.subtitle}</p>
          <p>{lesson.explanation}</p>
          <div className="example-box"><strong>Пример:</strong> {lesson.example}</div>
          <label className="question compact">
            <span>{lesson.practice}</span>
            <input value={practiceAnswer} onChange={(event) => { setPracticeAnswer(event.target.value); setPracticeChecked(false); }} placeholder="Ответ" />
          </label>
          <div className="hero-actions">
            <Button onClick={() => setPracticeChecked(true)}>Проверить мини-задание</Button>
            <Button variant="secondary" onClick={onChat}>Спросить в чате</Button>
            <Button variant="secondary" onClick={onPractice}>Пошаговая практика</Button>
          </div>
          {practiceChecked && (
            <div className={practiceCorrect ? 'success-box' : 'error'}>
              {practiceCorrect ? 'Верно. Можно двигаться дальше.' : `Почти. Правильный ответ: ${lesson.answer}`}
            </div>
          )}
        </div>

        <div className="hero-actions">
          <Button variant="secondary" onClick={onDiagnostic}>{summary ? 'Обновить диагностику' : 'Пройти диагностику'}</Button>
        </div>
      </div>
      <div className="panel stats">
        <h3>Прогресс</h3>
        <div><strong>{summary ? `${summary.score}%` : '—'}</strong><span>результат диагностики</span></div>
        <div><strong>{profile.solvedTasks}</strong><span>решённых шагов и задач</span></div>
        <div><strong>{profile.streakDays}</strong><span>дней подряд</span></div>
        <div><strong>{profile.grade}</strong><span>{profile.goal}</span></div>
      </div>
    </section>
  );
}

function Diagnostic({ onComplete }: { onComplete: (summary: DiagnosticSummary) => void }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const result = useMemo(() => {
    const checked = diagnosticQuestions.map((question) => ({
      ...question,
      correct: normalizeAnswer(answers[question.id] ?? '') === normalizeAnswer(question.answer),
    }));
    const correctCount = checked.filter((question) => question.correct).length;
    const score = Math.round((correctCount / checked.length) * 100);
    return {
      score,
      level: getLevel(score),
      strong: checked.filter((question) => question.correct).map((question) => question.skillTitle),
      weak: checked.filter((question) => !question.correct).map((question) => question.skillTitle),
      checked,
    };
  }, [answers]);

  function submit() {
    const summary: DiagnosticSummary = {
      score: result.score,
      level: result.level,
      strong: result.strong,
      weak: result.weak,
      completedAt: new Date().toISOString(),
    };
    onComplete(summary);
    setSubmitted(true);
  }

  return (
    <section className="panel wide">
      <h2>Диагностика уровня</h2>
      <p className="muted">Ответь на несколько вопросов. Результат сохранится в браузере и обновит “урок дня”.</p>
      <div className="question-list">
        {diagnosticQuestions.map((question) => (
          <label className="question" key={question.id}>
            <span>{question.prompt}</span>
            <input
              value={answers[question.id] ?? ''}
              onChange={(event) => setAnswers((previous) => ({ ...previous, [question.id]: event.target.value }))}
              placeholder="Ответ"
            />
          </label>
        ))}
      </div>
      <Button onClick={submit}>Показать результат</Button>
      {submitted && (
        <div className="result-box">
          <h3>Результат: {result.score}% — {result.level}</h3>
          <p><strong>Сильные темы:</strong> {result.strong.join(', ') || 'пока нет'}</p>
          <p><strong>Темы для повторения:</strong> {result.weak.join(', ') || 'нет'}</p>
        </div>
      )}
    </section>
  );
}

function StepPractice({ onSolvedTask }: { onSolvedTask: (tasksSolved?: number) => void }) {
  const [practiceId, setPracticeId] = useState(stepPractices[0].id);
  const [stepIndex, setStepIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const practice = stepPractices.find((item) => item.id === practiceId) ?? stepPractices[0];
  const step = practice.steps[stepIndex];
  const progress = Math.round(((stepIndex + 1) / practice.steps.length) * 100);

  function choosePractice(id: string) {
    setPracticeId(id);
    setStepIndex(0);
    setAnswer('');
    setFeedback('');
  }

  function check() {
    if (checkStepAnswer(answer, step.expected)) {
      setFeedback(step.success);
      onSolvedTask(1);
      if (stepIndex < practice.steps.length - 1) {
        window.setTimeout(() => {
          setStepIndex((current) => current + 1);
          setAnswer('');
          setFeedback('');
        }, 650);
      }
      return;
    }
    setFeedback(step.hint);
  }

  return (
    <section className="panel wide">
      <div className="eyebrow">Пошаговая практика</div>
      <h2>{practice.title}</h2>
      <p className="muted">Выбери задачу и решай её маленькими шагами. Система подскажет, где ошибка.</p>
      <div className="tab-row">
        {stepPractices.map((item) => (
          <button className={item.id === practice.id ? 'tab active' : 'tab'} key={item.id} onClick={() => choosePractice(item.id)}>
            {item.title}
          </button>
        ))}
      </div>
      <div className="lesson-block">
        <p><strong>Задача:</strong> {practice.problem}</p>
        <div className="progress-track"><div style={{ width: `${progress}%` }} /></div>
        <label className="question compact">
          <span>{step.prompt}</span>
          <input value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder="Введи шаг решения" />
        </label>
        <div className="hero-actions">
          <Button onClick={check}>{stepIndex === practice.steps.length - 1 ? 'Проверить финальный ответ' : 'Проверить шаг'}</Button>
        </div>
        {feedback && <div className={checkStepAnswer(answer, step.expected) ? 'success-box' : 'hint-box'}>{feedback}</div>}
      </div>
    </section>
  );
}

function Profile({ profile, onSave }: { profile: StudentProfile; onSave: (profile: StudentProfile) => void }) {
  const [draft, setDraft] = useState(profile);
  const [saved, setSaved] = useState(false);

  function submit(event: FormEvent) {
    event.preventDefault();
    onSave(draft);
    setSaved(true);
  }

  return (
    <section className="panel narrow">
      <div className="eyebrow">Профиль ученика</div>
      <h2>{draft.name}</h2>
      <form className="form" onSubmit={submit}>
        <input value={draft.name} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} placeholder="Имя" />
        <input value={draft.grade} onChange={(event) => setDraft((current) => ({ ...current, grade: event.target.value }))} placeholder="Класс" />
        <input value={draft.goal} onChange={(event) => setDraft((current) => ({ ...current, goal: event.target.value }))} placeholder="Цель обучения" />
        <Button type="submit">Сохранить профиль</Button>
      </form>
      {saved && <div className="success-box">Профиль сохранён.</div>}
      <div className="stats profile-stats">
        <div><strong>{profile.solvedTasks}</strong><span>решённых задач</span></div>
        <div><strong>{profile.streakDays}</strong><span>дней подряд</span></div>
      </div>
    </section>
  );
}

function Chat({ summary }: { summary: DiagnosticSummary | null }) {
  const [messages, setMessages] = useState([
    summary?.weak[0]
      ? `Привет! Судя по диагностике, начнём с темы “${summary.weak[0]}”. Напиши, что именно непонятно.`
      : 'Привет! Я помогу тебе с математикой. Напиши задачу, которую хочешь разобрать.',
  ]);
  const [input, setInput] = useState('');

  function send() {
    if (!input.trim()) return;
    const response = formatTutorResponse(getTutorResponse(input, summary?.weak[0]));
    setMessages((previous) => [...previous, `Ты: ${input}`, `Репетитор: ${response}`]);
    setInput('');
  }

  return (
    <section className="panel wide">
      <h2>Чат с репетитором</h2>
      <div className="chat-box">{messages.map((message, index) => <div className="bubble" key={index}>{message}</div>)}</div>
      <div className="chat-input">
        <input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Например: объясни дроби" />
        <Button onClick={send}>Отправить</Button>
      </div>
    </section>
  );
}
