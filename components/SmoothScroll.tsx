'use client';
import { useEffect } from 'react';
import Lenis from 'lenis';
import { gsap, ScrollTrigger } from '@/lib/gsap';

declare global {
  interface Window { __lenis?: Lenis }
}

/** Lenis ↔ ScrollTrigger: один тикер GSAP, ScrollTrigger.update на каждый кадр прокрутки. */
export default function SmoothScroll() {
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let lenis: Lenis | undefined;
    let raf: ((time: number) => void) | undefined;
    if (!reduce) {
      lenis = new Lenis({ lerp: 0.09, smoothWheel: true, syncTouch: false });
      window.__lenis = lenis;
      lenis.on('scroll', ScrollTrigger.update);
      raf = (time: number) => lenis!.raf(time * 1000);
      gsap.ticker.add(raf);
      gsap.ticker.lagSmoothing(0);
    }

    // якоря: плавно и с учётом шапки (scroll-margin-top учитывает сам Lenis)
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest('a[href^="#"]') as HTMLAnchorElement | null;
      if (!a) return;
      const id = a.getAttribute('href')!.slice(1);
      const el = id ? document.getElementById(id) : null;
      if (!el) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(el, { duration: 1.4 });
      else el.scrollIntoView();
      history.replaceState(null, '', `#${id}`);
      window.dispatchEvent(new CustomEvent('cf:navigate'));
    };
    document.addEventListener('click', onClick);

    // шрифты и картинки меняют высоты — пересчитать пины, когда всё доехало
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener('load', refresh);
    document.fonts?.ready.then(refresh);

    return () => {
      document.removeEventListener('click', onClick);
      window.removeEventListener('load', refresh);
      if (raf) gsap.ticker.remove(raf);
      lenis?.destroy();
      delete window.__lenis;
    };
  }, []);
  return null;
}
