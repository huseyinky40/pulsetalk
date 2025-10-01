import type { Metadata } from 'next';
import './globals.css';
import { Sora, Orbitron } from 'next/font/google';
import LangProvider from '../components/LangProvider';
import LanguageSwitcher from '../components/LanguageSwitcher';

const sora = Sora({ subsets: ['latin'], variable: '--font-sora' });
const orbitron = Orbitron({ subsets: ['latin'], variable: '--font-orbitron' });

export const metadata: Metadata = {
  title: 'PulseTalk',
  description: 'Konuş, bağlan, köprü kur.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="tr"
      suppressHydrationWarning
      className={`${sora.variable} ${orbitron.variable}`}
    >
      <body className="font-[var(--font-sora)] min-h-screen relative text-gray-900 dark:text-gray-100">
        {/* BACKGROUND: gradient + dots */}
        <div className="fixed inset-0 -z-10">
          <div className="absolute inset-0 dark:hidden
            bg-[radial-gradient(1000px_1000px_at_20%_10%,rgba(2,132,199,.15),transparent_40%),radial-gradient(800px_800px_at_80%_60%,rgba(16,185,129,.18),transparent_40%),linear-gradient(to_bottom,#f0f9ff,#ecfeff_40%,#f0fdf4_100%)]" />
          <div className="absolute inset-0 hidden dark:block
            bg-[radial-gradient(900px_900px_at_20%_10%,rgba(59,130,246,.12),transparent_40%),radial-gradient(700px_700px_at_80%_60%,rgba(16,185,129,.14),transparent_40%),linear-gradient(to_bottom,#0b1220,#0b1320_40%,#0a0f1a_100%)]" />
          <div className="absolute inset-0 opacity-25 dark:opacity-15
            [background-image:radial-gradient(currentColor_0.6px,transparent_0.6px)]
            [background-size:14px_14px] text-slate-700 dark:text-slate-300" />
        </div>

        {/* i18n provider tüm sayfaları sarar */}
        <LangProvider>
          {/* Sağ üst: global dil seçici */}
          <LanguageSwitcher />
          <div className="relative z-10">{children}</div>
        </LangProvider>
      </body>
    </html>
  );
}
