'use client';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { SERVICES, PRICE_TABS, rub, t, DISCLAIMER, type Category } from '@/lib/data';
import { asset } from '@/lib/base';
import SectionIndex from './ui/SectionIndex';

export default function PriceList() {
  const [tab, setTab] = useState<Category>('figure');
  const rows = SERVICES.filter((s) => s.cat === tab);
  const preview = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [img, setImg] = useState<string | null>(null);

  // курсор-превью: капсульное фото процедуры следует за мышью с инерцией (lerp 0.15), только pointer: fine
  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return;
    const el = preview.current!, list = listRef.current!;
    let x = 0, y = 0, cx = 0, cy = 0, raf = 0, inside = false;
    const loop = () => {
      cx += (x - cx) * 0.15; cy += (y - cy) * 0.15;
      el.style.transform = `translate3d(${cx.toFixed(1)}px, ${cy.toFixed(1)}px, 0)`;
      raf = inside || Math.abs(x - cx) > 0.3 ? requestAnimationFrame(loop) : 0;
    };
    const move = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      x = e.clientX + 28; y = e.clientY - 70;
      if (!inside) { inside = true; cx = x; cy = y; }
      if (!raf) raf = requestAnimationFrame(loop);
    };
    const leave = () => { inside = false; setImg(null); };
    list.addEventListener('pointermove', move);
    list.addEventListener('pointerleave', leave);
    return () => { list.removeEventListener('pointermove', move); list.removeEventListener('pointerleave', leave); cancelAnimationFrame(raf); };
  }, []);

  const onKeyTabs = (e: React.KeyboardEvent) => {
    const i = PRICE_TABS.findIndex((x) => x.id === tab);
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const n = PRICE_TABS[(i + (e.key === 'ArrowRight' ? 1 : PRICE_TABS.length - 1)) % PRICE_TABS.length];
      setTab(n.id);
      document.getElementById(`ptab-${n.id}`)?.focus();
    }
  };

  return (
    <section className="prices sec" id="prices" aria-labelledby="prices-title">
      <i data-thread-anchor className="ta" style={{ left: '91vw', top: '80px' }} />
      <i data-thread-anchor className="ta" style={{ left: '94vw', top: 'calc(100% - 80px)' }} />
      <div className="wrap prices__grid">
        <header className="prices__head">
          <SectionIndex n="08" label="Прейскурант" />
          <h2 id="prices-title" className="h2">Цены</h2>
          <p className="prices__sub">{t('Цены — ориентир, точную стоимость курса назовём на консультации')}</p>
        </header>

        <div className="prices__body">
          <div className="ptabs" role="tablist" aria-label="Разделы прайса" onKeyDown={onKeyTabs}>
            {PRICE_TABS.map((x) => (
              <button
                key={x.id}
                id={`ptab-${x.id}`}
                role="tab"
                type="button"
                aria-selected={tab === x.id}
                aria-controls="ppanel"
                tabIndex={tab === x.id ? 0 : -1}
                className={`ptab ${tab === x.id ? 'is-on' : ''}`}
                onClick={() => setTab(x.id)}
              >
                {x.label}
                {tab === x.id && <motion.span layoutId="ptab-line" className="ptab__line" transition={{ type: 'spring', stiffness: 380, damping: 34 }} />}
              </button>
            ))}
          </div>

          <div ref={listRef} id="ppanel" role="tabpanel" aria-labelledby={`ptab-${tab}`} className="plist-wrap">
            <AnimatePresence mode="wait" initial={false}>
              <motion.ul key={tab} className="plist" initial="hide" animate="show" exit="out"
                variants={{ hide: {}, show: { transition: { staggerChildren: 0.045 } }, out: { opacity: 0, transition: { duration: 0.18 } } }}>
                {rows.map((s) => (
                  <motion.li
                    key={s.id}
                    className="prow"
                    variants={{ hide: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } } }}
                    onPointerEnter={(e) => { if (e.pointerType === 'mouse') setImg(s.img || null); }}
                  >
                    <div className="prow__line">
                      <span className="prow__name">{t(s.name)}</span>
                      <span className="prow__dots" aria-hidden="true" />
                      <span className="prow__price mono">
                        {s.min && <span className="prow__min">{s.min}{'\u00A0'}мин</span>}
                        {rub(s.price)}
                      </span>
                    </div>
                    <p className="prow__desc">
                      {t(s.desc)}
                      {s.gift && <span className="prow__gift mono">+ {s.gift}</span>}
                    </p>
                  </motion.li>
                ))}
              </motion.ul>
            </AnimatePresence>
          </div>
          <p className="prices__legal mono">{DISCLAIMER}</p>
        </div>
      </div>
      <div ref={preview} className={`ppreview ${img ? 'is-on' : ''}`} aria-hidden="true">
        {img && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={asset(`/images/${img}-800.webp`)} alt="" width={180} height={240} />
        )}
      </div>
    </section>
  );
}
