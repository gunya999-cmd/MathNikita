export type ControlField125={id:string;number:string;label:string;answer:string;accepted?:string[];placeholder?:string;explanation:string;mode?:'decimal-between-three'};
export type ControlWorkSevenStage={id:string;title:string;eyebrow:string;kind:'intro'|'task'|'submit'|'summary';body:string;fieldIds?:string[]};

export const lessonOneHundredTwentyFiveProgressKey='mathnikita-lesson-125-control-v1';
export const lessonOneHundredTwentyFiveFields:ControlField125[]=[
  {id:'l125-1a',number:'1.1',label:'14,396 и 14,4',answer:'<',accepted:['меньше'],placeholder:'<, > или =',explanation:'14,396 < 14,400, поэтому 14,396 < 14,4.'},
  {id:'l125-1b',number:'1.2',label:'0,657 и 0,6565',answer:'>',accepted:['больше'],placeholder:'<, > или =',explanation:'0,6570 > 0,6565, поэтому 0,657 > 0,6565.'},
  {id:'l125-2a',number:'2.1',label:'16,76 до десятых',answer:'16,8',accepted:['16.8'],placeholder:'Округлённое число',explanation:'В сотых стоит 6, поэтому десятые увеличиваем на единицу: 16,8.'},
  {id:'l125-2b',number:'2.2',label:'0,4864 до тысячных',answer:'0,486',accepted:['0.486'],placeholder:'Округлённое число',explanation:'Следующая цифра 4, поэтому тысячные не изменяются: 0,486.'},
  {id:'l125-3a',number:'3.1',label:'3,87 + 32,496',answer:'36,366',accepted:['36.366'],placeholder:'Ответ',explanation:'3,870 + 32,496 = 36,366.'},
  {id:'l125-3b',number:'3.2',label:'23,7 − 16,48',answer:'7,22',accepted:['7.22','7,220','7.220'],placeholder:'Ответ',explanation:'23,70 − 16,48 = 7,22.'},
  {id:'l125-3c',number:'3.3',label:'20 − 12,345',answer:'7,655',accepted:['7.655'],placeholder:'Ответ',explanation:'20,000 − 12,345 = 7,655.'},
  {id:'l125-4',number:'4',label:'Скорость катера против течения, км/ч',answer:'21,4',accepted:['21.4','21,4 км/ч','21.4 км/ч'],placeholder:'км/ч',explanation:'Скорость течения: 24,2 − 22,8 = 1,4 км/ч. Против течения: 22,8 − 1,4 = 21,4 км/ч.'},
  {id:'l125-5a',number:'5.1',label:'3,4 кг + 839 г, в килограммах',answer:'4,239',accepted:['4.239','4,239 кг','4.239 кг'],placeholder:'кг',explanation:'839 г = 0,839 кг. 3,4 + 0,839 = 4,239 кг.'},
  {id:'l125-5b',number:'5.2',label:'2 кг 30 г − 1956 г, в килограммах',answer:'0,074',accepted:['0.074','0,074 кг','0.074 кг'],placeholder:'кг',explanation:'2 кг 30 г = 2,030 кг, 1956 г = 1,956 кг. 2,030 − 1,956 = 0,074 кг.'},
  {id:'l125-6',number:'6',label:'Периметр треугольника, см',answer:'16,1',accepted:['16.1','16,1 см','16.1 см'],placeholder:'см',explanation:'Вторая сторона: 5,6 − 1,4 = 4,2 см. Третья: 5,6 + 0,7 = 6,3 см. Периметр: 5,6 + 4,2 + 6,3 = 16,1 см.'},
  {id:'l125-7',number:'7',label:'Три разных числа между 5,74 и 5,76',answer:'5,741; 5,75; 5,759',placeholder:'Например: 5,741; 5,75; 5,759',explanation:'Подходит любая тройка различных десятичных чисел, каждое из которых строго больше 5,74 и строго меньше 5,76.',mode:'decimal-between-three'},
  {id:'l125-8a',number:'8.1',label:'(8,63 + 3,298) − 5,63',answer:'6,298',accepted:['6.298'],placeholder:'Ответ',explanation:'Удобно сначала вычесть 5,63 из 8,63: 3 + 3,298 = 6,298.'},
  {id:'l125-8b',number:'8.2',label:'0,927 − (0,327 + 0,429)',answer:'0,171',accepted:['0.171'],placeholder:'Ответ',explanation:'0,927 − 0,327 − 0,429 = 0,6 − 0,429 = 0,171.'},
];

export const lessonOneHundredTwentyFiveStages:ControlWorkSevenStage[]=[
  {id:'l125-rules',kind:'intro',eyebrow:'Контрольная работа № 7 · вариант 1',title:'Самостоятельная контрольная работа',body:'8 заданий · 14 оцениваемых ответов. Правильные ответы и разбор скрыты до сдачи всей работы.'},
  {id:'l125-task1',kind:'task',eyebrow:'Задание 1 из 8',title:'Сравнение десятичных дробей',body:'Сравните: 1) 14,396 и 14,4; 2) 0,657 и 0,6565.',fieldIds:['l125-1a','l125-1b']},
  {id:'l125-task2',kind:'task',eyebrow:'Задание 2 из 8',title:'Округление',body:'Округлите: 1) 16,76 до десятых; 2) 0,4864 до тысячных.',fieldIds:['l125-2a','l125-2b']},
  {id:'l125-task3',kind:'task',eyebrow:'Задание 3 из 8',title:'Сложение и вычитание',body:'Выполните действия: 1) 3,87 + 32,496; 2) 23,7 − 16,48; 3) 20 − 12,345.',fieldIds:['l125-3a','l125-3b','l125-3c']},
  {id:'l125-task4',kind:'task',eyebrow:'Задание 4 из 8',title:'Катер и течение',body:'Скорость катера по течению реки равна 24,2 км/ч, а собственная скорость катера — 22,8 км/ч. Найдите скорость катера против течения реки.',fieldIds:['l125-4']},
  {id:'l125-task5',kind:'task',eyebrow:'Задание 5 из 8',title:'Величины в килограммах',body:'Вычислите, записав данные величины в килограммах: 1) 3,4 кг + 839 г; 2) 2 кг 30 г − 1956 г.',fieldIds:['l125-5a','l125-5b']},
  {id:'l125-task6',kind:'task',eyebrow:'Задание 6 из 8',title:'Периметр треугольника',body:'Одна сторона треугольника равна 5,6 см, что на 1,4 см больше второй стороны и на 0,7 см меньше третьей. Найдите периметр треугольника.',fieldIds:['l125-6']},
  {id:'l125-task7',kind:'task',eyebrow:'Задание 7 из 8',title:'Числа внутри интервала',body:'Напишите три числа, каждое из которых больше 5,74 и меньше 5,76.',fieldIds:['l125-7']},
  {id:'l125-task8',kind:'task',eyebrow:'Задание 8 из 8',title:'Удобный порядок вычислений',body:'Найдите значение выражения, выбирая удобный порядок вычислений: 1) (8,63 + 3,298) − 5,63; 2) 0,927 − (0,327 + 0,429).',fieldIds:['l125-8a','l125-8b']},
  {id:'l125-submit',kind:'submit',eyebrow:'Перед сдачей',title:'Финальная самопроверка',body:'Проверьте все 14 ответов. До сдачи можно вернуться к любому заданию. После сдачи первичный результат фиксируется и больше не меняется.'},
  {id:'l125-summary',kind:'summary',eyebrow:'Результат',title:'Контрольная работа № 7',body:'Первичный результат сохранён. Ошибки можно исправить в отдельном режиме, не меняя первичный балл.'},
];
export const lessonOneHundredTwentyFiveTaskCount=8;
export const lessonOneHundredTwentyFiveResponseCount=lessonOneHundredTwentyFiveFields.length;
if(lessonOneHundredTwentyFiveTaskCount!==8||lessonOneHundredTwentyFiveResponseCount!==14||lessonOneHundredTwentyFiveStages.length!==11)throw new Error('Lesson 125 control contract broken');