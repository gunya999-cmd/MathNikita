import { useEffect, useMemo, useState, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import './mentorMarkerOverlay.css';

type MentorMarkerOverlayProps = {
  rootRef: RefObject<HTMLElement | null>;
  lessonNumber: number;
  mode: 'opening' | 'lesson';
  sceneKey: string;
  title: string;
  body: string;
  prompt: string;
  action: 'welcome' | 'different' | 'example' | 'hint' | 'why';
};

function extractBounds(text: string) {
  const values = (text.match(/\d[\d\s\u00a0]*/g) ?? [])
    .map(value => Number(value.replace(/[\s\u00a0]/g, '')))
    .filter(value => Number.isFinite(value));

  const unique = values.filter((value, index) => values.indexOf(value) === index);
  if (unique.length < 2) return null;
  const [first, second] = unique;
  return first <= second ? [first, second] as const : [second, first] as const;
}

export function MentorMarkerOverlay({
  rootRef,
  lessonNumber,
  mode,
  sceneKey,
  title,
  body,
  prompt,
  action,
}: MentorMarkerOverlayProps) {
  const [mountNode, setMountNode] = useState<HTMLElement | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const refresh = () => {
      const next = root.querySelector<HTMLElement>('.lesson-runtime:not([hidden]) .interactive-stage');
      setMountNode(previous => previous === next ? previous : next);
    };

    refresh();
    const observer = new MutationObserver(refresh);
    observer.observe(root, { subtree: true, childList: true, attributes: true, attributeFilter: ['class', 'hidden'] });
    return () => observer.disconnect();
  }, [rootRef, lessonNumber, mode]);

  useEffect(() => setDismissed(false), [sceneKey, action]);

  const data = useMemo(() => {
    const text = `${prompt} ${title} ${body}`;
    const isRelevant = /между|границ|промежут|включительно/i.test(text);
    const bounds = extractBounds(`${prompt} ${title}`) ?? extractBounds(body);
    if (!isRelevant || !bounds) return null;

    const [left, right] = bounds;
    const difference = right - left;
    if (difference <= 0) return null;
    const inclusive = /включительно/i.test(text);
    const result = inclusive ? difference + 1 : Math.max(0, difference - 1);
    const visibleNumbers = difference <= 12
      ? Array.from({ length: difference + 1 }, (_, index) => left + index)
      : [left, right];

    return { left, right, difference, inclusive, result, visibleNumbers };
  }, [title, body, prompt]);

  const shouldShow = lessonNumber === 2
    && mode === 'lesson'
    && action !== 'welcome'
    && Boolean(data)
    && Boolean(mountNode)
    && !dismissed;

  if (!shouldShow || !data || !mountNode) return null;

  return createPortal(
    <section className={`mentor-marker-overlay marker-${action}`} aria-label="Разбор Пифагора электронным маркером">
      <header>
        <div>
          <span>Электронный маркер</span>
          <b>Пифагор показывает ход мысли</b>
        </div>
        <button type="button" onClick={() => setDismissed(true)} aria-label="Скрыть разбор">×</button>
      </header>

      <div className="mentor-number-track" style={{ '--marker-count': data.visibleNumbers.length } as React.CSSProperties}>
        {data.visibleNumbers.map((number, index) => {
          const boundary = index === 0 || index === data.visibleNumbers.length - 1;
          const hiddenGap = data.difference > 12 && index === 1;
          return (
            <div key={`${number}-${index}`} className={boundary ? 'is-boundary' : 'is-between'}>
              {hiddenGap ? <span className="marker-ellipsis">…</span> : <span>{number.toLocaleString('ru-RU')}</span>}
              {!boundary && !hiddenGap ? <i aria-hidden="true" /> : null}
            </div>
          );
        })}
        <svg className="mentor-marker-arc" viewBox="0 0 600 90" preserveAspectRatio="none" aria-hidden="true">
          <path d="M18 72 C140 4 460 4 582 72" />
        </svg>
      </div>

      <div className="mentor-marker-formula">
        <div><span>Сначала разность</span><b>{data.right.toLocaleString('ru-RU')} − {data.left.toLocaleString('ru-RU')} = {data.difference.toLocaleString('ru-RU')}</b></div>
        <i aria-hidden="true">↓</i>
        <div className="is-result">
          <span>{data.inclusive ? 'Обе границы считаются' : 'Границы не считаются'}</span>
          <b>{data.difference.toLocaleString('ru-RU')} {data.inclusive ? '+ 1' : '− 1'} = <strong>{data.result.toLocaleString('ru-RU')}</strong></b>
        </div>
      </div>

      <p>{data.inclusive
        ? 'При подсчёте от одного числа до другого включительно добавляем левую границу: разность плюс один.'
        : 'Разность показывает число шагов. Чисел строго между границами на одно меньше.'}</p>
    </section>,
    mountNode,
  );
}
