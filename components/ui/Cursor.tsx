'use client';
import { useEffect, useRef, useState } from 'react';

/** Кольцо 10px за курсором; над фото и капсулами — 64px с подписью из data-cursor. Только pointer: fine. */
export default function Cursor() {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)');
    if (!fine.matches) return;
    setOn(true);
    const el = ref.current!;
    let x = -100, y = -100, cx = -100, cy = -100, raf = 0, shown = false;
    const label = el.querySelector('span')!;
    const loop = () => {
      cx += (x - cx) * 0.22; cy += (y - cy) * 0.22;
      el.style.transform = `translate3d(${cx.toFixed(1)}px, ${cy.toFixed(1)}px, 0)`;
      raf = Math.abs(x - cx) + Math.abs(y - cy) > 0.2 ? requestAnimationFrame(loop) : 0;
    };
    const move = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      x = e.clientX; y = e.clientY;
      if (!shown) { shown = true; cx = x; cy = y; el.classList.add('is-on'); }
      const t = (e.target as HTMLElement).closest<HTMLElement>('[data-cursor]');
      const hide = (e.target as HTMLElement).closest('input, textarea, select, iframe, [data-cursor-hide]');
      el.classList.toggle('is-big', !!t);
      el.classList.toggle('is-hidden', !!hide);
      label.textContent = t?.dataset.cursor ?? '';
      if (!raf) raf = requestAnimationFrame(loop);
    };
    const out = () => { el.classList.remove('is-on'); shown = false; };
    window.addEventListener('pointermove', move, { passive: true });
    document.documentElement.addEventListener('pointerleave', out);
    return () => {
      window.removeEventListener('pointermove', move);
      document.documentElement.removeEventListener('pointerleave', out);
      cancelAnimationFrame(raf);
    };
  }, []);
  return (
    <div ref={ref} className="cursor" aria-hidden="true" style={{ display: on ? undefined : 'none' }}>
      <span />
    </div>
  );
}
