import { useEffect, useMemo, useState } from 'react';
import { lessonOneStages } from './LessonPlayer';
import './lessonPageNavigator.css';

function activeStageIndex() {
  const stageId = document.querySelector<HTMLElement>('.lesson-runtime:not([hidden]) .interactive-stage')?.dataset.stageId;
  const index = lessonOneStages.findIndex(stage => stage.id === stageId);
  return index >= 0 ? index : 0;
}

export function LessonPageNavigator() {
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    const refresh = () => {
      const active = Boolean(document.querySelector('.lesson-runtime:not([hidden]) .lesson-player-page'));
      setVisible(active);
      if (active) setCurrentPage(activeStageIndex());
      else setOpen(false);
    };

    refresh();
    const observer = new MutationObserver(refresh);
    observer.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['hidden', 'class', 'data-stage-id'] });
    return () => observer.disconnect();
  }, []);

  const groups = useMemo(() => [
    { label: 'Объяснение', indexes: [0, 1, 2, 3, 4, 5, 6, 7] },
    { label: 'Практика', indexes: [8, 9, 10, 11, 12, 13] },
    { label: 'Мини-проверка', indexes: [14, 15, 16, 17, 18] },
    { label: 'Завершение', indexes: [19, 20] },
  ], []);

  function jumpTo(targetIndex: number) {
    setOpen(false);

    const move = () => {
      const currentIndex = activeStageIndex();
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
        <b>Страница {currentPage + 1}/{lessonOneStages.length}</b>
      </button>

      {open ? (
        <div className="lesson-page-navigator-panel">
          <header>
            <div><span>Быстрый просмотр</span><b>Перейти к странице урока</b></div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Закрыть навигацию">×</button>
          </header>
          <p>Режим для взрослого: можно открыть любую страницу без прохождения предыдущих заданий. Сохранённые результаты при просмотре не удаляются.</p>

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
