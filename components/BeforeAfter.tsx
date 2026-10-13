'use client';
import { useRef, useState } from 'react';
import { RESULTS, SHOW_RESULTS, t } from '@/lib/data';
import SectionIndex from './ui/SectionIndex';
import Photo from './ui/Photo';

function Slider({ r }: { r: (typeof RESULTS)[number] }) {
  const [pos, setPos] = useState(50);
  const box = useRef<HTMLDivElement>(null);
  const drag = useRef(false);

  const fromEvent = (clientX: number) => {
    const b = box.current!.getBoundingClientRect();
    setPos(Math.max(0, Math.min(100, ((clientX - b.left) / b.width) * 100)));
  };
  const onDown = (e: React.PointerEvent) => {
    drag.current = true;
    e.preventDefault();
    fromEvent(e.clientX);
    const move = (ev: PointerEvent) => drag.current && fromEvent(ev.clientX);
    const up = () => { drag.current = false; window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };
  const onKey = (e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 10 : 5;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { e.preventDefault(); setPos((p) => Math.max(0, p - step)); }
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { e.preventDefault(); setPos((p) => Math.min(100, p + step)); }
    if (e.key === 'Home') { e.preventDefault(); setPos(0); }
    if (e.key === 'End') { e.preventDefault(); setPos(100); }
  };

  return (
    <figure className={`ba ba--${r.id}`}>
      <div ref={box} className="ba__box" style={{ aspectRatio: `${r.w} / ${r.h}`, ['--pos' as string]: `${pos}%` }} onPointerDown={onDown} data-cursor="тянуть">
        <Photo name={r.after} alt={`После: ${r.caption}`} sizes="(max-width: 767px) 92vw, 44vw" className="ba__img" />
        <div className="ba__before">
          <Photo name={r.before} alt={`До: ${r.caption}`} sizes="(max-width: 767px) 92vw, 44vw" className="ba__img" />
        </div>
        <span className="ba__tag ba__tag--l mono" aria-hidden="true">до</span>
        <span className="ba__tag ba__tag--r mono" aria-hidden="true">после</span>
        <div
          className="ba__handle"
          role="slider"
          tabIndex={0}
          aria-label={`Сравнение до и после: ${r.caption}`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(pos)}
          aria-valuetext={`${Math.round(pos)}% кадра «до»`}
          onKeyDown={onKey}
        >
          <span className="ba__knob" aria-hidden="true" />
        </div>
      </div>
      <figcaption className="ba__cap mono">{t(r.caption)}</figcaption>
    </figure>
  );
}

export default function BeforeAfter() {
  if (!SHOW_RESULTS) return null;
  return (
    <section className="results sec" id="results" aria-labelledby="results-title">
      <i data-thread-anchor className="ta" style={{ left: '6vw', top: '80px' }} />
      <i data-thread-anchor className="ta" style={{ left: '4vw', top: 'calc(100% - 60px)' }} />
      <div className="wrap results__grid">
        <header className="results__head">
          <SectionIndex n="09" label="Результаты" />
          <h2 id="results-title" className="h2">До&nbsp;/ после</h2>
          <p className="results__note">{t('Кадры из галереи студии. Тяните линию, чтобы сравнить. Подписи — только то, что указано на самих фото.')}</p>
        </header>
        <div className="results__list">
          {RESULTS.map((r) => <Slider key={r.id} r={r} />)}
        </div>
        <p className="results__legal mono">Результаты индивидуальны. Имеются противопоказания</p>
      </div>
    </section>
  );
}
