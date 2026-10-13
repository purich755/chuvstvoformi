'use client';
import { useEffect, useState } from 'react';
import { LogoLines } from './Brand';

const TOTAL = 1450; // мс — вся сцена, см. keyframes .pl в sections.css
const RELEASE = 1250; // точка встала на начало линии героя — линия начинает расти

/**
 * Прелоадер «Линия» (≤ 1.45 с). Вся анимация — CSS и стартует с первой отрисовки, не дожидаясь гидратации:
 * силуэт из логотипа рисуется обводкой, проявляются листья и название, силуэт сжимается в точку,
 * точка переезжает к началу сквозной линии героя, и линия растёт из неё вниз.
 * Один раз за сессию (sessionStorage в try/catch, флаг ставит инлайн-скрипт в layout до отрисовки).
 */
export default function Preloader() {
  const [gone, setGone] = useState(false);

  useEffect(() => {
    if (document.documentElement.dataset.intro === 'skip') { setGone(true); return; }
    try { sessionStorage.setItem('cf-intro', '1'); } catch {}
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // CSS-анимация идёт от первой отрисовки, примерно от начала навигации
    const now = performance.now();
    const release = window.setTimeout(() => window.dispatchEvent(new CustomEvent('cf:intro-done')), reduce ? 0 : Math.max(0, RELEASE - now));
    const end = window.setTimeout(() => setGone(true), reduce ? 0 : Math.max(0, TOTAL - now) + 60);
    return () => { window.clearTimeout(release); window.clearTimeout(end); };
  }, []);

  if (gone) return null;
  return (
    <div className="pl" aria-hidden="true">
      <div className="pl__stage">
        <div className="pl__art">
          <LogoLines className="pl__sil" width={9} />
        </div>
        <p className="pl__name">Чувство формы</p>
      </div>
      <span className="pl__dot" />
    </div>
  );
}
