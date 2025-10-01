'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import zxcvbn from 'zxcvbn';
import { useLang } from '../../components/LangProvider';

// ... (schema aynı)

const passwordSchema = z.string().min(12, 'Şifre en az 12 karakter olmalı').regex(/[A-Z]/, 'En az bir büyük harf olmalı').regex(/[0-9]/, 'En az bir rakam olmalı');
const schema = z.object({
  email: z.string().email('Geçerli bir e-posta girin'),
  password: passwordSchema,
  confirm: z.string(),
  birth: z.string().min(10, 'Doğum tarihi (GG/AA/YYYY)'),
}).refine((d) => d.password === d.confirm, { path: ['confirm'], message: 'Şifreler eşleşmiyor' })
  .refine((d) => { const [day, month, year] = d.birth.split('/').map(Number); const dob = new Date(year, month-1, day); if (isNaN(dob.getTime())) return false; const now = new Date(); const seventeen = new Date(now.getFullYear()-17, now.getMonth(), now.getDate()); return dob <= seventeen; }, { path: ['birth'], message: 'Sosyal Köprü için 17+ gerekir' });

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const { t, lang } = useLang();

  const { register, handleSubmit, setValue, setFocus, formState: { errors, isSubmitting } } =
    useForm<FormData>({ resolver: zodResolver(schema) });

  const [birthValue, setBirthValue] = useState('');
  const [passwordStrength, setPasswordStrength] = useState<number>(0);
  const [captchaPassed, setCaptchaPassed] = useState(false);

  const handleBirthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 2) value = value.slice(0, 2) + '/' + value.slice(2);
    if (value.length > 5) value = value.slice(0, 5) + '/' + value.slice(5, 9);
    setBirthValue(value);
    setValue('birth', value, { shouldValidate: true });
  };

  const passwordRegister = register('password');
  const onPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    passwordRegister.onChange(e);
    const result = zxcvbn(e.target.value);
    setPasswordStrength(result.score);
  };

  const handleCaptcha = () => setCaptchaPassed(true);

  const onSubmit = async (data: FormData) => {
    if (!captchaPassed) { alert('Lütfen robot olmadığınızı doğrulayın.'); return; }
    console.log('Register verisi:', data);
  };

  useEffect(() => {
    if (errors.email) setFocus('email');
    else if (errors.password) setFocus('password');
    else if (errors.confirm) setFocus('confirm');
    else if (errors.birth) setFocus('birth');
  }, [errors, setFocus]);

  return (
    <main className="min-h-screen flex items-center justify-center px-6 relative">
      {/* Sol üst geri */}
      <Link href="/" className="absolute top-4 left-4 text-sm text-slate-600 dark:text-slate-300 hover:underline underline-offset-2">
        {t('back')}
      </Link>

      <section className="relative z-10 w-full max-w-md rounded-2xl border border-slate-200/70 dark:border-white/10 bg-white/80 dark:bg-white/10 p-6 shadow-xl backdrop-blur-lg">
        <h1 className="text-3xl font-bold mb-1">{t('registerTitle')}</h1>
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">{t('createAccount')}</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">{t('email')}</label>
            <input
              type="email"
              {...register('email')}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2"
              placeholder="ornek@mail.com"
            />
            {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm mb-1">{t('password')}</label>
            <input
              type="password"
              {...passwordRegister}
              onChange={onPasswordChange}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2"
              placeholder={lang === 'tr' ? 'En az 12 karakter, 1 büyük harf, 1 rakam' : 'Min 12 chars, 1 uppercase, 1 number'}
            />
            <div className="mt-2 h-2 w-full rounded bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <div className={`h-full transition-all ${
                passwordStrength === 0 ? 'w-1/12 bg-red-500'
                : passwordStrength === 1 ? 'w-1/4 bg-orange-500'
                : passwordStrength === 2 ? 'w-2/4 bg-yellow-500'
                : passwordStrength === 3 ? 'w-3/4 bg-green-500'
                : 'w-full bg-emerald-600'
              }`} />
            </div>
            {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>}
          </div>

          <div>
            <label className="block text-sm mb-1">{t('passwordAgain')}</label>
            <input
              type="password"
              {...register('confirm')}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2"
              placeholder="••••••••••••"
            />
            {errors.confirm && <p className="text-sm text-red-500 mt-1">{errors.confirm.message}</p>}
          </div>

          <div>
            <label className="block text-sm mb-1">{t('birth')}</label>
            <input
              type="text"
              value={birthValue}
              onChange={handleBirthChange}
              maxLength={10}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2"
              placeholder={lang === 'tr' ? 'GG/AA/YYYY' : 'DD/MM/YYYY'}
            />
            {errors.birth && <p className="text-sm text-red-500 mt-1">{errors.birth.message}</p>}
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" checked={captchaPassed} onChange={handleCaptcha} className="w-4 h-4" />
            <span className="text-sm text-slate-600 dark:text-slate-300">{t('notRobot')}</span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-gradient-to-r from-sky-500 to-emerald-500 text-white font-semibold py-2.5 hover:opacity-95 active:scale-[0.98] transition"
          >
            {t('registerTitle')}
          </button>
        </form>

        <p className="text-sm mt-4">
          {t('haveAccount')}{' '}
          <Link href="/login" className="underline underline-offset-2">{t('login')}</Link>
        </p>
      </section>
    </main>
  );
}
