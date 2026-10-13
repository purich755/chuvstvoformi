// Префикс путей к файлам из public/: пустой локально и на Vercel, '/<Repo>' на GitHub Pages.
export const BASE = process.env.NEXT_PUBLIC_BASE_PATH || '';
export const asset = (p: string) => `${BASE}${p}`;
