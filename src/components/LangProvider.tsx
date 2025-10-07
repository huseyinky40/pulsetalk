'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

type Lang = 'tr' | 'en';

type Dict = Record<string, { tr: string; en: string }>;
const dict: Dict = {
  // common
  back:            { tr: '← Geri',            en: '← Back' },
  terms:           { tr: 'Kullanım Koşulları', en: 'Terms of Use' },
  privacy:         { tr: 'Gizlilik',           en: 'Privacy' },
  beta:            { tr: 'v0.1 Beta',          en: 'v0.1 Beta' },
  tagline:         { tr: 'Konuş, bağlan, köprü kur.', en: 'Talk, connect, bridge.' },

  // home
  appName:         { tr: 'PulseTalk', en: 'PulseTalk' },
  register:        { tr: 'Kayıt Ol',  en: 'Sign Up' },
  login:           { tr: 'Giriş Yap', en: 'Log In' },
  byContinuing:    { tr: 'Devam ederek', en: 'By continuing, you accept' },
  and:             { tr: 've',         en: 'and' },
  youAccept:       { tr: 'kabul etmiş olursun.', en: 'the following.' },

  // register
  registerTitle:   { tr: 'Kayıt Ol', en: 'Sign Up' },
  createAccount:   { tr: 'Hesabını oluştur.', en: 'Create your account.' },
  email:           { tr: 'E-posta', en: 'Email' },
  password:        { tr: 'Şifre', en: 'Password' },
  passwordAgain:   { tr: 'Şifre (Tekrar)', en: 'Password (Repeat)' },
  birth:           { tr: 'Doğum Tarihi (GG/AA/YYYY)', en: 'Birth Date (DD/MM/YYYY)' },
  notRobot:        { tr: 'Robot değilim (dummy)', en: 'I am not a robot (dummy)' },
  haveAccount:     { tr: 'Zaten hesabın var mı?', en: 'Already have an account?' },

  // login
  loginTitle:      { tr: 'Giriş Yap', en: 'Log In' },
  welcomeBack:     { tr: 'Tekrar hoş geldin! Konuşmaya hazırsın.', en: 'Welcome back! Ready to keep the conversation going.' },
  rememberMe:      { tr: 'Beni hatırla', en: 'Remember me' },
  forgotPassword:  { tr: 'Şifreni mi unuttun?', en: 'Forgot your password?' },
  noAccount:       { tr: 'Hesabın yok mu?', en: "Don't have an account?" },
};

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (k: keyof typeof dict) => string;
};

const LangContext = createContext<Ctx | null>(null);

export default function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>('tr');

  // ilk yüklemede localStorage oku
  useEffect(() => {
    try {
      const saved = localStorage.getItem('lang') as Lang | null;
      if (saved === 'tr' || saved === 'en') setLang(saved);
    } catch {}
  }, []);

  const value = useMemo<Ctx>(() => ({
    lang,
    setLang: (l) => {
      setLang(l);
      try { localStorage.setItem('lang', l); } catch {}
    },
    t: (k) => dict[k][lang],
  }), [lang]);

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLang must be used within LangProvider');
  return ctx;
}
