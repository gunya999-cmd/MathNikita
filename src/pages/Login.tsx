import { FormEvent, useState } from 'react';
import { Button } from '../components/Button';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

type AuthMode = 'login' | 'signup';

export function Login({ onDone }: { onDone: (email: string) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<AuthMode>('login');
  const [message, setMessage] = useState('');
  const [canResend, setCanResend] = useState(false);

  function switchMode(nextMode: AuthMode) {
    setMode(nextMode);
    setMessage('');
    setCanResend(false);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setMessage('');
    setCanResend(false);

    if (!isSupabaseConfigured || !supabase) {
      onDone(email || 'demo@student.local');
      return;
    }

    const result = mode === 'login'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
          },
        });

    if (result.error) {
      const text = result.error.message;
      setMessage(text);
      setCanResend(text.toLowerCase().includes('confirm') || text.toLowerCase().includes('email'));
      return;
    }

    if (mode === 'signup' && !result.data.session) {
      setMessage('Аккаунт создан. Проверь email и подтверди регистрацию по ссылке. После подтверждения нажми “Вход”.');
      setCanResend(true);
      setMode('login');
      return;
    }

    onDone(result.data.user?.email ?? email);
  }

  async function resendConfirmation() {
    if (!isSupabaseConfigured || !supabase) {
      setMessage('Supabase env не настроены. Повторная отправка письма недоступна.');
      return;
    }

    if (!email.trim()) {
      setMessage('Введи email, на который нужно повторно отправить подтверждение.');
      return;
    }

    const result = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });

    if (result.error) {
      setMessage(result.error.message);
      return;
    }

    setMessage('Письмо подтверждения отправлено повторно. Проверь входящие и спам.');
    setCanResend(true);
  }

  const isPositiveMessage = message.includes('создан') || message.includes('отправлено');

  return (
    <section className="panel narrow">
      <h2>{mode === 'login' ? 'Вход' : 'Регистрация'}</h2>
      <p className="muted">
        {isSupabaseConfigured
          ? 'Supabase подключён. Можно входить или создавать аккаунт.'
          : 'Supabase env не настроены, приложение откроется в demo-режиме.'}
      </p>

      <div className="tab-row">
        <button className={mode === 'login' ? 'tab active' : 'tab'} type="button" onClick={() => switchMode('login')}>
          Вход
        </button>
        <button className={mode === 'signup' ? 'tab active' : 'tab'} type="button" onClick={() => switchMode('signup')}>
          Регистрация
        </button>
      </div>

      <form className="form" onSubmit={submit}>
        <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" type="email" />
        <input value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Пароль" type="password" />
        {message && <div className={isPositiveMessage ? 'success-box' : 'error'}>{message}</div>}
        <Button type="submit">{mode === 'login' ? 'Войти' : 'Создать аккаунт'}</Button>
      </form>

      {canResend && (
        <button className="link" onClick={resendConfirmation}>
          Отправить письмо подтверждения ещё раз
        </button>
      )}
    </section>
  );
}
