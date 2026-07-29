'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileArchive, Loader2, Info, Copy, Check, Trash2 } from 'lucide-react';
import { parseJsonBookmarks } from '@/lib/import/json';
import { parseCsvBookmarks } from '@/lib/import/csv';
import { parseZipBookmarks } from '@/lib/import/zip';
import { processImport, resetLocalData } from './actions';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import type { Dictionary } from '@/lib/i18n';

const extractionScript = String.raw`// bkmrX bookmark exporter — run on https://x.com/i/bookmarks
(async () => {
  if (!location.hostname.endsWith('x.com') || !location.pathname.includes('bookmarks')) {
    alert('Open https://x.com/i/bookmarks first, then run this script.');
    return;
  }

  const bookmarks = new Map();
  let unchangedRounds = 0;
  let previousSize = 0;

  const collectVisibleBookmarks = () => {
    for (const article of document.querySelectorAll('article')) {
      const statusLink = [...article.querySelectorAll('a[href*="/status/"]')]
        .find((link) => link.querySelector('time'));
      if (!statusLink) continue;

      const match = statusLink.getAttribute('href')?.match(/^\/([^/]+)\/status\/(\d+)/);
      if (!match) continue;

      const [, authorUsername, tweetId] = match;
      const time = statusLink.querySelector('time');
      const text = article.querySelector('[data-testid="tweetText"]')?.textContent?.trim() || '';
      const authorName = article.querySelector('[data-testid="User-Name"] span')?.textContent?.trim() || authorUsername;

      bookmarks.set(tweetId, {
        tweetId,
        url: 'https://x.com/' + authorUsername + '/status/' + tweetId,
        text,
        authorName,
        authorUsername,
        postDate: time?.getAttribute('datetime') || undefined,
      });
    }
  };

  console.log('[bkmrX] Export started. Keep this tab open…');
  while (unchangedRounds < 30) {
    collectVisibleBookmarks();
    
    if (bookmarks.size > previousSize) {
      console.log('[bkmrX] Collected:', bookmarks.size);
      unchangedRounds = 0;
      previousSize = bookmarks.size;
    } else {
      unchangedRounds++;
      
      if (unchangedRounds % 3 === 0) {
        const retryBtn = Array.from(document.querySelectorAll('button')).find(b => 
          b.textContent?.match(/retry|yeniden/i)
        );
        if (retryBtn) {
          console.log('[bkmrX] Clicking Retry button...');
          retryBtn.click();
        }
      }
    }

    // Instead of scrolling by pixels, find the last loaded tweet and scroll it into view.
    // This perfectly triggers Twitter's 'load more' observer in Chrome/Firefox without spamming.
    const articles = document.querySelectorAll('article');
    if (articles.length > 0) {
      articles[articles.length - 1].scrollIntoView({ behavior: 'smooth', block: 'end' });
    } else {
      window.scrollBy(0, 800);
    }
    
    await new Promise((resolve) => setTimeout(resolve, 800));
  }

  collectVisibleBookmarks();
  const payload = JSON.stringify({
    exportedAt: new Date().toISOString(),
    bookmarks: [...bookmarks.values()],
  }, null, 2);
  const url = URL.createObjectURL(new Blob([payload], { type: 'application/json' }));
  const link = Object.assign(document.createElement('a'), {
    href: url,
    download: 'bkmrx-bookmarks.json',
  });
  link.click();
  
  // SAFEGUARD: If browser blocks automated download, give them a manual button
  const fallbackBtn = document.createElement('button');
  fallbackBtn.innerHTML = '📥 İndirme Başlamadıysa Buraya Tıklayıp Manuel İndir (' + bookmarks.size + ' Tweet)';
  fallbackBtn.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);z-index:9999999;padding:20px 40px;background:#1d9bf0;color:white;font-size:20px;font-weight:bold;border-radius:10px;cursor:pointer;box-shadow:0 10px 25px rgba(0,0,0,0.5);border:2px solid white;';
  fallbackBtn.onclick = () => {
    const manualUrl = URL.createObjectURL(new Blob([payload], { type: 'application/json' }));
    const manualLink = document.createElement('a');
    manualLink.href = manualUrl;
    manualLink.download = 'bkmrx-bookmarks-manual.json';
    manualLink.click();
  };
  document.body.appendChild(fallbackBtn);

  console.log('[bkmrX] Finished:', bookmarks.size, 'bookmarks');
  alert('bkmrX exported ' + bookmarks.size + ' bookmarks. (Eğer dosya inmediyse ekranın en üstündeki mavi butona tıklayın)');
})();`;

export function ImportClient({ dict }: { dict: Dictionary['import'] }) {
  const [isUploading, setIsUploading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const fallbackTextareaRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    toast.info(dict.uploading);

    try {
      const extension = file.name.split('.').pop()?.toLowerCase();
      const parsedItems = extension === 'zip'
        ? await parseZipBookmarks(await file.arrayBuffer())
        : extension === 'csv'
          ? parseCsvBookmarks(await file.text())
          : parseJsonBookmarks(await file.text());

      if (parsedItems.length === 0) {
        toast.error('No valid bookmarks found.');
        setIsUploading(false);
        return;
      }

      toast.info(`Found ${parsedItems.length} records. Processing...`);

      const result = await processImport(file.name, parsedItems);
      
      if (result.success) {
        toast.success(`Successfully imported ${result.successCount} records!`);
        router.push('/bookmarks');
      } else {
        toast.error(result.error || 'Import failed.');
      }
    } catch (error: unknown) {
      console.error(error);
      toast.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const copyScript = async () => {
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(extractionScript);
        setCopied(true);
        toast.success(dict.copied);
        setTimeout(() => setCopied(false), 2000);
        return;
      } catch (error) {
        console.error('Clipboard API failed, trying fallback', error);
      }
    }

    if (fallbackTextareaRef.current) {
      fallbackTextareaRef.current.select();
      try {
        const copiedSuccessfully = document.execCommand('copy');
        if (copiedSuccessfully) {
          setCopied(true);
          toast.success(dict.copied);
          setTimeout(() => setCopied(false), 2000);
          return;
        }
      } catch (err) {
        console.error('execCommand failed', err);
      }
    }
    
    toast.error(dict.copyError);
  };

  const handleReset = async () => {
    if (!window.confirm(dict.resetConfirm)) return;

    setIsResetting(true);
    const result = await resetLocalData();
    setIsResetting(false);

    if (!result.success) {
      toast.error(result.error || dict.resetError);
      return;
    }

    toast.success(dict.resetSuccess);
    router.push('/');
    router.refresh();
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 max-w-5xl">
      {/* Instructions Card */}
      <Card className="bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 h-full flex flex-col">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
            <Info className="w-5 h-5 text-gray-500" />
            {dict.howToGetTitle}
          </CardTitle>
          <CardDescription className="text-gray-500 dark:text-zinc-400">
            {dict.howToGetDesc}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ol className="list-decimal ml-5 space-y-2 text-sm text-gray-700 dark:text-zinc-300">
            <li>{dict.step1}</li>
            <li>{dict.step2}</li>
            <li>{dict.step3}</li>
          </ol>
          <Button onClick={copyScript} variant="outline" className="w-full mt-4">
            {copied ? <Check className="w-4 h-4 mr-2 text-emerald-500" /> : <Copy className="w-4 h-4 mr-2" />}
            {copied ? dict.copied : dict.copyScript}
          </Button>
        </CardContent>
      </Card>

      {/* Upload Card */}
      <Card className="bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 h-full flex flex-col">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
            <FileArchive className="w-5 h-5 text-gray-500" />
            {dict.fileMethod}
          </CardTitle>
          <CardDescription className="text-gray-500 dark:text-zinc-400">
            {dict.jsonDesc}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          <label className={`flex-1 flex flex-col justify-center items-center block border-2 border-dashed border-gray-300 dark:border-zinc-700 rounded-md p-12 text-center bg-gray-50 dark:bg-zinc-950/50 cursor-pointer hover:border-gray-500 dark:hover:border-zinc-500 transition-colors ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
            {isUploading ? <Loader2 className="w-8 h-8 text-gray-500 mx-auto mb-4 animate-spin" /> : <Upload className="w-8 h-8 text-gray-400 dark:text-zinc-500 mx-auto mb-4" />}
            <p className="text-gray-600 dark:text-zinc-400 font-medium">{isUploading ? dict.uploading : dict.clickToUpload}</p>
            <input type="file" accept=".zip,.json,.js,.csv,application/zip,application/json,text/csv" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
          </label>
        </CardContent>
      </Card>

      <Card className="md:col-span-2 bg-white dark:bg-zinc-900 border-red-200 dark:border-red-950">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-red-500" />
            {dict.resetTitle}
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-zinc-400 max-w-3xl">
            {dict.resetDesc}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={isResetting || isUploading}
            className="border-red-300 text-red-700 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/40"
          >
            {isResetting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
            {isResetting ? dict.resetting : dict.resetButton}
          </Button>
        </CardContent>
      </Card>

      {/* Hidden textarea for copy fallback when not in secure context */}
      <textarea 
        ref={fallbackTextareaRef}
        value={extractionScript}
        readOnly
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
      />
    </div>
  );
}
