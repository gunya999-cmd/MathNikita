import type { LessonRoadmapItem } from './lessonRoadmap';

export type EliteSourceCode = 'SG' | 'CN' | 'RU' | 'US' | 'HU';

export type EliteLessonContent = {
  sourceBlend: EliteSourceCode[];
  bigIdea: string;
  learn: {
    concreteModel: string;
    discoveryPrompt: string;
    formalRule: string;
    proofHabit: string;
    olympiadBridge: string;
  };
  practice: {
    base: string;
    nonStandard: string;
    proofOrExplain: string;
  };
  control: {
    quickCheck: string;
    transferProblem: string;
    masteryCriteria: string[];
  };
  commonMistakes: string[];
  aiRemediation: string[];
  keywords: string[];
};

function gradeBand(grade: number) {
  if (grade <= 2) return 'early-primary';
  if (grade <= 5) return 'upper-primary';
  if (grade <= 8) return 'middle';
  if (grade <= 10) return 'high';
  return 'advanced';
}

function sourceBlendForLesson(lesson: LessonRoadmapItem): EliteSourceCode[] {
  const band = gradeBand(lesson.grade);
  if (band === 'early-primary') return ['SG', 'US', 'HU'];
  if (band === 'upper-primary') return ['SG', 'US', 'RU', 'HU'];
  if (band === 'middle') return ['SG', 'US', 'RU', 'CN', 'HU'];
  return ['US', 'RU', 'CN', 'HU', 'SG'];
}

function topicFamily(title: string) {
  const normalized = title.toLowerCase();
  if (/дроб|decimal|десятич|процент|отнош|пропорц/.test(normalized)) return 'fractions-ratios';
  if (/уравн|выраж|алгеб|функц|полином|логариф|показател/.test(normalized)) return 'algebra-functions';
  if (/геометр|угол|треуг|окруж|площад|периметр|объ[её]м|вектор|пифагор/.test(normalized)) return 'geometry';
  if (/данн|статист|вероят|комбин|распредел|регресс/.test(normalized)) return 'data-probability';
  if (/предел|производ|интеграл|дифференц|комплекс|матриц/.test(normalized)) return 'advanced-math';
  return 'number-sense';
}

function familyMethod(family: string) {
  const methods: Record<string, { model: string; rule: string; bridge: string; mistakes: string[] }> = {
    'number-sense': {
      model: 'Singapore: concrete → pictorial → abstract. Начни с предметов, числовой прямой или разрядной модели, затем переходи к символам.',
      rule: 'Формальное правило выводится из модели: ученик сначала объясняет смысл действия, потом записывает короткую математическую форму.',
      bridge: 'Hungary: найди второй способ решения и сравни, какой короче и красивее.',
      mistakes: ['путает число и количество', 'механически считает без смысла', 'не проверяет ответ оценкой'],
    },
    'fractions-ratios': {
      model: 'Singapore bar model: представь часть и целое через отрезки, площадь или доли одного объекта.',
      rule: 'Формализация: сначала равные части и отношение, затем дробная/процентная запись и уравнение.',
      bridge: 'China depth drill: реши похожую задачу с изменённым целым, частью и обратным вопросом.',
      mistakes: ['путает часть и целое', 'складывает знаменатели', 'не видит пропорциональную структуру'],
    },
    'algebra-functions': {
      model: 'US/AoPS: начни с задачи, где формула появляется как необходимость, а не как готовое правило.',
      rule: 'Russian style: каждое преобразование должно сохранять равенство или область допустимых значений.',
      bridge: 'China/Russia: измени параметр и предскажи, как изменится ответ или график.',
      mistakes: ['переносит слагаемые без обратного действия', 'теряет знак', 'не проверяет область определения'],
    },
    geometry: {
      model: 'Hungary/Russia: начни с чертежа, отметь равные элементы и попробуй увидеть инвариант.',
      rule: 'Формализация: утверждение → причина → вывод. Никакой шаг не принимается без основания.',
      bridge: 'Olympiad bridge: найди дополнительное построение, симметрию, подобие или экстремальный случай.',
      mistakes: ['доверяет рисунку без доказательства', 'путает площадь и длину', 'не указывает основание геометрического шага'],
    },
    'data-probability': {
      model: 'Singapore/US: начни с таблицы, дерева исходов, диаграммы или маленького эксперимента.',
      rule: 'Формализация: пространство исходов, благоприятные случаи, мера центра или разброса.',
      bridge: 'AoPS: спроси, изменится ли ответ при другой выборке или другой модели случайности.',
      mistakes: ['путает частоту и вероятность', 'игнорирует размер выборки', 'делает причинный вывод из корреляции'],
    },
    'advanced-math': {
      model: 'US/RU: начни с графика, численного эксперимента или предельного случая, затем переходи к строгому определению.',
      rule: 'Формализация: записать определение, условия применимости и один строгий вывод.',
      bridge: 'China/IMO depth: решить частный случай, обобщить, затем проверить контрпример.',
      mistakes: ['использует формулу без условий', 'теряет смысл предела или производной', 'не проверяет граничный случай'],
    },
  };

  return methods[family] ?? methods['number-sense'];
}

function levelPrompt(lesson: LessonRoadmapItem) {
  const band = gradeBand(lesson.grade);
  if (band === 'early-primary') return 'Объясняй коротко, через предметы, рисунок и один математический символ.';
  if (band === 'upper-primary') return 'Требуй модель, числовое решение и проверку разумности ответа.';
  if (band === 'middle') return 'Требуй стратегию, запись уравнения/модели и объяснение почему метод работает.';
  if (band === 'high') return 'Требуй обоснование каждого преобразования и перенос идеи на новую задачу.';
  return 'Требуй определение, доказательный ход, обобщение и проверку граничного случая.';
}

function unique(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

export function getEliteLessonContent(lesson: LessonRoadmapItem): EliteLessonContent {
  const family = topicFamily(lesson.title);
  const method = familyMethod(family);
  const level = levelPrompt(lesson);
  const skill = lesson.skills[0] ?? lesson.title;

  return {
    sourceBlend: sourceBlendForLesson(lesson),
    bigIdea: `Главная идея урока «${lesson.title}»: ученик должен понять ${skill}, уметь объяснить это словами, применить в задаче и пройти перенос на новый пример.`,
    learn: {
      concreteModel: method.model,
      discoveryPrompt: `Exeter/AoPS: начни не с правила, а с вопроса: «Что здесь известно, что нужно найти, какой маленький пример покажет структуру темы ${lesson.title}?»`,
      formalRule: `${method.rule} ${level}`,
      proofHabit: `Russian proof habit: после решения ученик отвечает: «почему этот шаг законен?» и «как проверить ответ?».`,
      olympiadBridge: method.bridge,
    },
    practice: {
      base: `Базовое закрепление: реши одну прямую задачу по теме «${lesson.title}» и проговори алгоритм вслух.`,
      nonStandard: `Нестандартное закрепление: измени условие так, чтобы прежний алгоритм почти работал, но потребовал новой идеи.`,
      proofOrExplain: `Объяснение: докажи или обоснуй, почему метод из урока работает, используя слова «так как», «следовательно», «проверим».`,
    },
    control: {
      quickCheck: `Контрольная 1: без подсказки назови ключевую идею темы «${lesson.title}» и реши короткий пример.`,
      transferProblem: `Контрольная 2: примени идею «${lesson.title}» в похожей, но не идентичной задаче.`,
      masteryCriteria: [
        'ученик объясняет идею своими словами',
        'решает базовую задачу без подсказки',
        'переносит метод на немного новую задачу',
        'сам находит и исправляет типичную ошибку',
      ],
    },
    commonMistakes: method.mistakes,
    aiRemediation: [
      'вернуть ученика к модели или маленькому примеру',
      'задать наводящий вопрос вместо готового ответа',
      'попросить объяснить один шаг словами',
      'дать похожую задачу меньшей сложности',
      'после исправления дать задачу на перенос',
    ],
    keywords: unique([lesson.title, skill, ...lesson.skills, family]),
  };
}

export function sourceLabel(source: EliteSourceCode) {
  const labels: Record<EliteSourceCode, string> = {
    SG: 'SG · Singapore structure',
    CN: 'CN · China depth drill',
    RU: 'RU · proof culture',
    US: 'US · Exeter/AoPS problems',
    HU: 'HU · elegant solution',
  };
  return labels[source];
}
