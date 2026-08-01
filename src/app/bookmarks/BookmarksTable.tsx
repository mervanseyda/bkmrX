'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { bulkUpdateBookmarkStatus } from '../actions';
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
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    if (initialStatus) {
      setStatusFilter(initialStatus);
    }
  }, [initialStatus]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'unreviewed':
        return <Badge className="bg-status-unreviewed hover:bg-status-unreviewed-hover text-white border-0 font-medium">{dict.statusUnreviewed}</Badge>;
      case 'keep':
        return <Badge className="bg-status-keep hover:bg-status-keep-hover text-white border-0 font-medium">{dict.statusKeep}</Badge>;
      case 'delete_candidate':
        return <Badge className="bg-status-delete hover:bg-status-delete-hover text-white border-0 font-medium">{dict.statusDelete}</Badge>;
      case 'export_to_raindrop':
        return <Badge className="bg-status-export hover:bg-status-export-hover text-white border-0 font-medium">{dict.statusExport}</Badge>;
      case 'export_and_keep':
        return <Badge className="bg-status-export hover:bg-status-export-hover text-white border-0 font-medium">{dict.statusExport} & Sakla</Badge>;
      case 'export_and_delete':
        return <Badge className="bg-status-export-delete hover:bg-status-export-delete-hover text-white border-0 font-medium">{dict.statusExport} & Sil</Badge>;
      case 'undecided':
        return <Badge className="bg-status-undecided hover:bg-status-undecided-hover text-white border-0 font-medium">{dict.statusUndecided}</Badge>;
      case 'purged':
        return <Badge className="bg-[#1f2937] hover:bg-[#111827] text-white border-0 font-medium">Purged</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
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

  const visibleBookmarks = sorted.slice(0, 100);

  const handleBulkAction = (status: string) => {
    startTransition(async () => {
      try {
        const res = await bulkUpdateBookmarkStatus(Array.from(selectedIds), status);
        if (res.success) {
          toast.success(`${selectedIds.size} kayıt başarıyla güncellendi.`);
          setSelectedIds(new Set());
          router.refresh();
        } else {
          toast.error(res.error || 'Bir hata oluştu');
        }
      } catch (err) {
        console.error(err);
        toast.error('Sunucuyla bağlantı kurulamadı. Sayfayı yenileyin.');
      }
    });
  };

  return (
    <div className="space-y-4 pb-24 relative">
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

      {selectedIds.size > 0 && (
        <div className="bg-zinc-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 rounded-md p-3 flex flex-wrap items-center justify-between gap-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {dict.bulkSelected ? dict.bulkSelected.replace('{count}', selectedIds.size.toString()) : `${selectedIds.size} selected`}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" onClick={() => handleBulkAction('keep')} disabled={isPending} className="bg-status-keep hover:bg-status-keep-hover text-white shadow-sm border-0">{dict.bulkKeep || 'Keep'}</Button>
            <Button size="sm" onClick={() => handleBulkAction('delete_candidate')} disabled={isPending} className="bg-status-delete hover:bg-status-delete-hover text-white shadow-sm border-0">{dict.bulkDelete || 'Delete'}</Button>
            <Button size="sm" onClick={() => handleBulkAction('export_and_keep')} disabled={isPending} className="bg-status-export hover:bg-status-export-hover text-white shadow-sm border-0">{dict.bulkExportKeep || 'Export & Keep'}</Button>
            <Button size="sm" onClick={() => handleBulkAction('export_and_delete')} disabled={isPending} className="bg-status-export-delete hover:bg-status-export-delete-hover text-white shadow-sm border-0">{dict.bulkExportDelete || 'Export & Delete'}</Button>
          </div>
        </div>
      )}

      <div className="rounded-md border border-gray-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50">
        <Table>
          <TableHeader className="bg-white dark:bg-zinc-900">
            <TableRow className="border-gray-200 dark:border-zinc-800 hover:bg-white dark:bg-zinc-900/80">
              <TableHead className="w-12 text-center">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 rounded border-gray-300"
                  checked={selectedIds.size > 0 && selectedIds.size === visibleBookmarks.length}
                  onChange={(e) => {
                    if (e.target.checked) setSelectedIds(new Set(visibleBookmarks.map(b => b.id)));
                    else setSelectedIds(new Set());
                  }}
                />
              </TableHead>
              <TableHead>{dict.tableContent}</TableHead>
              <TableHead>{dict.tableAuthor}</TableHead>
              <TableHead>{dict.tableDate}</TableHead>
              <TableHead>{dict.tableStatus}</TableHead>
              <TableHead className="text-right">{dict.tableActions}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleBookmarks.map((bookmark) => (
              <TableRow key={bookmark.id} className="border-gray-200 dark:border-zinc-800 hover:bg-gray-200 dark:bg-zinc-800/50 transition-colors">
                <TableCell className="text-center">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded border-gray-300"
                    checked={selectedIds.has(bookmark.id)}
                    onChange={(e) => {
                      const newSet = new Set(selectedIds);
                      if (e.target.checked) newSet.add(bookmark.id);
                      else newSet.delete(bookmark.id);
                      setSelectedIds(newSet);
                    }}
                  />
                </TableCell>
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
                  {getStatusBadge(bookmark.status)}
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
