import { getLessonForGradeTopic } from './curriculum';

export type Lesson = {
  topic?: string;
  title: string;
  subtitle: string;
  explanation: string;
  example: string;
  practice: string;
  answer: string;
};

export const lessonCatalog: Record<string, Lesson> = {
  Сложение: {
    topic: 'Сложение',
    title: 'Сложение с переходом через десяток',
    subtitle: 'Учимся быстро раскладывать числа на удобные части.',
    explanation: 'Когда сумма переходит через десяток, удобно дополнить первое число до 10, а остаток прибавить потом.',
    example: '7 + 8 = 7 + 3 + 5 = 10 + 5 = 15',
    practice: 'Реши: 8 + 9',
    answer: '17',
  },
  Умножение: {
    topic: 'Умножение',
    title: 'Таблица умножения без зубрёжки',
    subtitle: 'Используем близкие простые факты.',
    explanation: 'Если забыл 6 × 7, можно вспомнить 5 × 7 = 35 и добавить ещё одну семёрку.',
    example: '6 × 7 = 5 × 7 + 7 = 35 + 7 = 42',
    practice: 'Реши: 8 × 7',
    answer: '56',
  },
  Дроби: {
    topic: 'Дроби',
    title: 'Сокращение дробей',
    subtitle: 'Ищем общий делитель числителя и знаменателя.',
    explanation: 'Дробь можно сократить, если числитель и знаменатель делятся на одно и то же число.',
    example: '6/12 = 1/2, потому что 6 и 12 делятся на 6.',
    practice: 'Сократи дробь 8/12',
    answer: '2/3',
  },
  'Линейные уравнения': {
    topic: 'Линейные уравнения',
    title: 'Линейные уравнения за один шаг',
    subtitle: 'Переносим число на другую сторону обратным действием.',
    explanation: 'Чтобы найти x, нужно убрать действие рядом с x. Если прибавили 5, значит вычитаем 5.',
    example: 'x + 5 = 12 → x = 12 − 5 → x = 7',
    practice: 'Реши: x + 9 = 20',
    answer: '11',
  },
  Проценты: {
    topic: 'Проценты',
    title: 'Проценты как часть числа',
    subtitle: 'Переводим процент в дробь или десятичное число.',
    explanation: '20% — это 20 из 100, то есть 1/5. Поэтому 20% от числа — это число, делённое на 5.',
    example: '20% от 150 = 150 / 5 = 30',
    practice: 'Найди 10% от 240',
    answer: '24',
  },
  challenge: {
    topic: 'Смешанные задачи',
    title: 'Следующий уровень: смешанная задача',
    subtitle: 'Если базовая диагностика на 100%, пора объединять темы.',
    explanation: 'Сильный ученик должен не только считать, но и выбирать правильный метод решения.',
    example: 'Если тетрадь стоила 80 ₪, а скидка 25%, то скидка = 80 / 4 = 20 ₪, новая цена = 60 ₪.',
    practice: 'Цена 120 ₪. Скидка 25%. Какая новая цена?',
    answer: '90',
  },
};

export function getLessonForWeakTopic(topic?: string, grade?: string) {
  if (grade) return getLessonForGradeTopic(grade, topic);
  if (!topic) return lessonCatalog.challenge;
  return lessonCatalog[topic] ?? lessonCatalog.challenge;
}
