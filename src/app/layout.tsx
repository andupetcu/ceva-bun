import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';
import { ThemeToggle } from '@/components/ThemeToggle';

export const metadata: Metadata = {
  title: 'Ceva Bun',
  description: 'Descoperă ceva bun de băut, mâncat sau făcut în România.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro" className="dark">
      <body>
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
