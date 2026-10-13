import type { NextConfig } from 'next';

// GITHUB_PAGES=true — статический экспорт под https://purich755.github.io/<REPO>/ (собирает GitHub Actions).
// STATIC_EXPORT=true — тот же экспорт в корень домена (папка out/ на любой хостинг).
// Без переменных — обычная сборка Next (Vercel, локально).
const pages = process.env.GITHUB_PAGES === 'true';
const exportOnly = pages || process.env.STATIC_EXPORT === 'true';
const basePath = pages ? `/${process.env.PAGES_REPO || 'Chuvstvo-formy'}` : '';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // в родительской папке лежит свой package-lock — фиксируем корень трассировки на проекте
  outputFileTracingRoot: process.cwd(),
  basePath,
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  // картинки уже нарезаны скриптом в 800/1600 — next/image берёт их через свой loader
  images: { loader: 'custom', loaderFile: './lib/image-loader.ts' },
  ...(exportOnly ? { output: 'export' as const, trailingSlash: true } : {}),
};

export default nextConfig;
