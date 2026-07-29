import { db } from '@/db';
import { bookmarks } from '@/db/schema';
import { desc, ne } from 'drizzle-orm';
import { BookmarksTable } from './BookmarksTable';
import { getLocale } from '@/lib/getLocale';
import { getDict } from '@/lib/i18n';

export default async function BookmarksPage({ searchParams }: { searchParams: { status?: string } }) {
  const locale = await getLocale();
  const dict = getDict(locale).bookmarks;
  const allBookmarks = await db.select().from(bookmarks).where(ne(bookmarks.status, 'purged')).orderBy(desc(bookmarks.importedDate));
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{dict.title}</h1>
        <p className="text-gray-500 dark:text-zinc-400 mt-2">{dict.desc}</p>
      </div>
      
      <BookmarksTable initialData={allBookmarks} dict={dict} initialStatus={searchParams.status} />
    </div>
  );
}
