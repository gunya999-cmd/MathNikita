import { useEffect, useMemo, useState, type RefObject } from 'react';
import './catMentor.css';

export type MentorSignal = {
  kind: 'idle' | 'correct' | 'wrong';
  version: number;
};

type CatMentorProps = {
  rootRef: RefObject<HTMLElement | null>;
  lessonNumber: number;
  mode: 'opening' | 'lesson';
  signal: MentorSignal;
};

type SceneSnapshot = {
  key: string;
  title: string;
  body: string;
  prompt: string;
  note: string;
};

type MentorAction = 'welcome' | 'different' | 'example' | 'hint' | 'why';
type MentorMood = 'calm' | 'thinking' | 'happy' | 'encouraging';

type MentorScript = {
  welcome: string;
  different: string;
  example: string;
  hint: string;
  why: string;
  success: string;
  retry: string;
};

const emptyScene: SceneSnapshot = {
  key: 'empty',
  title: '',
  body: '',
  prompt: '',
  note: '',
};

function cleanText(value?: string | null) {
  return value?.replace(/\s+/g, ' ').trim() ?? '';
}

function readVisibleScene(root: HTMLElement | null, mode: 'opening' | 'lesson'): SceneSnapshot {
  if (!root) return emptyScene;

  if (mode === 'opening') {
    const scope = root.querySelector<HTMLElement>('.opening-screen:not([hidden])');
    if (!scope) return emptyScene;
    const title = cleanText(scope.querySelector('.lesson-opening-copy h1')?.textContent);
    const body = cleanText(scope.querySelector('.lesson-opening-copy p')?.textContent);
    const prompt = cleanText(scope.querySelector('.lesson-opening-question b')?.textContent);
    return { key: `opening:${title}`, title, body, prompt, note: '' };
  }

  const scope = root.querySelector<HTMLElement>('.lesson-runtime:not([hidden])');
  const stage = scope?.querySelector<HTMLElement>('.interactive-stage');
  if (!stage) return emptyScene;

  const title = cleanText(stage.querySelector('.stage-copy h2')?.textContent);
  const body = cleanText(stage.querySelector('.stage-copy p')?.textContent);
  const prompt = cleanText(stage.querySelector('.activity-area h3')?.textContent);
  const note = cleanText(stage.querySelector('.theory-note span')?.textContent);
  return { key: `${title}|${prompt}`, title, body, prompt, note };
}

function shorten(text: string, fallback: string) {
  const normalized = cleanText(text);
  if (!normalized) return fallback;
  if (normalized.length <= 150) return normalized;
  const sentence = normalized.match(/^.{30,150}?[.!?](?:\s|$)/)?.[0];
  return sentence?.trim() ?? `${normalized.slice(0, 145).trim()}…`;
}

function buildScript(scene: SceneSnapshot, lessonNumber: number, mode: 'opening' | 'lesson'): MentorScript {
  const haystack = `${scene.title} ${scene.body} ${scene.prompt} ${scene.note}`.toLowerCase();

  if (mode === 'opening') {
    return {
      welcome: lessonNumber === 1
        ? 'Привет! Я кот Пифагор. Сегодня мы не будем просто запоминать правило — попробуем открыть его сами.'
        : 'Сначала разберёмся на маленьком примере, а потом найдём правило, которое работает даже для очень больших чисел.',
      different: shorten(scene.body, 'Посмотри на ситуацию как исследователь: что здесь меняется, а что остаётся неизменным?'),
      example: lessonNumber === 1
        ? 'Пять книг можно пересчитать, а длину стола — измерить пятью одинаковыми мерками. Число одно, действия разные.'
        : 'Между домами номер 7 и номер 12 стоят дома 8, 9, 10 и 11. Скоро найдём способ получать ответ без перечисления.',
      hint: 'Пока не ищи готовый ответ. Сформулируй, что именно нужно узнать, и обрати внимание на слова в вопросе.',
      why: 'Главный вопрос перед уроком настраивает мышление. В конце мы вернёмся к нему и проверим, изменилось ли твоё объяснение.',
      success: 'Отличный старт. Теперь проверим твою идею на моделях и задачах.',
      retry: 'Ничего страшного. Начнём с конкретного примера и постепенно соберём правило.',
    };
  }

  if (/между|границ|промежут|включительно|k\s*[−-]\s*1|n\s*\+\s*k/.test(haystack)) {
    return {
      welcome: scene.prompt
        ? 'Внимательно прочитай вопрос. Самое важное здесь — понять, входят ли крайние числа в подсчёт.'
        : 'Посмотри на две границы. Разность покажет число шагов, а нам нужно понять, сколько точек лежит строго между ними.',
      different: 'Представь дома на одной улице. Первый и последний дом — границы. Считаем только дома, которые стоят между ними.',
      example: 'Между 8 и 14 находятся 9, 10, 11, 12 и 13. Разность равна 6, а промежуточных чисел — 5.',
      hint: 'Сначала вычти меньшее число из большего. Затем проверь: нужно считать шаги или числа между границами?',
      why: 'Разность считает переходы от одной границы к другой. Промежуточных чисел на одно меньше, потому что последний шаг приводит уже к правой границе.',
      success: 'Верно! Ты различил границы и числа между ними — это ключевая идея.',
      retry: 'Не спеши. Проверь, не посчитал ли ты одну или обе границы вместе с промежуточными числами.',
    };
  }

  if (/последователь|закономер|шаг|продолж|пропуск/.test(haystack)) {
    return {
      welcome: 'Сравни соседние числа. Не угадывай продолжение — сначала найди действие, которое повторяется каждый раз.',
      different: 'Представь, что числа идут по лестнице. Высота каждой ступеньки — это шаг последовательности.',
      example: 'В ряду 5, 8, 11, 14 каждый раз прибавляют 3. Поэтому следующим будет число, полученное ещё одним таким же шагом.',
      hint: 'Найди разность второй и первой пары, затем проверь её на следующей паре чисел.',
      why: 'Закономерность считается найденной только тогда, когда одно правило объясняет все показанные переходы, а не один случай.',
      success: 'Отлично! Ты не угадал, а проверил постоянный шаг.',
      retry: 'Проверь разности между каждой парой соседних чисел. Они должны подчиняться одному правилу.',
    };
  }

  if (/следующ|предыдущ|натуральн.*ряд|соседн/.test(haystack)) {
    return {
      welcome: 'В натуральном ряду каждое следующее число больше предыдущего ровно на единицу.',
      different: 'Вообрази бесконечную дорожку: один шаг вправо означает плюс один, один шаг влево — минус один.',
      example: 'После 999 идёт 1000. Цифры заметно меняются, но математическое действие всё то же: прибавили один.',
      hint: 'Определи направление движения по ряду и выполни только одно действие: плюс один или минус один.',
      why: 'Натуральный ряд содержит все натуральные числа подряд, поэтому между соседними числами нельзя вставить ещё одно натуральное число.',
      success: 'Точно! Ты сохранил шаг натурального ряда даже при переходе через разряд.',
      retry: 'Вернись к главному свойству: соседние натуральные числа отличаются на единицу.',
    };
  }

  if (/измер|мерк|сч[её]т|предмет/.test(haystack)) {
    return {
      welcome: 'Подумай, что показывает число: количество предметов или количество одинаковых мерок.',
      different: 'Счёт отвечает на вопрос «сколько предметов?», а измерение — «сколько одинаковых мерок поместилось?».',
      example: 'Пять карандашей — результат счёта. Пять одинаковых шагов вдоль комнаты — результат измерения.',
      hint: 'Сравни не сами предметы, а роль числа в каждом действии.',
      why: 'Натуральные числа помогают описывать и количество объектов, и результат измерения одинаковыми мерками.',
      success: 'Верно! Ты увидел общую математическую структуру за разными действиями.',
      retry: 'Спроси себя: что именно здесь повторяется и сколько раз?',
    };
  }

  const base = shorten(scene.note || scene.body, 'Раздели задачу на маленькие шаги и проверяй каждый вывод.');
  return {
    welcome: scene.prompt ? 'Сначала сформулируй, что известно и что требуется найти.' : base,
    different: base,
    example: 'Возьми похожий, но более простой пример. Проверь правило на нём, а затем вернись к текущей задаче.',
    hint: 'Найди ключевое слово в вопросе и свяжи его с правилом текущей сцены.',
    why: 'Математическое объяснение должно показывать не только ответ, но и связь между условием, правилом и выводом.',
    success: 'Отлично! Объяснение и ответ согласуются.',
    retry: 'Ответ пока не совпал. Разберём условие ещё раз и проверим первый шаг.',
  };
}

function CatAvatar({ mood }: { mood: MentorMood }) {
  const happy = mood === 'happy';
  const thinking = mood === 'thinking';
  const encouraging = mood === 'encouraging';

  return (
    <svg className={`cat-mentor-avatar mood-${mood}`} viewBox="0 0 240 210" role="img" aria-label="Кот-наставник Пифагор">
      <defs>
        <linearGradient id="mentor-fur" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffb338" />
          <stop offset="1" stopColor="#e97722" />
        </linearGradient>
        <linearGradient id="mentor-hoodie" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#1596a8" />
          <stop offset="1" stopColor="#12538b" />
        </linearGradient>
      </defs>
      <ellipse cx="122" cy="192" rx="82" ry="13" fill="rgba(19,38,68,.12)" />
      <path d="M54 164c9-35 31-55 67-56 37-1 62 19 70 56l5 35H46z" fill="url(#mentor-hoodie)" />
      <path d="M74 126c10 19 26 29 48 29 23 0 40-10 49-30" fill="none" stroke="#0e466f" strokeWidth="8" strokeLinecap="round" />
      <path d="M65 72 52 20l47 29M175 71l16-51-49 30" fill="url(#mentor-fur)" stroke="#c85a1d" strokeWidth="5" strokeLinejoin="round" />
      <path d="m63 38 24 17-18 8zM179 37l-25 18 19 8z" fill="#f58a72" />
      <ellipse cx="121" cy="88" rx="67" ry="59" fill="url(#mentor-fur)" stroke="#c85a1d" strokeWidth="4" />
      <path d="M78 73c9-9 19-11 29-4M136 69c10-7 21-5 29 4" fill="none" stroke="#8d3f19" strokeWidth="5" strokeLinecap="round" />
      {thinking ? (
        <>
          <ellipse cx="93" cy="88" rx="14" ry="17" fill="#fff" />
          <ellipse cx="151" cy="88" rx="14" ry="17" fill="#fff" />
          <circle cx="97" cy="84" r="7" fill="#286b3a" />
          <circle cx="155" cy="84" r="7" fill="#286b3a" />
        </>
      ) : (
        <>
          <path d={happy ? 'M80 88q13 14 26 0' : 'M80 91q13-12 26 0'} fill={happy ? 'none' : '#fff'} stroke="#6f3218" strokeWidth="4" strokeLinecap="round" />
          <path d={happy ? 'M136 88q13 14 26 0' : 'M136 91q13-12 26 0'} fill={happy ? 'none' : '#fff'} stroke="#6f3218" strokeWidth="4" strokeLinecap="round" />
          {!happy ? <><circle cx="95" cy="88" r="7" fill="#286b3a" /><circle cx="151" cy="88" r="7" fill="#286b3a" /></> : null}
        </>
      )}
      <path d="m121 96-9 8 10 5 9-5z" fill="#d85d45" stroke="#8d3f19" strokeWidth="2" />
      <path d={happy ? 'M103 112q19 23 39 0' : encouraging ? 'M105 116q17 12 34 0' : 'M108 118q14 8 28 0'} fill="#fff4dc" stroke="#8d3f19" strokeWidth="3" strokeLinecap="round" />
      <path d="M67 101 28 94M69 112l-41 5M174 101l39-8M173 113l40 7" fill="none" stroke="#8d3f19" strokeWidth="3" strokeLinecap="round" />
      <circle cx="121" cy="166" r="25" fill="#f8bd36" stroke="#8a5a0b" strokeWidth="4" />
      <text x="121" y="177" textAnchor="middle" fontSize="34" fontWeight="800" fill="#70470a">π</text>
      <path className="cat-mentor-paw" d="M58 164c-21-9-34-3-36 9-1 11 14 16 39 7" fill="url(#mentor-fur)" stroke="#c85a1d" strokeWidth="4" strokeLinecap="round" />
      <path d="M27 165 14 132" fill="none" stroke="#26344f" strokeWidth="7" strokeLinecap="round" />
      <path d="m14 132 4-10 5 9z" fill="#26344f" />
    </svg>
  );
}

export function CatMentor({ rootRef, lessonNumber, mode, signal }: CatMentorProps) {
  const [scene, setScene] = useState<SceneSnapshot>(emptyScene);
  const [action, setAction] = useState<MentorAction>('welcome');
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const refresh = () => {
      const next = readVisibleScene(root, mode);
      setScene(previous => previous.key === next.key ? previous : next);
    };

    refresh();
    const observer = new MutationObserver(refresh);
    observer.observe(root, { subtree: true, childList: true, attributes: true, attributeFilter: ['class', 'hidden'] });
    return () => observer.disconnect();
  }, [rootRef, lessonNumber, mode]);

  useEffect(() => {
    setAction('welcome');
  }, [scene.key, lessonNumber, mode]);

  const script = useMemo(() => buildScript(scene, lessonNumber, mode), [scene, lessonNumber, mode]);

  const mood: MentorMood = signal.kind === 'correct'
    ? 'happy'
    : signal.kind === 'wrong'
      ? 'encouraging'
      : action === 'hint' || action === 'why'
        ? 'thinking'
        : 'calm';

  const message = signal.kind === 'correct'
    ? script.success
    : signal.kind === 'wrong'
      ? script.retry
      : script[action];

  if (collapsed) {
    return (
      <button className="cat-mentor-collapsed" type="button" onClick={() => setCollapsed(false)} aria-label="Открыть наставника Пифагора">
        <CatAvatar mood={mood} />
        <span>Пифагор</span>
        {signal.kind !== 'idle' ? <i aria-hidden="true" /> : null}
      </button>
    );
  }

  return (
    <aside className={`cat-mentor-panel is-${mood}`} aria-label="Виртуальный наставник Пифагор">
      <header>
        <div>
          <span>Наставник</span>
          <b>Кот Пифагор</b>
        </div>
        <button type="button" onClick={() => setCollapsed(true)} aria-label="Свернуть наставника">×</button>
      </header>

      <div className="cat-mentor-portrait">
        <CatAvatar mood={mood} />
      </div>

      <div className="cat-mentor-bubble" key={`${scene.key}-${action}-${signal.version}`}>
        <p>{message}</p>
      </div>

      <div className="cat-mentor-actions" aria-label="Помощь наставника">
        <button type="button" className={action === 'different' ? 'active' : ''} onClick={() => setAction('different')}>
          <span aria-hidden="true">↻</span> Объясни иначе
        </button>
        <button type="button" className={action === 'example' ? 'active' : ''} onClick={() => setAction('example')}>
          <span aria-hidden="true">▣</span> Дай пример
        </button>
        <button type="button" className={action === 'hint' ? 'active' : ''} onClick={() => setAction('hint')}>
          <span aria-hidden="true">✦</span> Подсказка
        </button>
        <button type="button" className={action === 'why' ? 'active' : ''} onClick={() => setAction('why')}>
          <span aria-hidden="true">?</span> Почему так?
        </button>
      </div>
    </aside>
  );
}
