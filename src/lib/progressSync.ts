import type { DiagnosticSummary } from '../types';
import type { StudentProfile } from '../data/profile';
import type { TaskDifficulty } from '../data/taskBank';
import { supabase } from './supabase';

type ProfileRow = {
  name: string;
  grade: string;
  goal: string;
  streak_days: number;
  solved_tasks: number;
  correct_answers: number;
  wrong_answers: number;
  current_difficulty: TaskDifficulty;
  last_active_date: string | null;
};

export async function getCurrentUserId() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

export function mapProfileRow(row: ProfileRow): StudentProfile {
  return {
    name: row.name,
    grade: row.grade,
    goal: row.goal,
    streakDays: row.streak_days,
    solvedTasks: row.solved_tasks,
    correctAnswers: row.correct_answers,
    wrongAnswers: row.wrong_answers,
    currentDifficulty: row.current_difficulty,
    lastActiveDate: row.last_active_date ?? undefined,
  };
}

export function mapProfileToRow(userId: string, profile: StudentProfile) {
  return {
    user_id: userId,
    name: profile.name,
    grade: profile.grade,
    goal: profile.goal,
    streak_days: profile.streakDays,
    solved_tasks: profile.solvedTasks,
    correct_answers: profile.correctAnswers,
    wrong_answers: profile.wrongAnswers,
    current_difficulty: profile.currentDifficulty,
    last_active_date: profile.lastActiveDate ?? null,
    updated_at: new Date().toISOString(),
  };
}

export async function loadCloudProfile(): Promise<StudentProfile | null> {
  if (!supabase) return null;
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const { data, error } = await supabase
    .from('student_profiles')
    .select('name, grade, goal, streak_days, solved_tasks, correct_answers, wrong_answers, current_difficulty, last_active_date')
    .eq('user_id', userId)
    .maybeSingle();

  if (error || !data) return null;
  return mapProfileRow(data as ProfileRow);
}

export async function saveCloudProfile(profile: StudentProfile) {
  if (!supabase) return;
  const userId = await getCurrentUserId();
  if (!userId) return;

  await supabase
    .from('student_profiles')
    .upsert(mapProfileToRow(userId, profile), { onConflict: 'user_id' });
}

export async function saveCloudDiagnostic(summary: DiagnosticSummary) {
  if (!supabase) return;
  const userId = await getCurrentUserId();
  if (!userId) return;

  await supabase.from('diagnostic_results').insert({
    user_id: userId,
    score: summary.score,
    level: summary.level,
    strong_topics: summary.strong,
    weak_topics: summary.weak,
    completed_at: summary.completedAt,
  });
}

export async function saveCloudTrainingAttempt(wasCorrect: boolean, taskDifficulty: TaskDifficulty) {
  if (!supabase) return;
  const userId = await getCurrentUserId();
  if (!userId) return;

  await supabase.from('training_attempts').insert({
    user_id: userId,
    task_difficulty: taskDifficulty,
    was_correct: wasCorrect,
  });
}
