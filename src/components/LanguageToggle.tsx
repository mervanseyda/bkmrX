'use client';

import { useRouter } from 'next/navigation';
import { Button } from './ui/button';

export function LanguageToggle({ currentLocale }: { currentLocale: 'en' | 'tr' }) {
  const router = useRouter();

  const toggleLanguage = () => {
    const newLocale = currentLocale === 'en' ? 'tr' : 'en';
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;
    router.refresh();
  };

  return (
    <Button variant="outline" size="sm" onClick={toggleLanguage} className="text-xs px-2 h-7 bg-transparent border-gray-300 dark:border-zinc-700 hover:bg-gray-200 dark:hover:bg-zinc-800">
      {currentLocale === 'en' ? '🇹🇷 TR' : '🇬🇧 EN'}
    </Button>
  );
}
