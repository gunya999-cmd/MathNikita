export type ControlField156={id:string;number:string;label:string;answer:string;accepted?:string[];placeholder?:string;explanation:string};
export type ControlWorkNineStage={id:string;title:string;eyebrow:string;kind:'intro'|'task'|'submit'|'summary';body:string;fieldIds?:string[]};

export const lessonOneHundredFiftySixProgressKey='mathnikita-lesson-156-control-v1';
export const lessonOneHundredFiftySixFields:ControlField156[]=[
  {id:'l156-1',number:'1',label:'Среднее арифметическое чисел 32,6; 38,5; 34; 35,3',answer:'35,1',accepted:['35.1'],placeholder:'Ответ',explanation:'32,6+38,5+34+35,3=140,4; 140,4:4=35,1.'},
  {id:'l156-2',number:'2',label:'Площадь, засеянная рожью, га',answer:'54',accepted:['54 га'],placeholder:'га',explanation:'18% от 300 га: 300·0,18=54 га.'},
  {id:'l156-3',number:'3',label:'Сколько денег было у Пети, р.',answer:'300',accepted:['300 р','300 руб','300 рублей'],placeholder:'рубли',explanation:'90 р. — это 30% всех денег. 90:0,30=300 р.'},
  {id:'l156-4',number:'4',label:'Средняя скорость лодки на всём пути, км/ч',answer:'12,9',accepted:['12.9','12,9 км/ч','12.9 км/ч'],placeholder:'км/ч',explanation:'Путь: 12,3·2+13,2·4=24,6+52,8=77,4 км. Время: 6 ч. Средняя скорость: 77,4:6=12,9 км/ч.'},
  {id:'l156-5',number:'5',label:'Сколько километров турист прошёл в третий день',answer:'10,2',accepted:['10.2','10,2 км','10.2 км'],placeholder:'км',explanation:'В первый день: 48·0,35=16,8 км. Это 80% второго дня, значит второй день: 16,8:0,8=21 км. Третий день: 48−16,8−21=10,2 км.'},
  {id:'l156-6',number:'6',label:'Сколько всего страниц в книге',answer:'600',accepted:['600 страниц','600 стр'],placeholder:'страницы',explanation:'После первого дня осталось 60% книги. Во второй день прочитано 60% остатка, то есть 36% всей книги. На третий день осталось 24%. Если 24% = 144 страницы, то вся книга: 144:0,24=600 страниц.'},
];

export const lessonOneHundredFiftySixStages:ControlWorkNineStage[]=[
  {id:'l156-rules',kind:'intro',eyebrow:'Контрольная работа № 9 · вариант 1',title:'Среднее арифметическое. Проценты',body:'6 заданий · 6 оцениваемых итоговых ответов · 45 минут. Калькулятор не используется. Правильные ответы, решения и подсказки скрыты до сдачи всей работы.'},
  {id:'l156-task1',kind:'task',eyebrow:'Задание 1 из 6',title:'Среднее арифметическое',body:'Найдите среднее арифметическое чисел 32,6; 38,5; 34; 35,3.',fieldIds:['l156-1']},
  {id:'l156-task2',kind:'task',eyebrow:'Задание 2 из 6',title:'Проценты от числа',body:'Площадь поля равна 300 га. Рожью засеяли 18% поля. Сколько гектаров поля засеяли рожью?',fieldIds:['l156-2']},
  {id:'l156-task3',kind:'task',eyebrow:'Задание 3 из 6',title:'Нахождение числа по его процентам',body:'Петя купил книгу за 90 р., что составляет 30% всех денег, которые у него были. Сколько денег было у Пети?',fieldIds:['l156-3']},
  {id:'l156-task4',kind:'task',eyebrow:'Задание 4 из 6',title:'Средняя скорость',body:'Лодка плыла 2 ч со скоростью 12,3 км/ч и 4 ч со скоростью 13,2 км/ч. Найдите среднюю скорость лодки на всём пути.',fieldIds:['l156-4']},
  {id:'l156-task5',kind:'task',eyebrow:'Задание 5 из 6',title:'Три дня пути',body:'Турист прошёл за три дня 48 км. В первый день он прошёл 35% всего маршрута. Путь, пройденный в первый день, составляет 80% расстояния, пройденного во второй день. Сколько километров прошёл турист в третий день?',fieldIds:['l156-5']},
  {id:'l156-task6',kind:'task',eyebrow:'Задание 6 из 6',title:'Проценты от остатка',body:'В первый день Петя прочитал 40% всей книги, во второй — 60% остального, а в третий — оставшиеся 144 страницы. Сколько всего страниц в книге?',fieldIds:['l156-6']},
  {id:'l156-submit',kind:'submit',eyebrow:'Перед сдачей',title:'Финальная самопроверка',body:'Проверьте все 6 ответов. До сдачи можно вернуться к любому заданию и изменить ответ. После сдачи первичный результат фиксируется.'},
  {id:'l156-summary',kind:'summary',eyebrow:'Результат',title:'Контрольная работа № 9',body:'Первичный результат сохранён. Ошибки можно исправить в отдельном режиме, не меняя первичный балл.'},
];
export const lessonOneHundredFiftySixTaskCount=6;
export const lessonOneHundredFiftySixResponseCount=lessonOneHundredFiftySixFields.length;
if(lessonOneHundredFiftySixTaskCount!==6||lessonOneHundredFiftySixResponseCount!==6||lessonOneHundredFiftySixStages.length!==9)throw new Error('Lesson 156 control contract broken');
