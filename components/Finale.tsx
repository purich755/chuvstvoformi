'use client';
import { useEffect, useRef } from 'react';
import { CONTACTS, FINALE, WA_CONSULT, t } from '@/lib/data';
import { gsap } from '@/lib/gsap';
import MagneticButton from './ui/MagneticButton';
import { LogoLines, Signature } from './Brand';

/** Финал: ровная линия дорисовывает силуэт из логотипа, подпись пишется обводкой (2 с). */
export default function Finale() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = ref.current!;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const lines = root.querySelectorAll<SVGPathElement>('.fin__art .sil-path');
    const glyphs = root.querySelectorAll<SVGPathElement>('.sign-glyph');
    const leaves = root.querySelectorAll('.fin__art .logo-leaves');
    gsap.set(lines, { strokeDasharray: 1, strokeDashoffset: 1 });
    gsap.set(glyphs, { strokeDasharray: 1, strokeDashoffset: 1, fillOpacity: 0 });
    gsap.set(leaves, { opacity: 0 });
    const tl = gsap.timeline({ paused: true });
    tl.to(lines, { strokeDashoffset: 0, duration: 1.6, ease: 'power2.inOut', stagger: { amount: 0.5 } })
      .to(leaves, { opacity: 1, duration: 0.8, ease: 'power2.out' }, 1.1)
      .to(glyphs, { strokeDashoffset: 0, duration: 2, ease: 'power1.inOut', stagger: { amount: 1.2 } }, 1.2)
      .to(glyphs, { fillOpacity: 1, duration: 0.8, ease: 'power1.out' }, 2.6);
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { tl.play(); io.disconnect(); } }, { threshold: 0.35 });
    io.observe(root.querySelector('.fin__mark')!);
    return () => { io.disconnect(); tl.kill(); };
  }, []);

  return (
    <section ref={ref} className="fin" aria-labelledby="fin-title" data-thread-dark>
      <div className="wrap fin__in">
        <div className="fin__mark">
          <i data-thread-anchor="end" className="ta fin__anchor" />
          <LogoLines className="fin__art" width={6} />
          <Signature className="fin__sign" />
        </div>
        <h2 id="fin-title" className="fin__title">{t(FINALE)}</h2>
        <div className="fin__cta">
          <MagneticButton href={WA_CONSULT} external variant="light">WhatsApp</MagneticButton>
          <MagneticButton href={CONTACTS.telegram} external variant="light">Telegram</MagneticButton>
          <MagneticButton href={CONTACTS.phoneHref} variant="light">Позвонить</MagneticButton>
        </div>
      </div>
    </section>
  );
}
