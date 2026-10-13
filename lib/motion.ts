// Общие кривые и длительности: одна «рука» на всю страницу.
export const EASE = {
  out: 'expo.out',
  inOut: 'power2.inOut',
  soft: 'power3.out',
  css: 'cubic-bezier(.16,1,.3,1)',
};
export const DUR = { line: 1.1, reveal: 0.9, capsule: 1.2, quick: 0.45 };
export const SPRING = { type: 'spring' as const, stiffness: 120, damping: 20, mass: 0.9 };
export const reduced = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export const finePointer = () =>
  typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches;
