'use client';
import { useLang } from './LangProvider';

export default function LanguageSwitcher() {
  const { lang, setLang } = useLang();

  return (
    <div className="fixed top-4 right-4 z-20">
      <select
        value={lang}
        onChange={(e) => setLang(e.target.value as 'tr' | 'en')}
        className="rounded-xl border border-slate-200/60 dark:border-slate-700
                   bg-white/70 dark:bg-white/10 px-3 py-2 text-sm shadow-sm
                   backdrop-blur-md"
        aria-label="Language"
      >
        <option value="tr">TR</option>
        <option value="en">EN</option>
      </select>
    </div>
  );
}
