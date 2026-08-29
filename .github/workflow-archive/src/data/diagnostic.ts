import { getGradeCurriculum } from './curriculum';
import type { DiagnosticSummary } from '../types';

const storageKey = 'mathnikita.diagnosticSummary';

export function loadDiagnosticSummary(): DiagnosticSummary | null {
  try {
    const raw = localStorage.getItem(storageKey);
    return raw ? (JSON.parse(raw) as DiagnosticSummary) : null;
  } catch {
    return null;
  }
}

export function saveDiagnosticSummary(summary: DiagnosticSummary) {
  localStorage.setItem(storageKey, JSON.stringify(summary));
}

export function getLevel(score: number) {
  if (score >= 85) return 'сильный уровень';
  if (score >= 60) return 'средний уровень';
  return 'нужно укрепить базу';
}

export function getNextLesson(summary: DiagnosticSummary | null, grade?: string) {
  const firstWeak = summary?.weak[0];
  if (firstWeak) return `Повторить тему: ${firstWeak}`;
  if (summary?.score === 100) return 'Следующий уровень';
  return `Старт программы: ${getGradeCurriculum(grade).lessons[0].topic}`;
}
