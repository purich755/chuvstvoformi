'use client';
import { useEffect, useRef } from 'react';
import { METHOD, t } from '@/lib/data';
import { gsap, ScrollTrigger, MQ_MOTION } from '@/lib/gsap';
import SectionIndex from './ui/SectionIndex';
import Capsule from './ui/Capsule';

export default function Method() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add(MQ_MOTION, () => {
      // линия от шага к шагу дорисовывается по скроллу
      gsap.fromTo('.method__rail-line', { scaleY: 0 }, {
        scaleY: 1, ease: 'none',
        scrollTrigger: { trigger: '.method__steps', start: 'top 70%', end: 'bottom 60%', scrub: 0.6 },
      });
      gsap.utils.toArray<HTMLElement>('.mstep').forEach((el) => {
        ScrollTrigger.create({ trigger: el, start: 'top 68%', onEnter: () => el.classList.add('is-passed'), onLeaveBack: () => el.classList.remove('is-passed') });
      });
      gsap.fromTo('.method__photo .capsule__img', { yPercent: -5 }, {
        yPercent: 5, ease: 'none', scrollTrigger: { trigger: ref.current, start: 'top bottom', end: 'bottom top', scrub: true },
      });
    });
    return () => mm.revert();
  }, []);

  return (
    <section ref={ref} className="method sec" id="method" aria-labelledby="method-title">
      <i data-thread-anchor className="ta" style={{ left: '56vw', top: '70px' }} />
      <div className="wrap method__grid">
        {/* TODO: заменить на портрет мастера после согласования */}
        <Capsule
          name="lpg-master"
          alt="Мастер ведёт процедуру LPG: клиентка в розовом костюме на кушетке"
          sizes="(max-width: 767px) 88vw, 36vw"
          className="method__photo"
        >
          <figcaption className="cap">LPG-процедура в кабинете студии</figcaption>
        </Capsule>

        <div className="method__body">
          <SectionIndex n="05" label="Метод" />
          <h2 id="method-title" className="h2">Ведёт за руку</h2>
          <p className="method__who mono">{METHOD.who}</p>
          <blockquote className="method__quote">
            <p>«{t(METHOD.quote)}»</p>
            <footer className="mono">{METHOD.quoteBy}</footer>
          </blockquote>

          <div className="method__steps">
            <span className="method__rail" aria-hidden="true"><span className="method__rail-line" /></span>
            {/* сквозная линия проходит ровно по рельсу шагов */}
            <i data-thread-anchor className="ta" style={{ left: '13px', top: '0px' }} />
            <i data-thread-anchor className="ta" style={{ left: '13px', top: 'calc(100% - 20px)' }} />
            <ol>
            {METHOD.steps.map((s, i) => (
              <li key={s.title} className="mstep">
                <span className="mstep__n mono" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="mstep__t">{t(s.title)}</h3>
                <p className="mstep__p">{t(s.text)}</p>
              </li>
            ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}

