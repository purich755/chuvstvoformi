import { SIL_VIEWBOX, SIL_STROKES, LOGO_VIEWBOX, LOGO_FIGURE, LOGO_LEAVES, FIG_OFFSET } from '@/lib/silhouette.generated';
import { SIGN_VIEWBOX, SIGN_GLYPHS } from '@/lib/signature.generated';

/** Силуэт из логотипа — осевые линии (для прорисовки обводкой). pathLength=1 упрощает dash-анимацию. */
export function SilhouetteLines({ className = '', width = 7, title }: { className?: string; width?: number; title?: string }) {
  return (
    <svg className={className} viewBox={SIL_VIEWBOX} fill="none" stroke="currentColor" strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" role={title ? 'img' : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      {SIL_STROKES.map((d, i) => (
        <path key={i} d={d} pathLength={1} className="sil-path" />
      ))}
    </svg>
  );
}

/** Логотип студии: залитый силуэт + листья (перерисовка с оригинала, scripts/trace-logo.mjs). */
export function LogoMark({ className = '', leaves = true, title }: { className?: string; leaves?: boolean; title?: string }) {
  return (
    <svg className={className} viewBox={LOGO_VIEWBOX} role={title ? 'img' : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      {leaves && <path d={LOGO_LEAVES} className="logo-leaves" fill="var(--sage)" />}
      <path d={LOGO_FIGURE} className="logo-figure" fill="currentColor" />
    </svg>
  );
}

/** Только листья логотипа — контуром или заливкой. */
export function Leaves({ className = '', outline = false }: { className?: string; outline?: boolean }) {
  return (
    <svg className={className} viewBox={LOGO_VIEWBOX} aria-hidden="true">
      <path d={LOGO_LEAVES} fill={outline ? 'none' : 'var(--sage)'} stroke={outline ? 'var(--sage)' : 'none'} strokeWidth={outline ? 1.4 : 0} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/** Рукописная подпись «Чувство формы» (Marck Script), по пути на букву. */
export function Signature({ className = '', title = 'Чувство формы' }: { className?: string; title?: string }) {
  return (
    <svg className={className} viewBox={SIGN_VIEWBOX} role="img" aria-label={title}>
      {SIGN_GLYPHS.map((d, i) => (
        <path key={i} d={d} pathLength={1} className="sign-glyph" />
      ))}
    </svg>
  );
}

/** Логотип «линией»: осевые линии силуэта поверх листьев, в одной системе координат с LogoMark. */
export function LogoLines({ className = '', width = 7, leaves = true, outlineLeaves = false }: { className?: string; width?: number; leaves?: boolean; outlineLeaves?: boolean }) {
  return (
    <svg className={className} viewBox={LOGO_VIEWBOX} aria-hidden="true" fill="none">
      {leaves && (
        <path d={LOGO_LEAVES} className="logo-leaves" fill={outlineLeaves ? 'none' : 'var(--sage)'} stroke={outlineLeaves ? 'var(--sage)' : 'none'} strokeWidth={outlineLeaves ? 1.2 : 0} />
      )}
      <g transform={`translate(${FIG_OFFSET.x * FIG_OFFSET.scale} ${FIG_OFFSET.y * FIG_OFFSET.scale}) scale(${FIG_OFFSET.scale})`} stroke="currentColor" strokeWidth={width} strokeLinecap="round" strokeLinejoin="round">
        {SIL_STROKES.map((d, i) => (
          <path key={i} d={d} pathLength={1} className="sil-path" style={{ ['--i' as string]: i }} />
        ))}
      </g>
    </svg>
  );
}
