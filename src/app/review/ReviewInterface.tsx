'use client';

import { useState, useEffect, useTransition, useCallback } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Check, Trash2, Download, HelpCircle, ChevronRight, ChevronLeft } from 'lucide-react';
import { updateBookmarkStatus } from '../actions';
import { toast } from 'sonner';
import type { Dictionary } from '@/lib/i18n';
import { useRouter } from 'next/navigation';

interface ReviewItem {
  id: string;
  url: string;
  text: string | null;
  authorUsername: string | null;
  postDate: Date | null;
  duplicateFlag: boolean | null;
  outdatedFlag: boolean | null;
}

export function ReviewInterface({
  items,
  dict,
  sort,
}: {
  items: ReviewItem[];
  dict: Dictionary['review'];
  sort: 'oldest' | 'newest';
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const currentItem = items[currentIndex];

  const handleAction = useCallback((status: string) => {
    if (!currentItem) return;
    startTransition(async () => {
      const res = await updateBookmarkStatus(currentItem.id, status);
      if (res.success) {
        const message = {
          keep: dict.markedKeep,
          delete_candidate: dict.markedDelete,
          export_and_keep: 'Dışa Aktar & Sakla olarak işaretlendi',
          export_and_delete: 'Dışa Aktar & Sil olarak işaretlendi',
          undecided: dict.markedUndecided,
        }[status] || dict.statusUpdated;
        if (status !== 'keep') {
          toast.success(message);
        }
        if (currentIndex < items.length - 1) {
          setCurrentIndex(c => c + 1);
        } else {
          window.location.reload();
        }
      } else {
        toast.error(res.error || 'Hata oluştu');
      }
    });
  }, [currentIndex, currentItem, dict, items.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
      
      switch (e.key.toLowerCase()) {
        case 'k': handleAction('keep'); break;
        case 'd': handleAction('delete_candidate'); break;
        case 'e': handleAction('export_and_delete'); break;
        case 's': handleAction('export_and_keep'); break;
        case 'u': handleAction('undecided'); break;
        case 'o': 
          if (currentItem?.url) window.open(currentItem.url, '_blank');
          break;
        case 'arrowright':
          if (currentIndex < items.length - 1) setCurrentIndex(c => c + 1);
          break;
        case 'arrowleft':
          if (currentIndex > 0) setCurrentIndex(c => c - 1);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, currentItem, handleAction, items.length]);

  if (!currentItem) return null;

  return (
    <div className="flex flex-col items-center w-full space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-3 w-full mb-2">
        <div className="flex items-center gap-3">
          <span className="text-gray-400 dark:text-zinc-500 font-mono text-sm bg-gray-100 dark:bg-zinc-800/50 px-2 py-1 rounded-md">
            {currentIndex + 1} / {items.length}
          </span>
          <select
            aria-label={dict.sortLabel}
            value={sort}
            onChange={(event) => router.replace(`/review?sort=${event.target.value}`, { scroll: false })}
            className="h-9 rounded-md border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 text-sm text-gray-700 dark:text-zinc-200"
          >
            <option value="oldest">{dict.oldestFirst}</option>
            <option value="newest">{dict.newestFirst}</option>
          </select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setCurrentIndex(c => Math.max(0, c - 1))} disabled={currentIndex === 0}>
            <ChevronLeft className="w-4 h-4 mr-1" /> {dict.prev}
          </Button>
          <Button variant="outline" size="sm" onClick={() => setCurrentIndex(c => Math.min(items.length - 1, c + 1))} disabled={currentIndex === items.length - 1}>
            {dict.next} <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>

      <Card className="w-full max-w-2xl bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 shadow-xl">
        <CardHeader className="border-b border-gray-200 dark:border-zinc-800 pb-4">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                @{currentItem.authorUsername}
              </h2>
              <div className="text-gray-400 dark:text-zinc-500 text-sm mt-1">
                {dict.published}: {currentItem.postDate ? new Date(currentItem.postDate).toLocaleDateString() : dict.noDate}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <div className="text-lg text-gray-800 dark:text-zinc-200 leading-relaxed whitespace-pre-wrap">
            {currentItem.text || <i>{dict.notFound}</i>}
          </div>

          <a 
            href={currentItem.url} 
            target="_blank" 
            rel="noreferrer"
            className="flex items-center p-3 rounded-md bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:border-zinc-700 transition-colors text-blue-400 group"
          >
            <ExternalLink className="w-4 h-4 mr-3 opacity-50 group-hover:opacity-100" />
            <span className="truncate">{currentItem.url}</span>
          </a>

          {(currentItem.duplicateFlag || currentItem.outdatedFlag) && (
            <div className="p-3 bg-red-950/30 border border-red-900 rounded-md">
              <p className="text-red-400 text-sm font-medium flex gap-2">
                <span className="shrink-0">⚠️</span>
                <span>
                  {currentItem.duplicateFlag && 'Bu içerik başka bir yer işaretiyle kopya görünüyor. '}
                  {currentItem.outdatedFlag && 'İçerik güncelliğini yitirmiş olabilir (ör. eski bir çekiliş veya indirim).'}
                </span>
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="border-t border-gray-200 dark:border-zinc-800 pt-4 flex flex-wrap gap-2 justify-between">
          <Button 
            className="flex-1 bg-status-keep hover:bg-status-keep-hover text-white"
            onClick={() => handleAction('keep')}
            disabled={isPending}
          >
            <Check className="w-4 h-4 mr-2" />
            {dict.keep} [K]
          </Button>
          <Button 
            className="flex-1 bg-status-delete hover:bg-status-delete-hover text-white"
            onClick={() => handleAction('delete_candidate')}
            disabled={isPending}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {dict.delete} [D]
          </Button>
          <Button 
            className="flex-1 bg-status-export-delete hover:bg-status-export-delete-hover text-white"
            onClick={() => handleAction('export_and_delete')}
            disabled={isPending}
          >
            <Download className="w-4 h-4 mr-2" />
            Dışa Aktar & Sil [E]
          </Button>
          <Button 
            className="flex-1 bg-status-export hover:bg-status-export-hover text-white"
            onClick={() => handleAction('export_and_keep')}
            disabled={isPending}
          >
            <Download className="w-4 h-4 mr-2" />
            Dışa Aktar & Sakla [S]
          </Button>
          <Button 
            variant="outline" 
            className="flex-1 bg-gray-200 dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 hover:bg-zinc-700 text-gray-900 dark:text-white"
            onClick={() => handleAction('undecided')}
            disabled={isPending}
          >
            <HelpCircle className="w-4 h-4 mr-2" />
            {dict.undecided} [U]
          </Button>
        </CardFooter>
      </Card>
      
      <div className="text-gray-400 dark:text-zinc-500 text-sm flex gap-4 mt-8">
        <span><kbd className="font-mono bg-gray-200 dark:bg-zinc-800 px-1 py-0.5 rounded border border-gray-300 dark:border-zinc-700">K</kbd> {dict.keep}</span>
        <span><kbd className="font-mono bg-gray-200 dark:bg-zinc-800 px-1 py-0.5 rounded border border-gray-300 dark:border-zinc-700">D</kbd> {dict.delete}</span>
        <span><kbd className="font-mono bg-gray-200 dark:bg-zinc-800 px-1 py-0.5 rounded border border-gray-300 dark:border-zinc-700">E</kbd> Dışa Aktar & Sil</span>
        <span><kbd className="font-mono bg-gray-200 dark:bg-zinc-800 px-1 py-0.5 rounded border border-gray-300 dark:border-zinc-700">S</kbd> Dışa Aktar & Sakla</span>
        <span><kbd className="font-mono bg-gray-200 dark:bg-zinc-800 px-1 py-0.5 rounded border border-gray-300 dark:border-zinc-700">U</kbd> {dict.undecided}</span>
        <span><kbd className="font-mono bg-gray-200 dark:bg-zinc-800 px-1 py-0.5 rounded border border-gray-300 dark:border-zinc-700">O</kbd> {dict.open}</span>
      </div>
    </div>
  );
}
