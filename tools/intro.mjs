// Кадры вступления на первом визите: node tools/intro.mjs [W] [H]
import { chromium } from 'playwright-core';
import fs from 'node:fs';
const W = +(process.argv[2] || 1440), H = +(process.argv[3] || 900);
const b = await chromium.launch({ channel: 'chrome', headless: true });
const p = await (await b.newContext({ viewport: { width: W, height: H }, locale: 'ru-RU', isMobile: W < 768, hasTouch: W < 768 })).newPage();
fs.mkdirSync('raw/intro', { recursive: true });
await p.goto(process.env.URL || 'http://localhost:8530/', { waitUntil: 'commit' });
const t0 = Date.now();
for (const t of [350, 700, 1050, 1300, 1500, 1900, 2500, 3600]) {
  await new Promise((r) => setTimeout(r, Math.max(0, t - (Date.now() - t0))));
  await p.screenshot({ path: `raw/intro/${W}-${String(t).padStart(4, '0')}.jpg`, type: 'jpeg', quality: 70 });
}
await b.close();
console.log('ok');
