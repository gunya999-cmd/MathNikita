import type { ExtendedPracticeSet } from './extendedPracticeTypes';
import { extendedPracticeLesson1 } from './extendedPracticeLesson1';
import { extendedPracticeLesson2 } from './extendedPracticeLesson2';
import { extendedPracticeLesson3a } from './extendedPracticeLesson3a';
import { extendedPracticeLesson3b } from './extendedPracticeLesson3b';
import { extendedPracticeLesson4 } from './extendedPracticeLesson4';
import { extendedPracticeLesson5 } from './extendedPracticeLesson5';
import { extendedPracticeLesson6a } from './extendedPracticeLesson6a';
import { extendedPracticeLesson6b } from './extendedPracticeLesson6b';
import { extendedPracticeLesson7 } from './extendedPracticeLesson7';
import { extendedPracticeLesson8 } from './extendedPracticeLesson8';
import { extendedPracticeLesson9 } from './extendedPracticeLesson9';
import { extendedPracticeLesson10 } from './extendedPracticeLesson10';
import { extendedPracticeLesson11 } from './extendedPracticeLesson11';
import { extendedPracticeLesson12 } from './extendedPracticeLesson12';
import { extendedPracticeLesson13 } from './extendedPracticeLesson13';
import { extendedPracticeLesson14 } from './extendedPracticeLesson14';
import { extendedPracticeLesson15 } from './extendedPracticeLesson15';
import { extendedPracticeLesson16 } from './extendedPracticeLesson16';
import { extendedPracticeLesson17 } from './extendedPracticeLesson17';
import { extendedPracticeLesson18 } from './extendedPracticeLesson18';

const lesson3: ExtendedPracticeSet = {
  title:'Тренировочная мастерская: десятичная запись',
  subtitle:'Читаем многозначные числа, удерживаем нули и работаем с классами.',
  estimatedMinutes:16,
  tasks:[...extendedPracticeLesson3a, ...extendedPracticeLesson3b],
};

const lesson6: ExtendedPracticeSet = {
  title:'Тренировочная мастерская: отрезок',
  subtitle:'Находим целое и части, переводим единицы и рассуждаем о расположении точек.',
  estimatedMinutes:17,
  tasks:[...extendedPracticeLesson6a, ...extendedPracticeLesson6b],
};

export const extendedPracticeByLesson: Record<number, ExtendedPracticeSet> = {
  1:extendedPracticeLesson1,
  2:extendedPracticeLesson2,
  3:lesson3,
  4:extendedPracticeLesson4,
  5:extendedPracticeLesson5,
  6:lesson6,
  7:extendedPracticeLesson7,
  8:extendedPracticeLesson8,
  9:extendedPracticeLesson9,
  10:extendedPracticeLesson10,
  11:extendedPracticeLesson11,
  12:extendedPracticeLesson12,
  13:extendedPracticeLesson13,
  14:extendedPracticeLesson14,
  15:extendedPracticeLesson15,
  16:extendedPracticeLesson16,
  17:extendedPracticeLesson17,
  18:extendedPracticeLesson18,
};

export const extendedPracticeLessonNumbers = Object.keys(extendedPracticeByLesson).map(Number);
export type { ExtendedPracticeSet, ExtendedPracticeTask } from './extendedPracticeTypes';
