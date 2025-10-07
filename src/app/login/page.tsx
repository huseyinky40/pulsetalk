'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLang } from '../../components/LangProvider';
import { getUserByUsername } from '../../lib/userStore';

const schema = z.object({
  username: z
    .string()
    .min(3, 'Kullanıcı adı gerekli')
    .max(15, 'Kullanıcı adı en fazla 15 karakter olabilir'),
  password: z.string().min(1, 'Şifre gerekli'),
  remember: z.boolean().optional(),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const { t, lang } = useLang();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { remember: true },
  });
  const [submitting, setSubmitting] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const onSubmit = async (data: FormData) => {
    setLoginError(null);
    setSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 400));

    try {
      const user = await getUserByUsername(data.username.trim());

      if (!user || user.password !== data.password) {
        setLoginError(t('invalidCredentials'));
      } else {
        alert(t('loginSuccess'));
      }
    } catch (error) {
      console.error('Giriş kontrolü başarısız:', error);
      setLoginError(t('invalidCredentials'));
    }

    setSubmitting(false);
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 sm:px-6 relative">
      <Link
        href="/"
        className="absolute top-4 left-4 text-sm text-slate-600 dark:text-slate-300 hover:underline underline-offset-2"
      >
        {t('back')}
      </Link>

      <section className="relative z-10 w-full max-w-md rounded-2xl border border-slate-200/70 dark:border-white/10 bg-white/80 dark:bg-slate-900/70 p-8 sm:p-10 shadow-xl backdrop-blur-lg">
        <h1 className="text-3xl font-bold mb-1">{t('loginTitle')}</h1>
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">{t('welcomeBack')}</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 sm:space-y-6">
          <div>
            <label className="block text-sm mb-1">{t('username')}</label>
            <input
              type="text"
              maxLength={15}
              {...register('username')}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2"
              placeholder={lang === 'tr' ? 'Kullanıcı adın' : 'Your username'}
            />
            {errors.username && (
              <p className="text-sm text-red-500 mt-1">{errors.username.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm mb-1">{t('password')}</label>
            <input
              type="password"
              {...register('password')}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2"
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>
            )}
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" {...register('remember')} className="w-4 h-4" />
              <span className="text-slate-600 dark:text-slate-300">{t('rememberMe')}</span>
            </label>
            <button
              type="button"
              className="text-sky-600 hover:underline dark:text-emerald-400"
              onClick={() => alert('Şifre sıfırlama yakında!')}
            >
              {t('forgotPassword')}
            </button>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || submitting}
            className="w-full rounded-xl bg-gradient-to-r from-sky-500 to-emerald-500 text-white font-semibold py-3 hover:opacity-95 active:scale-[0.98] transition disabled:opacity-70"
          >
            {t('loginTitle')}
          </button>

          {loginError && <p className="text-sm text-red-500 text-center">{loginError}</p>}
        </form>

        <p className="text-sm mt-4">
          {t('noAccount')}{' '}
          <Link href="/register" className="underline underline-offset-2">
            {t('register')}
          </Link>
        </p>
      </section>
    </main>
  );
}
