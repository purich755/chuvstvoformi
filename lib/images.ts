import manifest from '@/public/images/manifest.json';

type Entry = { name: string; files: Record<string, { file: string; width?: number; height?: number }> };
const DIMS: Record<string, { w: number; h: number }> = {};
for (const e of manifest.images as unknown as Entry[]) {
  const f = e.files['1600'] || e.files.poster;
  if (f?.width && f.height) DIMS[e.name.replace(/-video$/, '-poster')] = { w: f.width, h: f.height };
}

/** Размеры кадра (по версии 1600) — для width/height у next/image, чтобы не было сдвигов */
export const dims = (name: string) => DIMS[name] ?? { w: 1600, h: 1600 };
export const src = (name: string) => `/images/${name}`;
