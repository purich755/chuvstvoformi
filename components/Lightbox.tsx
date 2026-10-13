'use client';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { GALLERY } from '@/lib/data';
import { asset } from '@/lib/base';
import { dims } from '@/lib/images';
import { gsap, Flip } from '@/lib/gsap';

type Props = { index: number; flipState: Flip.FlipState | null; onClose: (i: number) => void };

/** Полноэкранный просмотр: --forest 96%, лента миниатюр, счётчик, стрелки, свайп, Esc/←/→, фокус-ловушка. Портал в body. */
export default function Lightbox({ index, flipState, onClose }: Props) {
  const [i, setI] = useState(index);
  const [muted, setMuted] = useState(true);
  const root = useRef<HTMLDivElement>(null);
  const item = GALLERY[i];
  const n = GALLERY.length;
  const go = useCallback((d: number) => setI((x) => (x + d + n) % n), [n]);

  // FLIP: фото перелетает из сетки
  useLayoutEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    gsap.fromTo(root.current, { backgroundColor: 'rgba(24,33,28,0)' }, { backgroundColor: 'rgba(24,33,28,.96)', duration: reduce ? 0 : 0.45 });
    gsap.fromTo('.lb__ui', { opacity: 0 }, { opacity: 1, duration: reduce ? 0 : 0.4, delay: reduce ? 0 : 0.25 });
    if (flipState && !reduce) {
      Flip.from(flipState, { targets: root.current!.querySelector('.lb__media [data-flip-id]'), duration: 0.6, ease: 'power3.inOut', scale: true, absolute: true });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const iRef = useRef(i);
  iRef.current = i;
  useEffect(() => {
    window.__lenis?.stop();
    const prevFocus = document.activeElement as HTMLElement | null;
    root.current!.querySelector<HTMLElement>('.lb__close')?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose(iRef.current);
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
      if (e.key === 'Tab') {
        const f = [...root.current!.querySelectorAll<HTMLElement>('button, [href], video[controls], [tabindex]:not([tabindex="-1"])')].filter((el) => !el.hasAttribute('disabled'));
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      window.__lenis?.start();
      prevFocus?.focus?.({ preventScroll: true });
    };
  }, [go, onClose]);

  // активная миниатюра — в центр ленты
  useEffect(() => {
    root.current?.querySelector<HTMLElement>(`[data-thumb="${i}"]`)?.scrollIntoView({ block: 'nearest', inline: 'center' });
  }, [i]);

  // свайп
  const sx = useRef<number | null>(null);
  const onDown = (e: React.PointerEvent) => { sx.current = e.clientX; };
  const onUp = (e: React.PointerEvent) => {
    if (sx.current === null) return;
    const dx = e.clientX - sx.current;
    sx.current = null;
    if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
  };

  const d = dims(item.img);
  return createPortal(
    <div ref={root} className="lb" role="dialog" aria-modal="true" aria-label={`Фото студии: ${item.caption}`} data-lenis-prevent>
      <div className="lb__media" onPointerDown={onDown} onPointerUp={onUp}>
        {item.video ? (
          <video
            key={item.id}
            data-flip-id={`g-${item.id}`}
            className="lb__img"
            src={asset(`/video/${item.video}.mp4`)}
            poster={asset(`/images/${item.img}-800.webp`)}
            autoPlay
            muted={muted}
            loop
            playsInline
            width={d.w}
            height={d.h}
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={item.id} data-flip-id={`g-${item.id}`} className="lb__img" src={asset(`/images/${item.img}-1600.webp`)} alt={item.alt} width={d.w} height={d.h} draggable={false} />
        )}
      </div>

      <div className="lb__ui">
        <p className="lb__count mono" aria-live="polite">{String(i + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}</p>
        <p className="lb__cap">{item.caption}</p>
        <button type="button" className="lb__close" onClick={() => onClose(i)} aria-label="Закрыть просмотр">Закрыть <span aria-hidden="true">×</span></button>
        <button type="button" className="lb__arrow lb__arrow--prev" onClick={() => go(-1)} aria-label="Предыдущее фото">←</button>
        <button type="button" className="lb__arrow lb__arrow--next" onClick={() => go(1)} aria-label="Следующее фото">→</button>
        {item.video && (
          <button type="button" className="lb__sound mono" onClick={() => setMuted((m) => !m)} aria-pressed={!muted}>
            {muted ? 'Включить звук' : 'Выключить звук'}
          </button>
        )}
        <ul className="lb__thumbs" aria-label="Миниатюры">
          {GALLERY.map((g, k) => (
            <li key={g.id}>
              <button type="button" data-thumb={k} className={`lb__thumb ${k === i ? 'is-on' : ''}`} onClick={() => setI(k)} aria-label={`Показать: ${g.caption}`} aria-current={k === i}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={asset(`/images/${g.img}-800.webp`)} alt="" loading="lazy" />
                {g.video && <span className="lb__play" aria-hidden="true">▶</span>}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>,
    document.body,
  );
}
