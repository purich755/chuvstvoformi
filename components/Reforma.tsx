'use client';
import { useEffect, useRef } from 'react';
import { REFORMA, wa, t } from '@/lib/data';
import { gsap, MQ_MOTION } from '@/lib/gsap';
import SectionIndex from './ui/SectionIndex';
import MagneticButton from './ui/MagneticButton';

export default function Reforma() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add(MQ_MOTION, () => {
      // трекинг «дышит»: 0.02em → 0.12em → 0.04em
      const tl = gsap.timeline({ scrollTrigger: { trigger: ref.current, start: 'top bottom', end: 'bottom top', scrub: 0.6 } });
      tl.fromTo('.reforma__word', { letterSpacing: '0.02em' }, { letterSpacing: '0.12em', ease: 'sine.inOut', duration: 1 })
        .to('.reforma__word', { letterSpacing: '0.04em', ease: 'sine.inOut', duration: 1 });
    });
    return () => mm.revert();
  }, []);

  return (
    <section ref={ref} className="reforma" id="reforma" aria-labelledby="reforma-title" data-thread-dark>
      <i data-thread-anchor className="ta" style={{ left: 'calc(var(--gut) * 0.3)', top: '60px' }} />
      <i data-thread-anchor className="ta" style={{ left: 'calc(var(--gut) * 0.35)', top: '60%' }} />
      <i data-thread-anchor className="ta" style={{ left: 'calc(var(--gut) * 0.4)', top: 'calc(100% - 40px)' }} />
      <div className="wrap">
        <SectionIndex n="06" label="Курс" light />
        <h2 id="reforma-title" className="reforma__word" aria-label="Курс «Реформа»">
          <span aria-hidden="true">РЕФОРМА</span>
        </h2>
        <div className="reforma__grid">
          <p className="reforma__lead">{t(REFORMA.lead)}</p>
          <ol className="reforma__points">
            {REFORMA.points.map((p, i) => (
              <li key={p}><span className="mono">{String(i + 1).padStart(2, '0')}</span>{t(p)}</li>
            ))}
          </ol>
          <div className="reforma__cta">
            <MagneticButton href={wa('Здравствуйте! Расскажите, пожалуйста, о курсе «Реформа»')} external variant="light">Узнать о курсе</MagneticButton>
            <MagneticButton href="#gift" variant="light">Подарить курс</MagneticButton>
          </div>
        </div>
      </div>
    </section>
  );
}
