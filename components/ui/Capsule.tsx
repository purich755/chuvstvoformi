import Photo from './Photo';

type Props = {
  name: string;
  alt: string;
  sizes: string;
  shape?: 'capsule' | 'wide' | 'square' | 'tall';
  priority?: boolean;
  className?: string;
  cursor?: string;
  children?: React.ReactNode;
};

/** Фото в капсульной маске. Капсула «вдавливается» при наведении, фото чуть приближается внутри. */
export default function Capsule({ name, alt, sizes, shape = 'capsule', priority, className = '', cursor = 'смотреть', children }: Props) {
  return (
    <figure className={`capsule capsule--${shape} ${className}`} data-cursor={cursor}>
      <div className="capsule__inner">
        <Photo name={name} alt={alt} sizes={sizes} priority={priority} className="capsule__img" />
      </div>
      {children}
    </figure>
  );
}
