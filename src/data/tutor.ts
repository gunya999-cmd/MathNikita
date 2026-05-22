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

export function getTutorResponse(message: string, weakTopic?: string): TutorResponse {
  const text = message.toLowerCase();

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

  if (weakTopic) {
    return {
      title: `Начнём с темы “${weakTopic}”`,
      explanation: 'Я вижу эту тему как ближайшую точку роста. Лучше разобрать один понятный пример, чем сразу прыгать к сложным задачам.',
      example: 'Напиши конкретный пример по этой теме, и я разложу решение на шаги.',
      nextStep: `Задай вопрос по теме “${weakTopic}”.`,
    };
  }

  return {
    title: 'Готов помочь с математикой',
    explanation: 'Напиши задачу или тему: дроби, проценты, уравнения, умножение. Я объясню коротко и по шагам.',
    example: 'Например: “объясни 25% от 120” или “реши x + 9 = 20”.',
    nextStep: 'Выбери тему или пришли задачу.',
  };
}

export function formatTutorResponse(response: TutorResponse) {
  return `${response.title}\n\n${response.explanation}\n\nПример: ${response.example}\n\nСледующий шаг: ${response.nextStep}`;
}
