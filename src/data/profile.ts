export type StudentProfile = {
  name: string;
  grade: string;
  goal: string;
  streakDays: number;
  solvedTasks: number;
  lastActiveDate?: string;
};

export const defaultProfile: StudentProfile = {
  name: 'Никита',
  grade: '7 класс',
  goal: 'Уверенно решать задачи и подтянуть школьную математику',
  streakDays: 0,
  solvedTasks: 0,
};

export const profileStorageKey = 'mathnikita.studentProfile';

export function loadStudentProfile(): StudentProfile {
  try {
    const raw = localStorage.getItem(profileStorageKey);
    return raw ? { ...defaultProfile, ...(JSON.parse(raw) as Partial<StudentProfile>) } : defaultProfile;
  } catch {
    return defaultProfile;
  }
}

export function saveStudentProfile(profile: StudentProfile) {
  localStorage.setItem(profileStorageKey, JSON.stringify(profile));
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayKey() {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return date.toISOString().slice(0, 10);
}

export function markPracticeDone(profile: StudentProfile, tasksSolved = 1): StudentProfile {
  const today = todayKey();
  const previousDate = profile.lastActiveDate;
  const streakDays = previousDate === today
    ? profile.streakDays
    : previousDate === yesterdayKey()
      ? profile.streakDays + 1
      : 1;

  const nextProfile = {
    ...profile,
    streakDays,
    solvedTasks: profile.solvedTasks + tasksSolved,
    lastActiveDate: today,
  };

  saveStudentProfile(nextProfile);
  return nextProfile;
}
