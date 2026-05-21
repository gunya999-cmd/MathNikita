export type DiagnosticQuestion = {
  id: string;
  prompt: string;
  answer: string;
  skillTitle: string;
};

export const diagnosticQuestions: DiagnosticQuestion[] = [
  { id: 'q1', prompt: 'Реши: 7 + 8', answer: '15', skillTitle: 'Сложение' },
  { id: 'q2', prompt: 'Реши: 6 × 7', answer: '42', skillTitle: 'Умножение' },
  { id: 'q3', prompt: 'Сократи дробь 6/12', answer: '1/2', skillTitle: 'Дроби' },
  { id: 'q4', prompt: 'Реши уравнение: x + 5 = 12', answer: '7', skillTitle: 'Линейные уравнения' },
  { id: 'q5', prompt: 'Найди 20% от 150', answer: '30', skillTitle: 'Проценты' },
];

export function normalizeAnswer(value: string) {
  return value.trim().toLowerCase().replace(',', '.').replace(/\s+/g, '');
}
