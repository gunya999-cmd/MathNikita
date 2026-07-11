export type YearLesson = {
  number: number;
  unit: string;
  paragraph: string;
  title: string;
  available: boolean;
};

const lessons: Omit<YearLesson, 'number'>[] = [
  { unit:'Натуральные числа', paragraph:'§ 1', title:'Удобные вычисления', available:true },
  { unit:'Натуральные числа', paragraph:'§ 2', title:'Порядок действий и скобки', available:true },
  { unit:'Текстовые задачи', paragraph:'§ 3', title:'Скорость, время и путь', available:true },
  { unit:'Натуральные числа', paragraph:'§ 4', title:'Числовые выражения', available:false },
  { unit:'Натуральные числа', paragraph:'§ 5', title:'Буквенные выражения', available:false },
  { unit:'Натуральные числа', paragraph:'§ 6', title:'Уравнения', available:false },
  { unit:'Натуральные числа', paragraph:'§ 7', title:'Координатный луч', available:false },
  { unit:'Натуральные числа', paragraph:'§ 8', title:'Сравнение натуральных чисел', available:false },
  { unit:'Сложение и вычитание', paragraph:'§ 9', title:'Сложение натуральных чисел', available:false },
  { unit:'Сложение и вычитание', paragraph:'§ 10', title:'Свойства сложения', available:false },
  { unit:'Сложение и вычитание', paragraph:'§ 11', title:'Вычитание', available:false },
  { unit:'Сложение и вычитание', paragraph:'§ 12', title:'Числовые и буквенные выражения', available:false },
  { unit:'Умножение и деление', paragraph:'§ 13', title:'Умножение натуральных чисел', available:false },
  { unit:'Умножение и деление', paragraph:'§ 14', title:'Свойства умножения', available:false },
  { unit:'Умножение и деление', paragraph:'§ 15', title:'Деление', available:false },
  { unit:'Умножение и деление', paragraph:'§ 16', title:'Деление с остатком', available:false },
  { unit:'Умножение и деление', paragraph:'§ 17', title:'Степень числа', available:false },
  { unit:'Площади и объёмы', paragraph:'§ 18', title:'Формулы', available:false },
  { unit:'Площади и объёмы', paragraph:'§ 19', title:'Площадь прямоугольника', available:false },
  { unit:'Площади и объёмы', paragraph:'§ 20', title:'Единицы площади', available:false },
  { unit:'Площади и объёмы', paragraph:'§ 21', title:'Прямоугольный параллелепипед', available:false },
  { unit:'Площади и объёмы', paragraph:'§ 22', title:'Объёмы', available:false },
  { unit:'Обыкновенные дроби', paragraph:'§ 23', title:'Доли и обыкновенные дроби', available:false },
  { unit:'Обыкновенные дроби', paragraph:'§ 24', title:'Сравнение дробей', available:false },
  { unit:'Обыкновенные дроби', paragraph:'§ 25', title:'Правильные и неправильные дроби', available:false },
  { unit:'Обыкновенные дроби', paragraph:'§ 26', title:'Сложение и вычитание дробей', available:false },
  { unit:'Обыкновенные дроби', paragraph:'§ 27', title:'Смешанные числа', available:false },
  { unit:'Десятичные дроби', paragraph:'§ 28', title:'Запись десятичных дробей', available:false },
  { unit:'Десятичные дроби', paragraph:'§ 29', title:'Сравнение десятичных дробей', available:false },
  { unit:'Десятичные дроби', paragraph:'§ 30', title:'Сложение и вычитание десятичных дробей', available:false },
  { unit:'Десятичные дроби', paragraph:'§ 31', title:'Умножение десятичных дробей', available:false },
  { unit:'Десятичные дроби', paragraph:'§ 32', title:'Деление десятичных дробей', available:false },
  { unit:'Проценты', paragraph:'§ 33', title:'Среднее арифметическое', available:false },
  { unit:'Проценты', paragraph:'§ 34', title:'Проценты и задачи на проценты', available:false },
  { unit:'Геометрическая лаборатория', paragraph:'§ 35', title:'Углы и измерения', available:false },
  { unit:'Геометрическая лаборатория', paragraph:'§ 36', title:'Построения, симметрия и разрезания', available:false },
];

export const yearPlan: YearLesson[] = lessons.map((lesson, index) => ({ number:index + 1, ...lesson }));
export const totalLessons = yearPlan.length;
