'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { useLang } from '../components/LangProvider';

export default function Home() {
  const [loading, setLoading] = useState(true);
  const { t } = useLang();

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3 animate-pulse">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-emerald-400 text-white shadow-xl">
            <MessageCircle size={40} strokeWidth={2.5} />
          </div>
          <h1 className="text-4xl font-extrabold text-sky-600 dark:text-emerald-400 [font-family:var(--font-orbitron)]">
            {t('appName')}
          </h1>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen flex items-center justify-center px-6">
      <section className="relative w-full max-w-lg rounded-3xl border border-slate-200/70 dark:border-white/10 
                          bg-white/80 dark:bg-slate-900/70 p-10 text-center shadow-xl backdrop-blur-xl">

        {/* Logo */}
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-emerald-400 text-white shadow-2xl">
          <MessageCircle size={34} strokeWidth={2.5} />
        </div>

        {/* Başlık */}
        <h1 className="mb-2 bg-gradient-to-r from-sky-500 via-teal-500 to-emerald-500 bg-clip-text text-transparent text-5xl font-extrabold tracking-wide [font-family:var(--font-orbitron)]">
          {t('appName')}
        </h1>
        <p className="mb-8 text-base text-slate-600 dark:text-slate-300">
          {t('tagline')}
        </p>

        {/* Butonlar */}
        <div className="mb-6 flex flex-col items-center gap-3 sm:flex-row">
          <Link href="/register" className="group relative w-56 rounded-2xl bg-gradient-to-r from-sky-500 to-emerald-500 p-[2px] text-white hover:scale-[1.05]">
            <span className="block rounded-2xl bg-white/20 px-6 py-3 text-center font-semibold backdrop-blur-md">
              🚀 {t('register')}
            </span>
          </Link>

          <Link href="/login" className="group relative w-56 rounded-2xl border border-slate-200/70 bg-white/70 px-[2px] py-[2px] text-slate-900 dark:text-white hover:scale-[1.05]">
            <span className="block rounded-2xl px-6 py-3 text-center font-semibold">
              🔑 {t('login')}
            </span>
          </Link>
        </div>

        <footer className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          {t('byContinuing')}{' '}
          <Link href="/legal/terms" className="underline underline-offset-2">
            {t('terms')}
          </Link>{' '}
          {t('and')}{' '}
          <Link href="/legal/privacy" className="underline underline-offset-2">
            {t('privacy')}
          </Link>{' '}
          {t('youAccept')}
          <div className="mt-1 text-xs opacity-70">{t('beta')}</div>
        </footer>
      </section>
    </main>
  );
}
