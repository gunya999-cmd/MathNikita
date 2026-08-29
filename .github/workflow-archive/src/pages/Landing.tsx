import { Button } from '../components/Button';

export function Landing({ onStart }: { onStart: () => void }) {
  return (
    <section className="hero">
      <div className="eyebrow">MathNikita 2.0 · AI репетитор · 1–12 классы</div>
      <h1>Спокойный умный урок математики каждый день.</h1>
      <p>Диагностика уровня, переключение школьного класса, персональный урок дня и понятные объяснения без перегруза интерфейса.</p>
      <div className="hero-actions">
        <Button onClick={onStart}>Начать обучение</Button>
        <Button variant="secondary" onClick={onStart}>Пройти диагностику</Button>
      </div>
    </section>
  );
}
