'use client';
import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';

/**
 * Сквозная линия «Одной линией».
 * Фиксированный SVG под текстом. Опорные точки — элементы [data-thread-anchor] (центр элемента, координаты документа).
 * x(y) — эрмитов сплайн с касательными Катмулла—Рома через опорные точки + волна A·sin(y·0.012 + t),
 * где A затухает от 18px вверху страницы до 0 к финалу. Рисуется только видимый кусок — от верха экрана до «кончика».
 * Кончик едет за прокруткой через ScrollTrigger (scrub 0.6). Над тёмными секциями [data-thread-dark] линия светлая.
 */
type Pt = { x: number; y: number };

const INK = '#1E2722';
const LIGHT = 'rgba(243,242,238,.78)';

export default function ThreadLine() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current!;
    const path = svg.querySelector<SVGPathElement>('.thread__path')!;
    const dot = svg.querySelector<SVGCircleElement>('.thread__dot')!;
    const grad = svg.querySelector<SVGLinearGradientElement>('#thread-grad')!;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const mqMobile = window.matchMedia('(max-width: 767px)');

    let pts: Pt[] = [];
    let tangents: number[] = [];
    let dark: [number, number][] = [];
    let startY = 0, heroEnd = 0, endY = 1, vh = window.innerHeight, vw = window.innerWidth;
    let mobile = mqMobile.matches;
    let wave = !reduce;
    const prog = { p: 0, intro: reduce ? 1 : 0 };

    const measure = () => {
      vh = window.innerHeight; vw = window.innerWidth; mobile = mqMobile.matches;
      svg.setAttribute('viewBox', `0 0 ${vw} ${vh}`);
      grad.setAttribute('y2', String(vh));
      const sy = window.scrollY;
      const list = [...document.querySelectorAll<HTMLElement>('[data-thread-anchor]')]
        .filter((el) => el.offsetParent !== null)
        .map((el) => {
          const r = el.getBoundingClientRect();
          return { x: r.left + r.width / 2, y: r.top + sy + r.height / 2, role: el.dataset.threadAnchor };
        })
        .sort((a, b) => a.y - b.y);
      // точки, слишком близкие по y, ломают сплайн — прореживаем
      pts = [];
      for (const p of list) if (!pts.length || p.y - pts[pts.length - 1].y > 24) pts.push({ x: p.x, y: p.y });
      if (pts.length < 2) return;
      startY = pts[0].y;
      endY = pts[pts.length - 1].y;
      const hero = list.find((p) => p.role === 'hero-end');
      heroEnd = hero ? hero.y : startY + vh * 0.6;
      tangents = pts.map((p, i) => {
        const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
        return b.y === a.y ? 0 : (b.x - a.x) / (b.y - a.y);
      });
      dark = [...document.querySelectorAll<HTMLElement>('[data-thread-dark]')].map((el) => {
        const r = el.getBoundingClientRect();
        return [r.top + sy, r.bottom + sy] as [number, number];
      });
      dirty = true;
    };

    // x(y) по сплайну — бинпоиск сегмента
    const xAt = (y: number) => {
      if (mobile) return 10;
      if (y <= pts[0].y) return pts[0].x;
      const n = pts.length - 1;
      if (y >= pts[n].y) return pts[n].x;
      let lo = 0, hi = n;
      while (hi - lo > 1) { const m = (lo + hi) >> 1; if (pts[m].y <= y) lo = m; else hi = m; }
      const a = pts[lo], b = pts[hi], h = b.y - a.y, s = (y - a.y) / h;
      const s2 = s * s, s3 = s2 * s;
      return (2 * s3 - 3 * s2 + 1) * a.x + (s3 - 2 * s2 + s) * h * tangents[lo] + (-2 * s3 + 3 * s2) * b.x + (s3 - s2) * h * tangents[hi];
    };

    let t = 0, last = 0, dirty = true, lastScroll = -1;
    const frames: number[] = [];

    const tipY = () => {
      const intro = startY + (heroEnd - startY) * prog.intro;
      if (prog.intro < 1) return intro;
      return reduce ? endY : heroEnd + (endY - heroEnd) * prog.p;
    };

    const draw = () => {
      if (pts.length < 2) return;
      const sy = window.scrollY;
      const tip = tipY();
      const from = Math.max(startY, sy - 40);
      const to = Math.min(tip, sy + vh + 40);
      const ampMax = mobile ? 5 : 18;
      let d = '';
      if (to > from) {
        const step = mobile ? 10 : 8;
        for (let y = from; ; y += step) {
          const yy = Math.min(y, to);
          let x = xAt(yy);
          if (wave) {
            const k = Math.max(0, 1 - (yy - startY) / (endY - startY));
            x += ampMax * k * k * Math.sin(yy * 0.012 + t);
          }
          d += `${d ? 'L' : 'M'}${x.toFixed(1)} ${(yy - sy).toFixed(1)}`;
          if (yy >= to) break;
        }
      }
      path.setAttribute('d', d);
      // кончик-точка
      if (tip >= sy - 10 && tip <= sy + vh + 10 && prog.intro > 0 && tip < endY - 2) {
        let x = xAt(tip);
        if (wave) { const k = Math.max(0, 1 - (tip - startY) / (endY - startY)); x += ampMax * k * k * Math.sin(tip * 0.012 + t); }
        dot.setAttribute('cx', x.toFixed(1)); dot.setAttribute('cy', (tip - sy).toFixed(1)); dot.style.opacity = '1';
      } else dot.style.opacity = '0';
      // цвет: светлая над тёмными секциями
      let stops = '';
      const vis = dark.map(([a, b]) => [a - sy, b - sy]).filter(([a, b]) => b > 0 && a < vh);
      if (!vis.length) stops = `<stop offset="0" stop-color="${INK}"/><stop offset="1" stop-color="${INK}"/>`;
      else {
        for (const [a, b] of vis) {
          const o1 = Math.max(0, a / vh), o2 = Math.min(1, b / vh);
          stops += `<stop offset="${o1.toFixed(4)}" stop-color="${INK}"/><stop offset="${o1.toFixed(4)}" stop-color="${LIGHT}"/><stop offset="${o2.toFixed(4)}" stop-color="${LIGHT}"/><stop offset="${o2.toFixed(4)}" stop-color="${INK}"/>`;
        }
      }
      if (grad.dataset.s !== stops) { grad.innerHTML = stops; grad.dataset.s = stops; }
    };

    const tick = (time: number) => {
      const now = time * 1000;
      const dt = now - last;
      if (dt < 33) return; // не чаще ~30 раз в секунду
      last = now;
      // фолбэк: если кадры тяжёлые — выключаем волну, остаётся ровная дорисовка
      if (wave) {
        frames.push(dt); if (frames.length > 60) frames.shift();
        if (frames.length === 60 && frames.reduce((a, b) => a + b, 0) / 60 > 52) wave = false;
      }
      const sy = window.scrollY;
      if (wave) t += dt * 0.0006;
      if (wave || dirty || sy !== lastScroll || prog.intro < 1) { draw(); dirty = false; lastScroll = sy; }
    };

    measure();
    draw();
    gsap.ticker.add(tick);

    const st = ScrollTrigger.create({
      trigger: document.documentElement,
      start: 0,
      end: 'max',
      onUpdate: (self) => { gsap.to(prog, { p: self.progress, duration: 0.6, ease: 'power3.out', overwrite: 'auto' }); },
    });

    const onRefresh = () => { measure(); prog.p = st.progress; };
    ScrollTrigger.addEventListener('refresh', onRefresh);
    let rt = 0;
    const onResize = () => { window.clearTimeout(rt); rt = window.setTimeout(measure, 150); };
    window.addEventListener('resize', onResize);

    let introTween: gsap.core.Tween | undefined;
    const startIntro = (delay: number) => {
      if (reduce) return;
      introTween = gsap.to(prog, { intro: 1, duration: 1.3, delay, ease: 'power2.inOut' });
    };
    const skip = document.documentElement.dataset.intro === 'skip';
    const onIntro = () => startIntro(0);
    if (skip) startIntro(0.9);
    else window.addEventListener('cf:intro-done', onIntro, { once: true });

    return () => {
      gsap.ticker.remove(tick);
      st.kill();
      introTween?.kill();
      ScrollTrigger.removeEventListener('refresh', onRefresh);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('cf:intro-done', onIntro);
    };
  }, []);

  return (
    <svg ref={svgRef} className="thread" aria-hidden="true" preserveAspectRatio="none">
      <defs>
        <linearGradient id="thread-grad" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="1000">
          <stop offset="0" stopColor={INK} />
          <stop offset="1" stopColor={INK} />
        </linearGradient>
      </defs>
      <path className="thread__path" d="" fill="none" stroke="url(#thread-grad)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <circle className="thread__dot" r="3" fill="url(#thread-grad)" style={{ opacity: 0 }} />
    </svg>
  );
}
