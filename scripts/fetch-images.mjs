// Сбор и подготовка изображений для сайта.
//   1. node tools/dump-yandex.mjs      — headless/видимый Chrome проходит карточку, галерею, отзывы, прайс
//                                        и складывает URL фото в raw/ya-photos.json (один раз)
//   2. node scripts/fetch-images.mjs   — качает недостающие фото в raw/photos (самый крупный размер),
//                                        режет кропы, делает WebP 1600/800 и public/images/manifest.json,
//                                        перекодирует видео из raw/video (если скачаны) в public/video
// Hotlink на avatars.mds.yandex.net не используется: всё лежит локально.
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const RAW = 'raw/photos';
const OUT = 'public/images';
const ALTAY = 'https://avatars.mds.yandex.net/get-altay';
fs.mkdirSync(RAW, { recursive: true });
fs.mkdirSync(OUT, { recursive: true });

// Исходники галереи «Чувство формы» на Яндекс Картах (id фото → локальное имя)
const SRC = {
  'morpheus-lavender': '16874376/2a0000019c05ae356bdc7ffc8013002e7e57',
  'hands-rf-pair': '19519244/2a0000019c05a4c7f2f201f446fe47a147f8',
  'body-course-pair': '18150755/2a0000019c05a48978fd3fe861c1b965cd8b',
  'face-rf-pair': '16443419/2a0000019c05a5246696afd4b7e98d3860d8',
  'facade-street': '20840442/2a000001a0b9834ecc765bf5ed3f304fafc9',
  'interior': '17684794/2a0000019f991c9d54547b1ed468c70ac9af',
  'cavitation': '20840442/2a0000019f991b9ec3398d3d5b5d67bdcb60',
  'pads-belly': '19996834/2a0000019f991b9f17e9111e961446414092',
  'collage': '20219917/2a0000019f991b9fc8840cb6344b3757c6b8',
  'lpg-master': '17787346/2a0000019f991ba02554d56a0c8f7de71e0e',
  'morpheus-face': '20478540/2a0000019f991935699e19140895dc240a3d',
  'facade-flowers': '20614309/2a000001a0f8d95dc866f2af3d3fc3f5c83a',
  'logo': '17681761/2a0000019f24ac1e334a38d0f91a80c4acad',
};

async function download(name, id) {
  const dest = path.join(RAW, `${name}.jpg`);
  if (fs.existsSync(dest) && fs.statSync(dest).size > 20000) return dest;
  for (const size of ['orig', 'XXXL', 'XXL']) {
    const r = await fetch(`${ALTAY}/${id}/${size}`, { headers: { 'User-Agent': 'Mozilla/5.0', Referer: 'https://yandex.ru/' } }).catch(() => null);
    if (!r?.ok) continue;
    const buf = Buffer.from(await r.arrayBuffer());
    if (buf.length < 20000) continue;
    fs.writeFileSync(dest, buf);
    console.log(`↓ ${name} (${size}, ${(buf.length / 1024) | 0} КБ)`);
    return dest;
  }
  throw new Error(`не скачалось: ${name}`);
}

// crop — доли кадра [x, y, w, h]; split — разрезать склейку «до | после» пополам
const JOBS = [
  { out: 'morpheus8-device', src: 'morpheus-lavender', what: 'Аппарат InMode Morpheus8 на лавандовом фоне, руки в розовых перчатках', where: ['hero', 'gallery', 'og'] },
  { out: 'morpheus8-face', src: 'morpheus-face', what: 'Насадка Morpheus8 у линии челюсти, рука в чёрной перчатке', where: ['tech:morpheus8', 'price-preview'] },
  { out: 'lpg-master', src: 'lpg-master', what: 'Мастер ведёт LPG-процедуру, клиентка в розовом костюме', where: ['method', 'gallery'] },
  { out: 'lpg-handpiece', src: 'lpg-master', crop: [0.18, 0.36, 0.6, 0.42], what: 'Кроп: манипула LPG в руках мастера', where: ['tech:lpg', 'price-preview'] },
  { out: 'interior-hall', src: 'interior', what: 'Холл студии: кресло, столик, витрина с уходом', where: ['gallery'] },
  { out: 'facade-entrance', src: 'facade-flowers', what: 'Вход с вывеской «Студия красоты» и цветами в вазонах, ул. Фучика, 53', where: ['location', 'gallery'] },
  { out: 'facade-street', src: 'facade-street', what: 'Фасад со стороны двора и парковка у входа', where: ['gallery'] },
  { out: 'cavitation-leg', src: 'cavitation', what: 'Насадка кавитации на бедре', where: ['tech:cavitation', 'price-preview', 'gallery'] },
  { out: 'pads-belly', src: 'pads-belly', what: 'Насадки аппарата на животе под ремнём (вероятно, лазерный липолиз — уточнить)', where: ['tech:lipolysis', 'price-preview'] },
  { out: 'master-robe', src: 'collage', crop: [0.0, 0.0, 0.47, 0.48], what: 'Кроп коллажа: женщина в белом халате у костюма прессотерапии', where: ['gallery'] },
  { out: 'wrap-belly', src: 'collage', crop: [0.51, 0.0, 0.49, 0.48], what: 'Кроп коллажа: обёртывание талии плёнкой', where: ['gallery', 'price-preview'] },
  { out: 'pressotherapy-suit', src: 'collage', crop: [0.0, 0.51, 0.55, 0.49], what: 'Кроп коллажа: костюм прессотерапии', where: ['tech:pressotherapy', 'price-preview'] },
  { out: 'gloves-belly', src: 'collage', crop: [0.58, 0.52, 0.42, 0.48], what: 'Кроп коллажа: рука в перчатке и насадка на животе', where: ['gallery'] },
  // «до / после»: на исходниках водяной знак LOVOBEAUTY и подписи — режем мимо них
  { out: 'ba-body', src: 'body-course-pair', crop: [0, 0.2, 1, 0.34], split: true, watermark: true,
    what: 'До/после: фигура в профиль. На фото: «3 курса, миостимуляция, прессотерапия + обёртывание»', where: ['results'] },
  { out: 'ba-hands', src: 'hands-rf-pair', crop: [0, 0.445, 1, 0.415], split: true, watermark: true,
    what: 'До/после: кисти рук. На фото: «микроигольчатый RF лифтинг»', where: ['results'] },
  { out: 'ba-face', src: 'face-rf-pair', crop: [0, 0.405, 1, 0.185], split: true, watermark: true,
    what: 'До/после: кожа щеки. На фото: «результат микроигольчатого RF лифтинга»', where: ['results'] },
];

const manifest = [];
const box = (meta, c) => {
  const [x, y, w, h] = c;
  return { left: Math.round(x * meta.width), top: Math.round(y * meta.height), width: Math.round(w * meta.width), height: Math.round(h * meta.height) };
};

async function writeSizes(pipe, name, extra) {
  const files = {};
  for (const [label, width] of [['1600', 1600], ['800', 800]]) {
    const file = `${name}-${label}.webp`;
    const info = await pipe.clone().resize({ width, withoutEnlargement: true }).webp({ quality: label === '800' ? 72 : 78, effort: 5 }).toFile(path.join(OUT, file));
    files[label] = { file, width: info.width, height: info.height };
  }
  manifest.push({ name, ...extra, files });
}

for (const job of JOBS) {
  const src = await download(job.src, SRC[job.src]);
  const meta = await sharp(src).rotate().metadata();
  let base = sharp(src).rotate();
  if (job.crop) base = base.extract(box(meta, job.crop));
  const buf = await base.toBuffer();
  const info = { what: job.what, usedIn: job.where, source: `${ALTAY}/${SRC[job.src]}/orig`, watermarkCropped: !!job.watermark };
  if (job.split) {
    const m = await sharp(buf).metadata();
    const half = Math.floor(m.width / 2);
    for (const [side, left] of [['before', 0], ['after', m.width - half]]) {
      await writeSizes(sharp(buf).extract({ left, top: 0, width: half, height: m.height }), `${job.out}-${side}`, { ...info, what: `${job.what} — ${side === 'before' ? 'до' : 'после'}` });
    }
  } else {
    await writeSizes(sharp(buf), job.out, info);
  }
  console.log('✓', job.out);
}

// Логотип в максимальном размере (оригинал 3157 px) — для справки; на сайте он перерисован в SVG
{
  const src = await download('logo', SRC.logo);
  await sharp(src).resize({ width: 1600 }).webp({ quality: 86 }).toFile(path.join(OUT, 'logo-original-1600.webp'));
  manifest.push({ name: 'logo-original', what: 'Логотип студии с карточки Яндекс Карт (оригинал). На сайте используется SVG-перерисовка из scripts/trace-logo.mjs', usedIn: ['reference'], files: { 1600: { file: 'logo-original-1600.webp' } } });
}

// Видео из вкладки «Видео»: обрезаем вшитую подпись и знак, перекодируем в лёгкий H.264
const VIDEOS = [
  { id: 'vplv55hs4dh5yvwbpxou', out: 'wrap-candlelight', crop: 'iw:ih*0.8:0:0', posterAt: '1.2', what: 'Обёртывание при тёплом свете (подпись и знак внизу обрезаны)' },
  { id: 'vplvjwslvy3jvn4hvhpm', out: 'way-to-studio', crop: null, posterAt: '11', what: 'Дорога к студии зимой: двор, шлагбаум, вход «Студия красоты»' },
];
fs.mkdirSync('public/video', { recursive: true });
for (const v of VIDEOS) {
  const src = `raw/video/${v.id}.mp4`;
  if (!fs.existsSync(src)) { console.log(`· видео ${v.id} не скачано — пропуск`); continue; }
  const vf = [v.crop && `crop=${v.crop}`, 'scale=-2:720'].filter(Boolean).join(',');
  const mp4 = `public/video/${v.out}.mp4`;
  execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', src, '-vf', vf, '-c:v', 'libx264', '-profile:v', 'main', '-pix_fmt', 'yuv420p', '-crf', '27', '-preset', 'slow', '-c:a', 'aac', '-b:a', '96k', '-movflags', '+faststart', mp4]);
  const poster = `public/video/${v.out}-poster.jpg`;
  execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-ss', v.posterAt, '-i', mp4, '-frames:v', '1', poster]);
  await sharp(poster).webp({ quality: 74 }).toFile(path.join(OUT, `${v.out}-poster-800.webp`));
  fs.copyFileSync(path.join(OUT, `${v.out}-poster-800.webp`), path.join(OUT, `${v.out}-poster-1600.webp`));
  fs.rmSync(poster);
  const meta = await sharp(path.join(OUT, `${v.out}-poster-800.webp`)).metadata();
  manifest.push({ name: `${v.out}-video`, what: v.what, usedIn: ['gallery-lightbox'], source: `https://runtime.strm.yandex.ru/player/video/${v.id}`, files: { video: { file: `../video/${v.out}.mp4` }, poster: { file: `${v.out}-poster-800.webp`, width: meta.width, height: meta.height } } });
  console.log('✓ video', v.out, `${(fs.statSync(mp4).size / 1024) | 0} КБ`);
}

const skipped = [
  'Мужчина с аппаратом EMS на прессе — рекламный кадр производителя (модель), не используется',
  'Женщина с роликовой насадкой на красном фоне — рекламный кадр производителя (модель), не используется',
  'Флаер «Этот аппарат вернёт вам годы молодости» — рекламная листовка с текстом, не используется',
  'Лицо до/после (портреты) — похоже на промо производителя, не используется',
  'Спина LPG до/после, руки RF до/после (2×2), целлюлит до/после — водяной знак/стрелки в кадре, не используются',
  'Morpheus8 на животе — 480×270 и промо-кадр с моделью, не используется',
  'Видео с бинтовым обёртыванием — крупный вшитый текст на половину кадра, не используется',
];
fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify({ generated: new Date().toISOString(), source: 'https://yandex.ru/maps/org/chuvstvo_formy/6769645873/gallery/', images: manifest, skipped }, null, 2));
console.log(`✓ manifest: ${manifest.length} записей`);
