import { FormEvent, useMemo, useState } from 'react';
import { diagnosticQuestions, normalizeAnswer } from './data/questions';
import { isSupabaseConfigured, supabase } from './lib/supabase';

type Page = 'home' | 'login' | 'dashboard' | 'diagnostic' | 'chat';
type UserState = { email: string } | null;

type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  variant?: 'primary' | 'secondary';
};

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
        {page === 'dashboard' && <Dashboard onDiagnostic={() => setPage('diagnostic')} onChat={() => setPage('chat')} />}
        {page === 'diagnostic' && <Diagnostic />}
        {page === 'chat' && <Chat />}
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

function Dashboard({ onDiagnostic, onChat }: { onDiagnostic: () => void; onChat: () => void }) {
  return (
    <section className="grid-page">
      <div className="panel lesson-card">
        <div className="eyebrow">Урок дня</div>
        <h2>Дроби и проценты</h2>
        <p>Сегодня разберём, как переводить проценты в дроби и решать короткие задачи без калькулятора.</p>
        <div className="hero-actions">
          <Button onClick={onDiagnostic}>Пройти диагностику</Button>
          <Button variant="secondary" onClick={onChat}>Открыть чат</Button>
        </div>
      </div>
      <div className="panel stats">
        <h3>Прогресс</h3>
        <div><strong>62%</strong><span>примерная уверенность</span></div>
        <div><strong>5</strong><span>навыков в диагностике</span></div>
        <div><strong>demo</strong><span>режим MVP</span></div>
      </div>
    </section>
  );
}

function Diagnostic() {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const result = useMemo(() => {
    const checked = diagnosticQuestions.map((question) => ({
      ...question,
      correct: normalizeAnswer(answers[question.id] ?? '') === normalizeAnswer(question.answer),
    }));
    const correctCount = checked.filter((question) => question.correct).length;
    return {
      score: Math.round((correctCount / checked.length) * 100),
      strong: checked.filter((question) => question.correct).map((question) => question.skillTitle),
      weak: checked.filter((question) => !question.correct).map((question) => question.skillTitle),
    };
  }, [answers]);

  return (
    <section className="panel wide">
      <h2>Диагностика уровня</h2>
      <p className="muted">Ответь на несколько вопросов. MVP считает результат локально и не ломается без backend.</p>
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
      <Button onClick={() => setSubmitted(true)}>Показать результат</Button>
      {submitted && (
        <div className="result-box">
          <h3>Результат: {result.score}%</h3>
          <p><strong>Сильные темы:</strong> {result.strong.join(', ') || 'пока нет'}</p>
          <p><strong>Темы для повторения:</strong> {result.weak.join(', ') || 'нет'}</p>
        </div>
      )}
    </section>
  );
}

function Chat() {
  const [messages, setMessages] = useState([
    'Привет! Я помогу тебе с математикой. Напиши задачу, которую хочешь разобрать.',
  ]);
  const [input, setInput] = useState('');

  function send() {
    if (!input.trim()) return;
    setMessages((previous) => [
      ...previous,
      `Ты: ${input}`,
      'Репетитор: В MVP я пока отвечаю шаблоном. Следующий шаг — подключить AI API через безопасный backend.',
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
