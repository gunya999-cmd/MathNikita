import { useEffect, useState } from 'react';
import { loadDiagnosticSummary, saveDiagnosticSummary } from './data/diagnostic';
import { defaultProfile, loadStudentProfile, markPracticeDone, markTaskAnswer, saveStudentProfile, type StudentProfile } from './data/profile';
import type { TaskDifficulty } from './data/taskBank';
import { Chat } from './pages/Chat';
import { Dashboard } from './pages/Dashboard';
import { Diagnostic } from './pages/Diagnostic';
import { Landing } from './pages/Landing';
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

  function recordTrainingAnswer(wasCorrect: boolean, nextDifficulty: TaskDifficulty) {
    setProfile((current) => markTaskAnswer(current, wasCorrect, nextDifficulty));
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={() => setPage('home')}>MathNikita</button>
        <nav>
          <button onClick={() => setPage('dashboard')}>Урок дня</button>
          <button onClick={() => setPage('diagnostic')}>Диагностика</button>
          <button onClick={() => setPage('practice')}>Практика</button>
          <button onClick={() => setPage('training')}>Тренировка</button>
          <button onClick={() => setPage('chat')}>Чат</button>
          <button onClick={() => setPage('profile')}>Профиль</button>
          <button onClick={() => setPage('login')}>{user ? user.email : 'Вход'}</button>
        </nav>
      </header>

      <main>
        {page === 'home' && <Landing onStart={() => setPage(user ? 'dashboard' : 'login')} />}
        {page === 'login' && <Login onDone={(email) => { setUser({ email }); setPage('dashboard'); }} />}
        {page === 'dashboard' && (
          <Dashboard
            profile={profile}
            summary={diagnosticSummary}
            onDiagnostic={() => setPage('diagnostic')}
            onChat={() => setPage('chat')}
            onPractice={() => setPage('practice')}
            onTraining={() => setPage('training')}
          />
        )}
        {page === 'diagnostic' && <Diagnostic onComplete={completeDiagnostic} />}
        {page === 'practice' && <Practice onSolvedTask={addSolvedTask} />}
        {page === 'training' && <Training profile={profile} onAnswer={recordTrainingAnswer} />}
        {page === 'chat' && <Chat summary={diagnosticSummary} />}
        {page === 'profile' && <Profile profile={profile} onSave={updateProfile} />}
      </main>
    </div>
  );
}
