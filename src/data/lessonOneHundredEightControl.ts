export type ControlField108={id:string;number:string;label:string;answer:string;accepted?:string[];placeholder?:string;explanation:string;mode?:'number-set'};
export type ControlWorkSixStage={id:string;title:string;eyebrow:string;kind:'intro'|'task'|'submit'|'summary';body:string;fieldIds?:string[]};

export const lessonOneHundredEightProgressKey='mathnikita-lesson-108-control-v1';
export const lessonOneHundredEightFields:ControlField108[]=[
  {id:'l108-1a',number:'1.1',label:'14/19 и 18/19',answer:'<',accepted:['меньше'],placeholder:'<, > или =',explanation:'При одинаковых знаменателях больше та дробь, у которой больше числитель: 14/19 < 18/19.'},
  {id:'l108-1b',number:'1.2',label:'7/15 и 7/13',answer:'<',accepted:['меньше'],placeholder:'<, > или =',explanation:'При одинаковых числителях больше та дробь, у которой меньше знаменатель: 7/15 < 7/13.'},
  {id:'l108-1c',number:'1.3',label:'1 и 3/5',answer:'>',accepted:['больше'],placeholder:'<, > или =',explanation:'Правильная дробь меньше единицы, поэтому 1 > 3/5.'},
  {id:'l108-1d',number:'1.4',label:'26/21 и 1',answer:'>',accepted:['больше'],placeholder:'<, > или =',explanation:'Неправильная дробь с числителем больше знаменателя больше единицы: 26/21 > 1.'},
  {id:'l108-2a',number:'2.1',label:'19/28 + 16/28 − 17/28',answer:'9/14',accepted:['18/28'],placeholder:'Ответ',explanation:'(19+16−17)/28=18/28=9/14.'},
  {id:'l108-2b',number:'2.2',label:'4 11/14 − 2 5/14 + 1 3/14',answer:'3 9/14',placeholder:'Ответ',explanation:'Целые части дают 3, дробные: (11−5+3)/14=9/14. Итог 3 9/14.'},
  {id:'l108-2c',number:'2.3',label:'1 − 8/17',answer:'9/17',placeholder:'Ответ',explanation:'1=17/17, поэтому 17/17−8/17=9/17.'},
  {id:'l108-2d',number:'2.4',label:'4 5/9 − 2 8/9',answer:'1 2/3',accepted:['1 6/9'],placeholder:'Ответ',explanation:'4 5/9=3 14/9, затем 3 14/9−2 8/9=1 6/9=1 2/3.'},
  {id:'l108-3',number:'3',label:'Тетрадей в клетку',answer:'16',placeholder:'Количество',explanation:'28·4/7=4·4=16.'},
  {id:'l108-4',number:'4',label:'Всего деревьев',answer:'81',placeholder:'Количество',explanation:'36 составляет 4/9 всех деревьев, поэтому 36:4·9=81.'},
  {id:'l108-5a',number:'5.1',label:'7/2',answer:'3 1/2',placeholder:'Смешанное число',explanation:'7=2·3+1, поэтому 7/2=3 1/2.'},
  {id:'l108-5b',number:'5.2',label:'35/8',answer:'4 3/8',placeholder:'Смешанное число',explanation:'35=8·4+3, поэтому 35/8=4 3/8.'},
  {id:'l108-6',number:'6',label:'Сможет ли турист выполнить план?',answer:'нет',accepted:['не сможет','нет, не сможет'],placeholder:'Да или нет',explanation:'5/17+6/17+7/17=18/17>1, поэтому план превышает весь маршрут и невыполним.'},
  {id:'l108-7',number:'7',label:'Все натуральные x',answer:'18,19,20,21',accepted:['18;19;20;21','{18,19,20,21}'],placeholder:'Например: 1,2,3',explanation:'1 8/9=17/9 и 2 4/9=22/9, поэтому 17<x<22: x=18,19,20,21.',mode:'number-set'},
  {id:'l108-8',number:'8',label:'Все натуральные a',answer:'2,3,4,5,6',accepted:['2;3;4;5;6','{2,3,4,5,6}'],placeholder:'Например: 1,2,3',explanation:'Для неправильной дроби нужен положительный знаменатель и 3a−5≤13. Получаем a≥2 и a≤6.',mode:'number-set'},
];

export const lessonOneHundredEightStages:ControlWorkSixStage[]=[
  {id:'l108-rules',kind:'intro',eyebrow:'Контрольная работа № 6 · вариант 1',title:'Самостоятельная контрольная работа',body:'8 заданий · 15 оцениваемых ответов. Правильные ответы и разбор появятся только после сдачи всей работы.'},
  {id:'l108-task1',kind:'task',eyebrow:'Задание 1 из 8',title:'Сравнение дробей',body:'Сравните числа: 1) 14/19 и 18/19; 2) 7/15 и 7/13; 3) 1 и 3/5; 4) 26/21 и 1.',fieldIds:['l108-1a','l108-1b','l108-1c','l108-1d']},
  {id:'l108-task2',kind:'task',eyebrow:'Задание 2 из 8',title:'Действия с дробями',body:'Выполните действия: 1) 19/28 + 16/28 − 17/28; 2) 4 11/14 − 2 5/14 + 1 3/14; 3) 1 − 8/17; 4) 4 5/9 − 2 8/9.',fieldIds:['l108-2a','l108-2b','l108-2c','l108-2d']},
  {id:'l108-task3',kind:'task',eyebrow:'Задание 3 из 8',title:'Дробь от числа',body:'У мальчика имеется 28 тетрадей, из них 4/7 составляют тетради в клетку. Сколько тетрадей в клетку есть у мальчика?',fieldIds:['l108-3']},
  {id:'l108-task4',kind:'task',eyebrow:'Задание 4 из 8',title:'Целое по известной дроби',body:'В саду растут 36 яблонь, что составляет 4/9 всех деревьев. Сколько деревьев растёт в саду?',fieldIds:['l108-4']},
  {id:'l108-task5',kind:'task',eyebrow:'Задание 5 из 8',title:'Неправильные дроби и смешанные числа',body:'Преобразуйте в смешанное число дроби: 1) 7/2; 2) 35/8.',fieldIds:['l108-5a','l108-5b']},
  {id:'l108-task6',kind:'task',eyebrow:'Задание 6 из 8',title:'Проверка плана',body:'Турист планировал в первый день пройти 5/17 маршрута, во второй день 6/17 маршрута, а в третий 7/17. Сможет ли он реализовать свой план?',fieldIds:['l108-6']},
  {id:'l108-task7',kind:'task',eyebrow:'Задание 7 из 8',title:'Двойное неравенство',body:'Найдите все натуральные значения x, при которых верно неравенство 1 8/9 < x/9 < 2 4/9.',fieldIds:['l108-7']},
  {id:'l108-task8',kind:'task',eyebrow:'Задание 8 из 8',title:'Условие неправильной дроби',body:'Найдите все натуральные значения a, при которых дробь 13/(3a − 5) будет неправильной.',fieldIds:['l108-8']},
  {id:'l108-submit',kind:'submit',eyebrow:'Перед сдачей',title:'Финальная самопроверка',body:'Проверь все 15 ответов. До сдачи можно вернуться к любому заданию. После сдачи первичный результат уже не изменится.'},
  {id:'l108-summary',kind:'summary',eyebrow:'Результат',title:'Контрольная работа № 6',body:'Первичный результат сохранён. Если есть ошибки, можно открыть коррекцию только по неверным ответам.'},
];
export const lessonOneHundredEightTaskCount=8;
export const lessonOneHundredEightResponseCount=lessonOneHundredEightFields.length;
if(lessonOneHundredEightTaskCount!==8||lessonOneHundredEightResponseCount!==15||lessonOneHundredEightStages.length!==11)throw new Error('Lesson 108 control contract broken');
