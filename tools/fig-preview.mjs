// Превью фигур карты тела: node tools/fig-preview.mjs → raw/peek/figures.png
import sharp from 'sharp';
import * as F from '../lib/figures.ts';
const svg = (strokes, shapes, dots) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 900" width="400" height="900"><rect width="400" height="900" fill="#F3F2EE"/>
${Object.values(shapes).flat().map((e) => `<ellipse cx="${e.cx}" cy="${e.cy}" rx="${e.rx}" ry="${e.ry}" transform="rotate(${e.rot || 0} ${e.cx} ${e.cy})" fill="#D8B9A5" fill-opacity=".35"/>`).join('')}
${strokes.map((d) => `<path d="${d}" fill="none" stroke="#1E2722" stroke-width="2" stroke-linecap="round"/>`).join('')}
${Object.values(dots).map(([x, y]) => `<circle cx="${x}" cy="${y}" r="6" fill="#56684F"/>`).join('')}</svg>`;
const a = await sharp(Buffer.from(svg(F.BODY_STROKES, F.BODY_SHAPES, F.BODY_DOTS))).png().toBuffer();
const b = await sharp(Buffer.from(svg(F.FACE_STROKES, F.FACE_SHAPES, F.FACE_DOTS))).png().toBuffer();
await sharp({ create: { width: 810, height: 900, channels: 3, background: '#000' } }).composite([{ input: a, left: 0, top: 0 }, { input: b, left: 410, top: 0 }]).png().toFile('raw/peek/figures.png');
console.log('ok');
