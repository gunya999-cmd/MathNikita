import { getGradeCurriculum } from './curriculum';

export type TutorResponse = {
  title: string;
  explanation: string;
  example: string;
  nextStep: string;
};

function includesAny(text: string, words: string[]) {
  const normalized = text.toLowerCase();
  return words.some((word) => normalized.includes(word));
}

export function getTutorResponse(message: string, weakTopic?: string, grade?: string): TutorResponse {
  const text = message.toLowerCase();
  const curriculum = getGradeCurriculum(grade);
  const lessonByWeakTopic = weakTopic ? curriculum.lessons.find((lesson) => lesson.topic === weakTopic) : undefined;

  if (lessonByWeakTopic && !includesAny(text, ['дроб', 'fraction', 'процент', '%', 'уравн', 'x', 'икс', 'умнож', '×', '*', 'function', 'функц'])) {
    return {
      title: `Начнём с темы “${lessonByWeakTopic.topic}”`,
      explanation: lessonByWeakTopic.explanation,
      example: lessonByWeakTopic.example,
      nextStep: lessonByWeakTopic.practice,
    };
  }

  if (includesAny(text, ['дроб', 'fraction', '6/12', '8/12'])) {
    return {
      title: 'Разберём дроби',
      explanation: 'Дробь показывает, на сколько равных частей разделили целое и сколько таких частей взяли. Чтобы сократить дробь, нужно разделить числитель и знаменатель на общий делитель.',
      example: '8/12 можно сократить на 4: 8 ÷ 4 = 2 и 12 ÷ 4 = 3, значит 8/12 = 2/3.',
      nextStep: 'Попробуй сам: сократи 10/15.',
    };
  }

  if (includesAny(text, ['процент', '%', 'percent', 'скид'])) {
    return {
      title: 'Разберём проценты',
      explanation: 'Процент — это часть от 100. 10% значит 10 из 100, то есть одна десятая. 25% — это четверть.',
      example: '25% от 120 = 120 ÷ 4 = 30. Если это скидка, новая цена будет 120 − 30 = 90.',
      nextStep: 'Попробуй: найди 20% от 250.',
    };
  }

  if (includesAny(text, ['уравн', 'x', 'икс', 'equation'])) {
    return {
      title: 'Разберём уравнения',
      explanation: 'В уравнении нужно оставить x один. Для этого делаем обратное действие с обеими сторонами.',
      example: 'x + 9 = 20. Убираем +9: x = 20 − 9 = 11.',
      nextStep: 'Попробуй: реши x + 6 = 17.',
    };
  }

  if (includesAny(text, ['умнож', '×', '*', 'multiplication'])) {
    return {
      title: 'Разберём умножение',
      explanation: 'Умножение — это быстрое сложение одинаковых чисел. 6 × 7 значит взять 7 шесть раз.',
      example: '6 × 7 = 5 × 7 + 7 = 35 + 7 = 42.',
      nextStep: 'Попробуй: реши 8 × 7.',
    };
  }

  return {
    title: `Готов помочь по программе: ${curriculum.label}`,
    explanation: curriculum.focus,
    example: `Темы класса: ${curriculum.units.join(', ')}.`,
    nextStep: `Выбери тему или пришли задачу. Можно начать с “${curriculum.lessons[0].topic}”.`,
  };
}

export function formatTutorResponse(response: TutorResponse) {
  return `${response.title}\n\n${response.explanation}\n\nПример: ${response.example}\n\nСледующий шаг: ${response.nextStep}`;
}
