import { db } from '@/db';
import { authors, bookmarks } from '@/db/schema';
import { count } from 'drizzle-orm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { getLocale } from '@/lib/getLocale';
import { getDict } from '@/lib/i18n';

export default async function AuthorsPage() {
  const locale = await getLocale();
  const dict = getDict(locale).authors;
  const allAuthors = await db.select().from(authors);
  
  // Get bookmark counts per author
  const counts = await db.select({
    author: bookmarks.authorUsername,
    count: count()
  }).from(bookmarks).groupBy(bookmarks.authorUsername);

  const countMap = new Map(counts.map(c => [c.author, c.count]));

  // Sort authors by count descending
  const sortedAuthors = allAuthors.sort((a, b) => {
    return (countMap.get(b.username) || 0) - (countMap.get(a.username) || 0);
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{dict.title}</h1>
        <p className="text-gray-500 dark:text-zinc-400 mt-2">{dict.desc}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sortedAuthors.map(author => (
          <Link key={author.username} href={`/authors/${author.username}`}>
            <Card className="bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700 transition-colors h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium text-gray-900 dark:text-white flex justify-between items-start">
                  <span className="truncate">{author.name === author.username ? `@${author.username}` : author.name}</span>
                  <Badge
                    variant="secondary"
                    className="ml-3 shrink-0 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300"
                    title={`${countMap.get(author.username) || 0} bookmarks`}
                  >
                    {countMap.get(author.username) || 0}
                  </Badge>
                </CardTitle>
                {author.name !== author.username && (
                  <div className="text-gray-400 dark:text-zinc-500 text-sm">@{author.username}</div>
                )}
              </CardHeader>
              <CardContent>
                {author.topics && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {JSON.parse(author.topics).map((topic: string) => (
                      <span key={topic} className="px-2 py-1 bg-gray-50 dark:bg-zinc-950 text-gray-500 dark:text-zinc-400 text-xs rounded border border-gray-200 dark:border-zinc-800">
                        {topic}
                      </span>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
