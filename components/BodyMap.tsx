'use client';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BODY_ZONES, FACE_ZONES, svc, rub, wa, t, type Zone } from '@/lib/data';
import { BODY_STROKES, FACE_STROKES, BODY_SHAPES, FACE_SHAPES, BODY_DOTS, FACE_DOTS, type ZoneShape } from '@/lib/figures';
import { gsap } from '@/lib/gsap';
import { SPRING } from '@/lib/motion';
import SectionIndex from './ui/SectionIndex';

type Mode = 'body' | 'face';

function Figure({ mode, strokes, shapes, active, visible }: { mode: Mode; strokes: string[]; shapes: Record<string, ZoneShape[]>; active: string | null; visible: boolean }) {
  const ref = useRef<SVGSVGElement>(null);
  // при появлении фигура дорисовывается обводкой, уходящая — гаснет
  useEffect(() => {
    const paths = ref.current!.querySelectorAll('.fig__line');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!visible) { gsap.to(ref.current, { opacity: 0, duration: reduce ? 0 : 0.45, ease: 'power1.out' }); return; }
    gsap.to(ref.current, { opacity: 1, duration: reduce ? 0 : 0.35 });
    if (reduce) { gsap.set(paths, { strokeDashoffset: 0 }); return; }
    gsap.fromTo(paths, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.1, ease: 'power2.inOut', stagger: 0.05 });
  }, [visible]);
  return (
    <svg ref={ref} className={`fig fig--${mode}`} viewBox="0 0 400 900" aria-hidden="true" style={{ opacity: mode === 'body' ? 1 : 0 }}>
      {Object.entries(shapes).map(([id, list]) => (
        <g key={id} className={`fig__zone ${active === id ? 'is-on' : ''}`}>
          {list.map((e, i) => (
            <ellipse key={i} cx={e.cx} cy={e.cy} rx={e.rx} ry={e.ry} transform={e.rot ? `rotate(${e.rot} ${e.cx} ${e.cy})` : undefined} />
          ))}
        </g>
      ))}
      {strokes.map((d, i) => (
        <path key={i} d={d} className="fig__line" pathLength={1} strokeDasharray="1" strokeDashoffset="0" />
      ))}
    </svg>
  );
}

export default function BodyMap() {
  const [mode, setMode] = useState<Mode>('body');
  const [zoneId, setZoneId] = useState<string | null>(null);
  const zones: Zone[] = mode === 'body' ? BODY_ZONES : FACE_ZONES;
  const dots = mode === 'body' ? BODY_DOTS : FACE_DOTS;
  const zone = zones.find((z) => z.id === zoneId) || null;

  const switchMode = (m: Mode) => { if (m !== mode) { setMode(m); setZoneId(null); } };

  return (
    <section className="bmap sec" id="map" aria-labelledby="bmap-title">
      <i data-thread-anchor className="ta" style={{ left: '49vw', top: '40px' }} />
      <i data-thread-anchor className="ta" style={{ left: '50vw', top: '50%' }} />
      <i data-thread-anchor className="ta" style={{ left: '52vw', top: 'calc(100% - 50px)' }} />
      <div className="wrap bmap__grid">
        <header className="bmap__head">
          <SectionIndex n="04" label="Карта тела" />
          <h2 id="bmap-title" className="h2">{t('Где хочется почувствовать форму?')}</h2>
          <div className="seg" role="group" aria-label="Что показать">
            {(['body', 'face'] as Mode[]).map((m) => (
              <button key={m} type="button" className={`seg__btn ${mode === m ? 'is-on' : ''}`} aria-pressed={mode === m} onClick={() => switchMode(m)}>
                {m === 'body' ? 'Тело' : 'Лицо'}
              </button>
            ))}
          </div>
        </header>

        <div className="bmap__figure">
          <Figure mode="body" strokes={BODY_STROKES} shapes={BODY_SHAPES} active={mode === 'body' ? zoneId : null} visible={mode === 'body'} />
          <Figure mode="face" strokes={FACE_STROKES} shapes={FACE_SHAPES} active={mode === 'face' ? zoneId : null} visible={mode === 'face'} />
          <ul className="bmap__dots" key={mode}>
            {zones.map((z, i) => {
              const [x, y] = dots[z.id];
              return (
                <li key={z.id} style={{ left: `${(x / 400) * 100}%`, top: `${(y / 900) * 100}%`, ['--i' as string]: i }}>
                  <button
                    type="button"
                    className={`hot ${zoneId === z.id ? 'is-on' : ''}`}
                    aria-label={`Зона: ${z.label}`}
                    aria-pressed={zoneId === z.id}
                    aria-controls="bmap-panel"
                    onClick={() => setZoneId(z.id === zoneId ? null : z.id)}
                  >
                    <span className="hot__ring" aria-hidden="true" />
                    <span className="hot__tip" aria-hidden="true">{z.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="bmap__side" id="bmap-panel" aria-live="polite">
          <AnimatePresence mode="wait" initial={false}>
            {zone ? (
              <motion.div
                key={`${mode}-${zone.id}`}
                className="zpanel"
                initial={{ opacity: 0, x: 48 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24, transition: { duration: 0.2 } }}
                transition={SPRING}
              >
                <p className="mono zpanel__k">Зона</p>
                <h3 className="zpanel__title">{zone.label}</h3>
                <ul className="zpanel__list">
                  {zone.services.map((id, i) => {
                    const s = svc(id);
                    return (
                      <motion.li key={id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING, delay: 0.06 * i + 0.08 }}>
                        <span className="zpanel__name">{t(s.name)}</span>
                        <span className="zpanel__meta mono">{s.min ? `${s.min} мин · ` : ''}от {rub(s.price)}</span>
                      </motion.li>
                    );
                  })}
                </ul>
                <a className="mbtn mbtn--solid" href={wa(`Здравствуйте! Интересует работа с зоной: ${zone.label.toLowerCase()}`)} target="_blank" rel="noopener noreferrer">
                  <span className="mbtn__fill" aria-hidden="true" />
                  <span className="mbtn__label">Обсудить с мастером</span>
                </a>
              </motion.div>
            ) : (
              <motion.div key={`hint-${mode}`} className="zpanel zpanel--hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.15 } }}>
                <p className="zpanel__hint">{t('Нажмите на точку — покажем, какие процедуры студии работают с этой зоной, и сколько они стоят.')}</p>
                <ul className="zchips">
                  {zones.map((z) => (
                    <li key={z.id}><button type="button" className="zchip" onClick={() => setZoneId(z.id)}>{z.label}</button></li>
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
          <p className="bmap__note mono">{t('Точный курс подбирается на консультации — по вашим целям и замерам')}</p>
        </div>
      </div>
    </section>
  );
}
