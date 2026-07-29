import { db } from '@/db';
import { bookmarks } from '@/db/schema';
import { count } from 'drizzle-orm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Bookmark, CheckCircle, Trash2, Download,
  CheckSquare, Zap
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

import { getLocale } from '@/lib/getLocale';
import { getDict } from '@/lib/i18n';

export default async function Dashboard() {
  const locale = await getLocale();
  const dict = getDict(locale).dashboard;

  const totalRes = await db.select({ count: count() }).from(bookmarks);
  const total = totalRes[0].count;

  const stats = await db.select({
    status: bookmarks.status,
    count: count()
  }).from(bookmarks).groupBy(bookmarks.status);

  const statusCounts = stats.reduce((acc, row) => {
    acc[row.status] = row.count;
    return acc;
  }, {} as Record<string, number>);


  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">{dict.title}</h1>
          <p className="text-gray-500 dark:text-zinc-400 mt-2">{dict.desc}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/bookmarks" className="block transition-transform hover:scale-[102%]">
          <Card className="bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-zinc-400">{dict.total}</CardTitle>
              <Bookmark className="w-4 h-4 text-gray-400 dark:text-zinc-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{total}</div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/bookmarks?status=unreviewed" className="block transition-transform hover:scale-[102%]">
          <Card className="bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-zinc-400">{dict.unreviewed}</CardTitle>
              <CheckCircle className="w-4 h-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{statusCounts['unreviewed'] || 0}</div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/bookmarks?status=keep" className="block transition-transform hover:scale-[102%]">
          <Card className="bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-zinc-400">{dict.keep}</CardTitle>
              <CheckCircle className="w-4 h-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{statusCounts['keep'] || 0}</div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/bookmarks?status=export" className="block transition-transform hover:scale-[102%]">
          <Card className="bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-zinc-400">{dict.export}</CardTitle>
              <Download className="w-4 h-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {(statusCounts['export_to_raindrop'] || 0) + (statusCounts['export_and_keep'] || 0) + (statusCounts['export_and_delete'] || 0)}
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/bookmarks?status=delete" className="block transition-transform hover:scale-[102%]">
          <Card className="bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-zinc-400">{dict.delete}</CardTitle>
              <Trash2 className="w-4 h-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {(statusCounts['delete_candidate'] || 0) + (statusCounts['export_and_delete'] || 0)}
              </div>
            </CardContent>
          </Card>
        </Link>


      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 md:col-span-2">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              {dict.quickActions}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/review" className="block">
              <Button className="w-full justify-start bg-blue-600 hover:bg-blue-700 text-white">
                <CheckSquare className="mr-2 h-4 w-4" /> {dict.startReview}
              </Button>
            </Link>

            <Link href="/export" className="block">
              <Button className="w-full justify-start" variant="outline">
                <Download className="mr-2 h-4 w-4" /> {dict.exportBtn}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
