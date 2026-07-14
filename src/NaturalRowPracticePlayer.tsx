import { useMemo, useState } from 'react';
import './lessonPlayer.css';
import './theoryExperience.css';
import './naturalRowPractice.css';

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

const stages: Stage[] = [
  {
    id: 'l2-story',
    kind: 'story',
    eyebrow: 'Проблемная ситуация',
    title: 'Сколько домов стоит между домами № 27 и № 35?',
    body: 'Можно выписать номера 28, 29, 30, 31, 32, 33, 34 и пересчитать. Но что делать, если номера отличаются не на 8, а на сто тысяч?',
    note: 'Сегодня выведем правило, которое работает для любых натуральных чисел и не требует выписывать весь ряд.',
    sourceTag: 'Мерзляк § 1; методическое пособие, комментарий к упражнениям № 8–9',
  },
  {
    id: 'l2-step-one',
    kind: 'guided',
    eyebrow: 'Вспоминаем основу',
    title: 'У натурального ряда всегда шаг 1',
    body: 'Каждое следующее число натурального ряда на единицу больше предыдущего. Поэтому соседние числа отличаются ровно на 1.',
    activity: {
      id: 'l2-a1',
      type: 'choice',
      prompt: 'Какая запись является фрагментом натурального ряда?',
      options: ['17, 18, 19, 20', '17, 19, 21, 23', '20, 19, 18, 17', '1, 2, 4, 8'],
      answer: '17, 18, 19, 20',
      explanation: 'В натуральном ряду числа идут по возрастанию с постоянным шагом 1.',
    },
  },
  {
    id: 'l2-between-model',
    kind: 'model',
    eyebrow: 'Считаем промежуток',
    title: 'Между 7 и 12 находятся четыре числа',
    body: 'Разность границ равна 12 − 7 = 5. Но эта разность показывает количество шагов. Промежуточных чисел на одно меньше: 5 − 1 = 4.',
    note: 'Между числами n и n + k находится k − 1 натуральное число.',
    sourceTag: 'Методическое пособие Мерзляка: вывод после упражнений № 8–9',
  },
  {
    id: 'l2-between-guided',
    kind: 'guided',
    eyebrow: 'Решаем вместе',
    title: 'Границы не входят в ответ',
    body: 'Когда спрашивают числа между 20 и 26, сами числа 20 и 26 не считаются.',
    activity: {
      id: 'l2-a2',
      type: 'choice',
      prompt: 'Сколько натуральных чисел находится между 20 и 26?',
      options: ['4', '5', '6', '7'],
      answer: '5',
      explanation: 'Это числа 21, 22, 23, 24, 25. Или сразу: 26 − 20 − 1 = 5.',
    },
  },
  {
    id: 'l2-between-input',
    kind: 'practice',
    eyebrow: 'Самостоятельно',
    title: 'Не выписывай числа без необходимости',
    body: 'Для большого промежутка удобнее сначала найти разность границ, а затем вычесть 1.',
    activity: {
      id: 'l2-p1',
      type: 'input',
      prompt: 'Сколько натуральных чисел находится между 300 и 310?',
      answer: '9',
      placeholder: 'Введи количество',
      explanation: '310 − 300 − 1 = 9.',
    },
  },
  {
    id: 'l2-inclusive',
    kind: 'guided',
    eyebrow: 'Точная формулировка',
    title: '«Между» и «от… до… включительно» — разные задачи',
    body: 'Если обе границы включаются, к промежуточным числам добавляются ещё два числа — левая и правая границы.',
    activity: {
      id: 'l2-a3',
      type: 'choice',
      prompt: 'Сколько натуральных чисел от 300 до 310 включительно?',
      options: ['9', '10', '11', '12'],
      answer: '11',
      explanation: '310 − 300 + 1 = 11. Здесь считаются и 300, и 310.',
    },
  },
  {
    id: 'l2-successor-crossing',
    kind: 'guided',
    eyebrow: 'Переходим через разряд',
    title: 'Следующее число может изменить сразу несколько цифр',
    body: 'После 99 идёт 100, после 999 — 1000. Свойство натурального ряда не меняется: следующее число всегда получается прибавлением 1.',
    activity: {
      id: 'l2-a4',
      type: 'input',
      prompt: 'Какое число следует за 99 999?',
      answer: '100000',
      placeholder: 'Введи число',
      explanation: '99 999 + 1 = 100 000.',
    },
  },
  {
    id: 'l2-predecessor-crossing',
    kind: 'practice',
    eyebrow: 'Движемся назад',
    title: 'Предыдущее число на единицу меньше',
    body: 'Для любого натурального числа, кроме 1, предыдущее число получается вычитанием единицы.',
    activity: {
      id: 'l2-p2',
      type: 'input',
      prompt: 'Какое натуральное число стоит перед 100 000?',
      answer: '99999',
      placeholder: 'Введи число',
      explanation: '100 000 − 1 = 99 999.',
    },
  },
  {
    id: 'l2-sequence-model',
    kind: 'model',
    eyebrow: 'Числовые закономерности',
    title: 'Последовательность может иметь другой шаг',
    body: 'Ряд 5, 8, 11, 14 не является натуральным рядом целиком. Это отдельная последовательность с шагом 3: каждый раз прибавляют одно и то же число.',
    note: 'Сначала сравни соседние члены и найди разность. Только потом продолжай последовательность.',
  },
  {
    id: 'l2-sequence-up',
    kind: 'guided',
    eyebrow: 'Находим шаг',
    title: 'Возрастающая последовательность',
    body: 'В последовательности 5, 8, 11, 14 разность соседних членов всегда равна 3.',
    activity: {
      id: 'l2-a5',
      type: 'input',
      prompt: 'Какое число будет следующим: 5, 8, 11, 14, …?',
      answer: '17',
      explanation: 'Шаг равен 3, поэтому 14 + 3 = 17.',
    },
  },
  {
    id: 'l2-sequence-down',
    kind: 'practice',
    eyebrow: 'Шаг может быть отрицательным',
    title: 'Убывающая последовательность',
    body: 'Если каждое следующее число меньше на одно и то же число, последовательность убывает с постоянным шагом.',
    activity: {
      id: 'l2-p3',
      type: 'input',
      prompt: 'Продолжи: 40, 35, 30, 25, …',
      answer: '20',
      explanation: 'Каждый раз вычитают 5, поэтому после 25 идёт 20.',
    },
  },
  {
    id: 'l2-missing',
    kind: 'practice',
    eyebrow: 'Восстанавливаем пропуск',
    title: 'Проверь правило с обеих сторон',
    body: 'Пропущенное число должно подходить и к предыдущему, и к следующему члену последовательности.',
    activity: {
      id: 'l2-p4',
      type: 'input',
      prompt: 'Найди пропуск: 4, 9, __, 19',
      answer: '14',
      explanation: 'Шаг равен 5: 4, 9, 14, 19.',
    },
  },
  {
    id: 'l2-natural-vs-sequence',
    kind: 'guided',
    eyebrow: 'Различаем объекты',
    title: 'Не всякая закономерность — натуральный ряд',
    body: 'Натуральный ряд начинается с 1 и содержит все натуральные числа подряд. Последовательность может начинаться с любого числа и иметь другой шаг.',
    activity: {
      id: 'l2-a6',
      type: 'choice',
      prompt: 'Какая запись может быть фрагментом натурального ряда?',
      options: ['37, 38, 39, 40', '37, 39, 41, 43', '40, 39, 38, 37', '1, 3, 9, 27'],
      answer: '37, 38, 39, 40',
      explanation: 'Только здесь перечислены все соседние натуральные числа в возрастающем порядке.',
    },
  },
  {
    id: 'l2-counterexample',
    kind: 'practice',
    eyebrow: 'Проверяем утверждение',
    title: 'Одного контрпримера достаточно',
    body: 'Утверждение «любая возрастающая последовательность является натуральным рядом» неверно. Достаточно найти возрастающую последовательность, которая пропускает числа.',
    activity: {
      id: 'l2-p5',
      type: 'choice',
      prompt: 'Какая последовательность опровергает это утверждение?',
      options: ['1, 2, 3, 4', '8, 9, 10, 11', '2, 4, 6, 8', '101, 102, 103, 104'],
      answer: '2, 4, 6, 8',
      explanation: 'Последовательность возрастает, но пропускает нечётные числа, поэтому натуральным рядом не является.',
    },
  },
  {
    id: 'l2-order',
    kind: 'practice',
    eyebrow: 'Восстанавливаем участок ряда',
    title: 'Верни числа на свои места',
    body: 'В натуральном ряду каждое следующее число ровно на 1 больше предыдущего.',
    activity: {
      id: 'l2-p6',
      type: 'order',
      prompt: 'Расположи числа как в натуральном ряду',
      items: ['22', '18', '20', '19', '21'],
      answer: ['18', '19', '20', '21', '22'],
      explanation: 'Правильный участок натурального ряда: 18, 19, 20, 21, 22.',
    },
  },
  {
    id: 'l2-general-rule',
    kind: 'model',
    eyebrow: 'Обобщаем',
    title: 'От конкретного примера — к формуле',
    body: 'Если правая граница равна n + k, то от n до n + k нужно сделать k шагов. Промежуточных точек между границами на одну меньше — k − 1.',
    note: 'Между n и n + k находится k − 1 натуральное число.',
    sourceTag: 'Методическое пособие Мерзляка: рекомендуемая формулировка общего факта',
    activity: {
      id: 'l2-a7',
      type: 'choice',
      prompt: 'Сколько натуральных чисел находится между n и n + 7?',
      options: ['5', '6', '7', '8'],
      answer: '6',
      explanation: 'По правилу k − 1: 7 − 1 = 6.',
    },
  },
  {
    id: 'l2-quiz1',
    kind: 'quiz',
    eyebrow: 'Мини-проверка · 1/5',
    title: 'Следующее число',
    body: 'Ответь без подсказки.',
    activity: {
      id: 'l2-q1',
      type: 'input',
      prompt: 'Какое число следует за 399?',
      answer: '400',
      explanation: '399 + 1 = 400.',
    },
  },
  {
    id: 'l2-quiz2',
    kind: 'quiz',
    eyebrow: 'Мини-проверка · 2/5',
    title: 'Числа между границами',
    body: 'Границы в ответ не входят.',
    activity: {
      id: 'l2-q2',
      type: 'input',
      prompt: 'Сколько натуральных чисел находится между 100 и 105?',
      answer: '4',
      explanation: 'Это 101, 102, 103 и 104. Также: 105 − 100 − 1 = 4.',
    },
  },
  {
    id: 'l2-quiz3',
    kind: 'quiz',
    eyebrow: 'Мини-проверка · 3/5',
    title: 'Шаг последовательности',
    body: 'Сначала найди разность соседних членов.',
    activity: {
      id: 'l2-q3',
      type: 'choice',
      prompt: 'В какой последовательности постоянный шаг равен 5?',
      options: ['12, 17, 22, 27', '12, 16, 20, 24', '5, 10, 20, 40', '30, 25, 19, 12'],
      answer: '12, 17, 22, 27',
      explanation: 'Каждый следующий член здесь на 5 больше предыдущего.',
    },
  },
  {
    id: 'l2-quiz4',
    kind: 'quiz',
    eyebrow: 'Мини-проверка · 4/5',
    title: 'Предыдущее число',
    body: 'Ответь без подсказки.',
    activity: {
      id: 'l2-q4',
      type: 'input',
      prompt: 'Какое число предшествует 1000?',
      answer: '999',
      explanation: '1000 − 1 = 999.',
    },
  },
  {
    id: 'l2-quiz5',
    kind: 'quiz',
    eyebrow: 'Мини-проверка · 5/5',
    title: 'Продолжение последовательности',
    body: 'Ответь без подсказки.',
    activity: {
      id: 'l2-q5',
      type: 'input',
      prompt: 'Продолжи: 90, 80, 70, …',
      answer: '60',
      explanation: 'Шаг равен −10, поэтому после 70 идёт 60.',
    },
  },
  {
    id: 'l2-challenge',
    kind: 'challenge',
    eyebrow: 'Исследовательская задача',
    title: 'Большой промежуток без перебора',
    body: 'Между числами 1 000 000 и 1 000 100 находится много чисел. Выписывать их не нужно: важна только разность границ.',
    note: 'Сначала найди количество шагов между границами, затем убери обе границы из подсчёта промежуточных чисел.',
    activity: {
      id: 'l2-c1',
      type: 'input',
      prompt: 'Сколько натуральных чисел находится между 1 000 000 и 1 000 100?',
      answer: '99',
      explanation: '1 000 100 − 1 000 000 − 1 = 99.',
    },
  },
  {
    id: 'l2-summary',
    kind: 'summary',
    eyebrow: 'Итог',
    title: 'Урок завершён',
    body: 'Ты умеешь считать числа между границами, объяснять правило k − 1, находить шаг последовательности и отличать последовательность от натурального ряда.',
  },
];

function normalize(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, '').replace(/,/g, '.');
}

export function NaturalRowPracticePlayer() {
  const [stageIndex, setStageIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [ordered, setOrdered] = useState<string[]>([]);
  const [checked, setChecked] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [results, setResults] = useState<Record<string, boolean>>({});

  const stage = stages[stageIndex];
  const activity = stage.activity;
  const progress = Math.round(((stageIndex + 1) / stages.length) * 100);
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
    setStageIndex(index => Math.min(Math.max(index + delta, 0), stages.length - 1));
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
    if (stage.id === 'l2-story') {
      return <div className="house-number-model">{[27,28,29,30,31,32,33,34,35].map(number => <div key={number} className={number === 27 || number === 35 ? 'boundary' : ''}><span>⌂</span><b>{number}</b></div>)}</div>;
    }
    if (stage.id === 'l2-between-model' || stage.id === 'l2-between-guided' || stage.id === 'l2-between-input' || stage.id === 'l2-inclusive') {
      return <div className="interval-number-model"><b className="boundary">7</b>{[8,9,10,11].map(number => <span key={number}>{number}</span>)}<b className="boundary">12</b><small>4 числа между границами</small></div>;
    }
    if (stage.id === 'l2-successor-crossing' || stage.id === 'l2-predecessor-crossing') {
      return <div className="crossing-model"><span>998</span><i>→</i><span>999</span><i>→</i><b>1000</b></div>;
    }
    if (stage.id === 'l2-sequence-model' || stage.id === 'l2-sequence-up' || stage.id === 'l2-sequence-down' || stage.id === 'l2-missing') {
      return <div className="step-sequence-model"><span>5</span><i>+3</i><span>8</span><i>+3</i><span>11</span><i>+3</i><span>14</span></div>;
    }
    if (stage.id === 'l2-natural-vs-sequence' || stage.id === 'l2-counterexample') {
      return <div className="row-contrast-model"><div><small>Натуральный ряд</small><b>1, 2, 3, 4, 5, …</b></div><strong>≠</strong><div><small>Отдельная последовательность</small><b>2, 4, 6, 8, …</b></div></div>;
    }
    if (stage.id === 'l2-general-rule') {
      return <div className="gap-formula-model"><b>n</b><span>k шагов</span><b>n + k</b><strong>между ними: k − 1</strong></div>;
    }
    if (stage.id === 'l2-challenge') {
      return <div className="large-gap-model"><b>1 000 000</b><span>100 шагов</span><b>1 000 100</b><strong>99 чисел между</strong></div>;
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
    return <div className="activity-area"><h3>{currentActivity.prompt}</h3><div className="order-bank">{currentActivity.items.map(item => <button key={item} disabled={ordered.includes(item)} onClick={() => { setOrdered(list => [...list, item]); setChecked(false); }}>{item}</button>)}</div><div className="order-result">{ordered.length ? ordered.map((item, index) => <button key={`${item}-${index}`} onClick={() => { setOrdered(list => list.filter((_, itemIndex) => itemIndex !== index)); setChecked(false); }}>{item}</button>) : <span>Нажимай числа по порядку</span>}</div><div className="activity-actions"><button className="secondary" onClick={() => setOrdered([])}>Сбросить</button><button className="check-button" disabled={ordered.length !== currentActivity.items.length} onClick={() => submit()}>Проверить</button></div></div>;
  }

  return (
    <main className="lesson-player-page natural-row-practice-page">
      <section className="lesson-workspace interactive-workspace">
        <header className="lesson-header">
          <div><span>Урок 2 из 175 · Натуральный ряд</span><h1>Натуральный ряд и закономерности</h1><p>Урок продолжает § 1 учебника Мерзляка и построен по методической карте урока № 2: промежутки натурального ряда, правило k − 1 и числовые закономерности.</p></div>
          <div className="lesson-duration">30–35 мин</div>
        </header>
        <div className="lesson-progress"><i style={{ width: `${progress}%` }} /></div>
        <div className="stage-counter">Этап {stageIndex + 1} из {stages.length}</div>
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
          {checked && activity ? <div className={`instant-feedback ${correct ? 'good' : 'bad'}`} data-explanation={activity.explanation}><b>{correct ? 'Верно!' : 'Пока не получилось'}</b><span>{correct ? activity.explanation : 'Ответ не совпал. Проверь, входят ли границы в подсчёт, и найди постоянный шаг.'}</span></div> : null}
          {stage.kind === 'quiz' && checked ? <div className="quiz-meter"><span>Текущий результат</span><b>{quizScore} из 5</b></div> : null}
          {stage.kind === 'summary' ? (
            <>
              <div className="summary-card">
                <div><span>Мини-проверка</span><b>{quizScore}/5</b><small>{quizScore >= 4 ? 'Тема усвоена' : 'Нужно короткое повторение'}</small></div>
                <div><span>Практика</span><b>{practiceScore}/6</b><small>заданий выполнено верно</small></div>
                <div><span>Следующий шаг</span><b>Урок 3</b><small>Цифры и десятичная запись — после методической проверки</small></div>
              </div>
              <details className="lesson-sources"><summary>Методическая основа урока</summary><div><b>Мерзляк, § 1</b><span>Ряд натуральных чисел</span><small>Свойства натурального ряда, следующее и предыдущее число.</small></div><div><b>Методическое пособие</b><span>Технологическая карта урока № 2</span><small>Закрепление темы и вывод: между n и n + k находится k − 1 число.</small></div><div><b>Дорофеев–Петерсон</b><span>Общие высказывания и контрпримеры</span><small>Различение натурального ряда и других последовательностей.</small></div></details>
            </>
          ) : null}
        </article>
        <footer className="lesson-controls">
          <button onClick={() => go(-1)} disabled={stageIndex === 0}>← Назад</button>
          <span>{progress}% урока</span>
          <button className="primary" onClick={() => go(1)} disabled={stageIndex === stages.length - 1 || (!!activity && !correct)}>Продолжить →</button>
        </footer>
      </section>
    </main>
  );
}
