'use client';
import { useEffect, useRef, useState } from 'react';
import { LAYERS, t } from '@/lib/data';
import { gsap, MQ_PIN } from '@/lib/gsap';
import SectionIndex from './ui/SectionIndex';

function Pattern({ kind, id }: { kind: string; id: string }) {
  return (
    <svg className="plate__pat" viewBox="0 0 400 260" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        {kind === 'skin' && (
          <pattern id={id} width="14" height="14" patternUnits="userSpaceOnUse">
            <circle cx="3" cy="4" r="1.1" />
            <circle cx="10" cy="11" r="0.8" />
          </pattern>
        )}
        {kind === 'tissue' && (
          <pattern id={id} width="80" height="18" patternUnits="userSpaceOnUse">
            <path d="M0 9 C 20 1, 20 1, 40 9 S 60 17, 80 9" fill="none" strokeWidth="1" />
          </pattern>
        )}
        {kind === 'muscle' && (
          <pattern id={id} width="9" height="260" patternUnits="userSpaceOnUse" patternTransform="rotate(-24)">
            <path d="M2 0 C 4 80, 0 180, 2 260" fill="none" strokeWidth="1" />
          </pattern>
        )}
      </defs>
      <rect x="0" y="0" width="400" height="260" fill={`url(#${id})`} />
    </svg>
  );
}

export default function Layers() {
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState(-1); // -1 — стопка, 0..2 — слой, 3 — «все три»

  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add(MQ_PIN, () => {
      const plates = gsap.utils.toArray<HTMLElement>('.plate', ref.current);
      const tl = gsap.timeline({
        defaults: { ease: 'power2.inOut' },
        scrollTrigger: {
          trigger: '.layers__stage',
          start: 'top top',
          end: '+=300%',
          pin: true,
          scrub: 0.8,
          onUpdate: (self) => {
            const p = self.progress;
            setActive(p < 0.1 ? -1 : p < 0.38 ? 0 : p < 0.62 ? 1 : p < 0.84 ? 2 : 3);
          },
        },
      });
      // 0 → 0.15: стопка раздвигается
      tl.to(plates[0], { z: 210, duration: 0.15 }, 0.02)
        .to(plates[2], { z: -210, duration: 0.15 }, 0.02)
        // 0.84 → 1: складываются обратно
        .to(plates[0], { z: 26, duration: 0.14 }, 0.84)
        .to(plates[2], { z: -26, duration: 0.14 }, 0.84)
        .to('.layers__stack', { rotateZ: -4, duration: 1, ease: 'none' }, 0);
    });
    return () => mm.revert();
  }, []);

  return (
    <section ref={ref} className="layers sec" id="layers" aria-labelledby="layers-title" data-active={active}>
      <i data-thread-anchor className="ta" style={{ left: '4vw', top: '60px' }} />
      <i data-thread-anchor className="ta" style={{ left: '3vw', top: 'calc(100% - 60px)' }} />

      {/* десктоп: пин-сцена */}
      <div className="layers__stage">
        <div className="wrap layers__grid">
          <div className="layers__text">
            <SectionIndex n="03" label="Слои" />
            <h2 id="layers-title" className="h2">Три слоя формы</h2>
            <p className="layers__intro">{t('Тело — это слои, и каждая технология работает со своим. Поэтому курс собирается из нескольких аппаратов.')}</p>
            <div className="layers__states" aria-live="polite">
              {LAYERS.map((l, i) => (
                <div key={l.id} className={`lstate ${active === i ? 'is-on' : ''}`} aria-hidden={active !== i}>
                  <p className="lstate__n mono">{l.n} / {l.name}</p>
                  <p className="lstate__about">{l.about}</p>
                  <ul className="lstate__tech">
                    {l.tech.map((x) => <li key={x}>{t(x)}</li>)}
                  </ul>
                </div>
              ))}
              <p className={`lstate lstate--all ${active === 3 ? 'is-on' : ''}`} aria-hidden={active !== 3}>
                {t('Курс — это когда работают все три')}
              </p>
            </div>
          </div>

          <div className="layers__scene" aria-hidden="true">
            <div className="layers__stack">
              {LAYERS.map((l, i) => (
                <div key={l.id} className={`plate plate--${l.id} ${active === i || active === 3 ? 'is-lit' : ''} ${active >= 0 && active < 3 && active !== i ? 'is-dim' : ''}`} style={{ ['--z' as string]: `${(1 - i) * 26}px` }}>
                  <Pattern kind={l.id} id={`pat-${l.id}`} />
                  <span className="plate__label mono">{l.n} · {l.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* мобайл и reduced-motion: три карточки */}
      <div className="wrap layers__cards">
        <SectionIndex n="03" label="Слои" />
        <h2 className="h2">Три слоя формы</h2>
        <p className="layers__intro">{t('Тело — это слои, и каждая технология работает со своим.')}</p>
        {LAYERS.map((l) => (
          <article key={l.id} className={`lcard lcard--${l.id}`}>
            <div className="lcard__plate" aria-hidden="true"><Pattern kind={l.id} id={`patm-${l.id}`} /></div>
            <p className="lstate__n mono">{l.n} / {l.name}</p>
            <h3 className="lstate__about">{l.about}</h3>
            <ul className="lstate__tech">
              {l.tech.map((x) => <li key={x}>{t(x)}</li>)}
            </ul>
          </article>
        ))}
        <p className="lcard__all">{t('Курс — это когда работают все три')}</p>
      </div>
    </section>
  );
}
