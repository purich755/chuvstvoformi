'use client';
import { useRef } from 'react';

type Props = {
  href: string;
  children: React.ReactNode;
  variant?: 'line' | 'solid' | 'light';
  external?: boolean;
  className?: string;
  ariaLabel?: string;
};

/** Капсула с рамкой 1px: заливка поднимается снизу (clip-path), сама кнопка тянется к курсору не дальше 8px. */
export default function MagneticButton({ href, children, variant = 'line', external, className = '', ariaLabel }: Props) {
  const ref = useRef<HTMLAnchorElement>(null);
  const move = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    const el = ref.current!;
    const r = el.getBoundingClientRect();
    const dx = ((e.clientX - (r.left + r.width / 2)) / (r.width / 2)) * 8;
    const dy = ((e.clientY - (r.top + r.height / 2)) / (r.height / 2)) * 6;
    el.style.setProperty('--mx', `${Math.max(-8, Math.min(8, dx)).toFixed(2)}px`);
    el.style.setProperty('--my', `${Math.max(-8, Math.min(8, dy)).toFixed(2)}px`);
  };
  const leave = () => {
    ref.current?.style.setProperty('--mx', '0px');
    ref.current?.style.setProperty('--my', '0px');
  };
  return (
    <a
      ref={ref}
      href={href}
      className={`mbtn mbtn--${variant} ${className}`}
      onPointerMove={move}
      onPointerLeave={leave}
      aria-label={ariaLabel}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      <span className="mbtn__fill" aria-hidden="true" />
      <span className="mbtn__label">{children}</span>
    </a>
  );
}
