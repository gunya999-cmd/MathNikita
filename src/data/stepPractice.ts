import { normalizeAnswer } from './questions';

export type StepPractice = {
  id: string;
  title: string;
  problem: string;
  steps: {
    prompt: string;
    expected: string[];
    hint: string;
    success: string;
  }[];
};

export const stepPractices: StepPractice[] = [
  {
    id: 'percent-discount',
    title: 'Проценты: скидка',
    problem: 'Цена товара 120 ₪. Скидка 25%. Какая новая цена?',
    steps: [
      {
        prompt: 'Шаг 1: чему равны 25% от 120?',
        expected: ['30'],
        hint: '25% — это четверть. Раздели 120 на 4.',
        success: 'Верно: 25% от 120 = 30.',
      },
      {
        prompt: 'Шаг 2: что нужно сделать со скидкой, чтобы найти новую цену?',
        expected: ['120-30', '90'],
        hint: 'Скидку нужно вычесть из старой цены: 120 − 30.',
        success: 'Да: 120 − 30 = 90.',
      },
      {
        prompt: 'Финальный ответ: какая новая цена?',
        expected: ['90', '90₪', '90шекелей'],
        hint: 'После вычитания скидки остаётся 90.',
        success: 'Отлично. Новая цена: 90 ₪.',
      },
    ],
  },
  {
    id: 'linear-equation',
    title: 'Уравнения: один шаг',
    problem: 'Реши уравнение: x + 9 = 20.',
    steps: [
      {
        prompt: 'Шаг 1: какое обратное действие нужно сделать?',
        expected: ['вычесть9', '-9', '20-9'],
        hint: 'Рядом с x прибавили 9, значит нужно вычесть 9.',
        success: 'Верно: используем вычитание 9.',
      },
      {
        prompt: 'Шаг 2: чему равно 20 − 9?',
        expected: ['11'],
        hint: '20 − 10 = 10, значит 20 − 9 = 11.',
        success: 'Да, 20 − 9 = 11.',
      },
      {
        prompt: 'Финальный ответ: чему равен x?',
        expected: ['11', 'x=11'],
        hint: 'x равен результату после обратного действия.',
        success: 'Отлично. x = 11.',
      },
    ],
  },
  {
    id: 'fractions-reduce',
    title: 'Дроби: сокращение',
    problem: 'Сократи дробь 8/12.',
    steps: [
      {
        prompt: 'Шаг 1: на какое число можно разделить и 8, и 12?',
        expected: ['4'],
        hint: '8 и 12 оба делятся на 4.',
        success: 'Верно: общий делитель 4.',
      },
      {
        prompt: 'Шаг 2: чему равно 8 ÷ 4 и 12 ÷ 4?',
        expected: ['2и3', '2/3', '2 3'],
        hint: '8 ÷ 4 = 2, 12 ÷ 4 = 3.',
        success: 'Да: получаем 2 и 3.',
      },
      {
        prompt: 'Финальный ответ: какая сокращённая дробь?',
        expected: ['2/3'],
        hint: 'Числитель стал 2, знаменатель стал 3.',
        success: 'Отлично. 8/12 = 2/3.',
      },
    ],
  },
];

function compact(value: string) {
  return normalizeAnswer(value).replace(/\s+/g, '');
}

export function checkStepAnswer(answer: string, expected: string[]) {
  const normalized = compact(answer);
  return expected.some((item) => compact(item) === normalized);
}
