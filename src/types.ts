export type Page = 'home' | 'login' | 'dashboard' | 'diagnostic' | 'chat' | 'practice' | 'training' | 'profile';

export type UserState = { email: string } | null;

export type DiagnosticSummary = {
  score: number;
  level: string;
  strong: string[];
  weak: string[];
  completedAt: string;
};
