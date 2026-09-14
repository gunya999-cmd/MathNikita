export type ControlField142={id:string;number:string;label:string;answer:string;accepted?:string[];placeholder?:string;explanation:string};
export type ControlWorkEightStage={id:string;title:string;eyebrow:string;kind:'intro'|'task'|'submit'|'summary';body:string;fieldIds?:string[]};

export const lessonOneHundredFortyTwoProgressKey='mathnikita-lesson-142-control-v1';
export const lessonOneHundredFortyTwoFields:ControlField142[]=[
  {id:'l142-1a',number:'1.1',label:'0,024 · 4,5',answer:'0,108',accepted:['0.108'],placeholder:'Ответ',explanation:'24·45=1080; в множителях вместе 4 знака после запятой, поэтому 0,024·4,5=0,108.'},
  {id:'l142-1b',number:'1.2',label:'29,41 · 1 000',answer:'29410',accepted:['29 410'],placeholder:'Ответ',explanation:'При умножении на 1 000 запятая переносится на три цифры вправо: 29,41·1000=29410.'},
  {id:'l142-1c',number:'1.3',label:'2,86 : 100',answer:'0,0286',accepted:['0.0286'],placeholder:'Ответ',explanation:'При делении на 100 запятая переносится на две цифры влево: 2,86:100=0,0286.'},
  {id:'l142-1d',number:'1.4',label:'4 : 16',answer:'0,25',accepted:['0.25'],placeholder:'Ответ',explanation:'4:16=1:4=0,25.'},
  {id:'l142-1e',number:'1.5',label:'0,48 : 0,8',answer:'0,6',accepted:['0.6'],placeholder:'Ответ',explanation:'Умножаем делимое и делитель на 10: 4,8:8=0,6.'},
  {id:'l142-1f',number:'1.6',label:'9,1 : 0,07',answer:'130',placeholder:'Ответ',explanation:'Умножаем делимое и делитель на 100: 910:7=130.'},
  {id:'l142-2',number:'2',label:'(4 − 2,6) · 4,3 + 1,08 : 1,2',answer:'6,92',accepted:['6.92'],placeholder:'Значение выражения',explanation:'4−2,6=1,4; 1,4·4,3=6,02; 1,08:1,2=0,9; 6,02+0,9=6,92.'},
  {id:'l142-3',number:'3',label:'2,4(x + 0,98) = 4,08; x',answer:'0,72',accepted:['0.72'],placeholder:'x',explanation:'x+0,98=4,08:2,4=1,7; x=1,7−0,98=0,72.'},
  {id:'l142-4',number:'4',label:'Весь путь моторной лодки, км',answer:'69,92',accepted:['69.92','69,92 км','69.92 км'],placeholder:'км',explanation:'По течению: (19,8+1,7)·1,4=21,5·1,4=30,1 км. Против течения: (19,8−1,7)·2,2=18,1·2,2=39,82 км. Всего 69,92 км.'},
  {id:'l142-5',number:'5',label:'Искомая десятичная дробь',answer:'1,59',accepted:['1.59'],placeholder:'Дробь',explanation:'Пусть число x. После переноса запятой вправо через одну цифру получится 10x. Тогда 10x−x=14,31; 9x=14,31; x=1,59.'},
];

export const lessonOneHundredFortyTwoStages:ControlWorkEightStage[]=[
  {id:'l142-rules',kind:'intro',eyebrow:'Контрольная работа № 8 · вариант 1',title:'Умножение и деление десятичных дробей',body:'5 заданий · 10 оцениваемых ответов. Правильные ответы, решения и подсказки скрыты до сдачи всей работы.'},
  {id:'l142-task1',kind:'task',eyebrow:'Задание 1 из 5',title:'Вычисления',body:'Вычислите: 1) 0,024 · 4,5; 2) 29,41 · 1 000; 3) 2,86 : 100; 4) 4 : 16; 5) 0,48 : 0,8; 6) 9,1 : 0,07.',fieldIds:['l142-1a','l142-1b','l142-1c','l142-1d','l142-1e','l142-1f']},
  {id:'l142-task2',kind:'task',eyebrow:'Задание 2 из 5',title:'Числовое выражение',body:'Найдите значение выражения: (4 − 2,6) · 4,3 + 1,08 : 1,2.',fieldIds:['l142-2']},
  {id:'l142-task3',kind:'task',eyebrow:'Задание 3 из 5',title:'Уравнение',body:'Решите уравнение: 2,4(x + 0,98) = 4,08.',fieldIds:['l142-3']},
  {id:'l142-task4',kind:'task',eyebrow:'Задание 4 из 5',title:'Моторная лодка',body:'Моторная лодка плыла 1,4 ч по течению реки и 2,2 ч против течения. Какой путь преодолела лодка за всё время движения, если скорость течения равна 1,7 км/ч, а собственная скорость лодки — 19,8 км/ч?',fieldIds:['l142-4']},
  {id:'l142-task5',kind:'task',eyebrow:'Задание 5 из 5',title:'Перенос запятой',body:'Если в некоторой десятичной дроби перенести запятую вправо через одну цифру, то она увеличится на 14,31. Найдите эту дробь.',fieldIds:['l142-5']},
  {id:'l142-submit',kind:'submit',eyebrow:'Перед сдачей',title:'Финальная самопроверка',body:'Проверьте все 10 ответов. До сдачи можно вернуться к любому заданию и изменить ответ. После сдачи первичный результат фиксируется.'},
  {id:'l142-summary',kind:'summary',eyebrow:'Результат',title:'Контрольная работа № 8',body:'Первичный результат сохранён. Ошибки можно исправить в отдельном режиме, не меняя первичный балл.'},
];
export const lessonOneHundredFortyTwoTaskCount=5;
export const lessonOneHundredFortyTwoResponseCount=lessonOneHundredFortyTwoFields.length;
if(lessonOneHundredFortyTwoTaskCount!==5||lessonOneHundredFortyTwoResponseCount!==10||lessonOneHundredFortyTwoStages.length!==8)throw new Error('Lesson 142 control contract broken');
