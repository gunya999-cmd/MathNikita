import { useMemo, useState } from 'react';
import './lessonPlayer.css';
import './theoryExperience.css';
import './lessonTwo.css';

type Activity =
  | { id: string; type: 'choice'; prompt: string; options: string[]; answer: string; explanation: string }
  | { id: string; type: 'input'; prompt: string; answer: string; explanation: string; placeholder?: string }
  | { id: string; type: 'order'; prompt: string; items: string[]; answer: string[]; explanation: string };

type Stage = {
  id: string;
  title: string;
  eyebrow: string;
  kind: 'story' | 'model' | 'guided' | 'practice' | 'quiz' | 'challenge' | 'summary';
  body: string;
  note?: string;
  sourceTag?: string;
  activity?: Activity;
};

const lessonTwoStages: Stage[] = [
  {
    id: 'l2-story',
    kind: 'story',
    eyebrow: 'Проблемная ситуация',
    title: 'Всего десять знаков — а чисел бесконечно много',
    body: 'Слова складываются из букв, а числа — из цифр. Для записи всех натуральных чисел хватает только десяти цифр. Секрет не в количестве знаков, а в их порядке и положении.',
    note: 'Цифра — знак записи. Число — математический объект, который этим знаком или группой знаков записывают.',
    sourceTag: 'Мерзляк § 2: аналогия «кирпичи — здание, буквы — слова, цифры — числа»',
  },
  {
    id: 'l2-digit-or-number',
    kind: 'guided',
    eyebrow: 'Различаем понятия',
    title: 'Цифра и число — не одно и то же',
    body: 'Цифр ровно десять: 0, 1, 2, 3, 4, 5, 6, 7, 8, 9. Чисел бесконечно много. Однозначное число записывается одной цифрой, но само число и его запись — разные понятия.',
    activity: {
      id: 'l2-a1',
      type: 'choice',
      prompt: 'Какое утверждение верно?',
      options: ['Цифр бесконечно много', 'Число 507 — это одна цифра', 'Цифр десять, а натуральных чисел бесконечно много', 'Число 12 является цифрой'],
      answer: 'Цифр десять, а натуральных чисел бесконечно много',
      explanation: 'В десятичной системе десять цифр, а из них можно составить бесконечно много натуральных чисел.',
    },
  },
  {
    id: 'l2-digit-set',
    kind: 'model',
    eyebrow: 'Алфавит чисел',
    title: 'Десять цифр десятичной системы',
    body: 'Название «десятичная» связано с тем, что десять единиц каждого разряда образуют одну единицу следующего разряда: 10 единиц — 1 десяток, 10 десятков — 1 сотня.',
    sourceTag: 'Мерзляк § 2: десятичная запись натуральных чисел',
  },
  {
    id: 'l2-position',
    kind: 'guided',
    eyebrow: 'Позиционный принцип',
    title: 'Одна цифра — разные значения',
    body: 'Значение цифры зависит от места. В числе 5 цифра 5 означает пять единиц, в числе 50 — пять десятков, а в числе 500 — пять сотен.',
    note: 'Каждый шаг влево увеличивает разрядное значение цифры в 10 раз.',
    sourceTag: 'Задачник школы № 57: позиционная система счисления',
    activity: {
      id: 'l2-a2',
      type: 'choice',
      prompt: 'Что означает цифра 3 в числе 5 306?',
      options: ['3', '30', '300', '3000'],
      answer: '300',
      explanation: 'Цифра 3 стоит в разряде сотен, поэтому её разрядное значение равно 300.',
    },
  },
  {
    id: 'l2-zero',
    kind: 'guided',
    eyebrow: 'Роль нуля',
    title: 'Ноль удерживает разряды на месте',
    body: 'В числе 502 ноль показывает, что десятков нет. Если убрать ноль, получится 52 — совсем другое число. Ноль внутри записи нельзя пропускать.',
    note: 'Стандартная запись многозначного натурального числа не начинается с нуля.',
    sourceTag: 'Методическое пособие: особое внимание числам, некоторые цифры которых равны нулю',
    activity: {
      id: 'l2-a3',
      type: 'choice',
      prompt: 'Какое число получится, если в записи 5 020 убрать оба нуля?',
      options: ['52', '520', '502', '5 020'],
      answer: '52',
      explanation: 'После удаления нулей останутся цифры 5 и 2, то есть число 52. Поэтому нули внутри записи важны.',
    },
  },
  {
    id: 'l2-leading-zero',
    kind: 'practice',
    eyebrow: 'Типичная ошибка',
    title: 'Почему запись числа не начинают с нуля',
    body: 'Записи 052 и 52 обозначают одно и то же количество, но стандартная десятичная запись натурального числа не содержит лишнего нуля слева.',
    activity: {
      id: 'l2-a4',
      type: 'choice',
      prompt: 'Какая запись является стандартной записью натурального числа?',
      options: ['0074', '074', '74', '00074'],
      answer: '74',
      explanation: 'Натуральное число записывают без нулей перед первой ненулевой цифрой.',
    },
  },
  {
    id: 'l2-classes',
    kind: 'model',
    eyebrow: 'Читаем большие числа',
    title: 'Разбиваем запись на классы справа налево',
    body: 'Для чтения многозначного числа его делят справа налево на группы по три цифры. Справа идут классы единиц, тысяч, миллионов, миллиардов.',
    note: 'Крайняя слева группа может содержать одну, две или три цифры.',
    sourceTag: 'Мерзляк § 2: чтение числа 17 025 543 607 по классам',
  },
  {
    id: 'l2-read-classes',
    kind: 'guided',
    eyebrow: 'Читаем по классам',
    title: 'Каждый класс читаем отдельно',
    body: 'Число 17 025 543 607 читают так: семнадцать миллиардов двадцать пять миллионов пятьсот сорок три тысячи шестьсот семь.',
    activity: {
      id: 'l2-a5',
      type: 'choice',
      prompt: 'Как правильно прочитать число 4 020 018?',
      options: ['Четыре миллиона двадцать тысяч восемнадцать', 'Четыреста двадцать тысяч восемнадцать', 'Четыре миллиарда двадцать миллионов восемнадцать', 'Четыре миллиона двести тысяч восемнадцать'],
      answer: 'Четыре миллиона двадцать тысяч восемнадцать',
      explanation: 'Группы справа: 4 | 020 | 018. Это 4 миллиона, 20 тысяч и 18 единиц.',
    },
  },
  {
    id: 'l2-empty-class',
    kind: 'practice',
    eyebrow: 'Нулевой класс',
    title: 'Класс из нулей при чтении пропускают',
    body: 'Если все три цифры класса равны нулю, название этого класса не произносят. Но нули остаются в записи и сохраняют места остальных классов.',
    activity: {
      id: 'l2-a6',
      type: 'choice',
      prompt: 'Как читается число 6 000 005?',
      options: ['Шесть миллионов пять', 'Шесть тысяч пять', 'Шесть миллионов пять тысяч', 'Шестьсот тысяч пять'],
      answer: 'Шесть миллионов пять',
      explanation: 'Класс тысяч равен 000, поэтому при чтении его название пропускают.',
    },
  },
  {
    id: 'l2-expanded',
    kind: 'model',
    eyebrow: 'Разрядное разложение',
    title: 'Запись числа показывает сумму разрядов',
    body: 'Число 2 958 можно разложить так: 2 000 + 900 + 50 + 8. Такая запись показывает вклад каждой цифры.',
    note: 'Разрядное разложение помогает проверить, правильно ли понята позиция каждой цифры.',
    sourceTag: 'Мерзляк § 2: сумма разрядных слагаемых',
  },
  {
    id: 'l2-expanded-practice',
    kind: 'practice',
    eyebrow: 'Самостоятельно',
    title: 'Разложи число по разрядам',
    body: 'Нулевые разрядные слагаемые обычно не записывают.',
    activity: {
      id: 'l2-p1',
      type: 'choice',
      prompt: 'Как верно разложить число 40 907?',
      options: ['40 000 + 900 + 7', '4 000 + 900 + 7', '40 000 + 90 + 7', '40 000 + 9 + 7'],
      answer: '40 000 + 900 + 7',
      explanation: 'В числе 40 907 четыре десятка тысяч, девять сотен и семь единиц.',
    },
  },
  {
    id: 'l2-write-number',
    kind: 'practice',
    eyebrow: 'Записываем цифрами',
    title: 'Собери число из названий классов',
    body: 'Каждый класс должен занимать три позиции, кроме крайнего слева. Если внутри класса не хватает разряда, его место занимает ноль.',
    activity: {
      id: 'l2-p2',
      type: 'input',
      prompt: 'Запиши цифрами: семь миллионов двести тысяч девять',
      answer: '7200009',
      placeholder: 'Например: 1234567',
      explanation: 'Классы: 7 | 200 | 009. Получается 7 200 009.',
    },
  },
  {
    id: 'l2-distinct-digits',
    kind: 'practice',
    eyebrow: 'Будь внимателен',
    title: 'Позиций может быть больше, чем разных цифр',
    body: 'В записи 1001 четыре позиции, но используются только две разные цифры: 1 и 0.',
    activity: {
      id: 'l2-p3',
      type: 'choice',
      prompt: 'Сколько различных цифр используется в записи числа 7 070 007?',
      options: ['2', '3', '4', '7'],
      answer: '2',
      explanation: 'В записи встречаются только цифры 7 и 0.',
    },
  },
  {
    id: 'l2-successor-large',
    kind: 'practice',
    eyebrow: 'Связываем два урока',
    title: 'Следующее число меняет несколько разрядов',
    body: 'При переходе через девятки единицы объединяются в десяток, десятки — в сотню и так далее. Поэтому прибавление 1 иногда меняет сразу несколько цифр.',
    sourceTag: 'Дорофеев–Петерсон: запись следующего многозначного числа',
    activity: {
      id: 'l2-p4',
      type: 'input',
      prompt: 'Какое число следует за 805 279 999?',
      answer: '805280000',
      placeholder: 'Введи число цифрами',
      explanation: '999 увеличивается до 1000, поэтому 805 279 999 + 1 = 805 280 000.',
    },
  },
  {
    id: 'l2-order-classes',
    kind: 'practice',
    eyebrow: 'Структура записи',
    title: 'Порядок классов не меняют',
    body: 'Классы идут справа налево: единицы, тысячи, миллионы, миллиарды.',
    activity: {
      id: 'l2-p5',
      type: 'order',
      prompt: 'Расположи классы справа налево',
      items: ['миллионы', 'единицы', 'миллиарды', 'тысячи'],
      answer: ['единицы', 'тысячи', 'миллионы', 'миллиарды'],
      explanation: 'Справа находится класс единиц, затем тысяч, миллионов и миллиардов.',
    },
  },
  {
    id: 'l2-place-check',
    kind: 'practice',
    eyebrow: 'Повышенный уровень',
    title: 'Цифра и количество разрядных единиц',
    body: 'Цифра в разряде и общее количество единиц этого разряда — разные вопросы. Например, в числе 3 560 цифра сотен равна 5, но всего сотен — 35.',
    activity: {
      id: 'l2-p6',
      type: 'choice',
      prompt: 'Сколько всего сотен содержится в числе 48 732?',
      options: ['7', '48', '487', '4 873'],
      answer: '487',
      explanation: '48 732 = 487 полных сотен и ещё 32 единицы.',
    },
  },
  {
    id: 'l2-quiz1',
    kind: 'quiz',
    eyebrow: 'Мини-проверка · 1/5',
    title: 'Цифры',
    body: 'Ответь без подсказки.',
    activity: {
      id: 'l2-q1',
      type: 'choice',
      prompt: 'Сколько цифр используется в десятичной системе?',
      options: ['9', '10', '11', 'Бесконечно много'],
      answer: '10',
      explanation: 'Используются цифры от 0 до 9 — всего десять.',
    },
  },
  {
    id: 'l2-quiz2',
    kind: 'quiz',
    eyebrow: 'Мини-проверка · 2/5',
    title: 'Разрядное значение',
    body: 'Ответь без подсказки.',
    activity: {
      id: 'l2-q2',
      type: 'choice',
      prompt: 'Каково значение цифры 8 в числе 8 217?',
      options: ['8', '80', '800', '8000'],
      answer: '8000',
      explanation: 'Цифра 8 стоит в разряде тысяч.',
    },
  },
  {
    id: 'l2-quiz3',
    kind: 'quiz',
    eyebrow: 'Мини-проверка · 3/5',
    title: 'Классы',
    body: 'Ответь без подсказки.',
    activity: {
      id: 'l2-q3',
      type: 'input',
      prompt: 'Сколько классов в записи числа 12 345 678?',
      answer: '3',
      explanation: 'Группы 12 | 345 | 678 образуют три класса.',
    },
  },
  {
    id: 'l2-quiz4',
    kind: 'quiz',
    eyebrow: 'Мини-проверка · 4/5',
    title: 'Роль нуля',
    body: 'Выбери верное утверждение.',
    activity: {
      id: 'l2-q4',
      type: 'choice',
      prompt: 'Что показывает ноль в записи 4 090?',
      options: ['Число не является натуральным', 'Отсутствие сотен и единиц', 'Отсутствие тысяч', 'Ноль можно удалить без изменения числа'],
      answer: 'Отсутствие сотен и единиц',
      explanation: '4 090 содержит 4 тысячи, 0 сотен, 9 десятков и 0 единиц.',
    },
  },
  {
    id: 'l2-quiz5',
    kind: 'quiz',
    eyebrow: 'Мини-проверка · 5/5',
    title: 'Запись числа',
    body: 'Запиши ответ цифрами.',
    activity: {
      id: 'l2-q5',
      type: 'input',
      prompt: 'Запиши: девятьсот тысяч сорок',
      answer: '900040',
      explanation: 'Классы: 900 | 040. Получается 900 040.',
    },
  },
  {
    id: 'l2-challenge',
    kind: 'challenge',
    eyebrow: 'Исследовательская задача',
    title: 'Число 3560 записали три раза подряд',
    body: 'Получилось число 3 560 356 035 60? Стоп: сначала запиши без пробелов 356035603560, а затем разбей справа налево на классы.',
    note: 'Не доверяй случайным пробелам: классы определяются только отсчётом справа по три цифры.',
    sourceTag: 'Дорофеев–Петерсон: задание с тройной записью числа 3560',
    activity: {
      id: 'l2-c1',
      type: 'choice',
      prompt: 'Сколько классов в числе 356035603560?',
      options: ['3', '4', '5', '12'],
      answer: '4',
      explanation: 'Разбиение справа: 356 | 035 | 603 | 560. Это четыре класса и двенадцать разрядов.',
    },
  },
  {
    id: 'l2-summary',
    kind: 'summary',
    eyebrow: 'Итог',
    title: 'Урок завершён',
    body: 'Ты различаешь цифру и число, понимаешь позиционный принцип, читаешь большие числа по классам, сохраняешь нули и раскладываешь число по разрядам.',
  },
];

function normalize(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, '').replace(/,/g, '.');
}

export function LessonTwoPlayer() {
  const [stageIndex, setStageIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [ordered, setOrdered] = useState<string[]>([]);
  const [checked, setChecked] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [results, setResults] = useState<Record<string, boolean>>({});

  const stage = lessonTwoStages[stageIndex];
  const activity = stage.activity;
  const progress = Math.round(((stageIndex + 1) / lessonTwoStages.length) * 100);
  const quizIds = ['l2-q1', 'l2-q2', 'l2-q3', 'l2-q4', 'l2-q5'];
  const practiceIds = ['l2-p1', 'l2-p2', 'l2-p3', 'l2-p4', 'l2-p5', 'l2-p6'];
  const quizScore = quizIds.filter(id => results[id]).length;
  const practiceScore = practiceIds.filter(id => results[id]).length;

  function resetStage() {
    setAnswer('');
    setOrdered([]);
    setChecked(false);
    setCorrect(false);
  }

  function go(delta: number) {
    setStageIndex(index => Math.min(Math.max(index + delta, 0), lessonTwoStages.length - 1));
    resetStage();
  }

  function submit(value?: string) {
    if (!activity) return;
    const isCorrect = activity.type === 'order'
      ? JSON.stringify(ordered) === JSON.stringify(activity.answer)
      : normalize(value ?? answer) === normalize(activity.answer);
    setCorrect(isCorrect);
    setChecked(true);
    setResults(previous => ({ ...previous, [activity.id]: isCorrect }));
  }

  const visualModel = useMemo(() => {
    if (stage.id === 'l2-story' || stage.id === 'l2-digit-set') {
      return <div className="digit-alphabet-model"><div>{[0,1,2,3,4,5,6,7,8,9].map(digit => <span key={digit}>{digit}</span>)}</div><b>10 цифр → бесконечно много чисел</b></div>;
    }
    if (stage.id === 'l2-position') {
      return <div className="position-value-model"><div><b>5</b><span>5 единиц</span></div><i>→</i><div><b>50</b><span>5 десятков</span></div><i>→</i><div><b>500</b><span>5 сотен</span></div></div>;
    }
    if (stage.id === 'l2-zero' || stage.id === 'l2-leading-zero') {
      return <div className="zero-place-model"><div><b>5</b><b className="zero">0</b><b>2</b><span>пятьсот два</span></div><strong>≠</strong><div><b>5</b><b>2</b><span>пятьдесят два</span></div></div>;
    }
    if (stage.id === 'l2-classes' || stage.id === 'l2-read-classes' || stage.id === 'l2-empty-class') {
      return <div className="class-reader-model"><div><small>миллиарды</small><b>17</b></div><div><small>миллионы</small><b>025</b></div><div><small>тысячи</small><b>543</b></div><div><small>единицы</small><b>607</b></div></div>;
    }
    if (stage.id === 'l2-expanded' || stage.id === 'l2-expanded-practice') {
      return <div className="expanded-number-model"><b>2 958</b><span>=</span><strong>2 000 + 900 + 50 + 8</strong></div>;
    }
    if (stage.id === 'l2-challenge') {
      return <div className="repeat-number-model"><span>356035603560</span><div><b>356</b><b>035</b><b>603</b><b>560</b></div><small>Разбиваем справа налево</small></div>;
    }
    return null;
  }, [stage.id]);

  function renderActivity(currentActivity: Activity) {
    if (currentActivity.type === 'choice') {
      return <div className="activity-area"><h3>{currentActivity.prompt}</h3><div className="choice-grid">{currentActivity.options.map(option => <button key={option} className={answer === option ? 'selected' : ''} onClick={() => { setAnswer(option); setChecked(false); }}>{option}</button>)}</div><button className="check-button" disabled={!answer} onClick={() => submit()}>Проверить</button></div>;
    }
    if (currentActivity.type === 'input') {
      return <div className="activity-area"><h3>{currentActivity.prompt}</h3><div className="inline-answer"><input value={answer} onChange={event => { setAnswer(event.target.value); setChecked(false); }} onKeyDown={event => event.key === 'Enter' && submit()} placeholder={currentActivity.placeholder ?? 'Ответ'} /><button className="check-button" disabled={!answer.trim()} onClick={() => submit()}>Проверить</button></div></div>;
    }
    return <div className="activity-area"><h3>{currentActivity.prompt}</h3><div className="order-bank">{currentActivity.items.map(item => <button key={item} disabled={ordered.includes(item)} onClick={() => { setOrdered(list => [...list, item]); setChecked(false); }}>{item}</button>)}</div><div className="order-result">{ordered.length ? ordered.map((item, index) => <button key={`${item}-${index}`} onClick={() => { setOrdered(list => list.filter((_, itemIndex) => itemIndex !== index)); setChecked(false); }}>{item}</button>) : <span>Нажимай элементы по порядку</span>}</div><div className="activity-actions"><button className="secondary" onClick={() => setOrdered([])}>Сбросить</button><button className="check-button" disabled={ordered.length !== currentActivity.items.length} onClick={() => submit()}>Проверить</button></div></div>;
  }

  return (
    <main className="lesson-player-page lesson-two-page">
      <section className="lesson-workspace interactive-workspace">
        <header className="lesson-header">
          <div><span>Урок 2 из 175 · Десятичная запись</span><h1>Цифры. Десятичная запись натуральных чисел</h1><p>Урок собран по § 2 учебника Мерзляка, методическим картам уроков 3–5, заданиям Дорофеева–Петерсон и материалам школы № 57.</p></div>
          <div className="lesson-duration">35–40 мин</div>
        </header>
        <div className="lesson-progress"><i style={{ width: `${progress}%` }} /></div>
        <div className="stage-counter">Этап {stageIndex + 1} из {lessonTwoStages.length}</div>
        <article className={`interactive-stage stage-${stage.kind}`}>
          <div className="stage-copy">
            <span>{stage.eyebrow}</span>
            <h2>{stage.title}</h2>
            <p>{stage.body}</p>
            {stage.sourceTag ? <small className="source-tag">Источник: {stage.sourceTag}</small> : null}
            {stage.note ? <div className="theory-note"><b>Запомни</b><span>{stage.note}</span></div> : null}
          </div>
          {visualModel}
          {activity ? renderActivity(activity) : null}
          {checked && activity ? <div className={`instant-feedback ${correct ? 'good' : 'bad'}`} data-explanation={activity.explanation}><b>{correct ? 'Верно!' : 'Пока не получилось'}</b><span>{correct ? activity.explanation : 'Ответ не совпал. Проверь значение цифры, направление разбиения на классы и сохранность нулей.'}</span></div> : null}
          {stage.kind === 'quiz' && checked ? <div className="quiz-meter"><span>Текущий результат</span><b>{quizScore} из 5</b></div> : null}
          {stage.kind === 'summary' ? (
            <>
              <div className="summary-card">
                <div><span>Мини-проверка</span><b>{quizScore}/5</b><small>{quizScore >= 4 ? 'Тема усвоена' : 'Нужно короткое повторение'}</small></div>
                <div><span>Практика</span><b>{practiceScore}/6</b><small>заданий выполнено верно</small></div>
                <div><span>Следующий шаг</span><b>Урок 3</b><small>будет открыт после методической проверки</small></div>
              </div>
              <details className="lesson-sources"><summary>Методическая основа урока</summary><div><b>Мерзляк, § 2</b><span>Цифры. Десятичная запись натуральных чисел</span><small>Основные определения, классы, чтение чисел и разрядное разложение.</small></div><div><b>Методическое пособие</b><span>Технологические карты уроков 3–5</span><small>Планируемые результаты, типичные ошибки и акцент на нулях внутри записи.</small></div><div><b>Дорофеев–Петерсон</b><span>Позиционная запись и задание 3560 × 3</span><small>Исследовательская задача и работа с классами.</small></div><div><b>Школа № 57</b><span>Позиционная система счисления</span><small>Разрядное значение и представление числа по степеням десяти.</small></div></details>
            </>
          ) : null}
        </article>
        <footer className="lesson-controls">
          <button onClick={() => go(-1)} disabled={stageIndex === 0}>← Назад</button>
          <span>{progress}% урока</span>
          <button className="primary" onClick={() => go(1)} disabled={stageIndex === lessonTwoStages.length - 1 || (!!activity && !correct)}>Продолжить →</button>
        </footer>
      </section>
    </main>
  );
}
