'use client';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Flip } from 'gsap/Flip';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, Flip);
  ScrollTrigger.config({ ignoreMobileResize: true });
}

export { gsap, ScrollTrigger, Flip };

/** Пины и горизонтальные сцены — только на десктопе и без reduced-motion */
export const MQ_PIN = '(min-width: 1024px) and (prefers-reduced-motion: no-preference)';
export const MQ_MOTION = '(prefers-reduced-motion: no-preference)';
