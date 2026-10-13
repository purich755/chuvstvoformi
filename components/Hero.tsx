'use client';
import { useEffect, useRef } from 'react';
import { HERO, WA_CONSULT, t } from '@/lib/data';
import { gsap, MQ_MOTION } from '@/lib/gsap';
import MagneticButton from './ui/MagneticButton';
import Photo from './ui/Photo';
import { LogoLines } from './Brand';

export default function Hero() {
  const ref = useRef<HTMLElement>(null);

  // параллакс фото внутри капсулы (8–10%)
  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add(MQ_MOTION, () => {
      gsap.fromTo(
        '.hero__photo .capsule__img',
        { yPercent: -4 },
        { yPercent: 5, ease: 'none', scrollTrigger: { trigger: ref.current, start: 'top top', end: 'bottom top', scrub: true } },
      );
    });
    return () => mm.revert();
  }, []);

  return (
    <section ref={ref} id="top" className="hero" aria-labelledby="hero-title">
      <i data-thread-anchor="start" className="ta" style={{ left: 'var(--gut-line)', top: '118px' }} />
      <i data-thread-anchor className="ta" style={{ left: 'calc(var(--gut-line) + 1vw)', top: '58%' }} />
      <i data-thread-anchor="hero-end" className="ta" style={{ left: 'var(--gut-line)', top: 'calc(100% - 40px)' }} />

      <div className="hero__grid wrap">
        <div className="hero__text">
          <p className="hero__kicker mono">Студия аппаратной коррекции · Казань</p>
          <h1 id="hero-title" className="hero__title">
            {HERO.title.map((w, i) => (
              <span key={w} className={`line line--${i}`}>
                <span className="line__in" style={{ ['--d' as string]: `${i * 0.09}s` }}>{w}</span>
              </span>
            ))}
          </h1>
          <p className="hero__lead">{t(HERO.lead)}</p>
          <div className="hero__cta">
            <MagneticButton href={WA_CONSULT} external variant="solid">Записаться на консультацию</MagneticButton>
            <MagneticButton href="#tech">Смотреть технологии</MagneticButton>
          </div>
        </div>

        <figure className="hero__photo capsule capsule--capsule" data-cursor="смотреть">
          <div className="capsule__inner hero__reveal">
            <Photo
              name="morpheus8-device"
              alt="Аппарат InMode Morpheus8 в кабинете с лавандовыми стенами, руки мастера в розовых перчатках"
              sizes="(max-width: 767px) 92vw, 38vw"
              priority
              className="capsule__img"
            />
          </div>
          <LogoLines className="hero__sil" width={6} leaves={false} />
          <figcaption className="hero__cap mono">Morpheus8 · кабинет студии</figcaption>
        </figure>

        <p className="hero__meta mono">
          {HERO.meta.map((m, i) => (
            <span key={m}>{i > 0 && <span className="dotsep" aria-hidden="true">·</span>}{m}</span>
          ))}
        </p>
      </div>
    </section>
  );
}
