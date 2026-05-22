import { FormEvent, useState } from 'react';
import { Button } from '../components/Button';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

export function Login({ onDone }: { onDone: (email: string) => void }) {
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
      : await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
          },
        });

    if (result.error) {
      setMessage(result.error.message);
      return;
    }

    if (mode === 'signup' && !result.data.session) {
      setMessage('Аккаунт создан. Проверь email и подтверди регистрацию по ссылке.');
      return;
    }

    onDone(result.data.user?.email ?? email);
  }

  return (
    <section className="panel narrow">
      <h2>{mode === 'login' ? 'Вход' : 'Регистрация'}</h2>
      <p className="muted">
        {isSupabaseConfigured
          ? 'Supabase подключён. Можно входить или создавать аккаунт.'
          : 'Supabase env не настроены, приложение откроется в demo-режиме.'}
      </p>
      <form className="form" onSubmit={submit}>
        <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" type="email" />
        <input value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Пароль" type="password" />
        {message && <div className={message.includes('создан') ? 'success-box' : 'error'}>{message}</div>}
        <Button type="submit">{mode === 'login' ? 'Войти' : 'Создать аккаунт'}</Button>
      </form>
      <button className="link" onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setMessage(''); }}>
        {mode === 'login' ? 'Создать аккаунт' : 'У меня уже есть аккаунт'}
      </button>
    </section>
  );
}
