// Снимает с логотипа студии (raw/photos/ya023.jpg, 3157 px) три вещи:
//  1) осевые линии силуэта — для анимации «одной линией» (скелетизация Чжан—Суэн → полилинии → кривые);
//  2) залитый силуэт и 3) листья — потрейсом, для логотипа в шапке и фавиконки.
//   node scripts/trace-logo.mjs
import sharp from 'sharp';
import fs from 'node:fs';
import potrace from 'potrace';

const SRC = 'raw/photos/ya023.jpg';
// окно фигуры в координатах исходника
const BOX = { left: 1180, top: 380, width: 900, height: 1900 };
const K = 0.5; // масштаб для скелета
const { data, info } = await sharp(SRC).extract(BOX).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const W = info.width, H = info.height;

const isInk = (r, g, b) => r < 175 && g < 165 && b < 160 && r >= g - 6 && Math.abs(r - b) < 60 && !(g > r + 12);
const isLeaf = (r, g, b) => g > r + 22 && g > 80;

const ink = new Uint8Array(W * H), leaf = new Uint8Array(W * H);
for (let i = 0; i < W * H; i++) {
  const r = data[i * 3], g = data[i * 3 + 1], b = data[i * 3 + 2];
  if (isInk(r, g, b)) ink[i] = 1;
  if (isLeaf(r, g, b)) leaf[i] = 1;
}

// компоненты связности: убрать дугу круга (огромный габарит) и мусор
function components(mask, w, h) {
  const lab = new Int32Array(w * h).fill(-1); const comps = [];
  const st = [];
  for (let i = 0; i < w * h; i++) {
    if (!mask[i] || lab[i] >= 0) continue;
    const c = { id: comps.length, n: 0, x0: 1e9, y0: 1e9, x1: -1, y1: -1 };
    st.push(i); lab[i] = c.id;
    while (st.length) {
      const p = st.pop(); const x = p % w, y = (p / w) | 0; c.n++;
      if (x < c.x0) c.x0 = x; if (x > c.x1) c.x1 = x; if (y < c.y0) c.y0 = y; if (y > c.y1) c.y1 = y;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
        const q = ny * w + nx; if (mask[q] && lab[q] < 0) { lab[q] = c.id; st.push(q); }
      }
    }
    comps.push(c);
  }
  return { lab, comps };
}
{
  const { lab, comps } = components(ink, W, H);
  for (const c of comps) {
    const touchesEdge = c.x0 <= 2 || c.x1 >= W - 3 || c.y0 <= 2;
    c.keep = c.n > 120 && !(touchesEdge && c.x1 - c.x0 > 300) && c.y0 < H - 40;
  }
  for (let i = 0; i < W * H; i++) if (ink[i] && !comps[lab[i]].keep) ink[i] = 0;
  console.log('ink comps kept', comps.filter((c) => c.keep).map((c) => `${c.x0},${c.y0}-${c.x1},${c.y1}:${c.n}`).join(' '));
}

const toPng = (mask, w, h) => sharp(Buffer.from(mask.map((v) => (v ? 0 : 255))), { raw: { width: w, height: h, channels: 1 } }).png().toBuffer();
const trace = (buf, opts) => new Promise((res, rej) => potrace.trace(buf, opts, (e, svg) => (e ? rej(e) : res(svg))));
const pathsOf = (svg) => [...svg.matchAll(/ d="([^"]+)"/g)].map((m) => m[1]);

// --- залитый силуэт и листья (полный логотип, без текста)
const LBOX = { left: 300, top: 260, width: 2560, height: 2160 };
const full = await sharp(SRC).extract(LBOX).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const fw = full.info.width, fh = full.info.height;
const fInk = new Uint8Array(fw * fh), fLeaf = new Uint8Array(fw * fh);
for (let i = 0; i < fw * fh; i++) {
  const r = full.data[i * 3], g = full.data[i * 3 + 1], b = full.data[i * 3 + 2];
  const x = i % fw + LBOX.left, y = ((i / fw) | 0) + LBOX.top;
  const inFig = x >= BOX.left && x < BOX.left + BOX.width && y >= BOX.top && y < BOX.top + BOX.height;
  if (inFig && ink[(y - BOX.top) * W + (x - BOX.left)]) fInk[i] = 1;
  if (isLeaf(r, g, b) || (g > r + 8 && g > b && r > 100 && r < 200 && Math.abs(g - b) < 30 && y > 1900)) fLeaf[i] = 1;
}
const LS = 0.32; // потрейс на уменьшенной маске — пути в разы короче, глазу разницы нет
const lw = Math.round(fw * LS), lh = Math.round(fh * LS);
const shrink = async (m) => sharp(await toPng(m, fw, fh)).resize(lw, lh).png().toBuffer();
const figSvg = await trace(await shrink(fInk), { turdSize: 6, optTolerance: 0.6, threshold: 150 });
const leafSvg = await trace(await shrink(fLeaf), { turdSize: 10, optTolerance: 0.8, threshold: 128 });
const figD = pathsOf(figSvg).join(' '), leafD = pathsOf(leafSvg).join(' ');

// --- скелет
const sw = Math.round(W * K), sh = Math.round(H * K);
const small = await sharp(Buffer.from(ink.map((v) => (v ? 255 : 0))), { raw: { width: W, height: H, channels: 1 } })
  .resize(sw, sh, { kernel: 'lanczos3' }).blur(0.6).extractChannel(0).raw().toBuffer();
if (small.length !== sw * sh) throw new Error('channels ' + small.length / (sw * sh));
const S = new Uint8Array(sw * sh); for (let i = 0; i < sw * sh; i++) S[i] = small[i] > 100 ? 1 : 0;

function zhangSuen(img, w, h) {
  const at = (x, y) => (x < 0 || y < 0 || x >= w || y >= h ? 0 : img[y * w + x]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const step of [0, 1]) {
      const del = [];
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        if (!img[y * w + x]) continue;
        const p = [at(x, y - 1), at(x + 1, y - 1), at(x + 1, y), at(x + 1, y + 1), at(x, y + 1), at(x - 1, y + 1), at(x - 1, y), at(x - 1, y - 1)];
        const B = p.reduce((a, b) => a + b, 0); if (B < 2 || B > 6) continue;
        let A = 0; for (let k = 0; k < 8; k++) if (!p[k] && p[(k + 1) % 8]) A++;
        if (A !== 1) continue;
        if (step === 0 ? (p[0] * p[2] * p[4] || p[2] * p[4] * p[6]) : (p[0] * p[2] * p[6] || p[0] * p[4] * p[6])) continue;
        del.push(y * w + x);
      }
      if (del.length) { changed = true; for (const i of del) img[i] = 0; }
    }
  }
}
zhangSuen(S, sw, sh);

// граф пикселей → цепочки между концами/развилками
const N8 = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]];
const nb = (i) => { const x = i % sw, y = (i / sw) | 0; const o = []; for (const [dx, dy] of N8) { const nx = x + dx, ny = y + dy; if (nx >= 0 && ny >= 0 && nx < sw && ny < sh && S[ny * sw + nx]) o.push(ny * sw + nx); } return o; };
const deg = (i) => nb(i).length;
const usedEdge = new Set(); const ek = (a, b) => (a < b ? a + ':' + b : b + ':' + a);
const chains = [];
const nodes = []; for (let i = 0; i < sw * sh; i++) if (S[i] && deg(i) !== 2) nodes.push(i);
function walk(start, next) {
  const pts = [start, next]; usedEdge.add(ek(start, next));
  let prev = start, cur = next;
  while (deg(cur) === 2) {
    const n = nb(cur).find((q) => q !== prev && !usedEdge.has(ek(cur, q)));
    if (n === undefined) break;
    usedEdge.add(ek(cur, n)); pts.push(n); prev = cur; cur = n;
  }
  return pts;
}
for (const s of nodes) for (const n of nb(s)) if (!usedEdge.has(ek(s, n))) chains.push(walk(s, n));
// замкнутые петли без узлов
for (let i = 0; i < sw * sh; i++) if (S[i] && deg(i) === 2) { const n = nb(i)[0]; if (!usedEdge.has(ek(i, n))) chains.push(walk(i, n)); }

let polys = chains.map((c) => c.map((i) => [(i % sw) / K, ((i / sw) | 0) / K])).filter((p) => p.length >= 4);
// склейка цепочек, чьи концы почти совпадают и направления продолжают друг друга
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
for (const [MD, ML, MY] of [[24, 0, 0], [70, 8, 640]]) {
let merged = true;
while (merged) {
  merged = false;
  outer: for (let i = 0; i < polys.length; i++) for (let j = 0; j < polys.length; j++) {
    if (i === j) continue;
    const a = polys[i], b = polys[j];
    for (const [ra, rb] of [[false, false], [false, true], [true, false], [true, true]]) {
      const A = ra ? [...a].reverse() : a, B = rb ? [...b].reverse() : b;
      const ea = A[A.length - 1], sb = B[0];
      if (dist(ea, sb) > MD || a.length < ML || b.length < ML || ea[1] < MY) continue;
      const da = [ea[0] - A[Math.max(0, A.length - 8)][0], ea[1] - A[Math.max(0, A.length - 8)][1]];
      const db = [B[Math.min(7, B.length - 1)][0] - sb[0], B[Math.min(7, B.length - 1)][1] - sb[1]];
      const cos = (da[0] * db[0] + da[1] * db[1]) / (Math.hypot(...da) * Math.hypot(...db) || 1);
      if (cos < 0.35) continue;
      polys[i] = [...A, ...B.slice(1)]; polys.splice(j, 1); merged = true; break outer;
    }
  }
}
}
polys = polys.filter((p) => p.length > 18);

function rdp(pts, eps) {
  if (pts.length < 3) return pts;
  const [a, b] = [pts[0], pts[pts.length - 1]];
  let md = 0, mi = 0;
  for (let i = 1; i < pts.length - 1; i++) {
    const p = pts[i]; const L = dist(a, b) || 1;
    const d = Math.abs((b[0] - a[0]) * (a[1] - p[1]) - (a[0] - p[0]) * (b[1] - a[1])) / L;
    if (d > md) { md = d; mi = i; }
  }
  if (md > eps) return [...rdp(pts.slice(0, mi + 1), eps).slice(0, -1), ...rdp(pts.slice(mi), eps)];
  return [a, b];
}
const r1 = (v) => Math.round(v * 10) / 10;
function toBezier(pts) {
  const p = rdp(pts, 2.2);
  let d = `M${r1(p[0][0])} ${r1(p[0][1])}`;
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[i - 1] || p[i], p1 = p[i], p2 = p[i + 1], p3 = p[i + 2] || p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${r1(c1[0])} ${r1(c1[1])} ${r1(c2[0])} ${r1(c2[1])} ${r1(p2[0])} ${r1(p2[1])}`;
  }
  return d;
}
// порядок рисования: сверху вниз
polys.sort((a, b) => Math.min(...a.map((q) => q[1])) - Math.min(...b.map((q) => q[1])));
const strokes = polys.map((p) => ({ d: toBezier(p), len: p.length / K }));
console.log('strokes', strokes.length, strokes.map((s) => Math.round(s.len)).join(','));

const VB = `0 0 ${W} ${H}`;
fs.writeFileSync('public/svg/silhouette.svg',
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${VB}" fill="none" stroke="#1E2722" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">\n${strokes.map((s) => `  <path d="${s.d}"/>`).join('\n')}\n</svg>\n`);
fs.writeFileSync('public/svg/leaves.svg',
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${lw} ${lh}"><path fill="#8C9E86" d="${leafD}"/></svg>\n`);
fs.writeFileSync('public/svg/logo.svg',
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${lw} ${lh}"><path fill="#8C9E86" d="${leafD}"/><path fill="#1E2722" d="${figD}"/></svg>\n`);
// для компонентов: смещение окна фигуры внутри окна логотипа
fs.writeFileSync('lib/silhouette.generated.ts',
  `// Сгенерировано scripts/trace-logo.mjs из логотипа студии — не править руками.\n` +
  `export const SIL_VIEWBOX = '${VB}';\nexport const SIL_STROKES: string[] = ${JSON.stringify(strokes.map((s) => s.d), null, 1)};\n` +
  `export const LOGO_VIEWBOX = '0 0 ${lw} ${lh}';\nexport const LOGO_FIGURE = ${JSON.stringify(figD)};\nexport const LOGO_LEAVES = ${JSON.stringify(leafD)};\n` +
  `export const FIG_OFFSET = { x: ${BOX.left - LBOX.left}, y: ${BOX.top - LBOX.top}, scale: ${LS} };\n`);
console.log('✓ public/svg/{silhouette,leaves,logo}.svg, lib/silhouette.generated.ts');
