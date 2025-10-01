'use client';
import { useState, useEffect } from 'react';

export default function HeaderControls() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (document.documentElement.classList.contains('dark')) {
      setIsDark(true);
    }
  }, []);

  const toggleTheme = () => {
    const root = document.documentElement;
    root.classList.toggle('dark');
    const darkNow = root.classList.contains('dark');
    setIsDark(darkNow);
    localStorage.setItem('theme', darkNow ? 'dark' : 'light');
  };

  return (
    <div className="fixed top-4 right-4 z-20 flex items-center gap-3">
      <button
        onClick={toggleTheme}
        aria-label="Temayı değiştir"
        className="rounded-xl border border-slate-200/60 dark:border-slate-700
                   bg-white/70 dark:bg-white/10 px-3 py-2 text-sm shadow-sm
                   backdrop-blur-md transition-all hover:scale-[1.05]"
      >
        {isDark ? '☀️' : '🌙'}
      </button>

      <select
        defaultValue="tr"
        aria-label="Dil seç"
        onChange={(e) => console.log('Dil:', e.target.value)}
        className="rounded-xl border border-slate-200/60 dark:border-slate-700
                   bg-white/70 dark:bg-white/10 px-3 py-2 text-sm shadow-sm
                   backdrop-blur-md"
      >
        <option value="tr">TR</option>
        <option value="en">EN</option>
      </select>
    </div>
  );
}
