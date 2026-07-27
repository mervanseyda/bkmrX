'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Code, Check, Trash2 } from 'lucide-react';
import { generateRaindropCsv, generateTwitterDeletionScript, markDeletionsAsCompleted } from './actions';
import { toast } from 'sonner';
import type { Dictionary } from '@/lib/i18n';

export function ExportActions({ count, deleteCount, dict }: { count: number, deleteCount: number, dict: Dictionary['export'] }) {
  const [isPending, startTransition] = useTransition();
  const [scriptCode, setScriptCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleExport = () => {
    startTransition(async () => {
      const res = await generateRaindropCsv();
      if (res.success && res.csv) {
        // Blob indirme tetikle
        const blob = new Blob([res.csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'raindrop-bookmarks.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success('CSV dosyası başarıyla oluşturuldu ve indirildi.');
      } else {
        toast.error(res.error || 'Dışa aktarma başarısız');
      }
    });
  };

  const handleGenerateScript = () => {
    startTransition(async () => {
      const res = await generateTwitterDeletionScript();
      if (res.success && res.script) {
        setScriptCode(res.script);
        toast.success('Script başarıyla oluşturuldu.');
      } else {
        toast.error(res.error || 'Script oluşturulamadı.');
      }
    });
  };

  const handleCopyScript = () => {
    if (scriptCode) {
      navigator.clipboard.writeText(scriptCode);
      setCopied(true);
      toast.success('Script panoya kopyalandı!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClearDeletions = () => {
    startTransition(async () => {
      const res = await markDeletionsAsCompleted();
      if (res.success) {
        toast.success('Kayıtlar başarıyla temizlendi.');
        setScriptCode(null); // Kodu da gizle
        // Sayfayı yenileyerek sayaçların güncellenmesini sağla
        setTimeout(() => window.location.reload(), 500);
      } else {
        toast.error(res.error || 'Temizleme başarısız oldu.');
      }
    });
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 max-w-4xl">
      <Card className="bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">{dict.csvCard}</CardTitle>
          <CardDescription className="text-gray-500 dark:text-zinc-400">
            {dict.csvDesc}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/10 p-3 rounded-lg border border-blue-100 dark:border-blue-900/20">
            <div className="text-gray-700 dark:text-zinc-300 flex items-center gap-2">
              <Download className="w-4 h-4 text-blue-500" />
              {dict.pending} <strong className="text-gray-900 dark:text-white text-lg ml-2">{count}</strong>
            </div>
            <Button 
              onClick={handleExport} 
              disabled={count === 0 || isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
            >
              <Download className="w-4 h-4 mr-2" />
              {dict.downloadBtn}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
            {dict.deleteCard}
          </CardTitle>
          <CardDescription className="text-gray-500 dark:text-zinc-400">
            {dict.deleteDesc}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between bg-red-50 dark:bg-red-900/10 p-3 rounded-lg border border-red-100 dark:border-red-900/20">
            <div className="text-gray-700 dark:text-zinc-300 flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-red-500" />
              {dict.toDelete} <strong className="text-gray-900 dark:text-white text-lg ml-2">{deleteCount}</strong>
            </div>
            <Button 
              onClick={handleGenerateScript} 
              disabled={deleteCount === 0 || isPending || !!scriptCode}
              className="bg-red-600 hover:bg-red-700 text-white shadow-sm"
            >
              <Code className="w-4 h-4 mr-2" />
              {dict.generateBtn}
            </Button>
          </div>

          {scriptCode && (
            <div className="space-y-4 border border-blue-100 dark:border-blue-900/30 rounded-xl p-5 bg-blue-50/50 dark:bg-blue-900/10">
              
              {/* Adım 1 */}
              <div>
                <h4 className="font-semibold text-blue-900 dark:text-blue-300 flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 text-xs">1</span>
                  {dict.step1}
                </h4>
                <div className="mt-2 pl-8">
                  <p className="text-sm text-gray-600 dark:text-zinc-400 mb-3">{dict.step1Desc}</p>
                  <div className="relative">
                    <pre className="text-xs text-zinc-300 overflow-x-auto p-3 bg-zinc-950 rounded-lg max-h-32 border border-zinc-800">
                      {scriptCode}
                    </pre>
                    <Button 
                      size="sm" 
                      onClick={handleCopyScript} 
                      className="absolute top-2 right-2 bg-white/10 hover:bg-white/20 text-white border-0 backdrop-blur-sm"
                    >
                      {copied ? <Check className="w-4 h-4 mr-1" /> : <Code className="w-4 h-4 mr-1" />}
                      {copied ? 'OK' : dict.copyBtn}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Adım 2 */}
              <div className="pt-4 border-t border-blue-100 dark:border-blue-900/30">
                <h4 className="font-semibold text-blue-900 dark:text-blue-300 flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 text-xs">2</span>
                  {dict.step2}
                </h4>
                <div className="mt-2 pl-8">
                  <p className="text-sm text-gray-600 dark:text-zinc-400">
                    {dict.step2Desc}
                  </p>
                </div>
              </div>

              {/* Adım 3 */}
              <div className="pt-4 border-t border-blue-100 dark:border-blue-900/30">
                <h4 className="font-semibold text-blue-900 dark:text-blue-300 flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 text-xs">3</span>
                  {dict.step3}
                </h4>
                <div className="mt-2 pl-8 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
                  <p className="text-sm text-gray-600 dark:text-zinc-400">
                    {dict.step3Desc}
                  </p>
                  <Button 
                    onClick={handleClearDeletions} 
                    disabled={isPending}
                    variant="outline"
                    className="shrink-0 text-red-600 border-red-200 hover:bg-red-50 dark:border-red-900/30 dark:hover:bg-red-900/20 dark:text-red-400"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {dict.clearBtn}
                  </Button>
                </div>
              </div>

            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
