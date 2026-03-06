'use client';

import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('ceva-theme');
    const dark = stored !== 'light';
    setIsDark(dark);
    document.documentElement.classList.toggle('light', !dark);
  }, []);

  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    localStorage.setItem('ceva-theme', next ? 'dark' : 'light');
    document.documentElement.classList.toggle('light', !next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className="glass px-3 py-2 text-xs font-semibold"
      aria-label="Schimbă tema"
    >
      {isDark ? 'Temă deschisă' : 'Temă închisă'}
    </button>
  );
}
