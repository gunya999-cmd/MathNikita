import {
  getCurriculumPlanByGrade,
  parseGradeLevel,
  type CurriculumUnit,
  type GradeLevel,
} from './curriculumBase';

export type ExerciseDifficulty = 'warmup' | 'core' | 'challenge';

export type LearningStep = {
  prompt: string;
  expected: string[];
  hint: string;
  success: string;
};

export type LearningExercise = {
  id: string;
  title: string;
  difficulty: ExerciseDifficulty;
  skill: string;
  problem: string;
  answer: string;
  steps: LearningStep[];
};

export type LearningModule = {
  id: string;
  grade: GradeLevel;
  order: number;
  title: string;
  focus: string;
  skills: string[];
  outcome: string;
  exercises: LearningExercise[];
};

export type LearningProgram = {
  grade: GradeLevel;
  label: string;
  stage: string;
  sourceBlend: string;
  outcome: string;
  capstone: string;
  modules: LearningModule[];
  totalSkills: number;
  totalExercises: number;
};

type ExerciseTemplate = {
  title: string;
  problem: string;
  answer: string;
  method: string;
  keywords: string[];
};

const earlyPrimaryTemplates: ExerciseTemplate[] = [
  { title: 'Сравнение чисел', problem: 'Какое число больше: 48 или 52?', answer: '52', method: 'Сравни десятки, потом единицы.', keywords: ['сравнение', 'десятки', 'числа'] },
  { title: 'Сложение по частям', problem: 'Реши: 27 + 18.', answer: '45', method: 'Сложи десятки и единицы отдельно, потом объедини.', keywords: ['сложение', 'десятки', 'единицы'] },
  { title: 'Равные группы', problem: 'В 3 группах по 4 предмета. Сколько всего предметов?', answer: '12', method: 'Используй умножение или повторное сложение.', keywords: ['умножение', 'группы', 'массив'] },
  { title: 'Измерение и периметр', problem: 'У прямоугольника стороны 5, 5, 3 и 3. Найди периметр.', answer: '16', method: 'Сложи все стороны.', keywords: ['периметр', 'измерение', 'стороны'] },
  { title: 'Закономерность', problem: 'Продолжи ряд: 2, 4, 6, 8, ...', answer: '10', method: 'Найди правило: каждый раз прибавляем 2.', keywords: ['паттерн', 'ряд', 'правило'] },
];

const upperPrimaryTemplates: ExerciseTemplate[] = [
  { title: 'Операции с числами', problem: 'Реши: 125 × 4.', answer: '500', method: 'Разбей 125 на 100 + 25 и умножь по частям.', keywords: ['умножение', 'разложение', 'числа'] },
  { title: 'Дроби', problem: 'Реши: 1/4 + 1/4.', answer: '1/2', method: 'Сложи числители, знаменатель оставь тем же, затем сократи.', keywords: ['дроби', 'числитель', 'знаменатель'] },
  { title: 'Десятичные дроби', problem: 'Реши: 2.5 + 1.75.', answer: '4.25', method: 'Выровняй запятые и сложи десятичные части.', keywords: ['десятичные', 'запятая', 'сложение'] },
  { title: 'Геометрия', problem: 'Площадь прямоугольника 6 × 4. Чему она равна?', answer: '24', method: 'Площадь прямоугольника равна длина × ширина.', keywords: ['площадь', 'геометрия', 'прямоугольник'] },
  { title: 'Выражение', problem: 'Найди значение 3 × (8 + 2).', answer: '30', method: 'Сначала действие в скобках, потом умножение.', keywords: ['скобки', 'выражение', 'порядок'] },
];

const lowerSecondaryTemplates: ExerciseTemplate[] = [
  { title: 'Отношения', problem: 'В классе 12 мальчиков и 18 девочек. Сократи отношение 12:18.', answer: '2:3', method: 'Раздели обе части отношения на общий делитель 6.', keywords: ['отношение', 'пропорция', 'делитель'] },
  { title: 'Проценты', problem: 'Найди 20% от 150.', answer: '30', method: '20% = 1/5, значит 150 ÷ 5.', keywords: ['проценты', 'часть', 'целое'] },
  { title: 'Рациональные числа', problem: 'Реши: -3 + 8.', answer: '5', method: 'Двигайся по числовой прямой вправо на 8.', keywords: ['отрицательные', 'рациональные', 'числовая'] },
  { title: 'Линейное уравнение', problem: 'Реши: 2x + 7 = 19.', answer: '6', method: 'Сначала вычти 7, потом раздели на 2.', keywords: ['уравнение', 'линейное', 'x'] },
  { title: 'Статистика', problem: 'Найди среднее чисел 4, 6, 8.', answer: '6', method: 'Сложи числа и раздели на их количество.', keywords: ['среднее', 'статистика', 'данные'] },
];

const highSchoolTemplates: ExerciseTemplate[] = [
  { title: 'Квадратичное уравнение', problem: 'Реши: x² - 5x + 6 = 0.', answer: '2,3', method: 'Разложи на множители: (x - 2)(x - 3).', keywords: ['квадратное', 'множители', 'парабола'] },
  { title: 'Функция', problem: 'У функции y = 3x + 2 найди y при x = 4.', answer: '14', method: 'Подставь x = 4 в формулу.', keywords: ['функция', 'график', 'подстановка'] },
  { title: 'Геометрия', problem: 'В прямоугольном треугольнике катеты 3 и 4. Найди гипотенузу.', answer: '5', method: 'Используй теорему Пифагора.', keywords: ['пифагор', 'геометрия', 'треугольник'] },
  { title: 'Тригонометрия', problem: 'Если sin угла = 1/2, какой это стандартный угол в градусах?', answer: '30', method: 'Вспомни стандартные значения синуса.', keywords: ['sin', 'тригонометрия', 'угол'] },
  { title: 'Вероятность', problem: 'Монету бросают один раз. Какова вероятность орла?', answer: '1/2', method: 'Благоприятный исход один из двух равновероятных.', keywords: ['вероятность', 'исходы', 'данные'] },
];

const advancedTemplates: ExerciseTemplate[] = [
  { title: 'Функции', problem: 'Если f(x)=2x+1, чему равно f(5)?', answer: '11', method: 'Подставь 5 вместо x.', keywords: ['функция', 'подстановка', 'область'] },
  { title: 'Тригонометрия', problem: 'Чему равен sin 0°?', answer: '0', method: 'На единичной окружности при 0° y-координата равна 0.', keywords: ['sin', 'окружность', 'радианы'] },
  { title: 'Последовательность', problem: 'В арифметической последовательности 3, 7, 11, ... найди следующий член.', answer: '15', method: 'Каждый раз прибавляем 4.', keywords: ['последовательность', 'ряд', 'разность'] },
  { title: 'Производная', problem: 'Если f(x)=x², чему равна f’(5)?', answer: '10', method: 'Производная x² равна 2x.', keywords: ['производная', 'скорость', 'касательная'] },
  { title: 'Статистика', problem: 'Среднее чисел 10, 20, 30 равно?', answer: '20', method: 'Сложи числа и раздели на 3.', keywords: ['среднее', 'статистика', 'распределение'] },
];

function templatesForGrade(grade: GradeLevel) {
  if (grade <= 2) return earlyPrimaryTemplates;
  if (grade <= 5) return upperPrimaryTemplates;
  if (grade <= 8) return lowerSecondaryTemplates;
  if (grade <= 10) return highSchoolTemplates;
  return advancedTemplates;
}

function slug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-zа-я0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '') || 'module';
}

function makeExercise(unit: CurriculumUnit, grade: GradeLevel, moduleOrder: number, difficulty: ExerciseDifficulty): LearningExercise {
  const template = templatesForGrade(grade)[moduleOrder - 1] ?? templatesForGrade(grade)[0];
  const primarySkill = unit.skills[0] ?? unit.title;
  const secondarySkill = unit.skills[1] ?? primarySkill;
  const skill = difficulty === 'challenge' ? secondarySkill : primarySkill;
  const id = `grade-${grade}-m${moduleOrder}-${difficulty}`;

  if (difficulty === 'warmup') {
    return {
      id,
      title: `Разминка: ${unit.title}`,
      difficulty,
      skill,
      problem: template.problem,
      answer: template.answer,
      steps: [
        {
          prompt: 'Шаг 1: назови тему или метод решения.',
          expected: [unit.title, primarySkill, ...template.keywords],
          hint: `${template.method} Тема модуля: ${unit.title}.`,
          success: 'Метод выбран верно. Теперь реши задачу.',
        },
        {
          prompt: 'Финальный ответ',
          expected: [template.answer],
          hint: template.method,
          success: `Верно. Ответ: ${template.answer}.`,
        },
      ],
    };
  }

  if (difficulty === 'core') {
    return {
      id,
      title: `Навык: ${skill}`,
      difficulty,
      skill,
      problem: `Объясни коротко, какой навык тренирует модуль «${unit.title}». Можно написать ключевое слово из темы.`,
      answer: skill,
      steps: [
        {
          prompt: 'Шаг 1: выбери главное слово темы.',
          expected: [unit.title, skill, primarySkill, ...template.keywords],
          hint: `Подумай о фокусе: ${unit.focus}.`,
          success: 'Да, ты нашёл главный навык модуля.',
        },
        {
          prompt: 'Финальный ответ: напиши навык или тему модуля.',
          expected: [skill, unit.title, primarySkill],
          hint: `Один из навыков: ${unit.skills.join(', ')}.`,
          success: 'Отлично. Навык зафиксирован.',
        },
      ],
    };
  }

  return {
    id,
    title: `Вызов: ${unit.title}`,
    difficulty,
    skill,
    problem: `${template.problem} Затем объясни, почему ответ связан с темой «${unit.title}».`,
    answer: template.answer,
    steps: [
      {
        prompt: 'Шаг 1: реши вычислительную часть.',
        expected: [template.answer],
        hint: template.method,
        success: 'Вычислительная часть верная.',
      },
      {
        prompt: 'Шаг 2: назови тему, с которой связана задача.',
        expected: [unit.title, skill, ...template.keywords],
        hint: `Фокус модуля: ${unit.focus}.`,
        success: 'Связь с темой найдена.',
      },
      {
        prompt: 'Финальный ответ',
        expected: [template.answer],
        hint: template.method,
        success: `Отлично. Итоговый ответ: ${template.answer}.`,
      },
    ],
  };
}

function makeModule(unit: CurriculumUnit, grade: GradeLevel, index: number, outcome: string): LearningModule {
  const order = index + 1;
  return {
    id: `grade-${grade}-${slug(unit.title)}`,
    grade,
    order,
    title: unit.title,
    focus: unit.focus,
    skills: unit.skills,
    outcome,
    exercises: [
      makeExercise(unit, grade, order, 'warmup'),
      makeExercise(unit, grade, order, 'core'),
      makeExercise(unit, grade, order, 'challenge'),
    ],
  };
}

export function getLearningProgram(grade?: string | GradeLevel): LearningProgram {
  const gradeLevel = typeof grade === 'number' ? grade : parseGradeLevel(grade);
  const plan = getCurriculumPlanByGrade(gradeLevel);
  const modules = plan.units.map((unit, index) => makeModule(unit, plan.grade, index, plan.outcome));

  return {
    grade: plan.grade,
    label: plan.label,
    stage: plan.stage,
    sourceBlend: plan.sourceBlend,
    outcome: plan.outcome,
    capstone: plan.capstone,
    modules,
    totalSkills: modules.reduce((sum, module) => sum + module.skills.length, 0),
    totalExercises: modules.reduce((sum, module) => sum + module.exercises.length, 0),
  };
}

export function getProgramProgress(solvedTasks: number, program: LearningProgram) {
  const total = Math.max(program.totalExercises, 1);
  const completedExercises = Math.min(Math.max(solvedTasks, 0), total);
  const percent = Math.round((completedExercises / total) * 100);
  const completedModules = Math.min(Math.floor(completedExercises / 3), program.modules.length);

  return {
    completedExercises,
    totalExercises: total,
    completedModules,
    totalModules: program.modules.length,
    percent,
  };
}

export function getActiveLearningModule(program: LearningProgram, solvedTasks: number) {
  const moduleIndex = Math.min(Math.floor(Math.max(solvedTasks, 0) / 3), program.modules.length - 1);
  return program.modules[moduleIndex] ?? program.modules[0];
}
