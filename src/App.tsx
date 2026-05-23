import { useEffect, useState } from 'react';
import { loadDiagnosticSummary, saveDiagnosticSummary } from './data/diagnostic';
import { defaultProfile, loadStudentProfile, markPracticeDone, markTaskAnswer, saveStudentProfile, type StudentProfile } from './data/profile';
import type { TaskDifficulty } from './data/taskBank';
import { loadCloudProfile, saveCloudDiagnostic, saveCloudProfile, saveCloudTrainingAttempt } from './lib/progressSync';
import { isSupabaseConfigured, supabase } from './lib/supabase';
import { Chat } from './pages/Chat';
import { Dashboard } from './pages/Dashboard';
import { Diagnostic } from './pages/Diagnostic';
import { Landing } from './pages/Landing';
import { LessonFlow } from './pages/LessonFlow';
import { Login } from './pages/Login';
import { Practice } from './pages/Practice';
import { Profile } from './pages/Profile';
import { Training } from './pages/Training';
import type { DiagnosticSummary, Page, UserState } from './types';

export function App() {
  const [page, setPage] = useState<Page>('home');
  const [user, setUser] = useState<UserState>(null);
  const [diagnosticSummary, setDiagnosticSummary] = useState<DiagnosticSummary | null>(null);
  const [profile, setProfile] = useState<StudentProfile>(defaultProfile);

  useEffect(() => {
    setDiagnosticSummary(loadDiagnosticSummary());
    setProfile(loadStudentProfile());
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    supabase.auth.getSession().then(({ data }) => {
      const email = data.session?.user.email;
      if (!email) return;
      setUser({ email });
      void hydrateCloudProfile();
      if (page === 'home' || page === 'login') {
        setPage('dashboard');
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      const email = session?.user.email;
      if (email) {
        setUser({ email });
        void hydrateCloudProfile();
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          setPage('dashboard');
        }
        return;
      }

      if (event === 'SIGNED_OUT') {
        setUser(null);
        setPage('login');
      }
    });

    return () => listener.subscription.unsubscribe();
    // Run only once on app start. Page changes should not recreate the auth listener.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function hydrateCloudProfile() {
    const cloudProfile = await loadCloudProfile();
    if (!cloudProfile) return;
    saveStudentProfile(cloudProfile);
    setProfile(cloudProfile);
  }

  async function signOut() {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setPage('login');
  }

  function completeDiagnostic(summary: DiagnosticSummary) {
    saveDiagnosticSummary(summary);
    setDiagnosticSummary(summary);
    void saveCloudDiagnostic(summary);
  }

  function updateProfile(nextProfile: StudentProfile) {
    saveStudentProfile(nextProfile);
    setProfile(nextProfile);
    void saveCloudProfile(nextProfile);
  }

  function addSolvedTask(tasksSolved = 1) {
    setProfile((current) => {
      const nextProfile = markPracticeDone(current, tasksSolved);
      void saveCloudProfile(nextProfile);
      return nextProfile;
    });
  }

  function recordTrainingAnswer(wasCorrect: boolean, nextDifficulty: TaskDifficulty) {
    setProfile((current) => {
      const nextProfile = markTaskAnswer(current, wasCorrect, nextDifficulty);
      void saveCloudProfile(nextProfile);
      void saveCloudTrainingAttempt(wasCorrect, nextDifficulty);
      return nextProfile;
    });
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={() => setPage('home')}>MathNikita</button>
        <nav>
          <button onClick={() => setPage('dashboard')}>Урок дня</button>
          <button onClick={() => setPage('lesson')}>Урок</button>
          <button onClick={() => setPage('diagnostic')}>Диагностика</button>
          <button onClick={() => setPage('practice')}>Практика</button>
          <button onClick={() => setPage('training')}>Тренировка</button>
          <button onClick={() => setPage('chat')}>Чат</button>
          <button onClick={() => setPage('profile')}>Профиль</button>
          {user ? (
            <>
              <button onClick={() => setPage('profile')}>{user.email}</button>
              <button onClick={signOut}>Выйти</button>
            </>
          ) : (
            <button onClick={() => setPage('login')}>Вход</button>
          )}
        </nav>
      </header>

      <main>
        {page === 'home' && <Landing onStart={() => setPage(user ? 'dashboard' : 'login')} />}
        {page === 'login' && <Login onDone={(email) => { setUser({ email }); void hydrateCloudProfile(); setPage('dashboard'); }} />}
        {page === 'dashboard' && (
          <Dashboard
            profile={profile}
            summary={diagnosticSummary}
            onDiagnostic={() => setPage('diagnostic')}
            onChat={() => setPage('chat')}
            onPractice={() => setPage('practice')}
            onTraining={() => setPage('training')}
            onProfileChange={updateProfile}
          />
        )}
        {page === 'lesson' && <LessonFlow grade={profile.grade} onMastered={() => addSolvedTask(1)} />}
        {page === 'diagnostic' && <Diagnostic grade={profile.grade} onComplete={completeDiagnostic} />}
        {page === 'practice' && <Practice grade={profile.grade} onSolvedTask={addSolvedTask} />}
        {page === 'training' && <Training profile={profile} onAnswer={recordTrainingAnswer} />}
        {page === 'chat' && <Chat summary={diagnosticSummary} grade={profile.grade} />}
        {page === 'profile' && <Profile profile={profile} onSave={updateProfile} />}
      </main>
    </div>
  );
}
