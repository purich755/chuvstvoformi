// Фото заранее нарезаны scripts/fetch-images.mjs в два размера: <name>-800.webp и <name>-1600.webp.
// next/image просит ширину — отдаём ближайший готовый файл.
export default function loader({ src, width }: { src: string; width: number }) {
  const base = process.env.NEXT_PUBLIC_BASE_PATH || '';
  return `${base}${src}-${width <= 800 ? 800 : 1600}.webp`;
}
