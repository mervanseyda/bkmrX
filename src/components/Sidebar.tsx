'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Bookmark, 
  CheckSquare, 
  Users, 
  Download,
  Upload
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from './ThemeToggle';
import { LanguageToggle } from './LanguageToggle';
import { getDict, Locale } from '@/lib/i18n';

export function Sidebar({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const dict = getDict(locale).sidebar;

  const navItems = [
    { name: dict.overview, href: '/', icon: LayoutDashboard },
    { name: dict.allBookmarks, href: '/bookmarks', icon: Bookmark },
    { name: dict.review, href: '/review', icon: CheckSquare },
    { name: dict.authors, href: '/authors', icon: Users },
    { name: dict.import, href: '/import', icon: Upload },
    { name: dict.export, href: '/export', icon: Download },
  ];

  return (
    <div className="w-64 border-r bg-white/70 dark:bg-zinc-950/70 backdrop-blur-xl border-gray-200/50 dark:border-zinc-800/50 text-gray-700 dark:text-zinc-300 min-h-screen flex flex-col relative z-10">
      <div className="p-4 md:p-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Bookmark className="w-6 h-6 text-gray-900 dark:text-white" />
          <span>bkmrX</span>
        </h1>
      </div>
      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-150",
                isActive 
                  ? "bg-gray-100 dark:bg-zinc-900 text-gray-950 dark:text-white font-medium"
                  : "text-gray-600 dark:text-zinc-400 hover:bg-gray-100/60 dark:hover:bg-zinc-900/60 hover:text-gray-950 dark:hover:text-white"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
        <div className="p-4 border-t border-gray-200 dark:border-zinc-800 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-zinc-500">bkmrX</span>
            <div className="flex gap-2">
              <LanguageToggle currentLocale={locale} />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>
  );
}
