import { choiceTask as choice, inputTask as input, type ExtendedPracticeTask } from './extendedPracticeTypes';

export const extendedPracticeLesson6a: ExtendedPracticeTask[] = [
  input('l6-p1','Точка C лежит между A и B. AC = 8 см, CB = 13 см. Найди AB.',['21'],'Сложи две части.','AB = 8 + 13 = 21 см.'),
  input('l6-p2','Точка C лежит между A и B. AB = 27 см, AC = 9 см. Найди CB.',['18'],'Из целого вычти часть.','CB = 27 − 9 = 18 см.'),
  input('l6-p3','Переведи 6 см 4 мм в миллиметры.',['64'],'В одном сантиметре 10 миллиметров.','Получается 64 мм.'),
  choice('l6-p4','Отрезки AB и BA — это…',['Разные отрезки','Один и тот же отрезок','Две прямые','Два противоположных луча'],'Один и тот же отрезок','Порядок концов не меняет отрезок.','У них те же два конца.'),
];
