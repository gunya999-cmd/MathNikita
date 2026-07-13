import type { RichLessonContent } from './data/richLessonContent';
import './lessonOpening.css';

export type LessonOpeningData = {
  kicker: string;
  title: string;
  intro: string;
  question: string;
  goals: string[];
  durationMinutes: number;
  icon?: string;
};

const openingPatterns: Array<{
  match: RegExp;
  icon: string;
  question: (title: string) => string;
}> = [
  { match: /натураль|цифр|разряд|числ/i, icon: '🔢', question: () => 'Как числа помогают не просто считать, а замечать порядок и закономерности?' },
  { match: /отрез|длин|периметр|площад|угол|геометр/i, icon: '📐', question: () => 'Как превратить рисунок или измерение в точное математическое рассуждение?' },
  { match: /сложен|вычитан|умножен|делен|выражен/i, icon: '🧠', question: () => 'Можно ли решить задачу быстрее, если увидеть структуру вычислений?' },
  { match: /дроб/i, icon: '🍰', question: () => 'Как описать часть целого так, чтобы её можно было сравнивать и вычислять?' },
  { match: /уравнен/i, icon: '⚖️', question: () => 'Как найти неизвестное, сохраняя равновесие между двумя частями?' },
];

export function buildGenericOpening(lesson: RichLessonContent): LessonOpeningData {
  const pattern = openingPatterns.find(item => item.match.test(lesson.title));
  const motivation = lesson.blocks.find(block => block.kind === 'motivation')?.text;
  const guided = lesson.blocks.find(block => block.kind === 'guided')?.title ?? 'Разберём пример';
  const practice = lesson.blocks.find(block => block.kind === 'practice')?.title ?? 'Потренируемся';
  const checkpoint = lesson.blocks.find(block => block.kind === 'checkpoint')?.title ?? 'Проверим себя';

  return {
    kicker: `Урок ${lesson.lessonNumber} · настрой на тему`,
    title: lesson.title,
    intro: motivation ?? `Сегодня мы разберём тему «${lesson.title}» и выясним, как она работает в задачах.`,
    question: pattern?.question(lesson.title) ?? `Как тема «${lesson.title}» помогает рассуждать точнее и решать задачи увереннее?`,
    goals: [lesson.goal, guided, `${practice} и ${checkpoint.toLowerCase()}`],
    durationMinutes: lesson.durationMinutes,
    icon: pattern?.icon ?? '✨',
  };
}

export const lessonOneOpening: LessonOpeningData = {
  kicker: 'Урок 1 · сначала удивимся',
  title: 'Натуральные числа и натуральный ряд',
  intro: 'Представь: ты считаешь пять книг и измеряешь стол пятью одинаковыми мерками. Действия разные, но ответ в обоих случаях — число 5. Почему?',
  question: 'Что общего у счёта предметов и измерения длины — и почему натуральный ряд никогда не заканчивается?',
  goals: [
    'Свяжем натуральные числа со счётом и измерением.',
    'Разберём, как устроен натуральный ряд и почему у него нет последнего числа.',
    'Научимся доказывать, искать контрпример и решать задачи повышенного уровня.',
  ],
  durationMinutes: 35,
  icon: '🔭',
};

export function LessonOpening({ data, onStart }: { data: LessonOpeningData; onStart: () => void }) {
  return (
    <section className="lesson-opening" aria-labelledby="lesson-opening-title">
      <div className="lesson-opening-main">
        <div className="lesson-opening-icon" aria-hidden="true">{data.icon}</div>
        <div className="lesson-opening-copy">
          <span>{data.kicker}</span>
          <h1 id="lesson-opening-title">{data.title}</h1>
          <p>{data.intro}</p>
        </div>
      </div>

      <div className="lesson-opening-question">
        <small>Вопрос перед началом</small>
        <b>{data.question}</b>
        <span>Ответ пока не нужен. Вернёмся к нему в конце урока.</span>
      </div>

      <div className="lesson-opening-plan">
        <div>
          <span>За урок</span>
          <strong>{data.durationMinutes} мин</strong>
        </div>
        <ol>
          {data.goals.map((goal, index) => <li key={goal}><i>{index + 1}</i><span>{goal}</span></li>)}
        </ol>
      </div>

      <button className="lesson-opening-start" type="button" onClick={onStart}>
        Начать урок <span aria-hidden="true">→</span>
      </button>
    </section>
  );
}
