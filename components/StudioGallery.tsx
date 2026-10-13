'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { GALLERY, t } from '@/lib/data';
import { gsap, Flip, MQ_MOTION } from '@/lib/gsap';
import SectionIndex from './ui/SectionIndex';
import Photo from './ui/Photo';
import Lightbox from './Lightbox';

export default function StudioGallery() {
  const ref = useRef<HTMLElement>(null);
  const [open, setOpen] = useState<{ i: number; state: Flip.FlipState | null } | null>(null);

  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add(MQ_MOTION, () => {
      // раскрытие clip-path по очереди
      gsap.utils.toArray<HTMLElement>('.gitem__in', ref.current).forEach((el, k) => {
        gsap.fromTo(el, { clipPath: 'inset(100% 0% 0% 0% round 0px)' }, {
          clipPath: 'inset(0% 0% 0% 0% round 0px)', duration: 1.1, ease: 'expo.out', delay: (k % 3) * 0.08,
          scrollTrigger: { trigger: el.parentElement, start: 'top 88%', once: true },
        });
      });
    });
    return () => mm.revert();
  }, []);

  const show = (i: number, el: HTMLElement) => {
    const img = el.querySelector<HTMLElement>('[data-flip-id]');
    setOpen({ i, state: img ? Flip.getState(img) : null });
  };
  const close = useCallback((i: number) => {
    setOpen(null);
    // вернуть фокус на ту плитку, которую смотрели последней
    requestAnimationFrame(() => ref.current?.querySelector<HTMLElement>(`[data-g="${i}"]`)?.focus({ preventScroll: true }));
  }, []);

  return (
    <section ref={ref} className="studio sec" id="studio" aria-labelledby="studio-title">
      <i data-thread-anchor className="ta" style={{ left: '7vw', top: '60px' }} />
      <i data-thread-anchor className="ta" style={{ left: '30vw', top: '46%' }} />
      <i data-thread-anchor className="ta" style={{ left: '8vw', top: 'calc(100% - 50px)' }} />
      <div className="wrap studio__head">
        <SectionIndex n="11" label="Студия" />
        <h2 id="studio-title" className="h2">{t('Комфортно и красиво')}</h2>
        <p className="studio__sub">{t('— так о пространстве студии пишут гости. Кабинеты на Фучика, 53: холл с креслом, аппараты, свет и цветы у входа.')}</p>
      </div>
      <ul className="gallery">
        {GALLERY.map((g, i) => (
          <li key={g.id} className={`gitem gitem--${i} gitem--${g.shape}`}>
            <button
              type="button"
              className="gitem__btn"
              data-g={i}
              data-cursor={g.video ? 'смотреть видео' : 'смотреть'}
              aria-label={`Открыть: ${g.caption}`}
              onClick={(e) => show(i, e.currentTarget)}
            >
              <span className="gitem__in">
                <Photo name={g.img} alt={g.alt} sizes="(max-width: 767px) 60vw, 30vw" className="gitem__img" flipId={`g-${g.id}`} />
                <span className="sr-only">{g.caption}</span>
              </span>
              {g.video && <span className="gitem__play mono" aria-hidden="true">▶ видео</span>}
            </button>
            <p className="gitem__cap">{g.caption}</p>
          </li>
        ))}
      </ul>
      {open && <Lightbox index={open.i} flipState={open.state} onClose={close} />}
    </section>
  );
}
