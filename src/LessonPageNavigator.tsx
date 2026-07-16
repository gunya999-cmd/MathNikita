import { useEffect, useMemo, useState } from 'react';
import { lessonOneStages } from './LessonPlayer';
import './lessonPageNavigator.css';

const STORAGE_KEY = 'mathnikita-lesson-1-progress-v2';

type SavedProgress = {
  version: 2;
  stageIndex: number;
  answer: string;
  ordered: string[];
  checked: boolean;
  correct: boolean;
  modelValue: number;
  results: Record<string, boolean>;
  completedAt?: string;
};

function readCurrentPage() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null') as Partial<SavedProgress> | null;
    return Math.min(Math.max(Number(parsed?.stageIndex) || 0, 0), lessonOneStages.length - 1);
  } catch {
    return 0;
  }
}

export function LessonPageNavigator() {
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(readCurrentPage);

  useEffect(() => {
    const updateVisibility = () => {
      const active = Boolean(document.querySelector('.lesson-runtime:not([hidden]) .lesson-player-page'));
      setVisible(active);
      if (!active) setOpen(false);
    };

    updateVisibility();
    const observer = new MutationObserver(updateVisibility);
    observer.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['hidden', 'class'] });
    return () => observer.disconnect();
  }, []);

  const groups = useMemo(() => [
    { label: 'Объяснение', indexes: [0, 1, 2, 3, 4, 5, 6, 7] },
    { label: 'Практика', indexes: [8, 9, 10, 11, 12, 13] },
    { label: 'Мини-проверка', indexes: [14, 15, 16, 17, 18] },
    { label: 'Завершение', indexes: [19, 20] },
  ], []);

  function jumpTo(index: number) {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null') as Partial<SavedProgress> | null;
      const next: SavedProgress = {
        version: 2,
        stageIndex: index,
        answer: '',
        ordered: [],
        checked: false,
        correct: false,
        modelValue: Number(parsed?.modelValue) || 1,
        results: parsed?.results ?? {},
        completedAt: parsed?.completedAt,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setCurrentPage(index);
      window.location.reload();
    } catch {
      window.location.reload();
    }
  }

  if (!visible) return null;

  return (
    <aside className={`lesson-page-navigator ${open ? 'is-open' : ''}`} aria-label="Навигация по страницам урока">
      <button className="lesson-page-navigator-toggle" type="button" onClick={() => setOpen(value => !value)} aria-expanded={open}>
        <span aria-hidden="true">☰</span>
        <b>Страница {currentPage + 1}/{lessonOneStages.length}</b>
      </button>

      {open ? (
        <div className="lesson-page-navigator-panel">
          <header>
            <div><span>Быстрый просмотр</span><b>Перейти к странице урока</b></div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Закрыть навигацию">×</button>
          </header>
          <p>Режим для взрослого: можно открыть любую страницу без прохождения предыдущих заданий. Уже сохранённые результаты не удаляются.</p>

          <div className="lesson-page-navigator-groups">
            {groups.map(group => (
              <section key={group.label}>
                <h3>{group.label}</h3>
                <div>
                  {group.indexes.map(index => {
                    const stage = lessonOneStages[index];
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
