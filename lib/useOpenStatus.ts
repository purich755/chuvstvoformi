'use client';
import { useEffect, useState } from 'react';
import { CONTACTS } from './data';

export type OpenStatus = { open: boolean; label: string };

/** Часы и минуты «сейчас» в Казани (Europe/Moscow) — независимо от пояса посетителя. */
export function kazanNow(d = new Date()) {
  const parts = new Intl.DateTimeFormat('ru-RU', { timeZone: 'Europe/Moscow', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(d);
  const h = Number(parts.find((p) => p.type === 'hour')?.value ?? 0);
  const m = Number(parts.find((p) => p.type === 'minute')?.value ?? 0);
  return { h, m };
}

export function openStatus(d = new Date()): OpenStatus {
  const { h, m } = kazanNow(d);
  const mins = h * 60 + m;
  const open = mins >= CONTACTS.open * 60 && mins < CONTACTS.close * 60;
  return open
    ? { open, label: `Открыто до ${CONTACTS.close}:00` }
    : { open, label: `Откроемся в ${CONTACTS.open}:00` };
}

/** SSR отдаёт нейтральный текст (график), клиент сразу подменяет на живой статус и обновляет раз в минуту. */
export function useOpenStatus(): OpenStatus | null {
  const [s, setS] = useState<OpenStatus | null>(null);
  useEffect(() => {
    const tick = () => setS(openStatus());
    tick();
    const id = window.setInterval(tick, 60_000);
    return () => window.clearInterval(id);
  }, []);
  return s;
}
