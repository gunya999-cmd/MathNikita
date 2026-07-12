export type SkillId = 'arithmetic' | 'expressions' | 'wordProblems' | 'fractions' | 'geometry' | 'logic' | 'combinatorics';
export type TaskKind = 'diagnostic' | 'explain' | 'practice' | 'challenge' | 'review' | 'checkpoint';

export type CourseTask = {
  id: string;
  lessonId: string;
  skill: SkillId;
  kind: TaskKind;
  title: string;
  prompt: string;
  answer: string;
  hint: string;
  explanation: string;
  difficulty: 1 | 2 | 3;
  visual?: 'pairs' | 'segments' | 'fraction' | 'parity' | 'numberline';
};

export type Lesson = {
  id: string;
  order: number;
  unit: string;
  title: string;
  goal: string;
  prerequisiteSkills: SkillId[];
  coreTaskIds: string[];
  olympiadTaskId: string;
  checkpointTaskId: string;
};

export const skillLabels: Record<SkillId, string> = {
  arithmetic: 'Вычисления',
  expressions: 'Выражения',
  wordProblems: 'Текстовые задачи',
  fractions: 'Дроби',
  geometry: 'Геометрия',
  logic: 'Логика',
  combinatorics: 'Комбинаторика',
};

const tasks: CourseTask[] = [
  { id:'d-ar-1',lessonId:'diagnostic',skill:'arithmetic',kind:'diagnostic',title:'Быстрый счёт',prompt:'Вычисли: 48 + 27',answer:'75',hint:'Собери полный десяток.',explanation:'48 + 27 = 48 + 2 + 25 = 75.',difficulty:1,visual:'pairs' },
  { id:'d-ar-2',lessonId:'diagnostic',skill:'arithmetic',kind:'diagnostic',title:'Умножение и деление',prompt:'Вычисли: 72 ÷ 8 + 6',answer:'15',hint:'Сначала выполни деление.',explanation:'72 ÷ 8 = 9, затем 9 + 6 = 15.',difficulty:2 },
  { id:'d-ex-1',lessonId:'diagnostic',skill:'expressions',kind:'diagnostic',title:'Порядок действий',prompt:'Вычисли: 18 − 3 × 4',answer:'6',hint:'Сначала выполняется умножение.',explanation:'3 × 4 = 12, затем 18 − 12 = 6.',difficulty:1 },
  { id:'d-word-1',lessonId:'diagnostic',skill:'wordProblems',kind:'diagnostic',title:'Текстовая задача',prompt:'В 4 коробках по 6 карандашей. 5 карандашей отдали. Сколько осталось?',answer:'19',hint:'Сначала найди общее количество.',explanation:'4 × 6 = 24, 24 − 5 = 19.',difficulty:1 },
  { id:'d-fr-1',lessonId:'diagnostic',skill:'fractions',kind:'diagnostic',title:'Доли',prompt:'Из 8 равных частей закрашены 4. Запиши сокращённую дробь.',answer:'1/2',hint:'Сократи 4/8.',explanation:'4/8 = 1/2.',difficulty:1,visual:'fraction' },
  { id:'d-ge-1',lessonId:'diagnostic',skill:'geometry',kind:'diagnostic',title:'Периметр',prompt:'Периметр квадрата равен 28 см. Чему равна сторона?',answer:'7',hint:'У квадрата четыре равные стороны.',explanation:'28 ÷ 4 = 7 см.',difficulty:1 },
  { id:'d-lo-1',lessonId:'diagnostic',skill:'logic',kind:'diagnostic',title:'Логический вывод',prompt:'Все синие фишки круглые. Эта фишка синяя. Какая она по форме?',answer:'круглая',hint:'Используй слово «все».',explanation:'Синяя фишка обязательно круглая.',difficulty:1 },
  { id:'d-co-1',lessonId:'diagnostic',skill:'combinatorics',kind:'diagnostic',title:'Организованный перебор',prompt:'Сколько двузначных чисел можно составить из цифр 1, 2 и 3 без повторений?',answer:'6',hint:'Для первой цифры 3 выбора, для второй — 2.',explanation:'3 × 2 = 6 чисел.',difficulty:2 },

  { id:'l1-e',lessonId:'l1',skill:'arithmetic',kind:'explain',title:'Открытие',prompt:'Вычисли удобным способом: 37 + 63 + 28 + 72',answer:'200',hint:'Найди пары, которые дают 100.',explanation:'37 + 63 = 100 и 28 + 72 = 100. Всего 200.',difficulty:1,visual:'pairs' },
  { id:'l1-p1',lessonId:'l1',skill:'arithmetic',kind:'practice',title:'Закрепление',prompt:'Вычисли: 46 + 54 + 19 + 81',answer:'200',hint:'Здесь тоже есть две пары по 100.',explanation:'46 + 54 = 100, 19 + 81 = 100.',difficulty:1,visual:'pairs' },
  { id:'l1-p2',lessonId:'l1',skill:'expressions',kind:'practice',title:'Проверяем понимание',prompt:'Вычисли: 90 − 6 × 8',answer:'42',hint:'Начни с умножения.',explanation:'6 × 8 = 48, 90 − 48 = 42.',difficulty:2 },
  { id:'l1-o',lessonId:'l1',skill:'combinatorics',kind:'challenge',title:'Олимпиадная идея · Перебор',prompt:'На прямой отметили 5 точек. Сколько разных отрезков можно провести между ними?',answer:'10',hint:'4 + 3 + 2 + 1.',explanation:'Каждый отрезок считаем один раз: 4 + 3 + 2 + 1 = 10.',difficulty:2,visual:'segments' },
  { id:'l1-c',lessonId:'l1',skill:'arithmetic',kind:'checkpoint',title:'Контроль',prompt:'Вычисли без столбика: 125 + 375 + 64 + 36',answer:'600',hint:'Собери 500 и 100.',explanation:'125 + 375 = 500, 64 + 36 = 100.',difficulty:2,visual:'pairs' },

  { id:'l2-e',lessonId:'l2',skill:'expressions',kind:'explain',title:'Открытие',prompt:'Вычисли: 120 − (35 + 25)',answer:'60',hint:'Сначала вычисли сумму в скобках.',explanation:'35 + 25 = 60, затем 120 − 60 = 60.',difficulty:1 },
  { id:'l2-p1',lessonId:'l2',skill:'expressions',kind:'practice',title:'Закрепление',prompt:'Вычисли: 84 ÷ 7 + 6 × 3',answer:'30',hint:'Сначала деление и умножение.',explanation:'84 ÷ 7 = 12, 6 × 3 = 18, 12 + 18 = 30.',difficulty:2 },
  { id:'l2-p2',lessonId:'l2',skill:'wordProblems',kind:'practice',title:'Математическая модель',prompt:'К числу 18 прибавили произведение 4 и 7. Какой результат?',answer:'46',hint:'Запиши 18 + 4 × 7.',explanation:'4 × 7 = 28, 18 + 28 = 46.',difficulty:2 },
  { id:'l2-o',lessonId:'l2',skill:'logic',kind:'challenge',title:'Олимпиадная идея · Обратный ход',prompt:'Число удвоили, затем прибавили 6 и получили 30. Какое число было сначала?',answer:'12',hint:'Иди с конца: сначала вычти 6.',explanation:'30 − 6 = 24, 24 ÷ 2 = 12.',difficulty:2 },
  { id:'l2-c',lessonId:'l2',skill:'expressions',kind:'checkpoint',title:'Контроль',prompt:'Вычисли: 200 − 8 × (15 + 5)',answer:'40',hint:'Скобки, затем умножение, затем вычитание.',explanation:'15 + 5 = 20, 8 × 20 = 160, 200 − 160 = 40.',difficulty:2 },

  { id:'l3-e',lessonId:'l3',skill:'wordProblems',kind:'explain',title:'Открытие',prompt:'Автобус ехал 3 часа со скоростью 60 км/ч. Какой путь он проехал?',answer:'180',hint:'Путь = скорость × время.',explanation:'60 × 3 = 180 км.',difficulty:1 },
  { id:'l3-p1',lessonId:'l3',skill:'wordProblems',kind:'practice',title:'Закрепление',prompt:'Велосипедист проехал 48 км за 4 часа. Найди скорость.',answer:'12',hint:'Скорость = путь ÷ время.',explanation:'48 ÷ 4 = 12 км/ч.',difficulty:1 },
  { id:'l3-p2',lessonId:'l3',skill:'arithmetic',kind:'practice',title:'Два этапа',prompt:'Пешеход шёл 2 часа по 5 км/ч и ещё 3 км. Сколько всего километров?',answer:'13',hint:'Сначала найди путь за 2 часа.',explanation:'2 × 5 = 10, затем 10 + 3 = 13.',difficulty:2 },
  { id:'l3-o',lessonId:'l3',skill:'logic',kind:'challenge',title:'Олимпиадная идея · Оценка',prompt:'Может ли человек пройти 100 км за 10 часов со скоростью 8 км/ч?',answer:'нет',hint:'Сравни возможный путь с 100 км.',explanation:'За 10 часов получится 8 × 10 = 80 км, поэтому нет.',difficulty:1 },
  { id:'l3-c',lessonId:'l3',skill:'wordProblems',kind:'checkpoint',title:'Контроль',prompt:'Машина проехала 210 км за 3 часа. Найди скорость.',answer:'70',hint:'Раздели путь на время.',explanation:'210 ÷ 3 = 70 км/ч.',difficulty:2 },

  { id:'r-ar-1',lessonId:'review',skill:'arithmetic',kind:'review',title:'Короткое повторение',prompt:'Вычисли: 240 + 160 + 35 + 65',answer:'500',hint:'Собери круглые сотни.',explanation:'240 + 160 = 400, 35 + 65 = 100.',difficulty:1,visual:'pairs' },
  { id:'r-ex-1',lessonId:'review',skill:'expressions',kind:'review',title:'Короткое повторение',prompt:'Вычисли: 50 − 4 × 7',answer:'22',hint:'Умножение выполняется первым.',explanation:'4 × 7 = 28, 50 − 28 = 22.',difficulty:1 },
  { id:'r-word-1',lessonId:'review',skill:'wordProblems',kind:'review',title:'Короткое повторение',prompt:'В 5 пакетах по 8 яблок. 7 съели. Сколько осталось?',answer:'33',hint:'Сначала найди, сколько было.',explanation:'5 × 8 = 40, 40 − 7 = 33.',difficulty:1 },
  { id:'r-fr-1',lessonId:'review',skill:'fractions',kind:'review',title:'Короткое повторение',prompt:'Сократи дробь 6/12.',answer:'1/2',hint:'Раздели числитель и знаменатель на 6.',explanation:'6/12 = 1/2.',difficulty:1,visual:'fraction' },
  { id:'r-ge-1',lessonId:'review',skill:'geometry',kind:'review',title:'Короткое повторение',prompt:'Периметр прямоугольника 18 см, одна сторона 5 см. Найди другую.',answer:'4',hint:'Полупериметр равен 9.',explanation:'5 + x = 9, значит x = 4 см.',difficulty:2 },
  { id:'r-lo-1',lessonId:'review',skill:'logic',kind:'review',title:'Короткое повторение',prompt:'Верно ли: если число делится на 4, то оно чётное?',answer:'да',hint:'Любое число, кратное 4, содержит множитель 2.',explanation:'Да, 4k = 2·(2k), значит число чётное.',difficulty:2 },
  { id:'r-co-1',lessonId:'review',skill:'combinatorics',kind:'review',title:'Короткое повторение',prompt:'Сколько пар можно составить из 4 человек?',answer:'6',hint:'3 + 2 + 1.',explanation:'Каждую пару считаем один раз: 3 + 2 + 1 = 6.',difficulty:1 },
];

export const taskBank = new Map(tasks.map(task => [task.id, task]));
export const diagnosticTaskIds = tasks.filter(t => t.kind === 'diagnostic').map(t => t.id);
export const reviewTaskBySkill: Record<SkillId, string> = {
  arithmetic:'r-ar-1', expressions:'r-ex-1', wordProblems:'r-word-1', fractions:'r-fr-1', geometry:'r-ge-1', logic:'r-lo-1', combinatorics:'r-co-1',
};

export const syllabus: Lesson[] = [
  { id:'l1',order:1,unit:'Натуральные числа',title:'Удобные вычисления',goal:'Группировать числа и проверять результат другим способом.',prerequisiteSkills:['arithmetic','expressions'],coreTaskIds:['l1-e','l1-p1','l1-p2'],olympiadTaskId:'l1-o',checkpointTaskId:'l1-c' },
  { id:'l2',order:2,unit:'Числовые выражения',title:'Порядок действий и скобки',goal:'Читать выражение как последовательность действий.',prerequisiteSkills:['expressions','arithmetic'],coreTaskIds:['l2-e','l2-p1','l2-p2'],olympiadTaskId:'l2-o',checkpointTaskId:'l2-c' },
  { id:'l3',order:3,unit:'Текстовые задачи',title:'Скорость, время и путь',goal:'Переводить условие задачи в математическую модель.',prerequisiteSkills:['wordProblems','arithmetic'],coreTaskIds:['l3-e','l3-p1','l3-p2'],olympiadTaskId:'l3-o',checkpointTaskId:'l3-c' },
];
