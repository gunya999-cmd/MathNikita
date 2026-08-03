import { useMemo, useState } from 'react';
import { loginCloudStudent } from './cloudStudentApi';
import { connectLocalProfileToCloud, refreshCloudLogin, storageFingerprints } from './cloudStudentSync';
import {
  authenticateStudentProfile,
  createStudentProfile,
  getStudentProfiles,
  hasUnassignedStudentProgress,
  importCloudStudentProfile,
  setCloudBaseline,
  type StudentProfile,
} from './studentProfiles';
import './studentAccount.css';

type Mode = 'choose' | 'create' | 'pin' | 'cloud-login' | 'cloud-ready';
type CloudReceipt={studentCode:string;recoveryCode:string};

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
  const [cloudCode, setCloudCode] = useState('');
  const [receipt, setReceipt] = useState<CloudReceipt | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const migrateExisting = useMemo(() => profiles.length === 0 && hasUnassignedStudentProgress(), [profiles.length]);

  function finish() {
    onAuthenticated?.();
    window.location.reload();
  }

  function resetForm() {
    setError('');setPin('');setPinRepeat('');
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
      const profile=await createStudentProfile(name, pin, migrateExisting);
      setProfiles(getStudentProfiles());
      try{
        const cloud=await connectLocalProfileToCloud(profile.id,pin);
        if(cloud.recoveryCode){setReceipt({studentCode:cloud.studentCode,recoveryCode:cloud.recoveryCode});setMode('cloud-ready');return}
      }catch{/* local-first: cloud can reconnect on the next login */}
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
      const profile=await authenticateStudentProfile(selected.id, pin);
      if(profile.cloud){
        try{await refreshCloudLogin(profile.id,pin)}catch{/* offline login remains available */}
        finish();return;
      }
      try{
        const cloud=await connectLocalProfileToCloud(profile.id,pin);
        if(cloud.recoveryCode){setReceipt({studentCode:cloud.studentCode,recoveryCode:cloud.recoveryCode});setMode('cloud-ready');return}
      }catch{/* keep the local profile usable */}
      finish();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Не удалось войти в профиль.');
      setPin('');
    } finally {
      setBusy(false);
    }
  }

  async function loginFromCloud(){
    if(busy)return;setError('');setBusy(true);
    try{
      const response=await loginCloudStudent(cloudCode,pin);
      const profile=await importCloudStudentProfile({id:response.student.id,name:response.student.name,studentCode:response.student.code,token:response.token,revision:response.revision,entries:response.entries,pin});
      setCloudBaseline(profile.id,storageFingerprints(response.entries));
      finish();
    }catch(cause){setError(cause instanceof Error?cause.message:'Не удалось открыть облачный профиль.');setPin('')}
    finally{setBusy(false)}
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
            <i>{profile.avatar}</i><b>{profile.name}</b><span>{profile.cloud?`☁ ${profile.cloud.studentCode}`:'Войти по PIN →'}</span>
          </button>)}
          <button className="student-profile-card add-profile" onClick={() => { setMode('create'); setName(''); resetForm(); }}>
            <i>＋</i><b>Добавить ученика</b><span>Новый чистый профиль</span>
          </button>
        </div>
        <button className="account-secondary" onClick={()=>{setMode('cloud-login');setCloudCode('');resetForm()}}>Войти по коду ученика с другого устройства</button>
        <small className="account-device-note">Облачные профили можно открыть на другом устройстве по коду MN-… и тому же PIN.</small>
      </div>}

      {mode === 'create' && <div className="student-account-card account-form-card">
        {profiles.length > 0 && <button className="account-back" onClick={() => { setMode('choose'); setError(''); }}>← Все ученики</button>}
        <span className="account-eyebrow">Простая регистрация</span>
        <h1>{profiles.length ? 'Добавить ученика' : 'Создать профиль ученика'}</h1>
        <p>Только имя и 4 цифры. Почта и телефон не нужны. Облачная копия создастся автоматически.</p>
        {migrateExisting && <div className="legacy-progress-note"><b>✓ Нашёл существующий прогресс</b><span>Он автоматически сохранится в первый профиль и не пропадёт.</span></div>}
        <label className="account-field"><span>Имя ученика</span><input value={name} onChange={event => setName(event.target.value)} maxLength={24} placeholder="Например, Никита" autoFocus /></label>
        <div className="account-pin-row">
          <label className="account-field"><span>PIN · 4 цифры</span><input value={pin} onChange={event => setPin(event.target.value.replace(/\D/g, '').slice(0, 4))} inputMode="numeric" pattern="[0-9]*" maxLength={4} type="password" autoComplete="new-password" placeholder="••••" /></label>
          <label className="account-field"><span>Повтори PIN</span><input value={pinRepeat} onChange={event => setPinRepeat(event.target.value.replace(/\D/g, '').slice(0, 4))} inputMode="numeric" pattern="[0-9]*" maxLength={4} type="password" autoComplete="new-password" placeholder="••••" onKeyDown={event => event.key === 'Enter' && createProfile()} /></label>
        </div>
        {error && <div className="account-error" role="alert">{error}</div>}
        <button className="account-primary" onClick={createProfile} disabled={busy}>{busy ? 'Создаю и сохраняю…' : 'Создать профиль'}</button>
        <button className="account-link" onClick={()=>{setMode('cloud-login');setCloudCode('');resetForm()}}>Уже есть код ученика MN-…</button>
        <small className="account-security-note">Если интернета нет, профиль всё равно создастся локально. Облако подключится при следующем входе.</small>
      </div>}

      {mode === 'pin' && selected && <div className="student-account-card account-form-card pin-login-card">
        <button className="account-back" onClick={() => { setMode('choose'); setSelected(null); setError(''); }}>← Другой ученик</button>
        <div className="pin-avatar">{selected.avatar}</div>
        <span className="account-eyebrow">Профиль ученика</span>
        <h1>{selected.name}</h1>
        <p>{selected.cloud?`Облако ${selected.cloud.studentCode} · введи PIN.`:'Введи PIN. После входа подключим облачное сохранение.'}</p>
        <label className="account-field pin-single"><span>PIN</span><input aria-label={`PIN для ${selected.name}`} value={pin} onChange={event => setPin(event.target.value.replace(/\D/g, '').slice(0, 4))} inputMode="numeric" pattern="[0-9]*" maxLength={4} type="password" autoComplete="current-password" placeholder="••••" autoFocus onKeyDown={event => event.key === 'Enter' && login()} /></label>
        {error && <div className="account-error" role="alert">{error}</div>}
        <button className="account-primary" onClick={login} disabled={busy || pin.length !== 4}>{busy ? 'Проверяю и синхронизирую…' : 'Войти'}</button>
      </div>}

      {mode==='cloud-login'&&<div className="student-account-card account-form-card pin-login-card">
        <button className="account-back" onClick={()=>{setMode(profiles.length?'choose':'create');resetForm()}}>← Назад</button>
        <span className="account-eyebrow">Другое устройство</span>
        <h1>Открыть облачный профиль</h1>
        <p>Введите код ученика и тот же 4-значный PIN. Весь сохранённый прогресс загрузится автоматически.</p>
        <label className="account-field"><span>Код ученика</span><input aria-label="Код ученика" value={cloudCode} onChange={event=>setCloudCode(event.target.value.toUpperCase().replace(/\s/g,'').slice(0,12))} placeholder="MN-7K4P2Q" autoFocus /></label>
        <label className="account-field pin-single"><span>PIN</span><input aria-label="PIN облачного профиля" value={pin} onChange={event=>setPin(event.target.value.replace(/\D/g,'').slice(0,4))} inputMode="numeric" maxLength={4} type="password" placeholder="••••" onKeyDown={event=>event.key==='Enter'&&loginFromCloud()} /></label>
        {error&&<div className="account-error" role="alert">{error}</div>}
        <button className="account-primary" onClick={loginFromCloud} disabled={busy||pin.length!==4||!cloudCode.startsWith('MN-')}>{busy?'Загружаю прогресс…':'Войти и загрузить прогресс'}</button>
      </div>}

      {mode==='cloud-ready'&&receipt&&<div className="student-account-card account-form-card cloud-ready-card">
        <div className="cloud-ready-icon">☁</div>
        <span className="account-eyebrow">Облачное сохранение включено</span>
        <h1>Прогресс теперь защищён</h1>
        <p>На другом устройстве достаточно кода ученика и PIN. Сохраните код восстановления отдельно — он нужен, если PIN будет забыт.</p>
        <div className="cloud-code-box"><span>Код ученика</span><b>{receipt.studentCode}</b></div>
        <div className="cloud-code-box recovery"><span>Код восстановления</span><b>{receipt.recoveryCode}</b></div>
        <small className="account-security-note">PIN и код восстановления в открытом виде на сервере не хранятся.</small>
        <button className="account-primary" onClick={finish}>Я сохранил коды · продолжить</button>
      </div>}
    </section>
  </main>;
}
