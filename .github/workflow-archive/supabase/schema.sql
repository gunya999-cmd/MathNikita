-- MathNikita Supabase schema
-- Run this in Supabase SQL Editor before enabling cloud sync.

create table if not exists public.student_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  name text not null default 'Никита',
  grade text not null default '7 класс',
  goal text not null default 'Уверенно решать задачи и подтянуть школьную математику',
  streak_days integer not null default 0,
  solved_tasks integer not null default 0,
  correct_answers integer not null default 0,
  wrong_answers integer not null default 0,
  current_difficulty text not null default 'easy',
  last_active_date date,
  updated_at timestamptz not null default now()
);

create table if not exists public.diagnostic_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  score integer not null,
  level text not null,
  strong_topics text[] not null default '{}',
  weak_topics text[] not null default '{}',
  completed_at timestamptz not null default now()
);

create table if not exists public.training_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  task_difficulty text not null,
  was_correct boolean not null,
  created_at timestamptz not null default now()
);

alter table public.student_profiles enable row level security;
alter table public.diagnostic_results enable row level security;
alter table public.training_attempts enable row level security;

create policy "Users can read own profile"
  on public.student_profiles for select
  using (auth.uid() = user_id);

create policy "Users can insert own profile"
  on public.student_profiles for insert
  with check (auth.uid() = user_id);

create policy "Users can update own profile"
  on public.student_profiles for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can read own diagnostic results"
  on public.diagnostic_results for select
  using (auth.uid() = user_id);

create policy "Users can insert own diagnostic results"
  on public.diagnostic_results for insert
  with check (auth.uid() = user_id);

create policy "Users can read own training attempts"
  on public.training_attempts for select
  using (auth.uid() = user_id);

create policy "Users can insert own training attempts"
  on public.training_attempts for insert
  with check (auth.uid() = user_id);
