import { createPortal } from 'react-dom';
import './progressiveHints.css';

type HintSet = {
  question: string;
  visual: string;
  strategy: string;
};

const hintRules: Array<{ match: RegExp; hints: HintSet }> = [
  {
    match: /только натуральные|не является натуральным/i,
    hints: {
      question: 'С какого числа начинается натуральный ряд в этом курсе? Какие записи точно не могут быть его членами?',
      visual: 'Проверь каждый вариант по фильтру: 0 ✕ · дробь ✕ · отрицательное число ✕ · 1, 2, 3, … ✓',
      strategy: 'Не ищи ответ целиком. Исключай варианты по одному: сначала с нулём, затем с дробью, затем с отрицательным числом.',
    },
  },
  {
    match: /предшествует числу 1|перед 1/i,
    hints: {
      question: 'Посмотри на начало ряда 1, 2, 3, … Есть ли слева от 1 ещё один член этого ряда?',
      visual: '← стоп | 1 | 2 | 3 | …',
      strategy: 'Вычитание 1 даёт 0, но в принятом здесь определении 0 не входит в натуральный ряд. Значит, нужно ответить не числом, а словами.',
    },
  },
  {
    match: /опровергает правило|контрпример/i,
    hints: {
      question: 'Нужен всего один случай, где правило обещает одно, а настоящее сравнение даёт другое.',
      visual: 'Проверь границу разрядов: 99 → 100. Число стало трёхзначным, хотя первая цифра уменьшилась.',
      strategy: 'Сравни количество цифр. Любое трёхзначное число больше любого двузначного — первая цифра здесь не главный признак.',
    },
  },
  {
    match: /после числа|следует за/i,
    hints: {
      question: 'Как получить следующее натуральное число из текущего?',
      visual: 'n → n + 1',
      strategy: 'Прибавь ровно одну единицу. Следи за переходом через разряд: после 9 меняется десяток, после 99 — сотня.',
    },
  },
  {
    match: /предшествует|стоит перед|предыдущее число/i,
    hints: {
      question: 'Как получить число, которое стоит непосредственно перед данным?',
      visual: 'n − 1 ← n',
      strategy: 'Вычти одну единицу. При переходе через круглое число разменяй один десяток или одну сотню.',
    },
  },
  {
    match: /правильный знак|сравн/i,
    hints: {
      question: 'Какое число встретится правее на числовом луче?',
      visual: 'меньше ← 0 — 1 — 2 — 3 — … → больше',
      strategy: 'Сначала сравни старшие разряды. Если они равны, переходи к следующему разряду справа.',
    },
  },
  {
    match: /отметь число|число на луче/i,
    hints: {
      question: 'От какой точки начинается отсчёт и сколько единичных шагов нужно сделать?',
      visual: '0 — 1 — 2 — 3 — 4 — 5 — 6',
      strategy: 'Не считай сами точки как шаги. От нуля сделай столько единичных переходов, какое число нужно отметить.',
    },
  },
  {
    match: /расставь числа|возрастанию|порядок чисел/i,
    hints: {
      question: 'Какое из оставшихся чисел самое маленькое?',
      visual: 'минимум → следующий минимум → следующий → максимум',
      strategy: 'Строй порядок по одному месту: выбери минимальное число, убери его из набора и снова найди минимальное.',
    },
  },
  {
    match: /4\s*<\s*x|подходящие числа|неравен/i,
    hints: {
      question: 'Какая граница не включается, а какая включается?',
      visual: '4 ○────● 8   |   ○ не входит, ● входит',
      strategy: 'Начни с первого целого числа строго больше 4 и перечисляй подряд до 8 включительно.',
    },
  },
  {
    match: /утверждение верно|свойство натурального ряда/i,
    hints: {
      question: 'Что произойдёт, если к любому выбранному натуральному числу прибавить 1?',
      visual: 'n → n + 1 → n + 2 → …',
      strategy: 'Проверь каждое утверждение одним примером или контрпримером. Особое внимание удели числу 1 и идее «последнего числа».',
    },
  },
  {
    match: /370|дни рождения|совпадение обязательно/i,
    hints: {
      question: 'Можно ли раздать 370 учеников по 366 датам так, чтобы в каждой дате оказался не более чем один ученик?',
      visual: '370 учеников > 366 дат',
      strategy: 'После размещения 366 учеников по разным датам остаются ещё ученики. Любой из них обязан попасть в уже занятую дату.',
    },
  },
];

function fallbackHints(activityType: string, stageTitle: string): HintSet {
  const typeHint = activityType.includes('order')
    ? 'Разбей действие на маленькие шаги и каждый раз выбирай следующий элемент.'
    : activityType.includes('input')
      ? 'Запиши известное правило символами, а затем выполни одно действие.'
      : 'Проверяй варианты по одному и объясняй себе, почему каждый подходит или не подходит.';

  return {
    question: `Что именно нужно узнать в задании «${stageTitle}»? Сформулируй это одним коротким предложением.`,
    visual: 'Дано → правило → один шаг → проверка',
    strategy: typeHint,
  };
}

export type ProgressiveHintState = {
  prompt: string;
  stageTitle: string;
  activityType: string;
  attempts: number;
  revealedLevel: number;
  fullExplanation: string;
  mountNode: HTMLElement | null;
};

export function ProgressiveHintCoach({ state, onRevealNext }: { state: ProgressiveHintState; onRevealNext: () => void }) {
  if (!state.mountNode || state.attempts < 1) return null;

  const matched = hintRules.find(rule => rule.match.test(`${state.prompt} ${state.stageTitle}`));
  const hints = matched?.hints ?? fallbackHints(state.activityType, state.stageTitle);
  const steps = [
    { label: 'Подсказка 1 · направляющий вопрос', text: hints.question },
    { label: 'Подсказка 2 · визуальная опора', text: hints.visual },
    { label: 'Подсказка 3 · стратегия', text: hints.strategy },
    { label: 'Полный разбор', text: state.fullExplanation.replace(/^Посмотри на модель ещё раз\.\s*/i, '') },
  ];
  const visibleLevel = Math.min(Math.max(state.revealedLevel, 1), 4);

  return createPortal(
    <section className="progressive-hint-coach" aria-live="polite">
      <header>
        <div><span>Кот Пифагор помогает</span><b>Не выдаём ответ сразу — распутываем задачу по шагам</b></div>
        <strong>Попытка {state.attempts}</strong>
      </header>
      <div className="hint-steps">
        {steps.slice(0, visibleLevel).map((step, index) => (
          <article key={step.label} className={index + 1 === visibleLevel ? 'active' : 'revealed'}>
            <span>{step.label}</span>
            <p>{step.text}</p>
          </article>
        ))}
      </div>
      {visibleLevel < 4 ? (
        <button type="button" onClick={onRevealNext}>
          {visibleLevel === 1 ? 'Нужна ещё опора' : visibleLevel === 2 ? 'Покажи стратегию' : 'Показать полный разбор'}
        </button>
      ) : (
        <small>Теперь закрой разбор взглядом, реши задание заново и объясни себе каждый шаг.</small>
      )}
    </section>,
    state.mountNode,
  );
}
