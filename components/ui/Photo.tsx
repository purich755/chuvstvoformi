import Image from 'next/image';
import { dims, src } from '@/lib/images';

type Props = {
  name: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
  style?: React.CSSProperties;
  flipId?: string;
};

/** next/image поверх заранее нарезанных 800/1600 WebP (см. lib/image-loader.ts) */
export default function Photo({ name, alt, sizes, priority, className, style, flipId }: Props) {
  const d = dims(name);
  return (
    <Image
      src={src(name)}
      alt={alt}
      width={d.w}
      height={d.h}
      sizes={sizes}
      priority={priority}
      className={className}
      style={style}
      draggable={false}
      data-flip-id={flipId}
    />
  );
}
