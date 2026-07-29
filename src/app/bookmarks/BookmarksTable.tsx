'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Search } from 'lucide-react';
import type { Dictionary } from '@/lib/i18n';

interface BookmarkRow {
  id: string;
  url: string;
  text: string | null;
  authorUsername: string | null;
  status: string;
  postDate: Date | null;
}

export function BookmarksTable({ initialData, dict, initialStatus }: { initialData: BookmarkRow[], dict: Dictionary['bookmarks'], initialStatus?: string }) {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'oldest' | 'newest'>('newest');
  const [statusFilter, setStatusFilter] = useState<string>(initialStatus || 'all');

  const statusMap: Record<string, { label: string, color: string }> = {
    unreviewed: { label: dict.statusUnreviewed, color: 'bg-zinc-700' },
    keep: { label: dict.statusKeep, color: 'bg-emerald-600' },
    delete_candidate: { label: dict.statusDelete, color: 'bg-red-600' },
    export_to_raindrop: { label: dict.statusExport, color: 'bg-blue-600' },
    export_and_keep: { label: 'Export & Sakla', color: 'bg-blue-600' },
    export_and_delete: { label: 'Export & Sil', color: 'bg-orange-600' },
    undecided: { label: dict.statusUndecided, color: 'bg-amber-600' },
    purged: { label: 'Purged', color: 'bg-gray-800' },
  };

  const filtered = initialData.filter(b => {
    const matchesSearch = (b.text && b.text.toLowerCase().includes(search.toLowerCase())) ||
      (b.authorUsername && b.authorUsername.toLowerCase().includes(search.toLowerCase()));
    
    let matchesStatus = true;
    if (statusFilter !== 'all') {
      if (statusFilter === 'export') {
        matchesStatus = ['export_to_raindrop', 'export_and_keep', 'export_and_delete'].includes(b.status);
      } else if (statusFilter === 'delete') {
        matchesStatus = ['delete_candidate', 'export_and_delete'].includes(b.status);
      } else {
        matchesStatus = b.status === statusFilter;
      }
    }
    
    return matchesSearch && matchesStatus;
  });

  const sorted = [...filtered].sort((a, b) => {
    const aTime = a.postDate ? new Date(a.postDate).getTime() : null;
    const bTime = b.postDate ? new Date(b.postDate).getTime() : null;
    if (aTime === null && bTime === null) return 0;
    if (aTime === null) return 1;
    if (bTime === null) return -1;
    return sort === 'oldest' ? aTime - bTime : bTime - aTime;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 w-full max-w-sm">
          <Search className="w-4 h-4 text-gray-400 dark:text-zinc-500" />
          <Input
            placeholder={dict.search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-9 rounded-md border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 text-sm text-gray-700 dark:text-zinc-200"
        >
          <option value="all">Tüm Durumlar</option>
          <option value="unreviewed">{dict.statusUnreviewed}</option>
          <option value="keep">{dict.statusKeep}</option>
          <option value="delete">{dict.statusDelete}</option>
          <option value="export">{dict.statusExport}</option>
          <option value="undecided">{dict.statusUndecided}</option>
        </select>
        <select
          aria-label={dict.sortLabel}
          value={sort}
          onChange={(event) => setSort(event.target.value as 'oldest' | 'newest')}
          className="h-9 rounded-md border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 text-sm text-gray-700 dark:text-zinc-200"
        >
          <option value="oldest">{dict.oldestFirst}</option>
          <option value="newest">{dict.newestFirst}</option>
        </select>
      </div>

      <div className="rounded-md border border-gray-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50">
        <Table>
          <TableHeader className="bg-white dark:bg-zinc-900">
            <TableRow className="border-gray-200 dark:border-zinc-800 hover:bg-white dark:bg-zinc-900/80">
              <TableHead>{dict.tableContent}</TableHead>
              <TableHead>{dict.tableAuthor}</TableHead>
              <TableHead>{dict.tableDate}</TableHead>
              <TableHead>{dict.tableStatus}</TableHead>
              <TableHead className="text-right">{dict.tableActions}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.slice(0, 100).map((bookmark) => (
              <TableRow key={bookmark.id} className="border-gray-200 dark:border-zinc-800 hover:bg-gray-200 dark:bg-zinc-800/50 transition-colors">
                <TableCell className="max-w-md truncate">
                  <div className="font-medium text-gray-900 dark:text-zinc-200 truncate">{bookmark.text || dict.notFound}</div>
                  <a href={bookmark.url} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline truncate block">
                    {bookmark.url}
                  </a>
                </TableCell>
                <TableCell className="text-gray-500 dark:text-zinc-400">@{bookmark.authorUsername}</TableCell>
                <TableCell className="whitespace-nowrap text-gray-500 dark:text-zinc-400">
                  {bookmark.postDate ? new Date(bookmark.postDate).toLocaleDateString() : dict.noDate}
                </TableCell>
                <TableCell>
                  <Badge className={`${statusMap[bookmark.status]?.color} hover:${statusMap[bookmark.status]?.color} border-0 text-white font-medium`}>
                    {statusMap[bookmark.status]?.label || bookmark.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <a href={bookmark.url} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center size-8 rounded-md hover:bg-gray-200 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:text-white">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {sorted.length > 100 && (
          <div className="p-4 text-center text-sm text-gray-400 dark:text-zinc-500 border-t border-gray-200 dark:border-zinc-800">
            {dict.showingFirst} ({sorted.length} total)
          </div>
        )}
      </div>
    </div>
  );
}
