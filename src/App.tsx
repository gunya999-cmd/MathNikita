import { FormEvent, useEffect, useMemo, useState } from 'react';
import { diagnosticQuestions, normalizeAnswer } from './data/questions';
import { getLessonForWeakTopic } from './data/lessons';
import { isSupabaseConfigured, supabase } from './lib/supabase';

type Page = 'home' | 'login' | 'dashboard' | 'diagnostic' | 'chat';
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

  useEffect(() => {
    setDiagnosticSummary(loadDiagnosticSummary());
  }, []);

  function completeDiagnostic(summary: DiagnosticSummary) {
    saveDiagnosticSummary(summary);
    setDiagnosticSummary(summary);
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={() => setPage('home')}>MathNikita</button>
        <nav>
          <button onClick={() => setPage('dashboard')}>Урок дня</button>
          <button onClick={() => setPage('diagnostic')}>Диагностика</button>
          <button onClick={() => setPage('chat')}>Чат</button>
          <button onClick={() => setPage('login')}>{user ? user.email : 'Вход'}</button>
        </nav>
      </header>

      <main>
        {page === 'home' && <Landing onStart={() => setPage(user ? 'dashboard' : 'login')} />}
        {page === 'login' && <Login onDone={(email) => { setUser({ email }); setPage('dashboard'); }} />}
        {page === 'dashboard' && <Dashboard summary={diagnosticSummary} onDiagnostic={() => setPage('diagnostic')} onChat={() => setPage('chat')} />}
        {page === 'diagnostic' && <Diagnostic onComplete={completeDiagnostic} />}
        {page === 'chat' && <Chat summary={diagnosticSummary} />}
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

function Dashboard({ summary, onDiagnostic, onChat }: { summary: DiagnosticSummary | null; onDiagnostic: () => void; onChat: () => void }) {
  const nextLesson = getNextLesson(summary);
  const lesson = getLessonForWeakTopic(summary?.weak[0]);
  const [practiceAnswer, setPracticeAnswer] = useState('');
  const [practiceChecked, setPracticeChecked] = useState(false);
  const practiceCorrect = normalizeAnswer(practiceAnswer) === normalizeAnswer(lesson.answer);

  return (
    <section className="grid-page">
      <div className="panel lesson-card">
        <div className="eyebrow">Урок дня</div>
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
        <div><strong>{summary ? summary.weak.length : 5}</strong><span>тем для повторения</span></div>
        <div><strong>{summary ? summary.level : 'demo'}</strong><span>текущий статус</span></div>
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

function Chat({ summary }: { summary: DiagnosticSummary | null }) {
  const [messages, setMessages] = useState([
    summary?.weak[0]
      ? `Привет! Судя по диагностике, начнём с темы “${summary.weak[0]}”. Напиши, что именно непонятно.`
      : 'Привет! Я помогу тебе с математикой. Напиши задачу, которую хочешь разобрать.',
  ]);
  const [input, setInput] = useState('');

  function send() {
    if (!input.trim()) return;
    const focus = summary?.weak[0] ? ` Давай разберём это через тему “${summary.weak[0]}”.` : '';
    setMessages((previous) => [
      ...previous,
      `Ты: ${input}`,
      `Репетитор: В MVP я пока отвечаю шаблоном.${focus} Следующий шаг — подключить AI API через безопасный backend.`,
    ]);
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
