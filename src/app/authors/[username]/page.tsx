import { db } from '@/db';
import { authors, bookmarks } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AuthorBookmarksList } from '@/components/AuthorBookmarksList';

export default async function AuthorDetailsPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  
  const authorRecord = await db.select().from(authors).where(eq(authors.username, username));
  if (!authorRecord.length) {
    notFound();
  }
  const author = authorRecord[0];

  const authorBookmarks = await db
    .select()
    .from(bookmarks)
    .where(eq(bookmarks.authorUsername, username))
    .orderBy(desc(bookmarks.postDate));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/authors">
          <Button variant="outline" size="sm">
            <ChevronLeft className="w-4 h-4 mr-2" />
            Yazarlara Dön
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {author.name === author.username ? `@${author.username}` : author.name}
          </h1>
          {author.name !== author.username && (
            <p className="text-gray-500 dark:text-zinc-400 mt-1">@{author.username}</p>
          )}
        </div>
      </div>

      <AuthorBookmarksList items={authorBookmarks} />
    </div>
  );
}
