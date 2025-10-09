'use client';

import Link from 'next/link';
import { ChangeEvent, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import zxcvbn from 'zxcvbn';
import { useLang } from '../../components/LangProvider';
import { addUser, getUserByEmail, getUserByUsername } from '../../lib/userStore';

const passwordSchema = z
  .string()
  .min(12, 'Şifre en az 12 karakter olmalı')
  .regex(/[A-Z]/, 'En az bir büyük harf olmalı')
  .regex(/[0-9]/, 'En az bir rakam olmalı');

const schema = z
  .object({
    username: z
      .string()
      .min(3, 'Kullanıcı adı en az 3 karakter olmalı')
      .max(15, 'Kullanıcı adı en fazla 15 karakter olabilir')
      .regex(/^[a-zA-Z0-9._-]+$/, 'Sadece harf, sayı ve ._- kullanılabilir'),
    email: z.string().email('Geçerli bir e-posta girin'),
    password: passwordSchema,
    confirm: z.string(),
    birth: z.string().min(10, 'Doğum tarihi (GG/AA/YYYY)'),
  })
  .refine((d) => d.password === d.confirm, {
    path: ['confirm'],
    message: 'Şifreler eşleşmiyor',
  })
  .refine((d) => {
    const [day, month, year] = d.birth.split('/').map(Number);
    const dob = new Date(year, month - 1, day);
    if (isNaN(dob.getTime())) return false;
    const now = new Date();
    const seventeen = new Date(now.getFullYear() - 17, now.getMonth(), now.getDate());
    return dob <= seventeen;
  }, {
    path: ['birth'],
    message: 'Sosyal Köprü için 17+ gerekir',
  });

type FormData = z.infer<typeof schema>;

const generateVerificationCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  do {
    code = Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  } while (!/[a-zA-Z]/.test(code) || !/\d/.test(code));
  return code;
};

export default function RegisterPage() {
  const { t, lang } = useLang();

  const {
    register,
    handleSubmit,
    setValue,
    setFocus,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const [birthValue, setBirthValue] = useState('');
  const [passwordStrength, setPasswordStrength] = useState<number>(0);
  const [captchaPassed, setCaptchaPassed] = useState(false);
  const [verificationCode, setVerificationCode] = useState<string | null>(null);
  const [verificationInput, setVerificationInput] = useState('');
  const [pendingUser, setPendingUser] = useState<
    {
      username: string;
      email: string;
      password: string;
      birth: string;
    } | null
  >(null);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);

  const handleBirthChange = (e: ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 2) value = value.slice(0, 2) + '/' + value.slice(2);
    if (value.length > 5) value = value.slice(0, 5) + '/' + value.slice(5, 9);
    setBirthValue(value);
    setValue('birth', value, { shouldValidate: true });
  };

  const passwordRegister = register('password');
  const onPasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    passwordRegister.onChange(e);
    const result = zxcvbn(e.target.value);
    setPasswordStrength(result.score);
  };

  const handleCaptcha = (e: ChangeEvent<HTMLInputElement>) => {
    setCaptchaPassed(e.target.checked);
  };

  const onSubmit = async (data: FormData) => {
    if (!captchaPassed) {
      alert(lang === 'tr' ? 'Lütfen robot olmadığınızı doğrulayın.' : 'Please verify you are not a robot.');
      return;
    }

    try {
      const usernameMatch = await getUserByUsername(data.username);
      if (usernameMatch) {
        setError('username', {
          type: 'manual',
          message: lang === 'tr' ? 'Bu kullanıcı adı zaten alınmış' : 'This username is already taken',
        });
        return;
      }

      const emailMatch = await getUserByEmail(data.email);
      if (emailMatch) {
        setError('email', {
          type: 'manual',
          message: lang === 'tr' ? 'Bu e-posta zaten kayıtlı' : 'This email is already registered',
        });
        return;
      }
    } catch (error) {
      console.error('Kullanıcı kontrolü başarısız:', error);
      alert(
        lang === 'tr'
          ? 'Veritabanına erişilirken bir hata oluştu. Lütfen tekrar dene.'
          : 'An error occurred while accessing the database. Please try again.',
      );
      return;
    }

    setSendingCode(true);
    const code = generateVerificationCode();
    setVerificationCode(code);
    setPendingUser({
      username: data.username,
      email: data.email,
      password: data.password,
      birth: data.birth,
    });
    setVerificationInput('');
    setVerificationError(null);
    setModalOpen(true);

    await new Promise((resolve) => setTimeout(resolve, 800));
    console.log(`Doğrulama kodu (${data.email}):`, code);
    setSendingCode(false);
    alert(
      lang === 'tr'
        ? 'Doğrulama kodu e-postana gönderildi. Lütfen kodu gir.'
        : 'A verification code has been sent to your email. Please enter the code.',
    );
  };

  useEffect(() => {
    if (errors.username) setFocus('username');
    else if (errors.email) setFocus('email');
    else if (errors.password) setFocus('password');
    else if (errors.confirm) setFocus('confirm');
    else if (errors.birth) setFocus('birth');
  }, [errors, setFocus]);

  const handleVerification = async () => {
    if (!verificationCode || !pendingUser) return;
    if (verificationInput.trim().toUpperCase() === verificationCode.toUpperCase()) {
      try {
        await addUser({
          username: pendingUser.username,
          email: pendingUser.email,
          password: pendingUser.password,
          birth: pendingUser.birth,
        });

        setModalOpen(false);
        setVerificationCode(null);
        setPendingUser(null);
        setVerificationInput('');
        setVerificationError(null);
        reset();
        setBirthValue('');
        setCaptchaPassed(false);
        alert(lang === 'tr' ? 'Kayıt işlemi başarıyla tamamlandı!' : 'Registration completed successfully!');
      } catch (error) {
        console.error('Kullanıcı kaydedilemedi:', error);
        setVerificationError(
          lang === 'tr'
            ? 'Kayıt sırasında bir hata oldu. Lütfen tekrar dene.'
            : 'Something went wrong while saving. Please try again.',
        );
      }
    } else {
      setVerificationError(
        lang === 'tr' ? 'Doğrulama kodu hatalı, lütfen tekrar deneyin.' : 'Verification code is incorrect. Please try again.',
      );
    }
  };

  const handleResend = () => {
    if (!pendingUser) return;
    setSendingCode(true);
    const newCode = generateVerificationCode();
    setVerificationCode(newCode);
    setVerificationError(null);
    setVerificationInput('');
    setTimeout(() => {
      console.log(`Yeni doğrulama kodu (${pendingUser.email}):`, newCode);
      setSendingCode(false);
      alert(
        lang === 'tr'
          ? 'Yeni doğrulama kodu e-postana gönderildi.'
          : 'A new verification code has been sent to your email.',
      );
    }, 800);
  };

  const handleCancelVerification = () => {
    setModalOpen(false);
    setVerificationCode(null);
    setPendingUser(null);
    setVerificationInput('');
    setVerificationError(null);
    setSendingCode(false);
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-6 relative">
      <Link
        href="/"
        className="absolute top-4 left-4 text-sm text-slate-600 dark:text-slate-300 hover:underline underline-offset-2"
      >
        {t('back')}
      </Link>

      <section className="relative z-10 w-full max-w-md rounded-2xl border border-slate-200/70 dark:border-white/10 bg-white/80 dark:bg-white/10 p-6 shadow-xl backdrop-blur-lg">
        <h1 className="text-3xl font-bold mb-1">{t('registerTitle')}</h1>
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">{t('createAccount')}</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">{t('username')}</label>
            <input
              type="text"
              maxLength={15}
              {...register('username')}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2"
              placeholder={lang === 'tr' ? 'Kullanıcı adın (max 15)' : 'Username (max 15)'}
            />
            {errors.username && <p className="text-sm text-red-500 mt-1">{errors.username.message}</p>}
          </div>

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
              placeholder={
                lang === 'tr'
                  ? 'En az 12 karakter, 1 büyük harf, 1 rakam'
                  : 'Min 12 chars, 1 uppercase, 1 number'
              }
            />
            <div className="mt-2 h-2 w-full rounded bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <div
                className={`h-full transition-all ${
                  passwordStrength === 0
                    ? 'w-1/12 bg-red-500'
                    : passwordStrength === 1
                    ? 'w-1/4 bg-orange-500'
                    : passwordStrength === 2
                    ? 'w-2/4 bg-yellow-500'
                    : passwordStrength === 3
                    ? 'w-3/4 bg-green-500'
                    : 'w-full bg-emerald-600'
                }`}
              />
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
            disabled={isSubmitting || sendingCode}
            className="w-full rounded-xl bg-gradient-to-r from-sky-500 to-emerald-500 text-white font-semibold py-2.5 hover:opacity-95 active:scale-[0.98] transition disabled:opacity-70"
          >
            {t('registerTitle')}
          </button>
        </form>

        <p className="text-sm mt-4">
          {t('haveAccount')}{' '}
          <Link href="/login" className="underline underline-offset-2">
            {t('login')}
          </Link>
        </p>
      </section>

      {modalOpen && (
        <div className="fixed inset-0 z-30 flex items-center justify-center px-4 pointer-events-none">
          <div className="w-full max-w-md rounded-2xl bg-white/90 dark:bg-slate-900/90 p-6 shadow-2xl pointer-events-auto">
            <h2 className="text-xl font-semibold mb-2">{t('verifyEmailTitle')}</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">{t('verifyEmailDescription')}</p>
            <input
              type="text"
              value={verificationInput}
              onChange={(e) => setVerificationInput(e.target.value)}
              maxLength={5}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 tracking-widest uppercase"
              placeholder="•••••"
            />
            {verificationError && <p className="text-sm text-red-500 mt-2">{verificationError}</p>}
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">{t('verifyEmailHint')}</p>
            {verificationCode && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                {t('demoCodeReveal')} {verificationCode}
              </p>
            )}
            <div className="mt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <button
                type="button"
                onClick={handleResend}
                disabled={sendingCode}
                className="text-sm text-sky-600 hover:underline disabled:opacity-60 dark:text-emerald-400"
              >
                {sendingCode ? t('resendingCode') : t('resendCode')}
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCancelVerification}
                  className="rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-2 text-sm"
                >
                  {t('cancel')}
                </button>
                <button
                  type="button"
                  onClick={handleVerification}
                  className="rounded-lg bg-gradient-to-r from-sky-500 to-emerald-500 px-4 py-2 text-sm font-semibold text-white"
                >
                  {t('confirmCode')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
