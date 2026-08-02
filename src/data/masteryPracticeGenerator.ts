import { multiInputTask as multi, type ExtendedPracticeField, type ExtendedPracticeTask } from './extendedPracticeTypes';

const numeric=(value:number)=>[String(value)];
const field=(id:string,label:string,answers:string[]):ExtendedPracticeField=>({id,label,answers});
const pretty=(value:number)=>value.toLocaleString('ru-RU');
const yes=['да'];
const no=['нет'];

function naturalRowMastery(lesson:number):ExtendedPracticeTask[]{
  return Array.from({length:10},(_,index)=>{
    const n=120+lesson*37+index*19;
    const step=2+(index%5);
    const gap=5+(index%6);
    return multi(
      `l${lesson}-mastery-${index+1}`,
      `Натуральный ряд: работаем с числом ${pretty(n)} и шагом ${step}.`,
      [
        field('previous',`Предыдущее натуральное число перед ${pretty(n)}`,numeric(n-1)),
        field('next',`Следующее натуральное число после ${pretty(n)}`,numeric(n+1)),
        field('sequence',`Число через ${step} единиц после ${pretty(n)}`,numeric(n+step)),
        field('between',`Сколько натуральных чисел строго между ${pretty(n)} и ${pretty(n+gap)}?`,numeric(gap-1)),
      ],
      'Двигайся по натуральному ряду по одному шагу и помни: строгие границы не входят в промежуток.',
      `Перед ${pretty(n)} стоит ${pretty(n-1)}, после него ${pretty(n+1)}, через ${step} шага — ${pretty(n+step)}, между границами находится ${gap-1} чисел.`,
    );
  });
}

function decimalMastery(lesson:number):ExtendedPracticeTask[]{
  return Array.from({length:10},(_,index)=>{
    const millions=((lesson+index)%8)+1;
    const hundredThousands=((index*3+2)%9)+1;
    const tenThousands=(index*2+1)%10;
    const thousands=(index*5+3)%10;
    const hundreds=(index*7+4)%10;
    const tens=(index*4+1)%10;
    const ones=(index*6+5)%10;
    const value=millions*1_000_000+hundredThousands*100_000+tenThousands*10_000+thousands*1_000+hundreds*100+tens*10+ones;
    return multi(
      `l${lesson}-mastery-${index+1}`,
      `Паспорт многозначного числа ${pretty(value)}.`,
      [
        field('classes','Количество классов в записи',numeric(3)),
        field('ten-thousands','Цифра десятков тысяч',numeric(tenThousands)),
        field('hundred-thousands-value',`Значение цифры ${hundredThousands} в сотнях тысяч`,numeric(hundredThousands*100_000)),
        field('full-thousands','Количество полных тысяч',numeric(Math.floor(value/1000))),
      ],
      'Раздели запись справа налево на группы по три цифры, а затем называй разряд внутри нужного класса.',
      `В числе ${pretty(value)} три класса; десятков тысяч ${tenThousands}; цифра ${hundredThousands} означает ${pretty(hundredThousands*100_000)}; полных тысяч ${pretty(Math.floor(value/1000))}.`,
    );
  });
}

function segmentMastery(lesson:number):ExtendedPracticeTask[]{
  return Array.from({length:10},(_,index)=>{
    const ac=12+((lesson*3+index*4)%29);
    const cb=9+((lesson+index*5)%23);
    const ab=ac+cb;
    return multi(
      `l${lesson}-mastery-${index+1}`,
      `Точка C лежит между A и B: AC = ${ac} см, CB = ${cb} см.`,
      [
        field('whole','Длина AB, см',numeric(ab)),
        field('restore-right',`Если AB = ${ab} см и AC = ${ac} см, чему равен CB?`,numeric(cb)),
        field('restore-left',`Если AB = ${ab} см и CB = ${cb} см, чему равен AC?`,numeric(ac)),
        field('millimeters','Длина AB в миллиметрах',numeric(ab*10)),
      ],
      'Используй одно и то же равенство AB = AC + CB и перевод 1 см = 10 мм.',
      `AB = ${ab} см; CB = ${cb} см; AC = ${ac} см; AB = ${ab*10} мм.`,
    );
  });
}

function polylineMastery(lesson:number):ExtendedPracticeTask[]{
  return Array.from({length:10},(_,index)=>{
    const a=8+index;
    const b=11+(index%5)*2;
    const c=7+(index%4)*3;
    const d=10+(index%6);
    const firstThree=a+b+c;
    const total=firstThree+d;
    return multi(
      `l${lesson}-mastery-${index+1}`,
      `Ломаная состоит из звеньев ${a} см, ${b} см, ${c} см и ${d} см.`,
      [
        field('total','Длина всей ломаной, см',numeric(total)),
        field('first-three','Длина первых трёх звеньев, см',numeric(firstThree)),
        field('missing',`Если общая длина ${total} см, а первые три звена дают ${firstThree} см, длина четвёртого звена`,numeric(d)),
        field('millimeters','Длина всей ломаной в миллиметрах',numeric(total*10)),
      ],
      'Длина ломаной равна сумме длин всех её звеньев.',
      `Общая длина ${total} см = ${total*10} мм; первые три звена дают ${firstThree} см; четвёртое звено ${d} см.`,
    );
  });
}

function planeLineRayMastery(lesson:number):ExtendedPracticeTask[]{
  return Array.from({length:10},(_,index)=>{
    const right=index%2===0;
    const ray=right?'BC':'CB';
    return multi(
      `l${lesson}-mastery-${index+1}`,
      `На одной прямой точки расположены слева направо A — B — C — D. Рассмотри луч ${ray}. Для каждой точки ответь «да» или «нет»: принадлежит ли она лучу ${ray}?`,
      [
        field('A','Точка A',right?no:yes),
        field('B','Точка B',yes),
        field('C','Точка C',yes),
        field('D','Точка D',right?yes:no),
      ],
      'Луч начинается в первой названной точке и идёт через вторую бесконечно в одном направлении.',
      right?'Луч BC начинается в B и идёт вправо: A не принадлежит, B, C и D принадлежат.':'Луч CB начинается в C и идёт влево: A, B и C принадлежат, D не принадлежит.',
    );
  });
}

function coordinateRayMastery(lesson:number):ExtendedPracticeTask[]{
  return Array.from({length:10},(_,index)=>{
    const step=3+((lesson+index)%7);
    const aSteps=2+(index%4);
    const bSteps=aSteps+3+(index%3);
    const cSteps=bSteps+2;
    const a=step*aSteps;
    const b=step*bSteps;
    const c=step*cSteps;
    return multi(
      `l${lesson}-mastery-${index+1}`,
      `На координатном луче цена одного деления ${step}. Точки A, B, C стоят через ${aSteps}, ${bSteps} и ${cSteps} делений от нуля.`,
      [
        field('A','Координата A',numeric(a)),
        field('B','Координата B',numeric(b)),
        field('C','Координата C',numeric(c)),
        field('distance','Разность координат C и A',numeric(c-a)),
      ],
      'Координата равна числу шагов, умноженному на цену одного деления.',
      `A(${a}), B(${b}), C(${c}); C − A = ${c-a}.`,
    );
  });
}

function comparisonMastery(lesson:number):ExtendedPracticeTask[]{
  return Array.from({length:10},(_,index)=>{
    const base=120_000+lesson*1_003+index*137;
    const delta=12+((index*11)%79);
    const smaller=base;
    const larger=base+delta;
    const left=index%2===0?smaller:larger;
    const right=index%2===0?larger:smaller;
    const sign=left<right?'<':'>';
    return multi(
      `l${lesson}-mastery-${index+1}`,
      `Сравни ${pretty(left)} и ${pretty(right)} и разберись с границами.`,
      [
        field('sign','Знак между числами', [sign]),
        field('smaller','Меньшее число',numeric(smaller)),
        field('larger','Большее число',numeric(larger)),
        field('between','Количество натуральных чисел строго между ними',numeric(delta-1)),
      ],
      'Сначала сравни разряды слева направо, затем работай с меньшей и большей границей.',
      `${pretty(smaller)} < ${pretty(larger)}; между ними находится ${delta-1} натуральных чисел.`,
    );
  });
}

function chapterReviewMastery(lesson:number):ExtendedPracticeTask[]{
  return Array.from({length:10},(_,index)=>{
    const n=500+lesson*17+index*23;
    const ac=15+(index%9);
    const cb=18+((index*2)%11);
    const ab=ac+cb;
    const step=4+(index%5);
    const steps=5+(index%4);
    const coordinate=step*steps;
    const other=n+7+(index%6);
    return multi(
      `l${lesson}-mastery-${index+1}`,
      `Смешанная проверка главы: натуральный ряд, отрезок, координатный луч и сравнение.`,
      [
        field('successor',`Следующее натуральное число после ${pretty(n)}`,numeric(n+1)),
        field('segment',`AC = ${ac} см, CB = ${cb} см. Найди AB.`,numeric(ab)),
        field('coordinate',`Цена деления ${step}; точка через ${steps} делений от нуля. Координата`,numeric(coordinate)),
        field('sign',`Знак: ${pretty(n)} □ ${pretty(other)}`,['<']),
      ],
      'Решай четыре пункта независимо: ряд, сложение частей отрезка, координата как шаг × деления, сравнение.',
      `Ответы: ${pretty(n+1)}; ${ab} см; ${coordinate}; знак <.`,
    );
  });
}

function additionMastery(lesson:number):ExtendedPracticeTask[]{
  return Array.from({length:10},(_,index)=>{
    if(lesson===21){
      const a=12_000+lesson*73+index*417;
      const b=2_500+index*286;
      const c=700+(index*63);
      const sum=a+b;
      return multi(
        `l${lesson}-mastery-${index+1}`,
        `Сложение натуральных чисел: ${pretty(a)}, ${pretty(b)} и ${pretty(c)}.`,
        [
          field('sum','Сумма первых двух чисел',numeric(sum)),
          field('three','Сумма всех трёх чисел',numeric(sum+c)),
          field('zero',`Чему равно ${pretty(a)} + 0?`,numeric(a)),
          field('missing',`Какое второе слагаемое нужно прибавить к ${pretty(a)}, чтобы получить ${pretty(sum)}?`,numeric(b)),
        ],
        'Записывай одинаковые разряды друг под другом и проверяй сложение обратным действием.',
        `Первые два дают ${pretty(sum)}, все три — ${pretty(sum+c)}, прибавление нуля сохраняет ${pretty(a)}, пропущенное слагаемое ${pretty(b)}.`,
      );
    }
    const x=120+index*13;
    const a=500-x;
    const b=x;
    const y=180+index*17;
    const c=1000-y;
    const d=y;
    const total=a+b+c+d;
    return multi(
      `l${lesson}-mastery-${index+1}`,
      `Найди удобные пары в сумме ${a} + ${b} + ${c} + ${d}.`,
      [
        field('pair-one',`Сумма ${a} + ${b}`,numeric(500)),
        field('pair-two',`Сумма ${c} + ${d}`,numeric(1000)),
        field('total','Общая сумма',numeric(total)),
        field('property','Какое свойство позволяет менять группировку слагаемых?',['сочетательное','сочетательное свойство','сочетательное свойство сложения']),
      ],
      'Сначала собери круглые пары, а для изменения скобок назови сочетательное свойство.',
      `Получаются пары 500 и 1 000, общая сумма ${pretty(total)}; группировку меняет сочетательное свойство сложения.`,
    );
  });
}

export function buildMasteryPractice(lessonNumber:number):ExtendedPracticeTask[]{
  if(lessonNumber===4)return [];
  if(lessonNumber<=2)return naturalRowMastery(lessonNumber);
  if([3,5].includes(lessonNumber))return decimalMastery(lessonNumber);
  if([6,7].includes(lessonNumber))return segmentMastery(lessonNumber);
  if(lessonNumber===8)return polylineMastery(lessonNumber);
  if(lessonNumber===9)return segmentMastery(lessonNumber);
  if([10,11,12].includes(lessonNumber))return planeLineRayMastery(lessonNumber);
  if([13,14,15].includes(lessonNumber))return coordinateRayMastery(lessonNumber);
  if([16,17,18].includes(lessonNumber))return comparisonMastery(lessonNumber);
  if([19,20].includes(lessonNumber))return chapterReviewMastery(lessonNumber);
  if([21,22,23].includes(lessonNumber))return additionMastery(lessonNumber);
  return [];
}
