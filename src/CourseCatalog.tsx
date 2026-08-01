import { useMemo,useState } from 'react';
import { richLessonByNumber } from './data/richLessonContent';
import { totalLessons,yearLessonByNumber,yearPlan,yearUnits,type YearLesson } from './data/yearPlan';
import './courseCatalog.css';
import './focusCourseNavigation.css';
import './coursePlanCatalog.css';

type Props={selectedLesson:number;onOpenLesson:(lessonNumber:number)=>void};

const readyDescriptions:Record<number,string>={
  5:'Обобщение § 2: чтение, запись и разбор многозначных чисел, ведущий нуль и задачи на количество цифр.',
  6:'Новая тема § 3: точка и отрезок, измерение и построение длины, равные отрезки и свойство AB = AC + CB.',
  7:'Закрепление § 3: измерение и построение, цепочки точек, перевод единиц и задачи № 59, 61, 63–66 и 75.',
  8:'Новая тема § 3: ломаная, её вершины и звенья, длина ломаной, замкнутые ломаные и задачи № 68, 71, 74, 77.',
  9:'Обобщение § 3: точка, отрезок, свойство длины, единицы, равные отрезки, ломаная и итоговый контроль темы.',
  10:'Новая тема § 4: плоскость, прямая, свойство прямой, обозначения прямых и луч с его началом.',
  11:'Закрепление § 4: геометрические построения, направления лучей, взаимное расположение фигур и задачи № 94, 95, 98, 99, 102.',
  12:'Обобщение § 4: свойства плоскости, прямой, луча и отрезка, смешанные задачи и итоговая проверка темы.',
  13:'Новая тема § 5: шкалы приборов, цена деления, координатный луч, единичный отрезок и координаты точек.',
  14:'Закрепление § 5: выбор масштаба, восстановление шага по двум точкам, построение координат и поиск ошибок.',
  15:'Обобщение § 5: точки между границами, восстановление шкалы, обратная проверка и итоговый контроль темы.',
  16:'Новая тема § 6: сравнение по количеству цифр и разрядам, знаки >, <, =, двойные неравенства и поиск граничных чисел.',
  17:'Закрепление § 6: связь «меньше — левее», «больше — правее», координатный луч, перебор цифр и ключевая задача № 155.',
  18:'Обобщение § 6: полный алгоритм сравнения, строгие границы, координаты и сравнение величин после перевода единиц.',
};

function planLabel(lesson:YearLesson){
  if(lesson.paragraph.startsWith('§'))return `${lesson.paragraph} · урок ${lesson.topicLessonIndex} из ${lesson.topicLessonCount}`;
  if(lesson.topicLessonCount>1)return `${lesson.paragraph} · урок ${lesson.topicLessonIndex} из ${lesson.topicLessonCount}`;
  return lesson.paragraph;
}

export function CourseCatalog({selectedLesson,onOpenLesson}:Props){
  const[query,setQuery]=useState('');
  const filteredLessons=useMemo(()=>{
    const normalized=query.trim().toLowerCase();
    if(!normalized)return yearPlan;
    return yearPlan.filter(lesson=>String(lesson.number).includes(normalized)||lesson.title.toLowerCase().includes(normalized)||lesson.unit.toLowerCase().includes(normalized)||lesson.paragraph.toLowerCase().includes(normalized));
  },[query]);
  const groups=useMemo(()=>yearUnits.map(unit=>({unit,lessons:filteredLessons.filter(lesson=>lesson.unit===unit)})).filter(group=>group.lessons.length),[filteredLessons]);
  const current=yearLessonByNumber.get(selectedLesson)??yearPlan[0];

  return <main className="course-catalog-page">
    <section className="course-catalog-hero">
      <div>
        <span>Математическая лаборатория · 5 класс</span>
        <h1>175 уроков по учебнику Мерзляка</h1>
        <p>Курс построен по I варианту примерного тематического планирования: 5 часов в неделю, 38 параграфов, повторение и контрольные работы.</p>
      </div>
      <div className="course-resume-card">
        <small>Продолжить обучение</small>
        <b>Урок {current.number} из {totalLessons}</b>
        <strong>{current.title}</strong>
        <span>{planLabel(current)}</span>
        <button type="button" onClick={()=>onOpenLesson(current.number)}>Перейти к уроку →</button>
      </div>
    </section>
    <section className="course-catalog-toolbar" aria-label="Поиск урока">
      <div>
        <b>{totalLessons} уроков в официальном плане</b>
        <span>Полностью готовы первые восемнадцать интерактивных уроков. Остальные сохранены в точной последовательности учебного года.</span>
      </div>
      <label>
        <span className="sr-only">Найти урок</span>
        <input value={query} onChange={event=>setQuery(event.target.value)} placeholder="Найти тему, параграф или номер урока"/>
      </label>
    </section>
    <div className="course-chapter-list">
      {groups.map((group,groupIndex)=>{
        const first=group.lessons[0];
        const last=group.lessons[group.lessons.length-1];
        const containsSelected=group.lessons.some(lesson=>lesson.number===selectedLesson);
        return <details className="course-chapter-group" key={group.unit} open={containsSelected||groupIndex===0||Boolean(query.trim())}>
          <summary>
            <div><small>{group.unit.startsWith('Глава')?'Раздел учебника':'Завершение курса'}</small><h2>{group.unit}</h2></div>
            <span>{first.number===last.number?`урок ${first.number}`:`уроки ${first.number}–${last.number}`} · {group.lessons.length}</span>
          </summary>
          <section className="course-lesson-grid" aria-label={group.unit}>
            {group.lessons.map(lesson=>{
              const ready=lesson.available||lesson.number===18;
              const selected=lesson.number===selectedLesson;
              const rich=richLessonByNumber.get(lesson.number);
              const description=ready?(readyDescriptions[lesson.number]??rich?.goal??planLabel(lesson)):planLabel(lesson);
              return <button key={lesson.number} type="button" className={`${ready?'is-interactive':'is-locked'} ${selected?'is-selected':''} is-${lesson.lessonType}`} onClick={()=>ready&&onOpenLesson(lesson.number)} disabled={!ready} aria-label={ready?`Открыть урок ${lesson.number}: ${lesson.title}`:`Урок ${lesson.number} в разработке`}>
                <span>{lesson.number}</span>
                <div><small>{ready?'Готов к прохождению':planLabel(lesson)}</small><b>{lesson.title}</b><p>{description}</p></div>
                <i aria-hidden="true">{ready?'→':lesson.lessonType==='control'||lesson.lessonType==='final'?'✓':'🔒'}</i>
              </button>;
            })}
          </section>
        </details>;
      })}
    </div>
    {!filteredLessons.length?<div className="course-empty-search">По такому запросу уроков не найдено.</div>:null}
  </main>;
}
