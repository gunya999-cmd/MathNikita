import { useMemo, useState } from 'react';
import {
  authenticateStudentProfile,
  createStudentProfile,
  getStudentProfiles,
  hasUnassignedStudentProgress,
  type StudentProfile,
} from './studentProfiles';
import './studentAccount.css';

type Mode = 'choose' | 'create' | 'pin';

type Props = {
  onAuthenticated?: () => void;
};

export function StudentAccountGate({ onAuthenticated }: Props) {
  const [profiles, setProfiles] = useState<StudentProfile[]>(getStudentProfiles);
  const [mode, setMode] = useState<Mode>(() => profiles.length ? 'choose' : 'create');
  const [selected, setSelected] = useState<StudentProfile | null>(null);
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [pinRepeat, setPinRepeat] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const migrateExisting = useMemo(() => profiles.length === 0 && hasUnassignedStudentProgress(), [profiles.length]);

  function finish() {
    onAuthenticated?.();
    window.location.reload();
  }

  function openPin(profile: StudentProfile) {
    setSelected(profile);
    setPin('');
    setError('');
    setMode('pin');
  }

  async function createProfile() {
    if (busy) return;
    setError('');
    if (pin !== pinRepeat) {
      setError('PIN-коды не совпадают.');
      return;
    }
    setBusy(true);
    try {
      await createStudentProfile(name, pin, migrateExisting);
      setProfiles(getStudentProfiles());
      finish();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Не удалось создать профиль.');
    } finally {
      setBusy(false);
    }
  }

  async function login() {
    if (!selected || busy) return;
    setError('');
    setBusy(true);
    try {
      await authenticateStudentProfile(selected.id, pin);
      finish();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Не удалось войти в профиль.');
      setPin('');
    } finally {
      setBusy(false);
    }
  }

  return <main className="student-account-page">
    <section className="student-account-shell">
      <header className="student-account-brand">
        <div className="student-account-logo">Σ</div>
        <div><b>MathNikita</b><span>математика · 5 класс</span></div>
      </header>

      {mode === 'choose' && <div className="student-account-card account-chooser">
        <span className="account-eyebrow">Кто сегодня занимается?</span>
        <h1>Выбери свой профиль</h1>
        <p>У каждого ученика свой прогресс, ошибки, время занятий, награды и история уроков.</p>
        <div className="student-profile-grid">
          {profiles.map(profile => <button key={profile.id} className="student-profile-card" onClick={() => openPin(profile)}>
            <i>{profile.avatar}</i><b>{profile.name}</b><span>Войти по PIN →</span>
          </button>)}
          <button className="student-profile-card add-profile" onClick={() => { setMode('create'); setError(''); setName(''); setPin(''); setPinRepeat(''); }}>
            <i>＋</i><b>Добавить ученика</b><span>Новый чистый профиль</span>
          </button>
        </div>
        <small className="account-device-note">Профили хранятся только на этом устройстве. Почта и телефон не нужны.</small>
      </div>}

      {mode === 'create' && <div className="student-account-card account-form-card">
        {profiles.length > 0 && <button className="account-back" onClick={() => { setMode('choose'); setError(''); }}>← Все ученики</button>}
        <span className="account-eyebrow">Простая регистрация</span>
        <h1>{profiles.length ? 'Добавить ученика' : 'Создать профиль ученика'}</h1>
        <p>Только имя и 4 цифры. Никакой почты, телефона и подтверждений.</p>
        {migrateExisting && <div className="legacy-progress-note"><b>✓ Нашёл существующий прогресс</b><span>Он автоматически сохранится в первый профиль и не пропадёт.</span></div>}
        <label className="account-field"><span>Имя ученика</span><input value={name} onChange={event => setName(event.target.value)} maxLength={24} placeholder="Например, Никита" autoFocus /></label>
        <div className="account-pin-row">
          <label className="account-field"><span>PIN · 4 цифры</span><input value={pin} onChange={event => setPin(event.target.value.replace(/\D/g, '').slice(0, 4))} inputMode="numeric" pattern="[0-9]*" maxLength={4} type="password" autoComplete="new-password" placeholder="••••" /></label>
          <label className="account-field"><span>Повтори PIN</span><input value={pinRepeat} onChange={event => setPinRepeat(event.target.value.replace(/\D/g, '').slice(0, 4))} inputMode="numeric" pattern="[0-9]*" maxLength={4} type="password" autoComplete="new-password" placeholder="••••" onKeyDown={event => event.key === 'Enter' && createProfile()} /></label>
        </div>
        {error && <div className="account-error" role="alert">{error}</div>}
        <button className="account-primary" onClick={createProfile} disabled={busy}>{busy ? 'Создаю…' : 'Создать профиль'}</button>
        <small className="account-security-note">PIN нужен, чтобы ученики на одном устройстве не смешивали свои данные. Это локальный профиль, не банковский пароль.</small>
      </div>}

      {mode === 'pin' && selected && <div className="student-account-card account-form-card pin-login-card">
        <button className="account-back" onClick={() => { setMode('choose'); setSelected(null); setError(''); }}>← Другой ученик</button>
        <div className="pin-avatar">{selected.avatar}</div>
        <span className="account-eyebrow">Профиль ученика</span>
        <h1>{selected.name}</h1>
        <p>Введи свой 4-значный PIN.</p>
        <label className="account-field pin-single"><span>PIN</span><input aria-label={`PIN для ${selected.name}`} value={pin} onChange={event => setPin(event.target.value.replace(/\D/g, '').slice(0, 4))} inputMode="numeric" pattern="[0-9]*" maxLength={4} type="password" autoComplete="current-password" placeholder="••••" autoFocus onKeyDown={event => event.key === 'Enter' && login()} /></label>
        {error && <div className="account-error" role="alert">{error}</div>}
        <button className="account-primary" onClick={login} disabled={busy || pin.length !== 4}>{busy ? 'Проверяю…' : 'Войти'}</button>
      </div>}
    </section>
  </main>;
}
