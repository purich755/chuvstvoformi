'use client';
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, type PanInfo } from 'framer-motion';
import { VOICES, t } from '@/lib/data';
import { gsap, MQ_PIN } from '@/lib/gsap';
import SectionIndex from './ui/SectionIndex';

const TILT = [-3, 2.5, -2, 3.5, -2.8, 2, -3.6, 2.6];

function Note({ v, i }: { v: (typeof VOICES)[number]; i: number }) {
  return (
    <>
      <p className="note__q">{t(v.text)}</p>
      <p className="note__by">
        <span className="note__name">{v.name}</span>
        <span className="note__tag mono">{v.tag}</span>
      </p>
      <span className="note__n mono" aria-hidden="true">{String(i + 1).padStart(2, '0')} / {String(VOICES.length).padStart(2, '0')}</span>
    </>
  );
}

/** Мобайл: свайп-стопка — верхнюю записку тянем в сторону, она уходит под низ. */
function Deck() {
  const [order, setOrder] = useState(VOICES.map((_, i) => i));
  const next = () => setOrder((o) => [...o.slice(1), o[0]]);
  const onEnd = (_: unknown, info: PanInfo) => {
    if (Math.abs(info.offset.x) > 90 || Math.abs(info.velocity.x) > 500) next();
  };
  return (
    <div className="deck">
      <ul className="deck__stack" aria-live="polite">
        <AnimatePresence initial={false}>
          {order.slice(0, 3).reverse().map((idx) => {
            const top = idx === order[0];
            const depth = order.indexOf(idx);
            return (
              <motion.li
                key={idx}
                className="note deck__note"
                style={{ zIndex: 10 - depth }}
                initial={{ scale: 0.92, y: 24, opacity: 0 }}
                animate={{ scale: 1 - depth * 0.04, y: depth * 12, rotate: TILT[idx], opacity: 1 }}
                exit={{ x: 320, opacity: 0, rotate: 14, transition: { duration: 0.3 } }}
                transition={{ type: 'spring', stiffness: 260, damping: 26 }}
                drag={top ? 'x' : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.9}
                onDragEnd={top ? onEnd : undefined}
                aria-hidden={!top}
              >
                <Note v={VOICES[idx]} i={idx} />
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>
      <button type="button" className="deck__next mono" onClick={next}>Следующая записка →</button>
    </div>
  );
}

export default function Voices() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add(MQ_PIN, () => {
      const notes = gsap.utils.toArray<HTMLElement>('.vpin .note', ref.current);
      const tl = gsap.timeline({
        defaults: { ease: 'power2.in' },
        scrollTrigger: { trigger: '.vpin', start: 'top top', end: `+=${notes.length * 34}%`, pin: true, scrub: 0.7 },
      });
      notes.slice(0, -1).forEach((n, i) => {
        tl.to(n, { yPercent: -150, y: -120, rotate: TILT[i] * 4 + (i % 2 ? 10 : -10), duration: 1 }, i)
          .to(n, { opacity: 0, duration: 0.25, ease: 'none' }, i + 0.75);
      });
      tl.to({}, { duration: 0.6 });
    });
    return () => mm.revert();
  }, []);

  return (
    <section ref={ref} className="voices sec" id="voices" aria-labelledby="voices-title">
      <i data-thread-anchor className="ta" style={{ left: '90vw', top: '60px' }} />
      <i data-thread-anchor className="ta" style={{ left: '93vw', top: 'calc(100% - 60px)' }} />
      <div className="vpin">
        <div className="wrap vpin__grid">
          <header className="voices__head">
            <SectionIndex n="10" label="Голоса" />
            <h2 id="voices-title" className="h2">Что говорят после</h2>
            <p className="voices__src">{t('Короткие выдержки из отзывов гостей на Яндекс Картах.')}</p>
          </header>
          <ul className="vpin__stack">
            {VOICES.map((v, i) => (
              <li key={i} className="note" style={{ zIndex: VOICES.length - i, ['--r' as string]: `${TILT[i]}deg` }}>
                <Note v={v} i={i} />
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="wrap voices__mobile">
        <SectionIndex n="10" label="Голоса" />
        <h2 className="h2">Что говорят после</h2>
        <Deck />
      </div>
    </section>
  );
}
