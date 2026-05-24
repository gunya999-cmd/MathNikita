import type { LessonRoadmapItem } from './lessonRoadmap';

export type EliteSourceCode = 'SG' | 'CN' | 'RU' | 'US' | 'HU';
type TopicFamily = 'number-sense' | 'fractions-ratios' | 'algebra-functions' | 'geometry' | 'data-probability' | 'advanced-math';
type GradeBand = 'early-primary' | 'upper-primary' | 'middle' | 'high' | 'advanced';

export type WorkedExample = {
  problem: string;
  steps: string[];
  answer: string;
  whyItWorks: string;
};

export type EliteLessonContent = {
  sourceBlend: EliteSourceCode[];
  bigIdea: string;
  teaching: {
    teacherOpening: string;
    conceptExplanation: string;
    mentalModel: string;
    workedExample: WorkedExample;
    guidedQuestions: string[];
    studentTakeaway: string;
  };
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

function gradeBand(grade: number): GradeBand {
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

function topicFamily(title: string): TopicFamily {
  const normalized = title.toLowerCase();
  if (/дроб|decimal|десятич|процент|отнош|пропорц|смешан/.test(normalized)) return 'fractions-ratios';
  if (/уравн|выраж|алгеб|функц|полином|логариф|показател|последователь|ряд|асимптот|обратн/.test(normalized)) return 'algebra-functions';
  if (/геометр|угол|треуг|окруж|площад|периметр|объ[её]м|вектор|пифагор|симметр|координат|прям|плоскост|тела/.test(normalized)) return 'geometry';
  if (/данн|статист|вероят|комбин|распредел|регресс|выборк|корреляц|мода|медиан|средн/.test(normalized)) return 'data-probability';
  if (/предел|производ|интеграл|дифференц|комплекс|матриц|первообразн|муавр/.test(normalized)) return 'advanced-math';
  return 'number-sense';
}

function familyMethod(family: TopicFamily) {
  const methods: Record<TopicFamily, { model: string; rule: string; bridge: string; mistakes: string[] }> = {
    'number-sense': {
      model: 'Singapore: concrete → pictorial → abstract. Сначала предметы или разрядная модель, затем рисунок, затем короткая запись числами.',
      rule: 'Правило выводится из смысла числа: сначала ученик объясняет действие словами, потом записывает символами.',
      bridge: 'Hungary: попроси найти второй способ — через разрядность, числовую прямую или компенсацию.',
      mistakes: ['путает число и количество', 'считает механически без смысла', 'не проверяет ответ оценкой'],
    },
    'fractions-ratios': {
      model: 'Singapore bar model: часть и целое показываются отрезками, долями площади или равными группами.',
      rule: 'Формализация: сначала равные части и отношение, затем дробная, процентная или пропорциональная запись.',
      bridge: 'China depth drill: поменяй известную величину — пусть ученик восстановит часть, целое или процент в обратную сторону.',
      mistakes: ['путает часть и целое', 'складывает знаменатели', 'не видит пропорциональную структуру'],
    },
    'algebra-functions': {
      model: 'US/AoPS: правило рождается из задачи. Сначала таблица, рисунок или числовой эксперимент, затем формула.',
      rule: 'Russian style: каждое преобразование должно сохранять равенство, смысл выражения и область допустимых значений.',
      bridge: 'China/Russia: измени параметр и предскажи, как изменится ответ, график или число решений.',
      mistakes: ['переносит слагаемые без обратного действия', 'теряет знак', 'не проверяет область определения'],
    },
    geometry: {
      model: 'Hungary/Russia: начни с аккуратного чертежа, отметь равные элементы, углы, параллельность и возможный инвариант.',
      rule: 'Формализация: утверждение → причина → вывод. Ни один геометрический шаг не принимается без основания.',
      bridge: 'Olympiad bridge: найди дополнительное построение, симметрию, подобие, площадь или экстремальный случай.',
      mistakes: ['доверяет рисунку без доказательства', 'путает площадь и длину', 'не указывает основание геометрического шага'],
    },
    'data-probability': {
      model: 'Singapore/US: начни с таблицы, дерева исходов, диаграммы или маленького эксперимента.',
      rule: 'Формализация: зафиксируй пространство исходов, благоприятные случаи, меру центра, разброс или модель зависимости.',
      bridge: 'AoPS: спроси, изменится ли вывод при другой выборке, другой модели случайности или скрытом условии.',
      mistakes: ['путает частоту и вероятность', 'игнорирует размер выборки', 'делает причинный вывод из корреляции'],
    },
    'advanced-math': {
      model: 'US/RU: начни с графика, численного эксперимента или предельного случая, затем переходи к строгому определению.',
      rule: 'Формализация: записать определение, условия применимости и один строгий вывод.',
      bridge: 'China/IMO depth: решить частный случай, обобщить, затем проверить контрпример или граничный случай.',
      mistakes: ['использует формулу без условий', 'теряет смысл предела, производной или интеграла', 'не проверяет граничный случай'],
    },
  };

  return methods[family];
}

function levelPrompt(lesson: LessonRoadmapItem) {
  const band = gradeBand(lesson.grade);
  if (band === 'early-primary') return 'Объясняй коротко: предметы → рисунок → один математический символ.';
  if (band === 'upper-primary') return 'Требуй модель, числовое решение и проверку разумности ответа.';
  if (band === 'middle') return 'Требуй стратегию, запись модели/уравнения и объяснение, почему метод работает.';
  if (band === 'high') return 'Требуй обоснование каждого преобразования и перенос идеи на новую задачу.';
  return 'Требуй определение, доказательный ход, обобщение и проверку граничного случая.';
}

function workedExampleFor(family: TopicFamily, band: GradeBand, title: string): WorkedExample {
  if (family === 'number-sense') {
    if (band === 'early-primary') {
      return {
        problem: `У Маши 8 фишек. Она разложила их на 5 и ещё сколько? Это тренирует тему «${title}».`,
        steps: ['Положи 8 фишек в один ряд.', 'Отдели 5 фишек как удобную пятёрку.', 'Посчитай остаток: 6, 7, 8 — осталось 3.', 'Запиши: 8 = 5 + 3.'],
        answer: 'Осталось 3, значит 8 = 5 + 3.',
        whyItWorks: 'Мы не угадываем число, а сохраняем то же количество и просто представляем его удобнее.',
      };
    }
    return {
      problem: `Разложи 4 608 по разрядам и объясни, как это помогает в теме «${title}».`,
      steps: ['Найди тысячи: 4 000.', 'Найди сотни: 600.', 'Найди десятки: 0.', 'Найди единицы: 8.', 'Запиши: 4 608 = 4 000 + 600 + 8.'],
      answer: '4 608 = 4 000 + 600 + 8.',
      whyItWorks: 'Разрядная запись показывает ценность каждой цифры и позволяет считать не механически, а структурно.',
    };
  }

  if (family === 'fractions-ratios') {
    return {
      problem: `В задаче по теме «${title}» целое разделили на 4 равные части. Взяли 3 части. Какая доля взята?`,
      steps: ['Нарисуй один отрезок как целое.', 'Раздели его на 4 равные части.', 'Закрась 3 части.', 'Числитель показывает взятые части: 3.', 'Знаменатель показывает все равные части: 4.'],
      answer: 'Взято 3/4 целого.',
      whyItWorks: 'Дробь имеет смысл только тогда, когда части равны. Поэтому сначала модель, потом запись.',
    };
  }

  if (family === 'algebra-functions') {
    const advanced = band === 'high' || band === 'advanced';
    return advanced
      ? {
          problem: `Для темы «${title}» рассмотри функцию f(x)=2x+3. Что будет при x=5 и почему?`,
          steps: ['Определи правило: каждому x соответствует 2x + 3.', 'Подставь x = 5.', 'Получаем f(5)=2·5+3.', 'Вычисли: 10 + 3 = 13.', 'Проверь смысл: при увеличении x на 1 значение растёт на 2.'],
          answer: 'f(5)=13.',
          whyItWorks: 'Функция — это правило соответствия. Подстановка законна, если значение входит в область определения.',
        }
      : {
          problem: `В теме «${title}» реши уравнение 2x + 3 = 11.`,
          steps: ['Цель — оставить x один.', 'Убери +3 обратным действием: 11 - 3 = 8.', 'Получаем 2x = 8.', 'Раздели обе части на 2.', 'x = 4. Проверь: 2·4 + 3 = 11.'],
          answer: 'x = 4.',
          whyItWorks: 'Мы делаем одинаковые обратимые действия с обеими частями, поэтому равенство сохраняется.',
        };
  }

  if (family === 'geometry') {
    return {
      problem: `Для темы «${title}» найди периметр прямоугольника со сторонами 6 и 4.`,
      steps: ['Сделай чертёж и подпиши две соседние стороны: 6 и 4.', 'У прямоугольника противоположные стороны равны.', 'Значит все стороны: 6, 4, 6, 4.', 'Сложи длины: 6 + 4 + 6 + 4 = 20.', 'Проверь единицы измерения.'],
      answer: 'Периметр равен 20.',
      whyItWorks: 'Периметр — это длина границы фигуры. Мы складываем все стороны, а не площадь внутри.',
    };
  }

  if (family === 'data-probability') {
    return {
      problem: `В теме «${title}» есть данные: 4, 6, 8. Найди среднее и объясни смысл.`,
      steps: ['Сложи все значения: 4 + 6 + 8 = 18.', 'Посчитай количество значений: 3.', 'Раздели сумму на количество: 18 ÷ 3 = 6.', 'Проверь смысл: если выровнять значения, каждое стало бы 6.'],
      answer: 'Среднее равно 6.',
      whyItWorks: 'Среднее — это баланс: общая сумма сохраняется, но распределяется поровну.',
    };
  }

  return {
    problem: `В теме «${title}» рассмотри функцию f(x)=x². Найди скорость изменения в точке x=3 через производную.`,
    steps: ['Смысл производной — мгновенная скорость изменения.', 'Для f(x)=x² правило производной: f’(x)=2x.', 'Подставь x=3.', 'Получаем f’(3)=6.', 'Проверь смысл: около x=3 график растёт примерно на 6 единиц y при увеличении x на 1.'],
    answer: 'f’(3)=6.',
    whyItWorks: 'Производная появляется как предел средней скорости изменения на всё меньшем интервале.',
  };
}

function conceptExplanationFor(family: TopicFamily, lesson: LessonRoadmapItem) {
  const skill = lesson.skills[0] ?? lesson.title;
  const explanations: Record<TopicFamily, string> = {
    'number-sense': `Тема «${lesson.title}» учит видеть число как структуру, а не как набор цифр. Главный навык — ${skill}: ученик должен уметь показать количество, разложить его на удобные части и проверить ответ оценкой.`,
    'fractions-ratios': `Тема «${lesson.title}» учит сравнивать часть и целое. Сначала строим модель равных частей или отношений, затем переводим её в дробь, процент или пропорцию.`,
    'algebra-functions': `Тема «${lesson.title}» учит описывать закономерность языком символов. Символы нужны не для усложнения, а чтобы коротко записать правило, уравнение или зависимость.`,
    geometry: `Тема «${lesson.title}» учит видеть форму, отношения и доказательные причины. Хорошее решение начинается с чертежа, но не заканчивается рисунком: каждый вывод надо обосновать.`,
    'data-probability': `Тема «${lesson.title}» учит работать с неопределённостью и данными. Нужно понять, что именно измеряется, какие исходы возможны и какой вывод действительно следует из данных.`,
    'advanced-math': `Тема «${lesson.title}» учит переходить от интуиции к строгому определению. Сначала смотрим на график, пример или предельный случай, затем записываем правило и условия его применения.`,
  };
  return explanations[family];
}

function mentalModelFor(family: TopicFamily) {
  const models: Record<TopicFamily, string> = {
    'number-sense': 'Мысленная модель: число можно собрать, разобрать, передвинуть по числовой прямой и проверить через оценку.',
    'fractions-ratios': 'Мысленная модель: всегда спроси — что является целым, на сколько равных частей делим и какая часть выбрана?',
    'algebra-functions': 'Мысленная модель: выражение — это инструкция, уравнение — баланс, функция — машина соответствия входа и выхода.',
    geometry: 'Мысленная модель: чертёж — карта доказательства. На ней ищем равенства, параллельность, симметрию, площадь или инвариант.',
    'data-probability': 'Мысленная модель: данные — это история в числах; вероятность — список возможных исходов с правилами подсчёта.',
    'advanced-math': 'Мысленная модель: сложное понятие сначала видим на графике или предельном примере, потом уточняем строгим определением.',
  };
  return models[family];
}

function guidedQuestionsFor(family: TopicFamily, lesson: LessonRoadmapItem) {
  const common = [`Как ты объяснишь тему «${lesson.title}» ученику на класс младше?`];
  const questions: Record<TopicFamily, string[]> = {
    'number-sense': ['Что здесь является количеством?', 'Можно ли разложить число удобнее?', 'Как быстро проверить ответ без полного пересчёта?'],
    'fractions-ratios': ['Что является целым?', 'Все ли части равны?', 'Можно ли решить через bar model или пропорцию?'],
    'algebra-functions': ['Что неизвестно?', 'Какое действие было сделано последним?', 'Как проверить ответ подстановкой?'],
    geometry: ['Что известно по чертежу, а что надо доказать?', 'Какие элементы равны и почему?', 'Нужно ли дополнительное построение?'],
    'data-probability': ['Какие исходы возможны?', 'Что считается благоприятным случаем?', 'Достаточно ли данных для вывода?'],
    'advanced-math': ['Какие условия применимости правила?', 'Что происходит в предельном или граничном случае?', 'Можно ли найти контрпример?'],
  };
  return [...questions[family], ...common];
}

function unique(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

export function getEliteLessonContent(lesson: LessonRoadmapItem): EliteLessonContent {
  const family = topicFamily(lesson.title);
  const band = gradeBand(lesson.grade);
  const method = familyMethod(family);
  const level = levelPrompt(lesson);
  const skill = lesson.skills[0] ?? lesson.title;
  const workedExample = workedExampleFor(family, band, lesson.title);

  return {
    sourceBlend: sourceBlendForLesson(lesson),
    bigIdea: `Главная идея урока «${lesson.title}»: ученик должен понять ${skill}, уметь объяснить это словами, применить в задаче и пройти перенос на новый пример.`,
    teaching: {
      teacherOpening: `Сегодня мы изучаем «${lesson.title}». Я не даю готовую формулу сразу: сначала строим смысл, затем решаем пример, затем доказываем, почему метод работает.`,
      conceptExplanation: conceptExplanationFor(family, lesson),
      mentalModel: mentalModelFor(family),
      workedExample,
      guidedQuestions: guidedQuestionsFor(family, lesson),
      studentTakeaway: `После урока ученик должен сказать: «Я понимаю ${skill}, могу показать модель, решить пример и объяснить проверку».`,
    },
    learn: {
      concreteModel: method.model,
      discoveryPrompt: `Exeter/AoPS: начни не с правила, а с вопроса: «Что здесь известно, что нужно найти, какой маленький пример покажет структуру темы ${lesson.title}?»`,
      formalRule: `${method.rule} ${level}`,
      proofHabit: 'Russian proof habit: после решения ученик отвечает: «почему этот шаг законен?» и «как проверить ответ?».',
      olympiadBridge: method.bridge,
    },
    practice: {
      base: `Базовое закрепление: реши прямую задачу по теме «${lesson.title}» тем же методом, что в примере: модель → запись → вычисление → проверка.`,
      nonStandard: `Нестандартное закрепление: измени одно условие в примере и проверь, сохраняется ли метод. Если нет — объясни, что надо перестроить.`,
      proofOrExplain: `Объяснение: обоснуй решение по теме «${lesson.title}» словами «так как», «следовательно», «проверим».`,
    },
    control: {
      quickCheck: `Контрольная 1: без подсказки объясни идею темы «${lesson.title}» и реши короткий пример из этого урока.`,
      transferProblem: `Контрольная 2: примени идею «${lesson.title}» в похожей, но не идентичной задаче.`,
      masteryCriteria: [
        'ученик объясняет идею своими словами',
        'строит модель или чертёж до формулы',
        'решает базовый пример без подсказки',
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
    keywords: unique([lesson.title, skill, ...lesson.skills, family, workedExample.answer]),
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
