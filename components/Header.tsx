'use client';
import { useEffect, useRef, useState } from 'react';
import { NAV, CONTACTS, WA_CONSULT } from '@/lib/data';
import { useOpenStatus } from '@/lib/useOpenStatus';
import { LogoMark } from './Brand';

export default function Header() {
  const ref = useRef<HTMLElement>(null);
  const status = useOpenStatus();
  const [menu, setMenu] = useState(false);

  // вниз — прячется, вверх — выезжает с подложкой
  useEffect(() => {
    const el = ref.current!;
    let last = window.scrollY, raf = 0;
    const update = () => {
      raf = 0;
      const y = window.scrollY;
      el.classList.toggle('is-solid', y > 40);
      if (Math.abs(y - last) > 6) {
        el.classList.toggle('is-hidden', y > last && y > 240);
        last = y;
      }
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    const onNav = () => el.classList.remove('is-hidden');
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('cf:navigate', onNav);
    update();
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('cf:navigate', onNav); cancelAnimationFrame(raf); };
  }, []);

  useEffect(() => {
    if (!menu) return;
    window.__lenis?.stop();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenu(false); };
    window.addEventListener('keydown', onKey);
    return () => { window.__lenis?.start(); window.removeEventListener('keydown', onKey); };
  }, [menu]);

  const statusText = status ? status.label : CONTACTS.hours;

  return (
    <header ref={ref} className={`hdr ${menu ? 'is-menu' : ''}`}>
      <div className="hdr__in">
        <a href="#top" className="hdr__brand" aria-label="Чувство формы — в начало страницы" onClick={() => setMenu(false)}>
          <LogoMark className="hdr__logo" />
          <span className="hdr__name">Чувство формы</span>
        </a>
        <nav className="hdr__nav" aria-label="Разделы">
          {NAV.map((n) => (
            <a key={n.id} href={`#${n.id}`}>{n.label}</a>
          ))}
        </nav>
        <div className="hdr__right">
          <p className={`status ${status ? (status.open ? 'is-open' : 'is-closed') : ''}`} aria-live="polite">
            <span className="status__dot" aria-hidden="true" />
            <span className="status__txt">{statusText}</span>
          </p>
          <a className="hdr__cta" href={WA_CONSULT} target="_blank" rel="noopener noreferrer">Написать</a>
          <button
            className="hdr__burger"
            type="button"
            aria-expanded={menu}
            aria-controls="mobile-menu"
            aria-label={menu ? 'Закрыть меню' : 'Открыть меню'}
            onClick={() => setMenu((m) => !m)}
          >
            <span /><span />
          </button>
        </div>
      </div>
      <div id="mobile-menu" className="mmenu" hidden={!menu} data-lenis-prevent>
        <nav aria-label="Разделы (меню)">
          {NAV.map((n, i) => (
            <a key={n.id} href={`#${n.id}`} onClick={() => setMenu(false)}>
              <span className="mmenu__n">{String(i + 1).padStart(2, '0')}</span>
              {n.label}
            </a>
          ))}
        </nav>
        <div className="mmenu__foot">
          <a href={CONTACTS.phoneHref}>{CONTACTS.phone}</a>
          <p>{CONTACTS.address} · {CONTACTS.hours}</p>
        </div>
      </div>
    </header>
  );
}
