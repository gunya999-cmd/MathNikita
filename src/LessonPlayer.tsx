import { useMemo, useState } from 'react';
import { allRichLessons, type LessonBlockKind } from './data/richLessonContent';
import './lessonPlayer.css';

const labels: Record<LessonBlockKind, string> = {
  motivation: 'Зачем это нужно', explanation: 'Объяснение', guided: 'Решаем вместе',
  practice: 'Закрепление', mistakes: 'Типичная ошибка', checkpoint: 'Проверочная работа',
  thinking: 'Подумай', olympiad: 'Задача со звёздочкой', summary: 'Итог урока',
};
const icons: Record<LessonBlockKind, string> = {
  motivation: '🎯', explanation: '📖', guided: '🤝', practice: '✍️', mistakes: '🔎',
  checkpoint: '✅', thinking: '🧠', olympiad: '⭐', summary: '🏁',
};
const normalize = (value: string) => value.trim().toLowerCase().replace(/\s+/g, '').replace(',', '.');

function VisualModel({ lessonNumber }: { lessonNumber: number }) {
  if (lessonNumber === 1) return <div className="visual-card number-road"><div className="visual-title">Натуральный ряд</div><div className="number-track">{[1,2,3,4,5,6,7,8].map(n=><span key={n}>{n}</span>)}<b>…</b></div><p>Каждое следующее число на 1 больше предыдущего.</p></div>;
  if (lessonNumber === 2) return <div className="visual-card pattern-card"><div className="visual-title">Найди шаг</div><div className="pattern-row"><span>5</span><i>+3</i><span>8</span><i>+3</i><span>11</span><i>+3</i><span>14</span></div><p>Сравни соседние числа — так находится правило последовательности.</p></div>;
  if (lessonNumber === 3) return <div className="visual-card digit-card"><div className="visual-title">Цифра и число — не одно и то же</div><div className="digit-demo"><b>507</b><div><span>5</span><span>0</span><span>7</span></div></div><p>Число 507 записано тремя цифрами.</p></div>;
  if (lessonNumber === 4) return <div className="visual-card place-card"><div className="visual-title">Разрядная таблица</div><div className="place-grid"><b>Тысячи</b><b>Сотни</b><b>Десятки</b><b>Единицы</b><span>3</span><span>2</span><span>0</span><span>5</span></div><p>3 205 = 3 000 + 200 + 5</p></div>;
  if (lessonNumber === 5) return <div className="visual-card class-card"><div className="visual-title">Классы больших чисел</div><div className="class-grid"><div><small>миллионы</small><b>4</b></div><div><small>тысячи</small><b>020</b></div><div><small>единицы</small><b>018</b></div></div><p>4 020 018 — четыре миллиона двадцать тысяч восемнадцать.</p></div>;
  return <div className="visual-card generic-visual"><div className="visual-title">Математическая модель</div><div className="generic-shapes"><span>①</span><i>→</i><span>②</span><i>→</i><span>③</span></div><p>Сначала пойми правило, затем примени его к задаче.</p></div>;
}

export function LessonPlayer() {
  const [lessonNumber, setLessonNumber] = useState(1);
  const [blockIndex, setBlockIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number,string>>({});
  const [checked, setChecked] = useState(false);
  const lesson = useMemo(() => allRichLessons.find(item => item.lessonNumber === lessonNumber) ?? allRichLessons[0], [lessonNumber]);
  const block = lesson.blocks[blockIndex];
  const progress = Math.round(((blockIndex + 1) / lesson.blocks.length) * 100);
  const isAssessment = block.kind === 'checkpoint';
  const score = isAssessment && block.answers?.length ? block.answers.reduce((sum, correct, index) => sum + (normalize(answers[index] ?? '') === normalize(correct) ? 1 : 0), 0) : 0;

  function selectLesson(next: number) { setLessonNumber(next); setBlockIndex(0); setAnswers({}); setChecked(false); }
  function move(delta: number) { setBlockIndex(index => Math.min(Math.max(index + delta, 0), lesson.blocks.length - 1)); setAnswers({}); setChecked(false); }

  return <main className="lesson-player-page">
    <aside className="lesson-catalog">
      <div className="catalog-head"><span>Курс 5 класса</span><b>Уроки и контроль</b><small>Начни с урока 1 и двигайся по порядку</small></div>
      <div className="lesson-list">{allRichLessons.map(item => <button key={item.lessonNumber} className={item.lessonNumber === lessonNumber ? 'active' : ''} onClick={() => selectLesson(item.lessonNumber)}><span>{item.lessonNumber}</span><div><b>{item.title}</b><small>{item.durationMinutes} минут</small></div></button>)}</div>
    </aside>

    <section className="lesson-workspace">
      <header className="lesson-header"><div><span>Урок {lesson.lessonNumber} из 175</span><h1>{lesson.title}</h1><p>{lesson.goal}</p></div><div className="lesson-duration">≈ {lesson.durationMinutes} мин</div></header>
      <div className="lesson-progress"><i style={{ width: `${progress}%` }} /></div>
      <nav className="lesson-steps" aria-label="Этапы урока">{lesson.blocks.map((item,index)=><button key={`${item.kind}-${index}`} className={index===blockIndex?'active':index<blockIndex?'done':''} onClick={()=>{setBlockIndex(index);setAnswers({});setChecked(false);}}><span>{index<blockIndex?'✓':icons[item.kind]}</span><small>{labels[item.kind]}</small></button>)}</nav>

      <article className={`lesson-block block-${block.kind}`}>
        <div className="block-kicker">{icons[block.kind]} {labels[block.kind]}</div>
        <h2>{block.title}</h2>
        <p className="block-text">{block.text}</p>
        {(block.kind === 'explanation' || block.kind === 'motivation') && <VisualModel lessonNumber={lesson.lessonNumber}/>} 

        {block.kind === 'guided' && block.items?.length ? <div className="guided-grid">{block.items.map((item,index)=><div className="worked-example" key={index}><span>Шаг {index+1}</span><b>{item}</b><p>{index===0?'Посмотри, какое правило используется.':'Проверь ответ обратным действием или рассуждением.'}</p></div>)}</div> : null}

        {block.kind === 'practice' && block.items?.length ? <div className="practice-sheet"><div className="sheet-head"><b>Тренировка</b><span>{block.items.length} заданий</span></div>{block.items.map((item,index)=><label key={index}><span><b>{index+1}.</b> {item}</span><input value={answers[index]??''} onChange={e=>setAnswers({...answers,[index]:e.target.value})} placeholder="Твой ответ"/></label>)}<div className="practice-note">Запиши ответы. На следующем этапе будет короткая проверочная работа.</div></div> : null}

        {isAssessment && block.items?.length ? <div className="assessment"><div className="assessment-head"><div><b>Мини-контроль</b><span>Выполни без подсказок</span></div><strong>{checked ? `${score}/${block.items.length}` : `${block.items.length} заданий`}</strong></div>{block.items.map((item,index)=>{const ok=checked && normalize(answers[index]??'')===normalize(block.answers?.[index]??'');return <label className={checked?(ok?'correct':'wrong'):''} key={index}><span><b>{index+1}.</b> {item}</span><div><input value={answers[index]??''} onChange={e=>setAnswers({...answers,[index]:e.target.value})} placeholder="Ответ"/><i>{checked?(ok?'✓':`Правильно: ${block.answers?.[index]}`):''}</i></div></label>})}<button className="check-button" onClick={()=>setChecked(true)}>Проверить работу</button>{checked&&<div className={`result-card ${score===block.items.length?'great':score>=Math.ceil(block.items.length*.6)?'ok':'review'}`}><b>{score===block.items.length?'Отлично! Тема усвоена.':score>=Math.ceil(block.items.length*.6)?'Хорошо. Ошибки стоит разобрать.':'Нужно повторение.'}</b><span>Результат: {Math.round(score/block.items.length*100)}%</span></div>}</div> : null}

        {block.items?.length && !['guided','practice','checkpoint'].includes(block.kind) ? <ol className="lesson-items">{block.items.map((item,index)=><li key={index}>{item}</li>)}</ol> : null}
        {block.kind==='mistakes'&&<div className="mistake-demo"><b>Не просто «неверно»</b><p>Приложение показывает, где именно возникла ошибка, и предлагает короткое повторение.</p></div>}
        {block.kind==='olympiad'&&<div className="olympiad-note">Не спеши. Попробуй найти идею. Подсказка: начни с простого случая.</div>}
      </article>

      <footer className="lesson-controls"><button onClick={()=>move(-1)} disabled={blockIndex===0}>← Назад</button><span>{blockIndex+1} из {lesson.blocks.length}</span>{blockIndex<lesson.blocks.length-1?<button className="primary" onClick={()=>move(1)}>Продолжить →</button>:<button className="primary" onClick={()=>selectLesson(Math.min(lessonNumber+1,allRichLessons.length))}>Следующий урок →</button>}</footer>
    </section>
  </main>;
}
