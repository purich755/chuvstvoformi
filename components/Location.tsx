'use client';
import { useEffect, useRef } from 'react';
import { CONTACTS, t } from '@/lib/data';
import { asset } from '@/lib/base';
import SectionIndex from './ui/SectionIndex';
import Capsule from './ui/Capsule';
import MagneticButton from './ui/MagneticButton';

type Fact = { to?: number; unit?: string; text?: string; label: string };
const FACTS: Fact[] = [
  { to: CONTACTS.stop.meters, unit: 'м', label: `от остановки «${CONTACTS.stop.name}»` },
  { to: CONTACTS.metro.meters, unit: 'м', label: `от метро «${CONTACTS.metro.name}»` },
  { text: '10–18', label: 'ежедневно, без выходных' },
];

export default function Location() {
  const ref = useRef<HTMLElement>(null);

  // счётчики 1.2 с, когда цифра в кадре
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const nums = ref.current!.querySelectorAll<HTMLElement>('[data-count]');
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        io.unobserve(e.target);
        const el = e.target as HTMLElement;
        const to = Number(el.dataset.count);
        const t0 = performance.now();
        const step = (now: number) => {
          const p = Math.min(1, (now - t0) / 1200);
          el.textContent = String(Math.round(to * (1 - Math.pow(1 - p, 3))));
          if (p < 1) requestAnimationFrame(step);
        };
        el.textContent = '0';
        requestAnimationFrame(step);
      }
    }, { threshold: 0.6 });
    nums.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);

  return (
    <section ref={ref} className="loc sec" id="contacts" aria-labelledby="loc-title">
      <i data-thread-anchor className="ta" style={{ left: '52vw', top: '60px' }} />
      <i data-thread-anchor className="ta" style={{ left: '4vw', top: '48%' }} />
      <i data-thread-anchor className="ta" style={{ left: '50vw', top: 'calc(100% - 30px)' }} />
      <div className="wrap loc__grid">
        <header className="loc__head">
          <SectionIndex n="13" label="Как добраться" />
          <h2 id="loc-title" className="h2">{t('Чуть дальше центра. Зато без выходных и с парковкой')}</h2>
          <p className="loc__addr">{CONTACTS.addressFull}</p>
        </header>

        <ul className="loc__facts">
          {FACTS.map((f) => (
            <li key={f.label}>
              <p className="loc__num mono">
                {f.to !== undefined ? (
                  <>
                    <span data-count={f.to}>{f.to}</span>
                    <span className="loc__unit">{' '}{f.unit}</span>
                  </>
                ) : (
                  f.text
                )}
              </p>
              <p className="loc__lbl">{t(f.label)}</p>
            </li>
          ))}
        </ul>
        <ul className="loc__tags mono" aria-label="Удобства">
          {CONTACTS.amenities.map((a) => <li key={a}>{a}</li>)}
        </ul>

        <div className="loc__map" data-cursor="на карте">
          <a href={CONTACTS.yandexMaps} target="_blank" rel="noopener noreferrer" className="loc__mapLink" aria-label="Фучика, 53 — открыть студию на Яндекс Картах">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={asset('/images/map-kazan-fuchika.webp')} alt="Схема района: студия на улице Юлиуса Фучика, 53" width={1600} height={1100} loading="lazy" decoding="async" />
            <span className="loc__pin" aria-hidden="true"><span /></span>
            <span className="loc__pinlbl mono" aria-hidden="true">Фучика, 53</span>
          </a>
          <p className="loc__osm mono">Схема: © участники OpenStreetMap</p>
        </div>

        <Capsule name="facade-entrance" alt="Вход в студию: вывеска «Студия красоты» и цветы в вазонах у дверей" sizes="(max-width: 767px) 70vw, 24vw" className="loc__facade" shape="tall">
          <figcaption className="cap">{t('Вы нас узнаете по цветам у входа')}</figcaption>
        </Capsule>

        <div className="loc__cta">
          <MagneticButton href={CONTACTS.route} external>Построить маршрут</MagneticButton>
          <MagneticButton href={CONTACTS.phoneHref}>{CONTACTS.phone}</MagneticButton>
        </div>
      </div>
    </section>
  );
}
