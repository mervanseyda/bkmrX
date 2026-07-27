'use client';

import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Check, Trash2, Loader2 } from 'lucide-react';
import { updateBookmarkStatus } from '@/app/actions';
import { toast } from 'sonner';

export function BookmarkActionButtons({
  id,
  currentStatus,
  onUpdated,
}: {
  id: string;
  currentStatus: string;
  onUpdated?: (status: 'keep' | 'delete_candidate') => void;
}) {
  const [isPending, startTransition] = useTransition();

  const handleAction = (status: string) => {
    startTransition(async () => {
      const res = await updateBookmarkStatus(id, status);
      if (res.success) {
        if (onUpdated) {
          onUpdated(status as 'keep' | 'delete_candidate');
        } else {
          toast.success(status === 'keep' ? 'Saklanacaklara eklendi.' : 'Silme kuyruğuna eklendi.');
        }
      } else {
        toast.error(res.error || 'İşlem tamamlanamadı.');
      }
    });
  };

  if (currentStatus === 'purged') {
    return <span className="text-xs text-gray-400">Silindi</span>;
  }

  return (
    <div className="flex items-center gap-1">
      <Button 
        size="sm" 
        variant="ghost" 
        className={`h-7 px-2 text-xs ${currentStatus === 'keep' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'text-gray-500 hover:text-emerald-600'}`}
        onClick={() => handleAction('keep')}
        disabled={isPending}
        title="Sakla"
      >
        {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3 mr-1" />}
        Sakla
      </Button>
      <Button 
        size="sm" 
        variant="ghost" 
        className={`h-7 px-2 text-xs ${currentStatus === 'delete_candidate' || currentStatus === 'deleted' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'text-gray-500 hover:text-red-600'}`}
        onClick={() => handleAction('delete_candidate')}
        disabled={isPending}
        title="Silineceklere Ekle"
      >
        {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3 mr-1" />}
        Sil
      </Button>
    </div>
  );
}
