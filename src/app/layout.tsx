import type { Metadata } from 'next';
import Script from 'next/script';
import Link from 'next/link';
import './globals.css';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ServiceWorkerRegister } from '@/components/ServiceWorkerRegister';

export const metadata: Metadata = {
  title: {
    default: 'Ceva Bun — Descoperă produse și experiențe în România',
    template: '%s | Ceva Bun',
  },
  description:
    'Nu știi ce vrei, dar vrei ceva bun. Alegi categoria, pui bugetul, noi găsim ceva perfect — băuturi, cărți, modă, experiențe și multe altele.',
  keywords: [
    'cadouri România',
    'idei cadou',
    'recomandări produse',
    'ceva bun de băut',
    'ceva bun de citit',
    'experiențe România',
    'cadouri pentru copii',
    'modă România',
    'cărți online',
    'activități România',
  ],
  metadataBase: new URL('https://ceva-bun.ro'),
  manifest: '/manifest.json',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'ro_RO',
    url: 'https://ceva-bun.ro',
    siteName: 'Ceva Bun',
    title: 'Ceva Bun — Descoperă produse și experiențe în România',
    description:
      'Alegi categoria, pui bugetul, noi găsim ceva perfect. Băuturi, cărți, modă, jucării, experiențe.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Ceva Bun — Descoperă ceva bun',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ceva Bun — Descoperă produse și experiențe în România',
    description:
      'Alegi categoria, pui bugetul, noi găsim ceva perfect.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro" className="dark">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/icon-192.svg" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0f172a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body>
        <ServiceWorkerRegister />
        <Script
          src="https://analytics.noru1.ro/script.js"
          data-website-id="2a4e7fc4-58d3-44fc-9d4e-7e1c80c90b7d"
          strategy="afterInteractive"
        />
        <div className="mx-auto max-w-6xl px-4 py-6 md:px-8">
          <header className="mb-8 flex items-center justify-between">
            <Link href="/" className="text-2xl font-black tracking-tight text-cyan-300">
              Ceva Bun
            </Link>
            <div className="flex items-center gap-3">
              <Link href="/toate" className="text-sm text-slate-300 hover:text-white">
                Toate
              </Link>
              <Link href="/sugereaza" className="text-sm text-slate-300 hover:text-white">
                Sugerează
              </Link>
              <Link href="/harta?c=de_facut" className="text-sm text-slate-300 hover:text-white">
                Hartă
              </Link>
              <ThemeToggle />
            </div>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
