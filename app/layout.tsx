import type { Metadata, Viewport } from 'next';
import { Prata, Manrope, Marck_Script, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';
import SmoothScroll from '@/components/SmoothScroll';
import Cursor from '@/components/ui/Cursor';
import { BASE } from '@/lib/base';

const prata = Prata({ subsets: ['cyrillic', 'latin'], weight: '400', display: 'swap', variable: '--f-prata' });
const manrope = Manrope({ subsets: ['cyrillic', 'latin'], weight: ['400', '500', '600'], display: 'swap', variable: '--f-manrope' });
const marck = Marck_Script({ subsets: ['cyrillic', 'latin'], weight: '400', display: 'swap', variable: '--f-marck', preload: false });
const plex = IBM_Plex_Mono({ subsets: ['cyrillic', 'latin'], weight: ['400', '500'], display: 'swap', variable: '--f-plex' });

const TITLE = 'Чувство формы — аппаратная коррекция фигуры и косметология в Казани';
const DESC =
  'Студия на ул. Юлиуса Фучика, 53: LPG, сферы, EMSLIM, прессотерапия и микроигольчатый RF‑лифтинг Morpheus8. Курс собирается под ваши цели и замеры. Ежедневно 10:00–18:00.';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://purich755.github.io'),
  title: TITLE,
  description: DESC,
  icons: { icon: `${BASE}/svg/favicon.svg` },
  openGraph: {
    title: TITLE,
    description: DESC,
    locale: 'ru_RU',
    type: 'website',
    images: [{ url: `${BASE}/images/morpheus8-device-1600.webp`, width: 1600, height: 2398, alt: 'Аппарат Morpheus8 в кабинете студии' }],
  },
};

export const viewport: Viewport = { themeColor: '#F3F2EE', width: 'device-width', initialScale: 1 };

// До первой отрисовки: прелоадер показываем один раз за сессию.
const INTRO = `try{if(sessionStorage.getItem('cf-intro'))document.documentElement.setAttribute('data-intro','skip')}catch(e){document.documentElement.setAttribute('data-intro','skip')}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: INTRO }} />
      </head>
      <body className={`${prata.variable} ${manrope.variable} ${marck.variable} ${plex.variable}`}>
        <SmoothScroll />
        {children}
        <div className="grain" aria-hidden="true" />
        <Cursor />
      </body>
    </html>
  );
}
