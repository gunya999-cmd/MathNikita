import { useMemo, useState } from 'react';

type Track = {
  id: string;
  title: string;
  subtitle: string;
  level: string;
  xp: number;
  skills: string[];
  mission: string;
};

const tracks: Track[] = [
  {
    id: 'logic',
    title: 'Логика детектива',
    subtitle: 'Высказывания, отрицания, примеры и контрпримеры',
    level: 'Старт',
    xp: 120,
    skills: ['Истина и ложь', 'Контрпример', 'Если… то…'],
    mission: 'Найди утверждение, которое нельзя опровергнуть одним примером.',
  },
  {
    id: 'counting',
    title: 'Комбинаторная лаборатория',
    subtitle: 'Таблицы, деревья вариантов и кодирование',
    level: 'База',
    xp: 180,
    skills: ['Перебор', 'Таблицы', 'Дерево вариантов'],
    mission: 'Сколько трёхзначных кодов можно составить из цифр 1, 2 и 3 без повторений?',
  },
  {
    id: 'parity',
    title: 'Секрет чётности',
    subtitle: 'Как замечать невозможные ситуации',
    level: 'Продвинутый',
    xp: 220,
    skills: ['Чётность', 'Инвариант', 'Доказательство'],
    mission: 'Можно ли получить нечётную сумму, складывая только пары нечётных чисел?',
  },
  {
    id: 'reverse',
    title: 'Обратный ход',
    subtitle: 'Решаем задачу с конца и восстанавливаем начало',
    level: 'Продвинутый',
    xp: 240,
    skills: ['Анализ с конца', 'Цепочки действий', 'Стратегия'],
    mission: 'Число дважды увеличили на 3 и получили 17. Восстанови исходное число.',
  },
  {
    id: 'graphs',
    title: 'Города и дороги',
    subtitle: 'Первые графы, связи и подсчёт двумя способами',
    level: 'Исследователь',
    xp: 300,
    skills: ['Графы', 'Соответствие', 'Двойной подсчёт'],
    mission: 'Каждые два из пяти городов соединены дорогой. Сколько дорог построено?',
  },
];

export function Olympiad() {
  const [activeId, setActiveId] = useState(tracks[0].id);
  const active = useMemo(() => tracks.find((track) => track.id === activeId) ?? tracks[0], [activeId]);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState('');

  function checkMission() {
    const normalized = answer.trim().toLowerCase();
    const accepted: Record<string, string[]> = {
      logic: ['все', 'общее', 'универсальное'],
      counting: ['6'],
      parity: ['нет', 'нельзя'],
      reverse: ['11'],
      graphs: ['10'],
    };
    const isCorrect = accepted[active.id].some((item) => normalized.includes(item));
    setFeedback(isCorrect ? `Верно! +${active.xp} XP. Открыт следующий шаг.` : 'Пока не сходится. Попробуй маленький случай или нарисуй схему.');
  }

  return (
    <section className="panel wide olympiad-hub">
      <div className="olympiad-hero">
        <div>
          <span className="eyebrow">Олимпиадная траектория</span>
          <h2>Учимся находить идею, а не угадывать формулу</h2>
          <p>Маршрут строится от логики и перебора к чётности, инвариантам, графам и доказательствам. Каждая тема начинается с короткой миссии и заканчивается исследованием.</p>
        </div>
        <div className="olympiad-rank">
          <strong>Уровень 1</strong>
          <span>Юный исследователь</span>
          <div className="progress-track"><div style={{ width: '28%' }} /></div>
          <small>280 / 1000 XP</small>
        </div>
      </div>

      <div className="olympiad-layout">
        <div className="olympiad-map">
          {tracks.map((track, index) => (
            <button
              key={track.id}
              className={`olympiad-node ${track.id === activeId ? 'active' : ''}`}
              onClick={() => { setActiveId(track.id); setAnswer(''); setFeedback(''); }}
            >
              <span>{index + 1}</span>
              <div>
                <strong>{track.title}</strong>
                <small>{track.subtitle}</small>
              </div>
              <em>{track.level}</em>
            </button>
          ))}
        </div>

        <article className="mission-card">
          <div className="mission-topline">
            <span>{active.level}</span>
            <strong>+{active.xp} XP</strong>
          </div>
          <h3>{active.title}</h3>
          <p>{active.mission}</p>
          <div className="source-chips">
            {active.skills.map((skill) => <span key={skill}>{skill}</span>)}
          </div>
          <label className="form">
            <span>Твой ответ или идея решения</span>
            <input value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder="Напиши ответ…" />
          </label>
          <div className="hero-actions">
            <button className="btn btn-primary" onClick={checkMission}>Проверить идею</button>
            <button className="btn btn-secondary" onClick={() => setFeedback('Подсказка: упрости задачу, нарисуй таблицу или начни рассуждать с конца.')}>Дать подсказку</button>
          </div>
          {feedback && <div className={feedback.startsWith('Верно') ? 'success-box' : 'hint-box'}>{feedback}</div>}
        </article>
      </div>

      <div className="olympiad-principles">
        <article><strong>1. Маленький случай</strong><span>Проверяем идею на простом примере.</span></article>
        <article><strong>2. Модель</strong><span>Переводим условие в таблицу, схему, граф или дерево.</span></article>
        <article><strong>3. Доказательство</strong><span>Объясняем, почему решение работает всегда.</span></article>
        <article><strong>4. Обобщение</strong><span>Меняем условие и открываем новую закономерность.</span></article>
      </div>
    </section>
  );
}
