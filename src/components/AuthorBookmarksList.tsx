'use client';

import { useState, useTransition } from 'react';
import { ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { BookmarkActionButtons } from '@/components/BookmarkActionButtons';
import { updateBookmarkStatus } from '@/app/actions';

interface AuthorBookmark {
  id: string;
  url: string;
  text: string | null;
  postDate: Date | null;
  status: string;
}

export function AuthorBookmarksList({ items }: { items: AuthorBookmark[] }) {
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(() => new Set());
  const [, startUndoTransition] = useTransition();
  const visibleItems = items.filter((item) => !hiddenIds.has(item.id));

  const handleUpdated = (item: AuthorBookmark, status: 'keep' | 'delete_candidate') => {
    setHiddenIds((current) => new Set(current).add(item.id));

    toast.success(status === 'keep' ? 'Saklanacaklara eklendi.' : 'Silme kuyruğuna eklendi.', {
      action: {
        label: 'Geri al',
        onClick: () => {
          startUndoTransition(async () => {
            const result = await updateBookmarkStatus(item.id, item.status);
            if (!result.success) {
              toast.error(result.error || 'İşlem geri alınamadı.');
              return;
            }

            setHiddenIds((current) => {
              const next = new Set(current);
              next.delete(item.id);
              return next;
            });
            toast.success('İşlem geri alındı.');
          });
        },
      },
    });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
        Tüm Kayıtlar
        <span className="text-sm font-normal text-gray-400 dark:text-zinc-500 ml-2">
          ({visibleItems.length} kayıt)
        </span>
      </h2>

      {visibleItems.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 dark:border-zinc-700 p-8 text-center text-sm text-gray-500 dark:text-zinc-400">
          Bu yazar için işlem bekleyen kayıt kalmadı.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visibleItems.map((item) => (
            <div key={item.id} className="p-4 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-md hover:border-gray-300 dark:hover:border-zinc-700 transition-colors flex flex-col justify-between">
              <div>
                {item.postDate && (
                  <div className="text-xs text-gray-400 dark:text-zinc-500 mb-2">
                    {new Date(item.postDate).toLocaleDateString()}
                  </div>
                )}
                <p className="text-gray-700 dark:text-zinc-300 text-sm line-clamp-4 mb-4">
                  {item.text || 'Metin yok'}
                </p>
              </div>
              <div className="flex justify-between items-center mt-auto">
                <BookmarkActionButtons
                  id={item.id}
                  currentStatus={item.status}
                  onUpdated={(status) => handleUpdated(item, status)}
                />
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center text-xs text-blue-500 hover:text-blue-400 hover:underline"
                >
                  Görüntüle <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
