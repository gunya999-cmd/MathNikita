export type TaskDifficulty = 'easy' | 'medium' | 'hard';

export type PracticeTask = {
  id: string;
  topic: string;
  difficulty: TaskDifficulty;
  prompt: string;
  answer: string;
  explanation: string;
};

export const taskBank: PracticeTask[] = [
  {
    id: 'add-easy-1',
    topic: 'Сложение',
    difficulty: 'easy',
    prompt: 'Реши: 18 + 7',
    answer: '25',
    explanation: '18 + 7 = 18 + 2 + 5 = 20 + 5 = 25.',
  },
  {
    id: 'mult-easy-1',
    topic: 'Умножение',
    difficulty: 'easy',
    prompt: 'Реши: 8 × 7',
    answer: '56',
    explanation: '8 × 7 = 56. Можно помнить как 7 × 8 = 56.',
  },
  {
    id: 'frac-easy-1',
    topic: 'Дроби',
    difficulty: 'easy',
    prompt: 'Сократи дробь 10/20',
    answer: '1/2',
    explanation: '10 и 20 делятся на 10, значит 10/20 = 1/2.',
  },
  {
    id: 'percent-easy-1',
    topic: 'Проценты',
    difficulty: 'easy',
    prompt: 'Найди 10% от 90',
    answer: '9',
    explanation: '10% — это одна десятая. 90 / 10 = 9.',
  },
  {
    id: 'equation-easy-1',
    topic: 'Линейные уравнения',
    difficulty: 'easy',
    prompt: 'Реши: x + 4 = 13',
    answer: '9',
    explanation: 'Вычитаем 4 из обеих частей: x = 13 − 4 = 9.',
  },
  {
    id: 'frac-medium-1',
    topic: 'Дроби',
    difficulty: 'medium',
    prompt: 'Сложи дроби: 1/4 + 1/4',
    answer: '1/2',
    explanation: '1/4 + 1/4 = 2/4, сокращаем до 1/2.',
  },
  {
    id: 'percent-medium-1',
    topic: 'Проценты',
    difficulty: 'medium',
    prompt: 'Найди 25% от 160',
    answer: '40',
    explanation: '25% — это четверть. 160 / 4 = 40.',
  },
  {
    id: 'equation-medium-1',
    topic: 'Линейные уравнения',
    difficulty: 'medium',
    prompt: 'Реши: 2x = 18',
    answer: '9',
    explanation: 'Делим обе части на 2: x = 18 / 2 = 9.',
  },
  {
    id: 'mixed-medium-1',
    topic: 'Смешанные задачи',
    difficulty: 'medium',
    prompt: 'Цена 200 ₪. Скидка 10%. Какая новая цена?',
    answer: '180',
    explanation: '10% от 200 = 20. Новая цена: 200 − 20 = 180.',
  },
  {
    id: 'percent-hard-1',
    topic: 'Проценты',
    difficulty: 'hard',
    prompt: 'Цена выросла со 120 до 150. На сколько процентов выросла цена?',
    answer: '25',
    explanation: 'Рост: 150 − 120 = 30. 30 / 120 = 0.25 = 25%.',
  },
  {
    id: 'equation-hard-1',
    topic: 'Линейные уравнения',
    difficulty: 'hard',
    prompt: 'Реши: 3x + 6 = 21',
    answer: '5',
    explanation: '3x = 21 − 6 = 15, значит x = 15 / 3 = 5.',
  },
  {
    id: 'frac-hard-1',
    topic: 'Дроби',
    difficulty: 'hard',
    prompt: 'Сложи: 1/2 + 1/3',
    answer: '5/6',
    explanation: 'Общий знаменатель 6: 1/2 = 3/6, 1/3 = 2/6. Сумма 5/6.',
  },
];

const difficultyOrder: TaskDifficulty[] = ['easy', 'medium', 'hard'];

export function getRecommendedDifficulty(correctAnswers: number, wrongAnswers: number): TaskDifficulty {
  const total = correctAnswers + wrongAnswers;
  if (total < 3) return 'easy';
  const accuracy = correctAnswers / total;
  if (accuracy >= 0.8 && correctAnswers >= 6) return 'hard';
  if (accuracy >= 0.6) return 'medium';
  return 'easy';
}

export function getTasksByDifficulty(difficulty: TaskDifficulty) {
  return taskBank.filter((task) => task.difficulty === difficulty);
}

export function getNextDifficulty(current: TaskDifficulty, wasCorrect: boolean): TaskDifficulty {
  const index = difficultyOrder.indexOf(current);
  if (wasCorrect) return difficultyOrder[Math.min(index + 1, difficultyOrder.length - 1)];
  return difficultyOrder[Math.max(index - 1, 0)];
}
