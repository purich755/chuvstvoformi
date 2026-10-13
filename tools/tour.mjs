// Проход по странице с кадрами каждые ~0.85 экрана (настоящий Chrome, Lenis крутится его же scrollTo).
//   node tools/tour.mjs [W] [H] [--reduced] [--from y] [--to y] [--step px] [--url http://localhost:8530/]
// Кадры: raw/tour/<W>/NN.jpg, ошибки консоли и сети — в выводе.
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const args = process.argv.slice(2);
const num = (i, d) => (args[i] && !args[i].startsWith('--') ? parseInt(args[i], 10) : d);
const opt = (n, d) => { const i = args.indexOf('--' + n); return i === -1 ? d : args[i + 1]; };
const W = num(0, 1440), H = num(1, W < 700 ? 844 : 900);
const reduced = args.includes('--reduced');
const URL = opt('url', 'http://localhost:8530/');
const out = path.join('raw/tour', `${W}${reduced ? '-rm' : ''}`);
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const ctx = await browser.newContext({
  viewport: { width: W, height: H }, deviceScaleFactor: 1, locale: 'ru-RU',
  isMobile: W < 768, hasTouch: W < 768, reducedMotion: reduced ? 'reduce' : 'no-preference',
  timezoneId: 'Europe/Moscow',
});
const page = await ctx.newPage();
const errors = [];
page.on('console', (m) => m.type() === 'error' && errors.push(m.text().slice(0, 300)));
page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message));
page.on('response', (r) => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); });

await page.goto(URL, { waitUntil: 'load', timeout: 90000 });
await sleep(3200);
const docH = await page.evaluate(() => document.documentElement.scrollHeight);
const step = parseInt(opt('step', String(Math.round(H * 0.85))), 10);
const from = parseInt(opt('from', '0'), 10), to = parseInt(opt('to', String(docH)), 10);
const go = async (y) => {
  await page.evaluate((v) => { if (window.__lenis) window.__lenis.scrollTo(v, { immediate: true, force: true }); else window.scrollTo(0, v); }, y);
};
let n = 0;
for (let y = from; y <= Math.min(to, docH - H + step); y += step) {
  await go(Math.min(y, docH - H));
  await sleep(1300);
  const file = path.join(out, `${String(n++).padStart(2, '0')}.jpg`);
  await page.screenshot({ path: file, type: 'jpeg', quality: 70 });
}
const metrics = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: innerWidth, docH: document.documentElement.scrollHeight }));
console.log(`${n} кадров → ${out}`, metrics);
if (errors.length) console.log('ОШИБКИ:\n' + [...new Set(errors)].join('\n'));
await browser.close();
