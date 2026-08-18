import {useEffect,useMemo,useState} from 'react';
import './lessonPlayer.css';
import './theoryExperience.css';
import './additionProperties.css';
import './rectanglePractice.css';

type Activity={id:string;type:'choice'|'input';prompt:string;options?:string[];answer:string|string[];explanation:string;hint:string;placeholder?:string};
type Diagram=
  |{type:'panel';kind:'reverse'|'equal'|'counting'|'wire-targets'|'composite'|'final'}
  |{type:'perimeter';source:string;shape:'rectangle'|'square';widthLabel:string;heightLabel:string;perimeter:string}
  |{type:'square-count';variant:'a'|'b'}
  |{type:'wire'}
  |{type:'mosaic';variant:'textbook-139'|'workbook-164'}
  |{type:'partition';variant:'three-rectangles'|'two-squares'|'diagonals'};
type Stage={id:string;title:string;eyebrow:string;kind:'story'|'model'|'guided'|'practice'|'quiz'|'challenge'|'summary';body:string;note?:string;activity?:Activity;diagram?:Diagram};
type Saved={version:1;stageIndex:number;responses:Record<string,string>;checked:Record<string,boolean>;results:Record<string,boolean>;attempts:Record<string,number>};
type StageJumpDetail={lessonNumber?:number;stageIndex?:number};

const KEY='mathnikita-lesson-50-progress-v1';
const normalized=(value:string)=>value.trim().toLocaleUpperCase('ru-RU').replace(/Ё/g,'Е').replace(/[−–—]/g,'-').replace(/[×·]/g,'X').replace(/\s+/g,'').replace(/(?:СМ|ММ|ДМ|[.])$/,'');
const answerMatches=(response:string,answer:string|string[])=>{const variants=Array.isArray(answer)?answer:[answer];return variants.some(item=>normalized(response)===normalized(item))};

export const lessonFiftyStages:Stage[]=[
  {id:'l50-mission',kind:'story',eyebrow:'Урок 50 · § 15 · практика',title:'Одна граница — много способов рассуждать',body:'Маршрут идёт по заданиям № 366–374: обратные задачи на периметр, вложенные квадраты, проволочная модель, мозаика из квадратов и точные разрезания.',note:'Рабочая тетрадь дополняет маршрут задачами № 158–160 и 164. Все схемы повторяют данные источников.',diagram:{type:'panel',kind:'reverse'}},
  {id:'l50-half-perimeter-model',kind:'model',eyebrow:'Обратный ход',title:'Полупериметр равен сумме соседних сторон',body:'Если P=2(a+b), то a+b=P:2. Поэтому неизвестную сторону находим так: b=P:2−a.',diagram:{type:'panel',kind:'reverse'}},
  {id:'l50-workbook158-half',kind:'practice',eyebrow:'Рабочая тетрадь № 158 · шаг 1',title:'Сначала убери повтор границы',body:'Периметр прямоугольника равен 20 см, одна сторона — 6 см.',activity:{id:'l50-p1',type:'input',prompt:'Чему равна сумма двух соседних сторон, см?',answer:'10',placeholder:'см',hint:'Раздели периметр на 2.',explanation:'20:2=10 см — это полупериметр, то есть сумма соседних сторон.'},diagram:{type:'perimeter',source:'РТ №158',shape:'rectangle',widthLabel:'6 см',heightLabel:'?',perimeter:'20 см'}},
  {id:'l50-workbook158-side',kind:'practice',eyebrow:'Рабочая тетрадь № 158 · шаг 2',title:'Из полупериметра вычти известную сторону',body:'Сумма соседних сторон равна 10 см, одна из них равна 6 см.',activity:{id:'l50-p2',type:'input',prompt:'Найди вторую сторону прямоугольника, см.',answer:'4',placeholder:'см',hint:'10−6.',explanation:'10−6=4 см. Проверка: 2·(6+4)=20 см.'},diagram:{type:'perimeter',source:'РТ №158',shape:'rectangle',widthLabel:'6 см',heightLabel:'4 см',perimeter:'20 см'}},
  {id:'l50-source366-side',kind:'practice',eyebrow:'Учебник № 366 · шаг 1',title:'Соседняя сторона в 4 раза больше',body:'Одна сторона прямоугольника равна 8 см.',activity:{id:'l50-p3',type:'input',prompt:'Чему равна соседняя сторона, см?',answer:'32',placeholder:'см',hint:'Умножь 8 на 4.',explanation:'8·4=32 см.'},diagram:{type:'perimeter',source:'№366',shape:'rectangle',widthLabel:'8 см',heightLabel:'в 4 раза больше',perimeter:'?'}},
  {id:'l50-source366-perimeter',kind:'practice',eyebrow:'Учебник № 366 · шаг 2',title:'Каждая длина встречается дважды',body:'Стороны прямоугольника равны 8 см и 32 см.',activity:{id:'l50-p4',type:'input',prompt:'Найди периметр прямоугольника, см.',answer:'80',placeholder:'см',hint:'Вычисли 2·(8+32).',explanation:'P=2·40=80 см.'},diagram:{type:'perimeter',source:'№366',shape:'rectangle',widthLabel:'32 см',heightLabel:'8 см',perimeter:'80 см'}},
  {id:'l50-source367-square',kind:'practice',eyebrow:'Учебник № 367 · квадрат',title:'Сначала найди общую длину границы',body:'Сторона квадрата равна 12 см. Его периметр равен периметру искомого прямоугольника.',activity:{id:'l50-p5',type:'input',prompt:'Найди периметр квадрата, см.',answer:'48',placeholder:'см',hint:'У квадрата четыре равные стороны.',explanation:'P=4·12=48 см.'},diagram:{type:'perimeter',source:'№367',shape:'square',widthLabel:'12 см',heightLabel:'12 см',perimeter:'48 см'}},
  {id:'l50-equal-perimeter-model',kind:'model',eyebrow:'Равные периметры',title:'Равная граница не означает равные стороны',body:'У квадрата и прямоугольника может быть одинаковый периметр, хотя размеры различаются. Переносим только число P, затем решаем задачу для новой фигуры.',diagram:{type:'panel',kind:'equal'}},
  {id:'l50-source367-side',kind:'practice',eyebrow:'Учебник № 367 · прямоугольник',title:'Полупериметр прямоугольника равен 24 см',body:'Одна сторона прямоугольника равна 8 см, а его периметр — 48 см.',activity:{id:'l50-p6',type:'input',prompt:'Найди неизвестную сторону прямоугольника, см.',answer:'16',placeholder:'см',hint:'48:2−8.',explanation:'48:2−8=24−8=16 см.'},diagram:{type:'perimeter',source:'№367',shape:'rectangle',widthLabel:'16 см',heightLabel:'8 см',perimeter:'48 см'}},
  {id:'l50-source368-rectangle',kind:'practice',eyebrow:'Учебник № 368 · прямоугольник',title:'Граница прямоугольника 42 см × 14 см',body:'Сначала вычисляем периметр исходной фигуры.',activity:{id:'l50-p7',type:'input',prompt:'Найди периметр прямоугольника, см.',answer:'112',placeholder:'см',hint:'Вычисли 2·(42+14).',explanation:'42+14=56, поэтому P=112 см.'},diagram:{type:'perimeter',source:'№368',shape:'rectangle',widthLabel:'42 см',heightLabel:'14 см',perimeter:'112 см'}},
  {id:'l50-source368-square',kind:'practice',eyebrow:'Учебник № 368 · квадрат',title:'Раздели общую границу на четыре равные стороны',body:'Периметр квадрата тоже равен 112 см.',activity:{id:'l50-p8',type:'input',prompt:'Найди сторону квадрата, см.',answer:'28',placeholder:'см',hint:'Раздели 112 на 4.',explanation:'112:4=28 см.'},diagram:{type:'perimeter',source:'№368',shape:'square',widthLabel:'28 см',heightLabel:'28 см',perimeter:'112 см'}},
  {id:'l50-counting-model',kind:'model',eyebrow:'Учебник № 369 · рисунок 137',title:'Считай квадраты по размерам',body:'Надёжный порядок: сначала самые маленькие квадраты, затем составные квадраты каждого следующего размера и в конце внешний квадрат.',diagram:{type:'panel',kind:'counting'}},
  {id:'l50-source369-a',kind:'practice',eyebrow:'Рисунок 137а',title:'Сетка 3 × 3 содержит не только 9 клеток',body:'Нужно учесть квадраты 1×1, 2×2 и 3×3.',activity:{id:'l50-p9',type:'input',prompt:'Сколько всего квадратов изображено на рисунке 137а?',answer:'14',placeholder:'число',hint:'9 маленьких + 4 средних + 1 большой.',explanation:'9+4+1=14 квадратов.'},diagram:{type:'square-count',variant:'a'}},
  {id:'l50-source369-a-layers',kind:'model',eyebrow:'Рисунок 137а · проверка',title:'Три размера дают полный подсчёт',body:'Квадраты распределяются так: 9 размера 1×1, 4 размера 2×2 и 1 размера 3×3. Ни один квадрат не посчитан дважды.',diagram:{type:'square-count',variant:'a'}},
  {id:'l50-source369-b',kind:'practice',eyebrow:'Рисунок 137б',title:'Каждый верхний правый квадрат снова разделён',body:'Внешний квадрат разбит на четыре равных, верхний правый — ещё на четыре, а его верхний правый — ещё на четыре.',activity:{id:'l50-p10',type:'input',prompt:'Сколько всего квадратов изображено на рисунке 137б?',answer:'13',placeholder:'число',hint:'Считай по уровням вложения.',explanation:'1 внешний + 4 больших внутренних + 4 средних + 4 маленьких =13.'},diagram:{type:'square-count',variant:'b'}},
  {id:'l50-source369-b-layers',kind:'quiz',eyebrow:'Рисунок 137б · контроль',title:'Запиши структуру без пропусков',body:'Каждый новый уровень делит ровно один квадрат предыдущего уровня на четыре.',activity:{id:'l50-p11',type:'choice',prompt:'Какая сумма точно описывает рисунок 137б?',options:['1 + 4 + 4 + 4 = 13','4 + 4 = 8','1 + 8 = 9','16 − 4 = 12'],answer:'1 + 4 + 4 + 4 = 13',hint:'Учти внешний квадрат и три группы по четыре.',explanation:'Три вложенных масштаба вместе с внешней границей дают 13 квадратов.'},diagram:{type:'square-count',variant:'b'}},
  {id:'l50-wire-model',kind:'model',eyebrow:'Учебник № 370 · рисунок 138',title:'При сгибании проволоки её длина сохраняется',body:'Проволоку можно изменить по форме, но сумма длин всех её участков остаётся той же. Это и есть периметр новой модели.',diagram:{type:'wire'}},
  {id:'l50-source370-length',kind:'practice',eyebrow:'Рисунок 138 · длина проволоки',title:'Сложи пять сторон исходной модели',body:'Стороны пятиугольника равны 6, 5, 3, 2 и 4 см.',activity:{id:'l50-p12',type:'input',prompt:'Чему равна длина куска проволоки, см?',answer:'20',placeholder:'см',hint:'Сложи все пять подписанных длин.',explanation:'6+5+3+2+4=20 см.'},diagram:{type:'wire'}},
  {id:'l50-source370-square',kind:'practice',eyebrow:'№ 370 · модель 1',title:'Квадрат делит длину на четыре',body:'Для квадрата нужны четыре равные стороны натуральной длины.',activity:{id:'l50-p13',type:'input',prompt:'Какой будет сторона квадрата, см?',answer:'5',placeholder:'см',hint:'20:4.',explanation:'20:4=5 см, поэтому квадрат построить можно.'},diagram:{type:'panel',kind:'wire-targets'}},
  {id:'l50-source370-pentagon',kind:'practice',eyebrow:'№ 370 · модель 2',title:'Равносторонний пятиугольник делит длину на пять',body:'Все пять сторон новой модели должны быть равны.',activity:{id:'l50-p14',type:'input',prompt:'Какой будет сторона пятиугольника, см?',answer:'4',placeholder:'см',hint:'20:5.',explanation:'20:5=4 см, поэтому равносторонний пятиугольник построить можно.'},diagram:{type:'panel',kind:'wire-targets'}},
  {id:'l50-source370-triangle',kind:'quiz',eyebrow:'№ 370 · модель 3',title:'Для равностороннего треугольника нужны три равные целые части',body:'Длины сторон по условию должны выражаться натуральным числом сантиметров.',activity:{id:'l50-p15',type:'choice',prompt:'Можно ли сделать требуемый равносторонний треугольник?',options:['Нет, 20 не делится на 3','Да, сторона будет 6 см','Да, сторона будет 7 см','Нет, потому что треугольник имеет четыре стороны'],answer:'Нет, 20 не делится на 3',hint:'Проверь делимость общей длины на число сторон.',explanation:'20 не делится на 3 нацело, поэтому натуральной длины каждой стороны не получится.'},diagram:{type:'panel',kind:'wire-targets'}},
  {id:'l50-source370-result',kind:'model',eyebrow:'№ 370 · вывод',title:'Подходят модели 1 и 2',body:'Из проволоки длиной 20 см получатся квадрат со стороной 5 см и равносторонний пятиугольник со стороной 4 см. Требуемый треугольник не получится.',diagram:{type:'panel',kind:'wire-targets'}},
  {id:'l50-workbook159',kind:'practice',eyebrow:'Рабочая тетрадь № 159',title:'Проволока от квадрата со стороной 16 см',body:'Длина проволоки равна 64 см. Сравни периметры прямоугольников 18×14 и 12×22.',activity:{id:'l50-p16',type:'choice',prompt:'Какой прямоугольник можно сделать из этого куска?',options:['Только 18 см × 14 см','Только 12 см × 22 см','Оба прямоугольника','Ни один'],answer:'Только 18 см × 14 см',hint:'Сравни 2·(18+14) и 2·(12+22) с 64.',explanation:'2·(18+14)=64, а 2·(12+22)=68. Подходит только первая модель.'},diagram:{type:'perimeter',source:'РТ №159',shape:'square',widthLabel:'16 см',heightLabel:'16 см',perimeter:'64 см'}},
  {id:'l50-source371-model',kind:'model',eyebrow:'Учебник № 371 · рисунок 139',title:'Восстанови размеры по полосам квадратов',body:'Сверху стоят четыре квадрата со стороной 7 см. Снизу — два квадрата со стороной 12 см и справа три квадрата со стороной 4 см.',diagram:{type:'mosaic',variant:'textbook-139'}},
  {id:'l50-source371-sides',kind:'practice',eyebrow:'Рисунок 139 · размеры ABCD',title:'Одна сторона складывается по горизонтали, другая — по вертикали',body:'Ширина равна 4·7=28 см. Высота равна 7+12=19 см; справа это проверяется суммой 7+3·4.',activity:{id:'l50-p17',type:'input',prompt:'Запиши длины сторон прямоугольника через «и», см.',answer:['19 и 28','28 и 19','19,28','28,19'],placeholder:'например: 19 и 28',hint:'По верхней полосе 4·7, по левой стороне 7+12.',explanation:'Стороны прямоугольника равны 19 см и 28 см.'},diagram:{type:'mosaic',variant:'textbook-139'}},
  {id:'l50-workbook164',kind:'practice',eyebrow:'Рабочая тетрадь № 164',title:'Семь квадратов внутри одного прямоугольника',body:'Три закрашенных квадрата со стороной 8 см дают общую высоту 24 см. Внизу три равных маленьких квадрата, а над ними — самый большой квадрат.',activity:{id:'l50-p18',type:'input',prompt:'Чему равна сторона наибольшего квадрата, см?',answer:'18',placeholder:'см',hint:'Пусть сторона нижнего квадрата x. Тогда 3x+x=24.',explanation:'Сторона большого квадрата равна 3x, а общая высота — 3x+x=24. Значит, x=6 и 3x=18 см.'},diagram:{type:'mosaic',variant:'workbook-164'}},
  {id:'l50-source372-model',kind:'model',eyebrow:'Учебник № 372',title:'Прямоугольник 3×6 делится на три равных двумя способами',body:'Можно получить три прямоугольника 2×3 или три полосы 1×6. Оба разбиения используют всю исходную фигуру без наложений.',diagram:{type:'partition',variant:'three-rectangles'}},
  {id:'l50-source372-perimeters',kind:'practice',eyebrow:'№ 372 · периметры частей',title:'Разные формы частей дают разные границы',body:'Для 2×3 получаем 2·(2+3), для 1×6 — 2·(1+6).',activity:{id:'l50-p19',type:'input',prompt:'Запиши оба возможных периметра через «и», см.',answer:['10 и 14','14 и 10','10,14','14,10'],placeholder:'например: 10 и 14',hint:'Вычисли периметры 2×3 и 1×6.',explanation:'Периметры полученных прямоугольников равны 10 см или 14 см.'},diagram:{type:'partition',variant:'three-rectangles'}},
  {id:'l50-source372-count',kind:'quiz',eyebrow:'№ 372 · число решений',title:'Поворот одинакового разбиения не создаёт нового способа',body:'Существенно различаются только формы частей: 2×3 и 1×6.',activity:{id:'l50-p20',type:'input',prompt:'Сколько решений имеет задача?',answer:'2',placeholder:'число решений',hint:'Перечисли разные размеры одной части.',explanation:'Есть два решения: три прямоугольника 2×3 или три прямоугольника 1×6.'},diagram:{type:'partition',variant:'three-rectangles'}},
  {id:'l50-source373-model',kind:'model',eyebrow:'Учебник № 373',title:'Два равных квадрата образуют прямоугольник 2s × s',body:'Его периметр равен 2·(2s+s)=6s. При периметре 12 см получаем s=2 см.',diagram:{type:'partition',variant:'two-squares'}},
  {id:'l50-source373-dimensions',kind:'practice',eyebrow:'№ 373 · существование',title:'Соедини два квадрата со стороной 2 см',body:'Общая сторона становится внутренней, а внешняя граница образует прямоугольник.',activity:{id:'l50-p21',type:'choice',prompt:'Какие размеры имеет найденный прямоугольник?',options:['4 см × 2 см','6 см × 2 см','3 см × 3 см','4 см × 4 см'],answer:'4 см × 2 см',hint:'Два квадрата 2×2 стоят рядом.',explanation:'Две стороны по 2 см дают длину 4 см, высота остаётся 2 см.'},diagram:{type:'partition',variant:'two-squares'}},
  {id:'l50-source373-square-perimeter',kind:'practice',eyebrow:'№ 373 · ответ',title:'Периметр каждой части',body:'Каждая полученная часть — квадрат со стороной 2 см.',activity:{id:'l50-p22',type:'input',prompt:'Найди периметр каждого квадрата, см.',answer:'8',placeholder:'см',hint:'Умножь 2 на 4.',explanation:'Периметр каждого квадрата равен 4·2=8 см.'},diagram:{type:'partition',variant:'two-squares'}},
  {id:'l50-source374-model',kind:'model',eyebrow:'Учебник № 374 · рисунок 220',title:'Две диагонали дают четыре равные части',body:'Обе диагонали пересекаются в центре квадрата и делят его на четыре равных прямоугольных равнобедренных треугольника.',diagram:{type:'partition',variant:'diagonals'}},
  {id:'l50-source374-method',kind:'challenge',eyebrow:'№ 374 · точное разрезание',title:'Из каждой пары треугольников складывается квадрат',body:'Нужно получить четыре равные части, а затем объединить их попарно.',activity:{id:'l50-p23',type:'choice',prompt:'Как надо разрезать исходный квадрат?',options:['Провести обе диагонали квадрата','Провести одну диагональ','Разделить только вертикальной линией','Отрезать четыре разных угла'],answer:'Провести обе диагонали квадрата',hint:'Сверься с рисунком 220: линии соединяют противоположные вершины.',explanation:'Обе диагонали дают четыре равных треугольника; две пары составляют два равных квадрата.'},diagram:{type:'partition',variant:'diagonals'}},
  {id:'l50-workbook160-model',kind:'model',eyebrow:'Рабочая тетрадь № 160',title:'Общая сторона исчезает из внешнего периметра',body:'Квадрат со стороной 6 см и треугольник имеют равные периметры по 24 см. После соединения общая сторона 6 см посчитана дважды и становится внутренней: 24+24−2·6=36 см.',diagram:{type:'panel',kind:'composite'}},
  {id:'l50-summary',kind:'summary',eyebrow:'Итог урока 50',title:'Ты управляешь границей и устройством фигуры',body:'Ты находишь неизвестные стороны через полупериметр, переносишь равный периметр между фигурами, считаешь вложенные квадраты по размерам, проверяешь проволочные модели делимостью и точно читаешь разбиения и разрезания.',note:'Дальше — обязательная практика из 20 задач по учебнику и рабочей тетради с Пифагором и озвучкой Sulafat.',diagram:{type:'panel',kind:'final'}}
];

function PerimeterDiagram({diagram}:{diagram:Extract<Diagram,{type:'perimeter'}>}){
  const square=diagram.shape==='square';
  const width=square?220:390;const height=square?220:170;const x=(640-width)/2;const y=(280-height)/2;
  return <div className="rectangle-practice-diagram" data-diagram-kind="perimeter" data-source-exercise={diagram.source} data-shape={diagram.shape} data-width-value={diagram.widthLabel} data-height-value={diagram.heightLabel} data-perimeter-value={diagram.perimeter}>
    <svg viewBox="0 0 640 280" role="img" aria-label={`${square?'Квадрат':'Прямоугольник'} со сторонами ${diagram.widthLabel} и ${diagram.heightLabel}`}>
      <rect className="rp-shape" x={x} y={y} width={width} height={height}/>
      <path className="rp-right" d={`M${x+5} ${y+26}H${x+26}V${y+5}M${x+width-26} ${y+5}V${y+26}H${x+width-5}M${x+width-5} ${y+height-26}H${x+width-26}V${y+height-5}M${x+26} ${y+height-5}V${y+height-26}H${x+5}`}/>
      <text className="rp-label" x={x+width/2} y={y-15} textAnchor="middle">{diagram.widthLabel}</text>
      <text className="rp-label" x={x+width+24} y={y+height/2} dominantBaseline="middle">{diagram.heightLabel}</text>
      <text className="rp-perimeter" x="320" y="265" textAnchor="middle">P = {diagram.perimeter}</text>
    </svg>
  </div>;
}

function SquareCountDiagram({variant}:{variant:'a'|'b'}){
  if(variant==='a')return <div className="rectangle-practice-diagram" data-diagram-kind="square-count" data-figure="137-a" data-total-squares="14" data-count-breakdown="9+4+1">
    <svg viewBox="0 0 640 360" role="img" aria-label="Рисунок 137а: квадратная сетка три на три">
      <g className="rp-grid" transform="translate(170 20)"><rect data-count-layer="3x3" width="300" height="300"/><path d="M100 0V300M200 0V300M0 100H300M0 200H300"/></g>
      <text className="rp-caption" x="320" y="345" textAnchor="middle">9 маленьких + 4 средних + 1 большой</text>
    </svg>
  </div>;
  return <div className="rectangle-practice-diagram" data-diagram-kind="square-count" data-figure="137-b" data-total-squares="13" data-count-breakdown="1+4+4+4">
    <svg viewBox="0 0 640 360" role="img" aria-label="Рисунок 137б: три уровня вложенного деления квадрата">
      <g className="rp-grid rp-grid-green" transform="translate(170 20)"><rect data-count-layer="outer" width="300" height="300"/><path data-count-layer="large-four" d="M150 0V300M0 150H300"/><path data-count-layer="middle-four" d="M225 0V150M150 75H300"/><path data-count-layer="small-four" d="M262.5 0V75M225 37.5H300"/></g>
      <text className="rp-caption" x="320" y="345" textAnchor="middle">1 внешний + 4 + 4 + 4 = 13</text>
    </svg>
  </div>;
}

function WireDiagram(){return <div className="rectangle-practice-diagram" data-diagram-kind="wire" data-source-exercise="№370" data-total-length="20">
  <svg viewBox="0 0 640 360" role="img" aria-label="Рисунок 138: пятиугольник из проволоки со сторонами 6, 5, 3, 2 и 4 сантиметра">
    <polygon className="rp-wire" points="170,170 325,35 455,170 405,285 265,310"/>
    <text data-wire-side="6" className="rp-wire-label" x="225" y="85">6 см</text><text data-wire-side="5" className="rp-wire-label" x="400" y="86">5 см</text><text data-wire-side="3" className="rp-wire-label" x="447" y="235">3 см</text><text data-wire-side="2" className="rp-wire-label" x="330" y="325">2 см</text><text data-wire-side="4" className="rp-wire-label" x="200" y="257">4 см</text>
  </svg>
  </div>}

function MosaicDiagram({variant}:{variant:'textbook-139'|'workbook-164'}){
  if(variant==='textbook-139')return <div className="rectangle-practice-diagram" data-diagram-kind="mosaic" data-source-figure="139" data-smallest-square="4" data-rectangle-width="28" data-rectangle-height="19" data-square-tile-count="9">
    <svg viewBox="0 0 640 420" role="img" aria-label="Рисунок 139: прямоугольник 28 на 19 сантиметров, разбитый на квадраты">
      <g className="rp-mosaic" transform="translate(68 25)"><rect width="504" height="342"/><path d="M0 126H504M126 0V126M252 0V126M378 0V126M216 126V342M432 126V342M432 198H504M432 270H504"/></g>
      <text className="rp-caption" x="320" y="397" textAnchor="middle">4·7 = 28 см · 7+12 = 19 см · маленький квадрат 4 см</text>
    </svg>
  </div>;
  return <div className="rectangle-practice-diagram" data-diagram-kind="mosaic" data-source-exercise="РТ №164" data-shaded-square-side="8" data-largest-square="18" data-small-square-side="6" data-square-tile-count="7">
    <svg viewBox="0 0 640 420" role="img" aria-label="Рабочая тетрадь номер 164: прямоугольник, разбитый на семь квадратов">
      <g className="rp-mosaic" transform="translate(112 20)"><rect width="416" height="384"/><rect className="rp-large-square" width="288" height="288"/><path d="M96 288V384M192 288V384M288 0V384M288 128H416M288 256H416"/><path className="rp-shaded-column" d="M288 0H416V384H288Z"/></g>
      <text className="rp-caption rp-caption-inside" x="256" y="171" textAnchor="middle">18 см</text><text className="rp-caption rp-caption-inside" x="470" y="211" textAnchor="middle">3·8 см</text>
    </svg>
  </div>;
}

function PartitionDiagram({variant}:{variant:'three-rectangles'|'two-squares'|'diagonals'}){
  if(variant==='three-rectangles')return <div className="rectangle-practice-diagram" data-diagram-kind="partition" data-source-exercise="№372" data-solution-count="2" data-result-perimeters="10|14">
    <svg viewBox="0 0 680 340" role="img" aria-label="Два способа разделить прямоугольник 3 на 6 на три равных прямоугольника">
      <g className="rp-partition"><g transform="translate(35 70)"><rect width="270" height="135"/><path d="M90 0V135M180 0V135"/><text x="135" y="-18" textAnchor="middle">части 2×3 · P=10</text></g><g transform="translate(375 70)"><rect width="270" height="135"/><path d="M0 45H270M0 90H270"/><text x="135" y="-18" textAnchor="middle">части 1×6 · P=14</text></g></g>
      <text className="rp-caption" x="340" y="265" textAnchor="middle">исходный прямоугольник 3 см × 6 см</text>
    </svg>
  </div>;
  if(variant==='two-squares')return <div className="rectangle-practice-diagram" data-diagram-kind="partition" data-source-exercise="№373" data-rectangle-width="4" data-rectangle-height="2" data-piece-count="2" data-piece-perimeter="8">
    <svg viewBox="0 0 640 330" role="img" aria-label="Прямоугольник 4 на 2 сантиметра, разделённый на два квадрата">
      <g className="rp-partition" transform="translate(120 50)"><rect width="400" height="200"/><path d="M200 0V200"/><text x="100" y="105" textAnchor="middle">2×2</text><text x="300" y="105" textAnchor="middle">2×2</text></g><text className="rp-caption" x="320" y="290" textAnchor="middle">P прямоугольника = 12 см · P каждого квадрата = 8 см</text>
    </svg>
  </div>;
  return <div className="rectangle-practice-diagram" data-diagram-kind="dissection" data-source-figure="220" data-cut-kind="both-diagonals" data-piece-count="4" data-result-square-count="2">
    <svg viewBox="0 0 640 360" role="img" aria-label="Рисунок 220: квадрат разрезан двумя диагоналями на четыре равных треугольника">
      <g className="rp-dissection" transform="translate(190 35)"><rect width="260" height="260"/><path data-cut-line="AC" d="M0 0L260 260"/><path data-cut-line="BD" d="M260 0L0 260"/><circle cx="130" cy="130" r="6"/></g><text className="rp-caption" x="320" y="330" textAnchor="middle">4 равных треугольника → 2 квадрата</text>
    </svg>
  </div>;
}

function PanelDiagram({kind}:{kind:Extract<Diagram,{type:'panel'}>['kind']}){
  if(kind==='reverse')return <div className="rectangle-practice-panel" data-panel="reverse"><div className="rp-formula"><span><b>P=2(a+b)</b><small>периметр</small></span><i>→</i><span><b>a+b=P:2</b><small>полупериметр</small></span><i>→</i><span><b>b=P:2−a</b><small>неизвестная сторона</small></span></div></div>;
  if(kind==='equal')return <div className="rectangle-practice-panel" data-panel="equal"><div className="rp-equal"><span><b>Квадрат</b><strong>P=4a</strong></span><i>= одна граница =</i><span><b>Прямоугольник</b><strong>P=2(c+d)</strong></span></div></div>;
  if(kind==='counting')return <div className="rectangle-practice-panel" data-panel="counting"><div className="rp-steps"><span><b>1</b>маленькие</span><span><b>2</b>составные средние</span><span><b>3</b>самый большой</span><strong>группируй по размеру</strong></div></div>;
  if(kind==='wire-targets')return <div className="rectangle-practice-panel" data-panel="wire-targets" data-wire-length="20"><div className="rp-targets"><span data-target="square" data-possible="true"><b>□</b><strong>20:4=5</strong><small>можно</small></span><span data-target="pentagon" data-possible="true"><b>⬠</b><strong>20:5=4</strong><small>можно</small></span><span data-target="triangle" data-possible="false"><b>△</b><strong>20:3</strong><small>не натуральное</small></span></div></div>;
  if(kind==='composite')return <div className="rectangle-practice-panel" data-panel="composite" data-source-exercise="РТ №160" data-result-perimeter="36"><div className="rp-composite"><svg viewBox="0 0 360 150"><rect x="20" y="25" width="100" height="100"/><polygon points="120,25 120,125 325,125"/><line x1="120" y1="25" x2="120" y2="125"/><text x="70" y="82" textAnchor="middle">6 см</text><text x="205" y="82" textAnchor="middle">общая сторона</text></svg><strong>24+24−2·6=36 см</strong></div></div>;
  return <div className="rectangle-practice-panel" data-panel="final"><div className="rp-final"><b>полупериметр ✓</b><b>равные границы ✓</b><b>квадраты ✓</b><b>проволока ✓</b><b>разрезания ✓</b></div></div>;
}

function DiagramView({diagram}:{diagram:Diagram}){
  if(diagram.type==='perimeter')return <PerimeterDiagram diagram={diagram}/>;
  if(diagram.type==='square-count')return <SquareCountDiagram variant={diagram.variant}/>;
  if(diagram.type==='wire')return <WireDiagram/>;
  if(diagram.type==='mosaic')return <MosaicDiagram variant={diagram.variant}/>;
  if(diagram.type==='partition')return <PartitionDiagram variant={diagram.variant}/>;
  return <PanelDiagram kind={diagram.kind}/>;
}

function emptySaved():Saved{return{version:1,stageIndex:0,responses:{},checked:{},results:{},attempts:{}}}
function loadSaved():Saved{try{const raw=localStorage.getItem(KEY);if(!raw)return emptySaved();const parsed=JSON.parse(raw) as Partial<Saved>;return{version:1,stageIndex:Math.min(Math.max(Number(parsed.stageIndex)||0,0),lessonFiftyStages.length-1),responses:parsed.responses??{},checked:parsed.checked??{},results:parsed.results??{},attempts:parsed.attempts??{}}}catch{return emptySaved()}}
function stopNarration(){window.dispatchEvent(new CustomEvent('mathnikita-stop-narration'));if('speechSynthesis'in window)window.speechSynthesis.cancel()}

export function RectanglePracticePlayer(){
  const[saved,setSaved]=useState<Saved>(()=>loadSaved());const stage=lessonFiftyStages[saved.stageIndex];const activity=stage.activity;const response=activity?saved.responses[activity.id]??'':'';const wasChecked=activity?Boolean(saved.checked[activity.id]):false;const isCorrect=activity?Boolean(saved.results[activity.id]):true;const attempts=activity?saved.attempts[activity.id]??0:0;const canContinue=!activity||isCorrect||attempts>=2;
  const progress=useMemo(()=>Math.round(((saved.stageIndex+1)/lessonFiftyStages.length)*100),[saved.stageIndex]);
  useEffect(()=>{localStorage.setItem(KEY,JSON.stringify(saved))},[saved]);
  useEffect(()=>{const handler=(event:Event)=>{const detail=(event as CustomEvent<StageJumpDetail>).detail;if(detail?.lessonNumber!==50||typeof detail.stageIndex!=='number')return;const index=Math.min(Math.max(detail.stageIndex,0),lessonFiftyStages.length-1);stopNarration();setSaved(previous=>({...previous,stageIndex:index}))};window.addEventListener('mathnikita-go-to-stage',handler);return()=>window.removeEventListener('mathnikita-go-to-stage',handler)},[]);
  function setResponse(value:string){if(!activity)return;setSaved(previous=>({...previous,responses:{...previous.responses,[activity.id]:value},checked:{...previous.checked,[activity.id]:false},results:{...previous.results,[activity.id]:false}}))}
  function check(){if(!activity||!response)return;const correct=answerMatches(response,activity.answer);setSaved(previous=>({...previous,checked:{...previous.checked,[activity.id]:true},results:{...previous.results,[activity.id]:correct},attempts:{...previous.attempts,[activity.id]:(previous.attempts[activity.id]??0)+(correct?0:1)}}))}
  function next(){if(!canContinue||saved.stageIndex>=lessonFiftyStages.length-1)return;stopNarration();setSaved(previous=>({...previous,stageIndex:previous.stageIndex+1}))}
  function previous(){if(saved.stageIndex===0)return;stopNarration();setSaved(previous=>({...previous,stageIndex:previous.stageIndex-1}))}
  return <section className="lesson-player rectangle-practice-player" data-lesson-number="50" data-source-reference="Мерзляк §15 · №366–374 · рабочая тетрадь №158–160, 164"><article className={`interactive-stage ${stage.kind==='summary'?'stage-summary':''}`} data-stage-id={stage.id}><div className="stage-copy"><span className="stage-eyebrow">{stage.eyebrow}</span><h2>{stage.title}</h2><p>{stage.body}</p>{stage.note?<p className="theory-note">{stage.note}</p>:null}</div>{stage.diagram?<DiagramView diagram={stage.diagram}/>:null}{activity?<div className="activity-area"><h3>{activity.prompt}</h3>{activity.type==='choice'?<div className="choice-grid">{activity.options?.map(option=><button key={option} type="button" className={response===option?'selected':''} onClick={()=>setResponse(option)}>{option}</button>)}</div>:<label className="inline-answer"><span>Ответ</span><input value={response} placeholder={activity.placeholder??'Введите ответ'} onChange={event=>setResponse(event.target.value)}/></label>}<button type="button" className="check-button" disabled={!response} onClick={check}>Проверить</button>{wasChecked?<div className={`instant-feedback ${isCorrect?'good':'bad'}`} data-explanation={activity.explanation}><strong>{isCorrect?'Верно':'Пока нет'}</strong><span>{isCorrect?activity.explanation:attempts>=2?`${activity.hint} Можно перейти дальше и вернуться к заданию позже.`:activity.hint}</span></div>:null}</div>:null}<div className="lesson-controls"><button type="button" onClick={previous} disabled={saved.stageIndex===0}>Назад</button><span>Этап {saved.stageIndex+1} из {lessonFiftyStages.length} · {progress}%</span><button type="button" className="primary" onClick={next} disabled={saved.stageIndex===lessonFiftyStages.length-1||!canContinue}>{saved.stageIndex===lessonFiftyStages.length-1?'Итог':'Дальше'}</button></div></article></section>;
}
