// Клик-тесты и проверки страницы в настоящем Chrome.
//   node tools/interact.mjs [url]
import { chromium } from 'playwright-core';

const URL = process.argv[2] || 'http://localhost:8530/';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const results = [];
const check = (name, ok, extra = '') => { results.push({ name, ok }); console.log(`${ok ? '✓' : '✗'} ${name}${extra ? ' — ' + extra : ''}`); };

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const newPage = async (opts = {}) => {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'ru-RU', ...opts });
  const page = await ctx.newPage();
  page.errors = [];
  page.on('pageerror', (e) => page.errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && page.errors.push(m.text().slice(0, 200)));
  return { ctx, page };
};
const scrollTo = (page, sel, off = 0) => page.evaluate(([s, o]) => {
  const el = document.querySelector(s); const y = el.getBoundingClientRect().top + scrollY + o;
  if (window.__lenis) window.__lenis.scrollTo(y, { immediate: true, force: true }); else scrollTo(0, y);
}, [sel, off]);

/* 1. прелоадер: первый визит — есть, второй — нет */
{
  const { ctx, page } = await newPage();
  await page.goto(URL, { waitUntil: 'domcontentloaded' });
  const shown = await page.locator('.pl').isVisible().catch(() => false);
  await sleep(2200);
  const gone = (await page.locator('.pl').count()) === 0;
  await page.reload({ waitUntil: 'domcontentloaded' });
  await sleep(300);
  const skip = await page.evaluate(() => document.documentElement.dataset.intro === 'skip' && !document.querySelector('.pl'));
  check('прелоадер на первом визите и скрыт через ≤1.4 с + запас', shown && gone);
  check('прелоадер не повторяется в сессии', skip);
  check('нет ошибок в консоли', page.errors.length === 0, page.errors.slice(0, 3).join(' | '));
  await ctx.close();
}

/* 2. статус по времени Казани, при чужом поясе браузера */
for (const [iso, want] of [['2026-10-12T09:30:00Z', 'Открыто до 18:00'], ['2026-10-12T16:10:00Z', 'Откроемся в 10:00'], ['2026-10-12T06:59:00Z', 'Откроемся в 10:00'], ['2026-10-12T07:00:00Z', 'Открыто до 18:00']]) {
  const { ctx, page } = await newPage({ timezoneId: 'Asia/Vladivostok' });
  await page.clock.setFixedTime(new Date(iso));
  await page.goto(URL, { waitUntil: 'load' });
  await sleep(600);
  const txt = (await page.locator('.status__txt').textContent())?.trim();
  check(`статус в ${iso.slice(11, 16)} UTC (Владивосток в браузере) → «${want}»`, txt === want, txt);
  await ctx.close();
}

const { ctx, page } = await newPage();
await page.goto(URL, { waitUntil: 'load' });
await sleep(2600);

/* 3. карта тела */
await scrollTo(page, '#map', 0);
await sleep(800);
await page.locator('.hot[aria-label="Зона: Живот и талия"]').click();
await sleep(900);
const panel = await page.evaluate(() => ({
  title: document.querySelector('.zpanel__title')?.textContent,
  items: document.querySelectorAll('.zpanel__list li').length,
  href: document.querySelector('.zpanel a')?.getAttribute('href'),
  lit: !!document.querySelector('.fig--body .fig__zone.is-on'),
}));
check('карта тела: клик по «Живот и талия» открывает панель', panel.title === 'Живот и талия' && panel.items >= 3, JSON.stringify(panel.title));
check('карта тела: зона подсвечена', panel.lit);
check('карта тела: WhatsApp с текстом зоны', panel.href === 'https://wa.me/79196452199?text=' + encodeURIComponent('Здравствуйте! Интересует работа с зоной: живот и талия'), panel.href);
await page.locator('.seg__btn', { hasText: 'Лицо' }).click();
await sleep(1300);
const faceDots = await page.locator('.bmap__dots .hot').count();
check('карта тела: «Лицо» — три точки', faceDots === 3, String(faceDots));
await page.locator('.hot[aria-label="Зона: Отёки"]').focus();
await page.keyboard.press('Enter');
await sleep(700);
check('карта тела: точка нажимается с клавиатуры', (await page.locator('.zpanel__title').textContent()) === 'Отёки');

/* 4. прайс */
await scrollTo(page, '#prices', 0);
await sleep(700);
await page.locator('#ptab-face').click();
await sleep(900);
const faceRows = await page.locator('.prow').count();
check('прайс: вкладка «Лицо» — 3 позиции', faceRows === 3, String(faceRows));
await page.keyboard.press('ArrowRight');
await sleep(900);
check('прайс: стрелка → переключает на «Обёртывания»', (await page.locator('.ptab.is-on').textContent())?.startsWith('Обёртывания'));
const prices = await page.evaluate(() => [...document.querySelectorAll('.prow__price')].map((e) => e.textContent.replace(/\s/g, ' ')));
check('прайс: цены обёртываний', JSON.stringify(prices) === JSON.stringify(['3 000 ₽', '4 500 ₽', '3 000 ₽', '4 500 ₽', '5 000 ₽']), prices.join(', '));

/* 5. до/после с клавиатуры */
await scrollTo(page, '#results', 0);
await sleep(600);
const h = page.locator('.ba__handle').first();
await h.focus();
await page.keyboard.press('ArrowRight');
check('до/после: стрелка двигает на 5%', (await h.getAttribute('aria-valuenow')) === '55');
const box = await page.locator('.ba__box').first().boundingBox();
await page.mouse.move(box.x + box.width * 0.5, box.y + box.height / 2);
await page.mouse.down();
await page.mouse.move(box.x + box.width * 0.2, box.y + box.height / 2, { steps: 6 });
await page.mouse.up();
const v = Number(await h.getAttribute('aria-valuenow'));
check('до/после: перетаскивание мышью', v > 15 && v < 25, String(v));

/* 6. галерея и лайтбокс */
await scrollTo(page, '#studio', 200);
await sleep(1200);
await page.locator('.gitem__btn').first().click();
await sleep(900);
const dlg = page.locator('.lb[role="dialog"][aria-modal="true"]');
check('лайтбокс открывается', await dlg.isVisible());
check('лайтбокс: счётчик 01 / 11', (await page.locator('.lb__count').textContent()) === '01 / 11');
await page.keyboard.press('ArrowRight');
await sleep(300);
check('лайтбокс: → листает', (await page.locator('.lb__count').textContent()) === '02 / 11');
await page.keyboard.press('ArrowRight');
await sleep(500);
check('лайтбокс: видео играет', await page.evaluate(() => { const v = document.querySelector('.lb video'); return !!v && v.muted && !v.paused; }));
await page.keyboard.press('Escape');
await sleep(500);
check('лайтбокс: Esc закрывает и возвращает фокус', (await page.locator('.lb').count()) === 0 && (await page.evaluate(() => document.activeElement?.classList.contains('gitem__btn'))));

/* 7. ссылки и картинки */
const links = await page.evaluate(() => {
  const all = [...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href'));
  const imgs = [...document.querySelectorAll('img, video, source')].map((i) => i.currentSrc || i.src || i.getAttribute('srcset') || '').filter(Boolean);
  const bodyText = document.body.innerText;
  return { all, external: imgs.filter((s) => /^https?:/.test(s) && !s.startsWith(location.origin)), bodyText };
});
check('нет внешних картинок (hotlink)', links.external.length === 0, links.external.slice(0, 2).join(' '));
check('WhatsApp-ссылки на wa.me/79196452199', links.all.filter((h) => h.includes('wa.me')).every((h) => h.startsWith('https://wa.me/79196452199')));
check('телефон tel:+79625511988', links.all.includes('tel:+79625511988'));
check('Telegram', links.all.includes('https://t.me/+qSNdnbHmYJY3NDcy'));
check('якоря ведут на существующие id', await page.evaluate(() => [...document.querySelectorAll('a[href^="#"]')].every((a) => a.getAttribute('href') === '#' || document.getElementById(a.getAttribute('href').slice(1)))));
check('нет рейтингов/звёзд/восклицаний в заголовках', !/★|рейтинг|оцен(ок|ки)/i.test(links.bodyText) && !(await page.evaluate(() => [...document.querySelectorAll('h1,h2,h3')].some((h) => h.textContent.includes('!')))));
check('нет ошибок в консоли (основной проход)', page.errors.length === 0, page.errors.slice(0, 3).join(' | '));
await ctx.close();

/* 8. переполнение по ширинам */
for (const w of [360, 390, 768, 1024, 1440, 1920]) {
  const { ctx: c, page: p } = await newPage({ viewport: { width: w, height: w < 768 ? 800 : 900 }, isMobile: w < 768, hasTouch: w < 768 });
  await p.goto(URL, { waitUntil: 'load' });
  await sleep(2400);
  const docH = await p.evaluate(() => document.documentElement.scrollHeight);
  let worst = 0;
  for (let y = 0; y < docH; y += 1400) {
    await p.evaluate((v) => { if (window.__lenis) window.__lenis.scrollTo(v, { immediate: true, force: true }); else scrollTo(0, v); }, y);
    await sleep(120);
    worst = Math.max(worst, await p.evaluate(() => Math.max(document.documentElement.scrollWidth, innerWidth) - document.documentElement.clientWidth));
  }
  const iw = await p.evaluate(() => innerWidth);
  check(`ширина ${w}: нет горизонтального скролла`, worst <= 0 && iw === w, `scroll+${worst}, innerWidth ${iw}`);
  await c.close();
}

/* 9. reduced motion */
{
  const { ctx: c, page: p } = await newPage({ reducedMotion: 'reduce' });
  await p.goto(URL, { waitUntil: 'load' });
  await sleep(1500);
  const r = await p.evaluate(() => ({
    pl: !!document.querySelector('.pl') && getComputedStyle(document.querySelector('.pl')).display !== 'none',
    pins: document.querySelectorAll('.pin-spacer').length,
    lenis: !!window.__lenis,
    deck: getComputedStyle(document.querySelector('.voices__mobile')).display !== 'none',
    cards: getComputedStyle(document.querySelector('.layers__cards')).display !== 'none',
  }));
  check('reduced-motion: без прелоадера, пинов и Lenis', !r.pl && r.pins === 0 && !r.lenis, JSON.stringify(r));
  check('reduced-motion: слои и записки в простой раскладке', r.deck && r.cards);
  // в середине страницы линия должна идти через весь экран сразу, без дорисовки
  await p.evaluate(() => document.querySelector('#method').scrollIntoView());
  await sleep(500);
  const tip = await p.evaluate(() => { const d = document.querySelector('.thread__path').getAttribute('d'); const ys = [...d.matchAll(/[ML][\d.-]+ ([\d.-]+)/g)].map((m) => +m[1]); return ys.length > 20 && Math.max(...ys) >= innerHeight; });
  check('reduced-motion: линия показана целиком', tip);
  await c.close();
}

await browser.close();
const bad = results.filter((r) => !r.ok);
console.log(`\n${results.length - bad.length}/${results.length} проверок пройдено`);
process.exit(bad.length ? 1 : 0);
