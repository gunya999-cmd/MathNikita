import { useMemo, useState } from 'react';

type Screen = 'home' | 'course' | 'lesson' | 'practice' | 'olympiad' | 'progress';

type Track = {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  progress: number;
  lessons: number;
  color: string;
};

const tracks: Track[] = [
  { id: 'numbers', icon: '✦', title: 'Числа и вычисления', subtitle: 'Натуральные числа, выражения, законы действий', progress: 18, lessons: 24, color: 'violet' },
  { id: 'problems', icon: '↗', title: 'Текстовые задачи', subtitle: 'Модели, движение, работа, части и проценты', progress: 8, lessons: 22, color: 'blue' },
  { id: 'fractions', icon: '◒', title: 'Дроби', subtitle: 'Смысл дроби, сравнение, действия и задачи', progress: 0, lessons: 26, color: 'orange' },
  { id: 'geometry', icon: '△', title: 'Геометрическая лаборатория', subtitle: 'Построения, разрезания, площади и симметрия', progress: 0, lessons: 18, color: 'green' },
  { id: 'logic', icon: '◇', title: 'Логика и комбинаторика', subtitle: 'Перебор, таблицы, деревья, контрпримеры', progress: 4, lessons: 20, color: 'pink' },
  { id: 'olympiad', icon: '♜', title: 'Олимпиадная тропа', subtitle: 'Чётность, инварианты, обратный ход, графы', progress: 0, lessons: 24, color: 'gold' },
];

const lessonSteps = [
  { n: '01', title: 'Разминка', text: 'Найди удобный способ считать быстрее, чем в столбик.', tag: '2 минуты' },
  { n: '02', title: 'Открытие', text: 'Исследуем, почему перестановка слагаемых не меняет сумму.', tag: 'интерактив' },
  { n: '03', title: 'Тренировка', text: 'Шесть заданий с постепенным усложнением.', tag: '6 задач' },
  { n: '04', title: 'Задача со звёздочкой', text: 'Один нестандартный сюжет на красивую идею.', tag: 'вызов' },
];

const olympiadMethods = [
  ['Чётность', 'Замечай, что может измениться, а что — нет.'],
  ['Обратный ход', 'Начинай рассуждение с результата и двигайся назад.'],
  ['Перебор без повторов', 'Организуй варианты таблицей или деревом.'],
  ['Контрпример', 'Одного точного примера достаточно, чтобы опровергнуть общее утверждение.'],
  ['Подсчёт двумя способами', 'Посчитай один объект по-разному и сравни результаты.'],
  ['Графы', 'Замени людей, города или связи точками и линиями.'],
];

export function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [answer, setAnswer] = useState('');
  const [result, setResult] = useState<'idle' | 'ok' | 'bad'>('idle');
  const totalProgress = useMemo(() => Math.round(tracks.reduce((s, t) => s + t.progress, 0) / tracks.length), []);

  function checkAnswer() {
    const normalized = answer.trim().replace(',', '.');
    setResult(normalized === '45' ? 'ok' : 'bad');
  }

  return (
    <div className="app">
      <header className="topbar">
        <button className="logo" onClick={() => setScreen('home')}><span>∑</span> Математика</button>
        <nav>
          <button className={screen === 'course' ? 'active' : ''} onClick={() => setScreen('course')}>Курс</button>
          <button className={screen === 'practice' ? 'active' : ''} onClick={() => setScreen('practice')}>Практика</button>
          <button className={screen === 'olympiad' ? 'active' : ''} onClick={() => setScreen('olympiad')}>Олимпиада</button>
          <button className={screen === 'progress' ? 'active' : ''} onClick={() => setScreen('progress')}>Прогресс</button>
        </nav>
        <div className="student-pill"><span>Н</span><div><b>Никита</b><small>5 класс</small></div></div>
      </header>

      <main>
        {screen === 'home' && (
          <section className="home">
            <div className="hero-card">
              <div className="hero-copy">
                <div className="kicker">Математика как приключение</div>
                <h1>Не зубри правила.<br/><em>Открывай идеи.</em></h1>
                <p>Школьная база, логика и олимпиадное мышление в одной последовательной программе.</p>
                <div className="hero-actions">
                  <button className="primary" onClick={() => setScreen('lesson')}>Продолжить урок</button>
                  <button className="secondary" onClick={() => setScreen('course')}>Открыть карту курса</button>
                </div>
                <div className="source-line">Основа: Мерзляк · Петерсон · Зубарева–Мордкович · Никольский · материалы 57-й школы · Раскина · Канель-Белов</div>
              </div>
              <div className="hero-visual">
                <div className="orbit orbit-one">7</div><div className="orbit orbit-two">π</div><div className="orbit orbit-three">△</div>
                <div className="core"><span>{totalProgress}%</span><small>путь начат</small></div>
              </div>
            </div>

            <div className="section-head"><div><span>Твоя карта</span><h2>Выбери направление</h2></div><button onClick={() => setScreen('course')}>Смотреть весь курс →</button></div>
            <div className="track-grid">
              {tracks.slice(0, 4).map((track) => <TrackCard key={track.id} track={track} onOpen={() => setScreen(track.id === 'olympiad' ? 'olympiad' : 'lesson')} />)}
            </div>

            <div className="daily-challenge">
              <div className="challenge-mark">✺</div>
              <div><span>Задача дня</span><h3>Сколько отрезков определяют 10 точек на одной прямой?</h3><p>Попробуй сначала для 3, 4 и 5 точек. Найди закономерность.</p></div>
              <button onClick={() => setScreen('practice')}>Принять вызов</button>
            </div>
          </section>
        )}

        {screen === 'course' && (
          <section className="page">
            <PageTitle eyebrow="Программа 5 класса" title="Карта математического пути" text="Базовый курс и олимпиадная линия идут параллельно и усиливают друг друга." />
            <div className="course-map">{tracks.map((track, i) => <div className="map-row" key={track.id}><div className="map-index">{String(i + 1).padStart(2, '0')}</div><TrackCard track={track} onOpen={() => setScreen(track.id === 'olympiad' ? 'olympiad' : 'lesson')} /></div>)}</div>
          </section>
        )}

        {screen === 'lesson' && (
          <section className="page lesson-page">
            <button className="back" onClick={() => setScreen('course')}>← К карте курса</button>
            <div className="lesson-layout">
              <div className="lesson-main">
                <div className="lesson-kicker">Урок 3 · Числа и вычисления</div>
                <h1>Считаем не больше,<br/>а <em>умнее</em></h1>
                <p className="lead">Сегодня ты научишься замечать структуру выражения и выбирать самый короткий путь.</p>
                <div className="idea-card"><span>Главная идея</span><h3>Удобные числа можно собирать в пары</h3><div className="math-demo"><b>27 + 38 + 73 + 62</b><i>→</i><b>(27 + 73) + (38 + 62)</b><i>→</i><strong>200</strong></div></div>
                <div className="step-list">{lessonSteps.map(step => <article key={step.n}><b>{step.n}</b><div><h3>{step.title}</h3><p>{step.text}</p></div><span>{step.tag}</span></article>)}</div>
                <button className="primary wide-button" onClick={() => setScreen('practice')}>Начать практику</button>
              </div>
              <aside className="lesson-side"><div className="streak"><b>3</b><span>дня подряд</span></div><h3>После урока ты сможешь</h3><ul><li>группировать слагаемые;</li><li>проверять ответ другим способом;</li><li>объяснять, почему приём работает;</li></ul><div className="mini-progress"><span>Прогресс темы</span><b>18%</b><div><i style={{width:'18%'}} /></div></div></aside>
            </div>
          </section>
        )}

        {screen === 'practice' && (
          <section className="page practice-page">
            <PageTitle eyebrow="Практическая работа" title="Треугольные числа" text="Не угадывай формулу. Построй маленькие случаи и найди систему." />
            <div className="task-shell">
              <div className="task-number">01 <span>/ 05</span></div>
              <div className="task-content"><div className="task-tag">Комбинаторика · базовый уровень</div><h2>На прямой отметили 10 точек. Сколько различных отрезков можно провести с концами в этих точках?</h2><div className="hint">Подсказка: из первой точки выходит 9 новых отрезков, из второй — уже 8 новых, затем 7…</div><div className="answer-row"><input value={answer} onChange={e => {setAnswer(e.target.value); setResult('idle')}} placeholder="Введи ответ" inputMode="numeric"/><button className="primary" onClick={checkAnswer}>Проверить</button></div>{result === 'ok' && <div className="feedback success"><b>Верно: 45</b><span>9 + 8 + 7 + … + 1 = 45. Ты организовал перебор без повторов.</span></div>}{result === 'bad' && <div className="feedback wrong"><b>Пока не сходится</b><span>Проверь, не посчитал ли ты один и тот же отрезок дважды.</span></div>}</div>
              <div className="task-tools"><button>✎ Черновик</button><button>◇ Показать рисунок</button><button>↺ Другой способ</button></div>
            </div>
          </section>
        )}

        {screen === 'olympiad' && (
          <section className="page olympiad-page">
            <PageTitle eyebrow="Олимпиадная траектория" title="Школа красивых идей" text="Не набор случайно сложных задач, а последовательное обучение методам мышления." />
            <div className="olympiad-banner"><div><span>Первый маршрут</span><h2>Логика → перебор → чётность → инварианты</h2><p>Начинаем с задач, доступных пятикласснику, и постепенно учимся формулировать доказательство.</p><button className="light-button" onClick={() => setScreen('practice')}>Начать маршрут</button></div><div className="trophy">♜<small>уровень 1</small></div></div>
            <div className="method-grid">{olympiadMethods.map(([title, text], i) => <article key={title}><span>{String(i + 1).padStart(2,'0')}</span><h3>{title}</h3><p>{text}</p><button onClick={() => setScreen('practice')}>Открыть →</button></article>)}</div>
          </section>
        )}

        {screen === 'progress' && (
          <section className="page">
            <PageTitle eyebrow="Личный кабинет" title="Прогресс без лишних оценок" text="Показываем не только результат, но и какие способы решения уже освоены." />
            <div className="progress-dashboard"><div className="big-score"><span>Общий прогресс</span><b>{totalProgress}%</b><p>Стартовая неделя</p></div><div className="skill-list">{tracks.map(t => <div key={t.id}><span>{t.title}</span><b>{t.progress}%</b><div><i style={{width:`${t.progress}%`}} /></div></div>)}</div><div className="insight"><span>Следующая цель</span><h3>Научиться организовывать перебор</h3><p>Рекомендуемый маршрут: таблицы → дерево вариантов → задачи на пары.</p><button className="primary" onClick={() => setScreen('practice')}>Продолжить</button></div></div>
          </section>
        )}
      </main>
    </div>
  );
}

function TrackCard({ track, onOpen }: { track: Track; onOpen: () => void }) {
  return <button className={`track-card ${track.color}`} onClick={onOpen}><div className="track-top"><span className="track-icon">{track.icon}</span><small>{track.lessons} урока</small></div><h3>{track.title}</h3><p>{track.subtitle}</p><div className="track-progress"><div><i style={{width:`${track.progress}%`}} /></div><b>{track.progress}%</b></div></button>;
}

function PageTitle({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) {
  return <div className="page-title"><span>{eyebrow}</span><h1>{title}</h1><p>{text}</p></div>;
}
