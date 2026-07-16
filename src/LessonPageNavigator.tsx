import { useEffect, useMemo, useState } from 'react';
import { lessonOneStages } from './LessonPlayer';
import './lessonPageNavigator.css';

type PageItem = { id: string; title: string };
type PageGroup = { label: string; indexes: number[] };

const lessonTwoPages: PageItem[] = [
  { id: 'l2-story', title: 'Сколько домов стоит между домами № 27 и № 35?' },
  { id: 'l2-step-one', title: 'У натурального ряда всегда шаг 1' },
  { id: 'l2-between-model', title: 'Между 7 и 12 находятся четыре числа' },
  { id: 'l2-between-guided', title: 'Границы не входят в ответ' },
  { id: 'l2-between-input', title: 'Не выписывай числа без необходимости' },
  { id: 'l2-inclusive', title: '«Между» и «от… до… включительно» — разные задачи' },
  { id: 'l2-successor-crossing', title: 'Следующее число может изменить сразу несколько цифр' },
  { id: 'l2-predecessor-crossing', title: 'Предыдущее число на единицу меньше' },
  { id: 'l2-sequence-model', title: 'Последовательность может иметь другой шаг' },
  { id: 'l2-sequence-up', title: 'Возрастающая последовательность' },
  { id: 'l2-sequence-down', title: 'Убывающая последовательность' },
  { id: 'l2-missing', title: 'Проверь правило с обеих сторон' },
  { id: 'l2-natural-vs-sequence', title: 'Не всякая закономерность — натуральный ряд' },
  { id: 'l2-counterexample', title: 'Одного контрпримера достаточно' },
  { id: 'l2-order', title: 'Верни числа на свои места' },
  { id: 'l2-general-rule', title: 'От конкретного примера — к формуле' },
  { id: 'l2-quiz1', title: 'Следующее число' },
  { id: 'l2-quiz2', title: 'Числа между границами' },
  { id: 'l2-quiz3', title: 'Шаг последовательности' },
  { id: 'l2-quiz4', title: 'Предыдущее число' },
  { id: 'l2-quiz5', title: 'Продолжение последовательности' },
  { id: 'l2-challenge', title: 'Большой промежуток без перебора' },
  { id: 'l2-summary', title: 'Урок завершён' },
];

const lessonOneGroups: PageGroup[] = [
  { label: 'Объяснение', indexes: [0, 1, 2, 3, 4, 5, 6, 7] },
  { label: 'Практика', indexes: [8, 9, 10, 11, 12, 13] },
  { label: 'Мини-проверка', indexes: [14, 15, 16, 17, 18] },
  { label: 'Завершение', indexes: [19, 20] },
];

const lessonTwoGroups: PageGroup[] = [
  { label: 'Натуральный ряд и промежутки', indexes: [0, 1, 2, 3, 4, 5, 6, 7] },
  { label: 'Закономерности и практика', indexes: [8, 9, 10, 11, 12, 13, 14, 15] },
  { label: 'Мини-проверка', indexes: [16, 17, 18, 19, 20] },
  { label: 'Завершение', indexes: [21, 22] },
];

function activeLessonNumber() {
  const toolbarText = document.querySelector<HTMLElement>('.lesson-mode-toolbar')?.textContent ?? '';
  if (/Урок\s+2\s+из/.test(toolbarText)) return 2;
  return Number(localStorage.getItem('mathnikita-selected-lesson')) === 2 ? 2 : 1;
}

function pagesForLesson(lessonNumber: number): PageItem[] {
  return lessonNumber === 2 ? lessonTwoPages : lessonOneStages;
}

function activeStageIndex(pages: PageItem[]) {
  const stage = document.querySelector<HTMLElement>('.lesson-runtime:not([hidden]) .interactive-stage');
  const stageId = stage?.dataset.stageId;
  if (stageId) {
    const byId = pages.findIndex(page => page.id === stageId);
    if (byId >= 0) return byId;
  }
  const title = stage?.querySelector<HTMLElement>('.stage-copy h2')?.textContent?.trim();
  const byTitle = pages.findIndex(page => page.title === title);
  return byTitle >= 0 ? byTitle : 0;
}

export function LessonPageNavigator() {
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const [lessonNumber, setLessonNumber] = useState(1);
  const [currentPage, setCurrentPage] = useState(0);

  const pages = useMemo(() => pagesForLesson(lessonNumber), [lessonNumber]);
  const groups = lessonNumber === 2 ? lessonTwoGroups : lessonOneGroups;

  useEffect(() => {
    const refresh = () => {
      const active = Boolean(document.querySelector('.lesson-runtime:not([hidden]) .lesson-player-page'));
      const nextLesson = activeLessonNumber();
      const nextPages = pagesForLesson(nextLesson);
      setVisible(active);
      setLessonNumber(nextLesson);
      if (active) setCurrentPage(activeStageIndex(nextPages));
      else setOpen(false);
    };

    refresh();
    const observer = new MutationObserver(refresh);
    observer.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['hidden', 'class', 'data-stage-id'] });
    return () => observer.disconnect();
  }, []);

  function jumpTo(targetIndex: number) {
    setOpen(false);

    const move = () => {
      const currentIndex = activeStageIndex(pages);
      if (currentIndex === targetIndex) {
        setCurrentPage(targetIndex);
        return;
      }

      const controls = document.querySelector<HTMLElement>('.lesson-runtime:not([hidden]) .lesson-controls');
      const buttons = controls?.querySelectorAll<HTMLButtonElement>('button');
      const button = targetIndex < currentIndex ? buttons?.[0] : buttons?.[1];
      if (!button) return;

      const wasDisabled = button.disabled;
      if (wasDisabled) button.disabled = false;
      button.click();
      if (wasDisabled) button.disabled = true;
      window.setTimeout(move, 45);
    };

    move();
  }

  if (!visible) return null;

  return (
    <aside className={`lesson-page-navigator ${open ? 'is-open' : ''}`} aria-label="Навигация по страницам урока">
      <button className="lesson-page-navigator-toggle" type="button" onClick={() => setOpen(value => !value)} aria-expanded={open}>
        <span aria-hidden="true">☰</span>
        <b>Страница {currentPage + 1}/{pages.length}</b>
      </button>

      {open ? (
        <div className="lesson-page-navigator-panel">
          <header>
            <div><span>Быстрый просмотр · урок {lessonNumber}</span><b>Перейти к странице урока</b></div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Закрыть навигацию">×</button>
          </header>
          <p>Режим для взрослого: можно открыть любую страницу без прохождения предыдущих заданий. Сохранённые результаты при просмотре не удаляются.</p>

          <div className="lesson-page-navigator-groups">
            {groups.map(group => (
              <section key={group.label}>
                <h3>{group.label}</h3>
                <div>
                  {group.indexes.map(index => {
                    const stage = pages[index];
                    return (
                      <button key={stage.id} type="button" className={index === currentPage ? 'active' : ''} onClick={() => jumpTo(index)}>
                        <span>{index + 1}</span>
                        <b>{stage.title}</b>
                      </button>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </div>
      ) : null}
    </aside>
  );
}
