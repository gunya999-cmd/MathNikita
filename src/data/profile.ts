import { getGradeCurriculum, normalizeGradeId } from './curriculum';
import type { TaskDifficulty } from './taskBank';

export type StudentProfile = {
  name: string;
  grade: string;
  goal: string;
  streakDays: number;
  solvedTasks: number;
  correctAnswers: number;
  wrongAnswers: number;
  currentDifficulty: TaskDifficulty;
  lastActiveDate?: string;
};

export const defaultProfile: StudentProfile = {
  name: 'Никита',
  grade: '7 класс',
  goal: 'Уверенно решать задачи и подтянуть школьную математику',
  streakDays: 0,
  solvedTasks: 0,
  correctAnswers: 0,
  wrongAnswers: 0,
  currentDifficulty: 'easy',
};

export const profileStorageKey = 'mathnikita.studentProfile';

export function normalizeProfile(profile: StudentProfile): StudentProfile {
  const grade = getGradeCurriculum(normalizeGradeId(profile.grade)).label;
  return { ...profile, grade };
}

export function loadStudentProfile(): StudentProfile {
  try {
    const raw = localStorage.getItem(profileStorageKey);
    return normalizeProfile(raw ? { ...defaultProfile, ...(JSON.parse(raw) as Partial<StudentProfile>) } : defaultProfile);
  } catch {
    return defaultProfile;
  }
}

export function saveStudentProfile(profile: StudentProfile) {
  localStorage.setItem(profileStorageKey, JSON.stringify(normalizeProfile(profile)));
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayKey() {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return date.toISOString().slice(0, 10);
}

function withActivity(profile: StudentProfile): StudentProfile {
  const today = todayKey();
  const previousDate = profile.lastActiveDate;
  const streakDays = previousDate === today
    ? profile.streakDays
    : previousDate === yesterdayKey()
      ? profile.streakDays + 1
      : 1;

  return {
    ...profile,
    streakDays,
    lastActiveDate: today,
  };
}

export function markPracticeDone(profile: StudentProfile, tasksSolved = 1): StudentProfile {
  const nextProfile = {
    ...withActivity(profile),
    solvedTasks: profile.solvedTasks + tasksSolved,
  };

  saveStudentProfile(nextProfile);
  return nextProfile;
}

export function markTaskAnswer(profile: StudentProfile, wasCorrect: boolean, currentDifficulty: TaskDifficulty): StudentProfile {
  const activeProfile = withActivity(profile);
  const nextProfile = {
    ...activeProfile,
    solvedTasks: activeProfile.solvedTasks + 1,
    correctAnswers: activeProfile.correctAnswers + (wasCorrect ? 1 : 0),
    wrongAnswers: activeProfile.wrongAnswers + (wasCorrect ? 0 : 1),
    currentDifficulty,
  };

  saveStudentProfile(nextProfile);
  return nextProfile;
}
