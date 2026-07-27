import { db } from '@/db';
import { bookmarks } from '@/db/schema';
import { eq, count, inArray } from 'drizzle-orm';
import { ExportActions } from './ExportActions';
import { getLocale } from '@/lib/getLocale';
import { getDict } from '@/lib/i18n';

export default async function ExportPage() {
  const locale = await getLocale();
  const dict = getDict(locale).export;
  const exportCountRes = await db.select({ count: count() }).from(bookmarks).where(eq(bookmarks.status, 'export_to_raindrop'));
  const exportCount = exportCountRes[0].count;

  const deleteCountRes = await db.select({ count: count() }).from(bookmarks).where(inArray(bookmarks.status, ['deleted', 'delete_candidate']));
  const deleteCount = deleteCountRes[0].count;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{dict.title}</h1>
        <p className="text-gray-500 dark:text-zinc-400 mt-2">{dict.desc}</p>
      </div>

      <ExportActions count={exportCount} deleteCount={deleteCount} dict={dict} />
    </div>
  );
}
