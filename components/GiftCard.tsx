'use client';
import { useEffect, useRef } from 'react';
import { GIFT, wa, t } from '@/lib/data';
import SectionIndex from './ui/SectionIndex';
import MagneticButton from './ui/MagneticButton';
import { LogoLines } from './Brand';

/** Сертификат: наклон за курсором ±10° (perspective 1000px, плавность 0.12) и блик. На телефоне — гироскоп или мягкое покачивание. */
export default function GiftCard() {
  const card = useRef<HTMLDivElement>(null);
  const scene = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = card.current!, sc = scene.current!;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let tx = 0, ty = 0, rx = 0, ry = 0, gx = 50, gy = 30, tgx = 50, tgy = 30, raf = 0, active = false;
    const loop = () => {
      rx += (tx - rx) * 0.12; ry += (ty - ry) * 0.12; gx += (tgx - gx) * 0.12; gy += (tgy - gy) * 0.12;
      el.style.setProperty('--rx', `${rx.toFixed(2)}deg`);
      el.style.setProperty('--ry', `${ry.toFixed(2)}deg`);
      el.style.setProperty('--gx', `${gx.toFixed(1)}%`);
      el.style.setProperty('--gy', `${gy.toFixed(1)}%`);
      raf = active || Math.abs(tx - rx) + Math.abs(ty - ry) > 0.02 ? requestAnimationFrame(loop) : 0;
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(loop); };

    const fine = window.matchMedia('(pointer: fine)').matches;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const r = sc.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      ty = (px - 0.5) * 20; tx = -(py - 0.5) * 20;
      tgx = px * 100; tgy = py * 100;
      active = true; kick();
    };
    const onLeave = () => { tx = 0; ty = 0; tgx = 50; tgy = 30; active = false; kick(); };
    if (fine) {
      sc.addEventListener('pointermove', onMove);
      sc.addEventListener('pointerleave', onLeave);
    }

    // телефон: гироскоп (если отдаёт данные без запроса разрешения), иначе — медленное покачивание в CSS
    let gotTilt = false;
    const onOrient = (e: DeviceOrientationEvent) => {
      if (e.beta == null || e.gamma == null) return;
      if (!gotTilt) { gotTilt = true; el.classList.remove('is-sway'); }
      ty = Math.max(-10, Math.min(10, e.gamma / 3));
      tx = Math.max(-10, Math.min(10, (e.beta - 45) / 4));
      tgx = 50 + ty * 3; tgy = 40 - tx * 3;
      active = true; kick();
    };
    if (!fine) {
      el.classList.add('is-sway');
      window.addEventListener('deviceorientation', onOrient);
    }
    return () => {
      sc.removeEventListener('pointermove', onMove);
      sc.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('deviceorientation', onOrient);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section className="gift sec" id="gift" aria-labelledby="gift-title">
      <i data-thread-anchor className="ta" style={{ left: '46vw', top: '70px' }} />
      <i data-thread-anchor className="ta" style={{ left: '49vw', top: 'calc(100% - 60px)' }} />
      <div className="wrap gift__grid">
        <div className="gift__text">
          <SectionIndex n="12" label="Подарок" />
          <h2 id="gift-title" className="h2">{t(GIFT.title)}</h2>
          <p className="gift__p">{t(GIFT.text)}</p>
          <MagneticButton href={wa('Здравствуйте! Хочу заказать подарочный сертификат')} external variant="solid">Заказать сертификат</MagneticButton>
        </div>
        <div className="gift__scene" ref={scene}>
          <div className="gcard" ref={card} role="img" aria-label="Подарочный сертификат студии «Чувство формы»">
            <div className="gcard__face">
              <p className="gcard__k mono">Подарочный сертификат</p>
              <LogoLines className="gcard__art" width={7} outlineLeaves />
              <p className="gcard__sign hand">Чувство формы</p>
              <div className="gcard__foot mono">
                <span>на сумму или курс</span>
                <span>Казань · Фучика, 53</span>
              </div>
              <span className="gcard__glare" aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
