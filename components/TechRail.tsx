'use client';
import { useEffect, useRef, useState } from 'react';
import { TECH, t } from '@/lib/data';
import { gsap, MQ_PIN } from '@/lib/gsap';
import SectionIndex from './ui/SectionIndex';
import Photo from './ui/Photo';

function Plate({ kind }: { kind: 'fibers' | 'spheres' | 'waves' }) {
  return (
    <svg className="tcard__plate" viewBox="0 0 300 420" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      {kind === 'spheres' &&
        [0, 1, 2, 3, 4].map((r) => [0, 1, 2, 3, 4, 5, 6].map((c) => (
          <circle key={`${r}-${c}`} cx={30 + r * 60 + (c % 2) * 30} cy={40 + c * 56} r={22} fill="none" strokeWidth="1" />
        )))}
      {kind === 'fibers' &&
        Array.from({ length: 22 }, (_, i) => (
          <path key={i} d={`M${-40 + i * 18} 0 C ${-10 + i * 18} 140, ${-50 + i * 18} 280, ${-20 + i * 18} 420`} fill="none" strokeWidth="1" />
        ))}
      {kind === 'waves' &&
        Array.from({ length: 16 }, (_, i) => (
          <path key={i} d={`M0 ${20 + i * 26} C 50 ${8 + i * 26}, 100 ${8 + i * 26}, 150 ${20 + i * 26} S 250 ${32 + i * 26}, 300 ${20 + i * 26}`} fill="none" strokeWidth="1" />
        ))}
    </svg>
  );
}

export default function TechRail() {
  const ref = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(1);
  const total = TECH.length;

  useEffect(() => {
    const track = trackRef.current!;
    const mm = gsap.matchMedia();
    mm.add(MQ_PIN, () => {
      const dist = () => track.scrollWidth - track.clientWidth;
      gsap.to(track.querySelector('.trail__row'), {
        x: () => -dist(),
        ease: 'none',
        scrollTrigger: {
          trigger: '.trail__stage',
          start: 'top top',
          end: () => `+=${dist()}`,
          pin: true,
          scrub: 0.6,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            setIdx(Math.min(total, 1 + Math.floor(self.progress * total * 0.999)));
            ref.current!.style.setProperty('--trail-p', self.progress.toFixed(4));
          },
        },
      });
    });
    // мобайл / reduced-motion: нативная прокрутка ленты
    const onScroll = () => {
      const max = track.scrollWidth - track.clientWidth;
      if (max <= 0) return;
      const p = track.scrollLeft / max;
      setIdx(Math.min(total, 1 + Math.floor(p * total * 0.999)));
      ref.current!.style.setProperty('--trail-p', p.toFixed(4));
    };
    track.addEventListener('scroll', onScroll, { passive: true });
    return () => { mm.revert(); track.removeEventListener('scroll', onScroll); };
  }, [total]);

  return (
    <section ref={ref} className="trail" id="tech" aria-labelledby="tech-title">
      <i data-thread-anchor className="ta" style={{ left: '4vw', top: '70px' }} />
      <i data-thread-anchor className="ta" style={{ left: '3vw', top: 'calc(100% - 30px)' }} />
      <div className="trail__stage">
        <div className="wrap trail__head">
          <SectionIndex n="07" label="Технологии" />
          <h2 id="tech-title" className="h2">{t('Восемь аппаратов — один курс')}</h2>
          <div className="trail__progress" aria-hidden="true">
            <span className="trail__bar"><span className="trail__fill" /></span>
            <span className="trail__count mono">{String(idx).padStart(2, '0')} / {String(total).padStart(2, '0')}</span>
          </div>
        </div>
        <div className="trail__track" ref={trackRef} tabIndex={0} aria-label="Лента технологий, листается горизонтально">
          <ul className="trail__row">
            {TECH.map((c, i) => (
              <li key={c.id} className="tcard" data-cursor={c.img ? 'смотреть' : undefined}>
                <div className="tcard__media">
                  {c.img ? (
                    <Photo name={c.img} alt={`${c.name} — процедура в студии`} sizes="(max-width: 767px) 70vw, 24vw" className="tcard__img" />
                  ) : (
                    <Plate kind={c.pattern!} />
                  )}
                  <span className="tcard__n mono">{String(i + 1).padStart(2, '0')}</span>
                </div>
                <h3 className="tcard__name">{c.name}</h3>
                <p className="tcard__does">{t(c.does)}</p>
                <p className="tcard__meta mono">{c.meta}</p>
                {c.note && <p className="tcard__note">{c.note}</p>}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
