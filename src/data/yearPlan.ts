export type LessonType = 'new' | 'practice' | 'review' | 'control' | 'final';

export type YearLesson = {
  number: number;
  unit: string;
  paragraph: string;
  title: string;
  lessonType: LessonType;
  available: boolean;
};

type Segment = { unit:string; paragraph:string; topic:string; from:number; to:number };

const segments: Segment[] = [
  { unit:'Глава 1 · Натуральные числа', paragraph:'§ 1', topic:'Ряд натуральных чисел', from:1, to:2 },
  { unit:'Глава 1 · Натуральные числа', paragraph:'§ 2', topic:'Цифры. Десятичная запись натуральных чисел', from:3, to:5 },
  { unit:'Глава 1 · Натуральные числа', paragraph:'§ 3', topic:'Отрезок. Длина отрезка', from:6, to:9 },
  { unit:'Глава 1 · Натуральные числа', paragraph:'§ 4', topic:'Плоскость. Прямая. Луч', from:10, to:12 },
  { unit:'Глава 1 · Натуральные числа', paragraph:'§ 5', topic:'Шкала. Координатный луч', from:13, to:15 },
  { unit:'Глава 1 · Натуральные числа', paragraph:'§ 6', topic:'Сравнение натуральных чисел', from:16, to:18 },
  { unit:'Глава 1 · Натуральные числа', paragraph:'Повторение', topic:'Повторение и систематизация главы 1', from:19, to:19 },
  { unit:'Глава 1 · Натуральные числа', paragraph:'Контроль', topic:'Контрольная работа № 1', from:20, to:20 },
  { unit:'Глава 2 · Сложение и вычитание', paragraph:'§ 7', topic:'Сложение натуральных чисел. Свойства сложения', from:21, to:24 },
  { unit:'Глава 2 · Сложение и вычитание', paragraph:'§ 8', topic:'Вычитание натуральных чисел', from:25, to:29 },
  { unit:'Глава 2 · Сложение и вычитание', paragraph:'§ 9', topic:'Числовые и буквенные выражения. Формулы', from:30, to:32 },
  { unit:'Глава 2 · Сложение и вычитание', paragraph:'Контроль', topic:'Контрольная работа № 2', from:33, to:33 },
  { unit:'Глава 2 · Сложение и вычитание', paragraph:'§ 10', topic:'Уравнение', from:34, to:36 },
  { unit:'Глава 2 · Сложение и вычитание', paragraph:'§ 11', topic:'Угол. Обозначение углов', from:37, to:38 },
  { unit:'Глава 2 · Сложение и вычитание', paragraph:'§ 12', topic:'Виды углов. Измерение углов', from:39, to:43 },
  { unit:'Глава 2 · Сложение и вычитание', paragraph:'§ 13', topic:'Многоугольники. Равные фигуры', from:44, to:45 },
  { unit:'Глава 2 · Сложение и вычитание', paragraph:'§ 14', topic:'Треугольник и его виды', from:46, to:48 },
  { unit:'Глава 2 · Сложение и вычитание', paragraph:'§ 15', topic:'Прямоугольник. Ось симметрии фигуры', from:49, to:51 },
  { unit:'Глава 2 · Сложение и вычитание', paragraph:'Повторение', topic:'Повторение и систематизация главы 2', from:52, to:52 },
  { unit:'Глава 2 · Сложение и вычитание', paragraph:'Контроль', topic:'Контрольная работа № 3', from:53, to:53 },
  { unit:'Глава 3 · Умножение и деление', paragraph:'§ 16', topic:'Умножение. Переместительное свойство', from:54, to:57 },
  { unit:'Глава 3 · Умножение и деление', paragraph:'§ 17', topic:'Сочетательное и распределительное свойства', from:58, to:60 },
  { unit:'Глава 3 · Умножение и деление', paragraph:'§ 18', topic:'Деление', from:61, to:67 },
  { unit:'Глава 3 · Умножение и деление', paragraph:'§ 19', topic:'Деление с остатком', from:68, to:70 },
  { unit:'Глава 3 · Умножение и деление', paragraph:'§ 20', topic:'Степень числа', from:71, to:72 },
  { unit:'Глава 3 · Умножение и деление', paragraph:'Контроль', topic:'Контрольная работа № 4', from:73, to:73 },
  { unit:'Глава 3 · Умножение и деление', paragraph:'§ 21', topic:'Площадь. Площадь прямоугольника', from:74, to:77 },
  { unit:'Глава 3 · Умножение и деление', paragraph:'§ 22', topic:'Прямоугольный параллелепипед. Пирамида', from:78, to:80 },
  { unit:'Глава 3 · Умножение и деление', paragraph:'§ 23', topic:'Объём прямоугольного параллелепипеда', from:81, to:84 },
  { unit:'Глава 3 · Умножение и деление', paragraph:'§ 24', topic:'Комбинаторные задачи', from:85, to:87 },
  { unit:'Глава 3 · Умножение и деление', paragraph:'Повторение', topic:'Повторение и систематизация главы 3', from:88, to:89 },
  { unit:'Глава 3 · Умножение и деление', paragraph:'Контроль', topic:'Контрольная работа № 5', from:90, to:90 },
  { unit:'Глава 4 · Обыкновенные дроби', paragraph:'§ 25', topic:'Понятие обыкновенной дроби', from:91, to:95 },
  { unit:'Глава 4 · Обыкновенные дроби', paragraph:'§ 26', topic:'Правильные и неправильные дроби. Сравнение', from:96, to:98 },
  { unit:'Глава 4 · Обыкновенные дроби', paragraph:'§ 27', topic:'Сложение и вычитание дробей', from:99, to:100 },
  { unit:'Глава 4 · Обыкновенные дроби', paragraph:'§ 28', topic:'Дроби и деление натуральных чисел', from:101, to:101 },
  { unit:'Глава 4 · Обыкновенные дроби', paragraph:'§ 29', topic:'Смешанные числа', from:102, to:106 },
  { unit:'Глава 4 · Обыкновенные дроби', paragraph:'Повторение', topic:'Повторение и систематизация главы 4', from:107, to:107 },
  { unit:'Глава 4 · Обыкновенные дроби', paragraph:'Контроль', topic:'Контрольная работа № 6', from:108, to:108 },
  { unit:'Глава 5 · Десятичные дроби и проценты', paragraph:'§ 30', topic:'Представление о десятичных дробях', from:109, to:112 },
  { unit:'Глава 5 · Десятичные дроби и проценты', paragraph:'§ 31', topic:'Сравнение десятичных дробей', from:113, to:115 },
  { unit:'Глава 5 · Десятичные дроби и проценты', paragraph:'§ 32', topic:'Округление чисел. Прикидки', from:116, to:118 },
  { unit:'Глава 5 · Десятичные дроби и проценты', paragraph:'§ 33', topic:'Сложение и вычитание десятичных дробей', from:119, to:124 },
  { unit:'Глава 5 · Десятичные дроби и проценты', paragraph:'Контроль', topic:'Контрольная работа № 7', from:125, to:125 },
  { unit:'Глава 5 · Десятичные дроби и проценты', paragraph:'§ 34', topic:'Умножение десятичных дробей', from:126, to:132 },
  { unit:'Глава 5 · Десятичные дроби и проценты', paragraph:'§ 35', topic:'Деление десятичных дробей', from:133, to:141 },
  { unit:'Глава 5 · Десятичные дроби и проценты', paragraph:'Контроль', topic:'Контрольная работа № 8', from:142, to:142 },
  { unit:'Глава 5 · Десятичные дроби и проценты', paragraph:'§ 36', topic:'Среднее арифметическое', from:143, to:145 },
  { unit:'Глава 5 · Десятичные дроби и проценты', paragraph:'§ 37', topic:'Проценты. Нахождение процентов от числа', from:146, to:149 },
  { unit:'Глава 5 · Десятичные дроби и проценты', paragraph:'§ 38', topic:'Нахождение числа по его процентам', from:150, to:153 },
  { unit:'Глава 5 · Десятичные дроби и проценты', paragraph:'Повторение', topic:'Повторение и систематизация главы 5', from:154, to:155 },
  { unit:'Глава 5 · Десятичные дроби и проценты', paragraph:'Контроль', topic:'Контрольная работа № 9', from:156, to:156 },
  { unit:'Итоговое повторение', paragraph:'Итог', topic:'Натуральные числа и вычисления', from:157, to:160 },
  { unit:'Итоговое повторение', paragraph:'Итог', topic:'Выражения, формулы и уравнения', from:161, to:164 },
  { unit:'Итоговое повторение', paragraph:'Итог', topic:'Геометрия, площади и объёмы', from:165, to:168 },
  { unit:'Итоговое повторение', paragraph:'Итог', topic:'Дроби, проценты и текстовые задачи', from:169, to:172 },
  { unit:'Итоговое повторение', paragraph:'Итог', topic:'Олимпиадный практикум и работа над ошибками', from:173, to:174 },
  { unit:'Итоговая аттестация', paragraph:'Контроль', topic:'Итоговая контрольная работа', from:175, to:175 },
];

const phaseNames = ['Открытие темы','Базовые способы','Практика','Углубление','Задачи','Закрепление','Проверка понимания','Исследование'];

function lessonType(segment: Segment): LessonType {
  if (segment.from === 175) return 'final';
  if (segment.paragraph === 'Контроль') return 'control';
  if (segment.paragraph === 'Повторение' || segment.paragraph === 'Итог') return 'review';
  return 'new';
}

export const yearPlan: YearLesson[] = segments.flatMap(segment =>
  Array.from({ length:segment.to - segment.from + 1 }, (_, offset) => {
    const number = segment.from + offset;
    const type = lessonType(segment);
    const suffix = type === 'new' && segment.to > segment.from ? ` · ${phaseNames[offset % phaseNames.length]}` : '';
    return { number, unit:segment.unit, paragraph:segment.paragraph, title:`${segment.topic}${suffix}`, lessonType:type, available:number <= 20 };
  }),
);

export const totalLessons = yearPlan.length;
export const yearUnits = Array.from(new Set(yearPlan.map(lesson => lesson.unit)));

if (totalLessons !== 175) throw new Error(`Year plan must contain 175 lessons, received ${totalLessons}`);
