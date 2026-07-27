import { db } from '@/db';
import { bookmarks } from '@/db/schema';
import { asc, desc, eq, sql } from 'drizzle-orm';
import { ReviewInterface } from './ReviewInterface';
import { getLocale } from '@/lib/getLocale';
import { getDict } from '@/lib/i18n';

export default async function ReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>;
}) {
  const locale = await getLocale();
  const dict = getDict(locale).review;
  const requestedSort = (await searchParams).sort;
  const sort = requestedSort === 'newest' ? 'newest' : 'oldest';
  const dateOrder = sort === 'newest' ? desc(bookmarks.postDate) : asc(bookmarks.postDate);

  const items = await db
    .select()
    .from(bookmarks)
    .where(eq(bookmarks.status, 'unreviewed'))
    .orderBy(sql`${bookmarks.postDate} IS NULL`, dateOrder)
    .limit(50);
  
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center space-y-4">
        <div className="w-16 h-16 bg-white dark:bg-zinc-900 rounded-full flex items-center justify-center mb-4">
          <span className="text-2xl">🎉</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{dict.empty}</h2>
        <p className="text-gray-500 dark:text-zinc-400">{dict.emptyDesc}</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col justify-center items-center">
      <div className="w-full max-w-4xl px-4 py-6">
        <ReviewInterface key={sort} items={items} dict={dict} sort={sort} />
      </div>
    </div>
  );
}
