import type { BoardBlock, LessonBoardScene } from '../data/lessonBoard';

function BoardBlockView({ block }: { block: BoardBlock }) {
  if (block.type === 'title') {
    return <div className="board-title-block">{block.text}</div>;
  }

  if (block.type === 'idea') {
    return <div className="board-idea"><strong>Идея</strong><span>{block.text}</span></div>;
  }

  if (block.type === 'model') {
    return <div className="board-model"><strong>Модель</strong><span>{block.text}</span></div>;
  }

  if (block.type === 'steps') {
    return (
      <div className="board-steps">
        <strong>{block.title}</strong>
        <ol>
          {block.items.map((item) => <li key={item}>{item}</li>)}
        </ol>
      </div>
    );
  }

  if (block.type === 'example') {
    return (
      <div className="board-example">
        <strong>Пример</strong>
        <p>{block.problem}</p>
        <ol>
          {block.steps.map((step) => <li key={step}>{step}</li>)}
        </ol>
        <div className="board-answer">Ответ: {block.answer}</div>
      </div>
    );
  }

  if (block.type === 'question') {
    return <div className="board-question"><strong>?</strong><span>{block.text}</span></div>;
  }

  return <div className="board-summary"><strong>Итог</strong><span>{block.text}</span></div>;
}

export function InteractiveBoard({ scene }: { scene: LessonBoardScene }) {
  return (
    <section className="interactive-board" aria-label="Интерактивная доска урока">
      <div className="board-topbar">
        <span className="board-dot" />
        <strong>{scene.boardTitle}</strong>
        <span>MathNikita board</span>
      </div>
      <div className="board-canvas">
        {scene.blocks.map((block, index) => <BoardBlockView block={block} key={`${block.type}-${index}`} />)}
      </div>
    </section>
  );
}
