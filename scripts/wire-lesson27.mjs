import fs from 'node:fs';
import path from 'node:path';

const read=(file)=>fs.readFileSync(file,'utf8');
const write=(file,content)=>{fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,content)};
const replaceRequired=(text,from,to,label=from)=>{if(!text.includes(from))throw new Error(`Missing pattern: ${label}`);return text.replace(from,to)};
const replaceAllRequired=(text,from,to,label=from)=>{if(!text.includes(from))throw new Error(`Missing pattern: ${label}`);return text.split(from).join(to)};

const stages=`export const lessonTwentySevenStages:Stage[]=[
  {id:'l27-mission',kind:'story',eyebrow:'Урок 27 · § 8 · обобщение',title:'Собираем вычитание в единую систему',body:'Сегодня новых правил не вводим. Задача урока — научиться выбирать способ решения осознанно: понимать смысл вычитания, уверенно считать многозначные числа, распознавать тип текстовой задачи, работать с неизвестными компонентами и проверять результат.',note:'Технологическая карта урока 27: обобщение и систематизация навыков вычитания натуральных чисел; углубление арифметического решения текстовых задач.',sourceTag:'Мерзляк · § 8 · технологическая карта урока 27',visual:'algorithm'},
  {id:'l27-map',kind:'guided',eyebrow:'Карта темы',title:'Три числа — одна связь',body:'В записи a − b = c число a — уменьшаемое, b — вычитаемое, c — разность. Если вычисление верно, то b + c = a. Эта связь помогает не только проверять ответ, но и восстанавливать неизвестный компонент.',activity:{id:'l27-a1',type:'choice',prompt:'В равенстве 12 608 − 4 759 = 7 849 какое число является разностью?',options:['12 608','4 759','7 849','17 367'],answer:'7 849',explanation:'Разность — результат вычитания, здесь это 7 849.'},visual:'check'},
  {id:'l27-strategy',kind:'model',eyebrow:'Стратегия',title:'Сначала смысл, потом вычисление',body:'Перед каждым примером или задачей задай себе четыре вопроса: что известно, что нужно найти, почему здесь нужно вычитание и как я проверю ответ. Такой порядок защищает от ошибки выбора действия ещё до столбика.',visual:'algorithm'},
  {id:'l27-practice1',kind:'practice',eyebrow:'Практика · 1/6',title:'Вычисление + обратная связь',body:'Найди разность и мысленно проверь её сложением.',activity:{id:'l27-p1',type:'input',prompt:'12 608 − 4 759 = ?',answer:'7849',placeholder:'Ответ',explanation:'12 608 − 4 759 = 7 849; проверка: 7 849 + 4 759 = 12 608.'},visual:'check'},
  {id:'l27-story',kind:'model',eyebrow:'Текстовая задача',title:'Несколько событий — несколько осмысленных шагов',body:'Если количество уменьшается несколько раз, не пытайся угадывать одно «волшебное действие». После каждого события обновляй текущее количество и только потом переходи к следующему шагу.',note:'Правила вычитания суммы из числа здесь ещё не вводим — это материал следующего урока.',visual:'story'},
  {id:'l27-practice2',kind:'practice',eyebrow:'Практика · 2/6',title:'Два последовательных расхода',body:'На складе было 45 800 кг крупы. Утром отправили 12 675 кг, после обеда ещё 9 840 кг.',activity:{id:'l27-p2',type:'input',prompt:'Сколько килограммов осталось?',answer:'23285',placeholder:'кг',explanation:'45 800 − 12 675 = 33 125; 33 125 − 9 840 = 23 285 кг.'},visual:'story'},
  {id:'l27-difference',kind:'model',eyebrow:'Разностное сравнение',title:'«На сколько?» требует сначала определить большее',body:'При разностном сравнении из большего количества вычитают меньшее. Поэтому до вычисления важно сравнить величины, а не механически брать числа в порядке появления в условии.',visual:'difference'},
  {id:'l27-practice3',kind:'practice',eyebrow:'Практика · 3/6',title:'Сравни две величины',body:'В одной школе 24 506 книг, в другой — 18 937.',activity:{id:'l27-p3',type:'input',prompt:'На сколько книг в первой школе больше?',answer:'5569',placeholder:'Книг',explanation:'24 506 − 18 937 = 5 569.'},visual:'difference'},
  {id:'l27-unknown',kind:'model',eyebrow:'Неизвестный компонент',title:'Неизвестное не нужно угадывать',body:'Если известно уменьшаемое и разность, вычитаемое можно восстановить: вычитаемое + разность = уменьшаемое. Это тот же смысл обратного действия, а не отдельное правило для запоминания.',visual:'check'},
  {id:'l27-practice4',kind:'practice',eyebrow:'Практика · 4/6',title:'Найди неизвестное вычитаемое',body:'Реши через связь компонентов действия.',activity:{id:'l27-p4',type:'input',prompt:'32 000 − x = 18 475. Чему равно x?',answer:'13525',placeholder:'x',explanation:'x = 32 000 − 18 475 = 13 525; проверка: 13 525 + 18 475 = 32 000.'},visual:'check'},
  {id:'l27-units',kind:'model',eyebrow:'Именованные величины',title:'Сначала одна единица измерения',body:'Километры и метры, метры и сантиметры нельзя вычитать как независимые колонки. Сначала переведи величины в одну удобную единицу, выполни вычитание и только потом при необходимости верни составную запись.',visual:'algorithm'},
  {id:'l27-practice5',kind:'practice',eyebrow:'Практика · 5/6',title:'Длина маршрута',body:'Работай в метрах.',activity:{id:'l27-p5',type:'input',prompt:'5 км 240 м − 2 км 785 м = сколько метров?',answer:'2455',placeholder:'м',explanation:'5 км 240 м = 5 240 м; 2 км 785 м = 2 785 м; 5 240 − 2 785 = 2 455 м.'},visual:'difference'},
  {id:'l27-estimate',kind:'model',eyebrow:'Самоконтроль',title:'Прикидка ловит грубую ошибку раньше проверки',body:'До точного вычисления оцени порядок ответа. Например, 800 тысяч минус примерно 370 тысяч должно дать немного больше 400 тысяч. Ответ 43 тысячи или 730 тысяч сразу подозрителен.',visual:'error'},
  {id:'l27-practice6',kind:'practice',eyebrow:'Практика · 6/6',title:'Большие числа без потери разрядов',body:'Сначала оцени ответ, затем вычисли точно.',activity:{id:'l27-p6',type:'input',prompt:'800 000 − 367 458 = ?',answer:'432542',placeholder:'Ответ',explanation:'800 000 − 367 458 = 432 542; результат согласуется с предварительной оценкой.'},visual:'zeros'},
  {id:'l27-error',kind:'guided',eyebrow:'Коррекция',title:'Хорошая проверка должна разоблачать ошибку',body:'Ученик получил 60 002 − 18 765 = 51 237.',activity:{id:'l27-a2',type:'choice',prompt:'Какой контроль надёжнее всего покажет ошибку?',options:['Сложить 51 237 и 18 765','Посмотреть, что ответ пятизначный','Повторить тот же столбик быстрее','Сравнить только последние цифры'],answer:'Сложить 51 237 и 18 765',explanation:'Обратное сложение не возвращает 60 002. Правильная разность — 41 237.'},visual:'error'},
  {id:'l27-system',kind:'model',eyebrow:'Система § 8',title:'Пять шагов зрелого решения',body:'1) Определи математическую связь. 2) Оцени ожидаемый результат. 3) Выровняй разряды или единицы измерения. 4) Вычисли. 5) Проверь обратным действием и смыслом условия.',visual:'algorithm'},
  {id:'l27-quiz1',kind:'quiz',eyebrow:'Контроль · 1/5',title:'Соседние числа',body:'Без подсказки.',activity:{id:'l27-q1',type:'input',prompt:'100 000 − 99 999 = ?',answer:'1',placeholder:'Ответ',explanation:'100 000 и 99 999 — соседние натуральные числа, их разность равна 1.'},visual:'column'},
  {id:'l27-quiz2',kind:'quiz',eyebrow:'Контроль · 2/5',title:'Неизвестная использованная часть',body:'Из 50 000 деталей после работы осталось 12 850.',activity:{id:'l27-q2',type:'input',prompt:'Сколько деталей использовали?',answer:'37150',placeholder:'Деталей',explanation:'50 000 − 12 850 = 37 150.'},visual:'story'},
  {id:'l27-quiz3',kind:'quiz',eyebrow:'Контроль · 3/5',title:'Восстанови уменьшаемое',body:'Используй обратное действие.',activity:{id:'l27-q3',type:'input',prompt:'x − 18 725 = 42 680. Чему равно x?',answer:'61405',placeholder:'x',explanation:'x = 42 680 + 18 725 = 61 405.'},visual:'check'},
  {id:'l27-quiz4',kind:'quiz',eyebrow:'Контроль · 4/5',title:'Единицы длины',body:'Ответ дай в сантиметрах.',activity:{id:'l27-q4',type:'input',prompt:'7 м 5 см − 2 м 78 см = сколько сантиметров?',answer:'427',placeholder:'см',explanation:'705 см − 278 см = 427 см.'},visual:'difference'},
  {id:'l27-quiz5',kind:'quiz',eyebrow:'Контроль · 5/5',title:'Проверка результата',body:'Выбери равенство, которое подтверждает вычисление 73 000 − 28 459.',activity:{id:'l27-q5',type:'choice',prompt:'Какой вариант верен?',options:['44 541 + 28 459 = 73 000','44 541 − 28 459 = 73 000','73 000 + 28 459 = 44 541','28 459 − 44 541 = 73 000'],answer:'44 541 + 28 459 = 73 000',explanation:'Разность 44 541 плюс вычитаемое 28 459 возвращают уменьшаемое 73 000.'},visual:'check'},
  {id:'l27-challenge',kind:'challenge',eyebrow:'Задача повышенной сложности',title:'Восстанови скрытый второй шаг',body:'Маршрут экспедиции — 120 000 м. В первый день прошли 38 750 м. После второго дня осталось пройти 47 680 м.',activity:{id:'l27-c1',type:'input',prompt:'Сколько метров прошли во второй день?',answer:'33570',placeholder:'м',explanation:'После первого дня оставалось 120 000 − 38 750 = 81 250 м. Второй день: 81 250 − 47 680 = 33 570 м.'},visual:'challenge'},
  {id:'l27-reflect',kind:'model',eyebrow:'Самооценка',title:'Можешь ли ты объяснить выбор действия?',body:'Проверь себя не по скорости. Ты готов к следующему уроку, если можешь словами объяснить, почему вычитаешь именно эти величины, как восстанавливаешь неизвестный компонент и чем подтверждаешь ответ.',visual:'algorithm'},
  {id:'l27-summary',kind:'summary',eyebrow:'Итог урока 27',title:'Базовое вычитание систематизировано',body:'Ты собрал в одну систему смысл вычитания, письменный алгоритм, текстовые модели, неизвестные компоненты, именованные величины, прикидку и обратную проверку.',note:'После основной части обязательны 20 курируемых заданий. Новые правила преобразования разностей начнутся только в уроке 28.',sourceTag:'Мерзляк · § 8 · урок 27 · обобщение и систематизация'},
];`;

let player=read('src/NaturalNumberSubtractionPracticePlayer.tsx');
player=replaceAllRequired(player,'lessonTwentySixStages','lessonTwentySevenStages','lesson stage identifier');
player=replaceAllRequired(player,'NaturalNumberSubtractionPracticePlayer','NaturalNumberSubtractionGeneralizationPlayer','player identifier');
player=replaceRequired(player,"const KEY='mathnikita-lesson-26-progress-v1';","const KEY='mathnikita-lesson-27-progress-v1';",'lesson storage key');
player=player.replace(/export const lessonTwentySevenStages:Stage\[\]=\[[\s\S]*?\n\];\n\nfunction load/,`${stages}\n\nfunction load`);
player=replaceRequired(player,'detail?.lessonNumber!==26','detail?.lessonNumber!==27','stage jump lesson number');
player=replaceAllRequired(player,'Контроль урока 26','Контроль урока 27','quiz label');
player=replaceRequired(player,'<span>Урок 26 · § 8 · закрепление</span>','<span>Урок 27 · § 8 · обобщение</span>','lesson header kicker');
player=replaceRequired(player,'<h1>Вычитание натуральных чисел — закрепление</h1>','<h1>Вычитание натуральных чисел — обобщение</h1>','lesson header title');
player=replaceRequired(player,'<p>Точность вычислений, текстовые задачи, разностное сравнение и проверка.</p>','<p>Система вычитания: модели задач, неизвестные компоненты, величины, оценка и проверка.</p>','lesson header subtitle');
player=replaceRequired(player,'≈ 48 минут','≈ 50 минут','lesson duration');
player=player.replace('найди остаток после первого расхода','выполни первый осмысленный шаг').replace('вычти второй расход','восстанови скрытый второй шаг');
write('src/NaturalNumberSubtractionGeneralizationPlayer.tsx',player);

write('src/LessonTwentySevenOpening.ts',`import type { LessonOpeningData } from './LessonOpening';

export const lessonTwentySevenOpening: LessonOpeningData = {
  kicker:'Урок 27 · глава 2 · § 8 · обобщение',
  title:'Вычитание натуральных чисел — обобщение',
  intro:'Два предыдущих урока дали смысл и технику вычитания. Теперь собираем всё в систему: выбираем правильную модель задачи, восстанавливаем неизвестные компоненты, работаем с величинами, оцениваем ответ и проверяем его обратным действием.',
  question:'Как понять, какое именно вычитание скрыто в задаче, и доказать, что найденный ответ действительно верен?',
  goals:[
    'систематизировать смысл, компоненты и письменный алгоритм вычитания натуральных чисел',
    'распознавать задачи на остаток, разностное сравнение и неизвестную часть',
    'восстанавливать неизвестные компоненты через связь сложения и вычитания',
    'вычитать именованные величины после приведения к общей единице',
    'использовать прикидку и обратное действие для независимой проверки результата',
  ],
  durationMinutes:50,
  icon:'➖',
};
`);

write('src/data/extendedPracticeLesson27.ts',`import { choiceTask as choice, inputTask as input, multiInputTask as multi, type ExtendedPracticeSet } from './extendedPracticeTypes';

export const extendedPracticeLesson27: ExtendedPracticeSet = {
  title:'Тренировочная мастерская урока 27: система вычитания',
  subtitle:'20 задач на вычисления, текстовые модели, неизвестные компоненты, величины, оценку и независимую проверку.',
  estimatedMinutes:24,
  tasks:[
    input('l27-extra-1','Вычисли: 48 205 − 19 768.',['28437','28 437'],'Сначала оцени: ответ должен быть немного меньше 30 тысяч.','48 205 − 19 768 = 28 437.'),
    input('l27-extra-2','Вычисли: 300 000 − 184 759.',['115241','115 241'],'Следи за разменом через нули.','300 000 − 184 759 = 115 241.'),
    multi('l27-extra-3','Вычисли и проверь: 96 400 − 37 856.',[
      {id:'difference',label:'Разность',answers:['58544','58 544']},
      {id:'check',label:'Разность + 37 856',answers:['96400','96 400']},
    ],'Обратная проверка должна вернуть 96 400.','96 400 − 37 856 = 58 544; 58 544 + 37 856 = 96 400.'),
    choice('l27-extra-4','Как называется число 96 400 в записи 96 400 − 37 856 = 58 544?',['Уменьшаемое','Вычитаемое','Разность','Слагаемое'],'Уменьшаемое','Это число, из которого вычитают.','96 400 — уменьшаемое.'),
    input('l27-extra-5','Найди x: 54 000 − x = 23 675.',['30325','30 325'],'Неизвестное вычитаемое можно найти из связи компонентов.','x = 54 000 − 23 675 = 30 325.'),
    input('l27-extra-6','Найди x: x − 28 450 = 17 980.',['46430','46 430'],'Уменьшаемое восстанавливается сложением.','x = 28 450 + 17 980 = 46 430.'),
    input('l27-extra-7','В магазине было 75 000 тетрадей, продали 28 760. Сколько осталось?',['46240','46 240'],'Остаток = было − продали.','75 000 − 28 760 = 46 240.'),
    input('l27-extra-8','В двух фондах 41 560 и 37 895 книг. На сколько в первом фонде больше?',['3665','3 665'],'Для вопроса «на сколько?» вычти меньшее из большего.','41 560 − 37 895 = 3 665.'),
    input('l27-extra-9','Вычисли в метрах: 8 км 320 м − 3 км 745 м.',['4575','4 575'],'Переведи обе длины в метры.','8 320 − 3 745 = 4 575 м.'),
    choice('l27-extra-10','Какой результат разумнее ожидать для 90 100 − 39 870 до точного вычисления?',['Около 50 000','Около 5 000','Около 130 000','Меньше 100'],'Около 50 000','90 тысяч минус примерно 40 тысяч — это примерно 50 тысяч.','Прикидка даёт ориентир около 50 000.'),
    input('l27-extra-11','Вычисли: 1 000 004 − 999 876.',['128'],'Не пугайся больших чисел: разность здесь мала.','1 000 004 − 999 876 = 128.'),
    choice('l27-extra-12','Ученик получил 80 000 − 35 678 = 54 322. Как лучше проверить ответ?',['Сложить 54 322 и 35 678','Ещё раз быстро вычесть тем же способом','Посмотреть только число нулей','Поменять числа местами'],'Сложить 54 322 и 35 678','Обратное действие — независимая проверка.','54 322 + 35 678 = 90 000, а не 80 000, значит ответ неверен.'),
    multi('l27-extra-13','Было 64 500 деталей. Сначала использовали 18 250, затем ещё 12 775. Найди промежуточный и конечный остаток.',[
      {id:'after-first',label:'После первого расхода',answers:['46250','46 250']},
      {id:'after-second',label:'После второго расхода',answers:['33475','33 475']},
    ],'Обновляй количество после каждого события.','64 500 − 18 250 = 46 250; 46 250 − 12 775 = 33 475.'),
    choice('l27-extra-14','Если a − b = c, какое равенство обязательно верно?',['b + c = a','a + b = c','c − b = a','a + c = b'],'b + c = a','Вычитание проверяется обратным сложением.','Разность плюс вычитаемое дают уменьшаемое.'),
    input('l27-extra-15','Вычисли: 70 000 − 69 999.',['1'],'Это соседние числа.','70 000 − 69 999 = 1.'),
    input('l27-extra-16','В равенстве 8□0 − 465 = 375 пропущена цифра. Найди её.',['4'],'Сначала восстанови уменьшаемое: 375 + 465.','375 + 465 = 840, значит пропущена цифра 4.'),
    input('l27-extra-17','На складе было 92 300 кг. После отгрузки осталось 47 685 кг. Сколько килограммов отгрузили?',['44615','44 615'],'Неизвестная часть = было − осталось.','92 300 − 47 685 = 44 615 кг.'),
    multi('l27-extra-18','Сравни 63 010 и 58 765, затем проверь разницу сложением.',[
      {id:'difference',label:'Разница',answers:['4245','4 245']},
      {id:'check',label:'58 765 + разница',answers:['63010','63 010']},
    ],'Большое количество минус меньшее даёт разницу.','63 010 − 58 765 = 4 245; 58 765 + 4 245 = 63 010.'),
    input('l27-extra-19','Вычисли в сантиметрах: 10 м − 3 м 48 см.',['652'],'10 м = 1 000 см; 3 м 48 см = 348 см.','1 000 − 348 = 652 см.'),
    input('l27-extra-20','Задача повышенной сложности. Всего было 150 000 мл раствора. Сначала использовали 48 750 мл. После второго использования осталось 62 430 мл. Сколько использовали во второй раз?',['38820','38 820'],'Найди остаток после первого шага, затем сравни его с конечным остатком.','150 000 − 48 750 = 101 250; 101 250 − 62 430 = 38 820 мл.'),
  ],
};
`);

let data=read('src/data/extendedPracticeData.ts');
data=replaceRequired(data,"import { extendedPracticeLesson26 } from './extendedPracticeLesson26';","import { extendedPracticeLesson26 } from './extendedPracticeLesson26';\nimport { extendedPracticeLesson27 } from './extendedPracticeLesson27';",'practice import');
data=replaceRequired(data,'  26:extendedPracticeLesson26,','  26:extendedPracticeLesson26,\n  27:extendedPracticeLesson27,','practice registry');
data=replaceRequired(data,'  26:[],\n};','  26:[],\n  27:[],\n};','mastery registry');
write('src/data/extendedPracticeData.ts',data);

let yearPlan=read('src/data/yearPlan.ts');
yearPlan=replaceRequired(yearPlan,'available:segment.from + offset <= 26','available:segment.from + offset <= 27','year plan availability');
write('src/data/yearPlan.ts',yearPlan);

let catalog=read('src/CourseCatalog.tsx');
catalog=replaceRequired(catalog,"  26:'Закрепление § 8: точное письменное вычитание, переход через разряд и нули, арифметические текстовые задачи, разностное сравнение и проверка сложением.',\n};","  26:'Закрепление § 8: точное письменное вычитание, переход через разряд и нули, арифметические текстовые задачи, разностное сравнение и проверка сложением.',\n  27:'Обобщение § 8: система компонентов вычитания, многозначные вычисления, текстовые модели, неизвестные компоненты, именованные величины, прикидка и самопроверка.',\n};",'catalog lesson description');
catalog=replaceAllRequired(catalog,'Полностью готовы 26 интерактивных уроков.','Полностью готовы 27 интерактивных уроков.','catalog ready count');
write('src/CourseCatalog.tsx',catalog);

let app=read('src/App.tsx');
app=replaceRequired(app,"i===1?'6 уроков готовы'","i===1?'7 уроков готовы'",'map ready count');
write('src/App.tsx',app);

let shell=read('src/LessonCourseShell.tsx');
shell=replaceRequired(shell,"import { NaturalNumberSubtractionPracticePlayer } from './NaturalNumberSubtractionPracticePlayer';","import { NaturalNumberSubtractionPracticePlayer } from './NaturalNumberSubtractionPracticePlayer';\nimport { NaturalNumberSubtractionGeneralizationPlayer } from './NaturalNumberSubtractionGeneralizationPlayer';",'shell player import');
shell=replaceRequired(shell,"import { lessonTwentySixOpening } from './LessonTwentySixOpening';","import { lessonTwentySixOpening } from './LessonTwentySixOpening';\nimport { lessonTwentySevenOpening } from './LessonTwentySevenOpening';",'shell opening import');
shell=replaceRequired(shell,'const readyLessons=[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26];','const readyLessons=[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27];','shell ready list');
shell=replaceRequired(shell,'    selectedLesson===26?lessonTwentySixOpening:\n    buildGenericOpening(lesson);','    selectedLesson===26?lessonTwentySixOpening:\n    selectedLesson===27?lessonTwentySevenOpening:\n    buildGenericOpening(lesson);','shell opening switch');
shell=replaceRequired(shell,'  const runtime=\n    selectedLesson===26?<NaturalNumberSubtractionPracticePlayer key="lesson-26"/>:','  const runtime=\n    selectedLesson===27?<NaturalNumberSubtractionGeneralizationPlayer key="lesson-27"/>:\n    selectedLesson===26?<NaturalNumberSubtractionPracticePlayer key="lesson-26"/>:','shell runtime switch');
write('src/LessonCourseShell.tsx',shell);

let navigator=read('src/LessonPageNavigator.tsx');
navigator=replaceRequired(navigator,"import { lessonTwentySixStages } from './NaturalNumberSubtractionPracticePlayer';","import { lessonTwentySixStages } from './NaturalNumberSubtractionPracticePlayer';\nimport { lessonTwentySevenStages } from './NaturalNumberSubtractionGeneralizationPlayer';",'navigator import');
navigator=replaceRequired(navigator,"const groups26:PageGroup[]=[{label:'Разминка и точность',indexes:[0,1,2,3,4,5]},{label:'Текстовые задачи и проверка',indexes:[6,7,8,9,10,11,12,13,14,15]},{label:'Самостоятельный контроль',indexes:[16,17,18,19,20]},{label:'Задача повышенной сложности и итог',indexes:[21,22,23]}];","const groups26:PageGroup[]=[{label:'Разминка и точность',indexes:[0,1,2,3,4,5]},{label:'Текстовые задачи и проверка',indexes:[6,7,8,9,10,11,12,13,14,15]},{label:'Самостоятельный контроль',indexes:[16,17,18,19,20]},{label:'Задача повышенной сложности и итог',indexes:[21,22,23]}];\nconst groups27:PageGroup[]=[{label:'Система вычитания',indexes:[0,1,2]},{label:'Модели, компоненты и величины',indexes:[3,4,5,6,7,8,9,10,11,12,13,14,15]},{label:'Самостоятельный контроль',indexes:[16,17,18,19,20]},{label:'Задача повышенной сложности и итог',indexes:[21,22,23]}];",'navigator groups');
navigator=replaceRequired(navigator,'24:lessonTwentyFourStages,25:lessonTwentyFiveStages,26:lessonTwentySixStages,','24:lessonTwentyFourStages,25:lessonTwentyFiveStages,26:lessonTwentySixStages,27:lessonTwentySevenStages,','navigator pages map');
navigator=replaceRequired(navigator,'24:groups24,25:groups25,26:groups26,','24:groups24,25:groups25,26:groups26,27:groups27,','navigator groups map');
navigator=replaceRequired(navigator,'for(let lessonNumber=26;lessonNumber>=2;lessonNumber-=1)','for(let lessonNumber=27;lessonNumber>=2;lessonNumber-=1)','navigator active max');
write('src/LessonPageNavigator.tsx',navigator);

let voice=read('src/VoiceNarrator.tsx');
voice=replaceRequired(voice,"lessonNumber>26","lessonNumber>27",'voice lesson max');
write('src/VoiceNarrator.tsx',voice);

let ipad=read('tests/lesson-twenty-six-ipad.spec.ts');
ipad=ipad.split('26').join('27');
ipad=ipad.replace('§8 reinforcement lesson','§8 generalization lesson').replaceAll('reinforcement','generalization');
ipad=ipad.replaceAll('Вычитание натуральных чисел — закрепление','Вычитание натуральных чисел — обобщение');
ipad=ipad.replace(/const answers:Record<string,Answer>=\{[\s\S]*?\n\};\n\nasync function openLesson/,`const answers:Record<string,Answer>={
  'l27-map':{type:'choice',value:'7 849'},
  'l27-practice1':{type:'input',value:'7849'},
  'l27-practice2':{type:'input',value:'23285'},
  'l27-practice3':{type:'input',value:'5569'},
  'l27-practice4':{type:'input',value:'13525'},
  'l27-practice5':{type:'input',value:'2455'},
  'l27-practice6':{type:'input',value:'432542'},
  'l27-error':{type:'choice',value:'Сложить 51 237 и 18 765'},
  'l27-quiz1':{type:'input',value:'1'},
  'l27-quiz2':{type:'input',value:'37150'},
  'l27-quiz3':{type:'input',value:'61405'},
  'l27-quiz4':{type:'input',value:'427'},
  'l27-quiz5':{type:'choice',value:'44 541 + 28 459 = 73 000'},
  'l27-challenge':{type:'input',value:'33570'},
};

async function openLesson`);
ipad=ipad.replaceAll("[data-stage-id=\"l27-mission\"]","[data-stage-id=\"l27-mission\"]");
ipad=ipad.replaceAll("[data-stage-id=\"l27-warmup\"]","[data-stage-id=\"l27-map\"]");
ipad=ipad.replaceAll("37154","23285").replaceAll("37155","23286");
write('tests/lesson-twenty-seven-ipad.spec.ts',ipad);

let voiceTest=read('tests/lesson-twenty-six-voice.spec.ts').split('26').join('27');
voiceTest=voiceTest.replaceAll('l27-warmup','l27-map');
write('tests/lesson-twenty-seven-voice.spec.ts',voiceTest);

let coursePlan=read('tests/course-plan.spec.ts');
coursePlan=replaceRequired(coursePlan,"  await expect(lessons.nth(25)).toContainText('Вычитание натуральных чисел');","  await expect(lessons.nth(25)).toContainText('Вычитание натуральных чисел');\n  await expect(lessons.nth(26)).toContainText('Вычитание натуральных чисел');",'course plan lesson 27 topic');
coursePlan=replaceRequired(coursePlan,'  await expect(lessons.nth(25)).toBeEnabled();\n  await expect(lessons.nth(26)).toBeDisabled();','  await expect(lessons.nth(25)).toBeEnabled();\n  await expect(lessons.nth(26)).toBeEnabled();\n  await expect(lessons.nth(27)).toBeDisabled();','course plan availability boundary');
write('tests/course-plan.spec.ts',coursePlan);

let quality=read('tests/pedagogical-practice-quality.spec.ts');
quality=replaceRequired(quality,'lessonNumber<=26','lessonNumber<=27','pedagogical quality max');
write('tests/pedagogical-practice-quality.spec.ts',quality);

let count=read('tests/extended-practice-count.spec.ts');
count=replaceRequired(count,'lessonNumber<=23','lessonNumber<=27','practice count max');
write('tests/extended-practice-count.spec.ts',count);

let allPractice=read('tests/extended-practice-all-lessons.spec.ts');
allPractice=replaceRequired(allPractice,'process.env.PRACTICE_END??24','process.env.PRACTICE_END??27','full practice default max');
write('tests/extended-practice-all-lessons.spec.ts',allPractice);

for(const file of fs.readdirSync('tests').filter(name=>name.endsWith('.spec.ts'))){
  const full=path.join('tests',file);let text=read(full);const before=text;
  text=text.split("button.is-interactive')).toHaveCount(25)").join("button.is-interactive')).toHaveCount(26)");
  text=text.split("button:not([disabled])')).toHaveCount(26)").join("button:not([disabled])')).toHaveCount(27)");
  text=text.split('Полностью готовы 26 интерактивных уроков.').join('Полностью готовы 27 интерактивных уроков.');
  if(text!==before)write(full,text);
}

let workflow=read('.github/workflows/course-1-23-certification.yml');
workflow=workflow.split('Course 1-26 certification').join('Course 1-27 certification');
workflow=workflow.split('course-1-26-certification').join('course-1-27-certification');
workflow=workflow.split('1-26').join('1-27');
workflow=workflow.split('17-26').join('17-27');
workflow=workflow.split('IPAD_17_26').join('IPAD_17_27');
workflow=workflow.split('ipad-17-26').join('ipad-17-27');
workflow=workflow.split('tests/lesson-twenty-six-ipad.spec.ts').join('tests/lesson-twenty-six-ipad.spec.ts\n          tests/lesson-twenty-seven-ipad.spec.ts');
workflow=workflow.split('tests/lesson-twenty-six-voice.spec.ts').join('tests/lesson-twenty-six-voice.spec.ts\n          tests/lesson-twenty-seven-voice.spec.ts');
write('.github/workflows/course-1-23-certification.yml',workflow);

console.log('Lesson 27 wired successfully');
