'use client';
import { useEffect, useRef } from 'react';
import { MANIFESTO, t } from '@/lib/data';
import { gsap, MQ_MOTION } from '@/lib/gsap';
import SectionIndex from './ui/SectionIndex';

export default function Manifesto() {
  const ref = useRef<HTMLElement>(null);
  const words = t(MANIFESTO).split(' ');

  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add(MQ_MOTION, () => {
      // при загрузке текст полный (контраст), бледнеет только въезжая снизу и проявляется по словам
      gsap.fromTo(
        ref.current!.querySelectorAll('.mf__w'),
        { opacity: 0.15 },
        {
          opacity: 1,
          ease: 'none',
          stagger: 0.08,
          immediateRender: false,
          scrollTrigger: { trigger: '.mf__text', start: 'top 82%', end: 'bottom 45%', scrub: 0.4 },
        },
      );
    });
    return () => mm.revert();
  }, []);

  return (
    <section ref={ref} className="mf sec" aria-labelledby="mf-title">
      <i data-thread-anchor className="ta" style={{ left: '88vw', top: '90px' }} />
      <i data-thread-anchor className="ta" style={{ left: '93vw', top: '62%' }} />
      <div className="wrap mf__grid">
        <SectionIndex n="02" label="Манифест" className="mf__idx" />
        <h2 id="mf-title" className="mf__title mono">Без обещаний чуда</h2>
        <p className="mf__text">
          {words.map((w, i) => (
            <span key={i} className="mf__w">{w}{i < words.length - 1 ? ' ' : ''}</span>
          ))}
        </p>
        <p className="mf__sign hand">— Татьяна</p>
      </div>
    </section>
  );
}
