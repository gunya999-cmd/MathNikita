import { chapter1Lessons, chapter1Tasks } from './chapter1';

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

const supportTasks: CourseTask[] = [
  { id:'d-ar-1',lessonId:'diagnostic',skill:'arithmetic',kind:'diagnostic',title:'Быстрый счёт',prompt:'Вычисли: 48 + 27',answer:'75',hint:'Собери полный десяток.',explanation:'48 + 27 = 75.',difficulty:1 },
  { id:'d-ar-2',lessonId:'diagnostic',skill:'arithmetic',kind:'diagnostic',title:'Умножение и деление',prompt:'Вычисли: 72 ÷ 8 + 6',answer:'15',hint:'Сначала деление.',explanation:'72 ÷ 8 = 9, затем 9 + 6 = 15.',difficulty:2 },
  { id:'d-ex-1',lessonId:'diagnostic',skill:'expressions',kind:'diagnostic',title:'Порядок действий',prompt:'Вычисли: 18 − 3 × 4',answer:'6',hint:'Сначала умножение.',explanation:'18 − 12 = 6.',difficulty:1 },
  { id:'d-word-1',lessonId:'diagnostic',skill:'wordProblems',kind:'diagnostic',title:'Текстовая задача',prompt:'В 4 коробках по 6 карандашей. 5 отдали. Сколько осталось?',answer:'19',hint:'Сначала найди общее количество.',explanation:'4 × 6 − 5 = 19.',difficulty:1 },
  { id:'d-fr-1',lessonId:'diagnostic',skill:'fractions',kind:'diagnostic',title:'Доли',prompt:'Сократи дробь 4/8.',answer:'1/2',hint:'Раздели обе части на 4.',explanation:'4/8 = 1/2.',difficulty:1 },
  { id:'d-ge-1',lessonId:'diagnostic',skill:'geometry',kind:'diagnostic',title:'Периметр',prompt:'Периметр квадрата 28 см. Найди сторону.',answer:'7',hint:'Раздели на 4.',explanation:'28 ÷ 4 = 7.',difficulty:1 },
  { id:'d-lo-1',lessonId:'diagnostic',skill:'logic',kind:'diagnostic',title:'Логический вывод',prompt:'Все синие фишки круглые. Фишка синяя. Какая она?',answer:'круглая',hint:'Используй слово «все».',explanation:'Она круглая.',difficulty:1 },
  { id:'d-co-1',lessonId:'diagnostic',skill:'combinatorics',kind:'diagnostic',title:'Перебор',prompt:'Сколько двузначных чисел из 1, 2, 3 без повторений?',answer:'6',hint:'3 выбора, затем 2.',explanation:'3 × 2 = 6.',difficulty:2 },
  { id:'r-ar-1',lessonId:'review',skill:'arithmetic',kind:'review',title:'Короткое повторение',prompt:'Вычисли: 240 + 160 + 35 + 65',answer:'500',hint:'Собери сотни.',explanation:'400 + 100 = 500.',difficulty:1 },
  { id:'r-ex-1',lessonId:'review',skill:'expressions',kind:'review',title:'Короткое повторение',prompt:'Вычисли: 50 − 4 × 7',answer:'22',hint:'Сначала умножение.',explanation:'50 − 28 = 22.',difficulty:1 },
  { id:'r-word-1',lessonId:'review',skill:'wordProblems',kind:'review',title:'Короткое повторение',prompt:'В 5 пакетах по 8 яблок. 7 съели. Сколько осталось?',answer:'33',hint:'Сначала найди, сколько было.',explanation:'40 − 7 = 33.',difficulty:1 },
  { id:'r-fr-1',lessonId:'review',skill:'fractions',kind:'review',title:'Короткое повторение',prompt:'Сократи 6/12.',answer:'1/2',hint:'Раздели на 6.',explanation:'6/12 = 1/2.',difficulty:1 },
  { id:'r-ge-1',lessonId:'review',skill:'geometry',kind:'review',title:'Короткое повторение',prompt:'Периметр прямоугольника 18 см, одна сторона 5 см. Найди другую.',answer:'4',hint:'Полупериметр равен 9.',explanation:'9 − 5 = 4.',difficulty:2 },
  { id:'r-lo-1',lessonId:'review',skill:'logic',kind:'review',title:'Короткое повторение',prompt:'Если число делится на 4, оно чётное? Ответь да или нет.',answer:'да',hint:'4 содержит множитель 2.',explanation:'Любое кратное 4 чётно.',difficulty:2 },
  { id:'r-co-1',lessonId:'review',skill:'combinatorics',kind:'review',title:'Короткое повторение',prompt:'Сколько пар можно составить из 4 человек?',answer:'6',hint:'3 + 2 + 1.',explanation:'Всего 6 пар.',difficulty:1 },
];

const tasks = [...supportTasks, ...chapter1Tasks];

export const taskBank = new Map(tasks.map(task => [task.id, task]));
export const diagnosticTaskIds = supportTasks.filter(task => task.kind === 'diagnostic').map(task => task.id);
export const reviewTaskBySkill: Record<SkillId, string> = {
  arithmetic:'r-ar-1', expressions:'r-ex-1', wordProblems:'r-word-1', fractions:'r-fr-1', geometry:'r-ge-1', logic:'r-lo-1', combinatorics:'r-co-1',
};

export const syllabus: Lesson[] = chapter1Lessons;
