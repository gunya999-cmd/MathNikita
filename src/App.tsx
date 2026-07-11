import { useMemo, useState } from 'react';

type SkillId = 'arithmetic' | 'expressions' | 'wordProblems' | 'fractions' | 'geometry' | 'logic' | 'combinatorics';
type Phase = 'diagnostic' | 'lesson' | 'practice' | 'olympiad' | 'review' | 'complete';
type Screen = 'learn' | 'progress' | 'parent';

type SkillState = {
  mastery: number;
  attempts: number;
  correct: number;
  streak: number;
  needsReview: boolean;
};

type LearnerState = {
  diagnosticDone: boolean;
  textbookLesson: number;
  xp: number;
  days: number;
  completedSessions: number;
  skills: Record<SkillId, SkillState>;
};

type Task = {
  id: string;
  phase: Phase;
  skill: SkillId;
  title: string;
  prompt: string;
  answer: string;
  hint: string;
  explanation: string;
  difficulty: 1 | 2 | 3;
  visual?: 'pairs' | 'segments' | 'fraction' | 'parity';
};

const skillLabels: Record<SkillId, string> = {
  arithmetic: 'Вычисления',
  expressions: 'Выражения',
  wordProblems: 'Текстовые задачи',
  fractions: 'Дроби',
  geometry: 'Геометрия',
  logic: 'Логика',
  combinatorics: 'Комбинаторика',
};

const defaultSkill = (): SkillState => ({ mastery: 35, attempts: 0, correct: 0, streak: 0, needsReview: false });

const defaultState: LearnerState = {
  diagnosticDone: false,
  textbookLesson: 1,
  xp: 0,
  days: 1,
  completedSessions: 0,
  skills: {
    arithmetic: defaultSkill(), expressions: defaultSkill(), wordProblems: defaultSkill(), fractions: defaultSkill(),
    geometry: defaultSkill(), logic: defaultSkill(), combinatorics: defaultSkill(),
  },
};

const diagnosticTasks: Task[] = [
  { id:'d1', phase:'diagnostic', skill:'arithmetic', title:'Быстрый счёт', prompt:'Вычисли: 48 + 27', answer:'75', hint:'Собери сначала полный десяток.', explanation:'48 + 27 = 48 + 2 + 25 = 75.', difficulty:1, visual:'pairs' },
  { id:'d2', phase:'diagnostic', skill:'expressions', title:'Порядок действий', prompt:'Вычисли: 18 − 3 × 4', answer:'6', hint:'Сначала выполняется умножение.', explanation:'3 × 4 = 12, затем 18 − 12 = 6.', difficulty:1 },
  { id:'d3', phase:'diagnostic', skill:'wordProblems', title:'Задача', prompt:'В 4 коробках по 6 карандашей. 5 карандашей отдали. Сколько осталось?', answer:'19', hint:'Сначала найди, сколько было всего.', explanation:'4 × 6 = 24, 24 − 5 = 19.', difficulty:1 },
  { id:'d4', phase:'diagnostic', skill:'fractions', title:'Доли', prompt:'Какая часть закрашена, если из 8 равных частей закрашены 4? Запиши дробь.', answer:'1/2', hint:'4 из 8 можно сократить.', explanation:'4/8 = 1/2.', difficulty:1, visual:'fraction' },
  { id:'d5', phase:'diagnostic', skill:'geometry', title:'Геометрия', prompt:'Периметр квадрата равен 28 см. Чему равна сторона?', answer:'7', hint:'У квадрата четыре равные стороны.', explanation:'28 ÷ 4 = 7 см.', difficulty:1 },
  { id:'d6', phase:'diagnostic', skill:'logic', title:'Логика', prompt:'Все синие фишки круглые. Эта фишка синяя. Какая она по форме?', answer:'круглая', hint:'Используй условие «все».', explanation:'Из условия следует: синяя фишка обязательно круглая.', difficulty:1 },
];

const lessonTasks: Task[] = [
  { id:'l1', phase:'lesson', skill:'arithmetic', title:'Урок по учебнику · Удобные вычисления', prompt:'Вычисли удобным способом: 37 + 63 + 28 + 72', answer:'200', hint:'Собери пары, которые дают 100.', explanation:'37 + 63 = 100 и 28 + 72 = 100. Всего 200.', difficulty:1, visual:'pairs' },
  { id:'l2', phase:'practice', skill:'arithmetic', title:'Закрепление', prompt:'Вычисли: 46 + 54 + 19 + 81', answer:'200', hint:'Найди две пары по 100.', explanation:'46 + 54 = 100, 19 + 81 = 100.', difficulty:1, visual:'pairs' },
  { id:'l3', phase:'practice', skill:'expressions', title:'Проверяем понимание', prompt:'Расставь порядок действий и вычисли: 90 − 6 × 8', answer:'42', hint:'Начни с умножения.', explanation:'6 × 8 = 48, 90 − 48 = 42.', difficulty:2 },
  { id:'l4', phase:'olympiad', skill:'combinatorics', title:'Олимпиадная идея · Перебор без повторов', prompt:'На прямой отметили 5 точек. Сколько разных отрезков можно провести между ними?', answer:'10', hint:'Из первой точки — 4 новых, из второй — 3, затем 2 и 1.', explanation:'4 + 3 + 2 + 1 = 10. Каждый отрезок считаем один раз.', difficulty:2, visual:'segments' },
  { id:'l5', phase:'review', skill:'arithmetic', title:'Контроль через паузу', prompt:'Вычисли без столбика: 125 + 375 + 64 + 36', answer:'600', hint:'Собери 500 и 100.', explanation:'125 + 375 = 500, 64 + 36 = 100. Всего 600.', difficulty:2, visual:'pairs' },
];

function loadState(): LearnerState {
  try {
    const raw = localStorage.getItem('math-course-state-v2');
    return raw ? { ...defaultState, ...JSON.parse(raw) } : defaultState;
  } catch { return defaultState; }
}

function normalize(value: string) {
  return value.trim().toLowerCase().replace(',', '.').replace(/\s+/g, '');
}

export function App() {
  const [screen, setScreen] = useState<Screen>('learn');
  const [state, setState] = useState<LearnerState>(loadState);
  const [taskIndex, setTaskIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [wrongOnCurrent, setWrongOnCurrent] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [celebrate, setCelebrate] = useState(false);

  const tasks = state.diagnosticDone ? lessonTasks : diagnosticTasks;
  const current = tasks[Math.min(taskIndex, tasks.length - 1)];
  const averageMastery = useMemo(() => Math.round(Object.values(state.skills).reduce((s, x) => s + x.mastery, 0) / Object.keys(state.skills).length), [state]);
  const weakSkills = useMemo(() => (Object.entries(state.skills) as [SkillId, SkillState][]).filter(([,v]) => v.mastery < 55 || v.needsReview).sort((a,b) => a[1].mastery - b[1].mastery), [state]);

  function persist(next: LearnerState) {
    setState(next);
    localStorage.setItem('math-course-state-v2', JSON.stringify(next));
  }

  function check() {
    if (!answer.trim()) return;
    const correct = normalize(answer) === normalize(current.answer);
    const skill = state.skills[current.skill];
    const updatedSkill: SkillState = {
      ...skill,
      attempts: skill.attempts + 1,
      correct: skill.correct + (correct ? 1 : 0),
      streak: correct ? skill.streak + 1 : 0,
      mastery: Math.max(5, Math.min(100, skill.mastery + (correct ? (wrongOnCurrent ? 3 : 7) : -6))),
      needsReview: correct ? (skill.mastery < 45 && skill.attempts > 2) : true,
    };
    persist({ ...state, xp: state.xp + (correct ? 12 : 0), skills: { ...state.skills, [current.skill]: updatedSkill } });
    if (correct) {
      setFeedback('correct');
      setCelebrate(true);
      setTimeout(() => setCelebrate(false), 900);
    } else {
      setWrongOnCurrent(v => v + 1);
      setFeedback('wrong');
      setShowHint(true);
    }
  }

  function nextTask() {
    if (taskIndex < tasks.length - 1) {
      setTaskIndex(taskIndex + 1);
      setAnswer(''); setFeedback('idle'); setWrongOnCurrent(0); setShowHint(false);
      return;
    }
    if (!state.diagnosticDone) {
      const next = { ...state, diagnosticDone: true, textbookLesson: 1 };
      persist(next);
      setTaskIndex(0); setAnswer(''); setFeedback('idle'); setWrongOnCurrent(0); setShowHint(false);
    } else {
      const next = { ...state, textbookLesson: state.textbookLesson + 1, completedSessions: state.completedSessions + 1, days: state.days + 1 };
      persist(next);
      setTaskIndex(0); setAnswer(''); setFeedback('idle'); setWrongOnCurrent(0); setShowHint(false);
    }
  }

  return (
    <div className="app-shell">
      {celebrate && <div className="celebration"><i>✦</i><i>★</i><i>✦</i><i>◆</i><b>+12 XP</b></div>}
      <header className="topbar">
        <button className="brand" onClick={() => setScreen('learn')}><span>∑</span><div>Математика<small>личный маршрут</small></div></button>
        <nav>
          <button className={screen==='learn'?'active':''} onClick={() => setScreen('learn')}>Занятие</button>
          <button className={screen==='progress'?'active':''} onClick={() => setScreen('progress')}>Мой прогресс</button>
          <button className={screen==='parent'?'active':''} onClick={() => setScreen('parent')}>Для родителя</button>
        </nav>
        <div className="xp-pill"><b>{state.xp}</b><span>XP</span></div>
      </header>

      {screen === 'learn' && (
        <main className="learn-page">
          <section className="today-card">
            <div><span>{state.diagnosticDone ? `Урок ${state.textbookLesson} по программе` : 'Стартовая диагностика'}</span><h1>{state.diagnosticDone ? 'Сегодняшний маршрут уже готов' : 'Начинаем с нескольких коротких задач'}</h1><p>{state.diagnosticDone ? 'Приложение само выбрало объяснение, тренировку, повторение и олимпиадную задачу.' : 'Ничего выбирать не нужно. Ответы помогут определить темп и объём повторения.'}</p></div>
            <div className="route-strip">{tasks.map((t,i)=><span key={t.id} className={i<taskIndex?'done':i===taskIndex?'current':''}>{i+1}<small>{t.phase==='diagnostic'?'тест':t.phase==='olympiad'?'идея':t.phase==='review'?'контроль':t.phase}</small></span>)}</div>
          </section>

          <section className="task-card">
            <div className="task-meta"><span>{skillLabels[current.skill]}</span><b>{taskIndex+1} / {tasks.length}</b></div>
            <div className="task-layout">
              <div className="task-main">
                <div className="phase-tag">{current.title}</div>
                <h2>{current.prompt}</h2>
                {current.visual && <Visual type={current.visual} />}
                <div className="answer-box"><input value={answer} onChange={e=>{setAnswer(e.target.value);setFeedback('idle')}} placeholder="Введи ответ" onKeyDown={e=>e.key==='Enter'&&check()} /><button onClick={check}>Проверить</button></div>
                {showHint && feedback==='wrong' && <div className="hint-box"><b>Подсказка</b><span>{current.hint}</span></div>}
                {feedback==='correct' && <div className="feedback good"><b>Верно!</b><span>{current.explanation}</span><button onClick={nextTask}>{taskIndex===tasks.length-1 ? (state.diagnosticDone?'Завершить занятие':'Составить мой маршрут') : 'Продолжить →'}</button></div>}
                {feedback==='wrong' && <div className="feedback bad"><b>Это полезная ошибка</b><span>Приложение добавит короткое повторение по этой теме. Попробуй ещё раз.</span></div>}
              </div>
              <aside>
                <div className="companion"><div className="bot-face">⌁</div><b>Математический проводник</b><p>{feedback==='wrong'?'Не спеши. Ошибка показывает, что именно надо потренировать.':current.phase==='olympiad'?'Здесь важен не быстрый ответ, а красивая идея.':'Решай своим способом. После ответа сравним рассуждения.'}</p></div>
                <div className="session-info"><span>Сегодня</span><b>{tasks.length} шагов</b><small>примерно 15–20 минут</small></div>
              </aside>
            </div>
          </section>
        </main>
      )}

      {screen === 'progress' && (
        <main className="dashboard">
          <header><span>Карта знаний</span><h1>Приложение следит за навыками, а не только за оценками</h1></header>
          <div className="score-row"><article><span>Освоение курса</span><b>{averageMastery}%</b><small>обновляется после каждого ответа</small></article><article><span>Занятий завершено</span><b>{state.completedSessions}</b><small>учебный темп регулируется автоматически</small></article><article><span>Текущий урок</span><b>{state.textbookLesson}</b><small>движение по плану учебника</small></article></div>
          <div className="skills-grid">{(Object.entries(state.skills) as [SkillId,SkillState][]).map(([id,s])=><article key={id}><div><b>{skillLabels[id]}</b><span>{s.mastery}%</span></div><div className="bar"><i style={{width:`${s.mastery}%`}}/></div><small>{s.needsReview?'Запланировано повторение':s.mastery>75?'Можно ускорить темп':'Идёт плановое изучение'}</small></article>)}</div>
        </main>
      )}

      {screen === 'parent' && (
        <main className="dashboard parent-view">
          <header><span>Родительский обзор</span><h1>Что происходит с учебной траекторией</h1></header>
          <div className="parent-grid"><article><h3>Текущий режим</h3><p>Ученик проходит темы последовательно по школьному плану. При устойчивом результате приложение сокращает число однотипных упражнений и быстрее переходит дальше.</p></article><article><h3>Зоны внимания</h3>{weakSkills.length?<ul>{weakSkills.slice(0,4).map(([id,s])=><li key={id}><b>{skillLabels[id]}</b><span>{s.mastery}% · будет дополнительное повторение</span></li>)}</ul>:<p>Выраженных пробелов пока нет.</p>}</article><article><h3>Олимпиадная линия</h3><p>В каждом занятии есть одна задача на идею: перебор, чётность, обратный ход, графы, инварианты или доказательство.</p></article><article><h3>Как корректируется курс</h3><p>Одна ошибка вызывает подсказку. Повторяющиеся ошибки добавляют объяснение, упрощённую тренировку и контроль через несколько заданий.</p></article></div>
        </main>
      )}
    </div>
  );
}

function Visual({type}:{type:NonNullable<Task['visual']>}) {
  if (type==='pairs') return <div className="visual pairs"><span>37</span><i>+</i><span>63</span><b>= 100</b><span>28</span><i>+</i><span>72</span><b>= 100</b></div>;
  if (type==='segments') return <div className="visual segments"><i/><i/><i/><i/><i/></div>;
  if (type==='fraction') return <div className="visual fraction">{Array.from({length:8}).map((_,i)=><i key={i} className={i<4?'filled':''}/>)}</div>;
  return <div className="visual parity"><span>1</span><span>2</span><span>3</span><span>4</span></div>;
}
