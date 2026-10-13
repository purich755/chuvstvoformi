// Подпись «Чувство формы» шрифтом Marck Script → SVG-пути по одной на букву (для прописи обводкой в финале).
//   node scripts/build-signature.mjs
import opentype from 'opentype.js';
import fs from 'node:fs';

const FONT = 'raw/fonts/MarckScript-Regular.ttf'; // github.com/google/fonts/ofl/marckscript (OFL)
if (!fs.existsSync(FONT)) {
  const r = await fetch('https://github.com/google/fonts/raw/main/ofl/marckscript/MarckScript-Regular.ttf');
  fs.mkdirSync('raw/fonts', { recursive: true });
  fs.writeFileSync(FONT, Buffer.from(await r.arrayBuffer()));
}
const font = opentype.parse(fs.readFileSync(FONT).buffer);
const TEXT = 'Чувство формы';
const SIZE = 120;
const paths = font.getPaths(TEXT, 0, SIZE, SIZE, { kerning: true });
let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
const glyphs = [];
for (const p of paths) {
  const bb = p.getBoundingBox();
  if (!isFinite(bb.x1) || bb.x2 - bb.x1 < 1) continue;
  x0 = Math.min(x0, bb.x1); y0 = Math.min(y0, bb.y1); x1 = Math.max(x1, bb.x2); y1 = Math.max(y1, bb.y2);
  glyphs.push(p.toPathData(1));
}
const pad = 6;
const vb = `${Math.floor(x0 - pad)} ${Math.floor(y0 - pad)} ${Math.ceil(x1 - x0 + pad * 2)} ${Math.ceil(y1 - y0 + pad * 2)}`;
fs.writeFileSync('public/svg/signature.svg',
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" fill="#1E2722">\n${glyphs.map((d) => `  <path d="${d}"/>`).join('\n')}\n</svg>\n`);
fs.writeFileSync('lib/signature.generated.ts',
  `// Сгенерировано scripts/build-signature.mjs (Marck Script, OFL) — не править руками.\nexport const SIGN_VIEWBOX = '${vb}';\nexport const SIGN_GLYPHS: string[] = ${JSON.stringify(glyphs, null, 1)};\n`);
console.log('✓ signature', glyphs.length, 'glyphs', vb);
